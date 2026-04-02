"""
AMX Protocol – Finance Agent + Adaptive Parametric Engine
Determines insurance payout trigger using dynamic thresholds.
"""

import logging
from typing import Any

logger = logging.getLogger("amx.finance")


def compute_payout_threshold(outbreak_risk: float, poverty_index: float) -> float:
    """
    Adaptive Parametric Engine formula:
        T_payout = clamp(0.5, 0.9,  0.7 - (R_outbreak * 0.3 + V_poverty * 0.1))

    Lower outbreak risk / poverty → higher threshold (harder to trigger payout).
    Higher outbreak risk / poverty → lower threshold (easier to trigger payout).
    """
    base = 0.7
    w1, w2 = 0.3, 0.1
    adjustment = (outbreak_risk * w1) + (poverty_index * w2)
    threshold = max(0.5, min(0.9, base - adjustment))
    return round(threshold, 4)


def finance_agent(state: dict[str, Any]) -> dict[str, Any]:
    """
    Finance agent node for LangGraph.
    Uses adaptive threshold to decide whether to trigger an insurance payout.

    Inputs:  state["risk"], state["outbreak_risk"], state["poverty_index"]
    Outputs: state["insurance_trigger"] (bool), state["payout_amount"] (float),
             state["payout_threshold"] (float)
    """
    risk = state.get("risk", 0.0)
    outbreak_risk = state.get("outbreak_risk", 0.3)
    poverty_index = state.get("poverty_index", 0.4)

    threshold = compute_payout_threshold(outbreak_risk, poverty_index)
    triggered = risk >= threshold

    payout_amount = 0.0
    if triggered:
        # Graduated payout: 50–200 HCVR based on severity
        excess = risk - threshold
        payout_amount = round(50 + (excess / (1.0 - threshold)) * 150, 2)

    logger.info(
        f"[Finance] risk={risk:.3f}, threshold={threshold:.3f}, "
        f"triggered={triggered}, payout={payout_amount} HCVR"
    )
    return {
        **state,
        "insurance_trigger": triggered,
        "payout_amount": payout_amount,
        "payout_threshold": threshold,
    }
