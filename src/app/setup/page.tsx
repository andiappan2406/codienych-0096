"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Box, CheckCircle, ChevronRight, Database, ArrowLeft, RefreshCw, Check, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"onboard" | "database">("onboard");
  const [step, setStep] = useState(1);
  const [buildingType, setBuildingType] = useState("Hospital / Healthcare");
  const [equipmentType, setEquipmentType] = useState("HVAC System");
  const [brandModel, setBrandModel] = useState("Trane CenTraVac CVHE");

  // Database status states
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [initResult, setInitResult] = useState<string | null>(null);

  const checkDbStatus = async () => {
    setDbLoading(true);
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      setDbStatus(data.status);
    } catch (e: any) {
      setDbStatus({ connected: false, provider: "In-Memory Fallback", error: e.message });
    } finally {
      setDbLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setDbLoading(true);
    setInitResult(null);
    try {
      const res = await fetch("/api/db/init", { method: "POST" });
      const data = await res.json();
      setInitResult(data.message || "Database seeded successfully.");
      checkDbStatus();
    } catch (e: any) {
      setInitResult(`Initialization error: ${e.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const initFetch = async () => {
      try {
        const res = await fetch("/api/db/status");
        const data = await res.json();
        if (mounted) setDbStatus(data.status);
      } catch (e: any) {
        if (mounted) setDbStatus({ connected: false, provider: "In-Memory Fallback", error: e.message });
      }
    };
    initFetch();
    return () => { mounted = false; };
  }, []);

  const handleNext = () => {
    if (step === 1 && buildingType) setStep(2);
    else if (step === 2 && equipmentType) setStep(3);
    else if (step === 3 && brandModel) {
      router.push("/overview");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 sm:mb-6">
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-foreground/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <div className="flex gap-2 bg-panel border border-panel-border p-1 rounded-xl">
          <button
            onClick={() => setTab("onboard")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
              tab === "onboard" ? "bg-primary text-black font-bold shadow-sm" : "text-foreground/60 hover:text-white"
            }`}
          >
            Asset Onboarding
          </button>
          <button
            onClick={() => setTab("database")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              tab === "database" ? "bg-primary text-black font-bold shadow-sm" : "text-foreground/60 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Database
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-2xl border-t-2 border-t-primary relative overflow-hidden shadow-2xl">
        {tab === "database" ? (
          /* Database Management Tab */
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase mb-1">
                <Database className="w-4 h-4" /> PostgreSQL / Supabase Integration
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Database Status</h1>
              <p className="text-foreground/60 text-xs sm:text-sm mt-1">
                Universal persistent storage adapter with PostgreSQL / Supabase and serverless memory fallback.
              </p>
            </div>

            <div className="p-4 bg-background/60 rounded-xl border border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/60 font-mono uppercase">Provider</span>
                <span className="text-xs font-mono font-bold text-primary">
                  {dbStatus?.provider || "Detecting..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/60 font-mono uppercase">Status</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    dbStatus?.connected
                      ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30"
                      : "bg-primary/10 text-primary border-primary/30"
                  }`}
                >
                  {dbStatus?.connected ? "CONNECTED (PostgreSQL)" : "STANDALONE READY"}
                </span>
              </div>
              {dbStatus?.details && (
                <div className="text-[11px] font-mono text-foreground/50 bg-black/30 p-2.5 rounded-lg overflow-x-auto">
                  {JSON.stringify(dbStatus.details, null, 2)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={checkDbStatus}
                disabled={dbLoading}
                className="flex-1 py-2.5 rounded-xl border border-panel-border bg-panel text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white"
              >
                <RefreshCw className={`w-4 h-4 ${dbLoading ? "animate-spin" : ""}`} />
                <span>Test Connection</span>
              </button>
              <button
                onClick={initializeDatabase}
                disabled={dbLoading}
                className="flex-1 py-2.5 rounded-xl bg-primary text-black text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize &amp; Seed Database</span>
              </button>
            </div>

            {initResult && (
              <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-xs text-primary leading-relaxed">
                {initResult}
              </div>
            )}
          </div>
        ) : (
          /* Asset Onboarding Wizard */
          <>
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8 sm:mb-10">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-panel-border"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-panel-border"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-panel-border"}`} />
            </div>

            {/* Step 1: Building Type */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">
                    Configure Facility
                  </h1>
                  <p className="text-foreground/60 text-xs sm:text-sm">
                    Select the building context to load baseline criticality rules.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Hospital / Healthcare",
                    "Data Center",
                    "Commercial Office",
                    "Shopping Mall",
                    "Manufacturing Plant",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setBuildingType(type)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                        buildingType === type
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-panel-border bg-panel hover:border-primary/50 text-foreground/80"
                      }`}
                    >
                      <Building2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Equipment Type */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">
                    Target Equipment Class
                  </h1>
                  <p className="text-foreground/60 text-xs sm:text-sm">
                    What equipment category are we monitoring in the {buildingType}?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "HVAC System",
                    "High-Pressure Water Pump",
                    "Industrial Chiller",
                    "Elevator Motor",
                    "Backup Generator",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setEquipmentType(type)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                        equipmentType === type
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-panel-border bg-panel hover:border-primary/50 text-foreground/80"
                      }`}
                    >
                      <Box className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Brand & Model */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">
                    Asset Details &amp; Specs
                  </h1>
                  <p className="text-foreground/60 text-xs sm:text-sm">
                    Provide the brand/model to attach physics boundaries.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-foreground/80">Brand &amp; Model Name</label>
                    <input
                      type="text"
                      value={brandModel}
                      onChange={(e) => setBrandModel(e.target.value)}
                      placeholder="e.g. Trane CenTraVac CVHE"
                      className="bg-panel border border-panel-border rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#4ade80]" />
                    <span className="text-xs text-foreground/70">
                      4 AI Agents configured for {equipmentType} in {buildingType}.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="mt-8 pt-4 border-t border-panel-border/40 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-foreground/60 hover:text-white text-xs sm:text-sm font-medium"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !buildingType) || (step === 2 && !equipmentType) || (step === 3 && !brandModel)
                }
                className="bg-primary text-black px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <span>{step === 3 ? "Launch Command Center" : "Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
