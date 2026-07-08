import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { sql } from "@/lib/db";
import { importQuestions } from "@/lib/import-questions";

// POST /api/questions/import
// body: QuestionImportInput[] (unit, year, session, type, question, answer, explanation, keywords, source)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "유효한 JSON 본문이 필요합니다." }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "요청 본문은 문제 객체의 배열이어야 합니다." }, { status: 400 });
  }

  try {
    const result = await importQuestions(sql, body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "문제 데이터 형식이 올바르지 않습니다.", details: error.issues }, { status: 400 });
    }
    throw error;
  }
}
