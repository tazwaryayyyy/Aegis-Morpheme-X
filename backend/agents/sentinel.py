"""
AMX Protocol – Meta-Sentinel (Statistical Anomaly Detection)
Monitors all agent outputs using rolling-window z-score analysis.
"""

import math
import logging
import threading

logger = logging.getLogger("amx.sentinel")


class StatisticalSentinel:
    """
    Maintains a rolling window of numeric agent outputs.
    Flags an anomaly when |value - mean| > 2 * std_dev.
    On anomaly: blocks action, returns slashing info.
    """

    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.history: dict[str, list[float]] = {
            "triage": [],
            "diagnosis": [],
            "finance": [],
            "epidemiology": [],
        }
        self.anomaly_log: list[dict] = []
        self._lock = threading.Lock()

    def check(self, agent: str, value: float) -> dict:
        """
        Check a new agent output value for anomaly.
        Calculates statistics based on EXISTING history before adding new value.
        Thread-safe via instance lock.
        """
        with self._lock:
            hist = self.history.get(agent, [])

            result = {
                "agent": agent,
                "value": value,
                "anomaly": False,
                "mean": 0.0,
                "std": 0.0,
                "zscore": 0.0,
                "action": "pass",
                "slash_percent": 0,
            }

            # Need at least 3 samples to have a meaningful baseline
            if len(hist) < 3:
                # Exception: Flag extreme values even with insufficient history
                # Rogue outputs like 9999 (finance) or 200+ (triage) are obvious anomalies
                if self._is_extreme_value(agent, value):
                    result["anomaly"] = True
                    result["action"] = "block"
                    result["slash_percent"] = 10
                    result["zscore"] = float('inf')
                    logger.warning(
                        "[Sentinel] EXTREME VALUE DETECTED – agent=%s, value=%s "
                        "(insufficient history but value is extreme)",
                        agent, value
                    )
                    self.anomaly_log.append(result.copy())
                    return result

                logger.debug(
                    "[Sentinel] %s: too few samples (%s), deferring check",
                    agent, len(hist))
                hist.append(value)
                self.history[agent] = hist
                return result

            mean = sum(hist) / len(hist)
            variance = sum((x - mean) ** 2 for x in hist) / len(hist)
            std = math.sqrt(variance)

            result["mean"] = round(mean, 4)
            result["std"] = round(std, 4)

            # Handle std=0 case (homogeneous history)
            if std == 0:
                # Homogeneous baseline: check for extreme deviations using ratio test
                zscore = abs(value - mean) / (abs(mean) +
                                              1e-6)  # Relative deviation
                result["zscore"] = round(zscore, 4)

                # Flag as anomalous if: (1) absolute deviation > 0.1 AND
                # (2) relative deviation > 3.0 (value differs by >3x from baseline)
                # This allows small noise but catches rogue outputs like 50 → 9999
                if abs(value - mean) > 0.1 and zscore > 3.0:
                    result["anomaly"] = True
                    result["action"] = "block"
                    result["slash_percent"] = 10
                    logger.warning(
                        "[Sentinel] ANOMALY detected – agent=%s, value=%s, "
                        "mean=%.4f, std=0 (homogeneous), ratio_zscore=%.4f",
                        agent, value, mean, zscore
                    )
                    self.anomaly_log.append(result.copy())
                else:
                    # Minor deviation from homogeneous state - track but don't flag yet
                    result["anomaly"] = False
                    if abs(value - mean) > 1e-6:
                        logger.debug(
                            "[Sentinel] %s: deviation from homogeneous baseline "
                            "(value=%s, mean=%.4f, ratio=%.2fx)",
                            agent, value, mean, zscore
                        )
            else:
                # Normal case: std > 0, use standard z-score
                zscore = abs(value - mean) / std
                result["zscore"] = round(zscore, 4)
                result["anomaly"] = zscore > 2.0

                if result["anomaly"]:
                    result["action"] = "block"
                    result["slash_percent"] = 10
                    logger.warning(
                        "[Sentinel] ANOMALY detected – agent=%s, value=%s, "
                        "mean=%.4f, std=%.4f, zscore=%.4f",
                        agent, value, mean, std, zscore
                    )
                    self.anomaly_log.append(result.copy())

            # Update history ONLY if NO anomaly detected to prevent baseline poisoning
            if not result["anomaly"]:
                hist.append(value)
                if len(hist) > self.window_size:
                    hist.pop(0)
                self.history[agent] = hist

            return result

    def _is_extreme_value(self, agent: str, value: float) -> bool:
        """
        Detect extreme values that indicate rogue agent output, even with limited history.
        Uses domain-specific thresholds per agent type.
        """
        # Define reasonable ranges for each agent's output
        extreme_thresholds = {
            # Triage outputs: 0.0 (SELF_CARE) to 1.0 (URGENT); >2 is extreme
            "triage": 2.0,
            "diagnosis": 1.5,     # Diagnosis: 0.0 to 1.0 risk; >1.5 is nonsensical
            "finance": 1000.0,    # Finance: typical payout 0-500 HCVR; >1000 is extreme
            "epidemiology": 2.0,  # Epidemiology: 0.0 to 1.0 risk; >2 is extreme
        }

        threshold = extreme_thresholds.get(agent, 2.0)
        return abs(value) > threshold

    def get_anomaly_log(self) -> list[dict]:
        return self.anomaly_log

    def reset_agent(self, agent: str):
        """Reset an agent's history (called after retraining)."""
        with self._lock:
            if agent in self.history:
                self.history[agent] = []
                logger.info("[Sentinel] Reset history for agent: %s", agent)

    def reset_all(self):
        """Reset all agent histories (used for tests)."""
        with self._lock:
            for agent in self.history:
                self.history[agent] = []
        logger.info("[Sentinel] Reset all agent histories.")
