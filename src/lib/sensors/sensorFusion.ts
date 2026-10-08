/**
 * Multi-Modal Sensor Fusion & AI Diagnostic Bridge
 * Merges Mobile Acoustic FFT, 3-Axis Motor Vibration, Optical Fan RPM,
 * and Equipment Baseline Benchmarks from the project dataset.
 */

import { AudioAnalysisMetrics } from "./audioAnalyzer";
import { VibrationMetrics } from "./vibrationAnalyzer";
import { OpticalTachometerMetrics } from "./opticalTachometer";
import { aiPipeline, PipelineResult, SensorReadings } from "../ai-engine";

export interface AssetBenchmarkProfile {
  assetType: "HVAC" | "PUMP" | "MOTOR" | "CHILLER" | "ELEVATOR" | "GENERATOR";
  label: string;
  nominalRpm: number;
  nominalVibrationMmS: number;
  nominalAcousticFreqHz: number;
  nominalTempC: number;
  nominalCurrentA: number;
  nominalPressureBar: number;
  bladeCountDefault: number;
  description: string;
}

export const REPO_DATASET_BENCHMARKS: Record<string, AssetBenchmarkProfile> = {
  HVAC: {
    assetType: "HVAC",
    label: "HVAC Air Handling Unit & Blower Fan",
    nominalRpm: 1750,
    nominalVibrationMmS: 1.2,
    nominalAcousticFreqHz: 116.6, // 1750/60 * 4 blades = 116.6 Hz BPF
    nominalTempC: 24.5,
    nominalCurrentA: 18.0,
    nominalPressureBar: 36.0,
    bladeCountDefault: 4,
    description: "Multi-blade commercial centrifugal HVAC supply fan & compressor",
  },
  PUMP: {
    assetType: "PUMP",
    label: "Industrial Centrifugal Water Pump",
    nominalRpm: 2950,
    nominalVibrationMmS: 1.8,
    nominalAcousticFreqHz: 295.0, // 2950/60 * 6 vanes = 295 Hz
    nominalTempC: 45.0,
    nominalCurrentA: 16.5,
    nominalPressureBar: 118.0,
    bladeCountDefault: 6,
    description: "High-pressure closed loop fluid pump with mechanical seal & impeller",
  },
  MOTOR: {
    assetType: "MOTOR",
    label: "3-Phase Induction Motor (2-Pole)",
    nominalRpm: 3000,
    nominalVibrationMmS: 1.1,
    nominalAcousticFreqHz: 50.0,  // 50Hz grid frequency fundamental
    nominalTempC: 55.0,
    nominalCurrentA: 22.0,
    nominalPressureBar: 1.0,
    bladeCountDefault: 2,
    description: "400V Squirrel-cage industrial induction drive motor with cooling fan",
  },
  CHILLER: {
    assetType: "CHILLER",
    label: "Centrifugal Industrial Chiller",
    nominalRpm: 3600,
    nominalVibrationMmS: 1.0,
    nominalAcousticFreqHz: 240.0,
    nominalTempC: 12.0,
    nominalCurrentA: 45.0,
    nominalPressureBar: 85.0,
    bladeCountDefault: 4,
    description: "Large capacity water-cooled building central plant chiller unit",
  },
  ELEVATOR: {
    assetType: "ELEVATOR",
    label: "Traction Elevator Gearless Hoist Machine",
    nominalRpm: 120,
    nominalVibrationMmS: 0.8,
    nominalAcousticFreqHz: 40.0,
    nominalTempC: 32.0,
    nominalCurrentA: 30.0,
    nominalPressureBar: 60.0,
    bladeCountDefault: 1,
    description: "Permanent magnet synchronous passenger traction elevator drive",
  },
  GENERATOR: {
    assetType: "GENERATOR",
    label: "Emergency Diesel Backup Generator",
    nominalRpm: 1500,
    nominalVibrationMmS: 2.5,
    nominalAcousticFreqHz: 125.0,
    nominalTempC: 85.0,
    nominalCurrentA: 65.0,
    nominalPressureBar: 50.0,
    bladeCountDefault: 6,
    description: "High-output standby diesel prime mover and alternator set",
  },
};

export interface FusedDiagnosticResult {
  assetType: string;
  timestamp: string;
  derivedSensors: SensorReadings;
  pipelineResult: PipelineResult;
  acousticSummary: {
    peakFrequency: number;
    bearingNoiseRatio: number;
    acousticSeverity: string;
    faultDescription: string;
  };
  vibrationSummary: {
    velocityRmsMmS: number;
    isoZone: string;
    isoStatus: string;
    crestFactor: number;
  };
  opticalSummary: {
    rpm: number;
    rpmDeviationPct: number;
    confidence: number;
    bladePassHz: number;
  };
  overallHealthScore: number;
  overallState: "Critical" | "High" | "Elevated" | "Normal";
  primaryFailureMode: string;
  maintenanceAction: string;
  confidenceScore: number;
}

/**
 * Fuses acoustic, vibration, and optical tachometer data into standard telemetry
 * and runs the 4-Agent Neuro-Symbolic AI Pipeline
 */
export function fuseMobileSensorReadings(
  assetType: string,
  audio: AudioAnalysisMetrics | null,
  vibration: VibrationMetrics | null,
  optical: OpticalTachometerMetrics | null,
  simulatedTempDelta: number = 0,
  simulatedPressureDelta: number = 0
): FusedDiagnosticResult {
  const atype = assetType.toUpperCase();
  const benchmark = REPO_DATASET_BENCHMARKS[atype] || REPO_DATASET_BENCHMARKS.PUMP;

  // 1. Calculate Unified Vibration Metric (mm/s to vibration sensor units)
  const vibVelocity = vibration ? vibration.velocityRmsMmS : benchmark.nominalVibrationMmS;
  // Map mm/s to normalized sensor vibration score (1 mm/s ≈ 1.2 vibration points)
  let unifiedVibration = Number((vibVelocity * 1.25).toFixed(2));

  // If acoustic bearing high-frequency energy is elevated, add mechanical micro-friction vibration penalty
  if (audio && audio.bearingBandEnergy > 40) {
    unifiedVibration += (audio.bearingBandEnergy / 100) * 1.5;
  }

  // 2. RPM deviation calculation
  const currentRpm = optical && optical.calculatedRpm > 0 ? optical.calculatedRpm : benchmark.nominalRpm;
  const rpmDeviationPct = Number((((currentRpm - benchmark.nominalRpm) / benchmark.nominalRpm) * 100).toFixed(1));

  // If RPM is significantly below nominal under load, slip or drag implies overheating / higher current
  const slipStress = Math.max(0, -rpmDeviationPct / 15);

  // 3. Derived Temperature (°C)
  let derivedTemp = benchmark.nominalTempC + simulatedTempDelta;
  if (audio && audio.bearingBandEnergy > 40) {
    derivedTemp += (audio.bearingBandEnergy / 100) * 20.0;
  }
  if (vibration && vibration.velocityRmsMmS > 3.0) {
    derivedTemp += (vibration.velocityRmsMmS - 3.0) * 6.0;
  }
  derivedTemp += slipStress * 12.0;

  // 4. Derived Current (Amperes)
  let derivedCurrent = benchmark.nominalCurrentA;
  if (slipStress > 0) {
    derivedCurrent += slipStress * 8.0;
  }
  if (vibration && vibration.velocityRmsMmS > 3.5) {
    derivedCurrent += (vibration.velocityRmsMmS - 3.5) * 4.0;
  }

  // 5. Derived Pressure (Bar / PSI)
  let derivedPressure = benchmark.nominalPressureBar + simulatedPressureDelta;
  if (audio && audio.cavitationNoiseRatio > 0.6) {
    // Cavitation causes suction pressure drop
    derivedPressure -= (audio.cavitationNoiseRatio - 0.6) * 25.0;
  }

  const derivedSensors: SensorReadings = {
    vibration: Number(Math.max(0.2, unifiedVibration).toFixed(2)),
    temperature: Number(Math.max(15, derivedTemp).toFixed(1)),
    current: Number(Math.max(2, derivedCurrent).toFixed(1)),
    pressure: Number(Math.max(1, derivedPressure).toFixed(1)),
  };

  // Run the 4-Agent Neuro-Symbolic AI Pipeline
  const pipelineResult = aiPipeline.process(atype === "MOTOR" ? "PUMP" : atype, derivedSensors);

  // Synthesize diagnosis details
  let primaryFailureMode = pipelineResult.neurosymbolic.root_cause;
  let maintenanceAction = pipelineResult.neurosymbolic.recommended_action;

  // Enhance diagnosis with acoustic & optical specifics
  if (audio && audio.bearingBandEnergy > 50) {
    primaryFailureMode = `Acoustic Bearing Fault: ${audio.detectedAcousticFault}`;
    maintenanceAction = `Inspect rotating elements immediately. High ultrasonic bearing emission detected at ${audio.peakFrequency}Hz. Lubricate or replace bearing assembly.`;
  } else if (optical && Math.abs(rpmDeviationPct) > 15 && optical.confidence > 50) {
    primaryFailureMode = `Rotor Speed Mismatch: Fan running at ${currentRpm} RPM (${rpmDeviationPct}% off ${benchmark.nominalRpm} RPM baseline)`;
    maintenanceAction = "Inspect drive belt tension, VFD frequency inverter settings, and motor rotor slippage.";
  }

  return {
    assetType: atype,
    timestamp: new Date().toISOString(),
    derivedSensors,
    pipelineResult,
    acousticSummary: {
      peakFrequency: audio?.peakFrequency || benchmark.nominalAcousticFreqHz,
      bearingNoiseRatio: audio?.bearingBandEnergy || 12,
      acousticSeverity: audio?.acousticSeverity || "NORMAL",
      faultDescription: audio?.detectedAcousticFault || "Nominal acoustic profile",
    },
    vibrationSummary: {
      velocityRmsMmS: vibration?.velocityRmsMmS || benchmark.nominalVibrationMmS,
      isoZone: vibration?.isoSeverity.zone || "Zone A (Good)",
      isoStatus: vibration?.isoSeverity.status || "Good",
      crestFactor: vibration?.crestFactor || 1.4,
    },
    opticalSummary: {
      rpm: currentRpm,
      rpmDeviationPct,
      confidence: optical?.confidence || 90,
      bladePassHz: optical?.frequencyHz || benchmark.nominalAcousticFreqHz,
    },
    overallHealthScore: pipelineResult.health.score,
    overallState: pipelineResult.health.state as "Critical" | "High" | "Elevated" | "Normal",
    primaryFailureMode,
    maintenanceAction,
    confidenceScore: Math.min(98, Math.round(75 + (optical?.confidence ? optical.confidence * 0.15 : 10) + (audio ? 10 : 5))),
  };
}
