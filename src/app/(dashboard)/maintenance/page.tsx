"use client";

import { CheckCircle, Clock, AlertTriangle, AlertCircle, PlayCircle } from "lucide-react";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

const simulationData = {
  now: [
    { day: "Day 0", risk: 91 },
    { day: "Day 1", risk: 15 },
    { day: "Day 2", risk: 16 },
    { day: "Day 3", risk: 16 },
    { day: "Day 7", risk: 18 },
  ],
  delay3: [
    { day: "Day 0", risk: 91 },
    { day: "Day 1", risk: 94 },
    { day: "Day 2", risk: 96 },
    { day: "Day 3", risk: 20 },
    { day: "Day 7", risk: 22 },
  ],
  delay7: [
    { day: "Day 0", risk: 91 },
    { day: "Day 1", risk: 94 },
    { day: "Day 2", risk: 96 },
    { day: "Day 3", risk: 98 },
    { day: "Day 7", risk: 99 },
  ]
};

export default function MaintenancePlanner() {
  const [simScenario, setSimScenario] = useState<'now' | 'delay3' | 'delay7'>('now');

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Maintenance Planner</h1>
          <p className="text-foreground/60 mt-2">Turn AI predictions into scheduled actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Priority Queue */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Priority Queue
          </h2>
          <div className="flex flex-col gap-4">
            <WorkOrderRow id="HVAC-04" priority="Critical" due="Now" task="Inspect motor / bearing" />
            <WorkOrderRow id="PUMP-02" priority="High" due="Today" task="Inspect vibration" />
            <WorkOrderRow id="ELEV-01" priority="Medium" due="Tomorrow" task="Routine cable check" />
            <WorkOrderRow id="GEN-02" priority="Low" due="This Week" task="Fluid level verification" />
          </div>
        </div>

        {/* What-If Simulation */}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-primary">
            <PlayCircle className="w-5 h-5" /> What-if Simulation
          </h2>
          
          <div className="glass-panel p-6">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6">Target: HVAC-04</h3>
            
            <div className="flex gap-2 mb-8 bg-background p-1 rounded-lg border border-border">
              <button 
                onClick={() => setSimScenario('now')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${simScenario === 'now' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground/60 hover:text-foreground'}`}
              >
                Maintain Now
              </button>
              <button 
                onClick={() => setSimScenario('delay3')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${simScenario === 'delay3' ? 'bg-warning/20 text-warning border border-warning/30' : 'text-foreground/60 hover:text-foreground'}`}
              >
                Delay 3 Days
              </button>
              <button 
                onClick={() => setSimScenario('delay7')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${simScenario === 'delay7' ? 'bg-critical/20 text-critical border border-critical/30' : 'text-foreground/60 hover:text-foreground'}`}
              >
                Delay 7 Days
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <div className="text-xs text-foreground/50 mb-1 uppercase font-mono">Simulated Failure Risk</div>
                <div className={`text-3xl font-mono ${simScenario === 'now' ? 'text-healthy' : simScenario === 'delay3' ? 'text-warning' : 'text-critical'}`}>
                  {simScenario === 'now' ? 'Controlled' : simScenario === 'delay3' ? '96%' : '99%'}
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground/50 mb-1 uppercase font-mono">Expected Downtime</div>
                <div className={`text-3xl font-mono ${simScenario === 'now' ? 'text-foreground' : 'text-critical'}`}>
                  {simScenario === 'now' ? '2.1' : simScenario === 'delay3' ? '11' : '26'} <span className="text-sm text-foreground/50">hours</span>
                </div>
              </div>
            </div>

            <div className="h-[200px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData[simScenario]} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <ReferenceLine y={80} stroke="#FF1744" strokeDasharray="3 3" opacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: '#12141A', borderColor: '#1E2128', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="risk" stroke={simScenario === 'now' ? "#00E5FF" : simScenario === 'delay3' ? "#FFB300" : "#FF1744"} fillOpacity={0.2} fill={simScenario === 'now' ? "#00E5FF" : simScenario === 'delay3' ? "#FFB300" : "#FF1744"} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-primary">Recommended Window</h4>
                <p className="text-xs text-primary/80">Within 48 hours to minimize downtime impact.</p>
              </div>
              <button className="bg-primary text-black px-4 py-2 rounded font-medium text-sm hover:bg-primary/90 transition-colors">
                Create Work Order
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function WorkOrderRow({ id, priority, due, task }: { id: string, priority: string, due: string, task: string }) {
  const pStyles = {
    Critical: 'border-critical/30 bg-critical/5',
    High: 'border-warning/30 bg-warning/5',
    Medium: 'border-primary/30 bg-primary/5',
    Low: 'border-border bg-panel',
  };

  const pText = {
    Critical: 'text-critical',
    High: 'text-warning',
    Medium: 'text-primary',
    Low: 'text-foreground/60',
  };

  const Icon = priority === 'Critical' ? AlertCircle : priority === 'High' ? AlertTriangle : CheckCircle;

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${pStyles[priority as keyof typeof pStyles]} transition-colors hover:bg-panel-border`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center bg-background border border-border`}>
          <Icon className={`w-5 h-5 ${pText[priority as keyof typeof pText]}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{id}</h4>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-current ${pText[priority as keyof typeof pText]}`}>{priority}</span>
          </div>
          <p className="text-xs text-foreground/70">{task}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-foreground/50 mb-1">Due</div>
        <div className={`font-mono text-sm ${priority === 'Critical' ? 'text-critical' : ''}`}>{due}</div>
      </div>
    </div>
  )
}
