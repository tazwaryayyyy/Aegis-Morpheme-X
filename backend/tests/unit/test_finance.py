import pytest
from agents.finance import compute_payout_threshold

@pytest.mark.parametrize("outbreak_risk, poverty_index, expected", [
    (0.9, 0.8, 0.5),   # High risk → threshold floor (0.7 - (0.9*0.3 + 0.8*0.1)) = 0.7 - 0.35 = 0.35 -> clamp to 0.5
    (0.1, 0.1, 0.66),  # Low risk → base threshold (0.7 - (0.1*0.3 + 0.1*0.1)) = 0.7 - 0.04 = 0.66
    (0.9, 0.2, 0.5),   # Mixed → (0.7 - (0.9*0.3 + 0.2*0.1)) = 0.7 - 0.29 = 0.41 -> clamp to 0.5
])
def test_adaptive_threshold(outbreak_risk, poverty_index, expected):
    threshold = compute_payout_threshold(outbreak_risk, poverty_index)
    assert threshold == pytest.approx(expected, abs=0.01)

def test_finance_agent_payout():
    from agents.finance import finance_agent
    state = {
        "risk": 0.8,
        "outbreak_risk": 0.1, # Threshold = 0.66
        "poverty_index": 0.1,
    }
    result = finance_agent(state)
    assert result["insurance_trigger"] is True
    assert result["payout_amount"] > 0
    assert result["payout_threshold"] == 0.66
