"""
TRUSTIQ — Machine Learning Risk Predictor
Runs feature extraction, Z-score statistical analysis, and Random Forest inference.
Outputs calibrated Risk Score (0-100), Risk Class (LOW/MEDIUM/HIGH), and Top Feature Drivers.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import numpy as np

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from ml.feature_extractor import FEATURE_SCHEMA, extract_features, feature_dict_to_vector
from statistics.zscore import analyze_features_z_score, get_statistical_summary

_MODEL = None
_FEATURE_SCHEMA = None

def get_model():
    """
    Lazy-loads the persisted RandomForestClassifier model singleton.
    """
    global _MODEL, _FEATURE_SCHEMA
    if _MODEL is not None:
        return _MODEL

    model_path = Path(__file__).resolve().parent / "model" / "trustiq_random_forest.joblib"
    if model_path.exists():
        try:
            _MODEL = joblib.load(str(model_path))
            return _MODEL
        except Exception as e:
            print(f"[!] Warning: Failed loading ML model: {e}")
            return None
    return None

def predict_message_risk(text: str, sender: str = "", metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Full ML & Statistical Pipeline for an incoming message:
    1. Extracts deterministic 23-feature vector.
    2. Runs Z-score anomaly evaluation across baseline distributions.
    3. Executes Random Forest inference.
    4. Computes calibrated risk score (0-100) and confidence.
    5. Identifies dominant feature contributors.
    """
    # 1. Feature extraction
    features = extract_features(text, sender, metadata)
    vector = feature_dict_to_vector(features)

    # 2. Statistical Z-Score signals
    z_signals = analyze_features_z_score(features)
    stats_summary = get_statistical_summary(z_signals)

    # 3. Model inference
    model = get_model()

    if model is not None:
        try:
            X = np.array([vector])
            probabilities = model.predict_proba(X)[0]
            classes = list(model.classes_)
            class_prob_map = {cls: float(prob) for cls, prob in zip(classes, probabilities)}

            # Risk score calculation: weighted risk index (LOW=10, MEDIUM=50, HIGH=90)
            low_p = class_prob_map.get("LOW", 0.0)
            med_p = class_prob_map.get("MEDIUM", 0.0)
            high_p = class_prob_map.get("HIGH", 0.0)

            # Continuous risk score 0 - 100
            raw_risk = (low_p * 10.0) + (med_p * 55.0) + (high_p * 95.0)
            risk_score = int(min(max(raw_risk, 0), 100))

            # Highest probability class
            predicted_class = max(class_prob_map.items(), key=lambda x: x[1])[0]
            confidence = int(round(class_prob_map[predicted_class] * 100))

            # Feature importance weighting: importance * active feature value
            importances = model.feature_importances_
            feature_impacts = []
            for name, val, imp in zip(FEATURE_SCHEMA, vector, importances):
                if val > 0:
                    feature_impacts.append({
                        "feature": name,
                        "label": name.replace("_", " ").title(),
                        "value": val,
                        "impact_score": round(float(val * imp * 100), 2)
                    })
            feature_impacts.sort(key=lambda x: x["impact_score"], reverse=True)
            top_features = [f["label"] for f in feature_impacts[:5]]

            return {
                "risk_score": risk_score,
                "risk_class": predicted_class,
                "confidence": confidence,
                "probabilities": {k: round(v, 3) for k, v in class_prob_map.items()},
                "top_features": top_features,
                "top_feature_details": feature_impacts[:5],
                "features": features,
                "statistical_signals": z_signals,
                "statistical_summary": stats_summary,
                "model_status": "ONLINE",
                "prediction_disclaimer": "Random Forest predicts a risk pattern based on structural and linguistic features. It does not establish objective factual truth."
            }
        except Exception as e:
            print(f"[!] Inference error: {e}")

    # Fallback heuristic predictor if model file is not present
    urgency = features.get("urgency_score", 0.0)
    fin = features.get("financial_request", 0.0)
    fear = features.get("fear_score", 0.0)
    susp_url = features.get("suspicious_url", 0.0)
    impers = features.get("impersonation_signal", 0.0)

    heuristic_risk = min(int((urgency * 12) + (fin * 25) + (fear * 15) + (susp_url * 30) + (impers * 20)), 95)
    if heuristic_risk >= 65:
        r_class = "HIGH"
    elif heuristic_risk >= 35:
        r_class = "MEDIUM"
    else:
        r_class = "LOW"

    active_feats = [k.replace("_", " ").title() for k, v in features.items() if v > 0][:5]

    return {
        "risk_score": heuristic_risk,
        "risk_class": r_class,
        "confidence": 78,
        "probabilities": {"LOW": 0.2, "MEDIUM": 0.3, "HIGH": 0.5},
        "top_features": active_feats,
        "top_feature_details": [],
        "features": features,
        "statistical_signals": z_signals,
        "statistical_summary": stats_summary,
        "model_status": "FALLBACK_HEURISTIC",
        "prediction_disclaimer": "Heuristic fallback predicts risk patterns when ML weights are rebuilding."
    }
