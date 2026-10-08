from typing import Dict, Any, List
from ai_engine.fuzzy_logic import calculate_fuzzy_health
from ai_engine.neurosymbolic import neurosymbolic_reasoning

class PlanExplainAgent:
    """
    AI Agent 4: Planning, Fuzzy Health & Neuro-Symbolic Explanation Agent
    ---------------------------------------------------------------------
    Role: Synthesizes probabilistic outputs from Watch, Diagnose, and Predict agents
          using Fuzzy Logic & Neuro-Symbolic rules to generate an explainable root cause,
          health index, and maintenance work order action plan.
    """
    def __init__(self, asset_type: str = "PUMP"):
        self.asset_type = asset_type.upper()

    def evaluate_and_plan(
        self,
        sensors: Dict[str, float],
        watch_result: Dict[str, Any],
        diagnose_result: Dict[str, Any],
        predict_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute multi-factor fuzzy inference and neurosymbolic domain reasoning
        to plan maintenance and generate explainable diagnostics.
        """
        anomaly_score = watch_result.get("anomaly_score", 0.0)
        failure_probability = diagnose_result.get("failure_probability", 0.0) / 100.0
        rul_days = predict_result.get("rul_days", 60.0)

        # 1. Fuzzy Logic Health Score Calculation
        health_score, fuzzy_state = calculate_fuzzy_health(anomaly_score, failure_probability, rul_days)

        # 2. Neuro-Symbolic Reasoning & Root Cause Plan
        preds_summary = {
            "is_anomaly": watch_result.get("is_anomaly", False),
            "anomaly_score": anomaly_score,
            "failure_probability": round(failure_probability * 100, 1),
            "rul_days": rul_days
        }
        ns_result = neurosymbolic_reasoning(self.asset_type, sensors, preds_summary, fuzzy_state)

        # 3. Work Order Planning & Priority
        if fuzzy_state == "Critical":
            priority = "P1_IMMEDIATE_ACTION"
            approval_status = "AWAITING_APPROVAL"
        elif fuzzy_state == "High":
            priority = "P2_URGENT"
            approval_status = "RECOMMENDED"
        elif fuzzy_state == "Elevated":
            priority = "P3_SCHEDULED"
            approval_status = "MONITORING"
        else:
            priority = "P4_NOMINAL"
            approval_status = "OPERATIONAL"

        return {
            "agent": "PlanExplainAgent",
            "asset_type": self.asset_type,
            "health": {
                "score": health_score,
                "state": fuzzy_state
            },
            "neurosymbolic": ns_result,
            "planning": {
                "priority": priority,
                "approval_status": approval_status,
                "target_action": ns_result.get("recommended_action", "Continue standard monitoring"),
                "root_cause_explanation": ns_result.get("root_cause", "Nominal Operation"),
                "reasoning_points": ns_result.get("reasoning", [])
            }
        }
