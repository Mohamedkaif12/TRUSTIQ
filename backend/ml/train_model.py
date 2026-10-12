"""
TRUSTIQ — Random Forest Model Training Pipeline
Trains a calibrated RandomForestClassifier on the transparent training dataset.
Generates genuine performance metrics and persists model + feature schema.
"""

import os
import sys
import json
import csv
from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from ml.feature_extractor import FEATURE_SCHEMA, extract_features, feature_dict_to_vector

def train_trustiq_model(data_path: str = None, model_dir: str = None) -> dict:
    base_dir = Path(__file__).resolve().parent.parent.parent
    if not data_path:
        data_path = str(base_dir / "data" / "training_data.csv")
    if not model_dir:
        model_dir = str(Path(__file__).resolve().parent / "model")

    os.makedirs(model_dir, exist_ok=True)

    print(f"[*] Loading training dataset from: {data_path}")
    X = []
    y = []

    with open(data_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            text = row.get("text", "")
            sender = row.get("sender", "")
            risk_class = row.get("risk_class", "").strip().upper()
            if not risk_class:
                continue

            feats = extract_features(text, sender)
            vec = feature_dict_to_vector(feats)
            X.append(vec)
            y.append(risk_class)

    X = np.array(X)
    y = np.array(y)
    print(f"[*] Loaded {len(X)} samples with {X.shape[1]} features.")
    classes, counts = np.unique(y, return_counts=True)
    for c, cnt in zip(classes, counts):
        print(f"    - {c}: {cnt} samples")

    # Train / Test split with fixed random_state as required
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    print(f"[*] Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # Instantiate model with exact hyperparams specified
    clf = RandomForestClassifier(
        n_estimators=150,
        random_state=42,
        class_weight="balanced"
    )

    print("[*] Training RandomForestClassifier (n_estimators=150, balanced)...")
    clf.fit(X_train, y_train)

    # Evaluate on holdout test set
    y_pred = clf.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    precision_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    recall_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    # Feature importances
    importances = {
        name: float(round(imp, 4))
        for name, imp in zip(FEATURE_SCHEMA, clf.feature_importances_)
    }
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)

    metrics = {
        "accuracy": round(accuracy, 4),
        "precision_macro": round(precision_macro, 4),
        "recall_macro": round(recall_macro, 4),
        "f1_macro": round(f1_macro, 4),
        "f1_weighted": round(f1_weighted, 4),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "total_samples": len(X),
        "classes": list(clf.classes_),
        "top_predictive_features": sorted_importances[:7],
        "detailed_report": report
    }

    print("\n[+] Real Evaluation Metrics on Holdout Test Set:")
    print(f"    Accuracy:        {accuracy * 100:.2f}%")
    print(f"    Macro Precision: {precision_macro * 100:.2f}%")
    print(f"    Macro Recall:    {recall_macro * 100:.2f}%")
    print(f"    Macro F1-Score:  {f1_macro * 100:.2f}%")
    print(f"    Top Feature:     {sorted_importances[0][0]} ({sorted_importances[0][1]:.4f})")

    # Persist model
    model_path = os.path.join(model_dir, "trustiq_random_forest.joblib")
    joblib.dump(clf, model_path)
    print(f"[+] Model saved to: {model_path}")

    # Persist feature schema
    schema_path = os.path.join(model_dir, "feature_schema.json")
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump({
            "features": FEATURE_SCHEMA,
            "classes": list(clf.classes_),
            "n_features": len(FEATURE_SCHEMA),
            "algorithm": "RandomForestClassifier",
            "n_estimators": 150
        }, f, indent=2)
    print(f"[+] Feature schema saved to: {schema_path}")

    # Persist metrics
    metrics_path = os.path.join(model_dir, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"[+] Metrics saved to: {metrics_path}")

    return metrics

if __name__ == "__main__":
    train_trustiq_model()
