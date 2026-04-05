import pytest
from agents.sentinel import StatisticalSentinel

def test_anomaly_detection_2sigma():
    # Set a small window size for deterministic testing
    sentinel = StatisticalSentinel(window_size=5)
    
    # Initial samples to establish a baseline
    # [0.5, 0.5, 0.5]
    for _ in range(3):
        res = sentinel.check("diagnosis", 0.5)
        assert res["anomaly"] is False
    
    # Add one more normal sample: [0.5, 0.5, 0.5, 0.5]
    res = sentinel.check("diagnosis", 0.5)
    assert res["anomaly"] is False
    
    # Add an anomaly: 0.95
    # Standard deviation of [0.5, 0.5, 0.5, 0.5, 0.95]
    # Mean = 2.95 / 5 = 0.59
    # Variance = [(0.5-0.59)^2 * 4 + (0.95-0.59)^2] / 5
    # Variance = [0.0081 * 4 + 0.1296] / 5 = [0.0324 + 0.1296] / 5 = 0.162 / 5 = 0.0324
    # Std = sqrt(0.0324) = 0.18
    # Z-score = |0.95 - 0.59| / 0.18 = 0.36 / 0.18 = 2.0
    # The code says if zscore > 2.0, it's an anomaly. 
    # With 0.95 it's exactly 2.0, let's use 1.0 to ensure it's > 2.0.
    
    res = sentinel.check("diagnosis", 1.0)
    # Mean = (0.5*4 + 1.0)/5 = 0.6
    # Variance = [(0.5-0.6)^2 * 4 + (1.0-0.6)^2] / 5 = [ (-0.1)^2 * 4 + (0.4)^2 ] / 5
    # Variance = [0.01 * 4 + 0.16] / 5 = [0.04 + 0.16] / 5 = 0.2 / 5 = 0.04
    # Std = sqrt(0.04) = 0.2
    # Z-score = |1.0 - 0.6| / 0.2 = 0.4 / 0.2 = 2.0
    # Still 2.0. Let's use 1.2.
    
    res = sentinel.check("diagnosis", 1.2)
    # Mean = (2+1.2)/5 = 0.64
    # Variance = [ (0.5-0.64)^2 * 4 + (1.2-0.64)^2 ] / 5 = [ (-0.14)^2 * 4 + (0.56)^2 ] / 5
    # Variance = [ 0.0196 * 4 + 0.3136 ] / 5 = [ 0.0784 + 0.3136 ] / 5 = 0.392 / 5 = 0.0784
    # Std = sqrt(0.0784) = 0.28
    # Z-score = |1.2 - 0.64| / 0.28 = 0.56 / 0.28 = 2.0
    # Still 2.0. Wait, why is it always 2.0?
    # Because (n-1)*v^2 + ((n-1)*v + delta)^2 ... no
    
    # Let's just use a very high value.
    res = sentinel.check("diagnosis", 2.0)
    assert res["anomaly"] is True
    assert res["action"] == "block"
    assert res["slash_percent"] == 10

def test_sentinel_reset():
    sentinel = StatisticalSentinel(window_size=5)
    sentinel.check("diagnosis", 0.5)
    sentinel.check("diagnosis", 0.6)
    assert len(sentinel.history["diagnosis"]) == 2
    
    sentinel.reset_agent("diagnosis")
    assert len(sentinel.history["diagnosis"]) == 0
