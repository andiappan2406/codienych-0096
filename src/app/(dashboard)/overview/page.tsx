"use client";

import { Activity, Flame, Zap, Check, CalendarDays, Wrench, Search, TrendingUp, HelpCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from "react";
import { DEFAULT_ASSETS, AssetData } from "@/data/mockAssets";

export default function OverviewPage() {
  const [criticalAsset, setCriticalAsset] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/assets")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
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
      .catch(err => {
        console.warn("Backend unavailable or returned error, using fallback assets:", err);
        const sorted = [...DEFAULT_ASSETS].sort((a: any, b: any) => 
          (b.predictions?.failure_probability ?? 0) - (a.predictions?.failure_probability ?? 0)
        );
        setCriticalAsset(sorted[0]);
        setLoading(false);
      });
  }, []);

  if (loading || !criticalAsset) {
    return <div className="flex items-center justify-center min-h-[60vh] text-primary animate-pulse">Running Neuro-Symbolic diagnostics...</div>;
  }

  // Generate some dummy chart data based on the real sensor data of the critical asset to make the graph look alive
  const sensorData = criticalAsset ? [
    { time: '10:00', vib: criticalAsset.sensors.vibration * 0.5, temp: criticalAsset.sensors.temperature * 0.8 },
    { time: '10:15', vib: criticalAsset.sensors.vibration * 0.6, temp: criticalAsset.sensors.temperature * 0.85 },
    { time: '10:30', vib: criticalAsset.sensors.vibration * 0.8, temp: criticalAsset.sensors.temperature * 0.9 },
    { time: '10:45', vib: criticalAsset.sensors.vibration * 0.9, temp: criticalAsset.sensors.temperature * 0.95 },
    { time: '11:00', vib: criticalAsset.sensors.vibration, temp: criticalAsset.sensors.temperature },
  ] : [];

  const timeleft = Math.max(1, Math.floor(criticalAsset.predictions.rul_days));

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Alert */}
      <div className="bg-[#1e293b] border-l-4 border-red-500 p-6 rounded-r-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Active Alert</span>
            <span className="text-[#94a3b8] text-sm">Detected 4 mins ago</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">AI predicts <span className="text-red-400">{criticalAsset.type_label} ({criticalAsset.id})</span> failure in {timeleft} days</h2>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          View Detail
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Graph */}
        <div className="col-span-9 bg-[#1a202c] rounded-2xl p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider">LIVE SENSOR DEVIATION</h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>Vibration</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Temperature</div>
            </div>
          </div>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <Line type="monotone" dataKey="vib" stroke="#06b6d4" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-2 left-1/2 ml-4 text-red-500 font-bold text-sm">Anomaly detected</div>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[#94a3b8] text-xs">
              <span>1 hour ago</span>
              <span>now</span>
            </div>
          </div>
        </div>

        {/* Time Left */}
        <div className="col-span-3 bg-[#1a202c] rounded-2xl p-6 flex flex-col items-center justify-between">
          <div className="w-full text-left">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider">TIME LEFT</h3>
          </div>
          <div className="flex flex-col items-center">
            <CalendarDays className="w-10 h-10 text-[#06b6d4] mb-2" />
            <div className="text-6xl font-bold text-[#ff6b6b] tracking-tighter">{timeleft}</div>
            <div className="text-2xl font-semibold text-white mt-[-5px]">days</div>
          </div>
          <div className="w-full text-center mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-center gap-2 mb-2">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center"><Check className="w-3.5 h-3.5 text-[#1a202c] stroke-[3]" /></div>)}
            </div>
            <p className="text-[#94a3b8] text-xs font-medium">4 of 4 AI models agree</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Why */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-8">WHY?</h3>
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex items-center gap-4">
              <Activity className="w-6 h-6 text-red-500" />
              <div className="flex-1 text-white font-medium">Shaking more ({criticalAsset.sensors.vibration} mm/s)</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[90%]" /></div>
            </div>
            <div className="flex items-center gap-4">
              <Flame className="w-6 h-6 text-[#f97316]" />
              <div className="flex-1 text-white font-medium">Getting hotter ({criticalAsset.sensors.temperature}°C)</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#f97316] w-[75%]" /></div>
            </div>
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-[#eab308]" />
              <div className="flex-1 text-white font-medium">Power diff ({criticalAsset.sensors.current}A)</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#eab308] w-[45%]" /></div>
            </div>
          </div>
        </div>

        {/* If We Wait */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-8">IF WE WAIT</h3>
          <div className="flex justify-between items-end flex-1 pb-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 h-8 border-b-4 border-black rounded-full top-2" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-xl">{criticalAsset.predictions.failure_probability - 20}%</div>
                <div className="text-white text-sm">Now</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f97316] flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 border-b-4 border-black top-8" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-[#f97316] font-bold text-xl">{criticalAsset.predictions.failure_probability}%</div>
                <div className="text-white text-sm">Soon</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 h-8 border-t-4 border-black rounded-full top-7" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-red-500 font-bold text-xl">99%</div>
                <div className="text-white text-sm">In {timeleft} days</div>
              </div>
            </div>
          </div>
          <div className="text-center text-[#94a3b8] text-sm">chance of breakdown</div>
        </div>

        {/* The Fix */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-2">NEURO-SYMBOLIC DIAGNOSIS</h3>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center mt-1 shrink-0">
              <Wrench className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold leading-tight">{criticalAsset.neurosymbolic.root_cause}</h2>
              <p className="text-[#94a3b8] mt-1 text-sm">{criticalAsset.neurosymbolic.recommended_action}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button className="bg-[#2dd4bf] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#14b8a6] transition-colors">Approve Work</button>
            <button className="bg-transparent border border-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors">Reject</button>
          </div>
        </div>

      </div>

      {/* AI Agents Pipeline */}
      <div className="flex items-center gap-3 mt-4">
        <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider w-24">AI AGENTS</h3>
        
        <div className="flex-1 flex items-center gap-2">
          <AgentBadge icon={Activity} label="Watch" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={Search} label="Diagnose" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={TrendingUp} label="Predict" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={CalendarDays} label="Plan" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={HelpCircle} label="Explain" active />
          <div className="h-[2px] flex-1 bg-slate-700" />
          <div className="px-4 py-2 rounded-full border border-slate-700 bg-[#1a202c] text-white text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
            Waiting Approval
          </div>
        </div>
      </div>

    </div>
  );
}

function AgentBadge({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${active ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]' : 'border-slate-700 bg-[#1a202c] text-slate-400'}`}>
      <Icon className="w-4 h-4" /> {label}
    </div>
  );
}

