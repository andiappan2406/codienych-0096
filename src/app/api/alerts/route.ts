import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json({ alerts, success: true, count: alerts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
