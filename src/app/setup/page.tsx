"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Box, CheckCircle, ChevronRight, UploadCloud } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [buildingType, setBuildingType] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [brandModel, setBrandModel] = useState("");

  const handleNext = () => {
    if (step === 1 && buildingType) setStep(2);
    else if (step === 2 && equipmentType) setStep(3);
    else if (step === 3 && brandModel) {
      // Complete setup and redirect to dashboard
      router.push("/overview");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl glass-panel p-8 md:p-12 border-t-2 border-t-primary relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-10">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-panel-border'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-panel-border'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-panel-border'}`} />
        </div>

        {/* Step 1: Building Type */}
        {step === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Configure Environment</h1>
              <p className="text-foreground/60">Select the building context to load appropriate criticality rules.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Hospital / Healthcare', 'Data Center', 'Commercial Office', 'Shopping Mall', 'Manufacturing Plant'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBuildingType(type)}
                  className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                    buildingType === type 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-panel-border bg-panel hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  <Building2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Equipment Type */}
        {step === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Target Asset Type</h1>
              <p className="text-foreground/60">What type of equipment are we monitoring in the {buildingType}?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['HVAC System', 'High-Pressure Water Pump', 'Industrial Chiller', 'Elevator Motor'].map((type) => (
                <button
                  key={type}
                  onClick={() => setEquipmentType(type)}
                  className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                    equipmentType === type 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-panel-border bg-panel hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  <Box className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Brand, Model & Imaging */}
        {step === 3 && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-2">Asset Details</h1>
              <p className="text-foreground/60">Provide the exact model or upload an image to fetch specifications.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground/80">Brand & Exact Model</label>
                <input 
                  type="text" 
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  placeholder="e.g. Trane CenTraVac CVHE" 
                  className="bg-panel border border-panel-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-panel-border flex-1" />
                <span className="text-xs font-mono text-foreground/50 uppercase">OR</span>
                <div className="h-px bg-panel-border flex-1" />
              </div>

              <button className="border-2 border-dashed border-panel-border bg-panel/50 hover:bg-panel hover:border-primary/50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors text-foreground/60">
                <UploadCloud className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Upload Equipment Image</p>
                  <p className="text-xs mt-1">We will extract the model and specs via Vision AI</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="mt-12 flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-foreground/60 hover:text-foreground text-sm font-medium">
              Back
            </button>
          ) : <div />}
          
          <button 
            onClick={handleNext}
            disabled={(step === 1 && !buildingType) || (step === 2 && !equipmentType) || (step === 3 && !brandModel)}
            className="bg-primary text-black px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? "Initialize Dashboard" : "Continue"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
