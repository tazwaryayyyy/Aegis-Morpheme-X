# Demo Script – AegisMorpheme-X Protocol
## 3-Minute Hackathon Presentation

---

### 0:00 – Opening (15 seconds)

**Narration:**
> "AI systems today can act without accountability. They diagnose, pay out, and decide — with no proof, no audit trail, no consequence for being wrong. We built a system where that is impossible. Every decision must be proven, verified, and enforced — or it doesn't execute."

**Visual:** Dashboard loads — dark interface with animated background, network badge shows `ℏ HEDERA TESTNET`.

---

### 0:15 – Normal Flow (45 seconds)

**Action:** Click **"Simulate Cough (High Risk)"**

**What happens:**
1. 🎙️ TinyML edge engine returns risk score `0.85` (calibrated to ICBHI-2017 dataset)
2. Dashboard risk gauge sweeps to red zone
3. **Triage Agent** → `URGENT`
4. **Diagnosis Agent** → `"High likelihood of severe respiratory infection"`
5. **Epidemiology Agent** → fetches One Health data, computes outbreak risk `0.54`
6. **Finance Agent** → adaptive threshold `0.614` is crossed → payout `83.2 HCVR` triggered
7. **Morpheme-X** created — JSON card appears:
   - `intent_hash`, `model_snapshot_hash`, `risk_score`, `trigger`, `hedera_tx_id`
   - 🔒 **Lock icon animates closed** after HCS confirmation

**Narration:**
> "The AI's decision is now sealed on Hedera. In under three seconds, the payout is triggered automatically — no paperwork, no intermediary, no delay."

---

### 1:00 – Live Trust Proof (30 seconds)

**Action:** Copy the `hedera_tx_id` from the Morpheme-X card → click **"HashScan ↗"** link

**Visual:** HashScan opens — shows the transaction with the full JSON message matching the dashboard exactly.

**Narration:**
> "This decision is immutable. The message on HashScan matches what you see here exactly. Even we — the creators — cannot alter it."

**Key line:** *"This is the Trust Proof."*

---

### 1:30 – Anomaly & Penalty (30 seconds)

**Action:** Click **"Force Anomaly"**

**What happens:**
1. Finance agent output spikes to an aberrant value (`9999.0`)
2. Meta-Sentinel detects >2σ deviation in rolling window
3. ⚡ Sentinel panel flashes RED: `"Anomaly Detected"`
4. Event feed shows: `⚡ Sentinel BLOCK · Agent finance anomaly detected — slashing 10%`
5. AMXSTAKE bar for `finance` decreases by 10%
6. `🔁 Retraining round scheduled · Hard negatives dataset updated`

**Narration:**
> "The system doesn't just block the mistake — it penalizes it economically and schedules retraining. The agent learns from the error. This is self-improving governance."

---

### 2:00 – Agent Hiring & Adaptive Insurance (30 seconds)

**Action:** Click **"Adaptive Insurance"** (runs a second normal simulation)

**What happens:**
1. Epidemiology agent detects elevated outbreak risk (`>0.5`)
2. HOL registry queried for `"Genomic Sequence Analysis"` agent
3. `GenomicPathAI` hired for `1.0 HBAR` micro-payment
4. Genomic result: `"H5N1 Avian Influenza detected – elevated pandemic risk"`
5. Outbreak risk rises → adaptive threshold drops to `0.58`
6. A risk score of `0.62` (which would have been declined before) now **triggers a payout**

**Narration:**
> "Adaptive insurance means communities get help faster precisely when the risk is highest. No static thresholds. No bureaucracy."

---

### 2:30 – Impact & Close (30 seconds)

**Visual:** Dashboard summary — event feed full of green events, Morpheme-X locked, stakes intact (or recovering)

**Narration:**
> "For a farmer in East Africa, or a patient in a remote clinic, this means aid arrives in seconds — verified, automatic, and accountable. AegisMorpheme-X is not just a healthcare system. It is a governance primitive for all autonomous AI."

**Final line:**
> *"AMX ensures that every AI decision is verifiable. This is the future of trustworthy AI."*

---

## Judge Q&A Preparation

| Question | Answer |
|---|---|
| How does it work without real Hedera keys? | Simulation mode generates realistic tx IDs and timestamps. Flip `SIMULATE_HCS=false` with real testnet credentials for live transactions. |
| Is the TinyML model real? | The risk score pipeline is real. For demo, we use pre-calibrated values from the ICBHI 2017 respiratory sound database. A real CNN model can be loaded via TF.js. |
| What prevents gaming the sentinel? | The rolling window uses statistical z-score detection — agents cannot predict what constitutes an anomaly without knowing other agents' histories. Stakes penalize rogue behavior. |
| How do you handle real patient data? | All patient data is processed locally (edge). Only the risk score hash leaves the device. No PII is stored on Hedera. |
| What's the path to production? | Phase 1: Hedera mainnet. Phase 2: UNICEF Venture Fund application. Phase 3: Partner with WHO GI-AI4H for clinical validation. |
