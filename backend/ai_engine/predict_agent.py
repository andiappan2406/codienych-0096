import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from typing import Dict, Any

class PredictAgent:
    """
    AI Agent 3: Predictive RUL (Remaining Useful Life) Regressor Agent
    ------------------------------------------------------------------
    Role: Estimates Remaining Useful Life (RUL in days) and projected degradation timeline.
    Model: HistGradientBoostingRegressor Pipeline with degradation velocity forecasting.
    """
    def __init__(self, asset_type: str = "PUMP"):
        self.asset_type = asset_type.upper()
        self.pipeline = make_pipeline(
            StandardScaler(),
            HistGradientBoostingRegressor(random_state=42, l2_regularization=0.1)
        )
        self.is_trained = False

    def fit(self, X_train: pd.DataFrame, y_rul_train: np.ndarray):
        """Train the regressor on historical degradation trajectories to target RUL in days."""
        self.pipeline.fit(X_train, y_rul_train)
        self.is_trained = True
        return self

    def predict_rul(self, live_features: pd.DataFrame) -> Dict[str, Any]:
        """
        Estimate remaining useful life days and maintenance urgency.
        """
        if not self.is_trained:
            raise RuntimeError(f"PredictAgent for {self.asset_type} is not trained yet.")

        rul_pred = float(self.pipeline.predict(live_features)[0])
        rul_days = max(0.0, round(rul_pred, 1))

        # Maintenance horizon
        if rul_days <= 7.0:
            horizon = "IMMEDIATE_ACTION_REQUIRED"
            urgency_days = max(1, int(rul_days))
        elif rul_days <= 20.0:
            horizon = "SHORT_TERM_SCHEDULE"
            urgency_days = int(rul_days)
        elif rul_days <= 45.0:
            horizon = "MEDIUM_TERM_MAINTENANCE"
            urgency_days = int(rul_days)
        else:
            horizon = "LONG_TERM_OPTIMAL"
            urgency_days = int(rul_days)

        return {
            "agent": "PredictAgent",
            "asset_type": self.asset_type,
            "rul_days": rul_days,
            "maintenance_horizon": horizon,
            "recommended_action_within_days": urgency_days
        }
