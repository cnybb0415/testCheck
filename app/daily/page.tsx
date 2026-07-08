"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DailyQuestion {
  id: number;
  unit_name: string;
  year: number | null;
  session: number | null;
  type: string;
  question: string;
  answer: string;
  explanation: string | null;
  keywords: string[];
}

type GradeState = "ungraded" | "correct" | "incorrect";

export default function DailyPage() {
  const [date, setDate] = useState("");
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [grades, setGrades] = useState<Record<number, GradeState>>({});

  useEffect(() => {
    fetch("/api/daily")
      .then((res) => res.json())
      .then((data) => {
        setDate(data.date);
        setQuestions(data.questions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

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
        body: JSON.stringify({ question_id: questionId, is_correct: isCorrect ? 1 : 0, mode: "daily" }),
      });
    } catch {
      // 기록 실패는 조용히 무시한다.
    }
  }

  const gradedCount = Object.values(grades).filter((g) => g !== "ungraded").length;

  return (
    <div className="min-h-screen px-6 py-10 sm:px-12">
      <main className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 홈으로
        </Link>
        <div className="mt-3 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">오늘의 문제</h1>
          {date && <span className="text-sm text-black/50 dark:text-white/50">{date}</span>}
        </div>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          자주 틀렸던 문제를 우선으로 매일 {questions.length || 5}문제를 뽑습니다. 자정에 새로 갱신됩니다.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-black/50 dark:text-white/50">불러오는 중...</p>
        ) : questions.length === 0 ? (
          <p className="mt-8 rounded-lg border border-dashed border-black/15 p-6 text-center text-sm text-black/50 dark:border-white/20 dark:text-white/50">
            문제가 없습니다. 먼저 기출문제를 등록해주세요.
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm text-black/50 dark:text-white/50">{gradedCount} / {questions.length} 채점 완료</p>
            <div className="mt-4 flex flex-col gap-4">
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
          </>
        )}
      </main>
    </div>
  );
}
