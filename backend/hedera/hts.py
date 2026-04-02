"""
AMX Protocol – Hedera HTS Integration (Simulated for Demo)
Manages AMXSTAKE token transfers and agent stake slashing.

In production: Use hedera-sdk-py TransferTransaction.
For demo: Simulates balance tracking and penalty transfers.
"""

import logging
import os
import time
import random

logger = logging.getLogger("amx.hedera.hts")

HTS_TOKEN_ID = os.getenv("HTS_TOKEN_ID", "0.0.4982310")
HEDERA_NETWORK = os.getenv("HEDERA_NETWORK", "testnet")
TREASURY_ACCOUNT = os.getenv("HEDERA_ACCOUNT_ID", "0.0.4312847")

# Simulated agent stakes (in AMXSTAKE tokens)
_agent_stakes: dict[str, float] = {
    "triage": 2500.0,
    "diagnosis": 2500.0,
    "finance": 2500.0,
    "epidemiology": 2500.0,
}

_retraining_log: list[dict] = []


def get_agent_stakes() -> dict[str, float]:
    """Return current agent stakes."""
    return dict(_agent_stakes)


def slash_agent_stake(agent: str, penalty_percent: float = 10.0) -> dict:
    """
    Slash `penalty_percent` of the agent's stake.
    Transfers slashed tokens to community compensation pool (treasury).
    Schedules a retraining round.
    """
    current_stake = _agent_stakes.get(agent, 0.0)
    slash_amount = round(current_stake * (penalty_percent / 100.0), 2)
    new_stake = round(current_stake - slash_amount, 2)

    _agent_stakes[agent] = new_stake

    # Simulate tx ID
    tx_id = f"{TREASURY_ACCOUNT}-{int(time.time() * 1_000_000_000)}-{random.randint(1000, 9999)}"

    retraining_entry = {
        "agent": agent,
        "slashed_amount": slash_amount,
        "remaining_stake": new_stake,
        "penalty_percent": penalty_percent,
        "tx_id": tx_id,
        "token_id": HTS_TOKEN_ID,
        "timestamp": int(time.time()),
        "retraining_scheduled": True,
        "explorer_url": f"https://hashscan.io/{HEDERA_NETWORK}/transaction/{tx_id}",
    }
    _retraining_log.append(retraining_entry)

    logger.warning(
        f"[HTS] SLASH – agent={agent}, slashed={slash_amount} AMXSTAKE, "
        f"remaining={new_stake}, tx={tx_id}"
    )
    logger.info(f"[HTS] Retraining scheduled for agent: {agent}")

    return retraining_entry


def mint_tokens(amount: float, recipient_account: str) -> str:
    """Simulate minting AMXSTAKE tokens to an account."""
    tx_id = f"{TREASURY_ACCOUNT}-{int(time.time() * 1_000_000_000)}-mint"
    logger.info(f"[HTS] Minted {amount} AMXSTAKE to {recipient_account}: tx={tx_id}")
    return tx_id


def get_retraining_log() -> list[dict]:
    return list(_retraining_log)


def trigger_hcvr_payout(amount: float, recipient: str = "patient-0.0.9999999") -> dict:
    """Simulate an HCVR (healthcare voucher) token payout to a patient."""
    tx_id = f"{TREASURY_ACCOUNT}-{int(time.time() * 1_000_000_000)}-payout"
    result = {
        "type": "HCVR_PAYOUT",
        "amount": amount,
        "recipient": recipient,
        "tx_id": tx_id,
        "token_id": HTS_TOKEN_ID,
        "timestamp": int(time.time()),
        "explorer_url": f"https://hashscan.io/{HEDERA_NETWORK}/transaction/{tx_id}",
    }
    logger.info(f"[HTS] PAYOUT – {amount} HCVR to {recipient}: tx={tx_id}")
    return result
