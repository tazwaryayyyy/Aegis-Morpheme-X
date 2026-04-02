"""
AMX Protocol – HOL (Hashgraph Online) Agent Registry (Simulated)
Provides a decentralized directory of AI agents for agent-to-agent commerce.
"""

import logging
import random
import time

logger = logging.getLogger("amx.hedera.registry")

# Simulated agent directory (in production: fetched from HCS topic feed)
HOL_REGISTRY = [
    {
        "id": "genomic-agent-001",
        "name": "GenomicPathAI",
        "specialty": "Genomic Sequence Analysis",
        "operator": "0.0.5000001",
        "reputation": 0.97,
        "fee_hbar": 1.0,
        "online": True,
        "capabilities": ["H5N1", "SARS-CoV", "RSV", "novel-coronavirus"],
    },
    {
        "id": "genomic-agent-002",
        "name": "BioSeqNet",
        "specialty": "Genomic Sequence Analysis",
        "operator": "0.0.5000002",
        "reputation": 0.89,
        "fee_hbar": 0.5,
        "online": True,
        "capabilities": ["H5N1", "RSV"],
    },
    {
        "id": "pathogen-agent-001",
        "name": "PathogenSentryAI",
        "specialty": "Pathogen Identification",
        "operator": "0.0.5000003",
        "reputation": 0.94,
        "fee_hbar": 0.8,
        "online": True,
        "capabilities": ["bacterial", "viral", "fungal"],
    },
    {
        "id": "climate-agent-001",
        "name": "EcoHealthNet",
        "specialty": "Climate & Vector Risk",
        "operator": "0.0.5000004",
        "reputation": 0.91,
        "fee_hbar": 0.3,
        "online": True,
        "capabilities": ["dengue", "malaria", "cholera"],
    },
]


def query_registry(specialty: str) -> list[dict]:
    """Query HOL registry for agents matching a specialty."""
    results = [a for a in HOL_REGISTRY if specialty.lower() in a["specialty"].lower() and a["online"]]
    logger.info(f"[HOL Registry] Query '{specialty}' → {len(results)} agents found")
    return results


def hire_agent(agent_id: str, requester: str = "0.0.4312847") -> dict:
    """Simulate hiring an agent via micro-payment and receiving a result."""
    agent = next((a for a in HOL_REGISTRY if a["id"] == agent_id), None)
    if not agent:
        return {"error": f"Agent {agent_id} not found"}

    tx_id = f"{requester}-{int(time.time() * 1_000_000_000)}-hire"
    result = {
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "fee_hbar": agent["fee_hbar"],
        "payment_tx_id": tx_id,
        "response_time_ms": random.randint(800, 2400),
        "result": f"{random.choice(agent['capabilities'])} signature detected – confidence {random.uniform(0.82, 0.99):.2f}",
    }
    logger.info(f"[HOL Registry] Hired {agent_id}, fee={agent['fee_hbar']} HBAR, tx={tx_id}")
    return result


def get_full_registry() -> list[dict]:
    return list(HOL_REGISTRY)
