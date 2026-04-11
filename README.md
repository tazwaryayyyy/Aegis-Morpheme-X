# AegisMorpheme-X (AMX) Protocol

> "AI decisions must be provable, enforceable, and economically accountable — or they don't execute."

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live Demo:** [aegis-morpheme-x.vercel.app](https://aegis-morpheme-x.vercel.app)  
**Backend API:** [aegis-morpheme-x.onrender.com](https://aegis-morpheme-x.onrender.com)

> The backend runs on Render's free tier and may take 30 to 60 seconds to wake up on first load. Wait for the ONLINE indicator in the dashboard to turn green before running any scenarios.

---

## What is AMX?

AegisMorpheme-X is a self-governing, verifiable AI governance network for health and finance decisions. It solves three real problems that existing AI infrastructure ignores:

| Crisis | Problem | AMX Solution |
|---|---|---|
| Shadow AI | Unvalidated models with no audit trail | Executable Morpheme-X sealed on Hedera HCS |
| Rogue Autonomy | Agents combining tools in unauthorized sequences | Meta-Sentinel with 2-sigma anomaly detection |
| Fiscal Space Gap | Slow, opaque humanitarian funding | Adaptive parametric insurance with automatic HTS payouts |

---

## Core Innovations

**1. Executable Morpheme-X**

Every AI decision is packaged into a cryptographic JSON unit containing an intent hash, model snapshot hash, context fingerprint, risk score, and execution trigger. This unit is submitted to Hedera Consensus Service and only executes after on-chain confirmation. Sub-3-second finality.

**2. Meta-Sentinel (2-sigma Anomaly Detection)**

A rolling-window z-score monitor watches every agent output in real time. Any deviation beyond 2 standard deviations blocks the action, slashes 10% of the agent's AMXSTAKE token balance, and schedules automatic retraining using the failed example as a hard negative.

**3. Self-Improving Economic Accountability**

Agents put skin in the game. They stake AMXSTAKE tokens and lose a portion of them when they misbehave. The retraining loop means agents get better over time rather than repeating the same failures.

**4. Agent-to-Agent Commerce**

When the Epidemiology Agent detects elevated outbreak risk, it hires specialized agents (like a Genomic Sequence AI) from a decentralized registry via micro-HBAR payments. The system is a marketplace of verifiable intelligence, not a closed monolith.

**5. Adaptive Parametric Insurance**

```
T_payout = clamp(0.5, 0.9, 0.7 - (R_outbreak × 0.3 + V_poverty × 0.1))
```

Payout thresholds shift dynamically based on real outbreak risk and poverty index data. In high-risk environments like Dhaka, a moderate cough triggers a micro-payout. In stable environments like Singapore, the bar is higher. Aid arrives faster when it's needed most.

---

## Architecture

```
Edge (TinyML) → Agent Mesh (LangGraph) → Hedera (HCS/HTS) → Dashboard (React)
                        ↑
              Meta-Sentinel (Anomaly Detection)
```

---

## Quick Start

**Prerequisites**
- Python 3.11+
- Node.js 20+
- No Hedera credentials needed to run in simulation mode

**1. Clone and configure**

```bash
git clone https://github.com/tazwaryayyyy/Aegis-Morpheme-X.git
cd Aegis-Morpheme-X
cp .env.example .env
```

Open `.env` and set:
```
SIMULATE_HCS=true
OPENWEATHER_API_KEY=your_key_here
```

That's the minimum. Everything else runs in simulation.

**2. Start the backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

**3. Start the frontend**

```bash
cd frontend
npm install
npm start
```

Dashboard runs at `http://localhost:3000`. When the ONLINE indicator turns green, the system is ready.

---

## Project Structure

```
amx-protocol/
├── backend/
│   ├── agents/
│   │   ├── graph.py            # LangGraph state machine
│   │   ├── triage.py           # Triage agent (URGENT/CONSULT/SELF_CARE)
│   │   ├── diagnosis.py        # Clinical diagnosis agent
│   │   ├── finance.py          # Adaptive parametric engine
│   │   ├── epidemiology.py     # One Health + HOL commerce
│   │   └── sentinel.py         # Meta-Sentinel (z-score anomaly detection)
│   ├── hedera/
│   │   ├── hcs.py              # HCS Morpheme-X submission
│   │   ├── hts.py              # HTS token slashing + payouts
│   │   └── registry.py         # HOL agent registry
│   ├── one_health/
│   │   ├── weather.py          # OpenWeatherMap risk feed
│   │   ├── livestock.py        # Livestock disease CSV parser
│   │   └── livestock_data.csv
│   ├── main.py                 # FastAPI + WebSocket server
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.tsx             # Root app + GSAP cursor physics
│       ├── Dashboard.js        # Real-time WebSocket dashboard
│       ├── CustomCursor.tsx    # Hardware-accelerated cursor
│       ├── ScenarioSwitcher.js # Scenario execution controls
│       ├── OneHealthMap.js     # Radial SVG geographic visualization
│       └── index.css           # Institutional cyan/acid/orange aesthetic
├── docs/
├── tests/
└── .env.example
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | System health |
| POST | `/api/simulate/cough?scenario=normal` | Simulate TinyML cough analysis |
| POST | `/api/analyze` | Run full AMX pipeline |
| POST | `/api/analyze/anomaly` | Force anomaly scenario |
| GET | `/api/agents/stakes` | AMXSTAKE balances |
| GET | `/api/sentinel/log` | Anomaly detection log |
| GET | `/api/retraining/log` | Agent retraining history |
| GET | `/api/registry` | HOL agent directory |
| GET | `/api/city/current` | Current city config |
| POST | `/api/city/switch` | Switch city (Dhaka/Nairobi/Singapore) |
| GET | `/api/city/available` | All available cities |
| WS | `/ws` | Real-time event stream |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SIMULATE_HCS` | `true` | Run without real Hedera credentials |
| `HEDERA_NETWORK` | `testnet` | Hedera network |
| `HEDERA_ACCOUNT_ID` | | Your Hedera account ID |
| `HEDERA_PRIVATE_KEY` | | Your Hedera private key |
| `HCS_TOPIC_ID` | | Morpheme-X HCS topic |
| `HCS_SENTINEL_TOPIC_ID` | | Sentinel log HCS topic |
| `HTS_TOKEN_ID` | | AMXSTAKE HTS token |
| `OPENWEATHER_API_KEY` | | Live weather risk data |

To switch from simulation to live Hedera: set `SIMULATE_HCS=false`, add your testnet credentials, and run `pip install hedera-sdk-py`.

---

## Zero-Cost Deployment

| Service | Purpose | Cost |
|---|---|---|
| GitHub | Code + CI/CD | Free |
| Hedera Testnet | HCS/HTS operations | Free (faucet) |
| Render | Backend hosting | Free tier |
| Vercel | Frontend hosting | Free |
| OpenWeatherMap | Weather data | 1000 calls/day free |

Total monthly cost: $0

---

## UI Design

AMX uses an institutional command-center aesthetic rather than the standard "hacker green" look. The color system runs on cyan, acid green, and orange as semantic state indicators (Nominal, Critical, Vector). Custom GSAP cursor physics create magnetic interactions on action elements. The One Health map uses minimal radial SVG emission rather than heavy tile-based rendering.

---

## Hedera Integration

AMX uses two Hedera services:

**HCS (Consensus Service):** Every Morpheme-X unit is submitted here for immutable, timestamped verification. You can click any transaction in the dashboard and verify it directly on HashScan.

**HTS (Token Service):** AMXSTAKE tokens are minted, staked by agents, and slashed automatically when the Meta-Sentinel flags a violation.

The HOL agent registry is simulated for this demo but follows the HCS-10/OpenConvAI spec for a real implementation.

---

## Author

**Tazwar Ahnaf**  
[GitHub](https://github.com/tazwaryayyyy) · [X](https://x.com/TazwarEnan)

MIT License. See [LICENSE](LICENSE).
