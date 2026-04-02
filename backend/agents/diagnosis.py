"""
AMX Protocol – Diagnosis Agent
Maps risk score to a clinical diagnosis string.
"""

import logging
from typing import Any

logger = logging.getLogger("amx.diagnosis")

DIAGNOSIS_TABLE = [
    (0.85, "High likelihood of severe respiratory infection – immediate clinical review required"),
    (0.70, "Moderate-to-high probability of respiratory infection – urgent outpatient evaluation"),
    (0.55, "Possible early-stage respiratory condition – schedule diagnostic tests"),
    (0.40, "Low-risk respiratory symptoms – monitor and maintain hydration"),
    (0.00, "No significant respiratory concern – routine wellness check recommended"),
]


def diagnosis_agent(state: dict[str, Any]) -> dict[str, Any]:
    """
    Diagnosis agent node for LangGraph.
    Input:  state["risk"] (float 0–1)
    Output: state["diagnosis"] (str)
    """
    risk = state.get("risk", 0.0)
    diagnosis = DIAGNOSIS_TABLE[-1][1]

    for threshold, text in DIAGNOSIS_TABLE:
        if risk >= threshold:
            diagnosis = text
            break

    logger.info(f"[Diagnosis] risk={risk:.3f} → {diagnosis[:60]}…")
    return {**state, "diagnosis": diagnosis}
