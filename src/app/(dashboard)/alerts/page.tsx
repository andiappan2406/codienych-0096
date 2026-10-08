"use client";

import { Bell, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    { id: 1, type: "critical", asset: "PUMP-02", message: "Vibration threshold exceeded (4.5 mm/s).", time: "10 mins ago", status: "Open" },
    { id: 2, type: "warning", asset: "HVAC-04", message: "Temperature rising consistently over last 3 hours.", time: "1 hour ago", status: "Acknowledged" },
    { id: 3, type: "info", asset: "GEN-01", message: "Scheduled self-test completed successfully.", time: "4 hours ago", status: "Resolved" },
    { id: 4, type: "critical", asset: "CHILLER-01", message: "Pressure drop detected in coolant line.", time: "1 day ago", status: "Resolved" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">System Alerts</h1>
          <p className="text-foreground/60 mt-2">Active warnings, anomalies, and maintenance notifications.</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-panel-border flex justify-between items-center">
          <h3 className="text-sm font-mono text-foreground/60 uppercase flex items-center gap-2">
            <Bell className="w-4 h-4" /> Active Incidents
          </h3>
          <div className="text-xs bg-critical/10 text-critical px-2 py-1 rounded border border-critical/20">
            2 Action Required
          </div>
        </div>
        
        <div className="divide-y divide-panel-border">
          {alerts.map(alert => (
            <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  alert.type === 'critical' ? 'bg-critical/20 text-critical' : 
                  alert.type === 'warning' ? 'bg-warning/20 text-warning' : 
                  'bg-healthy/20 text-healthy'
                }`}>
                  {alert.type === 'critical' ? <ShieldAlert className="w-5 h-5" /> : 
                   alert.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                   <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium">{alert.asset} <span className="text-foreground/60 font-normal ml-2">{alert.message}</span></div>
                  <div className="text-xs text-foreground/40 mt-1">{alert.time}</div>
                </div>
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-md border ${
                  alert.status === 'Open' ? 'border-critical/30 text-critical' :
                  alert.status === 'Acknowledged' ? 'border-warning/30 text-warning' :
                  'border-healthy/30 text-healthy'
                }`}>
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
