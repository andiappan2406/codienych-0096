"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, AlertCircle, Wrench, Calendar as CalIcon, Activity, 
  Flame, Zap, Check, ArrowRight, Fan, ArrowUpRight, TrendingUp, 
  Search, HelpCircle, Heart, Stethoscope, ChevronRight
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type EquipKey = "pump3" | "pump1" | "chiller1" | "lift2";

interface EquipData {
  id: EquipKey;
  name: string;
  status: "At risk" | "Healthy" | "Watch";
  statusColor: string;
  healthScore: number;
  healthState: string;
  gaugeNeedleAngle: number; // degrees
  timeVal: string;
  timeUnit: string;
  modelsAgreement: string;
  chartThreshold: number;
  chartData: { time: number; val: number }[];
  why: {
    icon: any;
    label: string;
    level: string; // percentage string for bar
    color: string;
  }[];
  ifWait: {
    now: number;
    days5: number;
    days10: number;
  };
  theFix: {
    action: string;
    timeline: string;
    details: string;
  };
}

const EQUIP_DATA: Record<EquipKey, EquipData> = {
  pump3: {
    id: "pump3",
    name: "Pump 3",
    status: "At risk",
    statusColor: "#f97316",
    healthScore: 38,
    healthState: "At risk",
    gaugeNeedleAngle: -35,
    timeVal: "5-9",
    timeUnit: "days",
    modelsAgreement: "4 of 4 AI models agree",
    chartThreshold: 40,
    chartData: Array.from({ length: 60 }).map((_, i) => ({
      time: i,
      val: i < 40 ? 2 + Math.random() * 0.4 : 2 + (i - 40) * 0.14 + Math.random() * 0.7,
    })),
    why: [
      { icon: Activity, label: "Shaking more", level: "95%", color: "bg-red-500" },
      { icon: Flame, label: "Getting hotter", level: "75%", color: "bg-[#f97316]" },
      { icon: Zap, label: "Using more power", level: "50%", color: "bg-[#eab308]" },
    ],
    ifWait: { now: 22, days5: 58, days10: 91 },
    theFix: {
      action: "Replace bearing",
      timeline: "within 5 days",
      details: "Drive-end bearing assembly (SKF-6312) · Pump Room B2"
    }
  },
  pump1: {
    id: "pump1",
    name: "Pump 1",
    status: "Healthy",
    statusColor: "#22c55e",
    healthScore: 94,
    healthState: "Healthy",
    gaugeNeedleAngle: 55,
    timeVal: "78+",
    timeUnit: "days",
    modelsAgreement: "4 of 4 AI models agree",
    chartThreshold: 60,
    chartData: Array.from({ length: 60 }).map((_, i) => ({
      time: i,
      val: 1.8 + Math.random() * 0.25,
    })),
    why: [
      { icon: Activity, label: "Vibration steady", level: "15%", color: "bg-[#22c55e]" },
      { icon: Flame, label: "Thermal balance", level: "20%", color: "bg-[#22c55e]" },
      { icon: Zap, label: "Standard amperage", level: "25%", color: "bg-[#22c55e]" },
    ],
    ifWait: { now: 4, days5: 5, days10: 7 },
    theFix: {
      action: "Standard check",
      timeline: "Routine (60d)",
      details: "Periodic inspection cycle · No faults detected"
    }
  },
  chiller1: {
    id: "chiller1",
    name: "Chiller 1",
    status: "Watch",
    statusColor: "#eab308",
    healthScore: 68,
    healthState: "Watch",
    gaugeNeedleAngle: 10,
    timeVal: "18-24",
    timeUnit: "days",
    modelsAgreement: "3 of 4 AI models agree",
    chartThreshold: 35,
    chartData: Array.from({ length: 60 }).map((_, i) => ({
      time: i,
      val: i < 35 ? 1.4 + Math.random() * 0.2 : 1.4 + (i - 35) * 0.05 + Math.random() * 0.3,
    })),
    why: [
      { icon: Flame, label: "Superheat drifting", level: "65%", color: "bg-[#eab308]" },
      { icon: Activity, label: "Compressor harmonic", level: "40%", color: "bg-[#eab308]" },
      { icon: Zap, label: "Elevated motor current", level: "48%", color: "bg-[#eab308]" },
    ],
    ifWait: { now: 12, days5: 28, days10: 52 },
    theFix: {
      action: "Chemical flush",
      timeline: "within 14 days",
      details: "Clean condenser tubes & calibrate expansion valve"
    }
  },
  lift2: {
    id: "lift2",
    name: "Lift 2",
    status: "Healthy",
    statusColor: "#22c55e",
    healthScore: 92,
    healthState: "Healthy",
    gaugeNeedleAngle: 50,
    timeVal: "60+",
    timeUnit: "days",
    modelsAgreement: "4 of 4 AI models agree",
    chartThreshold: 60,
    chartData: Array.from({ length: 60 }).map((_, i) => ({
      time: i,
      val: 1.0 + Math.random() * 0.2,
    })),
    why: [
      { icon: Activity, label: "Guide shoe aligned", level: "18%", color: "bg-[#22c55e]" },
      { icon: Flame, label: "Brake temperature OK", level: "22%", color: "bg-[#22c55e]" },
      { icon: Zap, label: "Traction motor nominal", level: "20%", color: "bg-[#22c55e]" },
    ],
    ifWait: { now: 6, days5: 8, days10: 12 },
    theFix: {
      action: "Rope lubrication",
      timeline: "Routine (45d)",
      details: "Next standard bi-monthly hoist inspection"
    }
  }
};

export default function DashboardOverview() {
  const [selectedEquip, setSelectedEquip] = useState<EquipKey>("pump3");
  const [fixActionState, setFixActionState] = useState<"pending" | "approved" | "rejected">("pending");

  const equip = EQUIP_DATA[selectedEquip];

  const handleSelectEquip = (key: EquipKey) => {
    setSelectedEquip(key);
    setFixActionState("pending");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      
      {/* Equipment Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Pump 1 */}
        <div 
          onClick={() => handleSelectEquip("pump1")}
          className={`border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
            selectedEquip === "pump1" 
              ? "bg-[#182436] border-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
              : "bg-[#1a202c]/80 border-transparent hover:bg-[#1f2736]"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#053c29] flex items-center justify-center text-[#22c55e]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Pump 1</h3>
            <p className="text-[#22c55e] text-sm font-medium">Healthy</p>
          </div>
        </div>

        {/* Pump 3 */}
        <div 
          onClick={() => handleSelectEquip("pump3")}
          className={`border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer relative overflow-hidden ${
            selectedEquip === "pump3" 
              ? "bg-[#1e1c18] border-[#f97316] shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
              : "bg-[#1a202c]/80 border-transparent hover:bg-[#1f2736]"
          }`}
        >
          {selectedEquip === "pump3" && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#f97316]/10 to-transparent pointer-events-none" />
          )}
          <div className="w-10 h-10 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[#f97316] relative z-10">
            <Activity className="w-5 h-5" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-semibold">Pump 3</h3>
            <p className="text-[#f97316] text-sm font-medium">At risk</p>
          </div>
        </div>

        {/* Chiller 1 */}
        <div 
          onClick={() => handleSelectEquip("chiller1")}
          className={`border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
            selectedEquip === "chiller1" 
              ? "bg-[#1e221b] border-[#eab308] shadow-[0_0_15px_rgba(234,179,8,0.25)]" 
              : "bg-[#1a202c]/80 border-transparent hover:bg-[#1f2736]"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308]">
            <Fan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Chiller 1</h3>
            <p className="text-[#eab308] text-sm font-medium">Watch</p>
          </div>
        </div>

        {/* Lift 2 */}
        <div 
          onClick={() => handleSelectEquip("lift2")}
          className={`border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
            selectedEquip === "lift2" 
              ? "bg-[#182436] border-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
              : "bg-[#1a202c]/80 border-transparent hover:bg-[#1f2736]"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#053c29] flex items-center justify-center text-[#22c55e]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Lift 2</h3>
            <p className="text-[#22c55e] text-sm font-medium">Healthy</p>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Health Score Gauge */}
        <div className="col-span-12 md:col-span-3 bg-[#1a202c]/90 rounded-2xl p-6 relative flex flex-col justify-between border border-panel-border/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">HEALTH SCORE</h3>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${equip.statusColor}20`, color: equip.statusColor }}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative py-4">
            {/* CSS Arc for Gauge */}
            <div className="relative w-48 h-24 overflow-hidden mb-4">
              <div className="w-48 h-48 rounded-full border-[12px] border-t-red-500 border-r-[#f97316] border-b-[#eab308] border-l-[#22c55e] rotate-45"></div>
              {/* Dynamic Needle */}
              <div 
                className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-white origin-bottom -translate-x-1/2 rounded-full z-10 transition-transform duration-700 ease-out shadow-md"
                style={{ transform: `translateX(-50%) rotate(${equip.gaugeNeedleAngle}deg)` }}
              />
              <div className="absolute bottom-[-6px] left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 z-20 shadow-lg" />
            </div>
            <h2 className="font-bold text-2xl mt-2 capitalize" style={{ color: equip.statusColor }}>
              {equip.healthState} ({equip.healthScore}%)
            </h2>
          </div>

          <Link 
            href="/health" 
            className="text-xs text-primary hover:underline flex items-center justify-center gap-1 pt-3 border-t border-slate-700/50 mt-2"
          >
            <Stethoscope className="w-3.5 h-3.5" /> Open Doctor Diagnostics
          </Link>
        </div>

        {/* Telemetry Chart */}
        <div className="col-span-12 md:col-span-6 bg-[#1a202c]/90 rounded-2xl p-6 flex flex-col border border-panel-border/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">VIBRATION PROFILE</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#06b6d4]" /> Normal</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500" /> Current</span>
            </div>
          </div>

          <div className="flex-1 relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equip.chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                {equip.status !== "Healthy" && (
                  <ReferenceLine x={equip.chartThreshold} stroke="#ef4444" strokeDasharray="3 3" />
                )}
                <YAxis hide domain={['minData - 0.2', 'maxData + 0.2']} />
                <Line 
                  type="monotone" dataKey="val" stroke="#06b6d4" strokeWidth={2.5} dot={false} 
                  strokeDasharray="5 5" isAnimationActive={false}
                />
                <Line 
                  type="monotone" dataKey="val" 
                  stroke={equip.status === "Healthy" ? "#22c55e" : "#ef4444"} 
                  strokeWidth={2.5} 
                  dot={(props: any) => {
                    if (props.index === equip.chartData.length - 1) {
                      return <circle cx={props.cx} cy={props.cy} r={6} fill={equip.statusColor} stroke="#450a0a" strokeWidth={2} />
                    }
                    return <></>
                  }} 
                  activeDot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
            
            {equip.status !== "Healthy" && (
              <div className="absolute top-2 left-1/2 ml-4 text-red-500 font-bold text-xs">
                Anomaly onset
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[#94a3b8] text-xs">
              <span>1 hour ago</span>
              <span>now</span>
            </div>
          </div>
        </div>

        {/* Time Left */}
        <div className="col-span-12 md:col-span-3 bg-[#1a202c]/90 rounded-2xl p-6 flex flex-col items-center justify-between border border-panel-border/30">
          <div className="w-full text-left">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">REMAINING LIFE</h3>
          </div>

          <div className="flex flex-col items-center my-2">
            <CalIcon className="w-10 h-10 text-[#06b6d4] mb-2" />
            <div className={`text-6xl font-bold tracking-tighter ${equip.status === 'At risk' ? 'text-[#ff6b6b]' : 'text-white'}`}>
              {equip.timeVal}
            </div>
            <div className="text-2xl font-semibold text-white mt-[-5px]">{equip.timeUnit}</div>
          </div>

          <div className="w-full text-center mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[#1a202c] stroke-[3]" />
                </div>
              ))}
            </div>
            <p className="text-[#94a3b8] text-xs font-medium">{equip.modelsAgreement}</p>
          </div>
        </div>

      </div>

      {/* Secondary Row: Why, If We Wait, The Fix */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Why */}
        <div className="col-span-12 md:col-span-4 bg-[#1a202c]/90 rounded-2xl p-6 flex flex-col border border-panel-border/30">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-8 uppercase">WHY?</h3>
          <div className="flex flex-col gap-6 flex-1">
            {equip.why.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="flex-1 text-white font-medium text-sm truncate">{item.label}</div>
                  <div className="w-28 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                    <div className={`h-full ${item.color}`} style={{ width: item.level }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* If We Wait */}
        <div className="col-span-12 md:col-span-4 bg-[#1a202c]/90 rounded-2xl p-6 flex flex-col border border-panel-border/30">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider uppercase">IF WE WAIT</h3>
            <Link href="/whatif" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Simulate <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex justify-between items-end flex-1 pb-4">
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center relative overflow-hidden">
                <div className="text-black font-extrabold text-sm">{equip.ifWait.now}%</div>
              </div>
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-lg">{equip.ifWait.now}%</div>
                <div className="text-white text-xs">Now</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f97316] flex items-center justify-center relative overflow-hidden">
                <div className="text-black font-extrabold text-sm">{equip.ifWait.days5}%</div>
              </div>
              <div className="text-center">
                <div className="text-[#f97316] font-bold text-lg">{equip.ifWait.days5}%</div>
                <div className="text-white text-xs">5 days</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center relative overflow-hidden">
                <div className="text-black font-extrabold text-sm">{equip.ifWait.days10}%</div>
              </div>
              <div className="text-center">
                <div className="text-red-500 font-bold text-lg">{equip.ifWait.days10}%</div>
                <div className="text-white text-xs">10 days</div>
              </div>
            </div>

          </div>
          <div className="text-center text-[#94a3b8] text-xs">chance of breakdown</div>
        </div>

        {/* The Fix */}
        <div className="col-span-12 md:col-span-4 bg-[#1a202c]/90 rounded-2xl p-6 flex flex-col justify-between border border-panel-border/30">
          <div>
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-4 uppercase">THE FIX</h3>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center mt-1 flex-shrink-0">
                <Wrench className="w-6 h-6 text-[#06b6d4]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">{equip.theFix.action}</h2>
                <p className="text-[#94a3b8] text-sm">{equip.name} · {equip.theFix.timeline}</p>
                <p className="text-xs text-foreground/50 mt-1">{equip.theFix.details}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4">
            {fixActionState === "approved" ? (
              <div className="bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e] p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Work Order Scheduled
                </span>
                <Link href="/calendar" className="text-white hover:underline flex items-center gap-1">
                  View Calendar <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : fixActionState === "rejected" ? (
              <div className="bg-red-500/20 border border-red-500/40 text-red-400 p-3 rounded-xl text-xs font-semibold flex items-center justify-between">
                <span>Intervention Deferred</span>
                <button onClick={() => setFixActionState("pending")} className="text-white hover:underline">Undo</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setFixActionState("approved")}
                  className="bg-[#2dd4bf] text-[#0f172a] font-bold py-3 rounded-xl hover:bg-[#14b8a6] transition-colors text-sm shadow-md"
                >
                  Approve
                </button>
                <button 
                  onClick={() => setFixActionState("rejected")}
                  className="bg-transparent border border-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Agents Pipeline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 bg-[#1a202c]/70 p-4 rounded-2xl border border-panel-border/30">
        <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider w-24 uppercase">AI AGENTS</h3>
        
        <div className="flex-1 flex flex-wrap items-center gap-2 w-full">
          <AgentBadge icon={Activity} label="Watch" active />
          <div className="h-[2px] w-6 bg-[#22c55e] hidden sm:block" />
          <AgentBadge icon={Search} label="Diagnose" active />
          <div className="h-[2px] w-6 bg-[#22c55e] hidden sm:block" />
          <AgentBadge icon={TrendingUp} label="Predict" active />
          <div className="h-[2px] w-6 bg-[#22c55e] hidden sm:block" />
          <AgentBadge icon={CalIcon} label="Plan" active />
          <div className="h-[2px] w-6 bg-[#22c55e] hidden sm:block" />
          <AgentBadge icon={HelpCircle} label="Explain" active />
          <div className="h-[2px] w-6 bg-slate-700 hidden sm:block" />
          <div className="px-3.5 py-1.5 rounded-full border border-slate-700 bg-[#1a202c] text-white text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
            {fixActionState === "approved" ? "Approved by You" : "You approve"}
          </div>
        </div>
      </div>

    </div>
  );
}

function AgentBadge({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
  return (
    <div className={`px-3.5 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 ${
      active ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]' : 'border-slate-700 bg-[#1a202c] text-slate-400'
    }`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  );
}
