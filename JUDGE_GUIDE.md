# AegisMorpheme-X (AMX) Protocol | Judge’s Guide

### Abstract
AegisMorpheme-X is a self-governing AI network that ensures healthcare decisions are cryptographically provable and economically accountable through on-chain governance and automated slashing.

### The Problem
Traditional AI systems in healthcare operate as "black boxes" with no immutable record of their logic or liability. For auditors and financial stewards, this creates an unmanageable risk where rogue or biased AI decisions can cause clinical harm or financial loss without a clear trail of accountability. AMX Protocol solves this by forcing every AI agent to back its decisions with collateral and sealing every action on a public ledger.

### Prerequisites
- **Live Demo**: [aegis-morpheme-x.vercel.app](https://aegis-morpheme-x.vercel.app)
- **Environment**: No setup required. Ensure the status indicator in the top-right shows **ONLINE**.

---

### 5-Step Judging Demo Path

1.  **Initialize Protocol**: Open the dashboard and verify that the system is **ONLINE**. This establishes a persistent WebSocket connection to the AI agent mesh.
2.  **Trigger Outbreak Scenario**: In the **Scenario Switcher** (left panel), click **[+] DHAKA_CRISIS**. This injects high-risk clinical data into the system and forces the agents into a stress-response mode.
3.  **Observe Agent Reasoning**: Watch the **Real-Time Output Stream**. You will see the **TinyML Engine** analyzing audio cough data, followed by the **Sentinel** auditing the diagnosis, and finally the results being sealed as a **Morpheme-X unit**.
4.  **Cryptographic Verification**: Locate the newest card in the **Morpheme History** and click **VERIFY ON HEDERA**. Observe the **tactical loading spinner** followed by the **on-chain verification toast**. This precisely simulates the time required for a public ledger audit before opening **HashScan**.
5.  **Audit the Impact**: Navigate to the **Impact Dashboard**. Observe that the **ANOMALIES_BLOCKED** count has incremented, demonstrating the Meta-Sentinel catching and neutralizing rogue logic in real-time.

---

### The Agent Mesh
- **Triage Agent**: Conducts initial clinical screening using Scikit-Learn TinyML models to categorize risk levels.
- **Diagnosis Agent**: Synthesizes clinical data with environmental risk factors to formulate high-confidence medical protocols.
- **Finance Agent**: Orchestrates parametric insurance payouts and manages the cryptographic sealing of decision units.
- **Meta-Sentinel**: Audits all inter-agent traffic in real-time to identify anomalies and enforce economic penalties.

---

### Manual Slashing Trigger (Step-by-Step)
To witness the protocol’s economic enforcement mechanism, follow these steps:
1.  Navigate to the **Scenario Switcher** on the left layout.
2.  Identify the **[+] DHAKA_CRISIS** button—this scenario is pre-configured to include "Anomaly" logic that violates safety bounds.
3.  Click the button. The **Meta-Sentinel** will immediately detect the deviation.
4.  Look for the **Slashing Notification** or the update in the **Impact Dashboard**.
5.  The system automatically executes a **10% Burn** of the offending agent's **AMXSTAKE** tokens via the **Hedera Token Service (HTS)**, providing immediate on-chain accountability.

---

### Audit & Accountability
Each component of the stack is designed for absolute transparency. The **Morpheme-X** units on HCS provide a permanent, tamper-proof audit trail for regulators. The **HTS Slashing** mechanism ensures that AI "hallucinations" or rogue behavior carry real financial consequences, shifting the risk from the healthcare provider to the AI protocol itself. This architecture transforms AI from a liability into a verifiable, institutional-grade asset.
