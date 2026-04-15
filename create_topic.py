#!/usr/bin/env python3
"""
One-time script to create HCS topics on Hedera testnet.
Run this locally to set up your Morpheme-X and Sentinel topics.

Usage:
    python create_topic.py
"""

from hedera import (
    Client,
    TopicCreateTransaction,
    PrivateKey,
    AccountId,
)

# Your testnet credentials from https://portal.hedera.com
ACCOUNT_ID = "0.0.8474749"
PRIVATE_KEY = "0xe151ddab264814435355fdf882f1339b435b40e215e3d3c29f97c055ba0b7981"


def create_topic(memo: str) -> str:
    """Create a single HCS topic and return its ID."""
    account_id = AccountId.fromString(ACCOUNT_ID)
    private_key = PrivateKey.fromString(PRIVATE_KEY)

    # Connect to Hedera testnet
    client = Client.forTestnet()
    client.setOperator(account_id, private_key)

    # Create topic
    tx = TopicCreateTransaction().setTopicMemo(memo).execute(client)
    receipt = tx.getReceipt(client)
    topic_id = receipt.topicId

    client.close()
    return str(topic_id)


if __name__ == "__main__":
    print("[*] Creating HCS topics on Hedera testnet...")
    print()

    # Create Morpheme topic
    print("[1/2] Creating Morpheme-X primary topic...")
    topic_1 = create_topic(
        "AMX Morpheme-X Log – All pipeline decisions sealed here")
    print(f"     ✓ HCS_TOPIC_ID={topic_1}")
    print()

    # Create Sentinel topic
    print("[2/2] Creating Sentinel anomaly topic...")
    topic_2 = create_topic("AMX Sentinel – Anomaly alerts and slashing events")
    print(f"     ✓ HCS_SENTINEL_TOPIC_ID={topic_2}")
    print()

    # Print .env update instructions
    print("[+] Update your backend/.env with:")
    print()
    print(f"    HCS_TOPIC_ID={topic_1}")
    print(f"    HCS_SENTINEL_TOPIC_ID={topic_2}")
    print(f"    SIMULATE_HCS=false")
    print()
    print("[✓] Topics created! Now update .env and restart the backend.")
