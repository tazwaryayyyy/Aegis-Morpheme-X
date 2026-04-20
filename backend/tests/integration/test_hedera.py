import os
from hedera.hcs import submit_morpheme


def test_morpheme_submission_simulation():
    """Submit a morpheme in simulation mode — must return confirmed tx with no explorer link."""
    os.environ["SIMULATE_HCS"] = "true"

    morpheme = {"test": "data", "risk": 0.85}
    result = submit_morpheme(morpheme)

    assert "hedera_tx_id" in result
    assert result["confirmed"] is True
    assert result["is_simulated"] is True
    # BUGFIX: Simulated transactions have no explorer_url to prevent broken links
    assert result["explorer_url"] is None


def test_morpheme_submission_fallback():
    """Force real mode without credentials/SDK — must fall back gracefully."""
    os.environ["SIMULATE_HCS"] = "false"

    morpheme = {"test": "fallback-test", "risk": 0.85}
    result = submit_morpheme(morpheme)

    # Without the hedera SDK or credentials, fallback path activates
    assert "hedera_tx_id" in result
    assert result["hedera_tx_id"].startswith("FALLBACK_")
    assert result["fallback"] is True
    assert result["confirmed"] is False

    # Reset to simulation for subsequent tests
    os.environ["SIMULATE_HCS"] = "true"
