"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, AlertTriangle, AlertCircle, CheckCircle, Activity, BrainCircuit } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock Data for the chart
const sensorData = [
  { time: "08:00", temp: 40, vib: 2.0, current: 15 },
  { time: "09:00", temp: 41, vib: 2.1, current: 16 },
  { time: "10:00", temp: 43, vib: 2.4, current: 18 },
  { time: "11:00", temp: 47, vib: 3.1, current: 22 },
  { time: "12:00", temp: 53, vib: 4.5, current: 28 }, // Spike
];

export default function CommandCenter() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Building Command Center</h1>
          <p className="text-foreground/60 mt-2">Real-time equipment health and predictive analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Building Health Summary */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-4">Building Health</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-semibold">82</span>
              <span className="text-foreground/50">/100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-panel border border-panel-border p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-healthy" />
                <span className="text-2xl font-semibold">42</span>
              </div>
              <span className="text-xs text-foreground/60">Healthy</span>
            </div>
            <div className="bg-panel border border-panel-border p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-2xl font-semibold">11</span>
              </div>
              <span className="text-xs text-foreground/60">Monitoring</span>
            </div>
            <div className="bg-panel border border-panel-border p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-2xl font-semibold">5</span>
              </div>
              <span className="text-xs text-foreground/60">At Risk</span>
            </div>
            <div className="bg-panel border border-panel-border p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-critical" />
                <span className="text-2xl font-semibold">2</span>
              </div>
              <span className="text-xs text-foreground/60">Critical</span>
            </div>
          </div>
        </div>

        {/* Live Sensor Activity */}
        <div className="lg:col-span-8 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-mono text-foreground/60 uppercase">Live Sensor Activity</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Temperature</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warning" /> Vibration</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-foreground" /> Current</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12141A', borderColor: '#1E2128', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="temp" stroke="#00E5FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="vib" stroke="#FFB300" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="current" stroke="#F5F5F7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Equipment Health */}
        <div className="lg:col-span-8 glass-panel p-6">
          <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6">Equipment Health</h3>
          <div className="flex flex-col gap-3">
            <EquipmentRow id="HVAC-04" name="Main Chiller" health={48} risk={91} status="critical" />
            <EquipmentRow id="PUMP-02" name="Circulation Pump" health={67} risk={61} status="warning" />
            <EquipmentRow id="ELEV-01" name="Passenger Elevator A" health={91} risk={12} status="healthy" />
            <EquipmentRow id="GEN-02" name="Backup Generator" health={94} risk={7} status="healthy" />
          </div>
        </div>

        {/* AI Insight */}
        <div className="lg:col-span-4 glass-panel p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-critical/10 blur-[50px] -z-10 rounded-full" />
          <div className="flex items-center gap-2 mb-4 text-critical">
            <BrainCircuit className="w-5 h-5" />
            <h3 className="text-sm font-mono uppercase font-semibold">AI Insight</h3>
          </div>
          <p className="text-lg leading-relaxed font-medium mb-6">
            HVAC-04 shows abnormal vibration and temperature behavior deviating from dynamic baseline.
          </p>
          <div className="flex flex-col gap-2 mb-6 text-sm text-foreground/70">
            <div className="flex justify-between border-b border-panel-border pb-2">
              <span>Primary Contributor</span>
              <span className="text-warning font-mono">Vibration (41%)</span>
            </div>
            <div className="flex justify-between border-b border-panel-border pb-2">
              <span>Failure Probability</span>
              <span className="text-critical font-mono">91%</span>
            </div>
            <div className="flex justify-between border-b border-panel-border pb-2">
              <span>Est. Window</span>
              <span className="font-mono">48-96h</span>
            </div>
          </div>
          <Link href="/asset/hvac-04" className="w-full inline-flex justify-center items-center gap-2 bg-panel border border-critical/30 text-critical hover:bg-critical/10 px-4 py-2 rounded-md font-medium transition-colors">
            View Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

function EquipmentRow({ id, name, health, risk, status }: { id: string, name: string, health: number, risk: number, status: 'healthy' | 'warning' | 'critical' }) {
  const statusColors = {
    healthy: 'text-healthy bg-healthy/10 border-healthy/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    critical: 'text-critical bg-critical/10 border-critical/20',
  };

  const Icon = status === 'healthy' ? CheckCircle : (status === 'warning' ? AlertTriangle : AlertCircle);

  return (
    <Link href={`/asset/${id.toLowerCase()}`} className="group flex items-center justify-between p-4 bg-panel border border-panel-border hover:border-primary/50 rounded-lg transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-md border flex items-center justify-center ${statusColors[status]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{id}</h4>
          <span className="text-xs text-foreground/50">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-8 text-sm">
        <div className="hidden sm:block">
          <div className="text-foreground/50 text-xs mb-1">Health</div>
          <div className="font-mono">{health}/100</div>
        </div>
        <div>
          <div className="text-foreground/50 text-xs mb-1">Risk</div>
          <div className="font-mono">{risk}%</div>
        </div>
        <ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
