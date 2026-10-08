"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PlayCircle, ArrowRight, AlertTriangle, CloudRain, Cpu, Activity, Zap, ActivitySquare, BrainCircuit, CheckCircle, ThermometerSun } from "lucide-react";

export default function SimulationPage() {
  const [step, setStep] = useState(0);
  const [backendData, setBackendData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("PUMP");

  const fetchBackendData = async (currentStep: number) => {
    try {
      const mode = currentStep < 3 ? 'normal' : 'degrade';
      // In a real deployed app, this URL would be an environment variable
      const res = await fetch("http://localhost:8000/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_type: selectedAsset, mode, step: currentStep })
      });
      const data = await res.json();
      setBackendData(data);
    } catch (e) {
      console.error("Backend error:", e);
    }
  };

  // Simulating the 10 step data flow
  const runSimulation = () => {
    setStep(0);
    setBackendData(null);
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= 10) {
          clearInterval(interval);
          return s;
        }
        const nextStep = s + 1;
        fetchBackendData(nextStep);
        return nextStep;
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sensor Relationship & Data Flow</h1>
          <p className="text-foreground/60 mt-2">Controlled live simulation connected to local Python ML backend.</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedAsset} 
            onChange={(e) => {
                setSelectedAsset(e.target.value);
                setStep(0);
                setBackendData(null);
            }}
            disabled={step > 0 && step < 10}
            className="bg-panel border border-panel-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="PUMP">Water Pump</option>
            <option value="HVAC">HVAC System</option>
            <option value="ELEVATOR">Elevator</option>
            <option value="GENERATOR">Generator</option>
            <option value="CHILLER">Chiller</option>
          </select>
          <button onClick={runSimulation} className="flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            <PlayCircle className="w-5 h-5" /> {step === 0 ? "Start Testing" : step > 0 && step < 10 ? "Running..." : "Restart"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Sensor Relationship Graph */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-foreground/60 uppercase mb-8">Sensor Relationship Graph</h3>
          
          <div className="relative h-[450px] w-full flex flex-col items-center justify-between">
            {/* Context */}
            <Node icon={<CloudRain />} label="Outdoor Temp" active={step >= 1} isContext />
            
            <div className="h-8 w-px bg-border" />
            
            {/* First order impact */}
            <Node icon={<Zap />} label="HVAC Load / Power" active={step >= 1} />
            
            <div className="h-8 flex gap-32">
              <div className="h-full w-px bg-border rotate-45 origin-top" />
              <div className="h-full w-px bg-border -rotate-45 origin-top" />
            </div>
            
            {/* Second order */}
            <div className="flex gap-20 w-full justify-center">
              <Node icon={<ThermometerSun />} label={`Motor Temp ${backendData ? `(${backendData.sensors.temperature}°C)` : ''}`} active={step >= 2} warning={step >= 2} />
              <Node icon={<Activity />} label={`Vibration ${backendData ? `(${backendData.sensors.vibration}mm/s)` : ''}`} active={step >= 2} warning={step >= 2} />
            </div>
            
            <div className="h-8 flex gap-32">
              <div className="h-full w-px bg-border -rotate-45 origin-bottom" />
              <div className="h-full w-px bg-border rotate-45 origin-bottom" />
            </div>

            {/* AI Outcome */}
            <Node icon={<BrainCircuit />} label={`Health: ${backendData ? backendData.health.state : 'Nominal'}`} active={step >= 4} warning={step >= 5} critical={step >= 7} />
          </div>

          <div className="mt-8 bg-panel-border p-4 rounded text-sm text-foreground/80">
            <strong>System Logic:</strong> Increased outdoor temperature explains increased HVAC load. It does NOT fully explain abnormal vibration and pressure. Therefore, mechanical degradation is more likely.
          </div>
        </div>

        {/* Right: Simulation Steps */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6">Data Flow Demonstration</h3>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <StepItem currentStep={step} index={1} title="Health Nominal" desc="Asset initially reading Normal health." />
            <StepItem currentStep={step} index={2} title="Abnormal Sensor Rise" desc="Gradually increasing temperature, vibration, and current." />
            <StepItem currentStep={step} index={3} title="Dynamic Baseline Deviated" desc="Readings exceed boundaries for current building context." />
            <StepItem currentStep={step} index={4} title="Anomaly Detected" desc={`Isolation forest model flags high anomaly (Score: ${backendData?.predictions.anomaly_score || '...'}).`} />
            <StepItem currentStep={step} index={5} title="Failure Probability Escalates" desc={`Gradient Boosting Classifier: ${backendData?.predictions.failure_probability || '...'}% Risk.`} />
            <StepItem currentStep={step} index={6} title="Fuzzy Logic Evaluation" desc={`Mechanical degradation risk = ${backendData?.health.state || '...'}.`} />
            <StepItem currentStep={step} index={7} title="Neuro-Symbolic Reasoning" desc={backendData?.neurosymbolic?.root_cause ? `Root Cause: ${backendData.neurosymbolic.root_cause} - ${backendData.neurosymbolic.reasoning[0]}` : "Analyzing symbolic rules..."} />
            <StepItem currentStep={step} index={8} title="RUL Calculation" desc={`Estimated remaining useful life: ${backendData?.predictions.rul_days || '...'} days.`} />
            <StepItem currentStep={step} index={9} title="Maintenance Scheduled" desc={backendData?.neurosymbolic?.recommended_action ? `Action: ${backendData.neurosymbolic.recommended_action} (within ${Math.max(1, Math.floor(backendData?.predictions.rul_days || 0))} days)` : "..."} />
            <StepItem currentStep={step} index={10} title="Work Order Created" desc="Sent for human approval." isFinal />
          </div>
        </div>

      </div>
    </div>
  );
}

function Node({ icon, label, active, warning, critical, isContext }: { icon: React.ReactNode, label: string, active?: boolean, warning?: boolean, critical?: boolean, isContext?: boolean }) {
  let colorClass = "bg-panel border-panel-border text-foreground/50";
  if (active) colorClass = "bg-primary/10 border-primary/40 text-primary";
  if (warning) colorClass = "bg-warning/10 border-warning/40 text-warning";
  if (critical) colorClass = "bg-critical/10 border-critical/40 text-critical";
  if (isContext) colorClass = active ? "bg-foreground/10 border-foreground/40 text-foreground" : "bg-panel border-panel-border text-foreground/50";

  return (
    <motion.div 
      initial={false}
      animate={{ scale: active ? 1.05 : 1 }}
      className={`px-4 py-2 rounded-lg border backdrop-blur-md flex items-center gap-3 transition-colors duration-500 shadow-lg ${colorClass}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium text-sm">{label}</span>
    </motion.div>
  )
}

function StepItem({ currentStep, index, title, desc, isFinal }: { currentStep: number, index: number, title: string, desc: string, isFinal?: boolean }) {
  const isActive = currentStep === index;
  const isPast = currentStep > index;
  
  if (currentStep < index) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 border rounded-lg flex items-start gap-4 ${isActive ? 'bg-primary/5 border-primary/30' : 'bg-panel/50 border-panel-border opacity-70'}`}
    >
      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${isActive ? 'bg-primary text-black' : isPast ? 'bg-healthy text-black' : 'bg-panel-border'}`}>
        {isPast ? <CheckCircle className="w-4 h-4" /> : index}
      </div>
      <div>
        <h4 className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{title}</h4>
        <p className="text-sm text-foreground/70 mt-1">{desc}</p>
        {isFinal && isActive && (
          <button className="mt-3 text-xs bg-panel border border-panel-border px-3 py-1.5 rounded hover:bg-primary/20 hover:text-primary transition-colors">
            Approve Order
          </button>
        )}
      </div>
    </motion.div>
  )
}
