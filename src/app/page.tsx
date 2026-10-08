"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Cpu, ShieldAlert, Settings } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-16">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-primary font-mono tracking-widest text-sm uppercase">BuildGuard AI</h2>
          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
            Predict equipment failure before the building feels it.
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl leading-relaxed mt-4">
            AI-powered predictive maintenance that learns equipment behavior, detects early degradation, and helps maintenance teams act before costly breakdowns.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/overview" className="group flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-all">
              Open Command Center
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="flex items-center gap-2 bg-panel border border-panel-border px-6 py-3 rounded-md font-medium hover:bg-panel-border transition-all">
              Explore How It Works
            </Link>
          </div>
        </motion.div>

        {/* Right Content - Visual Representation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[600px] w-full hidden lg:flex items-center justify-center"
        >
          {/* Abstract Building/Data Viz */}
          <div className="glass-panel w-full max-w-md h-[500px] relative overflow-hidden flex flex-col p-6 tech-grid">
            <div className="flex items-center justify-between border-b border-panel-border pb-4 mb-6">
              <span className="font-mono text-sm text-foreground/60">SYS_CORE // V0.1</span>
              <span className="flex items-center gap-2 text-xs text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                LIVE
              </span>
            </div>

            {/* Simulated Data Nodes */}
            <div className="flex-1 relative">
              <Node icon={<Settings className="w-5 h-5 text-foreground/80" />} label="HVAC-04" top="10%" left="10%" delay={0} />
              <Node icon={<Activity className="w-5 h-5 text-foreground/80" />} label="PUMP-02" top="40%" left="80%" delay={0.2} />
              <Node icon={<ShieldAlert className="w-5 h-5 text-warning" />} label="GEN-01" top="80%" left="20%" delay={0.4} />

              {/* Central AI Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center bg-primary/5 backdrop-blur-md">
                    <Cpu className="w-8 h-8 text-primary" />
                  </div>
                  {/* Orbiting rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-primary/20 border-dashed animate-[spin_10s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-primary/10 border-t-primary/40 animate-[spin_15s_linear_infinite_reverse]" />
                </div>
              </div>
            </div>
            
            <div className="mt-auto border-t border-panel-border pt-4">
              <div className="flex justify-between items-center text-xs font-mono text-foreground/50">
                <span>INGESTING_SENSORS</span>
                <span>84.2K/s</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function Node({ icon, label, top, left, delay }: { icon: React.ReactNode, label: string, top: string, left: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + delay, type: "spring" }}
      className="absolute flex flex-col items-center gap-2"
      style={{ top, left }}
    >
      <div className="w-12 h-12 rounded-lg bg-panel border border-panel-border flex items-center justify-center z-10 shadow-lg">
        {icon}
      </div>
      <span className="font-mono text-xs text-foreground/60 bg-background/80 px-2 py-1 rounded">{label}</span>
      
      {/* Signal lines to center - abstract visualization */}
      <motion.div 
        className="absolute top-6 left-6 w-32 h-[1px] bg-gradient-to-r from-primary/50 to-transparent origin-left -z-10"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1 + delay, duration: 1 }}
        style={{
          transform: `rotate(${Math.atan2(50 - parseInt(top), 50 - parseInt(left)) * 180 / Math.PI}deg)`
        }}
      />
    </motion.div>
  )
}
