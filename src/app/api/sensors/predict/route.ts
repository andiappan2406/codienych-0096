import { NextRequest, NextResponse } from "next/server";
import { fuseMobileSensorReadings, REPO_DATASET_BENCHMARKS } from "@/lib/sensors/sensorFusion";
import { updateAssetTelemetry, insertAlert, insertWorkOrder, getAssetById } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assetId = "HVAC-01",
      assetType = "HVAC",
      audio = null,
      vibration = null,
      optical = null,
      saveToDb = false,
      createAlertOnCritical = true,
      createWorkOrder = false,
    } = body;

    const atype = (assetType || "HVAC").toUpperCase();
    const result = fuseMobileSensorReadings(atype, audio, vibration, optical);

    // If requested, persist telemetry into database
    if (saveToDb) {
      try {
        await updateAssetTelemetry(assetId, result.derivedSensors, result.pipelineResult);

        // If health state is Critical or High, trigger automated Alert
        if (createAlertOnCritical && (result.overallState === "Critical" || result.overallState === "High")) {
          await insertAlert({
            id: `ALT-MOB-${Date.now().toString().slice(-4)}`,
            asset_id: assetId,
            severity: result.overallState === "Critical" ? "critical" : "warning",
            title: `Mobile Sensor Diagnostics Alert: ${result.primaryFailureMode}`,
            message: `Web Sensor Telemetry detected abnormal signature. Health Score: ${result.overallHealthScore}/100. ${result.maintenanceAction}`,
            status: "Open",
            root_cause: result.primaryFailureMode,
            time_ago: "Just now",
            created_at: new Date().toISOString(),
          });
        }

        // If explicitly requested or critical work order recommended
        if (createWorkOrder || result.overallState === "Critical") {
          await insertWorkOrder({
            id: `WO-MOB-${Date.now().toString().slice(-4)}`,
            asset_id: assetId,
            title: result.maintenanceAction,
            priority: result.overallState === "Critical" ? "Critical" : "High",
            due_date: new Date(Date.now() + Math.max(1, Math.floor(result.pipelineResult.predictions.rul_days)) * 24 * 3600 * 1000).toISOString(),
            due_label: `Within ${Math.max(1, Math.floor(result.pipelineResult.predictions.rul_days))} days`,
            status: "Pending",
            task_type: "Predictive",
            assigned_to: "Field Diagnostic Engineer (Mobile Telemetry)",
            notes: `Generated via Mobile Sensor Web Diagnostics. Acoustic Peak: ${result.acousticSummary.peakFrequency}Hz, Vibration RMS: ${result.vibrationSummary.velocityRmsMmS} mm/s (${result.vibrationSummary.isoZone}), Fan RPM: ${result.opticalSummary.rpm}.`,
            created_at: new Date().toISOString(),
          });
        }
      } catch (dbErr) {
        console.warn("Could not save to DB (falling back to memory):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      diagnostic: result,
      benchmarks: REPO_DATASET_BENCHMARKS[atype] || REPO_DATASET_BENCHMARKS.HVAC,
    });
  } catch (error: any) {
    console.error("Sensor predict API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process sensor diagnostics" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    availableBenchmarks: REPO_DATASET_BENCHMARKS,
    supportedSensors: ["Microphone Audio FFT", "DeviceMotion 3-Axis Vibration", "Camera Optical Fan Tachometer"],
    standards: ["ISO 10816-3 Vibration Severity", "Fourier Acoustic Harmonics 1X/2X/3X", "Optical Blade Pass Frequency Stroboscope"],
  });
}
