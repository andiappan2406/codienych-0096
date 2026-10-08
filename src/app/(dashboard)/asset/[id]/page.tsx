"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Activity, AlertTriangle, ShieldAlert, Zap, Wrench } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

const healthHistory = [
  { day: "-5d", health: 94 },
  { day: "-4d", health: 91 },
  { day: "-3d", health: 87 },
  { day: "-2d", health: 79 },
  { day: "-1d", health: 68 },
  { day: "Now", health: 48 },
];

const sensorData = [
  { time: "08:00", temp: 40, vib: 2.0 },
  { time: "09:00", temp: 41, vib: 2.1 },
  { time: "10:00", temp: 43, vib: 2.4 },
  { time: "11:00", temp: 47, vib: 3.1 },
  { time: "12:00", temp: 53, vib: 4.5 },
];

export default function AssetDetail() {
  return (
    <React.Suspense fallback={<div>Loading AI Analysis...</div>}>
      <AssetDetailContent />
    </React.Suspense>
  );
}

function AssetDetailContent() {
  const params = useParams();
  const id = (params.id as string)?.toUpperCase() || "ASSET";

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <Link href="/assets" className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{id}</h1>
            <p className="text-foreground/60 mt-1">Detailed AI analysis and health prediction.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            <Wrench className="w-4 h-4" /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard label="HEALTH" value="48" suffix="/ 100" />
        <MetricCard label="FAILURE RISK" value="91" suffix="%" color="text-critical" />
        <MetricCard label="RUL ESTIMATE" value="48-96" suffix="hours" />
        <MetricCard label="CONFIDENCE" value="94" suffix="%" color="text-primary" />
        <MetricCard label="DATA QUALITY" value="98" suffix="%" color="text-healthy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-mono text-foreground/60 uppercase">Live Sensor Telemetry</h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Temperature (°C)</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" /> Vibration (mm/s)</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12141A', borderColor: '#1E2128', borderRadius: '8px' }} itemStyle={{ fontSize: '12px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#00E5FF" strokeWidth={2} dot={{ r: 4, fill: "#00E5FF", strokeWidth: 0 }} />
                  <Line yAxisId="right" type="monotone" dataKey="vib" stroke="#FFB300" strokeWidth={2} dot={{ r: 4, fill: "#FFB300", strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6">Historical Health Degradation</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthHistory} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF1744" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12141A', borderColor: '#1E2128', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="health" stroke="#F5F5F7" fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6">Fuzzy Logic Memberships</h3>
            <div className="flex flex-col gap-6">
              <FuzzyMembership label="Temperature" value={53} unit="°C" states={["Normal", "Warm", "High", "Critical"]} percentage={85} color="text-critical border-critical bg-critical" />
              <FuzzyMembership label="Vibration" value={4.5} unit="mm/s" states={["Stable", "Elevated", "High", "Severe"]} percentage={80} color="text-critical border-critical bg-critical" />
              <FuzzyMembership label="Current" value={28} unit="A" states={["Normal", "Elevated", "High"]} percentage={90} color="text-warning border-warning bg-warning" />
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 border-t-2 border-t-primary relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[50px] -z-10 rounded-full" />
            
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-lg font-semibold tracking-tight">AI Reasoning</h2>
              </div>
              <p className="text-xs text-foreground/60">Neuro-symbolic reasoning chain</p>
            </div>

            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <ReasoningStep text="Environmental Context" />
              <ReasoningStep text="Expected HVAC Load" />
              <ReasoningStep text="Observed Sensor Deviation" />
              <ReasoningStep text="Vibration + Temp + Current" highlight />
              <ReasoningStep text="Neural Pattern Detected" />
              <ReasoningStep text="Fuzzy Risk = HIGH" alert />
              <ReasoningStep text="Symbolic Rules = CONSISTENT" />
              <ReasoningStep text="Historical Match = STRONG" />
              <div className="mt-2 p-2 bg-critical/10 border border-critical/30 rounded text-critical font-bold text-center flex justify-between items-center px-4">
                <span>FINAL RISK</span>
                <span>HIGH</span>
              </div>
            </div>

            <div className="bg-panel-border h-px w-full my-1" />

            <div>
              <h3 className="text-sm font-mono text-foreground/60 uppercase mb-3">Multi-Model Agreement</h3>
              <div className="flex flex-col gap-2 text-xs font-medium">
                <div className="flex justify-between"><span className="text-foreground/70">Anomaly Model</span><span className="text-critical">HIGH</span></div>
                <div className="flex justify-between"><span className="text-foreground/70">Failure Model</span><span className="text-critical font-mono">91%</span></div>
                <div className="flex justify-between"><span className="text-foreground/70">Temporal Model</span><span className="text-warning font-mono">87%</span></div>
                <div className="flex justify-between"><span className="text-foreground/70">Fuzzy Risk</span><span className="text-critical">HIGH</span></div>
                <div className="flex justify-between"><span className="text-foreground/70">Sensor Quality</span><span className="text-healthy font-mono">98%</span></div>
              </div>
            </div>

            <div className="bg-panel-border h-px w-full my-1" />

            <div>
              <h3 className="text-sm font-mono text-foreground/60 uppercase mb-3">Possible Causes</h3>
              <div className="flex flex-col gap-2 text-xs">
                <CauseRow cause="01 Bearing degradation" prob={71} />
                <CauseRow cause="02 Motor overload" prob={16} />
                <CauseRow cause="03 Cooling problem" prob={9} />
                <CauseRow cause="04 Sensor issue" prob={4} />
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix, color = "text-foreground" }: { label: string, value: string, suffix: string, color?: string }) {
  return (
    <div className="glass-panel p-6 border-t border-t-panel-border hover:border-t-primary/50 transition-colors">
      <h3 className="text-xs font-mono text-foreground/50 uppercase mb-4">{label}</h3>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-semibold tracking-tight ${color}`}>{value}</span>
        <span className="text-foreground/50 text-sm">{suffix}</span>
      </div>
    </div>
  )
}

function ContributorBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground/80">{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ReasoningStep({ text, highlight, alert }: { text: string, highlight?: boolean, alert?: boolean }) {
  let color = "text-foreground/70";
  if (highlight) color = "text-warning font-semibold";
  if (alert) color = "text-critical font-semibold";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`${color} bg-panel/50 border border-panel-border px-3 py-1 rounded w-full text-center truncate`}>{text}</span>
      <span className="text-border text-[10px]">▼</span>
    </div>
  )
}

function CauseRow({ cause, prob }: { cause: string, prob: number }) {
  return (
    <div className="flex items-center justify-between p-2 bg-panel/50 border border-panel-border rounded">
      <span className="text-foreground/80">{cause}</span>
      <span className="font-mono text-primary">{prob}%</span>
    </div>
  )
}

function FuzzyMembership({ label, value, unit, states, percentage, color }: { label: string, value: number, unit: string, states: string[], percentage: number, color: string }) {
  const textColor = color.split(' ').find(c => c.startsWith('text-')) || 'text-primary';
  return (
    <div>
      <div className="flex justify-between text-xs mb-3">
        <span className="text-foreground/80 font-medium">{label}</span>
      </div>
      <div className="relative pt-4 pb-4">
        <div className="flex justify-between absolute top-0 w-full text-[10px] text-foreground/50 font-mono">
          {states.map((s, i) => (
            <span key={i} className="flex-1 text-center border-l border-panel-border h-2 -ml-px block">
              <span className="block mt-2">{s}</span>
            </span>
          ))}
          <span className="border-l border-panel-border h-2 absolute right-0" />
        </div>
        
        <div className="h-px w-full bg-border relative mt-6">
          <div className="absolute top-0 -mt-2 -ml-3 flex flex-col items-center" style={{ left: `${percentage}%` }}>
            <span className={`text-xs ${textColor}`}>▼</span>
            <span className={`text-xs font-mono font-bold ${textColor} mt-0.5`}>{value}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

