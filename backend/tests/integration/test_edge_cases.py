"""Edge case and error handling tests for AMX API"""
import asyncio
import pytest
import httpx

BASE_URL = "http://localhost:8000"


class TestInputValidation:
    """Test API input validation and boundary conditions"""

    @pytest.mark.asyncio
    async def test_analyze_valid_risk_zero(self):
        """Test analyze with risk = 0 (minimum valid value)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": 0.0, "scenario": "normal"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["ok"] is True
            assert "state" in data

    @pytest.mark.asyncio
    async def test_analyze_valid_risk_one(self):
        """Test analyze with risk = 1 (maximum valid value)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": 1.0, "scenario": "normal"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["ok"] is True

    @pytest.mark.asyncio
    async def test_analyze_risk_over_one_invalid(self):
        """Test analyze with risk > 1 (should be rejected)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": 1.5, "scenario": "normal"}
            )
            assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_analyze_risk_negative_invalid(self):
        """Test analyze with risk < 0 (should be rejected)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": -0.1, "scenario": "normal"}
            )
            assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_analyze_missing_risk_field(self):
        """Test analyze without risk field (required)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"scenario": "normal"}
            )
            assert response.status_code == 422  # Validation error


class TestEnvironmentHandling:
    """Test how API handles missing/empty environment variables"""

    @pytest.mark.asyncio
    async def test_status_endpoint_available(self):
        """Test that status endpoint is available"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.get("/api/status")
            assert response.status_code == 200
            data = response.json()
            assert "version" in data
            # Should gracefully handle missing OPENWEATHER_API_KEY
            assert "network" in data

    @pytest.mark.asyncio
    async def test_weather_graceful_fallback(self):
        """Test that weather API gracefully falls back when key is missing"""
        # With SIMULATE_HCS=true and no API key, should use simulation
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": 0.5, "scenario": "normal"}
            )
            assert response.status_code == 200
            data = response.json()
            # Should still complete successfully without API key
            assert data["ok"] is True
            assert "outbreak_risk" in data["state"]


class TestConcurrency:
    """Test concurrent request handling"""

    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test that concurrent requests don't corrupt global state"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            # Send multiple concurrent requests
            tasks = []
            for risk_val in [0.3, 0.5, 0.7, 0.2, 0.9]:
                task = client.post(
                    "/api/analyze",
                    json={"risk": risk_val, "scenario": "normal"}
                )
                tasks.append(task)

            # Execute concurrently
            responses = await asyncio.gather(*tasks)

            # All should succeed
            for response in responses:
                assert response.status_code == 200
                assert response.json()["ok"] is True


class TestErrorRecovery:
    """Test API error handling and recovery"""

    @pytest.mark.asyncio
    async def test_analyze_invalid_scenario(self):
        """Test analyze with invalid scenario value (should have default)"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            response = await client.post(
                "/api/analyze",
                json={"risk": 0.5, "scenario": "invalid_scenario"}
            )
            # Should still process (scenario has a default)
            assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_sentinel_state_independence(self):
        """Test that sentinel state doesn't corrupt across requests"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            # Request 1: Normal risk
            r1 = await client.post(
                "/api/analyze",
                json={"risk": 0.5, "scenario": "normal"}
            )
            assert r1.status_code == 200
            data1 = r1.json()

            # Request 2: Different risk
            r2 = await client.post(
                "/api/analyze",
                json={"risk": 0.3, "scenario": "normal"}
            )
            assert r2.status_code == 200
            data2 = r2.json()

            # Each should be independent (no shared state corruption)
            assert data1["state"]["risk"] != data2["state"]["risk"]


# Import asyncio for concurrent tests
