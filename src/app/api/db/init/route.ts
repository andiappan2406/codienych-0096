import { NextResponse } from "next/server";
import { initDbSchema, getDbStatus } from "@/lib/db";

export async function POST() {
  try {
    const initialized = await initDbSchema();
    const status = await getDbStatus();
    return NextResponse.json({
      success: true,
      postgresSchemaInitialized: initialized,
      status,
      message: initialized
        ? "PostgreSQL / Supabase schema created and seeded successfully."
        : "Running on in-memory / local persistent database. Tables and initial assets ready.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
