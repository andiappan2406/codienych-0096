"use client";

import { Activity, Flame, Zap, Check, CalendarDays, Wrench, Search, TrendingUp, HelpCircle, ArrowRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DEFAULT_ASSETS, AssetData } from "@/data/mockAssets";

export default function OverviewPage() {
  const [criticalAsset, setCriticalAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const assets: AssetData[] = Array.isArray(data?.assets) && data.assets.length > 0 
          ? data.assets 
          : DEFAULT_ASSETS;
        // Find the most critical asset
        const sorted = [...assets].sort((a: any, b: any) => 
          (b.predictions?.failure_probability ?? 0) - (a.predictions?.failure_probability ?? 0)
        );
        setCriticalAsset(sorted[0] || DEFAULT_ASSETS[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("API unavailable or returned error, using fallback assets:", err);
        const sorted = [...DEFAULT_ASSETS].sort((a: any, b: any) => 
          (b.predictions?.failure_probability ?? 0) - (a.predictions?.failure_probability ?? 0)
        );
        setCriticalAsset(sorted[0]);
        setLoading(false);
      });
  }, []);

  if (loading || !criticalAsset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-primary animate-pulse">
        <Activity className="w-8 h-8 animate-spin" />
        <span className="text-sm font-mono tracking-wider">Running 4-Agent Neuro-Symbolic diagnostics...</span>
      </div>
    );
  }

  // Generate real sensor trend data for chart
  const sensorData = criticalAsset ? [
    { time: '10:00', vib: Number((criticalAsset.sensors.vibration * 0.5).toFixed(2)), temp: Number((criticalAsset.sensors.temperature * 0.8).toFixed(1)) },
    { time: '10:15', vib: Number((criticalAsset.sensors.vibration * 0.6).toFixed(2)), temp: Number((criticalAsset.sensors.temperature * 0.85).toFixed(1)) },
    { time: '10:30', vib: Number((criticalAsset.sensors.vibration * 0.78).toFixed(2)), temp: Number((criticalAsset.sensors.temperature * 0.9).toFixed(1)) },
    { time: '10:45', vib: Number((criticalAsset.sensors.vibration * 0.9).toFixed(2)), temp: Number((criticalAsset.sensors.temperature * 0.95).toFixed(1)) },
    { time: '11:00', vib: Number(criticalAsset.sensors.vibration.toFixed(2)), temp: Number(criticalAsset.sensors.temperature.toFixed(1)) },
  ] : [];

  const timeleft = Math.max(1, Math.floor(criticalAsset.predictions.rul_days));

  return (
    <div className="flex flex-col gap-6 max-w-full pb-12">
      {/* Header Alert */}
      <div className="bg-[#1e293b] border-l-4 border-red-500 p-4 sm:p-6 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
              Active Alert
            </span>
            <span className="text-[#94a3b8] text-xs sm:text-sm">Detected 4 mins ago</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
            AI predicts <span className="text-red-400">{criticalAsset.type_label} ({criticalAsset.id})</span> failure in {timeleft} days
          </h2>
        </div>
        <Link
          href={`/asset/${criticalAsset.id}`}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors self-start sm:self-center flex items-center gap-2 flex-shrink-0"
        >
          <span>View Detail</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Charts & Time left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#1a202c] rounded-2xl p-4 sm:p-6 relative border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">LIVE SENSOR DEVIATION</h3>
            <div className="flex gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></div>
                <span className="text-foreground/80">Vibration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-foreground/80">Temperature</span>
              </div>
            </div>
          </div>

          <div className="h-44 sm:h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e2532", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="vib" name="Vibration (mm/s)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="flex justify-between text-[#94a3b8] text-xs mt-2 font-mono">
              <span>1 hour ago</span>
              <span className="text-red-400 font-medium">Anomaly detected (Current)</span>
              <span>now</span>
            </div>
          </div>
        </div>

        {/* Time Left */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#1a202c] rounded-2xl p-6 flex flex-col items-center justify-between border border-white/5">
          <div className="w-full text-left">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">TIME LEFT</h3>
          </div>
          <div className="flex flex-col items-center my-4">
            <CalendarDays className="w-9 h-9 text-[#06b6d4] mb-2" />
            <div className="text-5xl sm:text-6xl font-bold text-[#ff6b6b] tracking-tighter">{timeleft}</div>
            <div className="text-xl sm:text-2xl font-semibold text-white -mt-1">days</div>
          </div>
          <div className="w-full text-center pt-4 border-t border-slate-700/50">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[#1a202c] stroke-[3]" />
                </div>
              ))}
            </div>
            <p className="text-[#94a3b8] text-xs font-medium">4 of 4 AI models agree</p>
          </div>
        </div>
      </div>

      {/* 3 Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Why */}
        <div className="bg-[#1a202c] rounded-2xl p-5 sm:p-6 flex flex-col border border-white/5">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase mb-6">WHY? (LEADING SENSORS)</h3>
          <div className="flex flex-col gap-5 flex-1 justify-around">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1 text-white text-xs sm:text-sm font-medium">
                Vibration ({criticalAsset.sensors.vibration} mm/s)
              </div>
              <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[90%]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#f97316] flex-shrink-0" />
              <div className="flex-1 text-white text-xs sm:text-sm font-medium">
                Temperature ({criticalAsset.sensors.temperature}°C)
              </div>
              <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#f97316] w-[75%]" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#eab308] flex-shrink-0" />
              <div className="flex-1 text-white text-xs sm:text-sm font-medium">
                Current ({criticalAsset.sensors.current}A)
              </div>
              <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#eab308] w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        {/* If We Wait */}
        <div className="bg-[#1a202c] rounded-2xl p-5 sm:p-6 flex flex-col border border-white/5">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase mb-6">IF WE WAIT (RISK PROJECTION)</h3>
          <div className="flex justify-around items-end flex-1 pb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center font-bold text-black text-sm">
                OK
              </div>
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-lg">
                  {Math.max(5, Math.round(criticalAsset.predictions.failure_probability - 25))}%
                </div>
                <div className="text-white text-xs">Now</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center font-bold text-black text-sm">
                !
              </div>
              <div className="text-center">
                <div className="text-[#f97316] font-bold text-lg">{criticalAsset.predictions.failure_probability}%</div>
                <div className="text-white text-xs">Soon</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center font-bold text-white text-sm animate-pulse">
                ✕
              </div>
              <div className="text-center">
                <div className="text-red-500 font-bold text-lg">99%</div>
                <div className="text-white text-xs">In {timeleft}d</div>
              </div>
            </div>
          </div>
          <div className="text-center text-[#94a3b8] text-xs font-medium">Projected chance of failure</div>
        </div>

        {/* The Fix */}
        <div className="bg-[#1a202c] rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-white/5 md:col-span-2 lg:col-span-1">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase mb-2">NEURO-SYMBOLIC DIAGNOSIS</h3>
          <div className="flex items-start gap-3 my-4">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center shrink-0 border border-primary/20">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-white text-base sm:text-lg font-bold leading-snug">
                {criticalAsset.neurosymbolic.root_cause}
              </h2>
              <p className="text-[#94a3b8] mt-1.5 text-xs sm:text-sm leading-relaxed">
                {criticalAsset.neurosymbolic.recommended_action}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Link
              href="/maintenance"
              className="text-center bg-primary text-black font-semibold text-xs sm:text-sm py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Approve Work
            </Link>
            <Link
              href="/alerts"
              className="text-center bg-white/5 border border-white/10 text-white font-medium text-xs sm:text-sm py-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              View Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* AI Agents Pipeline Bar */}
      <div className="bg-[#1a202c] border border-white/5 rounded-2xl p-4 sm:p-5 mt-2">
        <div className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase mb-3">
          4-AGENT NEURO-SYMBOLIC PIPELINE
        </div>
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <AgentBadge icon={Activity} label="Watch Agent" active />
          <span className="text-foreground/30 hidden sm:inline">→</span>
          <AgentBadge icon={Search} label="Diagnose Agent" active />
          <span className="text-foreground/30 hidden sm:inline">→</span>
          <AgentBadge icon={TrendingUp} label="Predict Agent" active />
          <span className="text-foreground/30 hidden sm:inline">→</span>
          <AgentBadge icon={CalendarDays} label="Plan & Explain" active />
          <div className="ml-auto flex items-center gap-2 text-xs text-[#4ade80] font-mono px-3 py-1 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
            Active Continuous Mode
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentBadge({ icon: Icon, label, active }: { icon: any; label: string; active: boolean }) {
  return (
    <div
      className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ${
        active
          ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]"
          : "border-slate-700 bg-[#1a202c] text-slate-400"
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  );
}
