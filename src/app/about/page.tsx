"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Activity, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header section */}
      <div className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[800px] h-[350px] sm:h-[800px] bg-primary/5 rounded-full blur-[80px] sm:blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 sm:mb-6">
            How <span className="text-primary">BuildGuard AI</span> Works
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 max-w-3xl leading-relaxed">
            We fuse deep learning anomaly detection with fuzzy logic and neuro-symbolic reasoning. The result? A system that doesn&apos;t just flag threshold breaches, but predicts equipment breakdown and explains the exact physical root cause.
          </p>
        </div>
      </div>

      {/* Architecture Graphic Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl"
        >
          <div className="relative h-[280px] sm:h-[420px] md:h-[500px] w-full bg-black">
            <Image
              src="/how-it-works.jpg"
              alt="BuildGuard AI Architecture"
              fill
              className="object-cover opacity-85"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
              <div className="glass-panel p-4 sm:p-6 max-w-2xl backdrop-blur-md bg-black/60 border border-white/10 rounded-xl">
                <h3 className="text-base sm:text-xl font-semibold text-white mb-1">
                  Autonomous Multi-Agent Cognitive Core
                </h3>
                <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed">
                  Real-time telemetry streams from HVACs, chillers, and pumps are processed concurrently through 4 specialized AI agents, identifying imperceptible micro-vibrations and thermal drift before physical failure occurs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Architecture Steps Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-8 sm:mb-12 text-center">
          The 4-Stage Autonomous Intelligence Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-white/5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">1. Watch Agent (Dynamic Baselines)</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Establishes contextual baselines based on facility context, ambient weather, and occupancy load rather than rigid static thresholds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-white/5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">2. Diagnose Agent (Degradation Classifier)</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Analyzes joint multi-dimensional sensor deviations (vibration, heat, current, and pressure) to calculate degradation probability and failure vectors.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-white/5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">3. Predict Agent (RUL Regressor)</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Estimates the Remaining Useful Life (RUL in days) and projected degradation trajectory so teams can service equipment within the optimal cost window.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-white/5 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 text-primary">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">4. Plan &amp; Explain Agent (Fuzzy &amp; Symbolic)</h3>
            <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
              Fuses probabilistic model outputs through Sugeno fuzzy logic and domain knowledge rules to generate human-explainable root causes and automated work orders.
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 bg-primary text-black px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
