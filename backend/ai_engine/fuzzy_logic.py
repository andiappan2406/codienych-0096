def fuzzy_membership(x, a, b, c, d):
    """Trapezoidal membership function"""
    if x <= a or x >= d: return 0.0
    if a < x < b: return (x - a) / (b - a)
    if b <= x <= c: return 1.0
    if c < x < d: return (d - x) / (d - c)
    return 0.0

def calculate_fuzzy_health(anomaly_score, fail_prob, rul):
    # RUL memberships (Days)
    rul_short = fuzzy_membership(rul, -10, 0, 7, 15)
    rul_med = fuzzy_membership(rul, 10, 15, 25, 40)
    rul_long = fuzzy_membership(rul, 30, 45, 100, 200)

    # Fail Prob memberships (0-1)
    fail_low = fuzzy_membership(fail_prob, -0.1, 0.0, 0.2, 0.4)
    fail_med = fuzzy_membership(fail_prob, 0.2, 0.4, 0.6, 0.8)
    fail_high = fuzzy_membership(fail_prob, 0.6, 0.8, 1.0, 1.1)
    
    # Anomaly membership (-1 to 1 mostly)
    anomaly_high = fuzzy_membership(anomaly_score, -5.0, -1.0, -0.1, 0.0) # Negative score = anomaly

    # Fuzzy Rules (Sugeno-style inference)
    w1 = min(rul_long, fail_low)
    w2 = min(rul_med, max(fail_low, fail_med))
    w3 = max(min(rul_med, fail_med), min(rul_med, anomaly_high))
    w4 = max(rul_short, fail_high, anomaly_high)

    total_weight = w1 + w2 + w3 + w4
    if total_weight == 0:
        health_score = 50 # Fallback
    else:
        health_score = (w1*100 + w2*80 + w3*50 + w4*15) / total_weight

    # Determine Fuzzy State
    if health_score >= 85:
        state = "Normal"
    elif health_score >= 65:
        state = "Elevated"
    elif health_score >= 35:
        state = "High"
    else:
        state = "Critical"
        
    return max(0, min(100, int(health_score))), state
