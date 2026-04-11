import requests
import json
import time
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

API_BASE = "http://localhost:8000"

def test_cough_simulation():
    print("Testing /api/simulate/cough endpoint...")
    
    # 1. Test simulation (no features provided)
    print("\nScenario 1: Simulation (normal)")
    resp = requests.post(f"{API_BASE}/api/simulate/cough", json={"scenario": "normal"})
    if resp.status_code == 200:
        data = resp.json()
        risk = data["state"]["risk"]
        print(f"SUCCESS: Received risk score: {risk:.4f}")
    else:
        print(f"FAILED: {resp.status_code} - {resp.text}")

    # 2. Test with real features (Low Risk)
    print("\nScenario 2: Low Risk Features")
    low_risk_features = [10.0] * 13 # Matches training data distribution
    resp = requests.post(f"{API_BASE}/api/simulate/cough", json={"scenario": "normal", "features": low_risk_features})
    if resp.status_code == 200:
        data = resp.json()
        risk = data["state"]["risk"]
        print(f"SUCCESS: Received risk score: {risk:.4f} (Expected low)")
    else:
        print(f"FAILED: {resp.status_code} - {resp.text}")

    # 3. Test with real features (High Risk)
    print("\nScenario 3: High Risk Features")
    high_risk_features = [25.0] * 13
    high_risk_features[0] = 35.0 # High energy
    resp = requests.post(f"{API_BASE}/api/simulate/cough", json={"scenario": "normal", "features": high_risk_features})
    if resp.status_code == 200:
        data = resp.json()
        risk = data["state"]["risk"]
        print(f"SUCCESS: Received risk score: {risk:.4f} (Expected high)")
    else:
        print(f"FAILED: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    # Wait for server to be up (if running locally)
    # For this verification, we assume the user might have the server running
    # or we can try to run it in a background process.
    # However, since I'm in an environment where I can't easily run a persistent server
    # and wait for it, I'll just check if I can import the engine and test prediction directly.
    
    from one_health.tinyml_engine import tinyml_engine
    
    print("Direct Engine Test:")
    risk_low = tinyml_engine.predict_risk([10.0]*13)
    risk_high = tinyml_engine.predict_risk([35.0]*13)
    print(f"Direct Prediction (Low): {risk_low:.4f}")
    print(f"Direct Prediction (High): {risk_high:.4f}")
    
    if risk_low < 0.5 and risk_high > 0.7:
        print("\nVERIFICATION PASSED: Engine correctly distinguishes risk levels.")
    else:
        print("\nVERIFICATION FAILED: Engine output not as expected.")
