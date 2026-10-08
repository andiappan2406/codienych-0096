"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, AlertTriangle, ShieldCheck, ArrowRight, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

interface BuildingItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "healthy" | "warning" | "critical";
  healthScore: number;
  activeAlerts: number;
  totalAssets: number;
  monitoredAssets: string[];
  energyEfficiency: string;
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([
    {
      id: "BLD-N01",
      name: "HQ - North Tower",
      type: "Commercial Office",
      location: "Downtown District",
      status: "warning",
      healthScore: 61.0,
      activeAlerts: 1,
      totalAssets: 240,
      monitoredAssets: ["HVAC-01", "ELEVATOR-01"],
      energyEfficiency: "A+",
    },
    {
      id: "BLD-W02",
      name: "Tech Hub - West Campus",
      type: "Research Facility",
      location: "Innovation Park",
      status: "warning",
      healthScore: 71.5,
      activeAlerts: 1,
      totalAssets: 240,
      monitoredAssets: ["PUMP-01", "CHILLER-01"],
      energyEfficiency: "B",
    },
    {
      id: "BLD-S03",
      name: "Logistics Center - South",
      type: "Warehouse",
      location: "Industrial Zone",
      status: "healthy",
      healthScore: 90.0,
      activeAlerts: 0,
      totalAssets: 120,
      monitoredAssets: ["GENERATOR-01"],
      energyEfficiency: "A",
    },
  ]);

  const avgHealth = (buildings.reduce((acc, b) => acc + b.healthScore, 0) / (buildings.length || 1)).toFixed(1);
  const totalAlerts = buildings.reduce((acc, b) => acc + b.activeAlerts, 0);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Facilities Portfolio Health</h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Real-time multi-agent health aggregation across commercial real estate portfolios.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5" />
          Aggregated ML Telemetry
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col gap-1">
          <div className="text-[11px] text-foreground/50 font-mono uppercase">Monitored Facilities</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{buildings.length}</div>
        </div>
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col gap-1">
          <div className="text-[11px] text-foreground/50 font-mono uppercase">Average Portfolio Health</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#4ade80]">{avgHealth}%</div>
        </div>
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 flex flex-col gap-1">
          <div className="text-[11px] text-foreground/50 font-mono uppercase">Active Equipment Alerts</div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono ${totalAlerts > 0 ? "text-warning" : "text-[#4ade80]"}`}>
            {totalAlerts}
          </div>
        </div>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {buildings.map((b) => (
          <div
            key={b.id}
            className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-primary/40 transition-all group relative overflow-hidden shadow-lg"
          >
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: b.status === "healthy" ? "#10b981" : b.status === "warning" ? "#f59e0b" : "#ef4444" }}
            />

            <div className="flex flex-col xs:flex-row justify-between items-start gap-3">
              <div className="flex gap-3.5 items-start">
                <div className="p-2.5 sm:p-3 bg-panel border border-panel-border rounded-xl shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white group-hover:text-primary transition-colors">
                    {b.name}
                  </h2>
                  <div className="flex gap-2 text-xs text-foreground/60 flex-wrap mt-0.5">
                    <span className="font-mono">{b.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {b.location}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 self-start ${
                  b.status === "healthy"
                    ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                    : b.status === "warning"
                    ? "bg-warning/10 text-warning border border-warning/20"
                    : "bg-critical/10 text-critical border border-critical/20"
                }`}
              >
                {b.status === "healthy" ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                {b.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-foreground/50 font-mono uppercase">Health Score</span>
                <span className="text-base font-semibold font-mono text-white">{b.healthScore}%</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-foreground/50 font-mono uppercase">Alerts</span>
                <span className={`text-base font-semibold font-mono ${b.activeAlerts > 0 ? "text-warning" : "text-[#4ade80]"}`}>
                  {b.activeAlerts}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-foreground/50 font-mono uppercase">Total Assets</span>
                <span className="text-base font-semibold font-mono text-white">{b.totalAssets}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-foreground/50 font-mono uppercase">Efficiency</span>
                <span className="text-base font-semibold flex items-center gap-1 font-mono text-primary">
                  <Zap className="w-3.5 h-3.5" /> {b.energyEfficiency}
                </span>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 pt-2 border-t border-panel-border/40">
              <span className="text-[11px] text-foreground/60 font-mono">
                Equipment: {b.monitoredAssets.join(", ")}
              </span>
              <Link href="/overview" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline self-end xs:self-auto">
                <span>View Live Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
