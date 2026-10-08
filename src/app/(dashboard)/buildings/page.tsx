"use client";

import { Building2, MapPin, Activity, AlertTriangle, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const buildings = [
  {
    id: "BLD-N01",
    name: "HQ - North Tower",
    type: "Commercial Office",
    location: "Downtown District",
    status: "healthy",
    healthScore: 98,
    activeAlerts: 0,
    totalAssets: 245,
    energyEfficiency: "A+",
  },
  {
    id: "BLD-W02",
    name: "Tech Hub - West Campus",
    type: "Research Facility",
    location: "Innovation Park",
    status: "warning",
    healthScore: 82,
    activeAlerts: 3,
    totalAssets: 412,
    energyEfficiency: "B",
  },
  {
    id: "BLD-S03",
    name: "Logistics Center - South",
    type: "Warehouse",
    location: "Industrial Zone",
    status: "healthy",
    healthScore: 95,
    activeAlerts: 1,
    totalAssets: 128,
    energyEfficiency: "A",
  }
];

export default function BuildingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Facilities Overview</h1>
          <p className="text-foreground/60 mt-2">Monitor and manage all buildings across your portfolio.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-background font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Add Building
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Metrics */}
        <div className="glass-panel p-5 flex flex-col gap-2">
          <div className="text-sm text-foreground/60 font-mono uppercase">Total Buildings</div>
          <div className="text-3xl font-bold">3</div>
        </div>
        <div className="glass-panel p-5 flex flex-col gap-2">
          <div className="text-sm text-foreground/60 font-mono uppercase">System Health Average</div>
          <div className="text-3xl font-bold text-emerald-400">91.6%</div>
        </div>
        <div className="glass-panel p-5 flex flex-col gap-2">
          <div className="text-sm text-foreground/60 font-mono uppercase">Active Alerts</div>
          <div className="text-3xl font-bold text-warning">4</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {buildings.map((b) => (
          <div key={b.id} className="glass-panel p-6 flex flex-col gap-5 hover:border-primary/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: b.status === 'healthy' ? '#10b981' : '#f59e0b' }} />
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-panel border border-panel-border rounded-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors">{b.name}</h2>
                  <div className="flex gap-3 text-sm text-foreground/60">
                    <span className="font-mono">{b.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.location}</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 ${
                b.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-warning/10 text-warning border border-warning/20'
              }`}>
                {b.status === 'healthy' ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {b.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-foreground/50 font-mono uppercase">Health Score</span>
                 <span className="text-lg font-semibold">{b.healthScore}%</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-foreground/50 font-mono uppercase">Alerts</span>
                 <span className="text-lg font-semibold">{b.activeAlerts}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-foreground/50 font-mono uppercase">Assets</span>
                 <span className="text-lg font-semibold">{b.totalAssets}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-foreground/50 font-mono uppercase">Efficiency</span>
                 <span className="text-lg font-semibold flex items-center gap-1">
                   <Zap className="w-4 h-4 text-primary" /> {b.energyEfficiency}
                 </span>
               </div>
            </div>

            <div className="bg-panel-border h-px w-full my-1" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/60">{b.type}</span>
              <Link href={`/overview`} className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                View Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
