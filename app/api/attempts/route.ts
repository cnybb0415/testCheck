import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { ATTEMPT_MODES } from "@/lib/types";

const AttemptInputSchema = z.object({
  question_id: z.number().int(),
  is_correct: z.union([z.literal(0), z.literal(1)]),
  user_answer: z.string().optional().nullable(),
  mode: z.enum(ATTEMPT_MODES),
});

// POST /api/attempts
// body: { question_id, is_correct: 0|1, user_answer?, mode: 'exam' | 'card' | 'daily' }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "유효한 JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = AttemptInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다.", details: parsed.error.issues }, { status: 400 });
  }

  const { question_id, is_correct, user_answer, mode } = parsed.data;

  const rows = await sql`
    INSERT INTO attempts (question_id, is_correct, user_answer, mode)
    VALUES (${question_id}, ${is_correct}, ${user_answer ?? null}, ${mode})
    RETURNING id, question_id, is_correct, user_answer, mode, attempted_at
  `;

  await sql`UPDATE questions SET last_seen_at = now() WHERE id = ${question_id}`;

  return NextResponse.json(rows[0]);
}
