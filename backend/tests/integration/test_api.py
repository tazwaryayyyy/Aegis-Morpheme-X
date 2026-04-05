from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_analyze_endpoint_normal():
    # Normal case: risk=0.85 (High risk) -> URGENT
    response = client.post("/api/analyze", json={"risk": 0.85, "scenario": "normal"})
    assert response.status_code == 200
    assert response.json()["ok"] is True
    
    state = response.json()["state"]
    assert state["triage_decision"] == "URGENT"
    assert state["insurance_trigger"] is True
    assert state.get("blocked") is False

def test_analyze_endpoint_anomaly():
    # Anomaly case: risk=0.9 (High risk) + anomaly scenario
    # In main.py, /api/analyze handles 'anomaly' scenario by setting anomaly_override='force_anomaly'
    response = client.post("/api/analyze", json={"risk": 0.9, "scenario": "anomaly"})
    assert response.status_code == 200
    assert response.json()["ok"] is True
    
    state = response.json()["state"]
    assert state["blocked"] is True
