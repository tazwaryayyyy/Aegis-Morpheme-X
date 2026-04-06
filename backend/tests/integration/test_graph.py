import pytest
from agents.graph import run_pipeline

def test_full_agent_pipeline_normal():
    # Normal case: 0.85 (High risk) -> URGENT -> No anomaly
    result = run_pipeline(risk=0.85, scenario="normal")
    
    assert result["triage_decision"] == "URGENT"
    assert result["insurance_trigger"] is True
    assert "morpheme" in result
    assert result.get("blocked") is False
    assert result["morpheme"]["hedera_tx_id"] is not None

def test_full_agent_pipeline_anomaly():
    # Seed the sentinel baseline first (needs 3+ samples)
    from agents.graph import sentinel
    sentinel.reset_all()
    for _ in range(5):
        sentinel.check("finance", 50.0) # Normal payout

        
    # Anomaly case: 0.9 (High risk) + force_anomaly
    # Sentinel should block it because finance_node will be overridden with 9999.0
    result = run_pipeline(risk=0.9, scenario="anomaly", anomaly_override="force_anomaly")
    
    assert result["blocked"] is True
    assert any(event["type"] == "sentinel_block" for event in result["events"])
    assert any(event["type"] == "agent_slash" for event in result["events"])

