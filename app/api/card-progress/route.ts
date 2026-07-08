import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const CardProgressInputSchema = z.object({
  question_id: z.number().int(),
  known: z.union([z.literal(0), z.literal(1)]),
});

// POST /api/card-progress
// body: { question_id, known: 0|1 }
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "유효한 JSON 본문이 필요합니다." }, { status: 400 });
  }

  const parsed = CardProgressInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다.", details: parsed.error.issues }, { status: 400 });
  }

  const { question_id, known } = parsed.data;

  const rows = await sql`
    INSERT INTO card_progress (question_id, known)
    VALUES (${question_id}, ${known})
    RETURNING id, question_id, known, reviewed_at
  `;

  await sql`UPDATE questions SET last_seen_at = now() WHERE id = ${question_id}`;

  return NextResponse.json(rows[0]);
}
