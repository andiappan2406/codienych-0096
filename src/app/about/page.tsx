"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Activity, ShieldAlert, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Header section */}
      <div className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            How <span className="text-primary">BuildGuard AI</span> Works
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-3xl leading-relaxed">
            We fuse deep learning anomaly detection with fuzzy logic and neuro-symbolic reasoning. 
            The result? A system that doesn't just tell you something is broken, but predicts it before it happens and explains exactly why.
          </p>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10"
        >
          {/* Using the generated image */}
          <div className="relative h-[400px] md:h-[600px] w-full bg-black">
            <Image 
              src="/how-it-works.jpg" 
              alt="BuildGuard AI Architecture" 
              fill
              className="object-cover opacity-90"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <div className="glass-panel p-6 max-w-2xl backdrop-blur-md bg-black/40 border border-white/10">
                <h3 className="text-2xl font-semibold mb-2">The AI Cognitive Core</h3>
                <p className="text-foreground/80">
                  Data streams from HVACs, chillers, and pumps are continuously ingested into our multi-model AI pipeline, identifying imperceptible degradation patterns in real-time.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Architecture Steps */}
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-semibold mb-12 text-center">The 4-Stage Intelligence Pipeline</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Step 1 */}
          <div className="glass-panel p-8 group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Dynamic Baselines</h3>
            <p className="text-foreground/70 leading-relaxed">
              We don't use static thresholds. We establish contextual baselines based on building type, weather, and occupancy. A motor running hot on a 100°F day is normal; running hot on a 50°F day is a massive anomaly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. Anomaly Detection</h3>
            <p className="text-foreground/70 leading-relaxed">
              Using Isolation Forests, the system detects multi-dimensional deviations. We analyze how vibration, temperature, current, and pressure drift <em>together</em>, finding faults weeks before a human operator would notice.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Failure & RUL Prediction</h3>
            <p className="text-foreground/70 leading-relaxed">
              Gradient Boosting Classifiers calculate the exact probability of failure, while Regressors estimate the Remaining Useful Life (RUL) in days, allowing you to schedule maintenance before the breakdown occurs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-8 group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">4. Fuzzy Logic & Reasoning</h3>
            <p className="text-foreground/70 leading-relaxed">
              Raw ML scores are hard for humans to trust. We pass predictions through a Fuzzy Logic engine that maps complex mathematical scores into simple, explainable states like "Critical Motor Degradation."
            </p>
          </div>

        </div>
        
        <div className="mt-16 text-center">
          <Link href="/setup" className="inline-flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-md font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
            Initialize Command Center
          </Link>
        </div>
      </div>

    </div>
  );
}
