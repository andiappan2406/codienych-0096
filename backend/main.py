import random
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_engine.ml_models import get_asset_params
from ai_engine.multi_agent_pipeline import MultiAgentPipeline

app = FastAPI(title="BuildGuard AI Multi-Agent Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and train the 4-Agent Pipeline
pipeline = MultiAgentPipeline()
pipeline.train_all()

class SimulationRequest(BaseModel):
    asset_type: str = "PUMP"
    mode: str
    step: int = 0

@app.post("/api/simulate")
def simulate_asset(req: SimulationRequest):
    base_load = 0.8
    atype = req.asset_type.upper()
    if atype not in pipeline.agents:
        atype = 'PUMP'
        
    params = get_asset_params(atype, np.array([base_load]))
    
    if req.mode == 'normal':
        vib = params['vib_base'][0] + random.gauss(0, params['vib_noise'])
        temp = params['temp_base'][0] + random.gauss(0, params['temp_noise'])
        curr = params['curr_base'][0] + random.gauss(0, params['curr_noise'])
        press = params['press_base'][0] + random.gauss(0, params['press_noise'])
    else:
        degrade_factor = min(req.step / 10.0, 1.0)
        vib = params['vib_base'][0] + (params['vib_deg'] * degrade_factor) + random.gauss(0, params['vib_noise'])
        temp = params['temp_base'][0] + (params['temp_deg'] * degrade_factor) + random.gauss(0, params['temp_noise'])
        curr = params['curr_base'][0] + (params['curr_deg'] * degrade_factor) + random.gauss(0, params['curr_noise'])
        press = params['press_base'][0] + (params['press_deg'] * degrade_factor) + random.gauss(0, params['press_noise'])
        
    sensor_dict = {
        'vibration': vib,
        'temperature': temp,
        'current': curr,
        'pressure': press
    }
    
    result = pipeline.process(atype, sensor_dict)
    return result


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
            
        sensor_dict = {
            'vibration': vib,
            'temperature': temp,
            'current': curr,
            'pressure': press
        }
        
        asset_res = pipeline.process(atype, sensor_dict)
        
        results.append({
            "id": f"{atype}-01",
            "asset_type": atype,
            "type_label": state_info['type'],
            "image": state_info['image'],
            "last_service": state_info['lastService'],
            "sensors": asset_res["sensors"],
            "predictions": asset_res["predictions"],
            "health": asset_res["health"],
            "neurosymbolic": asset_res["neurosymbolic"],
            "agents_pipeline": asset_res.get("agents_pipeline")
        })
        
    return {"assets": results}


@app.get("/api/agents")
def get_agents_info():
    """Returns documentation and status of all 4 AI agents."""
    return {
        "agents": [
            {
                "id": "agent_1_watch",
                "name": "Watch Agent",
                "role": "Continuous Contextual Anomaly Detection",
                "model_type": "Isolation Forest (Unsupervised) + Dynamic Baselining",
                "file": "backend/ai_engine/watch_agent.py"
            },
            {
                "id": "agent_2_diagnose",
                "name": "Diagnose Agent",
                "role": "Degradation Classification & Failure Risk Estimation",
                "model_type": "HistGradientBoosting Classifier",
                "file": "backend/ai_engine/diagnose_agent.py"
            },
            {
                "id": "agent_3_predict",
                "name": "Predict Agent",
                "role": "Remaining Useful Life (RUL) Trajectory Regressor",
                "model_type": "HistGradientBoosting Regressor",
                "file": "backend/ai_engine/predict_agent.py"
            },
            {
                "id": "agent_4_plan_explain",
                "name": "Plan & Explain Agent",
                "role": "Neuro-Symbolic Reasoning & Fuzzy Health Inference Planner",
                "model_type": "Fuzzy Logic (Sugeno) + Domain Knowledge Symbolic Rule Engine",
                "file": "backend/ai_engine/plan_explain_agent.py"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
