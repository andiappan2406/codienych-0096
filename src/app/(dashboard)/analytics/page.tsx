"use client";

import { BrainCircuit, Info, Target, GitCommit, LineChart as LineChartIcon } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const modelMetrics = [
  { subject: 'Precision', A: 92, fullMark: 100 },
  { subject: 'Recall', A: 89, fullMark: 100 },
  { subject: 'F1-Score', A: 90, fullMark: 100 },
  { subject: 'ROC-AUC', A: 95, fullMark: 100 },
  { subject: 'Calibration', A: 85, fullMark: 100 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Analytics</h1>
          <p className="text-foreground/60 mt-2">Model performance and evaluation metrics.</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded flex items-center gap-2">
          <Info className="w-4 h-4" />
          Demo / Simulated Data
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core AI Performance */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Failure Prediction Model v0.4</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <MetricBox label="Precision" value="92.4%" trend="+1.2%" positive />
            <MetricBox label="Recall" value="89.1%" trend="+0.5%" positive />
            <MetricBox label="False Alarm Rate" value="3.2%" trend="-0.8%" positive />
            <MetricBox label="RUL Error" value="±8.4h" trend="-2.1h" positive />
          </div>

          <div className="flex-1 min-h-[300px] border border-panel-border rounded-lg bg-background/50 flex flex-col p-4">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-4 text-center">Model Capabilities Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={modelMetrics}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Model v0.4" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Meta */}
        <div className="flex flex-col gap-6">
          
          <div className="glass-panel p-6">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6 flex items-center gap-2">
              <Target className="w-4 h-4" /> Multi-Model Architecture
            </h3>
            <div className="flex flex-col gap-4">
              <ModelRow name="Anomaly Engine" type="Autoencoder" status="Active" />
              <ModelRow name="Failure Predictor" type="XGBoost" status="Active" />
              <ModelRow name="Temporal Pattern" type="LSTM" status="Evaluating" />
              <ModelRow name="Neuro-Symbolic" type="Rules + ML" status="Training" />
            </div>
          </div>

          <div className="glass-panel p-6 flex-1">
            <h3 className="text-sm font-mono text-foreground/60 uppercase mb-6 flex items-center gap-2">
              <GitCommit className="w-4 h-4" /> Feedback Loop
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
              Every maintenance event improves future prediction. Ground-truth feedback from technicians is automatically fed back into the training pipeline to adjust feature weights and dynamic baselines.
            </p>
            <div className="bg-panel-border h-px w-full my-6" />
            <div className="text-xs text-foreground/60 flex justify-between items-center">
              <span>Last Model Retrain:</span>
              <span className="font-mono text-foreground">2026-10-01 04:00 UTC</span>
            </div>
            <div className="text-xs text-foreground/60 flex justify-between items-center mt-3">
              <span>Validation Samples:</span>
              <span className="font-mono text-foreground">1,402 maintenance logs</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricBox({ label, value, trend, positive }: { label: string, value: string, trend: string, positive: boolean }) {
  return (
    <div className="border border-panel-border bg-panel p-4 rounded-lg">
      <div className="text-xs text-foreground/50 mb-2">{label}</div>
      <div className="text-2xl font-mono mb-1">{value}</div>
      <div className={`text-xs ${positive ? 'text-healthy' : 'text-critical'}`}>
        {trend} vs last model
      </div>
    </div>
  )
}

function ModelRow({ name, type, status }: { name: string, type: string, status: string }) {
  const statusColors = {
    'Active': 'text-healthy border-healthy',
    'Evaluating': 'text-warning border-warning',
    'Training': 'text-primary border-primary',
  };

  return (
    <div className="flex items-center justify-between border-b border-panel-border pb-3 last:border-0 last:pb-0">
      <div>
        <div className="font-medium text-sm mb-1">{name}</div>
        <div className="text-xs text-foreground/50">{type}</div>
      </div>
      <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColors[status as keyof typeof statusColors]}`}>
        {status}
      </div>
    </div>
  )
}
