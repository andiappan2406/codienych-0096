"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert, 
  Search, Filter, Clock, ArrowRight, Check, X, Wrench, Stethoscope, 
  Flame, Activity, Zap, ChevronDown, Download
} from "lucide-react";

interface AlertItem {
  id: string;
  assetId: string;
  assetName: string;
  location: string;
  severity: "critical" | "warning" | "resolved";
  title: string;
  description: string;
  detectedAt: string;
  rulEstimate: string;
  confidence: number;
  sensors: {
    vibration?: string;
    temperature?: string;
    current?: string;
    pressure?: string;
  };
  acknowledged: boolean;
  statusText: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "ALT-9842",
    assetId: "PUMP-03",
    assetName: "Industrial Water Pump 3",
    location: "Sub-basement B2 · Pump Room",
    severity: "critical",
    title: "Accelerated Bearing Race Degradation & Cavitation",
    description: "Multi-axis vibration exceeded 4.8 mm/s threshold with concurrent thermal spike (+36°C above baseline). Isolation Forest anomaly distance: -0.84.",
    detectedAt: "18 minutes ago",
    rulEstimate: "5 - 9 days",
    confidence: 96.4,
    sensors: {
      vibration: "4.85 mm/s (Alert > 3.0)",
      temperature: "78.2 °C (Alert > 55.0)",
      current: "28.4 A (Warn > 22.0)",
    },
    acknowledged: false,
    statusText: "Requires Immediate Action",
  },
  {
    id: "ALT-9839",
    assetId: "CHIL-01",
    assetName: "Central Chiller Unit 1",
    location: "Rooftop Plant · HVAC Zone A",
    severity: "warning",
    title: "Compressor Discharge Superheat Drift",
    description: "Chiller thermal discharge has drifted +14°C from setpoint over 72 hours. Potential condenser tube scaling or refrigerant expansion valve bias.",
    detectedAt: "2 hours ago",
    rulEstimate: "18 - 24 days",
    confidence: 89.2,
    sensors: {
      temperature: "62.4 °C (Baseline 48.0)",
      current: "64.2 A (Baseline 52.0)",
    },
    acknowledged: false,
    statusText: "Observation Required",
  },
  {
    id: "ALT-9815",
    assetId: "ELEV-02",
    assetName: "Passenger Lift 2",
    location: "Central Core · High Rise Bank",
    severity: "warning",
    title: "Hoist Motor Current Imbalance on Descent",
    description: "Current harmonics detected 8% jitter during Floor 14-8 express deceleration. Guide shoe friction or cable counterweight re-balancing recommended.",
    detectedAt: "5 hours ago",
    rulEstimate: "45 days",
    confidence: 84.0,
    sensors: {
      current: "32.0 A (Jitter ±2.8A)",
      vibration: "1.15 mm/s (Nominal)",
    },
    acknowledged: true,
    statusText: "Acknowledged by Operations",
  },
  {
    id: "ALT-9790",
    assetId: "GEN-01",
    assetName: "Standby Diesel Generator 1",
    location: "Ground Level · Utility Annex",
    severity: "resolved",
    title: "Cold Cranking Battery Internal Resistance Spike",
    description: "Automated trickle charger test resolved voltage dip during simulated black-start test. Battery cell replacement completed.",
    detectedAt: "Yesterday at 14:20",
    rulEstimate: "Resolved",
    confidence: 99.1,
    sensors: {
      current: "48.0 A (Restored)",
    },
    acknowledged: true,
    statusText: "Resolved by Technician Mark R.",
  },
  {
    id: "ALT-9762",
    assetId: "PUMP-01",
    assetName: "Primary Feed Pump 1",
    location: "Sub-basement B2 · Pump Room",
    severity: "resolved",
    title: "Discharge Pressure Transient Micro-Pulse",
    description: "Transient air pocket cleared after automatic bleed valve cycle. Operating pressure normalized to 121 PSI.",
    detectedAt: "3 days ago",
    rulEstimate: "Resolved",
    confidence: 94.5,
    sensors: {
      pressure: "121.0 PSI (Nominal)",
    },
    acknowledged: true,
    statusText: "Auto-Resolved via Purge Cycle",
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true, statusText: "Acknowledged by You" } : a));
    showToast(`Alert ${id} acknowledged`);
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, severity: "resolved", statusText: "Marked Resolved" } : a));
    showToast(`Alert ${id} marked as resolved`);
  };

  const handleAcknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    showToast("All active alerts acknowledged");
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesFilter = filter === "all" || a.severity === filter;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;
  const resolvedCount = alerts.filter(a => a.severity === "resolved").length;

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00e5ff] text-black font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-panel-border/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-1">
            <ShieldAlert className="w-4 h-4" /> Doctor Analysis Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Alert Feed</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Predictive anomaly notifications prioritized by Remaining Useful Life (RUL) and failure severity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-panel-border px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" /> Acknowledge All
          </button>
          <Link
            href="/calendar"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)]"
          >
            <Wrench className="w-4 h-4" /> Dispatch Work Order
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-2 bg-[#121722]/80 p-1.5 rounded-xl border border-panel-border/50">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === "all" ? "bg-primary text-black shadow-md" : "text-foreground/70 hover:text-white"
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === "critical" ? "bg-[#ff4081] text-white shadow-md" : "text-[#ff4081] hover:bg-[#ff4081]/10"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff4081] animate-ping" />
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === "warning" ? "bg-orange-500 text-black shadow-md" : "text-orange-400 hover:bg-orange-500/10"
            }`}
          >
            Warning ({warningCount})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === "resolved" ? "bg-emerald-500 text-black shadow-md" : "text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search by asset, ID, or root cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121722]/80 border border-panel-border/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-foreground/40 focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white">No alerts found</h3>
            <p className="text-sm text-foreground/60 mt-1">
              There are no alerts matching your current filter criteria.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === "critical";
            const isWarning = alert.severity === "warning";
            const isResolved = alert.severity === "resolved";

            return (
              <div 
                key={alert.id}
                className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col gap-4 ${
                  isCritical 
                    ? "border-[#ff4081]/40 bg-[#1a1219]/60 hover:border-[#ff4081]/70" 
                    : isWarning 
                    ? "border-orange-500/30 bg-[#1a1712]/60 hover:border-orange-500/60" 
                    : "border-panel-border/40 opacity-75 hover:opacity-100"
                }`}
              >
                
                {/* Alert Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                      isCritical 
                        ? "bg-[#ff4081]/20 text-[#ff4081] border-[#ff4081]/40" 
                        : isWarning 
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/40" 
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    }`}>
                      {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-[#ff4081] animate-ping" />}
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xs text-foreground/50">{alert.id}</span>
                    <span className="text-xs text-foreground/40">•</span>
                    <span className="font-mono text-xs text-primary font-semibold">{alert.assetId}</span>
                    <span className="text-xs text-foreground/70">{alert.assetName}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-foreground/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {alert.detectedAt}
                    </span>
                    {alert.acknowledged && (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Acknowledged
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{alert.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed max-w-4xl">{alert.description}</p>
                </div>

                {/* Telemetry Snapshot & Model Confidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-panel-border/30">
                  <div className="bg-[#121722]/80 p-3 rounded-xl border border-panel-border/40">
                    <div className="text-[10px] font-mono text-foreground/50 uppercase">Predicted RUL</div>
                    <div className={`text-sm font-bold mt-0.5 ${isCritical ? "text-[#ff4081]" : "text-white"}`}>
                      {alert.rulEstimate}
                    </div>
                  </div>

                  <div className="bg-[#121722]/80 p-3 rounded-xl border border-panel-border/40">
                    <div className="text-[10px] font-mono text-foreground/50 uppercase">AI Diagnosis Confidence</div>
                    <div className="text-sm font-bold text-primary mt-0.5">
                      {alert.confidence}% (IsoForest + XGBoost)
                    </div>
                  </div>

                  <div className="bg-[#121722]/80 p-3 rounded-xl border border-panel-border/40">
                    <div className="text-[10px] font-mono text-foreground/50 uppercase">Location</div>
                    <div className="text-sm font-semibold text-white mt-0.5 truncate">
                      {alert.location}
                    </div>
                  </div>

                  <div className="bg-[#121722]/80 p-3 rounded-xl border border-panel-border/40">
                    <div className="text-[10px] font-mono text-foreground/50 uppercase">Live Sensor Breach</div>
                    <div className="text-xs font-mono text-white mt-0.5 truncate">
                      {alert.sensors.vibration || alert.sensors.temperature || alert.sensors.current || alert.sensors.pressure}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-panel-border/30">
                  <div className="text-xs text-foreground/50 font-mono">
                    Status: <span className="text-white font-medium">{alert.statusText}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/health"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-panel-border flex items-center gap-1.5 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-primary" /> Doctor Health View
                    </Link>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white border border-panel-border flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}

                    <Link
                      href="/calendar"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-black flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Dispatch Work Order
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
