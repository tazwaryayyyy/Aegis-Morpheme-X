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
        
        # Receive broadcasted events over WebSocket: 'risk_received', 'agent_decision' x4, ...
        # Check for at least 'risk_received' and 'pipeline_complete'
        events = []
        # Receive up to 10 events (risk_received, triage, diagnosis, etc.)
        for _ in range(10):
            try:
                events.append(websocket.receive_json())
            except Exception:
                break
        
        assert any(e["type"] == "risk_received" for e in events)
        assert any(e["type"] == "pipeline_complete" for e in events)
