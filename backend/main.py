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

def get_asset_params(asset_type, base_load):
    if asset_type == 'PUMP':
        return {
            'vib_base': 2.0 * base_load, 'vib_noise': 0.2, 'vib_deg': 4.0,
            'temp_base': 40.0 + 10.0 * base_load, 'temp_noise': 1.5, 'temp_deg': 15.0,
            'curr_base': 10.0 + 10.0 * base_load, 'curr_noise': 0.8, 'curr_deg': 12.0,
            'press_base': 120.0 - 5.0 * base_load, 'press_noise': 3.0, 'press_deg': -25.0,
        }
    elif asset_type == 'HVAC':
        return {
            'vib_base': 1.5 * base_load, 'vib_noise': 0.1, 'vib_deg': 3.0,
            'temp_base': 22.0 + 5.0 * base_load, 'temp_noise': 1.0, 'temp_deg': 10.0,
            'curr_base': 15.0 + 5.0 * base_load, 'curr_noise': 1.0, 'curr_deg': 8.0,
            'press_base': 35.0 + 2.0 * base_load, 'press_noise': 1.5, 'press_deg': 15.0,
        }
    elif asset_type == 'ELEVATOR':
        return {
            'vib_base': 1.0 * base_load, 'vib_noise': 0.1, 'vib_deg': 2.5,
            'temp_base': 30.0 + 5.0 * base_load, 'temp_noise': 1.0, 'temp_deg': 12.0,
            'curr_base': 25.0 + 15.0 * base_load, 'curr_noise': 2.0, 'curr_deg': 20.0,
            'press_base': 60.0 + 5.0 * base_load, 'press_noise': 2.0, 'press_deg': -10.0,
        }
    elif asset_type == 'GENERATOR':
        return {
            'vib_base': 3.0 * base_load, 'vib_noise': 0.3, 'vib_deg': 6.0,
            'temp_base': 80.0 + 15.0 * base_load, 'temp_noise': 2.5, 'temp_deg': 30.0,
            'curr_base': 50.0 + 20.0 * base_load, 'curr_noise': 3.0, 'curr_deg': 35.0,
            'press_base': 45.0 + 10.0 * base_load, 'press_noise': 2.0, 'press_deg': 20.0,
        }
    elif asset_type == 'CHILLER':
        return {
            'vib_base': 1.2 * base_load, 'vib_noise': 0.1, 'vib_deg': 2.0,
            'temp_base': 10.0 + 5.0 * base_load, 'temp_noise': 0.8, 'temp_deg': 18.0,
            'curr_base': 40.0 + 10.0 * base_load, 'curr_noise': 2.0, 'curr_deg': 25.0,
            'press_base': 80.0 + 10.0 * base_load, 'press_noise': 2.5, 'press_deg': -20.0,
        }
    else:
        return get_asset_params('PUMP', base_load)

def generate_training_data(asset_type, n_samples=2000):
    np.random.seed(42)
    # Normal data (75%)
    n_normal = int(n_samples * 0.75)
    
    base_load = np.random.uniform(0.5, 1.0, n_normal)
    params = get_asset_params(asset_type, base_load)
    
    vib_normal = params['vib_base'] + np.random.normal(0, params['vib_noise'], n_normal)
    temp_normal = params['temp_base'] + np.random.normal(0, params['temp_noise'], n_normal)
    curr_normal = params['curr_base'] + np.random.normal(0, params['curr_noise'], n_normal)
    press_normal = params['press_base'] + np.random.normal(0, params['press_noise'], n_normal)
    
    y_fail_normal = np.zeros(n_normal)
    rul_normal = np.random.uniform(40, 90, n_normal)

    # Degraded data (25%)
    n_degraded = n_samples - n_normal
    degrade_factor = np.random.uniform(0.1, 1.0, n_degraded)
    base_load_deg = np.random.uniform(0.5, 1.0, n_degraded)
    params_deg = get_asset_params(asset_type, base_load_deg)
    
    vib_degraded = params_deg['vib_base'] + (params_deg['vib_deg'] * degrade_factor) + np.random.normal(0, params_deg['vib_noise'], n_degraded)
    temp_degraded = params_deg['temp_base'] + (params_deg['temp_deg'] * degrade_factor) + np.random.normal(0, params_deg['temp_noise'], n_degraded)
    curr_degraded = params_deg['curr_base'] + (params_deg['curr_deg'] * degrade_factor) + np.random.normal(0, params_deg['curr_noise'], n_degraded)
    press_degraded = params_deg['press_base'] + (params_deg['press_deg'] * degrade_factor) + np.random.normal(0, params_deg['press_noise'], n_degraded)
    
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

print("Generating Data and Training ML Models for all assets...")
asset_types = ['PUMP', 'HVAC', 'ELEVATOR', 'GENERATOR', 'CHILLER']
models = {}

for atype in asset_types:
    X_train, y_fail_train, y_rul_train = generate_training_data(atype)
    
    iso_forest = make_pipeline(StandardScaler(), IsolationForest(contamination=0.1, random_state=42))
    iso_forest.fit(X_train)
    
    xgb_classifier = make_pipeline(StandardScaler(), HistGradientBoostingClassifier(random_state=42, l2_regularization=0.1))
    xgb_classifier.fit(X_train, y_fail_train)
    
    xgb_regressor = make_pipeline(StandardScaler(), HistGradientBoostingRegressor(random_state=42, l2_regularization=0.1))
    xgb_regressor.fit(X_train, y_rul_train)
    
    models[atype] = {
        'iso_forest': iso_forest,
        'xgb_classifier': xgb_classifier,
        'xgb_regressor': xgb_regressor
    }
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
    asset_type: str = "PUMP"
    mode: str # 'normal' or 'degrade'
    step: int = 0

@app.post("/api/simulate")
def simulate_asset(req: SimulationRequest):
    # We will simulate a steady base load of 0.8
    base_load = 0.8
    atype = req.asset_type.upper()
    if atype not in models:
        atype = 'PUMP'
        
    # Get scalar values for base params (using a numpy array for vectorization in the function)
    params = get_asset_params(atype, np.array([base_load]))
    
    if req.mode == 'normal':
        vib = params['vib_base'][0] + random.gauss(0, params['vib_noise'])
        temp = params['temp_base'][0] + random.gauss(0, params['temp_noise'])
        curr = params['curr_base'][0] + random.gauss(0, params['curr_noise'])
        press = params['press_base'][0] + random.gauss(0, params['press_noise'])
    else:
        # Progressively degrade based on step (0 to 10)
        degrade_factor = min(req.step / 10.0, 1.0)
        vib = params['vib_base'][0] + (params['vib_deg'] * degrade_factor) + random.gauss(0, params['vib_noise'])
        temp = params['temp_base'][0] + (params['temp_deg'] * degrade_factor) + random.gauss(0, params['temp_noise'])
        curr = params['curr_base'][0] + (params['curr_deg'] * degrade_factor) + random.gauss(0, params['curr_noise'])
        press = params['press_base'][0] + (params['press_deg'] * degrade_factor) + random.gauss(0, params['press_noise'])
        
    # Prepare input
    X_live = pd.DataFrame({'vibration': [vib], 'temperature': [temp], 'current': [curr], 'pressure': [press]})
    
    asset_models = models[atype]
    iso_forest = asset_models['iso_forest']
    xgb_classifier = asset_models['xgb_classifier']
    xgb_regressor = asset_models['xgb_regressor']
    
    # Run Inference
    anomaly_raw = iso_forest.decision_function(X_live)[0]
    is_anomaly = iso_forest.predict(X_live)[0] == -1
    
    fail_prob = float(xgb_classifier.predict_proba(X_live)[0][1])
    rul_pred = float(xgb_regressor.predict(X_live)[0])
    
    # Run Fuzzy Engine
    health_score, fuzzy_state = calculate_fuzzy_health(anomaly_raw, fail_prob, rul_pred)
    
    return {
        "asset_type": atype,
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
