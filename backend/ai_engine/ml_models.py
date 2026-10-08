import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

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
    n_normal = int(n_samples * 0.75)
    
    base_load = np.random.uniform(0.5, 1.0, n_normal)
    params = get_asset_params(asset_type, base_load)
    
    vib_normal = params['vib_base'] + np.random.normal(0, params['vib_noise'], n_normal)
    temp_normal = params['temp_base'] + np.random.normal(0, params['temp_noise'], n_normal)
    curr_normal = params['curr_base'] + np.random.normal(0, params['curr_noise'], n_normal)
    press_normal = params['press_base'] + np.random.normal(0, params['press_noise'], n_normal)
    
    y_fail_normal = np.zeros(n_normal)
    rul_normal = np.random.uniform(40, 90, n_normal)

    n_degraded = n_samples - n_normal
    degrade_factor = np.random.uniform(0.1, 1.0, n_degraded)
    base_load_deg = np.random.uniform(0.5, 1.0, n_degraded)
    params_deg = get_asset_params(asset_type, base_load_deg)
    
    vib_degraded = params_deg['vib_base'] + (params_deg['vib_deg'] * degrade_factor) + np.random.normal(0, params_deg['vib_noise'], n_degraded)
    temp_degraded = params_deg['temp_base'] + (params_deg['temp_deg'] * degrade_factor) + np.random.normal(0, params_deg['temp_noise'], n_degraded)
    curr_degraded = params_deg['curr_base'] + (params_deg['curr_deg'] * degrade_factor) + np.random.normal(0, params_deg['curr_noise'], n_degraded)
    press_degraded = params_deg['press_base'] + (params_deg['press_deg'] * degrade_factor) + np.random.normal(0, params_deg['press_noise'], n_degraded)
    
    y_fail_degraded = np.ones(n_degraded)
    rul_degraded = 35 * (1 - degrade_factor) + np.random.uniform(0, 5, n_degraded)

    X = pd.DataFrame({
        'vibration': np.concatenate([vib_normal, vib_degraded]),
        'temperature': np.concatenate([temp_normal, temp_degraded]),
        'current': np.concatenate([curr_normal, curr_degraded]),
        'pressure': np.concatenate([press_normal, press_degraded])
    })
    
    y_fail = np.concatenate([y_fail_normal, y_fail_degraded])
    y_rul = np.concatenate([rul_normal, rul_degraded])
    
    indices = np.arange(n_samples)
    np.random.shuffle(indices)
    
    return X.iloc[indices], y_fail[indices], y_rul[indices]

def train_models():
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
    return models
