# AegisMorpheme-X (AMX) Protocol

> **"AI decisions must be provable, enforceable, and economically accountable — or they don't execute."**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with LangGraph](https://img.shields.io/badge/LangGraph-Agent_Mesh-green)](https://langchain-ai.github.io/langgraph/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688)](https://fastapi.tiangolo.com)

---

## What is AMX?

AegisMorpheme-X is a **self-governing, verifiable AI health + finance network** that solves three crises:

| Crisis | Problem | AMX Solution |
|--------|---------|--------------|
| Shadow AI | Unvalidated models without audit trails | Executable Morpheme-X sealed on Hedera HCS |
| Rogue Autonomy | Agents combining tools in unauthorized sequences | Meta-Sentinel with statistical anomaly detection |
| Fiscal Space Gap | Slow, opaque humanitarian funding | Adaptive parametric insurance with automatic HTS payouts |

---

## Core Innovations

### 1. Executable Morpheme-X
A cryptographic JSON unit containing `intent_hash`, `model_snapshot_hash`, `context_fingerprint`, `risk_score`, and `trigger` — submitted to Hedera HCS for immutable, on-chain verification.

### 2. Meta-Sentinel (2σ Anomaly Detection)
Rolling-window z-score analysis across all agent outputs. Any deviation exceeding 2 standard deviations blocks the action, slashes 10% of the agent's AMXSTAKE, and schedules retraining.

### 3. Self-Improving Economic Accountability
Agents stake AMXSTAKE tokens. Mistakes cost them tokens and trigger automated retraining using hard negatives.

### 4. Agent-to-Agent Commerce (HCS-10 / HOL Registry)
Epidemiology Agent hires specialized agents (e.g., Genomic Sequence AI) via micro-HBAR payments when elevated outbreak risk is detected.

### 5. Adaptive Parametric Insurance
```
T_payout = clamp(0.5, 0.9,  0.7 - (R_outbreak × 0.3 + V_poverty × 0.1))
```
Dynamic thresholds mean aid arrives faster precisely when communities need it most.

---

## Architecture

```
Edge (TinyML) → Agent Mesh (LangGraph) → Hedera (HCS/HTS) → Dashboard (React)
                        ↑
              Meta-Sentinel (Anomaly Detection)
```

**Full diagram:** see `docs/architecture.png`

---

## Institutional UI Physics & Aesthetics
AMX drops the cliché “hacker green” for a polished, highly-tactile institutional grade framework targeting seamless command-center executions:
* **Tactile Interactions**: Fully integrated `Lenis` physics-based momentum scrolling + automated GSAP hooks creating physical gravity around elements `<button className="magnetic-btn">`.
* **State-Targeting Cursor Overlay**: A custom geometric reticle (`data-cursor`) dynamically sniffs the environment hierarchy natively parsing Red (Critical/Dhaka), Orange (Vector/Nairobi), Acid (Nominal/Singapore), and general Cyan bounds.
* **Semantic Topology Constraints**: Stripped heavy visual rendering for minimal geo-spatial SVG `<g>` particle emission sweeps (`linear-gradient`) built directly into React components.

---

## Project Structure

```
amx-protocol/
├── backend/
│   ├── agents/
│   │   ├── graph.py          # LangGraph state machine
│   │   ├── triage.py         # Triage agent (URGENT/CONSULT/SELF_CARE)
│   │   ├── diagnosis.py      # Clinical diagnosis agent
│   │   ├── finance.py        # Adaptive parametric engine
│   │   ├── epidemiology.py   # One Health + HOL commerce
│   │   └── sentinel.py       # Meta-Sentinel (z-score anomaly detection)
│   ├── hedera/
│   │   ├── hcs.py            # HCS Morpheme-X submission
│   │   ├── hts.py            # HTS token slashing + payouts
│   │   └── registry.py       # HOL agent registry
│   ├── one_health/
│   │   ├── weather.py        # OpenWeatherMap risk feed
│   │   ├── livestock.py      # Livestock disease CSV parser
│   │   └── livestock_data.csv
│   ├── main.py               # FastAPI + WebSocket server
│   └── requirements.txt
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js            # Root app + GSAP Context Sniffing
│       ├── Dashboard.js      # Real-time WebSockets Dashboard
│       ├── ScenarioSwitcher.js# Semantic Testing Buttons
│       ├── OneHealthMap.js   # Radial Sweeping SVG Array
│       └── index.css         # Institutional Acid/Cyan Aesthetic CSS
├── docs/
├── README.md
└── LICENSE
```

---

## Quick Start

### Prerequisites (All Free)
- Python 3.11+
- Node.js 20+
- [Hedera testnet account](https://portal.hedera.com) (free, no card)

### 1. Clone & Configure

```bash
git clone https://github.com/tazwaryayyyy/Aegis-Morpheme-X.git
cd Aegis-Morpheme-X
cp .env.example .env
# Edit .env with your Hedera testnet credentials
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Dashboard runs at: `http://localhost:3000`

---

## 🚀 Advanced Features

- **Institutional-Grade UI Physics**: GSAP-powered magnetic fields, custom hardware-accelerated cursor masking, and Lenis buttery momentum layout integration.
- **Dynamic Contextual Reticle**: State-sniffing circular reticle tracking execution bounds (Red/Critical, Orange/Vector, Acid/Nominal).
- **One-Click Scenario Execution**: Pre-configured testing states via tactile flowish terminal sweeps (`IMP_CRIT`, `IMP_MED`, `IMP_LOW`).
- **Geographic Intelligence**: Interactive One Health map with minimal radial emission pulses replacing hard geometries.
- **Professional Demo Reports**: Export HashScan-stamped HTML audits mimicking raw secure terminal pipelines.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/status` | System health |
| `POST` | `/api/simulate/cough?scenario=normal` | Simulate TinyML cough analysis |
| `POST` | `/api/analyze` | Run full AMX pipeline with custom risk score |
| `POST` | `/api/analyze/anomaly` | Force anomaly scenario |
| `GET`  | `/api/agents/stakes` | AMXSTAKE balances |
| `GET`  | `/api/sentinel/log` | Anomaly detection log |
| `GET`  | `/api/retraining/log` | Agent retraining history |
| `GET`  | `/api/registry` | HOL agent directory |
| `GET`  | `/api/city/current` | Get current city configuration |
| `POST` | `/api/city/switch` | Switch to new city (Dhaka, Nairobi, Singapore) |
| `GET`  | `/api/city/available` | List all available cities |
| `WS`   | `/ws` | Real-time event stream |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HEDERA_NETWORK` | `testnet` | Hedera network |
| `HEDERA_ACCOUNT_ID` | — | Your Hedera account ID |
| `HEDERA_PRIVATE_KEY` | — | Your Hedera private key |
| `HCS_TOPIC_ID` | — | Morpheme-X HCS topic |
| `HCS_SENTINEL_TOPIC_ID` | — | Sentinel log HCS topic |
| `HTS_TOKEN_ID` | — | AMXSTAKE HTS token |
| `SIMULATE_HCS` | `true` | Use simulation (no real credentials needed) |
| `OPENWEATHER_API_KEY` | — | For live weather risk data |

---

## 🎮 Demo Usage

1. Open `http://localhost:3000` in your browser
2. Hover across **Scenario Switcher** nodes to see context-sniffing GSAP mapping.
3. Switch dynamic nodes with **Geographic Intelligence** (DHAKA -> NAIROBI -> SINGAPORE). 
4. Read Real-time system streams parsed natively into terminal bounds.
5. Hit `EXECUTE REPORT` for verifiable terminal data pipeline dumps tracking agent validation constraints.

---

## Zero-Cost Deployment

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| GitHub | Code + CI/CD | ✅ Free |
| Hedera Testnet | HCS/HTS | ✅ Free (faucet) |
| Oracle Cloud Always Free | Backend (4 ARM cores, 24 GB) | ✅ No card |
| Vercel / Netlify | Frontend | ✅ Free |
| OpenWeatherMap | Weather data | ✅ 1000 calls/day |

**Total monthly cost: $0**

---

## Hedera Integration

AMX uses Hedera for:
- **HCS** — Immutable Morpheme-X message submission (sub-3s finality)
- **HTS** — AMXSTAKE token management, stake slashing, HCVR payouts
- **HOL Registry** — Decentralized AI agent directory (simulated for demo)

To switch from simulation to live Hedera:
1. Set `SIMULATE_HCS=false` in `.env`
2. Add your testnet `HEDERA_ACCOUNT_ID` and `HEDERA_PRIVATE_KEY`
3. Install `hedera-sdk-py`: `pip install hedera-sdk-py`
4. Create HCS topics and HTS token via the [Hedera Portal](https://portal.hedera.com)

---

## Evaluation Criteria

| Criterion | Weight | How AMX Delivers |
|-----------|--------|-----------------|
| Innovation | 30% | Morpheme-X, Meta-Sentinel, agent-to-agent commerce, adaptive insurance |
| Technical Depth | 25% | TinyML + LangGraph + Hedera HCS/HTS + WebSockets + statistical modeling |
| Impact | 20% | Shadow AI, rogue autonomy, humanitarian funding gap — all addressed |
| UI/UX | 15% | Premium institutional glassmorphism, dynamic context cursor physics, terminal mapping |
| Presentation | 10% | Verified HashScan export logic mapped perfectly over 3-min demonstration |

---

## License

MIT License — See [LICENSE](LICENSE)

---

## 👤 Author

**Tazwar Ahnaf**  
[GitHub](https://github.com/tazwaryayyyy) • [X](https://x.com/TazwarEnan)  
Creator of Aegis-Morpheme-X – a verifiable governance protocol for autonomous AI.
