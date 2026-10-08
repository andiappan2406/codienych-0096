import { NextRequest, NextResponse } from "next/server";
import { aiPipeline, getAssetParams, SensorReadings } from "@/lib/ai-engine";
import { recordSimulation } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assetType = (body.asset_type || "PUMP").toUpperCase();
    const mode = body.mode || "normal";
    const step = typeof body.step === "number" ? body.step : 0;
    const baseLoad = typeof body.load === "number" ? body.load / 100.0 : 0.8;

    const params = getAssetParams(assetType, baseLoad);

    let vib: number;
    let temp: number;
    let curr: number;
    let press: number;

    const randGauss = (mean: number, std: number) => {
      const u = Math.random();
      const v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u || 0.0001)) * Math.cos(2.0 * Math.PI * v);
      return mean + z * std;
    };

    if (mode === "normal") {
      vib = params.vib_base + randGauss(0, params.vib_noise);
      temp = params.temp_base + randGauss(0, params.temp_noise);
      curr = params.curr_base + randGauss(0, params.curr_noise);
      press = params.press_base + randGauss(0, params.press_noise);
    } else {
      const degradeFactor = Math.min(step / 10.0, 1.0);
      vib = params.vib_base + params.vib_deg * degradeFactor + randGauss(0, params.vib_noise);
      temp = params.temp_base + params.temp_deg * degradeFactor + randGauss(0, params.temp_noise);
      curr = params.curr_base + params.curr_deg * degradeFactor + randGauss(0, params.curr_noise);
      press = params.press_base + params.press_deg * degradeFactor + randGauss(0, params.press_noise);
    }

    const sensorDict: SensorReadings = {
      vibration: Number(Math.max(0.1, vib).toFixed(2)),
      temperature: Number(Math.max(0, temp).toFixed(2)),
      current: Number(Math.max(0.1, curr).toFixed(2)),
      pressure: Number(Math.max(0.1, press).toFixed(2)),
    };

    const pipelineResult = aiPipeline.process(assetType, sensorDict);

    // Save simulation telemetry & update health in DB
    await recordSimulation(assetType, sensorDict, pipelineResult);

    return NextResponse.json(pipelineResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
