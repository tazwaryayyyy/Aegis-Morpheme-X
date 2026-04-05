import asyncio
import httpx
import sys
import time

# To run this: 
# 1. Start backend: cd backend && python main.py
# 2. Run test: python tests/e2e/test_e2e.py

BASE_URL = "http://localhost:8000"

async def test_complete_demo_flow():
    print("🚀 Starting End-to-End Demo Flow Test...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Check System Status
        print("🔍 Step 1: Checking system status...")
        try:
            resp = await client.get(f"{BASE_URL}/api/status")
            assert resp.status_code == 200
            print(f"✅ System ONLINE (version {resp.json()['version']})")
        except Exception as e:
            print(f"❌ Backend not reachable at {BASE_URL}. Is it running?")
            return

        # Step 2: Trigger Analysis (Normal/High Risk)
        # Sentinel needs at least 3 samples to establish a baseline
        print("🧪 Step 2: Establishing baseline (3 normal requests with risk=0.5)...")
        for i in range(3):
            resp = await client.post(
                f"{BASE_URL}/api/analyze", 
                json={"risk": 0.5, "scenario": "normal"}
            )
            assert resp.status_code == 200
            print(f"  Sample {i+1}/3 recorded...")
        
        data = resp.json()
        assert data["ok"] is True
        state = data["state"]
        print(f"✅ Baseline established. Latest: Triage={state['triage_decision']}")

        # Step 3: Trigger Anomaly
        print("🛡️ Step 3: Triggering anomaly protection (sending rogue value)...")
        resp = await client.post(
            f"{BASE_URL}/api/analyze", 
            json={"risk": 0.95, "scenario": "anomaly"}
        )
        assert resp.status_code == 200
        data = resp.json()
        state = data["state"]
        
        if not state["blocked"]:
            print("❌ Sentinel failed to block the anomaly!")
            print(f"DEBUG: Sentinel Report: {state.get('sentinel_report')}")
            assert state["blocked"] is True
            
        print("✅ Sentinel BLOCKED the anomalous transaction.")
        
        # Step 4: Verify Slashing
        print("💰 Step 4: Verifying slashing record...")
        resp = await client.get(f"{BASE_URL}/api/agents/stakes")
        assert resp.status_code == 200
        
        # The backend returns a dict: {"agent_name": stake_value}
        stakes = resp.json()["stakes"]
        finance_stake = stakes.get("finance", 0)
        
        print(f"✅ Agent 'finance' stake: {finance_stake} AMXSTAKE (Expected < 2500 due to slashing)")
        assert finance_stake < 2500

    print("\n🎉 All E2E test steps PASSED!")

if __name__ == "__main__":
    try:
        asyncio.run(test_complete_demo_flow())
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"❌ Test failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
