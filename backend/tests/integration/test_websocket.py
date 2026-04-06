import pytest
from fastapi.testclient import TestClient
from main import app
import json

def test_websocket_connection():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        # Should receive 'connected' message
        data = websocket.receive_json()
        assert data["type"] == "connected"
        assert "stakes" in data

def test_websocket_ping_pong():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        websocket.receive_json() # skip 'connected'
        
        websocket.send_json({"type": "ping"})
        data = websocket.receive_json()
        assert data["type"] == "pong"

def test_websocket_analyze_broadcast():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        websocket.receive_json() # skip 'connected'
        
        # Trigger analyze from REST
        response = client.post("/api/analyze", json={"risk": 0.85, "scenario": "normal"})
        assert response.status_code == 200
        
        # The suite sends:
        # - risk_received
        # - agent_decision (triage)
        # - agent_decision (diagnosis)
        # - outbreak_risk_update (epidemiology)
        # - payout_triggered/declined (finance)
        # - morpheme_created (morpheme)
        # - sentinel_check/block (sentinel)
        # - agent_slash (if blocked)
        # - pipeline_complete
        events = []
        for _ in range(15): # Allow up to 15 to be safe
            try:
                msg = websocket.receive_json()
                events.append(msg)
                if msg["type"] == "pipeline_complete":
                    break
            except Exception:
                break
        
        # Log events on failure for easier debugging
        if not any(e["type"] == "pipeline_complete" for e in events):
            print(f"DEBUG: Received events: {[e['type'] for e in events]}")

        assert any(e["type"] == "risk_received" for e in events)
        assert any(e["type"] == "pipeline_complete" for e in events)


