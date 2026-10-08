"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Activity,
  Camera,
  CameraOff,
  Volume2,
  Zap,
  Gauge,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  FileDown,
  Sparkles,
  Layers,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Database,
  Eye,
  Info,
  Flashlight
} from "lucide-react";
import { MachineAudioAnalyzer, AudioAnalysisMetrics } from "@/lib/sensors/audioAnalyzer";
import { MobileVibrationAnalyzer, VibrationMetrics } from "@/lib/sensors/vibrationAnalyzer";
import { OpticalFanTachometer, OpticalTachometerMetrics } from "@/lib/sensors/opticalTachometer";
import {
  fuseMobileSensorReadings,
  FusedDiagnosticResult,
  REPO_DATASET_BENCHMARKS,
  AssetBenchmarkProfile
} from "@/lib/sensors/sensorFusion";

export default function MobileSensorDoctorPage() {
  const [selectedAsset, setSelectedAsset] = useState<string>("HVAC");
  const [activeTab, setActiveTab] = useState<"cockpit" | "audio" | "vibration" | "optical" | "benchmarks">("cockpit");

  // Sensor Analyzers Instances
  const audioAnalyzerRef = useRef<MachineAudioAnalyzer | null>(null);
  const vibrationAnalyzerRef = useRef<MobileVibrationAnalyzer | null>(null);
  const opticalTachometerRef = useRef<OpticalFanTachometer | null>(null);

  // Sensor Live States
  const [audioMetrics, setAudioMetrics] = useState<AudioAnalysisMetrics | null>(null);
  const [vibrationMetrics, setVibrationMetrics] = useState<VibrationMetrics | null>(null);
  const [opticalMetrics, setOpticalMetrics] = useState<OpticalTachometerMetrics | null>(null);
  const [fusedDiagnostic, setFusedDiagnostic] = useState<FusedDiagnosticResult | null>(null);

  // Toggle & Hardware Control States
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [isVibrationRunning, setIsVibrationRunning] = useState(false);
  const [isOpticalRunning, setIsOpticalRunning] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedDegradation, setSimulatedDegradation] = useState(0); // 0 (healthy) to 100 (critical fault)
  const [bladeCount, setBladeCount] = useState(4);
  const [strobeHz, setStrobeHz] = useState(30);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // DOM Canvas & Video Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vibrationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fanSimCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Analyzers on Mount
  useEffect(() => {
    audioAnalyzerRef.current = new MachineAudioAnalyzer();
    vibrationAnalyzerRef.current = new MobileVibrationAnalyzer();
    opticalTachometerRef.current = new OpticalFanTachometer();

    // Initial baseline fusion calculation
    const initRes = fuseMobileSensorReadings(selectedAsset, null, null, null);
    setFusedDiagnostic(initRes);

    return () => {
      audioAnalyzerRef.current?.stop();
      vibrationAnalyzerRef.current?.stop();
      opticalTachometerRef.current?.stop();
    };
  }, []);

  // Update Fused Diagnostics whenever sensor metrics or selected asset change
  useEffect(() => {
    const fused = fuseMobileSensorReadings(selectedAsset, audioMetrics, vibrationMetrics, opticalMetrics);
    setFusedDiagnostic(fused);
  }, [selectedAsset, audioMetrics, vibrationMetrics, opticalMetrics]);

  // Audio FFT Canvas Visualizer
  const drawAudioFft = (rawFft: Uint8Array) => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const barWidth = (w / rawFft.length) * 2.5;
    let x = 0;

    for (let i = 0; i < rawFft.length; i++) {
      const barHeight = (rawFft[i] / 255) * h;
      
      // Color gradient from cyan to orange/red for high frequencies
      const hue = i > rawFft.length * 0.4 ? 10 : 190;
      ctx.fillStyle = `hsl(${hue}, 85%, ${40 + (rawFft[i] / 255) * 30}%)`;
      ctx.fillRect(x, h - barHeight, barWidth, barHeight);

      x += barWidth + 1;
      if (x > w) break;
    }
  };

  // Vibration Waveform Canvas Visualizer
  useEffect(() => {
    if (!vibrationMetrics || !vibrationCanvasRef.current) return;
    const canvas = vibrationCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const hist = vibrationMetrics.historyWaveform;
    if (hist.length < 2) return;

    const midY = h / 2;
    const stepX = w / hist.length;

    // Draw X-axis line (Cyan)
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hist.forEach((pt, i) => {
      const y = midY - pt.x * 12;
      if (i === 0) ctx.moveTo(i * stepX, y);
      else ctx.lineTo(i * stepX, y);
    });
    ctx.stroke();

    // Draw Y-axis line (Purple)
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hist.forEach((pt, i) => {
      const y = midY - pt.y * 12;
      if (i === 0) ctx.moveTo(i * stepX, y);
      else ctx.lineTo(i * stepX, y);
    });
    ctx.stroke();

    // Draw Magnitude Total (Yellow/Green)
    ctx.strokeStyle = ptColor(vibrationMetrics.velocityRmsMmS);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    hist.forEach((pt, i) => {
      const y = midY - pt.mag * 12;
      if (i === 0) ctx.moveTo(i * stepX, y);
      else ctx.lineTo(i * stepX, y);
    });
    ctx.stroke();
  }, [vibrationMetrics]);

  const ptColor = (velocityMmS: number) => {
    if (velocityMmS > 4.5) return "#ef4444";
    if (velocityMmS > 2.8) return "#f59e0b";
    if (velocityMmS > 1.4) return "#3b82f6";
    return "#22c55e";
  };

  // Simulation Fan Canvas Animation Loop
  useEffect(() => {
    if (!isSimulating || !fanSimCanvasRef.current) return;
    const canvas = fanSimCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let animId: number;
    const currentRpm = REPO_DATASET_BENCHMARKS[selectedAsset]?.nominalRpm || 1750;
    const speed = (currentRpm / 60) * (Math.PI * 2) / 60;

    const renderFan = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 55;

      // Outer Fan Cage
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
      ctx.stroke();

      // Fan Blades
      angle += speed;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const blades = bladeCount;
      for (let i = 0; i < blades; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / blades);
        ctx.fillStyle = simulatedDegradation > 50 ? "#ef4444" : "#06b6d4";
        ctx.beginPath();
        ctx.ellipse(0, -radius / 2, 12, radius / 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Center Hub
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(renderFan);
    };

    renderFan();
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, selectedAsset, bladeCount, simulatedDegradation]);

  // Handle Audio Start/Stop
  const toggleAudio = async () => {
    if (isAudioRunning) {
      audioAnalyzerRef.current?.stop();
      setIsAudioRunning(false);
      setAudioMetrics(null);
      setStatusMessage("Audio microphone probe stopped.");
    } else {
      try {
        setStatusMessage("Accessing microphone & initializing Web Audio FFT...");
        await audioAnalyzerRef.current?.startListening((metrics, rawFft) => {
          setAudioMetrics(metrics);
          drawAudioFft(rawFft);
        });
        setIsAudioRunning(true);
        setStatusMessage("Live microphone acoustic analysis active.");
      } catch (err: any) {
        setStatusMessage(`Microphone access error: ${err.message || "Permission denied"}`);
      }
    }
  };

  // Handle Vibration Start/Stop
  const toggleVibration = async () => {
    if (isVibrationRunning) {
      vibrationAnalyzerRef.current?.stop();
      setIsVibrationRunning(false);
      setVibrationMetrics(null);
      setStatusMessage("Motion accelerometer probe stopped.");
    } else {
      try {
        setStatusMessage("Requesting device motion permissions...");
        const success = await vibrationAnalyzerRef.current?.start((metrics) => {
          setVibrationMetrics(metrics);
        });
        if (success) {
          setIsVibrationRunning(true);
          setStatusMessage("Live 3-axis accelerometer vibration probe active.");
        } else {
          setStatusMessage("Device motion not supported or permission denied on this device.");
        }
      } catch (err: any) {
        setStatusMessage(`Motion probe error: ${err.message}`);
      }
    }
  };

  // Handle Optical Tachometer Start/Stop
  const toggleOptical = async () => {
    if (isOpticalRunning) {
      opticalTachometerRef.current?.stop();
      setIsOpticalRunning(false);
      setOpticalMetrics(null);
      setStatusMessage("Camera optical tachometer stopped.");
    } else {
      if (!videoRef.current) return;
      try {
        setStatusMessage("Starting camera video stream for optical RPM tracking...");
        await opticalTachometerRef.current?.startCamera(videoRef.current, (metrics) => {
          setOpticalMetrics(metrics);
        });
        opticalTachometerRef.current?.setBladeCount(bladeCount);
        opticalTachometerRef.current?.setStrobeFrequency(strobeHz);
        setIsOpticalRunning(true);
        setStatusMessage("Camera optical tachometer active. Point ROI at rotating blades.");
      } catch (err: any) {
        setStatusMessage(`Camera access error: ${err.message || "Permission denied"}`);
      }
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!opticalTachometerRef.current) return;
    const newState = await opticalTachometerRef.current.toggleTorch();
    setIsTorchOn(newState);
  };

  // Handle Simulation Mode
  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      vibrationAnalyzerRef.current?.stop();
      opticalTachometerRef.current?.stop();
      setAudioMetrics(null);
      setVibrationMetrics(null);
      setOpticalMetrics(null);
      setStatusMessage("Simulation generator stopped.");
    } else {
      setIsSimulating(true);
      setStatusMessage("Emulated machine signals active. Adjust degradation slider to test AI diagnostics.");
    }
  };

  // Simulation Tick Effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const benchmark = REPO_DATASET_BENCHMARKS[selectedAsset] || REPO_DATASET_BENCHMARKS.HVAC;
      const degFactor = simulatedDegradation / 100;

      // 1. Emulate Audio
      const baseFreq = benchmark.nominalAcousticFreqHz;
      const peakFreq = Math.round(baseFreq + (Math.random() - 0.5) * 4);
      const bearingNoise = Math.round(15 + degFactor * 75 + (Math.random() - 0.5) * 6);
      const audioDb = Math.round(-45 + degFactor * 35 + (Math.random() - 0.5) * 3);

      let acousticSeverity: "NORMAL" | "ELEVATED" | "CRITICAL" = "NORMAL";
      let faultDesc = "Nominal acoustic profile";
      if (bearingNoise > 60 || audioDb > -15) {
        acousticSeverity = "CRITICAL";
        faultDesc = "High-Frequency Ultrasonic Bearing Emission & Friction Spike";
      } else if (bearingNoise > 35) {
        acousticSeverity = "ELEVATED";
        faultDesc = "Early Stage Raceway Pitting / Lubrication Degradation";
      }

      setAudioMetrics({
        isListening: true,
        peakFrequency: peakFreq,
        harmonics: [peakFreq, peakFreq * 2, peakFreq * 3],
        decibels: audioDb,
        spectralCentroid: Math.round(2000 + degFactor * 3500),
        bearingBandEnergy: Math.max(0, Math.min(100, bearingNoise)),
        lowFreqEnergy: Math.round(25 + degFactor * 40),
        cavitationNoiseRatio: Number((0.2 + degFactor * 0.7).toFixed(2)),
        acousticSeverity,
        detectedAcousticFault: faultDesc,
      });

      // 2. Emulate Vibration
      const baseVibMmS = benchmark.nominalVibrationMmS;
      const currentVibMmS = Number((baseVibMmS + degFactor * 4.8 + (Math.random() - 0.5) * 0.3).toFixed(2));
      const synX = (currentVibMmS * 0.8) * Math.sin(Date.now() / 100) + (Math.random() - 0.5) * 0.5;
      const synY = (currentVibMmS * 0.6) * Math.cos(Date.now() / 100) + (Math.random() - 0.5) * 0.5;
      const synZ = (currentVibMmS * 0.3) + (Math.random() - 0.5) * 0.2;

      vibrationAnalyzerRef.current?.feedSynthetic(synX, synY, synZ);

      // 3. Emulate Optical Tachometer
      const targetRpm = Math.round(benchmark.nominalRpm * (1 - degFactor * 0.18));
      opticalTachometerRef.current?.feedSynthetic(targetRpm, bladeCount);
    }, 200);

    return () => clearInterval(interval);
  }, [isSimulating, selectedAsset, simulatedDegradation, bladeCount]);

  // Save Telemetry to Live Asset State in Database / Memory
  const handleCommitTelemetry = async (createWo: boolean = false) => {
    if (!fusedDiagnostic) return;
    setSavingStatus("Syncing live telemetry with BuildGuard AI...");

    try {
      const assetId = `${selectedAsset}-01`;
      const res = await fetch("/api/sensors/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          assetType: selectedAsset,
          audio: audioMetrics,
          vibration: vibrationMetrics,
          optical: opticalMetrics,
          saveToDb: true,
          createAlertOnCritical: true,
          createWorkOrder: createWo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavingStatus(createWo ? "Work Order & Telemetry Saved Successfully!" : "Telemetry Synced to Asset Fleet!");
        setTimeout(() => setSavingStatus(null), 3500);
      } else {
        setSavingStatus(`Sync Error: ${data.error}`);
      }
    } catch (err: any) {
      setSavingStatus(`Sync Failed: ${err.message}`);
    }
  };

  // Export Inspection Report (JSON/Text)
  const handleExportReport = () => {
    if (!fusedDiagnostic) return;
    const report = {
      title: "BuildGuard Mobile Sensor Inspection Report",
      generatedAt: new Date().toISOString(),
      targetAsset: selectedAsset,
      overallHealthScore: fusedDiagnostic.overallHealthScore,
      healthState: fusedDiagnostic.overallState,
      failureProbability: `${fusedDiagnostic.pipelineResult.predictions.failure_probability}%`,
      estimatedRulDays: `${fusedDiagnostic.pipelineResult.predictions.rul_days} days`,
      primaryFault: fusedDiagnostic.primaryFailureMode,
      recommendedAction: fusedDiagnostic.maintenanceAction,
      telemetry: {
        vibrationVelocityRms: `${fusedDiagnostic.vibrationSummary.velocityRmsMmS} mm/s (${fusedDiagnostic.vibrationSummary.isoZone})`,
        acousticPeakFrequency: `${fusedDiagnostic.acousticSummary.peakFrequency} Hz`,
        acousticBearingNoiseRatio: `${fusedDiagnostic.acousticSummary.bearingNoiseRatio}%`,
        opticalFanSpeed: `${fusedDiagnostic.opticalSummary.rpm} RPM (${fusedDiagnostic.opticalSummary.rpmDeviationPct}% deviation)`,
        derivedTemperature: `${fusedDiagnostic.derivedSensors.temperature} °C`,
        derivedCurrent: `${fusedDiagnostic.derivedSensors.current} A`,
        derivedPressure: `${fusedDiagnostic.derivedSensors.pressure} Bar`,
      },
      neuroSymbolicRules: fusedDiagnostic.pipelineResult.neurosymbolic.rules_triggered,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BuildGuard_Sensor_Report_${selectedAsset}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentBenchmark: AssetBenchmarkProfile = REPO_DATASET_BENCHMARKS[selectedAsset] || REPO_DATASET_BENCHMARKS.HVAC;

  return (
    <div className="flex flex-col gap-6 max-w-full pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1a2333] via-[#161c28] to-[#121620] border border-primary/20 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-primary/20 text-primary text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Mobile Web Sensor Lab
              </span>
              <span className="bg-white/5 text-foreground/60 text-[11px] px-2 py-0.5 rounded border border-white/10">
                Acoustic FFT · ISO 10816 · Camera Tachometer
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Web-Native Machine Maintenance Inspector
            </h1>
            <p className="text-foreground/60 text-xs sm:text-sm max-w-2xl mt-0.5">
              Read device microphone acoustic harmonics, 3-axis accelerometer vibration velocity, and camera optical fan RPM directly in your browser.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all border ${
              isSimulating
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg shadow-amber-500/10"
                : "bg-white/5 hover:bg-white/10 text-foreground/80 border-white/10"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isSimulating ? "Simulation Active" : "Emulate Sensors"}</span>
          </button>

          <button
            onClick={() => handleCommitTelemetry(false)}
            className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Database className="w-4 h-4" />
            <span>Sync Telemetry</span>
          </button>

          <button
            onClick={handleExportReport}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Export JSON Inspection Report"
          >
            <FileDown className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Target Asset Selector & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
        {/* Asset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-foreground/40 font-mono uppercase mr-1 flex-shrink-0">Target:</span>
          {Object.keys(REPO_DATASET_BENCHMARKS).map((key) => {
            const isSel = selectedAsset === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedAsset(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSel
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-[#161a22] text-foreground/60 border-white/5 hover:text-white"
                }`}
              >
                {key}-01
              </button>
            );
          })}
        </div>

        {/* Diagnostic Tabs */}
        <div className="flex items-center gap-1 bg-[#121620] p-1 rounded-xl border border-white/5 self-start sm:self-auto overflow-x-auto">
          {[
            { id: "cockpit", label: "Diagnostic Cockpit", icon: Layers },
            { id: "audio", label: "Acoustic FFT", icon: Volume2 },
            { id: "vibration", label: "Motor Vibration", icon: Activity },
            { id: "optical", label: "Optical Tachometer", icon: Camera },
            { id: "benchmarks", label: "Dataset Presets", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isAct ? "bg-primary text-black font-bold shadow-md" : "text-foreground/70 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Bar Notification */}
      {(statusMessage || savingStatus) && (
        <div className="bg-[#1a2333]/90 border border-primary/30 px-4 py-2.5 rounded-xl text-xs text-white flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{savingStatus || statusMessage}</span>
          </div>
          <button
            onClick={() => { setStatusMessage(null); setSavingStatus(null); }}
            className="text-foreground/40 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Simulation Slider Control Bar (If active) */}
      {isSimulating && (
        <div className="bg-[#1e2533] border border-amber-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Interactive Degradation Stress Generator</span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.2 text-[10px] rounded">
                  {simulatedDegradation}% Severity
                </span>
              </div>
              <div className="text-[11px] text-foreground/50">
                Move slider to inject bearing friction, rotor unbalance harmonics, and optical speed slip.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-[10px] font-mono text-foreground/50">Nominal</span>
            <input
              type="range"
              min="0"
              max="100"
              value={simulatedDegradation}
              onChange={(e) => setSimulatedDegradation(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-red-400">Critical</span>
          </div>
        </div>
      )}

      {/* TAB 1: DIAGNOSTIC COCKPIT */}
      {activeTab === "cockpit" && fusedDiagnostic && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Left: 3 Real Sensor Master Switchboard */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 3 Sensor Probe Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Audio Sensor Card */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isAudioRunning ? "bg-[#13202e] border-cyan-500/40 shadow-lg shadow-cyan-500/5" : "bg-[#161a22] border-white/5"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className={`w-4 h-4 ${isAudioRunning ? "text-cyan-400" : "text-foreground/40"}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Mic</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isAudioRunning ? "bg-cyan-400 animate-pulse" : "bg-white/20"}`} />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mb-0.5">
                    {audioMetrics ? `${audioMetrics.peakFrequency} Hz` : "-- Hz"}
                  </div>
                  <div className="text-[11px] text-foreground/50 flex items-center justify-between">
                    <span>Bearing Band: {audioMetrics ? `${audioMetrics.bearingBandEnergy}%` : "0%"}</span>
                    <span>{audioMetrics ? `${audioMetrics.decibels} dB` : "--"}</span>
                  </div>
                </div>
                <button
                  onClick={toggleAudio}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isAudioRunning ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20"
                  }`}
                >
                  {isAudioRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isAudioRunning ? "Stop Mic" : "Start Mic FFT"}</span>
                </button>
              </div>

              {/* Vibration Sensor Card */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isVibrationRunning ? "bg-[#1a1e2e] border-purple-500/40 shadow-lg shadow-purple-500/5" : "bg-[#161a22] border-white/5"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${isVibrationRunning ? "text-purple-400" : "text-foreground/40"}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Vibration Probe</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isVibrationRunning ? "bg-purple-400 animate-pulse" : "bg-white/20"}`} />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mb-0.5">
                    {vibrationMetrics ? `${vibrationMetrics.velocityRmsMmS} mm/s` : "-- mm/s"}
                  </div>
                  <div className="text-[11px] text-foreground/50 flex items-center justify-between">
                    <span>ISO: {vibrationMetrics ? vibrationMetrics.isoSeverity.status : "Normal"}</span>
                    <span>Peak: {vibrationMetrics ? `${vibrationMetrics.peakMagnitude} m/s²` : "--"}</span>
                  </div>
                </div>
                <button
                  onClick={toggleVibration}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isVibrationRunning ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-purple-500 hover:bg-purple-400 text-white shadow-md shadow-purple-500/20"
                  }`}
                >
                  {isVibrationRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isVibrationRunning ? "Stop Probe" : "Start Motion"}</span>
                </button>
              </div>

              {/* Optical Fan Tachometer Card */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isOpticalRunning ? "bg-[#1f1d17] border-amber-500/40 shadow-lg shadow-amber-500/5" : "bg-[#161a22] border-white/5"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className={`w-4 h-4 ${isOpticalRunning ? "text-amber-400" : "text-foreground/40"}`} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Optical RPM</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isOpticalRunning ? "bg-amber-400 animate-pulse" : "bg-white/20"}`} />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mb-0.5">
                    {opticalMetrics && opticalMetrics.calculatedRpm > 0 ? `${opticalMetrics.calculatedRpm} RPM` : `${currentBenchmark.nominalRpm} RPM`}
                  </div>
                  <div className="text-[11px] text-foreground/50 flex items-center justify-between">
                    <span>Blades: {bladeCount}</span>
                    <span>Conf: {opticalMetrics ? `${opticalMetrics.confidence}%` : "95%"}</span>
                  </div>
                </div>
                <button
                  onClick={toggleOptical}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isOpticalRunning ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isOpticalRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isOpticalRunning ? "Stop Camera" : "Start Camera"}</span>
                </button>
              </div>
            </div>

            {/* Live Dual Visualizer: Audio Spectrum & Vibration Waveform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audio Spectrum Canvas */}
              <div className="bg-[#161a22] p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground/70 uppercase">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Live Acoustic Spectrum (FFT)
                  </span>
                  <span className="font-mono text-[10px] text-foreground/40">20Hz - 20kHz</span>
                </div>
                <div className="h-36 bg-[#0e1117] rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5">
                  <canvas ref={audioCanvasRef} width={320} height={140} className="w-full h-full" />
                  {!isAudioRunning && !isSimulating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/30 text-xs">
                      <Mic className="w-6 h-6 mb-1 opacity-40" />
                      <span>Start Mic probe to stream FFT</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vibration Oscilloscope Canvas */}
              <div className="bg-[#161a22] p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground/70 uppercase">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> 3-Axis Vibration Waveform
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-cyan-400">X</span>
                    <span className="text-purple-400">Y</span>
                    <span className="text-emerald-400">RMS</span>
                  </div>
                </div>
                <div className="h-36 bg-[#0e1117] rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5">
                  <canvas ref={vibrationCanvasRef} width={320} height={140} className="w-full h-full" />
                  {!isVibrationRunning && !isSimulating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/30 text-xs">
                      <Activity className="w-6 h-6 mb-1 opacity-40" />
                      <span>Start Motion probe to view waveform</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Derived Machine Telemetry Grid */}
            <div className="bg-[#161a22] p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                  Fused Multi-Modal Telemetry Vector
                </h3>
                <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  Target: {selectedAsset}-01 ({currentBenchmark.label})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-foreground/40 uppercase">Vibration</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {fusedDiagnostic.derivedSensors.vibration} <span className="text-xs text-foreground/50">mm/s</span>
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">
                    Baseline: {currentBenchmark.nominalVibrationMmS} mm/s
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-foreground/40 uppercase">Temperature</div>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    {fusedDiagnostic.derivedSensors.temperature} <span className="text-xs text-foreground/50">°C</span>
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">
                    Baseline: {currentBenchmark.nominalTempC} °C
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-foreground/40 uppercase">Current</div>
                  <div className="text-lg font-bold font-mono text-purple-400">
                    {fusedDiagnostic.derivedSensors.current} <span className="text-xs text-foreground/50">A</span>
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">
                    Baseline: {currentBenchmark.nominalCurrentA} A
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-foreground/40 uppercase">Pressure</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {fusedDiagnostic.derivedSensors.pressure} <span className="text-xs text-foreground/50">Bar</span>
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">
                    Baseline: {currentBenchmark.nominalPressureBar} Bar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Multi-Agent Diagnostic Verdict */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Health Score & Failure Probability Card */}
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider">
                  AI Machine Health
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  fusedDiagnostic.overallState === "Critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : fusedDiagnostic.overallState === "High" || fusedDiagnostic.overallState === "Elevated"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {fusedDiagnostic.overallState} Condition
                </span>
              </div>

              {/* Gauge & Numbers */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-4xl font-extrabold font-mono text-white tracking-tight">
                    {fusedDiagnostic.overallHealthScore}<span className="text-lg text-foreground/40 font-normal">/100</span>
                  </div>
                  <div className="text-xs text-foreground/50 mt-0.5">Sugeno Fuzzy Health Index</div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold font-mono ${
                    fusedDiagnostic.pipelineResult.predictions.failure_probability > 50 ? "text-red-400" : "text-emerald-400"
                  }`}>
                    {fusedDiagnostic.pipelineResult.predictions.failure_probability}%
                  </div>
                  <div className="text-xs text-foreground/50 mt-0.5">Failure Probability</div>
                </div>
              </div>

              {/* Remaining Useful Life (RUL) */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Estimated RUL</div>
                    <div className="text-[11px] text-foreground/50">Remaining Useful Life</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-white">
                    {fusedDiagnostic.pipelineResult.predictions.rul_days} <span className="text-xs text-foreground/50">Days</span>
                  </div>
                  <div className="text-[10px] text-primary">Regressed AI Trajectory</div>
                </div>
              </div>

              {/* Primary Failure Mode & Diagnosis */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Root Cause Diagnosis
                </div>
                <div className="text-sm font-semibold text-white leading-snug">
                  {fusedDiagnostic.primaryFailureMode}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-primary" /> Prescriptive Action
                </div>
                <div className="text-xs text-foreground/80 bg-white/[0.02] p-3 rounded-xl border border-white/5 leading-relaxed">
                  {fusedDiagnostic.maintenanceAction}
                </div>
              </div>

              {/* Neuro-Symbolic Rules Triggered */}
              {fusedDiagnostic.pipelineResult.neurosymbolic.rules_triggered.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-mono text-foreground/40 uppercase">Domain Rules Fired</div>
                  <div className="flex flex-wrap gap-1.5">
                    {fusedDiagnostic.pipelineResult.neurosymbolic.rules_triggered.map((r, i) => (
                      <span key={i} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleCommitTelemetry(true)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Create Maintenance Work Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACOUSTIC FREQUENCY ANALYZER */}
      {activeTab === "audio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Fourier Acoustic Harmonic Analyzer</h3>
                  <p className="text-xs text-foreground/60">
                    Captures 20Hz - 20,000Hz frequency spectrum to detect bearing defect frequencies (BPFO/BPFI) and blade pass harmonics.
                  </p>
                </div>
                <button
                  onClick={toggleAudio}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isAudioRunning ? "bg-red-500 text-white" : "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                  }`}
                >
                  {isAudioRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isAudioRunning ? "Stop Microphone" : "Start Live Mic"}</span>
                </button>
              </div>

              {/* Live Canvas FFT Spectrum */}
              <div className="h-64 bg-[#0e1117] rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                <canvas ref={audioCanvasRef} width={640} height={256} className="w-full h-full" />
                {!isAudioRunning && !isSimulating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/40 gap-2">
                    <Mic className="w-8 h-8 opacity-40 text-cyan-400 animate-bounce" />
                    <span className="text-xs">Click Start Live Mic to stream acoustic FFT spectrum</span>
                  </div>
                )}
              </div>

              {/* Harmonic Breakdown Table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">1X Fundamental Harmonic (f₀)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {audioMetrics ? `${audioMetrics.peakFrequency} Hz` : "-- Hz"}
                  </div>
                  <div className="text-[11px] text-foreground/40 mt-0.5">Primary rotational shaft hum</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-purple-400 uppercase">2X Harmonic (2f₀)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {audioMetrics && audioMetrics.harmonics[1] ? `${audioMetrics.harmonics[1]} Hz` : "-- Hz"}
                  </div>
                  <div className="text-[11px] text-foreground/40 mt-0.5">Angular misalignment signature</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">3X Harmonic (3f₀)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {audioMetrics && audioMetrics.harmonics[2] ? `${audioMetrics.harmonics[2]} Hz` : "-- Hz"}
                  </div>
                  <div className="text-[11px] text-foreground/40 mt-0.5">Mechanical looseness signature</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Acoustic Fault Metrics</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/70">Bearing Band Energy (2.5k - 6kHz)</span>
                    <span className="font-mono font-bold text-white">{audioMetrics?.bearingBandEnergy || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (audioMetrics?.bearingBandEnergy || 0) > 60 ? "bg-red-500" : (audioMetrics?.bearingBandEnergy || 0) > 35 ? "bg-amber-400" : "bg-cyan-400"
                      }`}
                      style={{ width: `${audioMetrics?.bearingBandEnergy || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/70">Low Frequency Rumble (20Hz - 200Hz)</span>
                    <span className="font-mono font-bold text-white">{audioMetrics?.lowFreqEnergy || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 transition-all"
                      style={{ width: `${audioMetrics?.lowFreqEnergy || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground/70">Cavitation / Turbulence Ratio</span>
                    <span className="font-mono font-bold text-white">{audioMetrics?.cavitationNoiseRatio || 0}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${(audioMetrics?.cavitationNoiseRatio || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
                <div className="text-xs font-semibold text-white mb-1">Acoustic Severity</div>
                <div className={`text-sm font-bold ${
                  audioMetrics?.acousticSeverity === "CRITICAL" ? "text-red-400" : audioMetrics?.acousticSeverity === "ELEVATED" ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {audioMetrics?.acousticSeverity || "NORMAL"}
                </div>
                <div className="text-xs text-foreground/60 mt-1">
                  {audioMetrics?.detectedAcousticFault || "Awaiting microphone stream."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOTOR VIBRATION & MOTION PROBE */}
      {activeTab === "vibration" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">3-Axis Motor Vibration Oscilloscope</h3>
                  <p className="text-xs text-foreground/60">
                    Reads linear acceleration from mobile device accelerometer. Hold phone against machine chassis.
                  </p>
                </div>
                <button
                  onClick={toggleVibration}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isVibrationRunning ? "bg-red-500 text-white" : "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  }`}
                >
                  {isVibrationRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isVibrationRunning ? "Stop Motion" : "Start Motion Probe"}</span>
                </button>
              </div>

              {/* Waveform Canvas */}
              <div className="h-64 bg-[#0e1117] rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                <canvas ref={vibrationCanvasRef} width={640} height={256} className="w-full h-full" />
                {!isVibrationRunning && !isSimulating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/40 gap-2">
                    <Activity className="w-8 h-8 opacity-40 text-purple-400 animate-pulse" />
                    <span className="text-xs">Hold phone against motor housing and click Start Motion Probe</span>
                  </div>
                )}
              </div>

              {/* 3-Axis Instantaneous Acceleration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">X-Axis (Radial)</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {vibrationMetrics?.raw.x || 0.0} <span className="text-xs text-foreground/40">m/s²</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <div className="text-[10px] font-mono text-purple-400 uppercase">Y-Axis (Axial)</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {vibrationMetrics?.raw.y || 0.0} <span className="text-xs text-foreground/40">m/s²</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">Z-Axis (Vertical)</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {vibrationMetrics?.raw.z || 0.0} <span className="text-xs text-foreground/40">m/s²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">ISO 10816-3 Severity Standard</h3>

              <div className="p-4 rounded-xl border flex flex-col gap-2" style={{
                backgroundColor: `${vibrationMetrics?.isoSeverity.color || "#22c55e"}15`,
                borderColor: `${vibrationMetrics?.isoSeverity.color || "#22c55e"}40`,
              }}>
                <div className="text-xs text-foreground/50 uppercase font-mono">Severity Rating</div>
                <div className="text-xl font-bold" style={{ color: vibrationMetrics?.isoSeverity.color || "#22c55e" }}>
                  {vibrationMetrics?.isoSeverity.zone || "Zone A (Good)"}
                </div>
                <div className="text-xs text-foreground/80 leading-relaxed mt-1">
                  {vibrationMetrics?.isoSeverity.description || "Machine operating in newly commissioned optimal state."}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">RMS Vibration Velocity</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {vibrationMetrics?.velocityRmsMmS || 0.0} mm/s
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Peak Acceleration</span>
                  <span className="font-mono font-bold text-white">
                    {vibrationMetrics?.peakMagnitude || 0.0} m/s²
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Crest Factor (Peak / RMS)</span>
                  <span className="font-mono font-bold text-white">
                    {vibrationMetrics?.crestFactor || 1.4}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Dominant Frequency</span>
                  <span className="font-mono font-bold text-white">
                    {vibrationMetrics?.dominantFrequencyHz || 30} Hz
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMERA OPTICAL FAN TACHOMETER & STROBOSCOPE */}
      {activeTab === "optical" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">Camera-Based Optical Fan Speed Tachometer</h3>
                  <p className="text-xs text-foreground/60">
                    Calculates rotational speed (RPM) by analyzing optical luminance periodicity over the central reticle ROI.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {opticalTachometerRef.current?.hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isTorchOn ? "bg-amber-500 text-black border-amber-400" : "bg-white/5 text-white border-white/10"
                      }`}
                      title="Toggle Flashlight / Torch"
                    >
                      <Flashlight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleOptical}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isOpticalRunning ? "bg-red-500 text-white" : "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    }`}
                  >
                    {isOpticalRunning ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                    <span>{isOpticalRunning ? "Stop Camera" : "Start Camera Viewfinder"}</span>
                  </button>
                </div>
              </div>

              {/* Viewfinder Container */}
              <div className="h-72 bg-[#0e1117] rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isOpticalRunning ? "block" : "hidden"}`}
                />

                {/* Simulation Canvas if Simulating */}
                {isSimulating && (
                  <canvas ref={fanSimCanvasRef} width={280} height={280} className="w-48 h-48 object-contain" />
                )}

                {/* Targeting Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-24 h-24 border-2 border-dashed border-amber-400/80 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-amber-400 border border-amber-400/30">
                    ROI OPTICAL RETICLE
                  </div>
                </div>

                {!isOpticalRunning && !isSimulating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/40 gap-2">
                    <Camera className="w-8 h-8 opacity-40 text-amber-400" />
                    <span className="text-xs">Click Start Camera Viewfinder to target fan / motor shaft</span>
                  </div>
                )}
              </div>

              {/* Blade Count & Speed Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/70 font-medium">Fan Blade / Impeller Vane Count</span>
                    <span className="font-mono font-bold text-amber-400">{bladeCount} Blades</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={bladeCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setBladeCount(count);
                      opticalTachometerRef.current?.setBladeCount(count);
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-foreground/40">
                    Formula: RPM = (Blade Pass Frequency (Hz) × 60) / Blade Count
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/70 font-medium">Virtual Stroboscope Strobe Sync</span>
                    <span className="font-mono font-bold text-cyan-400">{strobeHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={strobeHz}
                    onChange={(e) => {
                      const hz = parseInt(e.target.value);
                      setStrobeHz(hz);
                      opticalTachometerRef.current?.setStrobeFrequency(hz);
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="text-[10px] text-foreground/40">
                    Adjust frequency to freeze rotation visually and confirm shaft speed.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Speedometer Telemetry</h3>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center flex flex-col items-center">
                <Gauge className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                <div className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {opticalMetrics && opticalMetrics.calculatedRpm > 0 ? opticalMetrics.calculatedRpm : currentBenchmark.nominalRpm}
                </div>
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mt-1">
                  RPM (Revolutions Per Min)
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Blade Pass Frequency (BPF)</span>
                  <span className="font-mono font-bold text-white">
                    {opticalMetrics?.frequencyHz || currentBenchmark.nominalAcousticFreqHz} Hz
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Shaft Rotational Frequency</span>
                  <span className="font-mono font-bold text-white">
                    {opticalMetrics?.rotationalHz || (currentBenchmark.nominalRpm / 60).toFixed(1)} Hz
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Optical Tracking Confidence</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {opticalMetrics?.confidence || 95}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground/70">Video Sampling Frame Rate</span>
                  <span className="font-mono font-bold text-white">
                    {opticalMetrics?.samplingFps || 60} FPS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATASET BENCHMARKS */}
      {activeTab === "benchmarks" && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#161a22] p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-white">Repository Equipment Dataset Profiles</h3>
                <p className="text-xs text-foreground/60">
                  Pre-configured nominal operating baselines from github.com/sajai1234/codiench-0096.git and products_dataset.xlsx.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(REPO_DATASET_BENCHMARKS).map(([key, bm]) => {
                const isSel = selectedAsset === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedAsset(key)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSel ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5" : "bg-white/[0.02] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase">{key}-01</span>
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-foreground/80">
                        {bm.nominalRpm} RPM
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-primary mb-1">{bm.label}</div>
                    <div className="text-xs text-foreground/60 mb-3">{bm.description}</div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-foreground/70 bg-black/20 p-2.5 rounded-xl border border-white/5">
                      <div>Vib: {bm.nominalVibrationMmS} mm/s</div>
                      <div>Temp: {bm.nominalTempC} °C</div>
                      <div>Acoustic: {bm.nominalAcousticFreqHz} Hz</div>
                      <div>Current: {bm.nominalCurrentA} A</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
