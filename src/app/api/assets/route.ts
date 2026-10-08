import { NextResponse } from "next/server";
import { getAllAssets } from "@/lib/db";

export async function GET() {
  try {
    const assets = await getAllAssets();
    return NextResponse.json({ assets, success: true, count: assets.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
