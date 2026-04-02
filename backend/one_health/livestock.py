"""
AMX Protocol – One Health Livestock Risk Feed
Reads livestock disease surveillance data from a CSV file.
Used to compute zoonotic spillover risk for the Epidemiology agent.
"""

import csv
import logging
import os
import random
import time
from pathlib import Path

logger = logging.getLogger("amx.one_health.livestock")

CSV_PATH = Path(__file__).parent / "livestock_data.csv"

_cache: dict = {"timestamp": 0, "risk": 0.25}
CACHE_TTL_SECONDS = 600


def _simulate_livestock_risk() -> float:
    """Simulate a realistic livestock disease risk score."""
    base = 0.25
    noise = random.uniform(-0.1, 0.15)
    return round(max(0.0, min(1.0, base + noise)), 4)


def _parse_csv_risk() -> float:
    """
    Parse livestock_data.csv to compute average disease prevalence risk.
    CSV columns: region, species, disease, prevalence_pct, report_date
    """
    if not CSV_PATH.exists():
        return _simulate_livestock_risk()

    risks = []
    try:
        with open(CSV_PATH, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                prevalence = float(row.get("prevalence_pct", 0)) / 100.0
                risks.append(prevalence)
    except Exception as e:
        logger.warning(f"[Livestock] CSV parse error: {e}")
        return _simulate_livestock_risk()

    if not risks:
        return _simulate_livestock_risk()

    avg = sum(risks) / len(risks)
    return round(min(1.0, avg), 4)


def get_livestock_risk() -> float:
    """Return livestock disease spillover risk (cached)."""
    now = time.time()
    if now - _cache["timestamp"] < CACHE_TTL_SECONDS:
        return _cache["risk"]

    risk = _parse_csv_risk()
    _cache.update({"timestamp": now, "risk": risk})
    logger.debug(f"[Livestock] Risk: {risk}")
    return risk
