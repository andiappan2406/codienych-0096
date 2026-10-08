import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    agents: [
      {
        id: "agent_1_watch",
        name: "Watch Agent",
        role: "Continuous Contextual Anomaly Detection",
        model_type: "Isolation Z-Score & Multidimensional Dynamic Baselining",
        file: "src/lib/ai-engine/index.ts (WatchAgent)",
        status: "ACTIVE",
        latency: "< 2ms",
      },
      {
        id: "agent_2_diagnose",
        name: "Diagnose Agent",
        role: "Degradation Classification & Failure Risk Estimation",
        model_type: "Multi-Sensor Gradient Degradation Classifier",
        file: "src/lib/ai-engine/index.ts (DiagnoseAgent)",
        status: "ACTIVE",
        latency: "< 2ms",
      },
      {
        id: "agent_3_predict",
        name: "Predict Agent",
        role: "Remaining Useful Life (RUL) Trajectory Regressor",
        model_type: "Degradation Velocity Regressor",
        file: "src/lib/ai-engine/index.ts (PredictAgent)",
        status: "ACTIVE",
        latency: "< 2ms",
      },
      {
        id: "agent_4_plan_explain",
        name: "Plan & Explain Agent",
        role: "Neuro-Symbolic Reasoning & Fuzzy Health Inference Planner",
        model_type: "Sugeno Fuzzy Logic + Domain Knowledge Symbolic Rule Engine",
        file: "src/lib/ai-engine/index.ts (PlanExplainAgent)",
        status: "ACTIVE",
        latency: "< 1ms",
      },
    ],
    orchestrator: {
      name: "BuildGuard MultiAgent Pipeline",
      version: "1.0.0",
      architecture: "Serverless TypeScript / Edge Ready",
    },
  });
}
