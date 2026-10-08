import { NextRequest, NextResponse } from "next/server";
import { getAssetById } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await getAssetById(id);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found", success: false }, { status: 404 });
    }
    return NextResponse.json({ asset, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
