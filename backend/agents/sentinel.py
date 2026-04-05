"""
AMX Protocol – Meta-Sentinel (Statistical Anomaly Detection)
Monitors all agent outputs using rolling-window z-score analysis.
"""

import math
import logging

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

    def check(self, agent: str, value: float) -> dict:
        """
        Check a new agent output value for anomaly.
        Calculates statistics based on EXISTING history before adding new value.
        """
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
            logger.debug(f"[Sentinel] {agent}: too few samples ({len(hist)}), skipping check")
            # Still record the value to build history
            hist.append(value)
            self.history[agent] = hist
            return result

        mean = sum(hist) / len(hist)
        variance = sum((x - mean) ** 2 for x in hist) / len(hist)
        std = math.sqrt(variance)

        result["mean"] = round(mean, 4)
        result["std"] = round(std, 4)

        # Use epsilon to avoid division by zero if std is 0 (perfectly stable baseline)
        zscore = abs(value - mean) / (std + 1e-6)
        result["zscore"] = round(zscore, 4)

        # If std was 0, any significant deviation is an anomaly. 
        # Otherwise, check if zscore exceeds threshold.
        if (std == 0 and abs(value - mean) > 0.01) or zscore > 2.0:
            result["anomaly"] = True
            result["action"] = "block"
            result["slash_percent"] = 10
            logger.warning(
                f"[Sentinel] ANOMALY detected – agent={agent}, value={value}, "
                f"mean={mean:.4f}, std={std:.4f}, zscore={zscore:.4f}"
            )
            self.anomaly_log.append(result.copy())

        # Update history AFTER check to establish baseline for NEXT run
        hist.append(value)
        if len(hist) > self.window_size:
            hist.pop(0)
        self.history[agent] = hist

        return result

    def get_anomaly_log(self) -> list[dict]:
        return self.anomaly_log

    def reset_agent(self, agent: str):
        """Reset an agent's history (called after retraining)."""
        if agent in self.history:
            self.history[agent] = []
            logger.info(f"[Sentinel] Reset history for agent: {agent}")
