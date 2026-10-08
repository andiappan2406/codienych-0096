"use client";

import { CheckCircle2, AlertCircle, Wrench, Calendar as CalIcon, Activity, Flame, Zap, Check, ArrowRight, Fan, ArrowUpRight, TrendingUp, Search, HelpCircle, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const vibrationData = Array.from({ length: 60 }).map((_, i) => ({
  time: i,
  val: i < 40 ? 2 + Math.random() * 0.5 : 2 + (i - 40) * 0.15 + Math.random() * 0.8,
}));

export default function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      
      {/* Equipment Tabs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1a202c] border border-transparent rounded-xl p-4 flex items-center gap-4 hover:bg-[#1f2736] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#053c29] flex items-center justify-center text-[#22c55e]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Pump 1</h3>
            <p className="text-[#22c55e] text-sm font-medium">Healthy</p>
          </div>
        </div>

        <div className="bg-[#1e1c18] border border-[#f97316] rounded-xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#f97316]/10 to-transparent" />
          <div className="w-10 h-10 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[#f97316] relative z-10">
            <Activity className="w-5 h-5" />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-semibold">Pump 3</h3>
            <p className="text-[#f97316] text-sm font-medium">At risk</p>
          </div>
        </div>

        <div className="bg-[#1a202c] border border-transparent rounded-xl p-4 flex items-center gap-4 hover:bg-[#1f2736] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308]">
            <Fan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Chiller 1</h3>
            <p className="text-[#eab308] text-sm font-medium">Watch</p>
          </div>
        </div>

        <div className="bg-[#1a202c] border border-transparent rounded-xl p-4 flex items-center gap-4 hover:bg-[#1f2736] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-[#053c29] flex items-center justify-center text-[#22c55e]">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Lift 2</h3>
            <p className="text-[#22c55e] text-sm font-medium">Healthy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Health Score Gauge */}
        <div className="col-span-3 bg-[#1a202c] rounded-2xl p-6 relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider">HEALTH SCORE</h3>
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Simple CSS Arc for Gauge */}
            <div className="relative w-48 h-24 overflow-hidden mb-4">
              <div className="w-48 h-48 rounded-full border-[12px] border-t-red-500 border-r-[#f97316] border-b-[#eab308] border-l-[#22c55e] rotate-45"></div>
              {/* Needle */}
              <div className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom -translate-x-1/2 -rotate-[30deg] rounded-full z-10" />
              <div className="absolute bottom-[-6px] left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 z-20 shadow-lg" />
            </div>
            <h2 className="text-[#f97316] font-bold text-2xl mt-2">At risk</h2>
          </div>
        </div>

        {/* Chart */}
        <div className="col-span-6 bg-[#1a202c] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider">VIBRATION</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-[#06b6d4]" /> Normal</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500" /> Now</span>
            </div>
          </div>
          <div className="flex-1 relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vibrationData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <ReferenceLine x={40} stroke="#ef4444" strokeDasharray="3 3" />
                <YAxis hide domain={['minData', 'maxData']} />
                <Line type="monotone" dataKey="val" stroke="#06b6d4" strokeWidth={2.5} dot={false} 
                  strokeDasharray="5 5" 
                  isAnimationActive={false}
                />
                <Line type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={2.5} dot={(props: any) => {
                  if (props.index === vibrationData.length - 1) {
                    return <circle cx={props.cx} cy={props.cy} r={6} fill="#ef4444" stroke="#450a0a" strokeWidth={2} />
                  }
                  return <></>
                }} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-2 left-1/2 ml-4 text-red-500 font-bold text-sm">Problem starts</div>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[#94a3b8] text-xs">
              <span>1 hour ago</span>
              <span>now</span>
            </div>
          </div>
        </div>

        {/* Time Left */}
        <div className="col-span-3 bg-[#1a202c] rounded-2xl p-6 flex flex-col items-center justify-between">
          <div className="w-full text-left">
            <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider">TIME LEFT</h3>
          </div>
          <div className="flex flex-col items-center">
            <CalIcon className="w-10 h-10 text-[#06b6d4] mb-2" />
            <div className="text-6xl font-bold text-[#ff6b6b] tracking-tighter">5-9</div>
            <div className="text-2xl font-semibold text-white mt-[-5px]">days</div>
          </div>
          <div className="w-full text-center mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex justify-center gap-2 mb-2">
              {[1,2,3,4].map(i => <div key={i} className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center"><Check className="w-3.5 h-3.5 text-[#1a202c] stroke-[3]" /></div>)}
            </div>
            <p className="text-[#94a3b8] text-xs font-medium">4 of 4 AI models agree</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Why */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-8">WHY?</h3>
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex items-center gap-4">
              <Activity className="w-6 h-6 text-red-500" />
              <div className="flex-1 text-white font-medium">Shaking more</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-full" /></div>
            </div>
            <div className="flex items-center gap-4">
              <Flame className="w-6 h-6 text-[#f97316]" />
              <div className="flex-1 text-white font-medium">Getting hotter</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#f97316] w-[75%]" /></div>
            </div>
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-[#eab308]" />
              <div className="flex-1 text-white font-medium">Using more power</div>
              <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#eab308] w-[45%]" /></div>
            </div>
          </div>
        </div>

        {/* If We Wait */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-8">IF WE WAIT</h3>
          <div className="flex justify-between items-end flex-1 pb-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 h-8 border-b-4 border-black rounded-full top-2" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-[#22c55e] font-bold text-xl">22%</div>
                <div className="text-white text-sm">Now</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f97316] flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 border-b-4 border-black top-8" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-[#f97316] font-bold text-xl">58%</div>
                <div className="text-white text-sm">5 days</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 h-8 border-t-4 border-black rounded-full top-7" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 left-3" />
                <div className="absolute w-2 h-2 bg-black rounded-full top-4 right-3" />
              </div>
              <div className="text-center">
                <div className="text-red-500 font-bold text-xl">91%</div>
                <div className="text-white text-sm">10 days</div>
              </div>
            </div>
          </div>
          <div className="text-center text-[#94a3b8] text-sm">chance of breakdown</div>
        </div>

        {/* The Fix */}
        <div className="col-span-4 bg-[#1a202c] rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider mb-2">THE FIX</h3>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center mt-1">
              <Wrench className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">Replace bearing</h2>
              <p className="text-[#94a3b8]">Pump 3 · within 5 days</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button className="bg-[#2dd4bf] text-[#0f172a] font-bold py-3 rounded-lg hover:bg-[#14b8a6] transition-colors">Approve</button>
            <button className="bg-transparent border border-slate-700 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors">Reject</button>
          </div>
        </div>

      </div>

      {/* AI Agents Pipeline */}
      <div className="flex items-center gap-3 mt-4">
        <h3 className="text-[#94a3b8] text-xs font-bold tracking-wider w-24">AI AGENTS</h3>
        
        <div className="flex-1 flex items-center gap-2">
          <AgentBadge icon={Activity} label="Watch" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={Search} label="Diagnose" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={TrendingUp} label="Predict" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={CalIcon} label="Plan" active />
          <div className="h-[2px] flex-1 bg-[#22c55e]" />
          <AgentBadge icon={HelpCircle} label="Explain" active />
          <div className="h-[2px] flex-1 bg-slate-700" />
          <div className="px-4 py-2 rounded-full border border-slate-700 bg-[#1a202c] text-white text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
            You approve
          </div>
        </div>
      </div>

    </div>
  );
}

function AgentBadge({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${active ? 'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]' : 'border-slate-700 bg-[#1a202c] text-slate-400'}`}>
      <Icon className="w-4 h-4" /> {label}
    </div>
  );
}
