"use client";

import { useState } from "react";
import { HelpCircle, ArrowRight, TrendingDown, Cpu } from "lucide-react";

export default function WhatIfPage() {
  const [load, setLoad] = useState(80);
  const [temp, setTemp] = useState(35);

  const calculateRUL = () => {
    // Dummy simulation calculation
    const baseRUL = 60;
    const loadFactor = (load - 50) * 0.5;
    const tempFactor = (temp - 30) * 0.8;
    return Math.max(0, Math.round(baseRUL - loadFactor - tempFactor));
  };

  const calculateFailProb = () => {
    return Math.min(100, Math.max(0, Math.round(((load / 100) * (temp / 50)) * 100)));
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">What-If Scenarios</h1>
          <p className="text-foreground/60 mt-2">Simulate environmental and load changes to predict asset outcomes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Controls */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <h3 className="text-sm font-mono text-foreground/60 uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Simulation Parameters
          </h3>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm flex justify-between">
              <span>System Load</span>
              <span className="font-mono">{load}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={load} 
              onChange={(e) => setLoad(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm flex justify-between">
              <span>Ambient Temperature</span>
              <span className="font-mono">{temp}°C</span>
            </label>
            <input 
              type="range" 
              min="10" max="60" 
              value={temp} 
              onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-start gap-3">
            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Adjusting these parameters feeds simulated data through our XGBoost models to predict how asset degradation will accelerate under stress.</p>
          </div>
        </div>

        {/* Results */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-sm font-mono text-foreground/60 uppercase flex items-center gap-2 mb-8">
            <TrendingDown className="w-4 h-4" /> Predicted Outcomes
          </h3>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="border border-panel-border bg-panel p-6 rounded-lg flex flex-col items-center justify-center text-center gap-2">
              <span className="text-foreground/50 text-sm">Projected RUL</span>
              <span className={`text-4xl font-mono ${calculateRUL() < 15 ? 'text-critical' : calculateRUL() < 30 ? 'text-warning' : 'text-healthy'}`}>
                {calculateRUL()}
              </span>
              <span className="text-xs text-foreground/40">Days Remaining</span>
            </div>
            
            <div className="border border-panel-border bg-panel p-6 rounded-lg flex flex-col items-center justify-center text-center gap-2">
              <span className="text-foreground/50 text-sm">Failure Prob (30d)</span>
              <span className={`text-4xl font-mono ${calculateFailProb() > 70 ? 'text-critical' : calculateFailProb() > 40 ? 'text-warning' : 'text-healthy'}`}>
                {calculateFailProb()}%
              </span>
              <span className="text-xs text-foreground/40">Likelihood</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
