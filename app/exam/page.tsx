"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Unit {
  id: number;
  number: number;
  name: string;
}

interface ExamQuestion {
  id: number;
  unit_id: number;
  unit_number: number;
  unit_name: string;
  year: number | null;
  session: number | null;
  type: string;
  question: string;
  answer: string;
  explanation: string | null;
  keywords: string[];
  source: string;
}

const YEARS = [2024, 2023, 2022, 2021, 2020];
const SESSIONS = [1, 2, 3];

type GradeState = "ungraded" | "correct" | "incorrect";

export default function ExamPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [grades, setGrades] = useState<Record<number, GradeState>>({});

  useEffect(() => {
    fetch("/api/units")
      .then((res) => res.json())
      .then(setUnits)
      .catch(() => setUnits([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedUnit) params.set("unit", selectedUnit);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedSession) params.set("session", selectedSession);

    setLoading(true);
    fetch(`/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data: ExamQuestion[]) => {
        setQuestions(data);
        setRevealed(new Set());
        setGrades({});
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [selectedUnit, selectedYear, selectedSession]);

  const resultLabel = useMemo(() => {
    if (loading) return "불러오는 중...";
    return `${questions.length}문제`;
  }, [loading, questions.length]);

  function toggleReveal(id: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function grade(questionId: number, isCorrect: boolean) {
    setGrades((prev) => ({ ...prev, [questionId]: isCorrect ? "correct" : "incorrect" }));
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          is_correct: isCorrect ? 1 : 0,
          mode: "exam",
        }),
      });
    } catch {
      // 기록 실패는 조용히 무시하고 화면 상태는 유지한다.
    }
  }

  function resetFilters() {
    setSelectedUnit("");
    setSelectedYear("");
    setSelectedSession("");
  }

  return (
    <div className="min-h-screen px-6 py-10 sm:px-12">
      <main className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 홈으로
        </Link>
        <h1 className="mt-3 text-2xl font-bold">기출문제 풀기</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">단원 / 연도 / 회차로 필터링해서 문제를 풀어보세요.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">전체 단원</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.number}>
                {unit.number}. {unit.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">전체 연도</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>

          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          >
            <option value="">전체 회차</option>
            {SESSIONS.map((session) => (
              <option key={session} value={session}>
                {session}회
              </option>
            ))}
          </select>

          {(selectedUnit || selectedYear || selectedSession) && (
            <button
              onClick={resetFilters}
              className="text-sm text-black/50 hover:underline dark:text-white/50"
            >
              필터 초기화
            </button>
          )}

          <span className="ml-auto text-sm text-black/50 dark:text-white/50">{resultLabel}</span>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {!loading && questions.length === 0 && (
            <p className="rounded-lg border border-dashed border-black/15 p-6 text-center text-sm text-black/50 dark:border-white/20 dark:text-white/50">
              조건에 맞는 문제가 없습니다.
            </p>
          )}

          {questions.map((q, index) => {
            const isRevealed = revealed.has(q.id);
            const grade_ = grades[q.id] ?? "ungraded";

            return (
              <div key={q.id} className="rounded-lg border border-black/10 p-5 dark:border-white/15">
                <div className="flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
                  <span className="rounded bg-black/[.05] px-2 py-0.5 dark:bg-white/[.08]">{q.unit_name}</span>
                  {q.year && <span>{q.year}년 {q.session}회</span>}
                  <span>{q.type}</span>
                </div>

                <p className="mt-3 font-medium leading-relaxed">
                  {index + 1}. {q.question}
                </p>

                {!isRevealed ? (
                  <button
                    onClick={() => toggleReveal(q.id)}
                    className="mt-4 rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/[.03] dark:border-white/20 dark:hover:bg-white/[.06]"
                  >
                    정답 확인
                  </button>
                ) : (
                  <div className="mt-4 space-y-2 rounded-md bg-black/[.03] p-4 text-sm dark:bg-white/[.06]">
                    <p>
                      <span className="font-semibold">정답</span> {q.answer}
                    </p>
                    {q.explanation && (
                      <p className="text-black/70 dark:text-white/70">
                        <span className="font-semibold">해설</span> {q.explanation}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => grade(q.id, true)}
                        disabled={grade_ !== "ungraded"}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          grade_ === "correct"
                            ? "bg-green-600 text-white"
                            : "border border-black/15 hover:bg-black/[.05] dark:border-white/20 dark:hover:bg-white/[.08]"
                        } disabled:cursor-default`}
                      >
                        맞았어요
                      </button>
                      <button
                        onClick={() => grade(q.id, false)}
                        disabled={grade_ !== "ungraded"}
                        className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                          grade_ === "incorrect"
                            ? "bg-red-600 text-white"
                            : "border border-black/15 hover:bg-black/[.05] dark:border-white/20 dark:hover:bg-white/[.08]"
                        } disabled:cursor-default`}
                      >
                        틀렸어요
                      </button>
                      {grade_ !== "ungraded" && (
                        <span className="text-xs text-black/40 dark:text-white/40">기록됨</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
