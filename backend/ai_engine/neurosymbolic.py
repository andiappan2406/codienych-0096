def neurosymbolic_reasoning(asset_type, sensors, predictions, fuzzy_state):
    """
    Combines neural outputs (predictions) with symbolic rules (domain knowledge)
    to generate explainable insights and root causes.
    """
    reasons = []
    root_cause = "Unknown"
    action = "Monitor"

    vib = sensors['vibration']
    temp = sensors['temperature']
    curr = sensors['current']
    press = sensors['pressure']
    
    if fuzzy_state in ["Critical", "High"]:
        if vib > 4.0 and temp > 60.0:
            root_cause = "Bearing Wear / Motor Degradation"
            reasons.append("High vibration and temperature indicate friction from worn bearings.")
            action = "Schedule immediate bearing inspection and lubrication."
        elif curr > 25.0 and temp > 60.0:
            root_cause = "Electrical Overload / Winding Short"
            reasons.append("Excessive current draw paired with high temperature suggests electrical stress.")
            action = "Check motor windings and power supply voltage."
        elif press < 50.0 and asset_type in ['PUMP', 'CHILLER']:
            root_cause = "Fluid Leak / Cavitation"
            reasons.append("Significant pressure drop detected in fluid system.")
            action = "Inspect seals and valves for leaks."
        else:
            root_cause = "General Mechanical Degradation"
            reasons.append("Multiple sensors deviating from normal baseline.")
            action = "Perform comprehensive diagnostic."
            
    elif fuzzy_state == "Elevated":
        root_cause = "Incipient Fault"
        reasons.append("Early stage deviations detected by AI models.")
        action = "Increase monitoring frequency and plan maintenance."
    else:
        root_cause = "Nominal Operation"
        reasons.append("All sensor readings align with expected baseline behavior.")
        action = "No action required."

    return {
        "root_cause": root_cause,
        "reasoning": reasons,
        "recommended_action": action
    }
