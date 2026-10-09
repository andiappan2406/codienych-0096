"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, Activity, AlertTriangle, ShieldCheck, Zap, Thermometer, 
  RotateCw, Gauge, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, 
  Sparkles, Stethoscope, Clock, FileText, ChevronRight, HelpCircle
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, ReferenceLine, AreaChart, Area 
} from "recharts";

type AssetKey = "PUMP-03" | "PUMP-01" | "CHIL-01" | "ELEV-02" | "GEN-01";

interface AssetHealthData {
  id: AssetKey;
  name: string;
  type: string;
  location: string;
  healthScore: number;
  fuzzyState: "Critical" | "High" | "Elevated" | "Normal";
  rulDays: number;
  failProb: number;
  status: "critical" | "warning" | "healthy";
  diagnosis: string;
  prescription: string;
  sensors: {
    vibration: { val: number; unit: string; baseline: number; status: "alert" | "warn" | "ok" };
    temperature: { val: number; unit: string; baseline: number; status: "alert" | "warn" | "ok" };
    current: { val: number; unit: string; baseline: number; status: "alert" | "warn" | "ok" };
    pressure: { val: number; unit: string; baseline: number; status: "alert" | "warn" | "ok" };
  };
  fuzzyFactors: {
    rulMembership: string;
    failMembership: string;
    anomalyScore: number;
  };
}

const ASSETS_DATA: Record<AssetKey, AssetHealthData> = {
  "PUMP-03": {
    id: "PUMP-03",
    name: "Industrial Water Pump 3",
    type: "Centrifugal Booster Pump",
    location: "Sub-basement B2 · Pump Room",
    healthScore: 38,
    fuzzyState: "High",
    rulDays: 6.2,
    failProb: 78.4,
    status: "critical",
    diagnosis: "Inner Race Bearing Micro-Spalling & Cavitation Harmonic Drift",
    prescription: "Replace drive-end bearing assembly (SKF-6312) and inspect impeller seal within 5 days.",
    sensors: {
      vibration: { val: 4.85, unit: "mm/s", baseline: 2.1, status: "alert" },
      temperature: { val: 78.2, unit: "°C", baseline: 42.0, status: "alert" },
      current: { val: 28.4, unit: "A", baseline: 18.0, status: "warn" },
      pressure: { val: 92.0, unit: "PSI", baseline: 118.0, status: "warn" },
    },
    fuzzyFactors: {
      rulMembership: "Short (0.85) / Med (0.15)",
      failMembership: "High (0.78)",
      anomalyScore: -0.84,
    }
  },
  "PUMP-01": {
    id: "PUMP-01",
    name: "Primary Feed Pump 1",
    type: "Centrifugal Feed Pump",
    location: "Sub-basement B2 · Pump Room",
    healthScore: 94,
    fuzzyState: "Normal",
    rulDays: 78.5,
    failProb: 4.2,
    status: "healthy",
    diagnosis: "Optimal hydrodynamic equilibrium. No harmonic or thermal anomalies detected.",
    prescription: "Continue standard monthly condition monitoring cycle.",
    sensors: {
      vibration: { val: 1.82, unit: "mm/s", baseline: 1.8, status: "ok" },
      temperature: { val: 41.5, unit: "°C", baseline: 40.0, status: "ok" },
      current: { val: 17.8, unit: "A", baseline: 17.5, status: "ok" },
      pressure: { val: 121.0, unit: "PSI", baseline: 120.0, status: "ok" },
    },
    fuzzyFactors: {
      rulMembership: "Long (0.95)",
      failMembership: "Low (0.96)",
      anomalyScore: 0.42,
    }
  },
  "CHIL-01": {
    id: "CHIL-01",
    name: "Central Chiller Unit 1",
    type: "Centrifugal Water Chiller (500 Ton)",
    location: "Rooftop Plant · HVAC Zone A",
    healthScore: 68,
    fuzzyState: "Elevated",
    rulDays: 18.4,
    failProb: 34.6,
    status: "warning",
    diagnosis: "Compressor Discharge Superheat Drift & Condenser Fouling Indicator",
    prescription: "Chemical flush of condenser tubes and recalibrate expansion valve sensor.",
    sensors: {
      vibration: { val: 2.35, unit: "mm/s", baseline: 1.4, status: "warn" },
      temperature: { val: 62.4, unit: "°C", baseline: 48.0, status: "warn" },
      current: { val: 64.2, unit: "A", baseline: 52.0, status: "warn" },
      pressure: { val: 68.0, unit: "PSI", baseline: 78.0, status: "ok" },
    },
    fuzzyFactors: {
      rulMembership: "Medium (0.65) / Short (0.35)",
      failMembership: "Medium (0.42)",
      anomalyScore: -0.28,
    }
  },
  "ELEV-02": {
    id: "ELEV-02",
    name: "Passenger Lift 2",
    type: "Traction Elevator (1600kg)",
    location: "Central Core · High Rise Bank",
    healthScore: 92,
    fuzzyState: "Normal",
    rulDays: 64.0,
    failProb: 6.8,
    status: "healthy",
    diagnosis: "Slight guide shoe friction variance, well within standard tolerance margins.",
    prescription: "Next scheduled brake shoe and rope tension calibration in 45 days.",
    sensors: {
      vibration: { val: 1.15, unit: "mm/s", baseline: 1.0, status: "ok" },
      temperature: { val: 33.2, unit: "°C", baseline: 30.0, status: "ok" },
      current: { val: 32.0, unit: "A", baseline: 30.0, status: "ok" },
      pressure: { val: 58.0, unit: "PSI", baseline: 60.0, status: "ok" },
    },
    fuzzyFactors: {
      rulMembership: "Long (0.90)",
      failMembership: "Low (0.92)",
      anomalyScore: 0.35,
    }
  },
  "GEN-01": {
    id: "GEN-01",
    name: "Emergency Diesel Generator 1",
    type: "Standby Generator (1250 kVA)",
    location: "Ground Level · Utility Annex",
    healthScore: 88,
    fuzzyState: "Normal",
    rulDays: 52.0,
    failProb: 9.1,
    status: "healthy",
    diagnosis: "Standby readiness confirmed. Battery crank voltage and block heater normal.",
    prescription: "Routine bi-weekly 30-minute test run scheduled.",
    sensors: {
      vibration: { val: 3.20, unit: "mm/s", baseline: 3.0, status: "ok" },
      temperature: { val: 78.0, unit: "°C", baseline: 75.0, status: "ok" },
      current: { val: 48.0, unit: "A", baseline: 50.0, status: "ok" },
      pressure: { val: 52.0, unit: "PSI", baseline: 50.0, status: "ok" },
    },
    fuzzyFactors: {
      rulMembership: "Long (0.85)",
      failMembership: "Low (0.89)",
      anomalyScore: 0.22,
    }
  }
};

export default function HealthPage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetKey>("PUMP-03");
  const [activeMetric, setActiveMetric] = useState<"vibration" | "temperature" | "current" | "pressure">("vibration");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [lastScanned, setLastScanned] = useState("Just now");

  const currentAsset = ASSETS_DATA[selectedAsset];

  const [telemetryData, setTelemetryData] = useState<any[]>([]);

  // Generate 24 telemetry points tailored to the selected asset and metric
  useEffect(() => {
    const pts = [];
    const base = currentAsset.sensors[activeMetric].baseline;
    const curr = currentAsset.sensors[activeMetric].val;
    const isDegraded = currentAsset.status !== "healthy";

    for (let i = 0; i < 24; i++) {
      const timeStr = `${String(i).padStart(2, '0')}:00`;
      let val = base;
      if (isDegraded) {
        if (i < 12) {
          val = base + (Math.sin(i * 0.5) * 0.05 * base);
        } else {
          const ratio = (i - 12) / 12;
          val = base + ((curr - base) * ratio) + (Math.random() * 0.08 * base);
        }
      } else {
        val = base + (Math.sin(i * 0.8) * 0.04 * base) + (Math.random() * 0.02 * base);
      }
      pts.push({
        time: timeStr,
        value: Number(val.toFixed(2)),
        baseline: Number(base.toFixed(2)),
        threshold: Number((base * 1.4).toFixed(2))
      });
    }
    setTelemetryData(pts);
  }, [selectedAsset, activeMetric, currentAsset]);

  const handleRunDiagnostic = () => {
    setIsScanning(true);
    setScanStep(1);
    
    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1500);
    setTimeout(() => {
      setScanStep(4);
      setIsScanning(false);
      setLastScanned("A few seconds ago");
    }, 2300);
  };

  const getStatusColor = (status: "critical" | "warning" | "healthy") => {
    switch (status) {
      case "critical": return "text-[#ff4081] bg-[#ff4081]/10 border-[#ff4081]/30";
      case "warning": return "text-[#f97316] bg-[#f97316]/10 border-[#f97316]/30";
      case "healthy": return "text-[#00e676] bg-[#00e676]/10 border-[#00e676]/30";
    }
  };

  const getFuzzyBadgeColor = (state: string) => {
    switch (state) {
      case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Elevated": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-panel-border/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-1">
            <Stethoscope className="w-4 h-4" /> Building Doctor Diagnostics
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System & Asset Health Vitals</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Neuro-symbolic fault classification and Sugeno fuzzy logic condition assessment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunDiagnostic}
            disabled={isScanning}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning Vitals..." : "Run AI Health Scan"}
          </button>
        </div>
      </div>

      {/* Scanning Banner */}
      {isScanning && (
        <div className="glass-panel p-4 border-primary/40 bg-primary/5 flex items-center justify-between rounded-xl animate-pulse">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary animate-spin" />
            <div>
              <div className="text-sm font-semibold text-white">
                {scanStep === 1 && "Ingesting 1kHz vibration & thermographic telemetry..."}
                {scanStep === 2 && "Running Isolation Forest anomaly distance vector check..."}
                {scanStep === 3 && "Evaluating Fuzzy Logic memberships & Sugeno centroids..."}
                {scanStep === 4 && "Synthesizing clinical diagnostic report..."}
              </div>
              <div className="text-xs text-foreground/50 font-mono">Building Doctor Engine v2.4 · Live Pipeline</div>
            </div>
          </div>
          <div className="text-xs font-mono text-primary">{scanStep * 25}% COMPLETE</div>
        </div>
      )}

      {/* Top 4 Fleet Vitals KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-foreground/50 uppercase">
            <span>Overall Fleet Health</span>
            <Heart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold text-white tracking-tight">88.4%</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 8 of 10 subsystems nominal
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[88.4%]" />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-foreground/50 uppercase">
            <span>Critical Watchlist</span>
            <AlertTriangle className="w-4 h-4 text-[#ff4081]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold text-[#ff4081] tracking-tight">1 Asset</div>
            <div className="text-xs text-[#ff4081] flex items-center gap-1 mt-0.5">
              Pump-03 bearing fatigue
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#ff4081] h-full w-[25%]" />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-foreground/50 uppercase">
            <span>Min Fleet RUL</span>
            <Clock className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold text-white tracking-tight">6.2 <span className="text-lg font-normal text-foreground/60">Days</span></div>
            <div className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
              Window closing soon
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00e5ff] h-full w-[45%]" />
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-foreground/50 uppercase">
            <span>Doctor Confidence</span>
            <Gauge className="w-4 h-4 text-primary" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold text-white tracking-tight">96.8%</div>
            <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
              Multi-model ensemble
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[96.8%]" />
          </div>
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div>
        <div className="text-xs font-semibold uppercase text-foreground/50 tracking-wider mb-3">Select Asset for Deep Diagnostics</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(ASSETS_DATA) as AssetKey[]).map((key) => {
            const asset = ASSETS_DATA[key];
            const isSelected = selectedAsset === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedAsset(key)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected 
                    ? "bg-[#182436] border-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
                    : "glass-panel hover:bg-white/5 border-panel-border/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-xs font-bold text-white">{asset.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusColor(asset.status)}`}>
                    {asset.healthScore}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-white truncate">{asset.name}</div>
                <div className="text-[11px] text-foreground/50 truncate mt-1">{asset.type}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Diagnostic Dashboard for Selected Asset */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Health Score, Fuzzy Matrix, Diagnosis */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Health Gauge & Status */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-foreground/50 uppercase">ASSET HEALTH INDEX</span>
                <h2 className="text-2xl font-bold text-white mt-1">{currentAsset.name}</h2>
                <p className="text-xs text-foreground/60">{currentAsset.location}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-mono font-semibold rounded-full border ${getFuzzyBadgeColor(currentAsset.fuzzyState)}`}>
                State: {currentAsset.fuzzyState}
              </span>
            </div>

            <div className="my-8 flex flex-col items-center justify-center">
              {/* Circular Gauge Representation */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1f293d" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="42" 
                    fill="none" 
                    stroke={currentAsset.healthScore > 75 ? "#00e676" : currentAsset.healthScore > 50 ? "#f97316" : "#ff4081"} 
                    strokeWidth="8" 
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * currentAsset.healthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{currentAsset.healthScore}</span>
                  <span className="text-xs font-mono text-foreground/50 uppercase">Score / 100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full mt-6 pt-6 border-t border-panel-border/30">
                <div className="text-center">
                  <div className="text-xs font-mono text-foreground/50 uppercase">Estimated RUL</div>
                  <div className={`text-xl font-bold mt-1 ${currentAsset.rulDays < 10 ? "text-[#ff4081]" : "text-white"}`}>
                    {currentAsset.rulDays} <span className="text-xs font-normal text-foreground/60">Days</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-mono text-foreground/50 uppercase">Failure Risk</div>
                  <div className={`text-xl font-bold mt-1 ${currentAsset.failProb > 50 ? "text-[#ff4081]" : "text-emerald-400"}`}>
                    {currentAsset.failProb}%
                  </div>
                </div>
              </div>
            </div>

            {/* Fuzzy Logic Breakdown */}
            <div className="bg-[#10141d]/80 rounded-xl p-4 border border-panel-border/40 text-xs">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-panel-border/30">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Sugeno Fuzzy Logic Engine
                </span>
                <span className="text-primary font-mono text-[10px]">ISO-FOREST ENSEMBLE</span>
              </div>
              <div className="flex justify-between py-1 text-foreground/70">
                <span>RUL Membership:</span>
                <span className="font-mono text-white">{currentAsset.fuzzyFactors.rulMembership}</span>
              </div>
              <div className="flex justify-between py-1 text-foreground/70">
                <span>Failure Risk Membership:</span>
                <span className="font-mono text-white">{currentAsset.fuzzyFactors.failMembership}</span>
              </div>
              <div className="flex justify-between py-1 text-foreground/70">
                <span>IsoForest Anomaly Distance:</span>
                <span className="font-mono text-white">{currentAsset.fuzzyFactors.anomalyScore}</span>
              </div>
            </div>
          </div>

          {/* Doctor Diagnosis & Treatment Card */}
          <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-primary flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase mb-3">
                <Stethoscope className="w-4 h-4" /> Doctor Clinical Diagnosis
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{currentAsset.diagnosis}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-6 bg-primary/5 p-3 rounded-lg border border-primary/20">
                <span className="text-primary font-semibold">Prescription:</span> {currentAsset.prescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href="/calendar"
                className="flex-1 flex items-center justify-center gap-2 bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-bold py-2.5 px-4 rounded-xl text-sm transition-colors text-center"
              >
                Schedule Work Order <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/whatif"
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 px-4 rounded-xl text-sm border border-panel-border transition-colors text-center"
              >
                Simulate Delay <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Live Telemetry Gauges and Charts */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 4 Sensor Vitals Quick Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "vibration", label: "Vibration", icon: Activity, data: currentAsset.sensors.vibration },
              { key: "temperature", label: "Temperature", icon: Thermometer, data: currentAsset.sensors.temperature },
              { key: "current", label: "Current Draw", icon: Zap, data: currentAsset.sensors.current },
              { key: "pressure", label: "Pressure", icon: Gauge, data: currentAsset.sensors.pressure },
            ].map(({ key, label, icon: Icon, data }) => {
              const isActive = activeMetric === key;
              const isAlert = data.status === "alert";
              const isWarn = data.status === "warn";
              return (
                <button
                  key={key}
                  onClick={() => setActiveMetric(key as any)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isActive 
                      ? "bg-[#182436] border-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
                      : "glass-panel hover:bg-white/5 border-panel-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-foreground/50 uppercase">{label}</span>
                    <Icon className={`w-4 h-4 ${isAlert ? "text-[#ff4081]" : isWarn ? "text-orange-400" : "text-emerald-400"}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">
                      {data.val} <span className="text-xs font-normal text-foreground/60">{data.unit}</span>
                    </div>
                    <div className="text-[10px] text-foreground/50 font-mono mt-1">
                      Baseline: {data.baseline} {data.unit}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Telemetry Chart */}
          <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <span className="text-xs font-mono text-foreground/50 uppercase">24-HOUR TELEMETRY TREND</span>
                <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                  {activeMetric} vs Operational Baseline ({currentAsset.sensors[activeMetric].unit})
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-primary">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" /> Live Value
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Threshold
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222f46" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#141b29", borderColor: "#00e5ff", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#00e5ff" }}
                  />
                  <ReferenceLine y={currentAsset.sensors[activeMetric].baseline * 1.4} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Warning Limit', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="value" stroke="#00e5ff" strokeWidth={2.5} fillOpacity={1} fill="url(#metricGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-panel-border/30 text-xs text-foreground/60">
              <div>
                <span className="font-mono text-foreground/40 block">SAMPLING FREQUENCY</span>
                <span className="font-semibold text-white">1,000 Hz Continuous</span>
              </div>
              <div>
                <span className="font-mono text-foreground/40 block">DEVIATION FROM NORM</span>
                <span className={`font-semibold ${currentAsset.sensors[activeMetric].status !== "ok" ? "text-orange-400" : "text-emerald-400"}`}>
                  +{Math.round(((currentAsset.sensors[activeMetric].val - currentAsset.sensors[activeMetric].baseline) / currentAsset.sensors[activeMetric].baseline) * 100)}%
                </span>
              </div>
              <div>
                <span className="font-mono text-foreground/40 block">LAST CALIBRATION</span>
                <span className="font-semibold text-white">14 Days Ago (ISO-10816)</span>
              </div>
            </div>
          </div>

          {/* Clinical Case Notes / Explanation */}
          <div className="glass-panel p-5 rounded-2xl flex items-start gap-4 bg-[#141b28]/60">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white text-sm">Building Doctor Medical Chart</span>
                <span className="text-foreground/40 font-mono">Case #BD-2026-993</span>
              </div>
              <p className="text-foreground/70 leading-relaxed">
                Telemetry streams match failure profile <strong>BPFI (Ball Pass Frequency Inner Race)</strong>. 
                Vibration spectral peak correlates directly with current draw spikes at harmonic frequency (120 Hz). 
                Immediate intervention is advised before cavitation propagation damages the primary impeller housing.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
