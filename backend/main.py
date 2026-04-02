"""
AMX Protocol – FastAPI Backend + WebSocket Server
Main application entry point.

Endpoints:
  POST /api/analyze          – Run the full AMX pipeline
  POST /api/analyze/anomaly  – Force anomaly scenario
  GET  /api/status           – System health check
  GET  /api/agents/stakes    – Agent stake balances
  GET  /api/registry         – HOL agent registry
  GET  /api/sentinel/log     – Anomaly log
  GET  /api/retraining/log   – Retraining log
  WS   /ws                   – Real-time event stream
"""

import asyncio
import json
import logging
import os
import random
import sys
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ── Path fix so backend/ sub-packages resolve correctly ──────────────────────
sys.path.insert(0, str(Path(__file__).parent))

from agents.graph import run_pipeline, sentinel
from agents.sentinel import StatisticalSentinel
from hedera.hts import get_agent_stakes, get_retraining_log, trigger_hcvr_payout
from hedera.registry import get_full_registry
from retraining_scheduler import scheduler, auto_schedule_from_slashes
from one_health.weather import set_current_city, get_current_city

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s – %(message)s",
)
logger = logging.getLogger("amx.main")

# Broadcast retraining updates to WebSocket clients
async def broadcast_retraining_update(session_id: str, session_data: dict):
    """Broadcast retraining progress to all WebSocket clients."""
    await manager.broadcast({
        "type": "retraining_update",
        "session_id": session_id,
        "session": session_data,
        "timestamp": int(time.time())
    })

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"[WS] Client connected. Total={len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        logger.info(f"[WS] Client disconnected. Total={len(self.active)}")

    async def broadcast(self, payload: dict):
        message = json.dumps(payload)
        dead = []
        # Create a copy of the list to avoid race conditions
        for ws in self.active.copy():
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        # Safely remove dead connections
        for ws in dead:
            if ws in self.active:
                self.active.remove(ws)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AMX Protocol backend starting…")
    # Start auto-scheduling retraining from existing slashes
    auto_schedule_from_slashes()
    yield
    logger.info("AMX Protocol backend shutting down.")


app = FastAPI(
    title="AegisMorpheme-X Protocol API",
    version="1.0.0",
    description="Self-governing, verifiable AI health + finance network",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class CityRequest(BaseModel):
    city: str = Field(..., description="City name (Dhaka, Singapore, Nairobi)")


class CityResponse(BaseModel):
    city: str
    config: dict
    weather_risk: float
    message: str


class RiskRequest(BaseModel):
    risk: float = Field(..., ge=0.0, le=1.0)
    scenario: str = Field("normal", description="Scenario type for demo")


class RiskResponse(BaseModel):
    ok: bool
    state: dict


class AnalyzeRequest(BaseModel):
    risk: float = Field(..., ge=0.0, le=1.0, description="Cough risk score from TinyML")
    scenario: str = Field("normal", description="Scenario: normal | anomaly")
    patient_id: Optional[str] = Field(None, description="Optional patient identifier")


class AnalyzeResponse(BaseModel):
    ok: bool
    state: dict


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/city/current")
async def get_current_city_endpoint():
    """Get the currently active city configuration."""
    city = get_current_city()
    city_info = set_current_city(city)  # This returns full config
    return CityResponse(
        city=city_info["city"],
        config=city_info["config"],
        weather_risk=city_info["weather_risk"],
        message=f"Currently active city: {city}"
    )


@app.post("/api/city/switch")
async def switch_city(request: CityRequest):
    """Switch to a new city and return its configuration."""
    try:
        city_info = set_current_city(request.city)
        
        # Broadcast city change to all WebSocket clients
        await manager.broadcast({
            "type": "city_changed",
            "city": city_info["city"],
            "config": city_info["config"],
            "weather_risk": city_info["weather_risk"],
            "timestamp": int(time.time())
        })
        
        logger.info(f"[API] City switched to: {request.city}")
        
        return CityResponse(
            city=city_info["city"],
            config=city_info["config"],
            weather_risk=city_info["weather_risk"],
            message=f"Successfully switched to {request.city}"
        )
        
    except Exception as e:
        logger.error(f"[API] City switch failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to switch city: {str(e)}")


@app.get("/api/city/available")
async def get_available_cities():
    """Get list of available cities with their configurations."""
    from one_health.weather import set_current_city
    
    cities = ["Dhaka", "Singapore", "Nairobi"]
    city_configs = {}
    
    for city in cities:
        try:
            city_info = set_current_city(city)
            city_configs[city] = city_info["config"]
        except Exception as e:
            logger.error(f"Failed to get config for {city}: {e}")
            city_configs[city] = {"error": str(e)}
    
    return {"cities": city_configs}


@app.get("/api/status")
async def status():
    return {
        "status": "online",
        "version": "1.0.0",
        "network": os.getenv("HEDERA_NETWORK", "testnet"),
        "simulate_hcs": os.getenv("SIMULATE_HCS", "true").lower() == "true",
        "timestamp": int(time.time()),
        "active_ws_clients": len(manager.active),
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    """
    Run the full AMX pipeline with the given risk score.
    Broadcasts events over WebSocket in real time.
    """
    logger.info(f"[API] /analyze – risk={req.risk:.3f}, scenario={req.scenario}")

    # Broadcast risk_received event immediately
    await manager.broadcast({
        "type": "risk_received",
        "risk": req.risk,
        "scenario": req.scenario,
        "timestamp": int(time.time()),
    })

    # Run pipeline (blocking, but fast for demo)
    anomaly_override = "force_anomaly" if req.scenario == "anomaly" else None
    
    # Get current city for context-aware analysis
    current_city = get_current_city()

    loop = asyncio.get_event_loop()
    final_state = await loop.run_in_executor(
        None, run_pipeline, req.risk, req.scenario, anomaly_override, current_city
    )

    # Broadcast all accumulated events
    for event in final_state.get("events", []):
        await manager.broadcast(event)

    # Trigger HCVR payout if insurance activated
    if final_state.get("insurance_trigger") and not final_state.get("blocked"):
        payout = trigger_hcvr_payout(
            amount=final_state["payout_amount"],
            recipient=req.patient_id or "patient-0.0.9999999"
        )
        await manager.broadcast({"type": "hcvr_payout", **payout})

    # Final summary event
    await manager.broadcast({
        "type": "pipeline_complete",
        "risk": req.risk,
        "triage": final_state.get("triage_decision"),
        "blocked": final_state.get("blocked"),
        "morpheme_tx": final_state.get("morpheme", {}).get("hedera_tx_id"),
        "morpheme_explorer": final_state.get("morpheme", {}).get("explorer_url"),
    })

    return AnalyzeResponse(ok=True, state=final_state)


@app.post("/api/analyze/anomaly")
async def analyze_anomaly():
    """Demo endpoint: forces an anomaly scenario with a suspicious risk value."""
    req = AnalyzeRequest(risk=0.9, scenario="anomaly")
    return await analyze(req)


@app.post("/api/simulate/cough")
async def simulate_cough(scenario: str = "normal"):
    """
    Simulate a cough analysis using a pre-recorded high-risk value.
    Mimics TinyML edge inference output.
    """
    # Use realistic cough risk scores (ICBHI 2017 dataset-calibrated)
    if scenario == "anomaly":
        risk = 0.9
    elif scenario == "low_risk":
        risk = round(random.uniform(0.2, 0.44), 3)
    elif scenario == "medium_risk":
        risk = round(random.uniform(0.45, 0.74), 3)
    else:
        risk = round(random.uniform(0.75, 0.96), 3)  # High risk for dramatic demo

    req = AnalyzeRequest(risk=risk, scenario=scenario)
    return await analyze(req)


@app.get("/api/agents/stakes")
async def agent_stakes():
    return {"stakes": get_agent_stakes(), "token": "AMXSTAKE", "timestamp": int(time.time())}


@app.get("/api/sentinel/log")
async def sentinel_log():
    return {"anomalies": sentinel.get_anomaly_log(), "count": len(sentinel.get_anomaly_log())}


@app.get("/api/retraining/log")
async def retraining_log():
    return {"retraining": get_retraining_log()}


@app.get("/api/retraining/sessions")
async def retraining_sessions():
    """Return active and completed retraining sessions."""
    return scheduler.get_all_sessions()


@app.post("/api/retraining/auto-schedule")
async def trigger_auto_schedule():
    """Manually trigger auto-scheduling of retraining from recent slashes."""
    auto_schedule_from_slashes()
    return {"message": "Auto-scheduling triggered", "sessions": scheduler.get_all_sessions()}


@app.get("/api/registry")
async def registry():
    return {"agents": get_full_registry()}


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial state on connection
    await websocket.send_text(json.dumps({
        "type": "connected",
        "message": "AMX Protocol WebSocket active",
        "timestamp": int(time.time()),
        "stakes": get_agent_stakes(),
    }))
    try:
        while True:
            # Keep connection alive; client messages are optional
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": int(time.time())}))
            except json.JSONDecodeError:
                logger.warning(f"[WS] Invalid JSON received: {data}")
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Invalid JSON format",
                    "timestamp": int(time.time())
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"[WS] Error: {e}")
        manager.disconnect(websocket)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
