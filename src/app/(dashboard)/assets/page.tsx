"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, AlertCircle, CheckCircle, Search, Filter } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Equipment Assets</h1>
          <p className="text-foreground/60 mt-2">Inventory and health status of all monitored building equipment.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-panel border border-panel-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-panel border border-panel-border px-4 py-2 rounded-md text-sm font-medium hover:bg-panel-border transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssetCard 
          id="HVAC-04" 
          type="HVAC System" 
          health={48} 
          risk={91} 
          status="critical" 
          lastService="42 days ago" 
          nextService="ASAP (48h window)" 
        />
        <AssetCard 
          id="PUMP-02" 
          type="Industrial Water Pump" 
          health={67} 
          risk={61} 
          status="warning" 
          lastService="14 days ago" 
          nextService="Within 7 days" 
        />
        <AssetCard 
          id="ELEV-01" 
          type="Passenger Elevator" 
          health={91} 
          risk={12} 
          status="healthy" 
          lastService="5 days ago" 
          nextService="90 days" 
        />
        <AssetCard 
          id="GEN-02" 
          type="Backup Generator" 
          health={94} 
          risk={7} 
          status="healthy" 
          lastService="120 days ago" 
          nextService="60 days" 
        />
        <AssetCard 
          id="TRANS-01" 
          type="Electrical Transformer" 
          health={88} 
          risk={15} 
          status="healthy" 
          lastService="210 days ago" 
          nextService="150 days" 
        />
      </div>
    </div>
  );
}

function AssetCard({ 
  id, type, health, risk, status, lastService, nextService 
}: { 
  id: string, type: string, health: number, risk: number, status: 'healthy' | 'warning' | 'critical', lastService: string, nextService: string 
}) {
  const statusColors = {
    healthy: 'text-healthy bg-healthy/10 border-healthy/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    critical: 'text-critical bg-critical/10 border-critical/20',
  };

  const statusText = {
    healthy: 'Healthy',
    warning: 'At Risk',
    critical: 'High Risk',
  };

  const Icon = status === 'healthy' ? CheckCircle : (status === 'warning' ? AlertTriangle : AlertCircle);

  return (
    <div className="glass-panel overflow-hidden flex flex-col hover:border-primary/30 transition-colors group">
      {/* Abstract Image Placeholder representing high-quality visuals */}
      <div className="h-40 bg-border/50 relative overflow-hidden tech-grid flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10" />
        <span className="font-mono text-4xl text-foreground/10 z-0">{id.split('-')[0]}</span>
        
        <div className="absolute top-4 right-4 z-20">
          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 backdrop-blur-md ${statusColors[status]}`}>
            <span className="relative flex h-1.5 w-1.5">
              {status !== 'healthy' && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors[status].split(' ')[0].replace('text', 'bg')}`}></span>}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusColors[status].split(' ')[0].replace('text', 'bg')}`}></span>
            </span>
            {statusText[status]}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-semibold tracking-tight">{id}</h3>
          <p className="text-foreground/50 text-sm">{type}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-panel/50 p-3 rounded border border-panel-border">
            <div className="text-xs text-foreground/50 mb-1">Health</div>
            <div className="text-lg font-mono">{health}/100</div>
          </div>
          <div className="bg-panel/50 p-3 rounded border border-panel-border">
            <div className="text-xs text-foreground/50 mb-1">Failure Risk</div>
            <div className={`text-lg font-mono ${status === 'critical' ? 'text-critical' : status === 'warning' ? 'text-warning' : ''}`}>{risk}%</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-foreground/70 mb-8 flex-1">
          <div className="flex justify-between border-b border-panel-border pb-2">
            <span>Last Service</span>
            <span className="font-mono">{lastService}</span>
          </div>
          <div className="flex justify-between border-b border-panel-border pb-2">
            <span>Next Recommended</span>
            <span className={`font-mono ${status === 'critical' ? 'text-critical' : ''}`}>{nextService}</span>
          </div>
        </div>

        <Link href={`/asset/${id.toLowerCase()}`} className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 py-2.5 rounded-md font-medium transition-colors mt-auto">
          View AI Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
