import random
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier, HistGradientBoostingRegressor

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

# Generate Synthetic Training Data
def generate_training_data(n_samples=1000):
    np.random.seed(42)
    # Normal data
    n_normal = int(n_samples * 0.8)
    vib_normal = np.random.normal(2.0, 0.2, n_normal)
    temp_normal = np.random.normal(45.0, 2.0, n_normal)
    curr_normal = np.random.normal(15.0, 1.0, n_normal)
    press_normal = np.random.normal(120.0, 5.0, n_normal)
    y_fail_normal = np.zeros(n_normal)
    rul_normal = np.random.uniform(30, 60, n_normal)

    # Degraded data
    n_degraded = n_samples - n_normal
    vib_degraded = np.random.normal(5.5, 1.0, n_degraded)
    temp_degraded = np.random.normal(60.0, 5.0, n_degraded)
    curr_degraded = np.random.normal(25.0, 3.0, n_degraded)
    press_degraded = np.random.normal(90.0, 10.0, n_degraded) # Pressure drops in a leak/degradation
    y_fail_degraded = np.ones(n_degraded)
    rul_degraded = np.random.uniform(1, 15, n_degraded)

    X = pd.DataFrame({
        'vibration': np.concatenate([vib_normal, vib_degraded]),
        'temperature': np.concatenate([temp_normal, temp_degraded]),
        'current': np.concatenate([curr_normal, curr_degraded]),
        'pressure': np.concatenate([press_normal, press_degraded])
    })
    
    y_fail = np.concatenate([y_fail_normal, y_fail_degraded])
    y_rul = np.concatenate([rul_normal, rul_degraded])
    
    return X, y_fail, y_rul

print("Training ML Models...")
X_train, y_fail_train, y_rul_train = generate_training_data()

# Model 1: Isolation Forest (Anomaly Detection)
iso_forest = IsolationForest(contamination=0.1, random_state=42)
iso_forest.fit(X_train)

# Model 2: Classifier (Failure Risk)
xgb_classifier = HistGradientBoostingClassifier(random_state=42)
xgb_classifier.fit(X_train, y_fail_train)

# Model 3: Regressor (Remaining Useful Life in days)
xgb_regressor = HistGradientBoostingRegressor(random_state=42)
xgb_regressor.fit(X_train, y_rul_train)
print("Models trained successfully.")

# -------------------------
# 2. Fuzzy Logic Engine
# -------------------------

def calculate_fuzzy_health(anomaly_score, fail_prob, rul):
    # Anomaly score from IsoForest is -1 (anomaly) or 1 (normal). Let's convert to 0-1 continuous if possible.
    # We will use the decision_function which returns negative for anomaly, positive for normal
    
    # Fuzzy Rules (simplified for hackathon)
    # Inputs: fail_prob (0-1), rul (days)
    
    # Base health on RUL mapping to 0-100
    if rul > 30:
        base_health = 100
    elif rul < 0:
        base_health = 0
    else:
        base_health = (rul / 30.0) * 100

    # Penalize based on failure probability
    health = base_health - (fail_prob * 30)
    
    # Determine Fuzzy State
    if health >= 80:
        state = "Normal"
    elif health >= 50:
        state = "Elevated"
    elif health >= 25:
        state = "High"
    else:
        state = "Critical"
        
    return max(0, min(100, int(health))), state

# -------------------------
# 3. API Endpoints
# -------------------------

class SimulationRequest(BaseModel):
    mode: str # 'normal' or 'degrade'
    step: int = 0

@app.post("/api/simulate")
def simulate_pump(req: SimulationRequest):
    # Generate sensor reading based on mode and step
    if req.mode == 'normal':
        vib = random.gauss(2.0, 0.1)
        temp = random.gauss(45.0, 1.0)
        curr = random.gauss(15.0, 0.5)
        press = random.gauss(120.0, 1.0)
    else:
        # Progressively degrade based on step (0 to 10)
        degrade_factor = min(req.step / 10.0, 1.0)
        vib = 2.0 + (3.5 * degrade_factor) + random.gauss(0, 0.2)
        temp = 45.0 + (15.0 * degrade_factor) + random.gauss(0, 1.5)
        curr = 15.0 + (10.0 * degrade_factor) + random.gauss(0, 1.0)
        press = 120.0 - (30.0 * degrade_factor) + random.gauss(0, 2.0)
        
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
