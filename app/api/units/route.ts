import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const units = await sql`SELECT id, number, name FROM units ORDER BY number`;
  return NextResponse.json(units);
}
