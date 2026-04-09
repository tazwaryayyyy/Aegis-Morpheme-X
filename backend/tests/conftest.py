"""
AMX Protocol – pytest configuration
Sets up PYTHONPATH and required environment variables for all test suites.
"""
import os
import sys
import time
from pathlib import Path
from subprocess import Popen, PIPE
import socket

import pytest

# Ensure backend/ is on sys.path so imports like `from agents.graph import ...` work
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Force simulation mode so no real Hedera API calls are made during tests
os.environ.setdefault("SIMULATE_HCS", "true")
os.environ.setdefault("HEDERA_NETWORK", "testnet")
os.environ.setdefault("HEDERA_ACCOUNT_ID", "0.0.0000000")
os.environ.setdefault("HEDERA_PRIVATE_KEY",
                      "302e020100300506032b657004220420aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
os.environ.setdefault("HCS_TOPIC_ID", "0.0.0000001")
os.environ.setdefault("HCS_SENTINEL_TOPIC_ID", "0.0.0000002")
os.environ.setdefault("HTS_TOKEN_ID", "0.0.0000003")
os.environ.setdefault("OPENWEATHER_API_KEY", "")
os.environ.setdefault("WEATHER_CITY", "Dhaka")
os.environ.setdefault("LOG_LEVEL", "WARNING")


def is_port_open(host: str = "localhost", port: int = 8000, timeout: float = 1.0) -> bool:
    """Check if a port is open (server is listening)."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except (OSError, socket.error):
        return False


@pytest.fixture(scope="session", autouse=True)
def start_api_server():
    """Start the FastAPI server for integration tests."""
    # Check if server is already running
    if is_port_open("localhost", 8000, timeout=0.5):
        print("FastAPI server already running on port 8000")
        yield
        return

    print("Starting FastAPI server on port 8000...")

    # Start the server in a subprocess
    server_backend_dir = Path(__file__).parent.parent

    # Use python -m uvicorn to start the server
    server_process = Popen(
        [sys.executable, "-m", "uvicorn", "main:app",
            "--host", "0.0.0.0", "--port", "8000"],
        cwd=str(server_backend_dir),
        stdout=PIPE,
        stderr=PIPE,
    )

    # Wait for server to be ready (up to 30 seconds)
    start_time = time.time()
    while time.time() - start_time < 30:
        if is_port_open("localhost", 8000, timeout=1.0):
            print("FastAPI server is ready!")
            break
        time.sleep(0.5)
    else:
        server_process.terminate()
        raise RuntimeError("FastAPI server did not start within 30 seconds")

    yield

    # Cleanup: terminate the server
    print("Stopping FastAPI server...")
    server_process.terminate()
    try:
        server_process.wait(timeout=5)
    except (OSError, TimeoutError):
        server_process.kill()
        server_process.wait()
