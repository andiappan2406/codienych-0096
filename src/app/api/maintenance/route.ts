import { NextResponse } from "next/server";
import { getWorkOrders } from "@/lib/db";

export async function GET() {
  try {
    const workOrders = await getWorkOrders();
    return NextResponse.json({ workOrders, success: true, count: workOrders.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}
