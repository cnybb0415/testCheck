import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET /api/dashboard
// 학습 진도 대시보드용 집계 데이터를 반환한다.
export async function GET() {
  const [summaryRows, unitStats, modeStats, cardStats, dailyActivity, recentAttempts] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM questions) AS total_questions,
        (SELECT COUNT(DISTINCT question_id) FROM attempts) AS attempted_questions,
        (SELECT COUNT(*) FROM attempts) AS total_attempts,
        (SELECT COUNT(*) FROM attempts WHERE is_correct = 1) AS correct_attempts
    `,
    sql`
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
    `,
    sql`
      SELECT
        mode,
        COUNT(*) AS total_attempts,
        COUNT(*) FILTER (WHERE is_correct = 1) AS correct_attempts
      FROM attempts
      GROUP BY mode
    `,
    sql`
      SELECT known, COUNT(*) AS count
      FROM (
        SELECT DISTINCT ON (question_id) question_id, known
        FROM card_progress
        ORDER BY question_id, reviewed_at DESC
      ) latest
      GROUP BY known
    `,
    sql`
      SELECT
        to_char(attempted_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS day,
        COUNT(*) AS total_attempts,
        COUNT(*) FILTER (WHERE is_correct = 1) AS correct_attempts
      FROM attempts
      WHERE attempted_at >= now() - interval '13 days'
      GROUP BY day
      ORDER BY day
    `,
    sql`
      SELECT
        a.id, a.is_correct, a.mode, a.attempted_at,
        q.question, u.number AS unit_number, u.name AS unit_name
      FROM attempts a
      JOIN questions q ON q.id = a.question_id
      JOIN units u ON u.id = q.unit_id
      ORDER BY a.attempted_at DESC
      LIMIT 10
    `,
  ]);

  return NextResponse.json({
    summary: summaryRows[0],
    unitStats,
    modeStats,
    cardStats,
    dailyActivity,
    recentAttempts,
  });
}
