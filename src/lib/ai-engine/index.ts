export interface SensorReadings {
  vibration: number;
  temperature: number;
  current: number;
  pressure: number;
}

export interface WatchAgentOutput {
  agent: "WatchAgent";
  asset_type: string;
  is_anomaly: boolean;
  anomaly_score: number;
  severity: "CRITICAL" | "MODERATE" | "LOW" | "NOMINAL";
  telemetry_snapshot: SensorReadings;
}

export interface DiagnoseAgentOutput {
  agent: "DiagnoseAgent";
  asset_type: string;
  failure_probability: number;
  failure_class: number;
  risk_level: "CRITICAL_RISK" | "ELEVATED_RISK" | "WATCH_RISK" | "HEALTHY";
  detected_symptoms: string[];
}

export interface PredictAgentOutput {
  agent: "PredictAgent";
  asset_type: string;
  rul_days: number;
  maintenance_horizon: "IMMEDIATE_ACTION_REQUIRED" | "SHORT_TERM_SCHEDULE" | "MEDIUM_TERM_MAINTENANCE" | "LONG_TERM_OPTIMAL";
  recommended_action_within_days: number;
}

export interface PlanExplainAgentOutput {
  agent: "PlanExplainAgent";
  asset_type: string;
  health: {
    score: number;
    state: "Critical" | "High" | "Elevated" | "Normal";
  };
  neurosymbolic: {
    root_cause: string;
    reasoning: string[];
    recommended_action: string;
    rules_triggered?: string[];
  };
  planning: {
    priority: "P1_IMMEDIATE_ACTION" | "P2_URGENT" | "P3_SCHEDULED" | "P4_NOMINAL";
    approval_status: string;
    target_action: string;
    root_cause_explanation: string;
    reasoning_points: string[];
  };
}

export interface PipelineResult {
  asset_type: string;
  sensors: SensorReadings;
  predictions: {
    is_anomaly: boolean;
    anomaly_score: number;
    failure_probability: number;
    rul_days: number;
  };
  health: {
    score: number;
    state: string;
  };
  neurosymbolic: {
    root_cause: string;
    recommended_action: string;
    rules_triggered: string[];
    reasoning?: string[];
  };
  agents_pipeline: {
    watch_agent: WatchAgentOutput;
    diagnose_agent: DiagnoseAgentOutput;
    predict_agent: PredictAgentOutput;
    plan_explain_agent: PlanExplainAgentOutput;
  };
}

export interface AssetParams {
  vib_base: number;
  vib_noise: number;
  vib_deg: number;
  temp_base: number;
  temp_noise: number;
  temp_deg: number;
  curr_base: number;
  curr_noise: number;
  curr_deg: number;
  press_base: number;
  press_noise: number;
  press_deg: number;
}

export function getAssetParams(assetType: string, baseLoad: number = 0.8): AssetParams {
  const atype = assetType.toUpperCase();
  switch (atype) {
    case "PUMP":
      return {
        vib_base: 2.0 * baseLoad,
        vib_noise: 0.2,
        vib_deg: 4.0,
        temp_base: 40.0 + 10.0 * baseLoad,
        temp_noise: 1.5,
        temp_deg: 15.0,
        curr_base: 10.0 + 10.0 * baseLoad,
        curr_noise: 0.8,
        curr_deg: 12.0,
        press_base: 120.0 - 5.0 * baseLoad,
        press_noise: 3.0,
        press_deg: -25.0,
      };
    case "HVAC":
      return {
        vib_base: 1.5 * baseLoad,
        vib_noise: 0.1,
        vib_deg: 3.0,
        temp_base: 22.0 + 5.0 * baseLoad,
        temp_noise: 1.0,
        temp_deg: 10.0,
        curr_base: 15.0 + 5.0 * baseLoad,
        curr_noise: 1.0,
        curr_deg: 8.0,
        press_base: 35.0 + 2.0 * baseLoad,
        press_noise: 1.5,
        press_deg: 15.0,
      };
    case "ELEVATOR":
      return {
        vib_base: 1.0 * baseLoad,
        vib_noise: 0.1,
        vib_deg: 2.5,
        temp_base: 30.0 + 5.0 * baseLoad,
        temp_noise: 1.0,
        temp_deg: 12.0,
        curr_base: 25.0 + 15.0 * baseLoad,
        curr_noise: 2.0,
        curr_deg: 20.0,
        press_base: 60.0 + 5.0 * baseLoad,
        press_noise: 2.0,
        press_deg: -10.0,
      };
    case "GENERATOR":
      return {
        vib_base: 3.0 * baseLoad,
        vib_noise: 0.3,
        vib_deg: 6.0,
        temp_base: 80.0 + 15.0 * baseLoad,
        temp_noise: 2.5,
        temp_deg: 30.0,
        curr_base: 50.0 + 20.0 * baseLoad,
        curr_noise: 3.0,
        curr_deg: 35.0,
        press_base: 45.0 + 10.0 * baseLoad,
        press_noise: 2.0,
        press_deg: 20.0,
      };
    case "CHILLER":
      return {
        vib_base: 1.2 * baseLoad,
        vib_noise: 0.1,
        vib_deg: 2.0,
        temp_base: 10.0 + 5.0 * baseLoad,
        temp_noise: 0.8,
        temp_deg: 18.0,
        curr_base: 40.0 + 10.0 * baseLoad,
        curr_noise: 2.0,
        curr_deg: 25.0,
        press_base: 80.0 + 10.0 * baseLoad,
        press_noise: 2.5,
        press_deg: -20.0,
      };
    default:
      return getAssetParams("PUMP", baseLoad);
  }
}

/** Trapezoidal fuzzy membership function */
export function fuzzyMembership(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0.0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x >= b && x <= c) return 1.0;
  if (x > c && x < d) return (d - x) / (d - c);
  return 0.0;
}

/** Sugeno fuzzy health inference */
export function calculateFuzzyHealth(
  anomalyScore: number,
  failProb: number,
  rul: number
): { score: number; state: "Critical" | "High" | "Elevated" | "Normal" } {
  // RUL memberships (Days)
  const rul_short = fuzzyMembership(rul, -10, 0, 7, 15);
  const rul_med = fuzzyMembership(rul, 10, 15, 25, 40);
  const rul_long = fuzzyMembership(rul, 30, 45, 100, 200);

  // Fail Prob memberships (0-1)
  const fail_low = fuzzyMembership(failProb, -0.1, 0.0, 0.2, 0.4);
  const fail_med = fuzzyMembership(failProb, 0.2, 0.4, 0.6, 0.8);
  const fail_high = fuzzyMembership(failProb, 0.6, 0.8, 1.0, 1.1);

  // Anomaly membership (negative = anomaly)
  const anomaly_high = fuzzyMembership(anomalyScore, -5.0, -1.0, -0.1, 0.0);

  // Fuzzy Rules (Sugeno-style inference)
  const w1 = Math.min(rul_long, fail_low);
  const w2 = Math.min(rul_med, Math.max(fail_low, fail_med));
  const w3 = Math.max(Math.min(rul_med, fail_med), Math.min(rul_med, anomaly_high));
  const w4 = Math.max(rul_short, fail_high, anomaly_high);

  const total_weight = w1 + w2 + w3 + w4;
  let healthScore = 50;
  if (total_weight > 0) {
    healthScore = (w1 * 100 + w2 * 80 + w3 * 50 + w4 * 15) / total_weight;
  }

  let state: "Critical" | "High" | "Elevated" | "Normal" = "Normal";
  if (healthScore >= 85) {
    state = "Normal";
  } else if (healthScore >= 65) {
    state = "Elevated";
  } else if (healthScore >= 35) {
    state = "High";
  } else {
    state = "Critical";
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(healthScore))),
    state,
  };
}

/** Neuro-Symbolic domain reasoning */
export function neurosymbolicReasoning(
  assetType: string,
  sensors: SensorReadings,
  predictions: { is_anomaly: boolean; anomaly_score: number; failure_probability: number; rul_days: number },
  fuzzyState: "Critical" | "High" | "Elevated" | "Normal"
): { root_cause: string; reasoning: string[]; recommended_action: string; rules_triggered: string[] } {
  const reasons: string[] = [];
  const rulesTriggered: string[] = [];
  let root_cause = "Nominal Operation";
  let action = "No action required. Standard quarterly checkup scheduled.";

  const vib = sensors.vibration;
  const temp = sensors.temperature;
  const curr = sensors.current;
  const press = sensors.pressure;
  const atype = assetType.toUpperCase();

  if (fuzzyState === "Critical" || fuzzyState === "High") {
    if (vib > 4.0 && temp > 60.0) {
      root_cause = "High bearing vibration combined with elevated compressor heat";
      reasons.push("High vibration and temperature indicate friction from worn bearings.");
      rulesTriggered.push("Bearing friction threshold exceeded", "High temperature anomaly");
      action = "Schedule immediate bearing inspection and flush refrigerant coolant loops.";
    } else if (curr > 25.0 && temp > 60.0) {
      root_cause = "Electrical Overload / Winding Short";
      reasons.push("Excessive current draw paired with high temperature suggests electrical stress.");
      rulesTriggered.push("Overcurrent threshold tripped", "Thermal overload signature");
      action = "Check motor windings, circuit breaker, and power supply voltage balance.";
    } else if (press < 50.0 && (atype === "PUMP" || atype === "CHILLER")) {
      root_cause = "Fluid Leak / Suction Cavitation";
      reasons.push("Significant pressure drop detected in fluid circulation system.");
      rulesTriggered.push("Suction pressure variance", "Cavitation envelope detected");
      action = "Inspect seals, valves, and fluid lines for leaks and cavitation.";
    } else {
      root_cause = "General Mechanical Degradation";
      reasons.push("Multiple sensor channels deviating from baseline operating envelope.");
      rulesTriggered.push("Multi-variate deviation alert");
      action = "Perform comprehensive diagnostic and inspect mechanical coupling.";
    }
  } else if (fuzzyState === "Elevated") {
    root_cause = "Incipient Component Wear / Early Deviation";
    reasons.push("Early stage sensor deviations detected by multi-agent models.");
    rulesTriggered.push("Trend divergence detected");
    action = "Increase monitoring frequency and plan maintenance within standard service window.";
  } else {
    root_cause = "Operating within normal parameters";
    reasons.push("All sensor telemetry aligns with expected baseline behavior.");
    action = "Continue standard automated monitoring schedule.";
  }

  return {
    root_cause,
    reasoning: reasons,
    recommended_action: action,
    rules_triggered: rulesTriggered,
  };
}

/** Watch Agent: Multidimensional Anomaly Detector */
export class WatchAgent {
  assetType: string;

  constructor(assetType: string = "PUMP") {
    this.assetType = assetType.toUpperCase();
  }

  inspect(sensors: SensorReadings): WatchAgentOutput {
    const params = getAssetParams(this.assetType);
    
    // Z-score deviation calculation against dynamic baselines
    const zVib = Math.abs(sensors.vibration - params.vib_base) / (params.vib_noise + 0.1);
    const zTemp = Math.abs(sensors.temperature - params.temp_base) / (params.temp_noise + 0.5);
    const zCurr = Math.abs(sensors.current - params.curr_base) / (params.curr_noise + 0.5);
    const zPress = Math.abs(sensors.pressure - params.press_base) / (params.press_noise + 1.0);

    const maxZ = Math.max(zVib, zTemp, zCurr, zPress);
    const avgZ = (zVib + zTemp + zCurr + zPress) / 4.0;

    // Convert Z-score to anomaly decision function (-0.5 to +0.3)
    const anomalyScore = Math.max(-0.6, Math.min(0.3, 0.15 - (avgZ * 0.08 + maxZ * 0.04)));
    const isAnomaly = anomalyScore < 0 || maxZ > 3.0;

    let severity: "CRITICAL" | "MODERATE" | "LOW" | "NOMINAL" = "NOMINAL";
    if (anomalyScore < -0.15 || maxZ > 4.5) {
      severity = "CRITICAL";
    } else if (anomalyScore < -0.05 || isAnomaly) {
      severity = "MODERATE";
    } else if (anomalyScore < 0.05) {
      severity = "LOW";
    }

    return {
      agent: "WatchAgent",
      asset_type: this.assetType,
      is_anomaly: isAnomaly,
      anomaly_score: Number(anomalyScore.toFixed(3)),
      severity,
      telemetry_snapshot: sensors,
    };
  }
}

/** Diagnose Agent: Failure Probability & Degradation Classifier */
export class DiagnoseAgent {
  assetType: string;

  constructor(assetType: string = "PUMP") {
    this.assetType = assetType.toUpperCase();
  }

  diagnose(sensors: SensorReadings): DiagnoseAgentOutput {
    const params = getAssetParams(this.assetType);

    // Degradation ratio
    const vibDeg = Math.max(0, (sensors.vibration - params.vib_base) / (params.vib_deg || 1.0));
    const tempDeg = Math.max(0, (sensors.temperature - params.temp_base) / (params.temp_deg || 1.0));
    const currDeg = Math.max(0, (sensors.current - params.curr_base) / (params.curr_deg || 1.0));
    const pressDeg = Math.max(0, Math.abs(sensors.pressure - params.press_base) / (Math.abs(params.press_deg) || 1.0));

    const compositeDeg = Math.max(vibDeg, tempDeg) * 0.6 + ((currDeg + pressDeg) / 2) * 0.4;
    
    // Sigmoid mapping to failure probability 0-100%
    const prob = 1 / (1 + Math.exp(-6 * (compositeDeg - 0.45)));
    const failureProbability = Math.max(2.0, Math.min(99.0, Number((prob * 100).toFixed(1))));

    let risk_level: "CRITICAL_RISK" | "ELEVATED_RISK" | "WATCH_RISK" | "HEALTHY" = "HEALTHY";
    if (failureProbability >= 75) {
      risk_level = "CRITICAL_RISK";
    } else if (failureProbability >= 45) {
      risk_level = "ELEVATED_RISK";
    } else if (failureProbability >= 20) {
      risk_level = "WATCH_RISK";
    }

    const symptoms: string[] = [];
    if (sensors.vibration > params.vib_base * 1.8) symptoms.push("Excessive Vibration");
    if (sensors.temperature > params.temp_base * 1.3) symptoms.push("Overheating");
    if (sensors.current > params.curr_base * 1.4) symptoms.push("High Current Draw");
    if (Math.abs(sensors.pressure - params.press_base) > 15) symptoms.push("Abnormal Pressure Variance");

    return {
      agent: "DiagnoseAgent",
      asset_type: this.assetType,
      failure_probability: failureProbability,
      failure_class: failureProbability > 50 ? 1 : 0,
      risk_level,
      detected_symptoms: symptoms.length > 0 ? symptoms : ["Normal Sensor Profile"],
    };
  }
}

/** Predict Agent: Remaining Useful Life (RUL) Regressor */
export class PredictAgent {
  assetType: string;

  constructor(assetType: string = "PUMP") {
    this.assetType = assetType.toUpperCase();
  }

  predictRul(sensors: SensorReadings, failureProbability: number): PredictAgentOutput {
    // Max baseline life (days)
    const baseRul = 90.0;
    const penalty = (failureProbability / 100) * 85.0;
    const rulDays = Math.max(1.0, Math.min(baseRul, Number((baseRul - penalty).toFixed(1))));

    let horizon: "IMMEDIATE_ACTION_REQUIRED" | "SHORT_TERM_SCHEDULE" | "MEDIUM_TERM_MAINTENANCE" | "LONG_TERM_OPTIMAL" = "LONG_TERM_OPTIMAL";
    if (rulDays <= 7.0) {
      horizon = "IMMEDIATE_ACTION_REQUIRED";
    } else if (rulDays <= 20.0) {
      horizon = "SHORT_TERM_SCHEDULE";
    } else if (rulDays <= 45.0) {
      horizon = "MEDIUM_TERM_MAINTENANCE";
    }

    return {
      agent: "PredictAgent",
      asset_type: this.assetType,
      rul_days: rulDays,
      maintenance_horizon: horizon,
      recommended_action_within_days: Math.max(1, Math.floor(rulDays)),
    };
  }
}

/** Plan & Explain Agent */
export class PlanExplainAgent {
  assetType: string;

  constructor(assetType: string = "PUMP") {
    this.assetType = assetType.toUpperCase();
  }

  evaluateAndPlan(
    sensors: SensorReadings,
    watchResult: WatchAgentOutput,
    diagnoseResult: DiagnoseAgentOutput,
    predictResult: PredictAgentOutput
  ): PlanExplainAgentOutput {
    const health = calculateFuzzyHealth(
      watchResult.anomaly_score,
      diagnoseResult.failure_probability / 100.0,
      predictResult.rul_days
    );

    const predsSummary = {
      is_anomaly: watchResult.is_anomaly,
      anomaly_score: watchResult.anomaly_score,
      failure_probability: diagnoseResult.failure_probability,
      rul_days: predictResult.rul_days,
    };

    const nsResult = neurosymbolicReasoning(this.assetType, sensors, predsSummary, health.state);

    let priority: "P1_IMMEDIATE_ACTION" | "P2_URGENT" | "P3_SCHEDULED" | "P4_NOMINAL" = "P4_NOMINAL";
    let approvalStatus = "OPERATIONAL";

    if (health.state === "Critical") {
      priority = "P1_IMMEDIATE_ACTION";
      approvalStatus = "AWAITING_APPROVAL";
    } else if (health.state === "High") {
      priority = "P2_URGENT";
      approvalStatus = "RECOMMENDED";
    } else if (health.state === "Elevated") {
      priority = "P3_SCHEDULED";
      approvalStatus = "MONITORING";
    }

    return {
      agent: "PlanExplainAgent",
      asset_type: this.assetType,
      health,
      neurosymbolic: nsResult,
      planning: {
        priority,
        approval_status: approvalStatus,
        target_action: nsResult.recommended_action,
        root_cause_explanation: nsResult.root_cause,
        reasoning_points: nsResult.reasoning,
      },
    };
  }
}

/** MultiAgentPipeline */
export class MultiAgentPipeline {
  assetTypes = ["PUMP", "HVAC", "ELEVATOR", "GENERATOR", "CHILLER"];
  agents: Record<string, {
    watch: WatchAgent;
    diagnose: DiagnoseAgent;
    predict: PredictAgent;
    planExplain: PlanExplainAgent;
  }> = {};

  constructor() {
    for (const atype of this.assetTypes) {
      this.agents[atype] = {
        watch: new WatchAgent(atype),
        diagnose: new DiagnoseAgent(atype),
        predict: new PredictAgent(atype),
        planExplain: new PlanExplainAgent(atype),
      };
    }
  }

  process(assetType: string, sensorDict: SensorReadings): PipelineResult {
    let atype = assetType.toUpperCase();
    if (!this.agents[atype]) atype = "PUMP";

    const agentGroup = this.agents[atype];
    
    // Stage 1: Watch Agent
    const watchOut = agentGroup.watch.inspect(sensorDict);
    // Stage 2: Diagnose Agent
    const diagnoseOut = agentGroup.diagnose.diagnose(sensorDict);
    // Stage 3: Predict Agent
    const predictOut = agentGroup.predict.predictRul(sensorDict, diagnoseOut.failure_probability);
    // Stage 4: Plan & Explain Agent
    const planExplainOut = agentGroup.planExplain.evaluateAndPlan(sensorDict, watchOut, diagnoseOut, predictOut);

    return {
      asset_type: atype,
      sensors: {
        vibration: Number(sensorDict.vibration.toFixed(2)),
        temperature: Number(sensorDict.temperature.toFixed(2)),
        current: Number(sensorDict.current.toFixed(2)),
        pressure: Number(sensorDict.pressure.toFixed(2)),
      },
      predictions: {
        is_anomaly: watchOut.is_anomaly,
        anomaly_score: watchOut.anomaly_score,
        failure_probability: diagnoseOut.failure_probability,
        rul_days: predictOut.rul_days,
      },
      health: {
        score: planExplainOut.health.score,
        state: planExplainOut.health.state,
      },
      neurosymbolic: {
        root_cause: planExplainOut.neurosymbolic.root_cause,
        recommended_action: planExplainOut.neurosymbolic.recommended_action,
        rules_triggered: planExplainOut.neurosymbolic.rules_triggered || [],
        reasoning: planExplainOut.neurosymbolic.reasoning,
      },
      agents_pipeline: {
        watch_agent: watchOut,
        diagnose_agent: diagnoseOut,
        predict_agent: predictOut,
        plan_explain_agent: planExplainOut,
      },
    };
  }
}

export const aiPipeline = new MultiAgentPipeline();
