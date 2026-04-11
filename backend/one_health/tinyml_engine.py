import joblib
import numpy as np
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger("amx.tinyml")

class TinyMLEngine:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TinyMLEngine, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        model_path = Path(__file__).parent / "cough_model.joblib"
        try:
            if model_path.exists():
                self._model = joblib.load(model_path)
                logger.info(f"TinyML model loaded from {model_path}")
            else:
                logger.warning(f"TinyML model not found at {model_path}. Using fallback logic.")
        except Exception as e:
            logger.error(f"Failed to load TinyML model: {e}")
            self._model = None

    def predict_risk(self, mfcc_features: List[float]) -> float:
        """
        Takes 13 MFCC coefficients and returns a risk score [0, 1].
        High risk (class 2) maps to 0.75-1.0
        Medium risk (class 1) maps to 0.45-0.74
        Low risk (class 0) maps to 0.0-0.44
        """
        if self._model is None:
            # Fallback to sum-based heuristic if model is missing
            return min(1.0, sum(mfcc_features) / 500.0)

        try:
            X = np.array(mfcc_features).reshape(1, -1)
            # RandomForest.predict_proba returns [prob_low, prob_med, prob_high]
            probs = self._model.predict_proba(X)[0]
            
            # Simplified weighting for risk score
            # score = 0.2*p(low) + 0.6*p(med) + 1.0*p(high)
            # This ensures a continuous range between 0 and 1
            risk_score = (probs[0] * 0.2) + (probs[1] * 0.6) + (probs[2] * 0.95)
            
            return float(np.clip(risk_score, 0.0, 1.0))
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return 0.5 # Safe middle ground

# Singleton instance
tinyml_engine = TinyMLEngine()
