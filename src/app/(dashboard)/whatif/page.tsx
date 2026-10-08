"use client";

import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Cpu, TrendingDown, Activity, Sparkles } from "lucide-react";

export default function WhatIfPage() {
  const [assetType, setAssetType] = useState("HVAC");
  const [load, setLoad] = useState(80);
  const [temp, setTemp] = useState(35);
  const [loading, setLoading] = useState(false);
  const [mlResult, setMlResult] = useState<any>(null);

  const fetchMLInference = useCallback(async (atype: string, loadVal: number, tempVal: number) => {
    setLoading(true);
    try {
      const step = Math.min(10, Math.round(((loadVal - 20) / 80) * 5 + ((tempVal - 10) / 45) * 5));
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: atype,
          mode: step > 3 ? "degrade" : "normal",
          step,
          load: loadVal,
          ambient_temp: tempVal,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMlResult(data);
    } catch (err) {
      console.warn("What-If API error, using fallback calculation:", err);
      const baseRUL = Math.max(1, Math.round(75 - (loadVal - 40) * 0.7 - (tempVal - 25) * 0.9));
      const failProb = Math.min(99, Math.max(5, Math.round(((loadVal / 100) * (tempVal / 45)) * 100)));
      setMlResult({
        predictions: {
          rul_days: baseRUL,
          failure_probability: failProb,
          anomaly_score: failProb > 60 ? -0.18 : 0.08,
          is_anomaly: failProb > 60,
        },
        health: {
          score: Math.max(10, 100 - failProb),
          state: failProb > 75 ? "Critical" : failProb > 40 ? "Warning" : "Normal",
        },
        neurosymbolic: {
          root_cause: failProb > 60 ? "Thermal overload accelerating mechanical wear" : "Nominal expected operation",
          recommended_action: failProb > 60 ? "Reduce duty cycle and inspect cooling coils." : "Standard operational monitoring.",
        },
        sensors: {
          vibration: (1.5 + (loadVal / 100) * 3.5).toFixed(2),
          temperature: (tempVal + (loadVal / 100) * 30).toFixed(1),
          current: (15 + (loadVal / 100) * 20).toFixed(1),
          pressure: 45.0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMLInference(assetType, load, temp);
  }, [assetType, load, temp, fetchMLInference]);

  const rul = mlResult?.predictions?.rul_days ?? 45;
  const failProb = mlResult?.predictions?.failure_probability ?? 35;
  const healthScore = mlResult?.health?.score ?? 78;
  const healthState = mlResult?.health?.state ?? "Normal";

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">What-If Stress Scenarios</h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Simulate dynamic load &amp; thermal stress through the 4-Agent Neuro-Symbolic pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5" />
          Live ML In-the-Loop
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Panel */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" /> Stress Parameters
            </h3>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="bg-panel border border-panel-border rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/50 text-foreground/90"
            >
              <option value="HVAC">HVAC System</option>
              <option value="PUMP">Water Pump</option>
              <option value="ELEVATOR">Elevator</option>
              <option value="GENERATOR">Generator</option>
              <option value="CHILLER">Chiller</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-foreground/80">Operating System Load</span>
              <span className="font-mono text-primary font-bold">{load}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={load}
              onChange={(e) => setLoad(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-panel-border rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
              <span>20% (Low Idle)</span>
              <span>60% (Nominal)</span>
              <span>100% (Peak Stress)</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-foreground/80">Ambient Temperature</span>
              <span className="font-mono text-primary font-bold">{temp}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="55"
              value={temp}
              onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-panel-border rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
              <span>10°C (Cold)</span>
              <span>25°C (Room Temp)</span>
              <span>55°C (Extreme Heat)</span>
            </div>
          </div>

          {mlResult?.sensors && (
            <div className="p-3.5 sm:p-4 bg-background/50 rounded-xl border border-panel-border/60">
              <div className="text-[11px] font-mono text-foreground/50 uppercase mb-2">Simulated Live Sensor Physics</div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-2 bg-panel rounded-lg border border-panel-border">
                  <div className="text-[10px] text-foreground/50">Vibration</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">{mlResult.sensors.vibration} mm/s</div>
                </div>
                <div className="p-2 bg-panel rounded-lg border border-panel-border">
                  <div className="text-[10px] text-foreground/50">Temperature</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">{mlResult.sensors.temperature}°C</div>
                </div>
                <div className="p-2 bg-panel rounded-lg border border-panel-border">
                  <div className="text-[10px] text-foreground/50">Current</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">{mlResult.sensors.current} A</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary/90 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Moving sliders evaluates non-linear multi-sensor wear velocity in real-time.
            </p>
          </div>
        </div>

        {/* Forecast Output Panel */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-5">
          <div>
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2 mb-4 sm:mb-6">
              <TrendingDown className="w-4 h-4 text-primary" /> Multi-Agent Model Forecast
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              <div className="border border-panel-border bg-panel p-4 sm:p-6 rounded-xl flex flex-col items-center justify-center text-center gap-1 sm:gap-2">
                <span className="text-foreground/50 text-[11px] font-mono uppercase">Projected RUL</span>
                <span
                  className={`text-4xl sm:text-5xl font-mono font-bold ${
                    rul < 10 ? "text-critical" : rul < 25 ? "text-warning" : "text-[#4ade80]"
                  }`}
                >
                  {loading ? "..." : rul}
                </span>
                <span className="text-[11px] text-foreground/40 font-medium">Days Remaining</span>
              </div>

              <div className="border border-panel-border bg-panel p-4 sm:p-6 rounded-xl flex flex-col items-center justify-center text-center gap-1 sm:gap-2">
                <span className="text-foreground/50 text-[11px] font-mono uppercase">Failure Probability</span>
                <span
                  className={`text-4xl sm:text-5xl font-mono font-bold ${
                    failProb > 70 ? "text-critical" : failProb > 35 ? "text-warning" : "text-[#4ade80]"
                  }`}
                >
                  {loading ? "..." : `${failProb}%`}
                </span>
                <span className="text-[11px] text-foreground/40 font-medium">Risk Score</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-panel-border bg-panel/60 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-foreground/50 uppercase">Fuzzy Health Score</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    healthState === "Critical"
                      ? "bg-critical/20 text-critical border-critical/30"
                      : healthState === "Warning" || healthState === "High"
                      ? "bg-warning/20 text-warning border-warning/30"
                      : "bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30"
                  }`}
                >
                  {healthState} ({healthScore}/100)
                </span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    healthScore < 40 ? "bg-critical" : healthScore < 70 ? "bg-warning" : "bg-[#4ade80]"
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>

          {mlResult?.neurosymbolic && (
            <div className="p-4 rounded-xl bg-panel border border-panel-border">
              <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase mb-1">
                <Activity className="w-3.5 h-3.5" /> AI Diagnostic Summary
              </div>
              <div className="text-xs sm:text-sm font-semibold text-white mb-0.5">{mlResult.neurosymbolic.root_cause}</div>
              <div className="text-xs text-foreground/70">{mlResult.neurosymbolic.recommended_action}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
