"""
AMX Protocol – Triage Agent
Maps risk score to triage decision: URGENT / CONSULT / SELF_CARE.
"""

import logging
from typing import Any

logger = logging.getLogger("amx.triage")


def triage_agent(state: dict[str, Any]) -> dict[str, Any]:
    """
    Triage agent node for LangGraph.
    Input:  state["risk"] (float 0–1)
    Output: state["triage_decision"] (str)
    """
    risk = state.get("risk", 0.0)

    if risk >= 0.75:
        decision = "URGENT"
    elif risk >= 0.45:
        decision = "CONSULT"
    else:
        decision = "SELF_CARE"

    logger.info(f"[Triage] risk={risk:.3f} → {decision}")
    return {**state, "triage_decision": decision}
