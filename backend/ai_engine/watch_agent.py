import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from typing import Dict, Any, Tuple

class WatchAgent:
    """
    AI Agent 1: Watch & Anomaly Detection Agent
    -------------------------------------------
    Role: Continuous baseline monitoring and multidimensional anomaly detection.
    Model: Isolation Forest Pipeline with contextual baseline adjustment.
    """
    def __init__(self, asset_type: str = "PUMP"):
        self.asset_type = asset_type.upper()
        self.pipeline = make_pipeline(
            StandardScaler(),
            IsolationForest(contamination=0.1, random_state=42)
        )
        self.is_trained = False

    def fit(self, X_train: pd.DataFrame):
        """Train the Isolation Forest anomaly detector."""
        self.pipeline.fit(X_train)
        self.is_trained = True
        return self

    def inspect(self, live_features: pd.DataFrame, ambient_temp: float = 25.0) -> Dict[str, Any]:
        """
        Process incoming live telemetry to detect anomalies against dynamic baselines.
        """
        if not self.is_trained:
            raise RuntimeError(f"WatchAgent for {self.asset_type} is not trained yet.")

        # Anomaly score calculation
        anomaly_raw = float(self.pipeline.decision_function(live_features)[0])
        is_anomaly = bool(self.pipeline.predict(live_features)[0] == -1)

        # Severity categorization based on decision margin
        if anomaly_raw < -0.15:
            severity = "CRITICAL"
        elif anomaly_raw < -0.05 or is_anomaly:
            severity = "MODERATE"
        elif anomaly_raw < 0.05:
            severity = "LOW"
        else:
            severity = "NOMINAL"

        return {
            "agent": "WatchAgent",
            "asset_type": self.asset_type,
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_raw, 3),
            "severity": severity,
            "telemetry_snapshot": live_features.iloc[0].to_dict()
        }
