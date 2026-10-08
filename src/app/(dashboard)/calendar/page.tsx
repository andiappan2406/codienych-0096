"use client";

import { Calendar as CalendarIcon, Clock, Wrench } from "lucide-react";

export default function CalendarPage() {
  const events = [
    { date: "Oct 12, 2026", time: "09:00 AM", title: "HVAC-04 Filter Replacement", type: "Preventative", priority: "Medium" },
    { date: "Oct 15, 2026", time: "10:30 AM", title: "PUMP-02 Bearing Inspection", type: "Predictive", priority: "High" },
    { date: "Oct 20, 2026", time: "02:00 PM", title: "GEN-01 Monthly Test", type: "Routine", priority: "Low" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Maintenance Calendar</h1>
          <p className="text-foreground/60 mt-2">Schedule and upcoming tasks optimized by AI predictions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming List */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-sm font-mono text-foreground/60 uppercase flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4" /> Upcoming Tasks
          </h3>
          <div className="flex flex-col gap-4">
            {events.map((ev, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-panel-border bg-panel rounded-lg hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-mono text-center leading-tight">
                      {ev.date.split(' ')[0]}<br/>
                      <span className="text-lg text-primary">{ev.date.split(' ')[1].replace(',', '')}</span>
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-sm text-foreground/50 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {ev.time}</span>
                      <span className="flex items-center gap-1"><Wrench className="w-3 h-3"/> {ev.type}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <span className={`text-xs px-2 py-1 rounded border ${
                    ev.priority === 'High' ? 'text-critical border-critical/30 bg-critical/10' :
                    ev.priority === 'Medium' ? 'text-warning border-warning/30 bg-warning/10' :
                    'text-foreground/60 border-panel-border bg-background'
                  }`}>
                    {ev.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Widget Placeholder */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center text-center min-h-[400px]">
          <CalendarIcon className="w-16 h-16 text-primary/20 mb-4" />
          <h4 className="text-lg font-medium mb-2">Month View</h4>
          <p className="text-sm text-foreground/50 max-w-xs">
            Interactive calendar view is synced with your CMMS integration.
          </p>
        </div>

      </div>
    </div>
  );
}
