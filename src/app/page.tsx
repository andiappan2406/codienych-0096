"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Cpu, ShieldAlert, Settings, PlusSquare, Sparkles, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-between pb-12">
      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <PlusSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base leading-tight text-white tracking-wide">BuildGuard</span>
            <span className="text-[9px] text-primary tracking-[0.2em] font-medium leading-tight">PREDICTIVE AI</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/overview"
            className="text-xs sm:text-sm px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] lg:w-[800px] h-[350px] sm:h-[600px] lg:h-[800px] bg-primary/10 rounded-full blur-[90px] sm:blur-[140px] -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center my-auto py-8">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-5 sm:gap-6 text-center lg:text-left items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            BuildGuard AI 1.0
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white">
            Predict equipment failure before the building feels it.
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-xl leading-relaxed">
            Multi-agent neuro-symbolic predictive maintenance that continuously models equipment telemetry, detects early degradation, and plans automated work orders.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-4">
            <Link
              href="/overview"
              className="group flex items-center justify-center gap-2 bg-primary text-black px-6 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Open Command Center
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center gap-2 bg-panel border border-panel-border px-6 py-3.5 rounded-xl font-medium text-white hover:bg-white/5 transition-all"
            >
              <Layers className="w-4 h-4 text-primary" />
              Explore Architecture
            </Link>
          </div>

          {/* Quick Metrics Badge for Mobile & Desktop */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-4 border-t border-panel-border/50 mt-2">
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">4</div>
              <div className="text-[11px] text-foreground/50">AI Agents</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-[#4ade80] font-mono">&lt; 2ms</div>
              <div className="text-[11px] text-foreground/50">Inference</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-bold text-primary font-mono">100%</div>
              <div className="text-[11px] text-foreground/50">Serverless</div>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Visual Representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full flex items-center justify-center"
        >
          {/* Abstract Building/Data Viz */}
          <div className="glass-panel w-full max-w-md h-full relative overflow-hidden flex flex-col p-6 tech-grid rounded-2xl border border-primary/20 shadow-2xl">
            <div className="flex items-center justify-between border-b border-panel-border pb-4 mb-4">
              <span className="font-mono text-xs text-foreground/60">SYS_CORE // V1.0</span>
              <span className="flex items-center gap-2 text-xs text-primary font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                LIVE SENSORS
              </span>
            </div>

            {/* Simulated Data Nodes */}
            <div className="flex-1 relative min-h-[220px]">
              <Node icon={<Settings className="w-4 h-4 text-foreground/80" />} label="HVAC-01" top="10%" left="10%" delay={0} />
              <Node icon={<Activity className="w-4 h-4 text-foreground/80" />} label="PUMP-01" top="35%" left="75%" delay={0.2} />
              <Node icon={<ShieldAlert className="w-4 h-4 text-warning" />} label="GEN-01" top="75%" left="18%" delay={0.4} />

              {/* Central AI Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-primary/40 flex items-center justify-center bg-primary/10 backdrop-blur-md shadow-lg shadow-primary/20">
                    <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  {/* Orbiting rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-primary/30 border-dashed animate-[spin_10s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-primary/15 border-t-primary/50 animate-[spin_15s_linear_infinite_reverse]" />
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-panel-border pt-4">
              <div className="flex justify-between items-center text-xs font-mono text-foreground/50">
                <span>INGESTING_TELEMETRY</span>
                <span className="text-primary font-bold">120 SPS</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Node({
  icon,
  label,
  top,
  left,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  top: string;
  left: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + delay, type: "spring" }}
      className="absolute flex flex-col items-center gap-1.5"
      style={{ top, left }}
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-panel border border-panel-border flex items-center justify-center z-10 shadow-lg">
        {icon}
      </div>
      <span className="font-mono text-[10px] sm:text-xs text-foreground/70 bg-background/90 px-1.5 py-0.5 rounded border border-white/5">
        {label}
      </span>
    </motion.div>
  );
}
