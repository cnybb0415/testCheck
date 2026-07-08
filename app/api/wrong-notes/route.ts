import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/wrong-notes
// 최근 시도가 오답이었거나, 오답 횟수가 정답 횟수보다 많은 문제 목록 + 단원별 정답률을 반환한다.
export async function GET() {
  const weakUnits = await sql`
    SELECT
      u.id,
      u.number,
      u.name,
      COUNT(a.id) AS total_attempts,
      COUNT(a.id) FILTER (WHERE a.is_correct = 1) AS correct_attempts,
      CASE WHEN COUNT(a.id) = 0 THEN NULL
           ELSE ROUND(100.0 * COUNT(a.id) FILTER (WHERE a.is_correct = 1) / COUNT(a.id), 1)
      END AS accuracy
    FROM units u
    LEFT JOIN questions q ON q.unit_id = u.id
    LEFT JOIN attempts a ON a.question_id = q.id
    GROUP BY u.id, u.number, u.name
    ORDER BY u.number
  `;

  const questions = await sql`
    WITH latest_attempt AS (
      SELECT DISTINCT ON (question_id) question_id, is_correct, attempted_at
      FROM attempts
      ORDER BY question_id, attempted_at DESC
    ),
    stats AS (
      SELECT
        question_id,
        COUNT(*) FILTER (WHERE is_correct = 0) AS wrong_count,
        COUNT(*) FILTER (WHERE is_correct = 1) AS correct_count
      FROM attempts
      GROUP BY question_id
    )
    SELECT
      q.id, q.unit_id, q.year, q.session, q.type, q.question, q.answer, q.explanation, q.keywords,
      u.number AS unit_number, u.name AS unit_name,
      s.wrong_count, s.correct_count, la.is_correct AS latest_is_correct
    FROM questions q
    JOIN units u ON u.id = q.unit_id
    JOIN stats s ON s.question_id = q.id
    JOIN latest_attempt la ON la.question_id = q.id
    WHERE la.is_correct = 0 OR s.wrong_count > s.correct_count
    ORDER BY s.wrong_count DESC, q.id ASC
  `;

  return NextResponse.json({ weakUnits, questions });
}
