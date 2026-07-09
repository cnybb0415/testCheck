import { z } from "zod";

export const UNITS = [
  { number: 1, name: "소프트웨어 설계" },
  { number: 2, name: "소프트웨어 개발" },
  { number: 3, name: "데이터베이스 구축" },
  { number: 4, name: "프로그래밍 언어 활용" },
  { number: 5, name: "정보시스템 구축 관리" },
] as const;

export const QUESTION_TYPES = ["단답형", "서술형", "코드"] as const;
export const QUESTION_SOURCES = ["exam", "practice", "imported"] as const;
export const ATTEMPT_MODES = ["exam", "card", "daily"] as const;

export interface Unit {
  id: number;
  number: number;
  name: string;
}

export interface Question {
  id: number;
  unit_id: number;
  year: number | null;
  session: number | null;
  type: (typeof QUESTION_TYPES)[number];
  question: string;
  answer: string;
  explanation: string | null;
  keywords: string[];
  source: (typeof QUESTION_SOURCES)[number];
  last_seen_at: string | null;
  created_at: string;
}

export interface Attempt {
  id: number;
  question_id: number;
  is_correct: 0 | 1;
  user_answer: string | null;
  mode: (typeof ATTEMPT_MODES)[number];
  attempted_at: string;
}

export interface CardProgress {
  id: number;
  question_id: number;
  known: 0 | 1;
  reviewed_at: string;
}

// JSON import에 사용되는 입력 스키마 (unit은 단원 번호 1~5로 지정)
export const QuestionImportSchema = z.object({
  unit: z.number().int().min(1).max(5),
  year: z.number().int().optional().nullable(),
  session: z.number().int().min(1).max(4).optional().nullable(),
  type: z.enum(QUESTION_TYPES).default("단답형"),
  question: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().optional().nullable(),
  keywords: z.array(z.string()).default([]),
  source: z.enum(QUESTION_SOURCES).default("imported"),
});

export type QuestionImportInput = z.infer<typeof QuestionImportSchema>;

export const QuestionImportListSchema = z.array(QuestionImportSchema);
