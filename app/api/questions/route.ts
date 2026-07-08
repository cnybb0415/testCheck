import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET /api/questions?unit=1&year=2023&session=2
// 세 파라미터 모두 선택적 필터로 동작한다.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");
  const year = searchParams.get("year");
  const session = searchParams.get("session");

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (unit) {
    params.push(Number(unit));
    conditions.push(`units.number = $${params.length}`);
  }
  if (year) {
    params.push(Number(year));
    conditions.push(`questions.year = $${params.length}`);
  }
  if (session) {
    params.push(Number(session));
    conditions.push(`questions.session = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const questions = await sql.query(
    `SELECT questions.*, units.number AS unit_number, units.name AS unit_name
     FROM questions
     JOIN units ON units.id = questions.unit_id
     ${where}
     ORDER BY questions.year DESC NULLS LAST, questions.session DESC NULLS LAST, questions.id ASC`,
    params
  );

  return NextResponse.json(questions);
}
