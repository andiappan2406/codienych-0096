"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { PlayCircle, AlertTriangle, CloudRain, Cpu, Activity, Zap, BrainCircuit, CheckCircle, ThermometerSun, RefreshCw } from "lucide-react";

export default function SimulationPage() {
  const [step, setStep] = useState(0);
  const [backendData, setBackendData] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("PUMP");
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBackendData = async (currentStep: number) => {
    try {
      const mode = currentStep < 3 ? "normal" : "degrade";
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_type: selectedAsset, mode, step: currentStep }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBackendData(data);
    } catch (e) {
      console.error("Simulation API error:", e);
    }
  };

  const runSimulation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep(1);
    setIsRunning(true);
    fetchBackendData(1);

    intervalRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= 10) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          return 10;
        }
        const next = s + 1;
        fetchBackendData(next);
        return next;
      });
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Live Data Flow & Degradation</h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Real-time multi-agent telemetry stream and automated diagnosis simulation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col xs:flex-row gap-3 items-stretch xs:items-center w-full sm:w-auto">
          <select
            value={selectedAsset}
            onChange={(e) => {
              setSelectedAsset(e.target.value);
              setStep(0);
              setBackendData(null);
            }}
            disabled={isRunning}
            className="bg-panel border border-panel-border rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary/50 text-foreground/90"
          >
            <option value="PUMP">Water Pump (PUMP-01)</option>
            <option value="HVAC">HVAC System (HVAC-01)</option>
            <option value="ELEVATOR">Elevator Motor (ELEVATOR-01)</option>
            <option value="GENERATOR">Generator (GENERATOR-01)</option>
            <option value="CHILLER">Chiller Unit (CHILLER-01)</option>
          </select>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-primary text-black px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Step {step}/10...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>{step === 0 ? "Start AI Stream" : "Re-run Simulation"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Sensor Relationship Graph */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider mb-6">
            Sensor Relationship Graph
          </h3>

          <div className="relative min-h-[380px] sm:min-h-[420px] w-full flex flex-col items-center justify-between py-2">
            {/* Context Node */}
            <Node icon={<CloudRain />} label="Outdoor Ambient Temp" active={step >= 1} isContext />

            <div className="h-6 w-px bg-border" />

            {/* First order impact */}
            <Node icon={<Zap />} label="Equipment Power Load" active={step >= 1} />

            <div className="h-6 flex gap-20 sm:gap-32">
              <div className="h-full w-px bg-border rotate-45 origin-top" />
              <div className="h-full w-px bg-border -rotate-45 origin-top" />
            </div>

            {/* Second order sensor nodes */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full justify-center items-center">
              <Node
                icon={<ThermometerSun />}
                label={`Core Temp ${backendData ? `(${backendData.sensors.temperature}°C)` : ""}`}
                active={step >= 2}
                warning={step >= 3}
              />
              <Node
                icon={<Activity />}
                label={`Vibration ${backendData ? `(${backendData.sensors.vibration}mm/s)` : ""}`}
                active={step >= 2}
                warning={step >= 3}
              />
            </div>

            <div className="h-6 flex gap-20 sm:gap-32">
              <div className="h-full w-px bg-border -rotate-45 origin-bottom" />
              <div className="h-full w-px bg-border rotate-45 origin-bottom" />
            </div>

            {/* AI Outcome */}
            <Node
              icon={<BrainCircuit />}
              label={`Health: ${backendData ? backendData.health.state : "Nominal"}`}
              active={step >= 4}
              warning={step >= 5}
              critical={step >= 7}
            />
          </div>

          <div className="mt-6 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl text-xs text-foreground/80 leading-relaxed">
            <strong className="text-primary font-mono block mb-0.5">Neuro-Symbolic Logic:</strong>
            Ambient temperature variations explain standard electrical load shifts, but disproportionate vibration spikes and current draw indicate mechanical bearing degradation.
          </div>
        </div>

        {/* Right: Simulation Steps Stream */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider">
              Autonomous Pipeline Execution
            </h3>
            <span className="text-xs font-mono text-primary font-bold">
              {step > 0 ? `Stage ${step} of 10` : "Ready"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {step === 0 && (
              <div className="p-8 text-center text-foreground/40 text-xs sm:text-sm my-auto">
                Click <strong className="text-primary">&quot;Start AI Stream&quot;</strong> to watch the 4 AI agents process live degradation step-by-step.
              </div>
            )}
            <StepItem currentStep={step} index={1} title="Initial State Nominal" desc="Asset reading standard baseline envelope." />
            <StepItem currentStep={step} index={2} title="Early Sensor Divergence" desc="Slight upward drift in vibration, temperature, and current." />
            <StepItem currentStep={step} index={3} title="Dynamic Threshold Tripped" desc="Telemetry exceeds contextual operational boundary." />
            <StepItem
              currentStep={step}
              index={4}
              title="Watch Agent Anomaly Flag"
              desc={`Isolation scoring flags anomaly (Score: ${backendData?.predictions?.anomaly_score ?? "-0.18"}).`}
            />
            <StepItem
              currentStep={step}
              index={5}
              title="Diagnose Agent Classification"
              desc={`Failure probability escalated to ${backendData?.predictions?.failure_probability ?? "72"}%.`}
            />
            <StepItem
              currentStep={step}
              index={6}
              title="Sugeno Fuzzy Logic State"
              desc={`Fuzzy membership evaluated to ${backendData?.health?.state ?? "Elevated"} State.`}
            />
            <StepItem
              currentStep={step}
              index={7}
              title="Neuro-Symbolic Root Cause"
              desc={
                backendData?.neurosymbolic?.root_cause
                  ? `${backendData.neurosymbolic.root_cause}`
                  : "Synthesizing domain knowledge rules..."
              }
            />
            <StepItem
              currentStep={step}
              index={8}
              title="Predict Agent RUL Regressor"
              desc={`Estimated Remaining Useful Life: ${backendData?.predictions?.rul_days ?? "5.2"} days.`}
            />
            <StepItem
              currentStep={step}
              index={9}
              title="Plan & Explain Work Order"
              desc={
                backendData?.neurosymbolic?.recommended_action
                  ? `${backendData.neurosymbolic.recommended_action}`
                  : "Dispatching work order..."
              }
            />
            <StepItem currentStep={step} index={10} title="Closed-Loop Action Logged" desc="Telemetries persisted to database." isFinal />
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({
  icon,
  label,
  active,
  warning,
  critical,
  isContext,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  warning?: boolean;
  critical?: boolean;
  isContext?: boolean;
}) {
  let colorClass = "bg-panel/80 border-panel-border text-foreground/50";
  if (active) colorClass = "bg-primary/10 border-primary/40 text-primary";
  if (warning) colorClass = "bg-warning/10 border-warning/40 text-warning";
  if (critical) colorClass = "bg-critical/10 border-critical/40 text-critical font-bold";
  if (isContext) colorClass = active ? "bg-white/10 border-white/20 text-white" : "bg-panel/80 border-panel-border text-foreground/50";

  return (
    <motion.div
      initial={false}
      animate={{ scale: active ? 1.04 : 1 }}
      className={`px-3.5 py-2 rounded-xl border backdrop-blur-md flex items-center gap-2.5 transition-all duration-300 shadow-md ${colorClass} max-w-full`}
    >
      <div className="w-4 h-4 shrink-0">{icon}</div>
      <span className="font-medium text-xs sm:text-sm truncate">{label}</span>
    </motion.div>
  );
}

function StepItem({
  currentStep,
  index,
  title,
  desc,
  isFinal,
}: {
  currentStep: number;
  index: number;
  title: string;
  desc: string;
  isFinal?: boolean;
}) {
  const isActive = currentStep === index;
  const isPast = currentStep > index;

  if (currentStep < index) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 border rounded-xl flex items-start gap-3 transition-colors ${
        isActive ? "bg-primary/10 border-primary/40 shadow-sm" : "bg-panel/40 border-panel-border/60 opacity-80"
      }`}
    >
      <div
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
          isActive ? "bg-primary text-black" : isPast ? "bg-[#4ade80] text-black" : "bg-panel-border text-foreground/70"
        }`}
      >
        {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : index}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-xs sm:text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
          {title}
        </h4>
        <p className="text-[11px] sm:text-xs text-foreground/70 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
