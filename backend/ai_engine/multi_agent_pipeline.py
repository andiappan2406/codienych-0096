import pandas as pd
from typing import Dict, Any
from ai_engine.watch_agent import WatchAgent
from ai_engine.diagnose_agent import DiagnoseAgent
from ai_engine.predict_agent import PredictAgent
from ai_engine.plan_explain_agent import PlanExplainAgent
from ai_engine.ml_models import generate_training_data

class MultiAgentPipeline:
    """
    Orchestrator for the 4 Autonomous AI Maintenance Agents:
    1. WatchAgent: Anomaly & Baseline Monitoring
    2. DiagnoseAgent: Fault Risk & Probability Classification
    3. PredictAgent: Remaining Useful Life (RUL) Regressor
    4. PlanExplainAgent: Fuzzy Health & Neuro-Symbolic Root-Cause Planner
    """
    def __init__(self, asset_types=None):
        if asset_types is None:
            asset_types = ['PUMP', 'HVAC', 'ELEVATOR', 'GENERATOR', 'CHILLER']
        self.asset_types = asset_types
        self.agents: Dict[str, Dict[str, Any]] = {}
        self._init_agents()

    def _init_agents(self):
        for atype in self.asset_types:
            self.agents[atype] = {
                'watch': WatchAgent(atype),
                'diagnose': DiagnoseAgent(atype),
                'predict': PredictAgent(atype),
                'plan_explain': PlanExplainAgent(atype)
            }

    def train_all(self, n_samples: int = 2000):
        """Train all 4 individual AI agents across all supported asset types."""
        print(f"--> Initializing and training 4-Agent Pipeline across {len(self.asset_types)} asset classes...")
        for atype in self.asset_types:
            X_train, y_fail_train, y_rul_train = generate_training_data(atype, n_samples=n_samples)
            
            # Agent 1: Watch
            self.agents[atype]['watch'].fit(X_train)
            # Agent 2: Diagnose
            self.agents[atype]['diagnose'].fit(X_train, y_fail_train)
            # Agent 3: Predict
            self.agents[atype]['predict'].fit(X_train, y_rul_train)
            
        print("--> All 4 AI Agents trained and ready for inference.")
        return self

    def process(self, asset_type: str, sensor_dict: Dict[str, float]) -> Dict[str, Any]:
        """
        Execute sequential inference across all 4 AI agents for an asset.
        """
        atype = asset_type.upper()
        if atype not in self.agents:
            atype = 'PUMP'

        asset_agents = self.agents[atype]
        df_live = pd.DataFrame([sensor_dict])

        # Stage 1: Watch Agent (Anomaly Detection)
        watch_out = asset_agents['watch'].inspect(df_live)

        # Stage 2: Diagnose Agent (Failure Risk)
        diagnose_out = asset_agents['diagnose'].diagnose(df_live)

        # Stage 3: Predict Agent (RUL Estimation)
        predict_out = asset_agents['predict'].predict_rul(df_live)

        # Stage 4: Plan & Explain Agent (Neuro-Symbolic & Fuzzy Logic)
        plan_explain_out = asset_agents['plan_explain'].evaluate_and_plan(
            sensors=sensor_dict,
            watch_result=watch_out,
            diagnose_result=diagnose_out,
            predict_result=predict_out
        )

        return {
            "asset_type": atype,
            "sensors": {k: round(float(v), 2) for k, v in sensor_dict.items()},
            "predictions": {
                "is_anomaly": watch_out["is_anomaly"],
                "anomaly_score": watch_out["anomaly_score"],
                "failure_probability": diagnose_out["failure_probability"],
                "rul_days": predict_out["rul_days"]
            },
            "health": plan_explain_out["health"],
            "neurosymbolic": plan_explain_out["neurosymbolic"],
            "agents_pipeline": {
                "watch_agent": watch_out,
                "diagnose_agent": diagnose_out,
                "predict_agent": predict_out,
                "plan_explain_agent": plan_explain_out
            }
        }
