"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, Sliders, AlertTriangle, TrendingUp, DollarSign, 
  Clock, ShieldAlert, RotateCcw, ArrowRight, Zap, Flame, 
  Activity, CheckCircle2, ChevronRight, Sparkles, Building2
} from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, ReferenceLine 
} from "recharts";

type AssetType = "PUMP-03" | "CHIL-01" | "ELEV-02";

export default function WhatIfPage() {
  const [selectedAsset, setSelectedAsset] = useState<AssetType>("PUMP-03");
  
  // Interactive Sliders
  const [delayDays, setDelayDays] = useState(5);
  const [loadFactor, setLoadFactor] = useState(100); // 50% to 150%
  const [tempSpike, setTempSpike] = useState(4); // 0 to 15 deg C
  const [dailyHours, setDailyHours] = useState(18); // 8 to 24 hours

  // Preset Configurations
  const applyPreset = (preset: "immediate" | "delay7" | "heatwave" | "overtime") => {
    switch (preset) {
      case "immediate":
        setDelayDays(0);
        setLoadFactor(100);
        setTempSpike(0);
        setDailyHours(16);
        break;
      case "delay7":
        setDelayDays(7);
        setLoadFactor(100);
        setTempSpike(2);
        setDailyHours(18);
        break;
      case "heatwave":
        setDelayDays(4);
        setLoadFactor(130);
        setTempSpike(10);
        setDailyHours(22);
        break;
      case "overtime":
        setDelayDays(6);
        setLoadFactor(140);
        setTempSpike(6);
        setDailyHours(24);
        break;
    }
  };

  // Dynamic calculations based on sliders
  const baselineFailProb = selectedAsset === "PUMP-03" ? 22 : selectedAsset === "CHIL-01" ? 15 : 8;
  const baseRul = selectedAsset === "PUMP-03" ? 9.0 : selectedAsset === "CHIL-01" ? 24.0 : 45.0;
  const preventCost = selectedAsset === "PUMP-03" ? 650 : selectedAsset === "CHIL-01" ? 1200 : 850;
  const emergencyCost = selectedAsset === "PUMP-03" ? 14800 : selectedAsset === "CHIL-01" ? 38500 : 22000;

  // Stress multiplier
  const stressMultiplier = (1 + (delayDays * 0.12)) * (loadFactor / 100) * (1 + (tempSpike * 0.03)) * (dailyHours / 16);
  
  const simulatedFailProb = Math.min(99, Math.round(baselineFailProb * stressMultiplier));
  const simulatedRulDays = Math.max(0.5, Number((baseRul / Math.max(1, stressMultiplier)).toFixed(1)));
  const projectedLoss = Math.round(preventCost + (simulatedFailProb / 100) * emergencyCost);

  // Failure trajectory curve across 14 days
  const trajectoryData = React.useMemo(() => {
    const data = [];
    for (let day = 0; day <= 14; day++) {
      // Baseline trajectory
      const baseRisk = Math.min(98, Math.round(baselineFailProb + (day * 3.5)));
      
      // What-if simulated trajectory
      let simRisk = baselineFailProb;
      if (day <= delayDays) {
        simRisk = baselineFailProb + (day * 6.5 * (stressMultiplier * 0.7));
      } else {
        simRisk = baselineFailProb + (delayDays * 6.5 * (stressMultiplier * 0.7)) + ((day - delayDays) * 11);
      }
      simRisk = Math.min(99, Math.round(simRisk));

      data.push({
        day: `Day ${day}`,
        baseline: baseRisk,
        simulated: simRisk,
      });
    }
    return data;
  }, [baselineFailProb, delayDays, stressMultiplier]);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-panel-border/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-1">
            <HelpCircle className="w-4 h-4" /> Predictive Counterfactual Engine
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">What-If Scenario Simulator</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Evaluate the financial, operational, and cascading risk of postponing maintenance or operating under extreme conditions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => applyPreset("immediate")}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono border border-panel-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Asset Selector & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Asset Selector */}
        <div className="lg:col-span-5 flex items-center gap-2 bg-[#121722]/80 p-1.5 rounded-xl border border-panel-border/50">
          {[
            { id: "PUMP-03", name: "Pump 3 (At Risk)" },
            { id: "CHIL-01", name: "Chiller 1 (Watch)" },
            { id: "ELEV-02", name: "Lift 2 (Nominal)" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAsset(item.id as AssetType)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                selectedAsset === item.id 
                  ? "bg-primary text-black shadow-md" 
                  : "text-foreground/70 hover:text-white"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Quick Presets */}
        <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-foreground/40 mr-1 uppercase">Scenario Presets:</span>
          <button
            onClick={() => applyPreset("delay7")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e2433] hover:bg-[#252f44] text-white border border-panel-border/60 transition-colors"
          >
            7-Day Maintenance Delay
          </button>
          <button
            onClick={() => applyPreset("heatwave")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2d1b1f] hover:bg-[#3d242a] text-[#ff4081] border border-[#ff4081]/30 transition-colors"
          >
            Heatwave (+10°C, 130% Load)
          </button>
          <button
            onClick={() => applyPreset("overtime")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2c2214] hover:bg-[#3c2f1c] text-orange-400 border border-orange-500/30 transition-colors"
          >
            24/7 Peak Overtime Run
          </button>
        </div>

      </div>

      {/* Main Grid: Controls vs Simulated Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-panel-border/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> Stress Variables
            </h2>
            <span className="text-xs font-mono text-primary">REAL-TIME INFERENCE</span>
          </div>

          {/* Slider 1: Maintenance Delay */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground/80 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Maintenance Delay
              </span>
              <span className="font-mono text-white font-bold bg-[#141b29] px-2 py-0.5 rounded border border-panel-border/40">
                +{delayDays} Days
              </span>
            </div>
            <input 
              type="range" min="0" max="14" step="1" 
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="w-full accent-[#00e5ff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-foreground/40">
              <span>0 Days (Immediate)</span>
              <span>7 Days</span>
              <span>14 Days (High Risk)</span>
            </div>
          </div>

          {/* Slider 2: Operational Load Factor */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground/80 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-400" /> Operational Load Factor
              </span>
              <span className="font-mono text-white font-bold bg-[#141b29] px-2 py-0.5 rounded border border-panel-border/40">
                {loadFactor}% Capacity
              </span>
            </div>
            <input 
              type="range" min="50" max="150" step="5" 
              value={loadFactor}
              onChange={(e) => setLoadFactor(Number(e.target.value))}
              className="w-full accent-orange-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-foreground/40">
              <span>50% (Eco Load)</span>
              <span>100% (Nominal)</span>
              <span>150% (Extreme Overload)</span>
            </div>
          </div>

          {/* Slider 3: Ambient Temperature Spike */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground/80 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" /> Ambient Thermal Spike
              </span>
              <span className="font-mono text-white font-bold bg-[#141b29] px-2 py-0.5 rounded border border-panel-border/40">
                +{tempSpike} °C
              </span>
            </div>
            <input 
              type="range" min="0" max="15" step="1" 
              value={tempSpike}
              onChange={(e) => setTempSpike(Number(e.target.value))}
              className="w-full accent-red-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-foreground/40">
              <span>+0°C Normal</span>
              <span>+7°C Summer High</span>
              <span>+15°C Heatwave Spike</span>
            </div>
          </div>

          {/* Slider 4: Run Hours per Day */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground/80 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Daily Duty Cycle
              </span>
              <span className="font-mono text-white font-bold bg-[#141b29] px-2 py-0.5 rounded border border-panel-border/40">
                {dailyHours} Hours/Day
              </span>
            </div>
            <input 
              type="range" min="8" max="24" step="1" 
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-foreground/40">
              <span>8h (Single Shift)</span>
              <span>16h (Double Shift)</span>
              <span>24h (Non-Stop Continuous)</span>
            </div>
          </div>

          {/* Summary Impact Callout */}
          <div className="bg-[#121722]/80 rounded-xl p-4 border border-panel-border/40 mt-auto">
            <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Multi-Variable Stress Factor
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Combined cumulative acceleration factor: <span className="text-primary font-mono font-bold">{stressMultiplier.toFixed(2)}x</span> baseline fatigue rate.
            </p>
          </div>

        </div>

        {/* Right Column: Outcomes & Trajectory Comparison */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 3 Outcome KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Projected Breakdown Risk */}
            <div className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border ${
              simulatedFailProb > 75 
                ? "border-[#ff4081]/50 bg-[#1e131b]/60" 
                : simulatedFailProb > 40 
                ? "border-orange-500/40 bg-[#1e1912]/60" 
                : "border-panel-border"
            }`}>
              <div className="text-xs font-mono text-foreground/50 uppercase">Projected Risk</div>
              <div className="my-2">
                <div className={`text-4xl font-extrabold tracking-tight ${
                  simulatedFailProb > 75 ? "text-[#ff4081]" : simulatedFailProb > 40 ? "text-orange-400" : "text-emerald-400"
                }`}>
                  {simulatedFailProb}%
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  Baseline: {baselineFailProb}% ({simulatedFailProb > baselineFailProb ? `+${simulatedFailProb - baselineFailProb}%` : "No change"})
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${simulatedFailProb > 75 ? "bg-[#ff4081]" : simulatedFailProb > 40 ? "bg-orange-400" : "bg-emerald-400"}`} 
                  style={{ width: `${simulatedFailProb}%` }} 
                />
              </div>
            </div>

            {/* Estimated RUL */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <div className="text-xs font-mono text-foreground/50 uppercase">Simulated RUL</div>
              <div className="my-2">
                <div className="text-4xl font-extrabold text-white tracking-tight">
                  {simulatedRulDays} <span className="text-sm font-normal text-foreground/50">Days</span>
                </div>
                <div className="text-xs text-orange-400 mt-1">
                  Reduced from {baseRul} days
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#00e5ff] h-full" 
                  style={{ width: `${Math.min(100, (simulatedRulDays / baseRul) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Financial Risk Exposure */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <div className="text-xs font-mono text-foreground/50 uppercase">Expected Cost Exposure</div>
              <div className="my-2">
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  ${projectedLoss.toLocaleString()}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  Vs ${preventCost.toLocaleString()} on-time repair
                </div>
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                Potential savings: ${(emergencyCost - preventCost).toLocaleString()}
              </div>
            </div>

          </div>

          {/* Failure Trajectory Chart */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <span className="text-xs font-mono text-foreground/50 uppercase">14-DAY FAILURE PROBABILITY TRAJECTORY</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Standard Baseline vs Simulated Stress Scenario
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Planned Baseline
                </span>
                <span className="flex items-center gap-1.5 text-[#ff4081]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff4081]" /> Simulated What-If
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4081" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#ff4081" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222f46" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#141b29", borderColor: "#ff4081", borderRadius: "8px", color: "#fff" }}
                  />
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical Seizure Threshold (80%)', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="simulated" stroke="#ff4081" strokeWidth={2.5} fillOpacity={1} fill="url(#simGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-panel-border/30">
              <div className="text-xs text-foreground/70">
                <span className="font-semibold text-white">Recommended Strategy:</span> Perform intervention before Day 4 to avoid secondary impeller damage.
              </div>
              <Link
                href="/calendar"
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                Schedule Planned Window <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
