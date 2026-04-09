"""
AMX Protocol – Epidemiology Agent
Fetches One Health data and computes outbreak risk.
Simulates HOL registry agent-to-agent commerce.
"""

import logging
import random
from typing import Any

from one_health.weather import get_weather_risk
from one_health.livestock import get_livestock_risk

logger = logging.getLogger("amx.epidemiology")

# Simulated HOL (Hashgraph Online) Agent Registry
HOL_REGISTRY = [
    {"id": "genomic-agent-001", "specialty": "Genomic Sequence Analysis", "reputation": 0.97, "fee_hbar": 1.0},
    {"id": "genomic-agent-002", "specialty": "Genomic Sequence Analysis", "reputation": 0.89, "fee_hbar": 0.5},
    {"id": "pathogen-agent-001", "specialty": "Pathogen Identification", "reputation": 0.94, "fee_hbar": 0.8},
]

GENOMIC_RESULTS = [
    "H5N1 Avian Influenza detected – elevated pandemic risk",
    "SARS-CoV-3 variant trace – monitoring required",
    "RSV subtype B – seasonal outbreak expected",
    "Novel Betacoronavirus – insufficient data, escalate",
]


def _hire_genomic_agent() -> dict:
    """
    Simulates HOL registry lookup + micro-payment + response.
    Selects highest-reputation agent, pays 1 HBAR, returns result.
    """
    best = max(HOL_REGISTRY, key=lambda a: a["reputation"])
    result = random.choice(GENOMIC_RESULTS)
    logger.info(
        f"[Epidemiology] Hired agent {best['id']} (rep={best['reputation']}, "
        f"fee={best['fee_hbar']} HBAR) → {result}"
    )
    return {
        "agent_id": best["id"],
        "fee_hbar": best["fee_hbar"],
        "genomic_result": result,
    }


def epidemiology_agent(state: dict[str, Any]) -> dict[str, Any]:
    """
    Epidemiology agent node for LangGraph.
    Combines weather + livestock data → outbreak risk.
    If risk is elevated, hires a Genomic Sequence Agent from HOL registry.
    Uses dynamic city configuration for context-aware analysis.

    Inputs:  state["risk"], state.get("city") 
    Outputs: state["outbreak_risk"], state["genomic_hire"], state["poverty_index"]
    """
    risk = state.get("risk", 0.0)
    
    # Get city-specific weather risk
    city = state.get("city", "Dhaka")  # Default to Dhaka for demo
    weather_risk = get_weather_risk(city)
    livestock_risk = get_livestock_risk()

    # Weighted combination of One Health signals
    outbreak_risk = round(
        (weather_risk * 0.4) + (livestock_risk * 0.3) + (risk * 0.3), 4
    )

    # Get city-specific poverty index from weather module
    from one_health.weather import set_current_city
    city_config = set_current_city(city)
    poverty_index = city_config["config"].get("poverty_index", 0.4)

    genomic_hire = None
    if outbreak_risk > 0.5:
        genomic_hire = _hire_genomic_agent()
        logger.info(f"[Epidemiology] Elevated outbreak risk ({outbreak_risk:.3f}) – genomic hire triggered")
    
    logger.info(
        f"[Epidemiology] city={city}, weather_risk={weather_risk:.3f}, livestock_risk={livestock_risk:.3f}, "
        f"outbreak_risk={outbreak_risk:.3f}, poverty_index={poverty_index:.3f}"
    )

    return {
        **state,
        "outbreak_risk": min(1.0, max(0.0, outbreak_risk)),  # clamp 0-1
        "poverty_index": poverty_index,
        "weather_risk": weather_risk,
        "livestock_risk": livestock_risk,
        "genomic_hire": genomic_hire,
    }
