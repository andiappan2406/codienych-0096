"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { ArrowRight, AlertTriangle, AlertCircle, CheckCircle, Search, Filter, Box } from "lucide-react";
import { DEFAULT_ASSETS, AssetData } from "@/data/mockAssets";

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetData[]>(DEFAULT_ASSETS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.assets) && data.assets.length > 0) {
          setAssets(data.assets);
        } else {
          setAssets(DEFAULT_ASSETS);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Assets API error, using default assets:", err);
        setAssets(DEFAULT_ASSETS);
        setLoading(false);
      });
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.type_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.neurosymbolic?.root_cause && asset.neurosymbolic.root_cause.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "CRITICAL") return asset.health.state === "Critical";
      if (statusFilter === "WARNING") return asset.health.state === "High" || asset.health.state === "Warning" || asset.health.state === "Elevated";
      if (statusFilter === "HEALTHY") return asset.health.state === "Normal";

      return true;
    });
  }, [assets, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Equipment Assets</h1>
          <p className="text-foreground/60 text-sm mt-1">Inventory and health status of all monitored building equipment.</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-panel-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-panel border border-panel-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground/80"
          >
            <option value="ALL">All Statuses</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">At Risk / Warning</option>
            <option value="HEALTHY">Healthy Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-foreground/50 animate-pulse flex flex-col items-center gap-3">
          <Box className="w-8 h-8 text-primary animate-spin" />
          <span>Running Neuro-Symbolic AI models across asset fleet...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-xl text-foreground/50">
          No equipment matching &quot;{searchQuery}&quot; found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAssets.map((asset, idx) => {
            const status =
              asset.health.state === "Critical"
                ? "critical"
                : asset.health.state === "Normal"
                ? "healthy"
                : "warning";

            let nextService = "90 days";
            if (status === "critical") nextService = "ASAP (48h window)";
            if (status === "warning") nextService = `Within ${asset.predictions.rul_days} days`;

            return (
              <AssetCard
                key={idx}
                id={asset.id}
                type={asset.type_label}
                health={asset.health.score}
                risk={asset.predictions.failure_probability}
                status={status}
                lastService={asset.last_service}
                nextService={nextService}
                imageUrl={asset.image}
                rootCause={asset.neurosymbolic?.root_cause}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function AssetCard({
  id,
  type,
  health,
  risk,
  status,
  lastService,
  nextService,
  imageUrl,
  rootCause,
}: {
  id: string;
  type: string;
  health: number;
  risk: number;
  status: "healthy" | "warning" | "critical";
  lastService: string;
  nextService: string;
  imageUrl: string;
  rootCause?: string;
}) {
  const statusColors = {
    healthy: "text-healthy bg-healthy/10 border-healthy/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    critical: "text-critical bg-critical/10 border-critical/20",
  };

  const statusText = {
    healthy: "Healthy",
    warning: "At Risk",
    critical: "High Risk",
  };

  return (
    <div className="glass-panel overflow-hidden flex flex-col hover:border-primary/50 transition-all rounded-2xl group shadow-lg">
      <div
        className="h-44 sm:h-48 relative overflow-hidden bg-cover bg-center bg-[#1e2532]"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />

        <div className="absolute top-3 right-3 z-20">
          <div className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 backdrop-blur-md bg-panel/90 ${statusColors[status]}`}>
            <span className="relative flex h-2 w-2">
              {status !== "healthy" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors[status].split(" ")[0].replace("text", "bg")}`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColors[status].split(" ")[0].replace("text", "bg")}`}></span>
            </span>
            {statusText[status]}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col relative z-20 -mt-6">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-white drop-shadow-md">{id}</h3>
          <p className="text-foreground/70 text-xs sm:text-sm drop-shadow-md">{type}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-panel/90 p-2.5 sm:p-3 rounded-lg border border-panel-border backdrop-blur-md">
            <div className="text-[11px] text-foreground/50 mb-0.5">Health Score</div>
            <div className="text-base sm:text-lg font-mono font-bold text-white">{health}/100</div>
          </div>
          <div className="bg-panel/90 p-2.5 sm:p-3 rounded-lg border border-panel-border backdrop-blur-md">
            <div className="text-[11px] text-foreground/50 mb-0.5">Failure Risk</div>
            <div
              className={`text-base sm:text-lg font-mono font-bold ${
                status === "critical" ? "text-critical" : status === "warning" ? "text-warning" : "text-healthy"
              }`}
            >
              {risk}%
            </div>
          </div>
        </div>

        {status !== "healthy" && rootCause && (
          <div className="mb-4 bg-warning/5 border border-warning/20 p-3 rounded-lg text-xs leading-relaxed">
            <span className="text-warning font-semibold uppercase tracking-wider block mb-1">AI DIAGNOSIS:</span>
            <p className="text-foreground/90">{rootCause}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-foreground/70 mb-5 flex-1">
          <div className="flex justify-between border-b border-panel-border/50 pb-1.5">
            <span>Last Service</span>
            <span className="font-mono text-foreground/90">{lastService}</span>
          </div>
          <div className="flex justify-between border-b border-panel-border/50 pb-1.5">
            <span>Next Recommended</span>
            <span className={`font-mono ${status === "critical" ? "text-critical font-semibold" : "text-foreground/90"}`}>{nextService}</span>
          </div>
        </div>

        <Link
          href={`/asset/${id.toLowerCase()}`}
          className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors mt-auto"
        >
          <span>View AI Analysis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
