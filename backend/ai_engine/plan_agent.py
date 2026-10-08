"""
AI Agent: Plan Agent
Alias / Specialized interface to PlanExplainAgent focusing on maintenance scheduling and work order generation.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
from ai_engine.plan_explain_agent import PlanExplainAgent

class PlanAgent(PlanExplainAgent):
    """
    Plan Agent: Specializes in translating diagnosed degradation and RUL
    into proactive maintenance actions, scheduling horizons, and approval workflows.
    """
    
    def generate_work_order(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a detailed maintenance work order based on the evaluation result.
        """
        planning_data = evaluation_result.get("planning", {})
        health_data = evaluation_result.get("health", {})
        neurosymbolic_data = evaluation_result.get("neurosymbolic", {})
        
        priority = planning_data.get("priority", "P4_NOMINAL")
        target_action = planning_data.get("target_action", "No action required")
        
        # Calculate schedule horizon
        rul_days = neurosymbolic_data.get("rul_days", 90.0)
        
        if priority == "P1_IMMEDIATE_ACTION":
            schedule_date = datetime.now() + timedelta(days=1)
            sla_hours = 24
        elif priority == "P2_URGENT":
            schedule_date = datetime.now() + timedelta(days=3)
            sla_hours = 72
        elif priority == "P3_SCHEDULED":
            schedule_date = datetime.now() + timedelta(days=max(7, int(rul_days / 2)))
            sla_hours = 168
        else:
            schedule_date = datetime.now() + timedelta(days=90)
            sla_hours = 2160

        work_order = {
            "work_order_id": f"WO-{self.asset_type}-{datetime.now().strftime('%Y%m%d%H%M')}",
            "asset_type": self.asset_type,
            "status": planning_data.get("approval_status", "OPEN"),
            "priority": priority,
            "scheduled_date": schedule_date.isoformat(),
            "sla_deadline_hours": sla_hours,
            "tasks": [
                target_action,
                "Perform standard safety checks",
                "Verify sensor calibration post-maintenance"
            ],
            "required_parts": self._estimate_required_parts(neurosymbolic_data.get("root_cause", "")),
            "estimated_labor_hours": self._estimate_labor_hours(priority)
        }
        
        return work_order
        
    def _estimate_required_parts(self, root_cause: str) -> List[str]:
        cause_lower = root_cause.lower()
        parts = []
        if "bearing" in cause_lower or "friction" in cause_lower:
            parts.extend(["Replacement Bearings", "Lubricant"])
        if "leak" in cause_lower or "pressure" in cause_lower:
            parts.extend(["Seal Kit", "O-Rings"])
        if "temp" in cause_lower or "heat" in cause_lower:
            parts.extend(["Thermal Paste", "Coolant"])
        if "electrical" in cause_lower or "current" in cause_lower:
            parts.extend(["Fuses", "Wiring Harness"])
            
        if not parts:
            parts.append("Standard Maintenance Kit")
            
        return parts
        
    def _estimate_labor_hours(self, priority: str) -> float:
        if priority == "P1_IMMEDIATE_ACTION":
            return 8.0
        elif priority == "P2_URGENT":
            return 4.0
        elif priority == "P3_SCHEDULED":
            return 2.5
        return 1.0
