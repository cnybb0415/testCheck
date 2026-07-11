"use client";

import { useEffect, useState } from "react";

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
      .catch(() => setQuestions([]))
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
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-ink">오늘의 문제</h1>
        {date && <span className="text-sm text-ink-faint">{date}</span>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        자주 틀렸던 문제를 우선으로 매일 {questions.length || 5}문제를 뽑습니다. 자정에 새로 갱신됩니다.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-ink-faint">불러오는 중...</p>
      ) : questions.length === 0 ? (
        <p className="mt-8 rounded-xl2 bg-white p-6 text-center text-sm text-ink-faint shadow-soft">
          문제가 없습니다. 먼저 기출문제를 등록해주세요.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-faint">
            {gradedCount} / {questions.length} 채점 완료
          </p>
          <div className="mt-4 flex flex-col gap-4">
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
        </>
      )}
    </div>
  );
}
