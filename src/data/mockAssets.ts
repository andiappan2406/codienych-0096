export interface AssetPrediction {
  is_anomaly: boolean;
  anomaly_score: number;
  failure_probability: number;
  rul_days: number;
}

export interface AssetSensors {
  vibration: number;
  temperature: number;
  current: number;
  pressure: number;
}

export interface AssetHealth {
  score: number;
  state: "Critical" | "High" | "Elevated" | "Warning" | "Normal" | string;
}

export interface AssetNeurosymbolic {
  root_cause: string;
  recommended_action: string;
  rules_triggered: string[];
}

export interface AssetData {
  id: string;
  asset_type: string;
  type_label: string;
  image: string;
  last_service: string;
  sensors: AssetSensors;
  predictions: AssetPrediction;
  health: AssetHealth;
  neurosymbolic: AssetNeurosymbolic;
}

export const DEFAULT_ASSETS: AssetData[] = [
  {
    id: "HVAC-01",
    asset_type: "HVAC",
    type_label: "HVAC System",
    image: "/assets/equip-0-1.jpg",
    last_service: "42 days ago",
    sensors: { vibration: 6.8, temperature: 84.5, current: 28.2, pressure: 5.1 },
    predictions: { is_anomaly: true, anomaly_score: -0.25, failure_probability: 88.5, rul_days: 3.2 },
    health: { score: 28, state: "Critical" },
    neurosymbolic: {
      root_cause: "High bearing vibration combined with elevated compressor heat",
      recommended_action: "Inspect primary compressor bearing and flush refrigerant coolant loops.",
      rules_triggered: ["Bearing friction threshold exceeded", "High temperature anomaly"]
    }
  },
  {
    id: "PUMP-01",
    asset_type: "PUMP",
    type_label: "Industrial Water Pump",
    image: "/assets/equip-0-0.jpg",
    last_service: "14 days ago",
    sensors: { vibration: 4.2, temperature: 68.0, current: 18.5, pressure: 4.2 },
    predictions: { is_anomaly: true, anomaly_score: -0.12, failure_probability: 62.0, rul_days: 8.5 },
    health: { score: 55, state: "Warning" },
    neurosymbolic: {
      root_cause: "Impeller cavitation causing mild vibration elevation",
      recommended_action: "Check suction pressure and inspect pump seal integrity.",
      rules_triggered: ["Suction pressure variance"]
    }
  },
  {
    id: "ELEVATOR-01",
    asset_type: "ELEVATOR",
    type_label: "Passenger Elevator",
    image: "/assets/equip-0-2.jpg",
    last_service: "5 days ago",
    sensors: { vibration: 1.2, temperature: 36.5, current: 14.0, pressure: 1.0 },
    predictions: { is_anomaly: false, anomaly_score: 0.15, failure_probability: 4.5, rul_days: 85.0 },
    health: { score: 94, state: "Normal" },
    neurosymbolic: {
      root_cause: "Operating within normal parameters",
      recommended_action: "Standard quarterly checkup scheduled.",
      rules_triggered: []
    }
  },
  {
    id: "GENERATOR-01",
    asset_type: "GENERATOR",
    type_label: "Backup Generator",
    image: "/assets/equip-1-0.jpg",
    last_service: "120 days ago",
    sensors: { vibration: 1.8, temperature: 42.0, current: 8.0, pressure: 2.1 },
    predictions: { is_anomaly: false, anomaly_score: 0.18, failure_probability: 8.0, rul_days: 62.0 },
    health: { score: 90, state: "Normal" },
    neurosymbolic: {
      root_cause: "Operating within normal parameters",
      recommended_action: "Routine fuel filter inspection.",
      rules_triggered: []
    }
  },
  {
    id: "CHILLER-01",
    asset_type: "CHILLER",
    type_label: "Industrial Chiller",
    image: "/assets/equip-1-1.jpg",
    last_service: "210 days ago",
    sensors: { vibration: 1.5, temperature: 38.0, current: 22.0, pressure: 3.5 },
    predictions: { is_anomaly: false, anomaly_score: 0.14, failure_probability: 12.0, rul_days: 54.0 },
    health: { score: 88, state: "Normal" },
    neurosymbolic: {
      root_cause: "Operating within normal parameters",
      recommended_action: "Next service in 45 days.",
      rules_triggered: []
    }
  }
];

export const DEFAULT_SIMULATION_RESULT = {
  asset_type: "PUMP",
  sensors: {
    vibration: 2.4,
    temperature: 42.5,
    current: 12.1,
    pressure: 3.4
  },
  predictions: {
    is_anomaly: false,
    anomaly_score: 0.12,
    failure_probability: 12.5,
    rul_days: 65.0
  },
  health: {
    score: 88,
    state: "Normal"
  },
  neurosymbolic: {
    root_cause: "Normal baseline operation",
    recommended_action: "Continue standard monitoring schedule.",
    rules_triggered: []
  }
};
