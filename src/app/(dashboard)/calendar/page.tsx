"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, 
  Clock, CheckCircle2, AlertTriangle, Wrench, User, MapPin, 
  X, Check, Filter, Search, ArrowRight, ShieldCheck
} from "lucide-react";

interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  date: string; // YYYY-MM-DD
  dayNumber: number;
  time: string;
  priority: "critical" | "warning" | "routine";
  technician: string;
  location: string;
  estimatedHours: number;
  status: "scheduled" | "in-progress" | "completed";
}

const INITIAL_TASKS: MaintenanceTask[] = [
  {
    id: "WO-4819",
    assetId: "PUMP-03",
    assetName: "Water Pump 3",
    title: "Emergency Bearing Replacement & Dynamic Balance",
    date: "2026-10-10",
    dayNumber: 10,
    time: "09:00 AM - 12:30 PM",
    priority: "critical",
    technician: "Sarah Chen (Vibration Specialist)",
    location: "Pump Room · B2",
    estimatedHours: 3.5,
    status: "scheduled",
  },
  {
    id: "WO-4812",
    assetId: "PUMP-03",
    assetName: "Water Pump 3",
    title: "Vibration Diagnostic & Acoustic Stethoscope Check",
    date: "2026-10-09",
    dayNumber: 9,
    time: "02:00 PM - 03:00 PM",
    priority: "warning",
    technician: "Alex Vance (Plant Tech)",
    location: "Pump Room · B2",
    estimatedHours: 1.0,
    status: "in-progress",
  },
  {
    id: "WO-4795",
    assetId: "CHIL-01",
    assetName: "Central Chiller 1",
    title: "Condenser Tube Descaling & Chemical Flush",
    date: "2026-10-14",
    dayNumber: 14,
    time: "08:00 AM - 12:00 PM",
    priority: "warning",
    technician: "Mike Rossi (HVAC Lead)",
    location: "Rooftop Plant",
    estimatedHours: 4.0,
    status: "scheduled",
  },
  {
    id: "WO-4780",
    assetId: "ELEV-02",
    assetName: "Passenger Lift 2",
    title: "Guide Shoe & Brake Shoe Tension Calibration",
    date: "2026-10-18",
    dayNumber: 18,
    time: "01:00 PM - 03:00 PM",
    priority: "routine",
    technician: "David Miller (Lift Engineer)",
    location: "Core Tower B",
    estimatedHours: 2.0,
    status: "scheduled",
  },
  {
    id: "WO-4774",
    assetId: "GEN-01",
    assetName: "Diesel Generator 1",
    title: "Bi-Weekly Auto-Transfer Switch 30-Min Load Test",
    date: "2026-10-22",
    dayNumber: 22,
    time: "06:00 AM - 07:00 AM",
    priority: "routine",
    technician: "Alex Vance (Plant Tech)",
    location: "Utility Annex",
    estimatedHours: 1.0,
    status: "scheduled",
  },
  {
    id: "WO-4760",
    assetId: "PUMP-01",
    assetName: "Primary Feed Pump 1",
    title: "Scheduled Seal Ring Lubrication & Alignment",
    date: "2026-10-27",
    dayNumber: 27,
    time: "10:00 AM - 11:30 AM",
    priority: "routine",
    technician: "Sarah Chen (Vibration Specialist)",
    location: "Pump Room · B2",
    estimatedHours: 1.5,
    status: "scheduled",
  }
];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_TASKS);
  const [selectedDay, setSelectedDay] = useState<number>(9); // Default to current date Oct 9
  const [filterPriority, setFilterPriority] = useState<"all" | "critical" | "warning" | "routine">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Work Order Form State
  const [newAssetId, setNewAssetId] = useState("PUMP-03");
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState(12);
  const [newPriority, setNewPriority] = useState<"critical" | "warning" | "routine">("warning");
  const [newTechnician, setNewTechnician] = useState("Sarah Chen (Vibration Specialist)");
  const [newHours, setNewHours] = useState(2);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newTask: MaintenanceTask = {
      id: `WO-${Math.floor(4800 + Math.random() * 200)}`,
      assetId: newAssetId,
      assetName: newAssetId === "PUMP-03" ? "Water Pump 3" : newAssetId === "CHIL-01" ? "Central Chiller 1" : "Passenger Lift 2",
      title: newTitle,
      date: `2026-10-${String(newDay).padStart(2, '0')}`,
      dayNumber: newDay,
      time: "09:00 AM - 11:00 AM",
      priority: newPriority,
      technician: newTechnician,
      location: newAssetId === "PUMP-03" ? "Pump Room · B2" : "Rooftop Plant",
      estimatedHours: newHours,
      status: "scheduled",
    };

    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
    setNewTitle("");
    showToast(`Work Order ${newTask.id} created successfully`);
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "completed" ? "scheduled" : "completed";
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    showToast("Task status updated");
  };

  // Calendar generation for October 2026 (31 days)
  // Oct 1 2026 is Thursday (so 4 empty cells if starting from Sunday)
  const daysInMonth = 31;
  const startOffset = 4; // Thursday offset

  const filteredTasks = tasks.filter(t => filterPriority === "all" || t.priority === filterPriority);
  const selectedDayTasks = filteredTasks.filter(t => t.dayNumber === selectedDay);

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00e5ff] text-black font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-panel-border/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-primary tracking-widest uppercase mb-1">
            <CalIcon className="w-4 h-4" /> AI Operations Schedule
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Maintenance Calendar</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Automated predictive dispatch scheduling for building engineering and technician teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)]"
          >
            <Plus className="w-4 h-4" /> Schedule Work Order
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-foreground/50 uppercase">Active Work Orders</span>
          <div className="text-2xl font-bold text-white mt-1">{tasks.length}</div>
          <span className="text-[11px] text-primary mt-1">October 2026 Window</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-foreground/50 uppercase">Critical Urgent</span>
          <div className="text-2xl font-bold text-[#ff4081] mt-1">
            {tasks.filter(t => t.priority === "critical").length}
          </div>
          <span className="text-[11px] text-[#ff4081] mt-1">Needs execution &lt; 48h</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-foreground/50 uppercase">Planned Total Hours</span>
          <div className="text-2xl font-bold text-white mt-1">
            {tasks.reduce((acc, t) => acc + t.estimatedHours, 0)} hrs
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Off-peak scheduled</span>
        </div>
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-mono text-foreground/50 uppercase">Predictive vs Routine</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">83.3%</div>
          <span className="text-[11px] text-foreground/50 mt-1">AI-driven prevention</span>
        </div>
      </div>

      {/* Calendar & Task List Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl flex flex-col gap-6">
          
          {/* Calendar Header Controls */}
          <div className="flex justify-between items-center pb-4 border-b border-panel-border/30">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">October 2026</h2>
              <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                Today: Oct 9
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-white border border-panel-border transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-white border border-panel-border transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-foreground/40 font-semibold uppercase">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="h-24 rounded-xl border border-transparent bg-white/[0.01] opacity-30" />
            ))}

            {/* October days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              const isToday = day === 9;
              const dayTasks = tasks.filter(t => t.dayNumber === day);
              const hasCritical = dayTasks.some(t => t.priority === "critical");
              const hasWarning = dayTasks.some(t => t.priority === "warning");

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-24 p-2 rounded-xl text-left border transition-all flex flex-col justify-between relative group ${
                    isSelected 
                      ? "bg-[#182436] border-primary shadow-[0_0_15px_rgba(0,229,255,0.25)]" 
                      : isToday 
                      ? "border-primary/50 bg-primary/5 hover:bg-white/5" 
                      : "bg-[#10141d]/60 border-panel-border/40 hover:bg-white/5 hover:border-panel-border"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-xs font-mono font-bold ${
                      isToday ? "text-primary" : isSelected ? "text-white" : "text-foreground/70"
                    }`}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className={`w-2 h-2 rounded-full ${
                        hasCritical ? "bg-[#ff4081] animate-ping" : hasWarning ? "bg-orange-400" : "bg-[#00e676]"
                      }`} />
                    )}
                  </div>

                  {/* Task pill preview inside cell */}
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    {dayTasks.slice(0, 2).map(t => (
                      <div 
                        key={t.id}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded truncate ${
                          t.priority === "critical" 
                            ? "bg-[#ff4081]/20 text-[#ff4081]" 
                            : t.priority === "warning" 
                            ? "bg-orange-500/20 text-orange-400" 
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {t.assetId}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-foreground/40 font-mono">+{dayTasks.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Selected Day Tasks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-panel-border/30 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-primary uppercase">SELECTED DATE</span>
                  <h3 className="text-xl font-bold text-white">October {selectedDay}, 2026</h3>
                </div>
                <span className="text-xs font-mono bg-white/5 border border-panel-border px-2.5 py-1 rounded-lg text-foreground/60">
                  {selectedDayTasks.length} Work Orders
                </span>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400/60 mb-2" />
                  <p className="text-sm font-semibold text-white">No maintenance scheduled</p>
                  <p className="text-xs text-foreground/50 mt-1">This date has no pending work orders.</p>
                  <button
                    onClick={() => {
                      setNewDay(selectedDay);
                      setIsModalOpen(true);
                    }}
                    className="mt-4 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-colors"
                  >
                    + Add Task for Oct {selectedDay}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDayTasks.map(task => {
                    const isCompleted = task.status === "completed";
                    return (
                      <div 
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                          task.priority === "critical"
                            ? "bg-[#1a1219]/80 border-[#ff4081]/40"
                            : task.priority === "warning"
                            ? "bg-[#1a1712]/80 border-orange-500/30"
                            : "bg-[#10141d]/80 border-panel-border/40"
                        } ${isCompleted ? "opacity-60" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                            task.priority === "critical"
                              ? "bg-[#ff4081]/20 text-[#ff4081] border-[#ff4081]/40"
                              : task.priority === "warning"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          }`}>
                            {task.priority}
                          </span>
                          <span className="font-mono text-xs text-foreground/50">{task.id}</span>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white leading-snug">{task.title}</div>
                          <div className="text-xs text-primary font-mono mt-0.5">{task.assetId} · {task.assetName}</div>
                        </div>

                        <div className="text-xs text-foreground/60 flex flex-col gap-1 pt-2 border-t border-panel-border/30">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-foreground/40" /> {task.time} ({task.estimatedHours}h)
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-foreground/40" /> {task.technician}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-foreground/40" /> {task.location}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                              isCompleted 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-white/5 hover:bg-white/10 text-white border border-panel-border"
                            }`}
                          >
                            <Check className="w-3 h-3" /> {isCompleted ? "Completed" : "Mark Done"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-panel-border/30 text-xs text-foreground/60 flex justify-between items-center mt-6">
              <span>Quick Links:</span>
              <Link href="/health" className="text-primary hover:underline flex items-center gap-1">
                View Doctor Diagnostics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Create Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-panel-border rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-panel-border/40 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" /> Schedule Maintenance Task
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-foreground/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-foreground/70 font-semibold block mb-1">Target Asset</label>
                <select 
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="PUMP-03">PUMP-03 (Industrial Water Pump 3)</option>
                  <option value="PUMP-01">PUMP-01 (Primary Feed Pump 1)</option>
                  <option value="CHIL-01">CHIL-01 (Central Chiller Unit 1)</option>
                  <option value="ELEV-02">ELEV-02 (Passenger Lift 2)</option>
                  <option value="GEN-01">GEN-01 (Diesel Generator 1)</option>
                </select>
              </div>

              <div>
                <label className="text-foreground/70 font-semibold block mb-1">Task Title / Action</label>
                <input 
                  type="text" 
                  placeholder="e.g. Replace drive-end bearing and balance rotor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-foreground/70 font-semibold block mb-1">October Date</label>
                  <input 
                    type="number" min="1" max="31"
                    value={newDay}
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-foreground/70 font-semibold block mb-1">Priority</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="critical">Critical (&lt;48h)</option>
                    <option value="warning">Warning (Medium)</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-foreground/70 font-semibold block mb-1">Assigned Technician</label>
                <select 
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="Sarah Chen (Vibration Specialist)">Sarah Chen (Vibration Specialist)</option>
                  <option value="Mike Rossi (HVAC Lead)">Mike Rossi (HVAC Lead)</option>
                  <option value="David Miller (Lift Engineer)">David Miller (Lift Engineer)</option>
                  <option value="Alex Vance (Plant Tech)">Alex Vance (Plant Tech)</option>
                </select>
              </div>

              <div>
                <label className="text-foreground/70 font-semibold block mb-1">Estimated Hours</label>
                <input 
                  type="number" min="1" max="12" step="0.5"
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full bg-[#0e121a] border border-panel-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-panel-border/40 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl transition-colors"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
