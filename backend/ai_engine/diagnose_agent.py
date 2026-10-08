import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from typing import Dict, Any

class DiagnoseAgent:
    """
    AI Agent 2: Fault Diagnostic & Failure Risk Agent
    -------------------------------------------------
    Role: Classifies equipment degradation risk, failure likelihood, and identifies primary risk vectors.
    Model: HistGradientBoostingClassifier Pipeline.
    """
    def __init__(self, asset_type: str = "PUMP"):
        self.asset_type = asset_type.upper()
        self.pipeline = make_pipeline(
            StandardScaler(),
            HistGradientBoostingClassifier(random_state=42, l2_regularization=0.1)
        )
        self.is_trained = False

    def fit(self, X_train: pd.DataFrame, y_train: np.ndarray):
        """Train the classifier on degradation/failure states."""
        self.pipeline.fit(X_train, y_train)
        self.is_trained = True
        return self

    def diagnose(self, live_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluate live telemetry for failure probability and determine leading symptom indicators.
        """
        if not self.is_trained:
            raise RuntimeError(f"DiagnoseAgent for {self.asset_type} is not trained yet.")

        probs = self.pipeline.predict_proba(live_features)[0]
        failure_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        predicted_class = int(self.pipeline.predict(live_features)[0])

        # Risk classification
        if failure_prob >= 0.75:
            risk_level = "CRITICAL_RISK"
        elif failure_prob >= 0.45:
            risk_level = "ELEVATED_RISK"
        elif failure_prob >= 0.20:
            risk_level = "WATCH_RISK"
        else:
            risk_level = "HEALTHY"

        row = live_features.iloc[0]
        # Identify dominant symptom
        symptoms = []
        if 'vibration' in row and row['vibration'] > 3.5:
            symptoms.append("Excessive Vibration")
        if 'temperature' in row and row['temperature'] > 60:
            symptoms.append("Overheating")
        if 'current' in row and row['current'] > 25:
            symptoms.append("High Current Draw")
        if 'pressure' in row and (row['pressure'] < 40 or row['pressure'] > 90):
            symptoms.append("Abnormal Pressure")

        return {
            "agent": "DiagnoseAgent",
            "asset_type": self.asset_type,
            "failure_probability": round(failure_prob * 100, 1),
            "failure_class": predicted_class,
            "risk_level": risk_level,
            "detected_symptoms": symptoms if symptoms else ["Normal Sensor Profile"]
        }
