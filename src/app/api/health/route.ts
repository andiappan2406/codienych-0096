import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/db";

export async function GET() {
  try {
    const assets = await getAllAssets();
    const total = assets.length;
    const critical = assets.filter((a: any) => a.health?.state === "Critical").length;
    const warning = assets.filter((a: any) => a.health?.state === "High" || a.health?.state === "Warning").length;
    const healthy = total - critical - warning;

    const avgScore = Math.round(
      assets.reduce((acc: number, a: any) => acc + (a.health?.score || 0), 0) / (total || 1)
    );

    return NextResponse.json({
      success: true,
      portfolio: {
        total_assets: total,
        healthy_count: healthy,
        warning_count: warning,
        critical_count: critical,
        average_health_score: avgScore,
        overall_status: critical > 0 ? "ACTION_REQUIRED" : warning > 0 ? "ATTENTION" : "OPTIMAL",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
