import pytest
from agents.triage import triage_agent

def test_triage_agent_urgent():
    # URGENT case
    state = {"risk": 0.85}
    result = triage_agent(state)
    assert result["triage_decision"] == "URGENT"

def test_triage_agent_consult():
    # CONSULT case
    state = {"risk": 0.45}
    result = triage_agent(state)
    assert result["triage_decision"] == "CONSULT"

def test_triage_agent_self_care():
    # SELF_CARE case
    state = {"risk": 0.2}
    result = triage_agent(state)
    assert result["triage_decision"] == "SELF_CARE"
