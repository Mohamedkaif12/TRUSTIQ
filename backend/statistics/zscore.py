"""
TRUSTIQ — Statistical Analysis Engine (Z-Score)
Identifies statistical abnormalities in message linguistic & behavioral features.
Formula: Z = (x - μ) / σ

Z-scores detect statistical deviation from baseline communications.
Statistical abnormality != proof of misinformation or malice.
"""

from typing import Dict, Any, List, Optional
import math

# Baseline distribution metrics (μ = mean, σ = std_dev) derived from standard communication corpus
BASELINE_DISTRIBUTIONS: Dict[str, Dict[str, float]] = {
    "urgency_score": {
        "mean": 1.8,
        "std": 1.2,
        "label": "Urgency Intensity"
    },
    "emotional_pressure": {
        "mean": 1.4,
        "std": 1.1,
        "label": "Emotional Pressure Index"
    },
    "excessive_caps": {
        "mean": 0.04,
        "std": 0.05,
        "label": "Capitalization Ratio"
    },
    "excessive_punctuation": {
        "mean": 1.1,
        "std": 1.3,
        "label": "Punctuation Density"
    },
    "financial_signals": {
        "mean": 0.35,
        "std": 0.65,
        "label": "Financial Urgency Signal"
    },
    "forced_action": {
        "mean": 0.30,
        "std": 0.60,
        "label": "Forced Action Demands"
    },
    "suspicious_signals": {
        "mean": 0.40,
        "std": 0.75,
        "label": "Aggregated Threat Indicators"
    }
}

def calculate_z_score(value: float, mean: float, std: float) -> float:
    """
    Calculates the Z-score: Z = (x - μ) / σ
    Safely handles zero or near-zero standard deviation.
    """
    if std <= 1e-6:
        return 0.0
    return round((value - mean) / std, 2)

def interpret_z_score(z_score: float) -> Dict[str, Any]:
    """
    Interprets Z-score based on deviation thresholds:
    |Z| < 1       => Normal
    1 <= |Z| < 2  => Slightly unusual
    2 <= |Z| < 3  => Unusual
    |Z| >= 3      => Highly unusual
    """
    abs_z = abs(z_score)
    if abs_z < 1.0:
        level = "NORMAL"
        interpretation = "Normal communication pattern within standard variance"
        severity = "low"
    elif abs_z < 2.0:
        level = "SLIGHTLY_UNUSUAL"
        interpretation = "Slightly unusual pattern detected; minor elevation"
        severity = "medium"
    elif abs_z < 3.0:
        level = "UNUSUAL"
        interpretation = "Unusual statistical deviation; elevated pattern"
        severity = "high"
    else:
        level = "HIGHLY_UNUSUAL"
        interpretation = "Highly unusual anomaly; extreme statistical outlier"
        severity = "critical"

    return {
        "level": level,
        "interpretation": interpretation,
        "severity": severity,
        "is_anomaly": abs_z >= 2.0
    }

def analyze_features_z_score(features: Dict[str, float], baselines: Optional[Dict[str, Dict[str, float]]] = None) -> List[Dict[str, Any]]:
    """
    Runs Z-score analysis across all mapped features against communication baselines.
    Returns structured statistical signals with interpretation.
    """
    baseline_map = baselines or BASELINE_DISTRIBUTIONS
    results = []

    for feature_name, config in baseline_map.items():
        if feature_name in features:
            val = float(features[feature_name])
            mean = config["mean"]
            std = config["std"]
            z = calculate_z_score(val, mean, std)
            interp = interpret_z_score(z)

            results.append({
                "feature": feature_name,
                "label": config.get("label", feature_name.replace("_", " ").title()),
                "value": val,
                "baseline_mean": mean,
                "baseline_std": std,
                "z_score": z,
                "level": interp["level"],
                "interpretation": interp["interpretation"],
                "severity": interp["severity"],
                "is_anomaly": interp["is_anomaly"]
            })

    return results

def get_statistical_summary(z_signals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Produces a jury-ready statistical summary.
    Emphasizes: Statistical abnormality is not proof of fraud/falsity.
    """
    anomalies = [s for s in z_signals if s["is_anomaly"]]
    max_z = max([abs(s["z_score"]) for s in z_signals], default=0.0)

    return {
        "total_signals_evaluated": len(z_signals),
        "anomalies_detected": len(anomalies),
        "max_z_score": max_z,
        "has_high_deviation": max_z >= 2.5,
        "signals": z_signals,
        "statistical_disclaimer": "Z-score identifies statistical abnormality relative to baseline distributions. It does not independently establish truth, falsity, or criminal intent."
    }
