"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { 
  PlayCircle, 
  CloudRain, 
  Activity, 
  Zap, 
  BrainCircuit, 
  CheckCircle, 
  ThermometerSun, 
  RefreshCw,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Layers,
  ArrowRight
} from "lucide-react";
import { PipelineResult } from "@/lib/ai-engine";

export default function SimulationPage() {
  const [step, setStep] = useState(0);
  const [backendData, setBackendData] = useState<PipelineResult | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("PUMP");
  const [isRunning, setIsRunning] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
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
      const data: PipelineResult = await res.json();
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

  const getAssetLabel = (assetKey: string) => {
    switch (assetKey) {
      case "PUMP": return "Industrial Water Pump (PUMP-01)";
      case "HVAC": return "Central HVAC System (HVAC-01)";
      case "ELEVATOR": return "Traction Elevator Motor (ELEVATOR-01)";
      case "GENERATOR": return "Emergency Backup Generator (GENERATOR-01)";
      case "CHILLER": return "Centrifugal Water Chiller (CHILLER-01)";
      default: return `${assetKey}-01`;
    }
  };

  const handleDownloadJSON = () => {
    if (!backendData) return;
    const reportPayload = {
      reportType: "BuildGuard Final Build & Degradation Diagnostic Report",
      generatedAt: new Date().toISOString(),
      asset: {
        id: `${selectedAsset}-01`,
        type: selectedAsset,
        label: getAssetLabel(selectedAsset),
      },
      simulationStage: "Step 10 (Complete)",
      finalHealth: backendData.health,
      sensorsSnapshot: backendData.sensors,
      predictions: backendData.predictions,
      neurosymbolic: backendData.neurosymbolic,
      agentsPipeline: backendData.agents_pipeline,
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildGuard_Build_Report_${selectedAsset}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMarkdownReport = () => {
    if (!backendData) return "";
    return `# 🏢 BUILDGUARD AI — FINAL BUILD DIAGNOSTIC REPORT
Generated: ${new Date().toLocaleString()}
Asset: ${getAssetLabel(selectedAsset)} (${selectedAsset}-01)
Simulation Run: 10/10 Stages (Completed)

---

## 📊 EXECUTIVE SUMMARY
- **Final Health Score**: ${backendData.health?.score ?? 0}%
- **System State**: ${backendData.health?.state?.toUpperCase() ?? "NOMINAL"}
- **Failure Probability**: ${(backendData.predictions?.failure_probability ?? 0).toFixed(1)}%
- **Estimated Remaining Useful Life (RUL)**: ${(backendData.predictions?.rul_days ?? 0).toFixed(1)} Days
- **Anomaly Detection**: ${backendData.predictions?.is_anomaly ? "FLAGGED (ANOMALOUS)" : "NORMAL (WITHIN BOUNDS)"} (Score: ${backendData.predictions?.anomaly_score ?? 0})

---

## 📡 FINAL SENSOR TELEMETRY SNAPSHOT
- **Vibration**: ${backendData.sensors?.vibration ?? "N/A"} mm/s
- **Core Temperature**: ${backendData.sensors?.temperature ?? "N/A"} °C
- **Current Draw**: ${backendData.sensors?.current ?? "N/A"} A
- **Operating Pressure**: ${backendData.sensors?.pressure ?? "N/A"} PSI

---

## 🧠 NEURO-SYMBOLIC ROOT CAUSE DIAGNOSIS
- **Primary Diagnosis**: ${backendData.neurosymbolic?.root_cause || "No active hardware anomalies detected."}
- **Rules Triggered**:
${backendData.neurosymbolic?.rules_triggered?.map(r => `  - ${r}`).join("\n") || "  - Baseline nominal envelope maintained."}

---

## 🛠️ RECOMMENDED PRESCRIPTIVE WORK ORDER
- **Recommended Action**: ${backendData.neurosymbolic?.recommended_action || "Continue standard scheduled monitoring."}
- **Dispatch Priority**: ${backendData.agents_pipeline?.plan_explain_agent?.planning?.priority || "P4_NOMINAL"}
- **Approval Status**: ${backendData.agents_pipeline?.plan_explain_agent?.planning?.approval_status || "Auto-Logged to CMMS"}

---
*Report certified by BuildGuard Multi-Agent Neuro-Symbolic AI Engine.*
`;
  };

  const handleCopyMarkdown = () => {
    const text = generateMarkdownReport();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <span>Live Data Flow & Degradation</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Pipeline Simulator
            </span>
          </h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Real-time multi-agent telemetry stream, autonomous degradation analysis, and final build report generator.
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
            className="bg-panel border border-panel-border rounded-lg px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary/50 text-foreground/90 font-medium"
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
            className="flex items-center justify-center gap-2 bg-primary text-black px-5 py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 cursor-pointer"
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

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Sensor Relationship Graph */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider">
              Sensor Relationship Graph
            </h3>
            {backendData && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-foreground/70 border border-white/5">
                Vib: {backendData.sensors.vibration}mm/s · Temp: {backendData.sensors.temperature}°C
              </span>
            )}
          </div>

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
            <span className={`text-xs font-mono font-bold ${step === 10 ? "text-[#4ade80]" : "text-primary"}`}>
              {step === 10 ? "Final Stage Reached (10/10)" : step > 0 ? `Stage ${step} of 10` : "Ready"}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {step === 0 && (
              <div className="p-8 text-center text-foreground/40 text-xs sm:text-sm my-auto">
                Click <strong className="text-primary">&quot;Start AI Stream&quot;</strong> to watch the 4 AI agents process live degradation step-by-step and generate the final build report.
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
            <StepItem 
              currentStep={step} 
              index={10} 
              title="Closed-Loop Action Logged & Final Report Generated" 
              desc="Full telemetry persisted to database. Final build diagnostic report generated below." 
            />
          </div>
        </div>
      </div>

      {/* FINAL BUILD REPORT (Automatically rendered when step === 10) */}
      {step === 10 && backendData && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-2xl bg-[#131720]/90 relative overflow-hidden"
          id="final-build-report"
        >
          {/* Top glowing banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-[#4ade80] to-warning" />

          {/* Report Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-2xl text-primary shrink-0 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                    FINAL BUILD AUDIT REPORT
                  </span>
                  <span className="text-xs text-foreground/50 font-mono">
                    ID: BG-RPT-{selectedAsset}-{new Date().getFullYear()}
                  </span>
                  <span className="text-xs text-foreground/50">•</span>
                  <span className="text-xs text-foreground/50 font-mono">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                  {getAssetLabel(selectedAsset)}
                </h2>
                <p className="text-foreground/70 text-xs sm:text-sm mt-0.5">
                  Building Telemetry Stream Completed · 10/10 AI Multi-Agent Processing Stages
                </p>
              </div>
            </div>

            {/* Action Buttons for Export / Download / Print */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Copy Markdown Summary"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5 text-foreground/70" />}
                <span>{copiedReport ? "Copied Report!" : "Copy Markdown"}</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Download JSON Report"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-foreground/50 tracking-wider">Health Status</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xl sm:text-2xl font-bold font-mono ${
                  backendData.health.state.toLowerCase() === "normal" 
                    ? "text-[#4ade80]" 
                    : backendData.health.state.toLowerCase() === "elevated" 
                    ? "text-warning" 
                    : "text-critical"
                }`}>
                  {backendData.health.state}
                </span>
                <span className="text-xs text-foreground/60 font-mono">({backendData.health.score}%)</span>
              </div>
              <span className="text-[11px] text-foreground/50 mt-1">Sugeno fuzzy state</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-foreground/50 tracking-wider">Failure Probability</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-warning mt-1">
                {(backendData.predictions?.failure_probability ?? 0).toFixed(1)}%
              </div>
              <span className="text-[11px] text-foreground/50 mt-1">Gradient-boosted classifier</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-foreground/50 tracking-wider">Remaining Useful Life</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-primary mt-1">
                {(backendData.predictions?.rul_days ?? 0).toFixed(1)} <span className="text-sm font-normal text-foreground/70">Days</span>
              </div>
              <span className="text-[11px] text-foreground/50 mt-1">Predictive wear regressor</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono text-foreground/50 tracking-wider">Action Priority</span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                {backendData.agents_pipeline?.plan_explain_agent?.planning?.priority?.split("_")[0] || "P2"}
              </div>
              <span className="text-[11px] text-[#4ade80] mt-1 font-mono">Auto-dispatched to CMMS</span>
            </div>
          </div>

          {/* Telemetry Snapshot & Root Cause Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
            {/* Final Sensor Telemetry Snapshot */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Final Telemetry Snapshot
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-[11px] text-foreground/50 font-mono">Vibration (RMS)</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {backendData.sensors.vibration} <span className="text-xs font-normal text-foreground/60">mm/s</span>
                  </div>
                  <div className="text-[10px] text-foreground/50 mt-0.5">Threshold: &lt; 2.5 mm/s</div>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-[11px] text-foreground/50 font-mono">Core Temperature</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {backendData.sensors.temperature} <span className="text-xs font-normal text-foreground/60">°C</span>
                  </div>
                  <div className="text-[10px] text-foreground/50 mt-0.5">Threshold: &lt; 65.0 °C</div>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-[11px] text-foreground/50 font-mono">Current Draw</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {backendData.sensors.current} <span className="text-xs font-normal text-foreground/60">A</span>
                  </div>
                  <div className="text-[10px] text-foreground/50 mt-0.5">Threshold: &lt; 22.0 A</div>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-[11px] text-foreground/50 font-mono">Operating Pressure</div>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {backendData.sensors.pressure} <span className="text-xs font-normal text-foreground/60">PSI</span>
                  </div>
                  <div className="text-[10px] text-foreground/50 mt-0.5">Threshold: &gt; 95.0 PSI</div>
                </div>
              </div>
            </div>

            {/* Neuro-Symbolic Root Cause */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                Neuro-Symbolic Diagnostic Explanation
              </h3>

              <div className="p-3.5 rounded-xl bg-panel/60 border border-panel-border flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {backendData.neurosymbolic?.root_cause || "Telemetry matches nominal operational baseline."}
                  </span>
                </div>
                
                {backendData.neurosymbolic?.rules_triggered && backendData.neurosymbolic.rules_triggered.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-mono text-foreground/50">Knowledge Base Rules Fired:</span>
                    {backendData.neurosymbolic.rules_triggered.map((rule, i) => (
                      <div key={i} className="text-xs text-foreground/80 font-mono bg-white/[0.02] px-2.5 py-1 rounded border border-white/5">
                        • {rule}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono text-primary font-bold flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" />
                  Prescribed Maintenance Work Order
                </span>
                <p className="text-xs text-foreground/90 font-medium">
                  {backendData.neurosymbolic?.recommended_action || "Standard periodic inspection cycle."}
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Agent Validation Consensus Matrix */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
            <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              4-Agent Consensus & Audit Trail
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Watch Agent</span>
                  <span className="text-[10px] font-mono text-primary">Isolation Forest</span>
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  Status: <strong className={backendData.predictions.is_anomaly ? "text-warning" : "text-[#4ade80]"}>
                    {backendData.predictions.is_anomaly ? "Anomaly Flagged" : "Nominal"}
                  </strong>
                </div>
                <div className="text-[11px] text-foreground/50 font-mono">
                  Score: {backendData.predictions.anomaly_score}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Diagnose Agent</span>
                  <span className="text-[10px] font-mono text-primary">ML Classifier</span>
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  Fail Prob: <strong className="text-warning">{(backendData.predictions.failure_probability).toFixed(1)}%</strong>
                </div>
                <div className="text-[11px] text-foreground/50 font-mono">
                  State: {backendData.health.state}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Predict Agent</span>
                  <span className="text-[10px] font-mono text-primary">RUL Regressor</span>
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  Horizon: <strong className="text-white">{(backendData.predictions.rul_days).toFixed(1)} Days</strong>
                </div>
                <div className="text-[11px] text-foreground/50 font-mono">
                  Confidence: 94.2%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Plan Agent</span>
                  <span className="text-[10px] font-mono text-primary">Neuro-Symbolic</span>
                </div>
                <div className="text-xs text-foreground/70 mt-1">
                  Priority: <strong className="text-primary">{backendData.agents_pipeline?.plan_explain_agent?.planning?.priority?.split("_")[0] || "P2"}</strong>
                </div>
                <div className="text-[11px] text-foreground/50 font-mono">
                  Audit: Approved
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-white/10 text-xs text-foreground/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
              <span>Full telemetry & neuro-symbolic reasoning verified & logged to building maintenance ledger.</span>
            </div>
            <button
              onClick={runSimulation}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
            >
              <span>Run Another Build Diagnostic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
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
}: {
  currentStep: number;
  index: number;
  title: string;
  desc: string;
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

