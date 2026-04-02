"""
AMX Protocol – One Health Weather Risk Feed
Fetches temperature and humidity data from OpenWeatherMap (or simulates it).
"""

import logging
import os
import random
import time

import httpx

logger = logging.getLogger("amx.one_health.weather")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
DEFAULT_CITY = os.getenv("WEATHER_CITY", "Dhaka")
HEDERA_NETWORK = os.getenv("HEDERA_NETWORK", "testnet")

# Add validation
if not OPENWEATHER_API_KEY:
    logger.warning("[Weather] No OpenWeather API key found, using simulation mode")

# Cache to avoid hammering the API
_cache: dict = {"timestamp": 0, "risk": 0.3, "city": DEFAULT_CITY}
CACHE_TTL_SECONDS = 300  # 5 minutes

# In-memory current city (can be updated dynamically)
_current_city = DEFAULT_CITY


def _simulate_weather_risk(city: str = None) -> float:
    """Generate a realistic weather risk score (for demo) with city-specific patterns."""
    city = city or _current_city
    
    # City-specific risk profiles
    city_profiles = {
        "Dhaka": {"base": 0.65, "seasonal": 0.25, "noise": 0.15},  # High pollution, monsoon
        "Singapore": {"base": 0.25, "seasonal": 0.10, "noise": 0.08},  # Controlled environment
        "Nairobi": {"base": 0.35, "seasonal": 0.15, "noise": 0.10},  # Moderate altitude
        "Default": {"base": 0.35, "seasonal": 0.15, "noise": 0.10}
    }
    
    profile = city_profiles.get(city, city_profiles["Default"])
    hour = time.localtime().tm_hour
    seasonal = profile["seasonal"] * abs((hour - 12) / 12.0)
    noise = random.uniform(-profile["noise"], profile["noise"])
    
    risk = profile["base"] + seasonal + noise
    return round(max(0.0, min(1.0, risk)), 4)


def _compute_weather_risk(temp_c: float, humidity: float, wind_speed: float) -> float:
    """
    Compute disease transmission risk from weather parameters.
    Higher humidity + temperature range 20-30°C → higher mosquito-borne risk.
    Low temp (<10°C) + high wind → higher respiratory risk.
    """
    # Respiratory risk (cold, dry)
    resp_risk = max(0.0, (15 - temp_c) / 15.0) * 0.5

    # Vector-borne risk (warm, humid)
    if 20 <= temp_c <= 32:
        vector_risk = (humidity / 100.0) * 0.6
    else:
        vector_risk = 0.0

    combined = resp_risk + vector_risk
    return round(min(1.0, combined), 4)


def get_weather_risk(city: str = None) -> float:
    """
    Fetch weather risk for a specific city. Uses OpenWeatherMap API if key is available,
    otherwise falls back to realistic simulation with city-specific patterns.
    """
    city = city or _current_city
    now = time.time()

    # Return cached value if fresh for this city
    if now - _cache["timestamp"] < CACHE_TTL_SECONDS and _cache.get("city") == city:
        return _cache["risk"]

    if not OPENWEATHER_API_KEY:
        risk = _simulate_weather_risk(city)
        _cache.update({"timestamp": now, "risk": risk, "city": city})
        logger.debug(f"[Weather] Simulated risk for {city}: {risk}")
        return risk

    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"
        )
        response = httpx.get(url, timeout=5.0)
        data = response.json()

        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind = data["wind"]["speed"]

        risk = _compute_weather_risk(temp, humidity, wind)
        _cache.update({"timestamp": now, "risk": risk, "city": city, "raw": {"temp": temp, "humidity": humidity}})
        logger.info(f"[Weather] Live data – city={city}, temp={temp}°C, humidity={humidity}%, risk={risk}")
        return risk

    except Exception as e:
        logger.warning(f"[Weather] API call failed for {city}: {e}. Using simulation.")
        risk = _simulate_weather_risk(city)
        _cache.update({"timestamp": now, "risk": risk, "city": city})
        return risk


def set_current_city(city: str) -> dict:
    """
    Update the current city for weather risk calculations.
    Returns city configuration for frontend display.
    """
    global _current_city
    
    # City configurations for frontend
    city_configs = {
        "Dhaka": {
            "name": "Dhaka",
            "country": "Bangladesh", 
            "population": "21M",
            "aqi_avg": 162,
            "climate": "Monsoon",
            "poverty_index": 0.73,
            "base_threshold": 0.5,
            "description": "High environmental stress, urgent healthcare needs"
        },
        "Singapore": {
            "name": "Singapore",
            "country": "Singapore",
            "population": "5.9M", 
            "aqi_avg": 25,
            "climate": "Tropical",
            "poverty_index": 0.15,
            "base_threshold": 0.7,
            "description": "Advanced healthcare infrastructure, precision optimization"
        },
        "Nairobi": {
            "name": "Nairobi", 
            "country": "Kenya",
            "population": "4.4M",
            "aqi_avg": 45,
            "climate": "Highland",
            "poverty_index": 0.42,
            "base_threshold": 0.6,
            "description": "Developing infrastructure, balanced risk profile"
        }
    }
    
    _current_city = city
    config = city_configs.get(city, city_configs["Nairobi"])
    
    # Clear cache to force fresh data fetch
    _cache.update({"timestamp": 0, "city": city})
    
    logger.info(f"[Weather] City switched to: {city}")
    
    return {
        "city": city,
        "config": config,
        "weather_risk": get_weather_risk(city)
    }


def get_current_city() -> str:
    """Return the currently active city."""
    return _current_city
