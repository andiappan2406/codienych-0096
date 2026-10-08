import re

with open("backend/main.py", "r") as f:
    content = f.read()

new_endpoint = """
@app.get("/api/assets")
def get_all_assets():
    # Pre-defined state for the dashboard
    asset_states = {
        'HVAC': {'mode': 'degrade', 'step': 9, 'image': '/assets/equip-0-1.jpg', 'type': 'HVAC System', 'lastService': '42 days ago'},
        'PUMP': {'mode': 'degrade', 'step': 6, 'image': '/assets/equip-0-0.jpg', 'type': 'Industrial Water Pump', 'lastService': '14 days ago'},
        'ELEVATOR': {'mode': 'normal', 'step': 0, 'image': '/assets/equip-0-2.jpg', 'type': 'Passenger Elevator', 'lastService': '5 days ago'},
        'GENERATOR': {'mode': 'normal', 'step': 0, 'image': '/assets/equip-1-0.jpg', 'type': 'Backup Generator', 'lastService': '120 days ago'},
        'CHILLER': {'mode': 'normal', 'step': 0, 'image': '/assets/equip-1-1.jpg', 'type': 'Industrial Chiller', 'lastService': '210 days ago'}
    }
    
    results = []
    base_load = 0.8
    for atype, state_info in asset_states.items():
        params = get_asset_params(atype, np.array([base_load]))
        mode = state_info['mode']
        step = state_info['step']
        
        if mode == 'normal':
            vib = params['vib_base'][0] + random.gauss(0, params['vib_noise'])
            temp = params['temp_base'][0] + random.gauss(0, params['temp_noise'])
            curr = params['curr_base'][0] + random.gauss(0, params['curr_noise'])
            press = params['press_base'][0] + random.gauss(0, params['press_noise'])
        else:
            degrade_factor = min(step / 10.0, 1.0)
            vib = params['vib_base'][0] + (params['vib_deg'] * degrade_factor) + random.gauss(0, params['vib_noise'])
            temp = params['temp_base'][0] + (params['temp_deg'] * degrade_factor) + random.gauss(0, params['temp_noise'])
            curr = params['curr_base'][0] + (params['curr_deg'] * degrade_factor) + random.gauss(0, params['curr_noise'])
            press = params['press_base'][0] + (params['press_deg'] * degrade_factor) + random.gauss(0, params['press_noise'])
            
        X_live = pd.DataFrame({'vibration': [vib], 'temperature': [temp], 'current': [curr], 'pressure': [press]})
        
        asset_models = models.get(atype)
        iso_forest = asset_models['iso_forest']
        xgb_classifier = asset_models['xgb_classifier']
        xgb_regressor = asset_models['xgb_regressor']
        
        anomaly_raw = iso_forest.decision_function(X_live)[0]
        is_anomaly = iso_forest.predict(X_live)[0] == -1
        
        fail_prob = float(xgb_classifier.predict_proba(X_live)[0][1])
        rul_pred = float(xgb_regressor.predict(X_live)[0])
        
        health_score, fuzzy_state = calculate_fuzzy_health(anomaly_raw, fail_prob, rul_pred)
        
        sensors_data = {
            "vibration": round(vib, 2),
            "temperature": round(temp, 1),
            "current": round(curr, 1),
            "pressure": round(press, 1)
        }
        
        preds_data = {
            "is_anomaly": bool(is_anomaly),
            "anomaly_score": round(float(anomaly_raw), 3),
            "failure_probability": round(fail_prob * 100, 1),
            "rul_days": max(0, round(rul_pred, 1))
        }
        
        ns_result = neurosymbolic_reasoning(atype, sensors_data, preds_data, fuzzy_state)
        
        results.append({
            "id": f"{atype}-01",
            "asset_type": atype,
            "type_label": state_info['type'],
            "image": state_info['image'],
            "last_service": state_info['lastService'],
            "sensors": sensors_data,
            "predictions": preds_data,
            "health": {
                "score": health_score,
                "state": fuzzy_state
            },
            "neurosymbolic": ns_result
        })
        
    return {"assets": results}

"""

if "@app.get(\"/api/assets\")" not in content:
    content = content.replace('if __name__ == "__main__":', new_endpoint + '\nif __name__ == "__main__":')

with open("backend/main.py", "w") as f:
    f.write(content)

