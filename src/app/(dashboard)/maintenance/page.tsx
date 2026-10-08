"use client";

import { CheckCircle, Clock, AlertTriangle, AlertCircle, PlayCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface WorkOrderItem {
  id: string;
  name: string;
  priority: string;
  due: string;
  task: string;
  root_cause: string;
  health_score: number;
  failure_prob: number;
  rul_days: number;
}

export default function MaintenancePlanner() {
  const [simScenario, setSimScenario] = useState<"now" | "delay3" | "delay7">("now");
  const [priorityQueue, setPriorityQueue] = useState<WorkOrderItem[]>([]);
  const [targetAsset, setTargetAsset] = useState<any>(null);
  const [simulationData] = useState<any>({
    now: [
      { day: "Day 0", risk: 88 },
      { day: "Day 1", risk: 14 },
      { day: "Day 2", risk: 15 },
      { day: "Day 3", risk: 16 },
      { day: "Day 7", risk: 18 },
    ],
    delay3: [
      { day: "Day 0", risk: 88 },
      { day: "Day 1", risk: 92 },
      { day: "Day 2", risk: 96 },
      { day: "Day 3", risk: 21 },
      { day: "Day 7", risk: 24 },
    ],
    delay7: [
      { day: "Day 0", risk: 88 },
      { day: "Day 1", risk: 92 },
      { day: "Day 2", risk: 96 },
      { day: "Day 3", risk: 98 },
      { day: "Day 7", risk: 99 },
    ],
  });
  const [approvedOrders, setApprovedOrders] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/maintenance")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.workOrders) && data.workOrders.length > 0) {
          setPriorityQueue(
            data.workOrders.map((wo: any) => ({
              id: wo.asset_id,
              name: wo.title,
              priority: wo.priority,
              due: wo.due_label || "Scheduled",
              task: wo.title,
              root_cause: "AI Predicted Risk",
              health_score: wo.priority === "Critical" ? 28 : wo.priority === "High" ? 55 : 88,
              failure_prob: wo.priority === "Critical" ? 88.5 : wo.priority === "High" ? 62.0 : 12.0,
              rul_days: wo.priority === "Critical" ? 3.2 : wo.priority === "High" ? 8.5 : 54.0,
            }))
          );
        } else {
          setPriorityQueue([
            {
              id: "HVAC-01",
              name: "HVAC System",
              priority: "Critical",
              due: "Immediate (48h)",
              task: "Inspect primary compressor bearing and flush refrigerant coolant loops.",
              root_cause: "High bearing vibration combined with elevated compressor heat",
              health_score: 28,
              failure_prob: 88.5,
              rul_days: 3.2,
            },
            {
              id: "PUMP-01",
              name: "Industrial Water Pump",
              priority: "High",
              due: "Within 8 days",
              task: "Check suction pressure and inspect pump seal integrity.",
              root_cause: "Impeller cavitation causing mild vibration elevation",
              health_score: 55,
              failure_prob: 62.0,
              rul_days: 8.5,
            },
            {
              id: "ELEVATOR-01",
              name: "Passenger Elevator",
              priority: "Medium",
              due: "Within 14 days",
              task: "Quarterly cable tension calibration and safety switch verification.",
              root_cause: "Operating within normal parameters",
              health_score: 94,
              failure_prob: 4.5,
              rul_days: 85.0,
            },
            {
              id: "GENERATOR-01",
              name: "Backup Generator",
              priority: "Low",
              due: "Within 60 days",
              task: "Routine fuel filter inspection and float voltage test.",
              root_cause: "Operating within normal parameters",
              health_score: 90,
              failure_prob: 8.0,
              rul_days: 62.0,
            },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Maintenance API error, using fallback:", err);
        setPriorityQueue([
          {
            id: "HVAC-01",
            name: "HVAC System",
            priority: "Critical",
            due: "Immediate (48h)",
            task: "Inspect primary compressor bearing and flush refrigerant coolant loops.",
            root_cause: "High bearing vibration combined with elevated compressor heat",
            health_score: 28,
            failure_prob: 88.5,
            rul_days: 3.2,
          },
          {
            id: "PUMP-01",
            name: "Industrial Water Pump",
            priority: "High",
            due: "Within 8 days",
            task: "Check suction pressure and inspect pump seal integrity.",
            root_cause: "Impeller cavitation causing mild vibration elevation",
            health_score: 55,
            failure_prob: 62.0,
            rul_days: 8.5,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const handleApprove = (id: string) => {
    setApprovedOrders((prev) => ({ ...prev, [id]: true }));
  };

  const currentRisk = simScenario === "now" ? "Controlled (<18%)" : simScenario === "delay3" ? "96%" : "99.2%";
  const targetName = targetAsset?.id || (priorityQueue.length > 0 ? priorityQueue[0].id : "HVAC-01");

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Predictive Maintenance Planner
          </h1>
          <p className="text-foreground/60 text-xs sm:text-sm mt-1">
            Neuro-Symbolic Agent 4 auto-generates prioritised work orders and downtime risk projections.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5" />
          Agent 4 (Plan &amp; Explain) Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Priority Queue Column */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> AI Priority Queue
            </h2>
            <span className="text-xs font-mono text-foreground/50">
              {priorityQueue.filter((p) => p.priority === "Critical" || p.priority === "High").length} Urgent Actions
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-foreground/50 animate-pulse text-xs sm:text-sm">
              Computing maintenance priorities...
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {priorityQueue.map((item) => (
                <WorkOrderRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  priority={item.priority}
                  due={item.due}
                  task={item.task}
                  healthScore={item.health_score}
                  failureProb={item.failure_prob}
                  approved={!!approvedOrders[item.id]}
                  onApprove={() => handleApprove(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Delay vs Action Risk Forecast */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-primary flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> Delay vs Action Risk Forecast
          </h2>

          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono text-foreground/60 uppercase tracking-wider">
                Target Critical Asset: {targetName}
              </h3>
              <span className="text-xs text-critical font-mono font-bold">RUL: ~3.2 Days</span>
            </div>

            <div className="flex gap-1.5 sm:gap-2 mb-6 bg-background/80 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setSimScenario("now")}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  simScenario === "now"
                    ? "bg-primary text-black font-bold shadow-sm"
                    : "text-foreground/60 hover:text-white"
                }`}
              >
                Maintain (0d)
              </button>
              <button
                onClick={() => setSimScenario("delay3")}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  simScenario === "delay3"
                    ? "bg-warning/20 text-warning border border-warning/30 font-bold"
                    : "text-foreground/60 hover:text-white"
                }`}
              >
                Delay 3d
              </button>
              <button
                onClick={() => setSimScenario("delay7")}
                className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  simScenario === "delay7"
                    ? "bg-critical/20 text-critical border border-critical/30 font-bold"
                    : "text-foreground/60 hover:text-white"
                }`}
              >
                Delay 7d
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-[10px] text-foreground/50 mb-1 uppercase font-mono">Predicted Failure Risk</div>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-bold ${
                    simScenario === "now" ? "text-[#4ade80]" : simScenario === "delay3" ? "text-warning" : "text-critical"
                  }`}
                >
                  {currentRisk}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-foreground/50 mb-1 uppercase font-mono">Projected Downtime</div>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-bold ${
                    simScenario === "now" ? "text-white" : "text-critical"
                  }`}
                >
                  {simScenario === "now" ? "1.5" : simScenario === "delay3" ? "12.4" : "36.0"}{" "}
                  <span className="text-xs text-foreground/50">hrs</span>
                </div>
              </div>
            </div>

            <div className="h-[180px] sm:h-[200px] w-full mb-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData[simScenario]} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <ReferenceLine
                    y={80}
                    stroke="#FF1744"
                    strokeDasharray="3 3"
                    opacity={0.5}
                    label={{ value: "Critical Threshold", fill: "#FF1744", fontSize: 10 }}
                  />
                  <Tooltip contentStyle={{ backgroundColor: "#12141A", borderColor: "#1E2128", borderRadius: "8px", fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke={simScenario === "now" ? "#00E5FF" : simScenario === "delay3" ? "#FFB300" : "#FF1744"}
                    fillOpacity={0.25}
                    fill={simScenario === "now" ? "#00E5FF" : simScenario === "delay3" ? "#FFB300" : "#FF1744"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-primary">Recommended Action Window</h4>
                <p className="text-[11px] sm:text-xs text-primary/80">
                  Schedule service within 48h to prevent catastrophic bearing seizure.
                </p>
              </div>
              <button
                onClick={() => handleApprove(targetName)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors self-end sm:self-auto shrink-0 ${
                  approvedOrders[targetName]
                    ? "bg-[#4ade80] text-black"
                    : "bg-primary text-black hover:bg-primary/90"
                }`}
              >
                {approvedOrders[targetName] ? "Approved ✓" : "Create Work Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkOrderRow({
  id,
  name,
  priority,
  due,
  task,
  failureProb,
  approved,
  onApprove,
}: {
  id: string;
  name: string;
  priority: string;
  due: string;
  task: string;
  healthScore: number;
  failureProb: number;
  approved: boolean;
  onApprove: () => void;
}) {
  const pStyles = {
    Critical: "border-critical/30 bg-critical/5",
    High: "border-warning/30 bg-warning/5",
    Medium: "border-primary/30 bg-primary/5",
    Low: "border-white/5 bg-panel/60",
  };

  const pText = {
    Critical: "text-critical",
    High: "text-warning",
    Medium: "text-primary",
    Low: "text-foreground/60",
  };

  const Icon = priority === "Critical" ? AlertCircle : priority === "High" ? AlertTriangle : CheckCircle;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border ${
        pStyles[priority as keyof typeof pStyles] || pStyles.Low
      } transition-colors gap-3`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/80 border border-white/5 shrink-0 mt-0.5">
          <Icon className={`w-4 h-4 ${pText[priority as keyof typeof pText] || "text-primary"}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-semibold text-white text-xs sm:text-sm">{id}</h4>
            <span className="text-[11px] text-foreground/50">• {name}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-current font-bold ${
                pText[priority as keyof typeof pText] || "text-primary"
              }`}
            >
              {priority}
            </span>
            <span className="text-[10px] font-mono text-foreground/50">Risk: {failureProb}%</span>
          </div>
          <p className="text-[11px] sm:text-xs text-foreground/80 leading-relaxed">{task}</p>
        </div>
      </div>
      <div className="flex sm:flex-col justify-between items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-panel-border/30">
        <div className="text-right">
          <div className="text-[9px] text-foreground/40 uppercase font-mono">Due Window</div>
          <div
            className={`font-mono text-xs font-semibold ${
              priority === "Critical" ? "text-critical" : "text-foreground"
            }`}
          >
            {due}
          </div>
        </div>
        <button
          onClick={onApprove}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            approved
              ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 font-bold"
              : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
          }`}
        >
          {approved ? "Approved ✓" : "Approve"}
        </button>
      </div>
    </div>
  );
}
