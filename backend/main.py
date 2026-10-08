import random
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

app = FastAPI(title="Building Doctor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# 1. Simulator & Models
# -------------------------

def generate_training_data(n_samples=2000):
    np.random.seed(42)
    # Normal data (75%)
    n_normal = int(n_samples * 0.75)
    
    # Simulate a varying base load for the machine (e.g., pump speed/demand)
    base_load = np.random.uniform(0.5, 1.0, n_normal)
    
    vib_normal = 2.0 * base_load + np.random.normal(0, 0.2, n_normal)
    temp_normal = 40.0 + (10.0 * base_load) + np.random.normal(0, 1.5, n_normal)
    curr_normal = 10.0 + (10.0 * base_load) + np.random.normal(0, 0.8, n_normal)
    press_normal = 120.0 - (5.0 * base_load) + np.random.normal(0, 3.0, n_normal)
    
    y_fail_normal = np.zeros(n_normal)
    rul_normal = np.random.uniform(40, 90, n_normal)

    # Degraded data (25%)
    n_degraded = n_samples - n_normal
    degrade_factor = np.random.uniform(0.1, 1.0, n_degraded)
    base_load_deg = np.random.uniform(0.5, 1.0, n_degraded)
    
    vib_degraded = (2.0 * base_load_deg) + (4.0 * degrade_factor) + np.random.normal(0, 0.5, n_degraded)
    temp_degraded = (40.0 + (10.0 * base_load_deg)) + (15.0 * degrade_factor) + np.random.normal(0, 2.0, n_degraded)
    curr_degraded = (10.0 + (10.0 * base_load_deg)) + (12.0 * degrade_factor) + np.random.normal(0, 1.5, n_degraded)
    press_degraded = (120.0 - (5.0 * base_load_deg)) - (25.0 * degrade_factor) + np.random.normal(0, 4.0, n_degraded)
    
    y_fail_degraded = np.ones(n_degraded)
    # RUL is inversely proportional to degradation
    rul_degraded = 35 * (1 - degrade_factor) + np.random.uniform(0, 5, n_degraded)

    X = pd.DataFrame({
        'vibration': np.concatenate([vib_normal, vib_degraded]),
        'temperature': np.concatenate([temp_normal, temp_degraded]),
        'current': np.concatenate([curr_normal, curr_degraded]),
        'pressure': np.concatenate([press_normal, press_degraded])
    })
    
    y_fail = np.concatenate([y_fail_normal, y_fail_degraded])
    y_rul = np.concatenate([rul_normal, rul_degraded])
    
    # Shuffle
    indices = np.arange(n_samples)
    np.random.shuffle(indices)
    
    return X.iloc[indices], y_fail[indices], y_rul[indices]

print("Generating Data and Training ML Models...")
X_train, y_fail_train, y_rul_train = generate_training_data()

# Model 1: Isolation Forest (Anomaly Detection) with Scaling
iso_forest = make_pipeline(
    StandardScaler(),
    IsolationForest(contamination=0.1, random_state=42)
)
iso_forest.fit(X_train)

# Model 2: Classifier (Failure Risk)
xgb_classifier = make_pipeline(
    StandardScaler(),
    HistGradientBoostingClassifier(random_state=42, l2_regularization=0.1)
)
xgb_classifier.fit(X_train, y_fail_train)

# Model 3: Regressor (Remaining Useful Life in days)
xgb_regressor = make_pipeline(
    StandardScaler(),
    HistGradientBoostingRegressor(random_state=42, l2_regularization=0.1)
)
xgb_regressor.fit(X_train, y_rul_train)
print("Models trained successfully.")

# -------------------------
# 2. Fuzzy Logic Engine
# -------------------------

def fuzzy_membership(x, a, b, c, d):
    """Trapezoidal membership function"""
    if x <= a or x >= d: return 0.0
    if a < x < b: return (x - a) / (b - a)
    if b <= x <= c: return 1.0
    if c < x < d: return (d - x) / (d - c)
    return 0.0

def calculate_fuzzy_health(anomaly_score, fail_prob, rul):
    # Anomaly score from IsoForest: < 0 is anomaly, > 0 is normal
    
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
    # Rule 1: High RUL + Low Fail Prob -> Excellent Health
    w1 = min(rul_long, fail_low)
    
    # Rule 2: Medium RUL + Low/Med Fail Prob -> Good Health
    w2 = min(rul_med, max(fail_low, fail_med))
    
    # Rule 3: Med RUL + Med Fail Prob or slight anomaly -> Fair Health
    w3 = max(min(rul_med, fail_med), min(rul_med, anomaly_high))
    
    # Rule 4: Short RUL or High Fail Prob or High Anomaly -> Critical Health
    w4 = max(rul_short, fail_high, anomaly_high)

    total_weight = w1 + w2 + w3 + w4
    if total_weight == 0:
        health_score = 50 # Fallback
    else:
        # Centroids: Excellent=100, Good=80, Fair=50, Critical=15
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

# -------------------------
# 3. API Endpoints
# -------------------------

class SimulationRequest(BaseModel):
    mode: str # 'normal' or 'degrade'
    step: int = 0

@app.post("/api/simulate")
def simulate_pump(req: SimulationRequest):
    # We will simulate a steady base load of 0.8
    base_load = 0.8
    
    if req.mode == 'normal':
        vib = 2.0 * base_load + random.gauss(0, 0.1)
        temp = 40.0 + (10.0 * base_load) + random.gauss(0, 1.0)
        curr = 10.0 + (10.0 * base_load) + random.gauss(0, 0.5)
        press = 120.0 - (5.0 * base_load) + random.gauss(0, 1.0)
    else:
        # Progressively degrade based on step (0 to 10)
        degrade_factor = min(req.step / 10.0, 1.0)
        vib = (2.0 * base_load) + (4.0 * degrade_factor) + random.gauss(0, 0.2)
        temp = (40.0 + (10.0 * base_load)) + (15.0 * degrade_factor) + random.gauss(0, 1.5)
        curr = (10.0 + (10.0 * base_load)) + (12.0 * degrade_factor) + random.gauss(0, 1.0)
        press = (120.0 - (5.0 * base_load)) - (25.0 * degrade_factor) + random.gauss(0, 2.0)
        
    # Prepare input
    X_live = pd.DataFrame({'vibration': [vib], 'temperature': [temp], 'current': [curr], 'pressure': [press]})
    
    # Run Inference
    anomaly_raw = iso_forest.decision_function(X_live)[0]
    is_anomaly = iso_forest.predict(X_live)[0] == -1
    
    fail_prob = float(xgb_classifier.predict_proba(X_live)[0][1])
    rul_pred = float(xgb_regressor.predict(X_live)[0])
    
    # Run Fuzzy Engine
    health_score, fuzzy_state = calculate_fuzzy_health(anomaly_raw, fail_prob, rul_pred)
    
    return {
        "sensors": {
            "vibration": round(vib, 2),
            "temperature": round(temp, 1),
            "current": round(curr, 1),
            "pressure": round(press, 1)
        },
        "predictions": {
            "is_anomaly": bool(is_anomaly),
            "anomaly_score": round(float(anomaly_raw), 3),
            "failure_probability": round(fail_prob * 100, 1),
            "rul_days": max(0, round(rul_pred, 1))
        },
        "health": {
            "score": health_score,
            "state": fuzzy_state
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
