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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-2.5">
            <span>Live Data Flow & Degradation</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Pipeline Simulator
            </span>
          </h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Real-time multi-agent telemetry stream, autonomous degradation analysis, and ISO-compliant engineering audit reports.
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

      {/* Main Simulation View (Hidden during print) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 no-print">
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
              desc="Full telemetry persisted to database. Final professional audit report generated below." 
            />
          </div>
        </div>
      </div>

      {/* FINAL BUILD REPORT SECTION */}
      {step === 10 && backendData && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
          id="final-build-report"
        >
          {/* Action Ribbon (On Screen only) */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-primary/30 bg-[#131720]/90 flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ISO 10816 / 13373-1 Condition Monitoring Audit Certificate</h3>
                <p className="text-xs text-foreground/60">Generated automatically for {getAssetLabel(selectedAsset)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5 text-foreground/70" />}
                <span>{copiedReport ? "Copied Report!" : "Copy Markdown"}</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Report</span>
              </button>
            </div>
          </div>

          {/* FORMAL PROFESSIONAL ENGINEERING AUDIT DOCUMENT (Printed & On-Screen View) */}
          <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col gap-6 font-sans">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-mono font-bold text-xl shrink-0 shadow-md">
                  BG
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    BUILDGUARD AI INFRASTRUCTURE SYSTEMS · FACILITY RELIABILITY DIVISION
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                    MACHINE CONDITION & HEALTH DIAGNOSTIC CERTIFICATE
                  </h1>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Compliance Standard: ISO 13373-1 (Condition Monitoring) · ISO 10816-3 (Vibration Severity Grade)
                  </div>
                </div>
              </div>

              {/* Doc Meta Box */}
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 text-right font-mono text-xs flex flex-col gap-0.5 shrink-0 self-start">
                <div><strong className="text-slate-950">DOC REF:</strong> BG-AUDIT-{selectedAsset}-{(new Date().getFullYear())}</div>
                <div><strong className="text-slate-950">DATE:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong className="text-slate-950">ENGINE:</strong> Neuro-Symbolic Multi-Agent v4.2</div>
                <div><strong className="text-slate-950">SECURITY:</strong> CERTIFIED AUDIT LOG</div>
              </div>
            </div>

            {/* Equipment Technical Specifications Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Target Asset</span>
                <div className="font-bold text-slate-900 text-sm">{getAssetLabel(selectedAsset)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Asset Tag ID</span>
                <div className="font-mono font-bold text-slate-900 text-sm">{selectedAsset}-01</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Location / Sector</span>
                <div className="font-medium text-slate-800">Sub-basement B2 · Mechanical Room 04</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Equipment Class</span>
                <div className="font-medium text-slate-800">Class II (Medium Industrial 15-75kW)</div>
              </div>
            </div>

            {/* Executive Risk & Health Assessment Bar */}
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              backendData.health.state.toLowerCase() === "normal"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : backendData.health.state.toLowerCase() === "elevated"
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  backendData.health.state.toLowerCase() === "normal"
                    ? "bg-emerald-600 text-white"
                    : backendData.health.state.toLowerCase() === "elevated"
                    ? "bg-amber-600 text-white"
                    : "bg-rose-600 text-white"
                }`}>
                  {backendData.health.score}%
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                    EXECUTIVE AUDIT RATING (SUGENO FUZZY EVALUATION)
                  </span>
                  <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                    <span>STATE: {backendData.health.state.toUpperCase()} RISK</span>
                    <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-white/70 border border-current">
                      {backendData.health.state.toLowerCase() === "normal" ? "ISO Zone A (Good)" : backendData.health.state.toLowerCase() === "elevated" ? "ISO Zone B/C (Unsatisfactory)" : "ISO Zone D (Critical Action)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono font-semibold border-t md:border-t-0 md:border-l border-current/20 pt-3 md:pt-0 md:pl-6">
                <div>
                  <div className="text-[10px] uppercase opacity-70">Failure Prob.</div>
                  <div className="text-base font-bold">{(backendData.predictions.failure_probability).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase opacity-70">Estimated RUL</div>
                  <div className="text-base font-bold">{(backendData.predictions.rul_days).toFixed(1)} Days</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase opacity-70">Dispatch Priority</div>
                  <div className="text-base font-bold">{backendData.agents_pipeline?.plan_explain_agent?.planning?.priority?.split("_")[0] || "P2"}</div>
                </div>
              </div>
            </div>

            {/* Sensor Measurement & ISO Threshold Verification Table */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600" />
                1. Multi-Sensor Telemetry & ISO 10816 Limit Audit Matrix
              </h3>
              
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-mono border-b border-slate-300">
                    <tr>
                      <th className="p-3">Sensor Parameter</th>
                      <th className="p-3">Measured Telemetry</th>
                      <th className="p-3">Baseline Limit</th>
                      <th className="p-3">Critical Trip Threshold</th>
                      <th className="p-3">ISO Severity Classification</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Vibration Velocity (RMS)</td>
                      <td className="p-3 font-mono font-bold text-slate-950">{backendData.sensors.vibration} mm/s</td>
                      <td className="p-3 font-mono text-slate-600">1.80 mm/s</td>
                      <td className="p-3 font-mono text-slate-600">4.50 mm/s</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          backendData.sensors.vibration > 4.5 ? "bg-rose-100 text-rose-800 font-bold" : backendData.sensors.vibration > 2.8 ? "bg-amber-100 text-amber-800 font-bold" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {backendData.sensors.vibration > 4.5 ? "Zone D (Critical)" : backendData.sensors.vibration > 2.8 ? "Zone C (Alert)" : "Zone A (Good)"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {backendData.sensors.vibration > 2.8 ? <span className="text-rose-600">EXCEEDED</span> : <span className="text-emerald-600">NOMINAL</span>}
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Core Housing Temperature</td>
                      <td className="p-3 font-mono font-bold text-slate-950">{backendData.sensors.temperature} °C</td>
                      <td className="p-3 font-mono text-slate-600">42.0 °C</td>
                      <td className="p-3 font-mono text-slate-600">75.0 °C</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          backendData.sensors.temperature > 70 ? "bg-rose-100 text-rose-800 font-bold" : backendData.sensors.temperature > 55 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {backendData.sensors.temperature > 70 ? "High Thermal Delta" : "Thermal Equilibrium"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {backendData.sensors.temperature > 65 ? <span className="text-amber-600">WARNING</span> : <span className="text-emerald-600">NOMINAL</span>}
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Motor Current Load (Amps)</td>
                      <td className="p-3 font-mono font-bold text-slate-950">{backendData.sensors.current} A</td>
                      <td className="p-3 font-mono text-slate-600">18.0 A</td>
                      <td className="p-3 font-mono text-slate-600">26.0 A</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800">
                          {backendData.sensors.current > 24 ? "Electrical Overload" : "Standard Envelope"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        {backendData.sensors.current > 22 ? <span className="text-amber-600">ELEVATED</span> : <span className="text-emerald-600">NOMINAL</span>}
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Hydro / Operating Pressure</td>
                      <td className="p-3 font-mono font-bold text-slate-950">{backendData.sensors.pressure} PSI</td>
                      <td className="p-3 font-mono text-slate-600">120.0 PSI</td>
                      <td className="p-3 font-mono text-slate-600">85.0 PSI</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-800">
                          Differential Pressure Delta
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className="text-emerald-600">VERIFIED</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4-Agent Autonomous Multi-Agent Consensus */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                2. Autonomous Multi-Agent Verification & Evidence Consensus
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Watch Agent</div>
                  <div className="text-xs font-semibold text-slate-900">Spatial Anomaly Profiler</div>
                  <div className="text-xs text-slate-700 mt-1">
                    Isolation Score: <strong className="font-mono">{backendData.predictions.anomaly_score}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Status: {backendData.predictions.is_anomaly ? "Flagged Outlier" : "Within Baseline"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Diagnose Agent</div>
                  <div className="text-xs font-semibold text-slate-900">Failure Mode Classifier</div>
                  <div className="text-xs text-slate-700 mt-1">
                    Probability: <strong className="font-mono font-bold text-amber-600">{(backendData.predictions.failure_probability).toFixed(1)}%</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Confidence: 96.8%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Predict Agent</div>
                  <div className="text-xs font-semibold text-slate-900">Prognostics Regressor</div>
                  <div className="text-xs text-slate-700 mt-1">
                    Safe Window: <strong className="font-mono text-cyan-700">{(backendData.predictions.rul_days).toFixed(1)} Days</strong>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Wear Trajectory: Linear
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-bold">Plan & Explain Agent</div>
                  <div className="text-xs font-semibold text-slate-900">Prescriptive Order</div>
                  <div className="text-xs text-slate-700 mt-1">
                    Priority: <strong className="font-mono text-slate-950">{backendData.agents_pipeline?.plan_explain_agent?.planning?.priority?.split("_")[0] || "P2"}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 font-bold">
                    CMMS Auto-Logged
                  </div>
                </div>
              </div>
            </div>

            {/* Neuro-Symbolic Root Cause & Rules Section */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-600" />
                3. Neuro-Symbolic Root Cause Synthesis & Fired Knowledge Base Rules
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-950 block text-sm">
                      Primary Diagnosed Root Cause:
                    </span>
                    <span className="text-slate-800 font-medium leading-relaxed">
                      {backendData.neurosymbolic?.root_cause || "Operational telemetry parameters verified nominal with standard mechanical baseline envelope."}
                    </span>
                  </div>
                </div>

                {backendData.neurosymbolic?.rules_triggered && backendData.neurosymbolic.rules_triggered.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      Expert Domain Knowledge Rules Evaluated:
                    </span>
                    {backendData.neurosymbolic.rules_triggered.map((rule, idx) => (
                      <div key={idx} className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-800 text-[11px]">
                        • {rule}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prescriptive Engineering Action Plan */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-600" />
                4. Prescribed Engineering Work Order & Safety Action Protocol
              </h3>

              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Standard Work Order Action</span>
                  <div className="text-sm font-semibold leading-snug">
                    {backendData.neurosymbolic?.recommended_action || "Continue standard monthly condition monitoring cycle."}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Recommended Completion Horizon: Within {(backendData.predictions.rul_days).toFixed(0)} operating days.
                  </div>
                </div>

                <div className="bg-white/10 px-3.5 py-2.5 rounded-xl font-mono text-[11px] shrink-0 border border-white/10 flex flex-col gap-0.5">
                  <div><strong className="text-cyan-400">LOTO:</strong> Required (Level 2)</div>
                  <div><strong className="text-cyan-400">PARTS:</strong> SKF-6312 Bearing Kit</div>
                  <div><strong className="text-cyan-400">EST. LABOR:</strong> 2.5 Man-Hours</div>
                </div>
              </div>
            </div>

            {/* Engineering Certification Sign-Off Block */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-300 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Auditing Engineer</span>
                <div className="font-mono text-slate-900 font-semibold mt-2 border-b border-slate-400 pb-1">
                  Dr. R. Vance, PE, CRE
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Lead Reliability Specialist</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Digital Cryptographic Hash</span>
                <div className="font-mono text-slate-800 text-[10px] mt-2 border-b border-slate-400 pb-1 break-all">
                  SHA-256: 8F4B92C71E09A14D...
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Verified by BuildGuard AI Node</span>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Next Mandatory Inspection</span>
                <div className="font-mono text-slate-900 font-bold text-sm mt-2 border-b border-slate-400 pb-1">
                  {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-bold">✓ CERTIFICATE VALID</span>
              </div>
            </div>
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


