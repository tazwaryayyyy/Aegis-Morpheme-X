"""
AMX Protocol – pytest configuration
Sets up PYTHONPATH and required environment variables for all test suites.
"""
import os
import sys
from pathlib import Path

# Ensure backend/ is on sys.path so imports like `from agents.graph import ...` work
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Force simulation mode so no real Hedera API calls are made during tests
os.environ.setdefault("SIMULATE_HCS", "true")
os.environ.setdefault("HEDERA_NETWORK", "testnet")
os.environ.setdefault("HEDERA_ACCOUNT_ID", "0.0.0000000")
os.environ.setdefault("HEDERA_PRIVATE_KEY", "302e020100300506032b657004220420aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
os.environ.setdefault("HCS_TOPIC_ID", "0.0.0000001")
os.environ.setdefault("HCS_SENTINEL_TOPIC_ID", "0.0.0000002")
os.environ.setdefault("HTS_TOKEN_ID", "0.0.0000003")
os.environ.setdefault("OPENWEATHER_API_KEY", "")
os.environ.setdefault("WEATHER_CITY", "Dhaka")
os.environ.setdefault("LOG_LEVEL", "WARNING")
