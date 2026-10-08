"use client";

import { useState, useEffect } from "react";
import { Heart, Activity, AlertCircle, TrendingUp, Settings2 } from "lucide-react";
import { DEFAULT_SIMULATION_RESULT } from "@/data/mockAssets";

export default function HealthPage() {
  const [data, setData] = useState<any>(DEFAULT_SIMULATION_RESULT);

  useEffect(() => {
    // Fetch initial health data
    fetch("http://localhost:8000/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_type: "PUMP", mode: "normal", step: 0 })
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(d => {
      if (d && d.sensors && d.health && d.predictions) {
        setData(d);
      }
    })
    .catch(err => {
      console.warn("Backend unavailable or returned error for health simulation:", err);
    });
  }, []);

  if (!data) {
    return <div className="p-8 text-foreground/60 animate-pulse">Loading health data...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Asset Health</h1>
          <p className="text-foreground/60 mt-2">Deep dive into current health metrics and fuzzy logic state.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Health Score */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col items-center justify-center text-center">
          <Heart className={`w-12 h-12 mb-4 ${data.health.score > 80 ? 'text-healthy' : data.health.score > 50 ? 'text-warning' : 'text-critical'}`} />
          <h2 className="text-6xl font-semibold tracking-tight">{data.health.score}</h2>
          <div className="text-sm text-foreground/60 mt-2 uppercase tracking-widest">Health Score</div>
          <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${data.health.state === 'Normal' ? 'bg-healthy/10 text-healthy border-healthy/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
            {data.health.state} State
          </div>
        </div>

        {/* Predictive Metrics */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Predictive Analytics
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <MetricBox label="Failure Probability" value={`${data.predictions.failure_probability}%`} />
             <MetricBox label="Remaining Useful Life" value={`${data.predictions.rul_days} Days`} />
             <MetricBox label="Anomaly Score" value={data.predictions.anomaly_score} />
             <MetricBox label="Anomaly Detected" value={data.predictions.is_anomaly ? "YES" : "NO"} />
          </div>
        </div>

        {/* Live Sensors */}
        <div className="lg:col-span-3 glass-panel p-6">
           <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6 flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Live Sensor Readings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <SensorBox label="Vibration" value={data.sensors.vibration} unit="mm/s" />
             <SensorBox label="Temperature" value={data.sensors.temperature} unit="°C" />
             <SensorBox label="Current" value={data.sensors.current} unit="A" />
             <SensorBox label="Pressure" value={data.sensors.pressure} unit="PSI" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="border border-panel-border bg-panel p-4 rounded-lg flex flex-col justify-center">
      <div className="text-xs text-foreground/50 mb-2">{label}</div>
      <div className="text-2xl font-mono">{value}</div>
    </div>
  )
}

function SensorBox({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="border border-panel-border bg-background/50 p-4 rounded-lg flex flex-col items-center text-center">
      <div className="text-xs text-foreground/50 mb-2">{label}</div>
      <div className="text-xl font-mono flex items-end gap-1">
        {value} <span className="text-xs text-foreground/40 mb-1">{unit}</span>
      </div>
    </div>
  )
}
