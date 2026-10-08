import { NextResponse } from "next/server";
import { getDbStatus } from "@/lib/db";

export async function GET() {
  try {
    const status = await getDbStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
