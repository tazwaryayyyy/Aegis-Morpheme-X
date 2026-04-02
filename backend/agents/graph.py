"""
AMX Protocol – LangGraph Agent Mesh
Defines the state machine: Triage → Diagnosis → Epidemiology → Finance → Morpheme-X → Sentinel.
Compatible with LangGraph 1.x.
"""

import hashlib
import json
import logging
import time
from typing import Any, List, Optional
from typing_extensions import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from agents.triage import triage_agent
from agents.diagnosis import diagnosis_agent
from agents.finance import finance_agent
from agents.epidemiology import epidemiology_agent
from agents.sentinel import StatisticalSentinel
from hedera.hcs import submit_morpheme
from hedera.hts import slash_agent_stake

logger = logging.getLogger("amx.graph")

# Global sentinel instance (shared across all runs)
sentinel = StatisticalSentinel(window_size=10)


# ---------------------------------------------------------------------------
# State schema – LangGraph 1.x requires a TypedDict
# ---------------------------------------------------------------------------

class AMXState(TypedDict, total=False):
    risk: float
    scenario: str
    anomaly_override: Optional[str]
    timestamp: int
    triage_decision: str
    diagnosis: str
    insurance_trigger: bool
    payout_amount: float
    payout_threshold: float
    outbreak_risk: float
    poverty_index: float
    weather_risk: float
    livestock_risk: float
    genomic_hire: Optional[dict]
    morpheme: dict
    blocked: bool
    sentinel_report: dict
    slash_result: Optional[dict]
    events: List[dict]
    city: str


def make_initial_state(
    risk: float,
    scenario: str = "normal",
    anomaly_override: Optional[str] = None,
    city: str = "Dhaka"
) -> AMXState:
    return AMXState(
        risk=risk,
        scenario=scenario,
        anomaly_override=anomaly_override,
        timestamp=int(time.time()),
        triage_decision="",
        diagnosis="",
        insurance_trigger=False,
        payout_amount=0.0,
        payout_threshold=0.7,
        outbreak_risk=0.3,
        poverty_index=0.4,
        weather_risk=0.0,
        livestock_risk=0.0,
        genomic_hire=None,
        morpheme={},
        blocked=False,
        sentinel_report={},
        slash_result=None,
        events=[],
        city=city,
    )


# ---------------------------------------------------------------------------
# Morpheme-X creator node
# ---------------------------------------------------------------------------

def morpheme_creator_node(state: dict[str, Any]) -> dict[str, Any]:
    """Assembles the Executable Morpheme-X from agent outputs and submits to HCS."""
    risk = state["risk"]
    trigger_payload = (
        {"type": "PAYOUT", "amount": state["payout_amount"], "currency": "HCVR"}
        if state["insurance_trigger"]
        else {"type": "ALERT", "level": state["triage_decision"]}
    )

    morpheme = {
        "intent_hash": hashlib.sha256(
            json.dumps(trigger_payload, sort_keys=True).encode()
        ).hexdigest(),
        "model_snapshot_hash": "sha256:tinyml-cough-v2.1.0-icbhi",
        "context_fingerprint": hashlib.sha256(
            f"{risk}:{state['timestamp']}:{state['outbreak_risk']}".encode()
        ).hexdigest()[:16],
        "risk_score": round(risk, 4),
        "triage": state["triage_decision"],
        "diagnosis": state["diagnosis"],
        "outbreak_risk": state["outbreak_risk"],
        "payout_threshold": state["payout_threshold"],
        "insurance_trigger": state["insurance_trigger"],
        "payout_amount": state["payout_amount"],
        "trigger": trigger_payload,
        "timestamp": state["timestamp"],
        "hedera_tx_id": None,  # Filled after HCS submission
    }

    # Submit to Hedera HCS (simulated)
    morpheme = submit_morpheme(morpheme)
    logger.info(f"[MorphemeX] Created and submitted: tx={morpheme.get('hedera_tx_id')}")

    events = state.get("events", [])
    events.append({"type": "morpheme_created", "morpheme": morpheme})

    return {**state, "morpheme": morpheme, "events": events}


# ---------------------------------------------------------------------------
# Sentinel node
# ---------------------------------------------------------------------------

def sentinel_node(state: dict[str, Any]) -> dict[str, Any]:
    """Meta-Sentinel anomaly detection across all agent outputs."""
    risk = state["risk"]
    scenario = state.get("scenario", "normal")
    anomaly_override = state.get("anomaly_override")

    # Numeric signals monitored per agent
    signals = {
        "triage": {"URGENT": 1.0, "CONSULT": 0.5, "SELF_CARE": 0.0}[state["triage_decision"]],
        "diagnosis": risk,
        "finance": state["payout_amount"],
        "epidemiology": state["outbreak_risk"],
    }

    blocked = False
    sentinel_report = {}
    slash_result = None
    events = state.get("events", [])

    for agent, value in signals.items():
        # In anomaly scenario, override finance signal to simulate rogue output
        if agent == "finance" and anomaly_override == "force_anomaly":
            value = 9999.0  # Clearly aberrant value

        report = sentinel.check(agent, value)
        sentinel_report[agent] = report

        if report["anomaly"]:
            blocked = True
            logger.warning(f"[Sentinel] Blocking action due to anomaly in {agent}")
            
            reasoning = f"Sentinel → {agent} deviation {report['zscore']:.2f} > 2σ → ANOMALY BLOCKED"
            events.append({
                "type": "sentinel_block",
                "agent": agent,
                "report": report,
                "reasoning": reasoning,
                "zscore": report["zscore"],
                "timestamp": int(time.time())
            })

            # Slash stake
            slash_result = slash_agent_stake(agent, penalty_percent=10)
            events.append({
                "type": "agent_slash",
                "agent": agent,
                "slash_result": slash_result,
                "reasoning": f"Economic penalty: 10% stake slashed ({slash_result['slashed_amount']} AMXSTAKE)",
                "timestamp": int(time.time())
            })

    logger.info(f"[Sentinel] Check complete. Blocked={blocked}")
    
    if not blocked:
        events.append({
            "type": "sentinel_check",
            "blocked": blocked,
            "report": sentinel_report,
            "reasoning": "Sentinel → All agents within normal bounds",
            "timestamp": int(time.time())
        })

    return {
        **state,
        "blocked": blocked,
        "sentinel_report": sentinel_report,
        "slash_result": slash_result,
        "events": events,
    }


# ---------------------------------------------------------------------------
# Wrapper nodes that also emit WebSocket events
# ---------------------------------------------------------------------------

def triage_node(state: dict[str, Any]) -> dict[str, Any]:
    state = triage_agent(state)
    events = state.get("events", [])
    reasoning = f"Triage ({state['risk']:.2f}) → {state['triage_decision']}"
    events.append({
        "type": "agent_decision", 
        "agent": "triage", 
        "decision": state["triage_decision"],
        "reasoning": reasoning,
        "timestamp": int(time.time())
    })
    return {**state, "events": events}


def diagnosis_node(state: dict[str, Any]) -> dict[str, Any]:
    state = diagnosis_agent(state)
    events = state.get("events", [])
    confidence = 0.85 + (state['risk'] * 0.1)  # Simulated confidence
    reasoning = f"Diagnosis → {state['diagnosis'][:60]}... ({confidence:.0%} confidence)"
    events.append({
        "type": "agent_decision", 
        "agent": "diagnosis", 
        "decision": state["diagnosis"],
        "reasoning": reasoning,
        "confidence": confidence,
        "timestamp": int(time.time())
    })
    return {**state, "events": events}


def epidemiology_node(state: dict[str, Any]) -> dict[str, Any]:
    state = epidemiology_agent(state)
    events = state.get("events", [])
    events.append({
        "type": "outbreak_risk_update",
        "outbreak_risk": state["outbreak_risk"],
        "weather_risk": state["weather_risk"],
        "livestock_risk": state["livestock_risk"],
        "genomic_hire": state.get("genomic_hire"),
    })
    return {**state, "events": events}


def finance_node(state: dict[str, Any]) -> dict[str, Any]:
    state = finance_agent(state)
    events = state.get("events", [])
    threshold = state["payout_threshold"]
    action = "PAYOUT" if state["insurance_trigger"] else "NO PAYOUT"
    reasoning = f"Finance → Risk {state['risk']:.2f} vs Threshold {threshold:.2f} → {action} {state['payout_amount']:.0f} HCVR"
    events.append({
        "type": "payout_triggered" if state["insurance_trigger"] else "payout_declined", 
        "agent": "finance",
        "payout_amount": state["payout_amount"],
        "threshold": threshold,
        "reasoning": reasoning,
        "triggered": state["insurance_trigger"],
        "timestamp": int(time.time())
    })
    return {**state, "events": events}


# ---------------------------------------------------------------------------
# Build LangGraph graph
# ---------------------------------------------------------------------------

def build_graph():
    graph = StateGraph(AMXState)

    graph.add_node("triage", triage_node)
    graph.add_node("diagnosis", diagnosis_node)
    graph.add_node("epidemiology", epidemiology_node)
    graph.add_node("finance", finance_node)
    graph.add_node("morpheme_creator", morpheme_creator_node)
    graph.add_node("sentinel", sentinel_node)

    graph.set_entry_point("triage")
    graph.add_edge("triage", "diagnosis")
    graph.add_edge("diagnosis", "epidemiology")
    graph.add_edge("epidemiology", "finance")
    graph.add_edge("finance", "morpheme_creator")
    graph.add_edge("morpheme_creator", "sentinel")
    graph.add_edge("sentinel", END)

    return graph.compile()


# Compiled graph singleton
amx_graph = build_graph()


def run_pipeline(
    risk: float, 
    scenario: str = "normal", 
    anomaly_override: Optional[str] = None,
    city: str = "Dhaka"
) -> dict[str, Any]:
    """Run the full AMX agent pipeline and return final state."""
    try:
        initial = make_initial_state(risk, scenario, anomaly_override, city)
        final = amx_graph.invoke(initial)
        return final
    except Exception as e:
        logger.error(f"[Pipeline] Pipeline execution failed: {e}")
        # Return safe fallback state
        return {
            "risk": risk,
            "scenario": scenario,
            "error": str(e),
            "blocked": True,
            "morpheme": {},
            "events": [{"type": "pipeline_error", "error": str(e), "timestamp": int(time.time())}]
        }
