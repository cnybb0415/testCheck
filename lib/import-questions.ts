import type { NeonQueryFunction } from "@neondatabase/serverless";
import { QuestionImportListSchema, type QuestionImportInput } from "./types";

type Sql = NeonQueryFunction<false, false>;

export interface ImportResult {
  inserted: number;
  skipped: number;
}

/**
 * unit(1~5) 번호를 units.id로 매핑해 questions 테이블에 upsert한다.
 * 동일 (unit, year, session, question) 조합이 이미 있으면 건너뛴다.
 * 단위(unit) 조회 + 중복 체크 + 삽입을 한 쿼리로 묶어 행당 1회 왕복으로 처리한다.
 */
export async function importQuestions(sql: Sql, rawItems: unknown[]): Promise<ImportResult> {
  const items: QuestionImportInput[] = QuestionImportListSchema.parse(rawItems);

  let inserted = 0;
  let skipped = 0;

  for (const row of items) {
    const year = row.year ?? null;
    const session = row.session ?? null;

    const result = await sql`
      INSERT INTO questions (unit_id, year, session, type, question, answer, explanation, keywords, source)
      SELECT u.id, ${year}, ${session}, ${row.type}, ${row.question}, ${row.answer}, ${row.explanation ?? null}, ${JSON.stringify(row.keywords ?? [])}::jsonb, ${row.source}
      FROM units u
      WHERE u.number = ${row.unit}
        AND NOT EXISTS (
          SELECT 1 FROM questions q
          WHERE q.unit_id = u.id
            AND q.question = ${row.question}
            AND COALESCE(q.year, -1) = COALESCE(${year}, -1)
            AND COALESCE(q.session, -1) = COALESCE(${session}, -1)
        )
      RETURNING id
    `;

    if (result.length > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}
