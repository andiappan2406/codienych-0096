"use client";

import { useState, useEffect } from "react";
import { Heart, Activity, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { DEFAULT_ASSETS, AssetData } from "@/data/mockAssets";

export default function HealthPage() {
  const [assets, setAssets] = useState<AssetData[]>(DEFAULT_ASSETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.assets) && data.assets.length > 0) {
          setAssets(data.assets);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Using fallback assets:", err);
        setLoading(false);
      });
  }, []);

  const avgHealth = Math.round(
    assets.reduce((sum, a) => sum + (a.health?.score || 0), 0) / (assets.length || 1)
  );

  const criticalCount = assets.filter((a) => a.health?.state === "Critical").length;
  const warningCount = assets.filter((a) => a.health?.state === "Warning" || a.health?.state === "High").length;
  const healthyCount = assets.filter((a) => a.health?.state === "Normal").length;

  return (
    <div className="flex flex-col gap-6 max-w-full pb-16">
      {/* Header */}
      <div className="bg-[#161a22] border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red-400 fill-red-400/20" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Health Doctor</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Equipment Fleet Health & Neuro-Symbolic State</h1>
          <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">
            Real-time Sugeno fuzzy health inference and degradation classification across all building assets.
          </p>
        </div>

        <Link
          href="/sensor-doctor"
          className="bg-primary hover:bg-primary/90 text-black px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 self-start sm:self-center shadow-lg shadow-primary/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Mobile Sensor Inspector</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#161a22] p-5 rounded-2xl border border-white/5">
          <div className="text-xs font-bold text-foreground/50 uppercase">Fleet Avg Health</div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {avgHealth}<span className="text-sm font-normal text-foreground/40">/100</span>
          </div>
          <div className="text-xs text-foreground/40 mt-1">Fuzzy Weighted Sugeno</div>
        </div>

        <div className="bg-[#161a22] p-5 rounded-2xl border border-red-500/20">
          <div className="text-xs font-bold text-red-400 uppercase">Critical Condition</div>
          <div className="text-3xl font-extrabold font-mono text-red-400 mt-1">{criticalCount} Assets</div>
          <div className="text-xs text-foreground/40 mt-1">Immediate action required</div>
        </div>

        <div className="bg-[#161a22] p-5 rounded-2xl border border-amber-500/20">
          <div className="text-xs font-bold text-amber-400 uppercase">Warning / Elevated</div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1">{warningCount} Assets</div>
          <div className="text-xs text-foreground/40 mt-1">Plan service window</div>
        </div>

        <div className="bg-[#161a22] p-5 rounded-2xl border border-emerald-500/20">
          <div className="text-xs font-bold text-emerald-400 uppercase">Nominal Operating</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">{healthyCount} Assets</div>
          <div className="text-xs text-foreground/40 mt-1">Conforms to baselines</div>
        </div>
      </div>

      {/* Asset Health Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assets.map((asset) => {
          const isCrit = asset.health?.state === "Critical";
          const isWarn = asset.health?.state === "Warning" || asset.health?.state === "High";
          return (
            <div
              key={asset.id}
              className={`bg-[#161a22] p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCrit ? "border-red-500/40 shadow-lg shadow-red-500/5" : isWarn ? "border-amber-500/30" : "border-white/5"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-foreground/60">{asset.id}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                    isCrit ? "bg-red-500/20 text-red-400" : isWarn ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {asset.health?.state || "Normal"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{asset.type_label}</h3>
                <p className="text-xs text-foreground/60 mb-4">{asset.neurosymbolic?.root_cause || "Operating nominally."}</p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                  <div>
                    <span className="text-foreground/40">Health:</span>{" "}
                    <span className="text-white font-bold">{asset.health?.score || 90}/100</span>
                  </div>
                  <div>
                    <span className="text-foreground/40">Fail Prob:</span>{" "}
                    <span className={isCrit ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                      {asset.predictions?.failure_probability || 5}%
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground/40">Vibration:</span>{" "}
                    <span className="text-cyan-400">{asset.sensors?.vibration || 1.2} mm/s</span>
                  </div>
                  <div>
                    <span className="text-foreground/40">RUL:</span>{" "}
                    <span className="text-primary font-bold">{asset.predictions?.rul_days || 60}d</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-foreground/40">Last Service: {asset.last_service}</span>
                <Link
                  href={`/asset/${asset.id}`}
                  className="text-xs font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Diagnostic Detail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
