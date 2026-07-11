"use client";

import { useEffect, useMemo, useState } from "react";

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

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const SESSIONS = [1, 2, 3, 4];

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
    <div>
      <h1 className="text-2xl font-bold text-ink">기출문제 풀기</h1>
      <p className="mt-1 text-sm text-ink-soft">단원 / 연도 / 회차로 필터링해서 문제를 풀어보세요.</p>

      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full min-w-0 rounded-lg border-none bg-white px-2 py-2 text-xs text-ink shadow-soft sm:w-auto sm:px-3 sm:text-sm"
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
            className="w-full min-w-0 rounded-lg border-none bg-white px-2 py-2 text-xs text-ink shadow-soft sm:w-auto sm:px-3 sm:text-sm"
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
            className="w-full min-w-0 rounded-lg border-none bg-white px-2 py-2 text-xs text-ink shadow-soft sm:w-auto sm:px-3 sm:text-sm"
          >
            <option value="">전체 회차</option>
            {SESSIONS.map((session) => (
              <option key={session} value={session}>
                {session}회
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          {selectedUnit || selectedYear || selectedSession ? (
            <button onClick={resetFilters} className="text-sm text-ink-faint hover:text-ink hover:underline">
              필터 초기화
            </button>
          ) : (
            <span />
          )}
          <span className="text-sm text-ink-faint">{resultLabel}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {!loading && questions.length === 0 && (
          <p className="rounded-xl2 bg-white p-6 text-center text-sm text-ink-faint shadow-soft">
            조건에 맞는 문제가 없습니다.
          </p>
        )}

        {questions.map((q, index) => {
          const isRevealed = revealed.has(q.id);
          const grade_ = grades[q.id] ?? "ungraded";

          return (
            <div key={q.id} className="rounded-xl2 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                <span className="rounded bg-mint-50 px-2 py-0.5 text-ink-soft">{q.unit_name}</span>
                {q.year && (
                  <span>
                    {q.year}년 {q.session}회
                  </span>
                )}
                <span>{q.type}</span>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words font-medium leading-relaxed text-ink">
                {index + 1}. {q.question}
              </p>

              {!isRevealed ? (
                <button
                  onClick={() => toggleReveal(q.id)}
                  className="mt-4 rounded-md bg-mint-50 px-3 py-1.5 text-sm font-medium text-mint-600 hover:bg-mint-100"
                >
                  정답 확인
                </button>
              ) : (
                <div className="mt-4 space-y-2 rounded-lg bg-mint-50 p-4 text-sm">
                  <p className="whitespace-pre-wrap break-words text-ink">
                    <span className="font-semibold">정답</span> {q.answer}
                  </p>
                  {q.explanation && (
                    <p className="whitespace-pre-wrap break-words text-ink-soft">
                      <span className="font-semibold text-ink">해설</span> {q.explanation}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => grade(q.id, true)}
                      disabled={grade_ !== "ungraded"}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                        grade_ === "correct" ? "bg-mint-400 text-white" : "bg-white text-ink-soft hover:bg-mint-100"
                      } disabled:cursor-default`}
                    >
                      맞았어요
                    </button>
                    <button
                      onClick={() => grade(q.id, false)}
                      disabled={grade_ !== "ungraded"}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                        grade_ === "incorrect" ? "bg-rose-200 text-ink" : "bg-white text-ink-soft hover:bg-rose-100"
                      } disabled:cursor-default`}
                    >
                      틀렸어요
                    </button>
                    {grade_ !== "ungraded" && <span className="text-xs text-ink-faint">기록됨</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
