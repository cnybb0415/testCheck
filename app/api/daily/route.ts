import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const DAILY_COUNT = 5;

// GET /api/daily
// 오늘 날짜에 고정된 문제 세트를 반환한다. 없으면 오답이 많았던 문제를 우선순위로 새로 뽑아 저장한다.
export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  let questionIds = (
    await sql`SELECT question_id FROM daily_questions WHERE date = ${today} ORDER BY id`
  ).map((row) => row.question_id as number);

  if (questionIds.length === 0) {
    const picked = await sql`
      SELECT q.id
      FROM questions q
      LEFT JOIN (
        SELECT question_id,
               COUNT(*) FILTER (WHERE is_correct = 0) AS wrong_count
        FROM attempts
        GROUP BY question_id
      ) s ON s.question_id = q.id
      ORDER BY COALESCE(s.wrong_count, 0) DESC, random()
      LIMIT ${DAILY_COUNT}
    `;

    questionIds = picked.map((row) => row.id as number);

    for (const id of questionIds) {
      await sql`
        INSERT INTO daily_questions (date, question_id)
        VALUES (${today}, ${id})
        ON CONFLICT (date, question_id) DO NOTHING
      `;
    }
  }

  if (questionIds.length === 0) {
    return NextResponse.json({ date: today, questions: [] });
  }

  const questions = await sql`
    SELECT q.id, q.unit_id, q.year, q.session, q.type, q.question, q.answer, q.explanation, q.keywords,
           u.number AS unit_number, u.name AS unit_name
    FROM questions q
    JOIN units u ON u.id = q.unit_id
    WHERE q.id = ANY(${questionIds}::int[])
  `;

  const order = new Map(questionIds.map((id, idx) => [id, idx]));
  questions.sort((a, b) => (order.get(a.id as number) ?? 0) - (order.get(b.id as number) ?? 0));

  return NextResponse.json({ date: today, questions });
}
