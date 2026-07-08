import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const units = await sql`SELECT id, number, name FROM units ORDER BY number`;
  return NextResponse.json(units);
}
