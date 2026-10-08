"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AlertItem {
  id: string | number;
  type?: "critical" | "warning" | "info";
  severity?: "critical" | "warning" | "info";
  asset?: string;
  asset_id?: string;
  asset_type?: string;
  title?: string;
  message: string;
  time?: string;
  time_ago?: string;
  status: string;
  action?: string;
  root_cause?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.alerts) && data.alerts.length > 0) {
          setAlerts(data.alerts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Alerts API error, using default alerts:", err);
        setAlerts([
          {
            id: "ALT-001",
            severity: "critical",
            asset_id: "HVAC-01",
            asset_type: "HVAC System",
            title: "Bearing Friction Exceeded",
            message: "Critical risk (88.5% failure probability): High bearing vibration combined with elevated compressor heat.",
            time_ago: "4 mins ago",
            status: "Open",
            action: "Inspect primary compressor bearing and flush refrigerant coolant loops.",
          },
          {
            id: "ALT-002",
            severity: "warning",
            asset_id: "PUMP-01",
            asset_type: "Industrial Water Pump",
            title: "Suction Cavitation Warning",
            message: "Anomaly detected (62.0% failure probability): Impeller cavitation causing mild vibration elevation.",
            time_ago: "15 mins ago",
            status: "Acknowledged",
            action: "Check suction pressure and inspect pump seal integrity.",
          },
          {
            id: "ALT-003",
            severity: "info",
            asset_id: "CHILLER-01",
            asset_type: "Industrial Chiller",
            title: "Routine Baseline Pass",
            message: "Telemetry operating within nominal baseline envelope.",
            time_ago: "3 hours ago",
            status: "Resolved",
            action: "Routine operational monitoring.",
          },
        ]);
        setLoading(false);
      });
  }, []);

  const actionRequiredCount = alerts.filter(
    (a) => (a.severity || a.type) === "critical" || (a.severity || a.type) === "warning"
  ).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Active System Alerts</h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Real-time multi-agent anomaly flags and predictive failure warnings.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5" />
          WatchAgent + DiagnoseAgent Stream
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <div className="p-4 sm:p-6 border-b border-panel-border/60 flex justify-between items-center bg-white/[0.01]">
          <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Multi-Agent Incident Stream
          </h3>
          <div className="text-xs bg-critical/10 text-critical px-2.5 py-1 rounded-md border border-critical/20 font-mono font-bold">
            {actionRequiredCount} Action Required
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-foreground/50 animate-pulse text-xs sm:text-sm">
            Scanning assets across multi-agent baseline monitors...
          </div>
        ) : (
          <div className="divide-y divide-panel-border/50">
            {alerts.map((alert, idx) => {
              const severity = alert.severity || alert.type || "info";
              const assetId = alert.asset_id || alert.asset || "ASSET";
              const timeDisplay = alert.time_ago || alert.time || "Recent";

              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        severity === "critical"
                          ? "bg-critical/20 text-critical border border-critical/30"
                          : severity === "warning"
                          ? "bg-warning/20 text-warning border border-warning/30"
                          : "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30"
                      }`}
                    >
                      {severity === "critical" ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : severity === "warning" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white text-sm sm:text-base">{assetId}</span>
                        {alert.asset_type && (
                          <span className="text-xs text-foreground/50">({alert.asset_type})</span>
                        )}
                        <span className="text-[11px] text-foreground/40 font-mono">• {timeDisplay}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-foreground/90 font-medium mb-1 leading-snug">
                        {alert.message}
                      </div>
                      {(alert.action || alert.root_cause) && (
                        <div className="text-xs text-foreground/60 leading-relaxed">
                          <span className="text-primary font-mono uppercase font-bold text-[11px]">Recommended: </span>
                          {alert.action || alert.root_cause}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 ml-12 md:ml-0 pt-2 md:pt-0 border-t md:border-0 border-panel-border/30">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md border font-mono font-medium ${
                        alert.status === "Open"
                          ? "border-critical/40 text-critical bg-critical/10"
                          : alert.status === "Acknowledged"
                          ? "border-warning/40 text-warning bg-warning/10"
                          : "border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/10"
                      }`}
                    >
                      {alert.status}
                    </span>
                    <Link
                      href={`/asset/${assetId.toLowerCase()}`}
                      className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-colors text-xs flex items-center gap-1 font-mono font-semibold"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
