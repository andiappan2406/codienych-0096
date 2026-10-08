"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Activity, AlertTriangle, ShieldAlert, Zap, Wrench } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { DEFAULT_ASSETS, AssetData } from "@/data/mockAssets";

export default function AssetDetail() {
  return (
    <React.Suspense fallback={<div className="p-8 text-primary animate-pulse">Loading AI Analysis...</div>}>
      <AssetDetailContent />
    </React.Suspense>
  );
}

function AssetDetailContent() {
  const params = useParams();
  const id = (params.id as string)?.toUpperCase() || "HVAC-01";

  const [assetData, setAssetData] = useState<AssetData>(() => {
    return (
      DEFAULT_ASSETS.find(
        (a) => a.id.toUpperCase() === id || a.asset_type.toUpperCase() === id || a.id.toUpperCase().startsWith(id)
      ) || DEFAULT_ASSETS[0]
    );
  });

  useEffect(() => {
    fetch(`/api/assets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.asset) {
          setAssetData(data.asset);
        }
      })
      .catch(() => {
        // Fallback to searching all assets
        fetch("/api/assets")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data?.assets)) {
              const found = data.assets.find(
                (a: any) =>
                  a.id.toUpperCase() === id ||
                  a.asset_type.toUpperCase() === id ||
                  a.id.toUpperCase().startsWith(id)
              );
              if (found) setAssetData(found);
            }
          })
          .catch(() => {});
      });
  }, [id]);

  const healthState = assetData.health.state;
  const rootCause = assetData.neurosymbolic.root_cause;
  const failureProb = assetData.predictions.failure_probability;
  const sensors = assetData.sensors;

  // Dynamic telemetry chart points calculated around real sensor values
  const sensorData = [
    { time: "08:00", temp: +(sensors.temperature * 0.85).toFixed(1), vib: +(sensors.vibration * 0.75).toFixed(2) },
    { time: "09:00", temp: +(sensors.temperature * 0.88).toFixed(1), vib: +(sensors.vibration * 0.80).toFixed(2) },
    { time: "10:00", temp: +(sensors.temperature * 0.92).toFixed(1), vib: +(sensors.vibration * 0.88).toFixed(2) },
    { time: "11:00", temp: +(sensors.temperature * 0.96).toFixed(1), vib: +(sensors.vibration * 0.94).toFixed(2) },
    { time: "12:00", temp: sensors.temperature, vib: sensors.vibration },
  ];

  // Dynamic historical degradation curve leading to current health score
  const healthHistory = [
    { day: "-5d", health: Math.min(100, assetData.health.score + 35) },
    { day: "-4d", health: Math.min(100, assetData.health.score + 28) },
    { day: "-3d", health: Math.min(100, assetData.health.score + 20) },
    { day: "-2d", health: Math.min(100, assetData.health.score + 12) },
    { day: "-1d", health: Math.min(100, assetData.health.score + 5) },
    { day: "Now", health: assetData.health.score },
  ];

  const getStatusColor = () => {
    if (healthState === "Critical") return "text-critical";
    if (healthState === "Warning" || healthState === "High") return "text-warning";
    return "text-healthy";
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Header */}
      <div>
        <Link
          href="/assets"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-foreground/60 hover:text-primary mb-3 sm:mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {assetData.type_label} ({assetData.id})
            </h1>
            <p className="text-foreground/60 text-xs sm:text-sm mt-1">Detailed AI analysis and health prediction.</p>
          </div>
          <Link
            href="/maintenance"
            className="flex items-center justify-center gap-2 bg-primary text-black px-4 py-2.5 rounded-lg font-medium text-xs sm:text-sm hover:bg-primary/90 transition-colors self-start sm:self-center"
          >
            <Wrench className="w-4 h-4" /> Schedule Maintenance
          </Link>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard label="HEALTH SCORE" value={`${assetData.health.score}`} suffix="/ 100" />
        <MetricCard
          label="FAILURE RISK"
          value={`${assetData.predictions.failure_probability}`}
          suffix="%"
          color={healthState === "Critical" ? "text-critical" : "text-warning"}
        />
        <MetricCard label="RUL ESTIMATE" value={`${assetData.predictions.rul_days}`} suffix="days" />
        <MetricCard label="CONFIDENCE" value="96" suffix="%" color="text-primary" />
        <MetricCard label="DATA QUALITY" value="99" suffix="%" color="text-healthy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider">Live Sensor Telemetry</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Temperature (°C)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-warning" /> Vibration (mm/s)
                </span>
              </div>
            </div>
            <div className="h-[240px] sm:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#12141A", borderColor: "#1E2128", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#00E5FF" strokeWidth={2.5} dot={{ r: 3.5, fill: "#00E5FF" }} />
                  <Line yAxisId="right" type="monotone" dataKey="vib" name="Vibration (mm/s)" stroke="#FFB300" strokeWidth={2.5} dot={{ r: 3.5, fill: "#FFB300" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider mb-6">Historical Health Degradation</h3>
            <div className="h-[180px] sm:h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF1744" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#12141A", borderColor: "#1E2128", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="health" stroke="#F5F5F7" fillOpacity={1} fill="url(#colorHealth)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider mb-6">Fuzzy Logic Memberships</h3>
            <div className="flex flex-col gap-6">
              <FuzzyMembership
                label="Temperature"
                value={assetData.sensors.temperature}
                unit="°C"
                states={["Normal", "Warm", "High", "Critical"]}
                percentage={Math.min(100, Math.max(0, (assetData.sensors.temperature / 100) * 100))}
                color="text-critical"
              />
              <FuzzyMembership
                label="Vibration"
                value={assetData.sensors.vibration}
                unit="mm/s"
                states={["Stable", "Elevated", "High", "Severe"]}
                percentage={Math.min(100, Math.max(0, (assetData.sensors.vibration / 10) * 100))}
                color="text-critical"
              />
              <FuzzyMembership
                label="Current"
                value={assetData.sensors.current}
                unit="A"
                states={["Normal", "Elevated", "High"]}
                percentage={Math.min(100, Math.max(0, (assetData.sensors.current / 50) * 100))}
                color="text-warning"
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 border-t-2 border-t-primary relative overflow-hidden flex flex-col gap-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[50px] -z-10 rounded-full" />

            <div>
              <div className="flex items-center gap-2 mb-1.5 text-primary">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">AI Reasoning Chain</h2>
              </div>
              <p className="text-xs text-foreground/60">Neuro-symbolic explainability engine</p>
            </div>

            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <ReasoningStep text="1. Dynamic Telemetry Context Ingested" />
              <ReasoningStep text="2. Multidimensional Baseline Deviation Checked" />
              <ReasoningStep text="3. Vibration + Temp Correlation Flagged" highlight />
              <ReasoningStep text="4. Neural Classifier Pattern Triggered" />
              <ReasoningStep
                text={`5. Fuzzy Risk State = ${healthState.toUpperCase()}`}
                alert={healthState === "Critical"}
                highlight={healthState === "Warning" || healthState === "High"}
              />
              <ReasoningStep text={`6. Symbolic Rule: ${rootCause}`} />
              <div className="mt-2 p-2.5 bg-critical/10 border border-critical/30 rounded-lg text-critical font-bold text-center flex justify-between items-center px-4">
                <span>SEVERITY RISK</span>
                <span>{healthState.toUpperCase()}</span>
              </div>
            </div>

            <div className="bg-panel-border h-px w-full my-0.5" />

            <div>
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider mb-3">Multi-Model Agreement</h3>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Watch Anomaly Agent</span>
                  <span className={getStatusColor()}>{healthState.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Diagnose Failure Model</span>
                  <span className={`${getStatusColor()} font-mono font-bold`}>{failureProb}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Predict RUL Regressor</span>
                  <span className="text-primary font-mono">{assetData.predictions.rul_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Neuro-Symbolic Planner</span>
                  <span className="text-healthy font-mono">READY</span>
                </div>
              </div>
            </div>

            <div className="bg-panel-border h-px w-full my-0.5" />

            <div>
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider mb-3">Possible Causes</h3>
              <div className="flex flex-col gap-2 text-xs">
                <CauseRow cause={`01 ${rootCause}`} prob={72} />
                <CauseRow cause="02 Motor bearing friction" prob={15} />
                <CauseRow cause="03 Cooling loop pressure variance" prob={9} />
                <CauseRow cause="04 Sensor calibration drift" prob={4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  color = "text-white",
}: {
  label: string;
  value: string;
  suffix: string;
  color?: string;
}) {
  return (
    <div className="glass-panel p-3.5 sm:p-4 rounded-xl border border-white/5 hover:border-primary/40 transition-colors">
      <h3 className="text-[10px] sm:text-xs font-mono text-foreground/50 uppercase mb-2 truncate">{label}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${color}`}>{value}</span>
        <span className="text-foreground/50 text-xs truncate">{suffix}</span>
      </div>
    </div>
  );
}

function ReasoningStep({ text, highlight, alert }: { text: string; highlight?: boolean; alert?: boolean }) {
  let color = "text-foreground/70";
  if (highlight) color = "text-warning font-semibold";
  if (alert) color = "text-critical font-semibold";
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`${color} bg-panel/70 border border-panel-border px-2.5 py-1 rounded-md w-full text-center text-[11px] leading-tight break-words`}>
        {text}
      </span>
      <span className="text-border text-[9px]">▼</span>
    </div>
  );
}

function CauseRow({ cause, prob }: { cause: string; prob: number }) {
  return (
    <div className="flex items-center justify-between p-2 bg-panel/50 border border-panel-border/60 rounded-lg text-xs gap-2">
      <span className="text-foreground/80 truncate">{cause}</span>
      <span className="font-mono text-primary font-semibold shrink-0">{prob}%</span>
    </div>
  );
}

function FuzzyMembership({
  label,
  value,
  unit,
  states,
  percentage,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  states: string[];
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-foreground/80 font-medium">{label}</span>
      </div>
      <div className="relative pt-3 pb-3">
        <div className="flex justify-between absolute top-0 w-full text-[9px] sm:text-[10px] text-foreground/50 font-mono">
          {states.map((s, i) => (
            <span key={i} className="flex-1 text-center border-l border-panel-border h-2 -ml-px block">
              <span className="block mt-1.5">{s}</span>
            </span>
          ))}
          <span className="border-l border-panel-border h-2 absolute right-0" />
        </div>

        <div className="h-px w-full bg-border relative mt-5">
          <div className="absolute top-0 -mt-2 -ml-3 flex flex-col items-center" style={{ left: `${percentage}%` }}>
            <span className={`text-[10px] ${color}`}>▼</span>
            <span className={`text-[10px] font-mono font-bold ${color} mt-0.5 whitespace-nowrap`}>
              {value}
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
