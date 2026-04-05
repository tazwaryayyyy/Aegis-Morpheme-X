import pytest
import os
from hedera.hcs import submit_morpheme

@pytest.mark.asyncio
async def test_morpheme_submission_simulation():
    # Ensure simulation is active
    os.environ["SIMULATE_HCS"] = "true"
    
    morpheme = {"test": "data", "risk": 0.85}
    result = submit_morpheme(morpheme)
    
    assert "hedera_tx_id" in result
    assert result["confirmed"] is True
    assert "explorer_url" in result
    assert "hashscan.io" in result["explorer_url"]

@pytest.mark.asyncio
async def test_morpheme_submission_fallback():
    # Force real mode without credentials/SDK to trigger fallback
    os.environ["SIMULATE_HCS"] = "false"
    
    morpheme = {"test": "fallback-test", "risk": 0.85}
    result = submit_morpheme(morpheme)
    
    # It should fallback (either due to missing SDK or missing keys)
    assert "hedera_tx_id" in result
    assert result["hedera_tx_id"].startswith("FALLBACK_")
    assert result["fallback"] is True
    assert result["confirmed"] is False
