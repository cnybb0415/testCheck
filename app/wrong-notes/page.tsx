"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface WeakUnit {
  id: number;
  number: number;
  name: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number | null;
}

interface WrongQuestion {
  id: number;
  unit_number: number;
  unit_name: string;
  year: number | null;
  session: number | null;
  type: string;
  question: string;
  answer: string;
  explanation: string | null;
  keywords: string[];
  wrong_count: number;
  correct_count: number;
  latest_is_correct: 0 | 1;
}

function analyze(q: WrongQuestion, unitAccuracy: number | null): string[] {
  const reasons: string[] = [];
  if (q.wrong_count >= 2) {
    reasons.push(`이 문제를 ${q.wrong_count}번 틀렸습니다. 정답과 키워드를 소리 내어 한 번 더 암기해보세요.`);
  } else {
    reasons.push("최근에 틀린 문제입니다. 해설을 다시 읽고 카드퀴즈로 복습하세요.");
  }
  if (unitAccuracy !== null && unitAccuracy < 60) {
    reasons.push(`'${q.unit_name}' 단원 정답률이 ${unitAccuracy}%로 낮습니다. 개념 자체를 다시 정리할 필요가 있습니다.`);
  }
  return reasons;
}

export default function WrongNotesPage() {
  const [weakUnits, setWeakUnits] = useState<WeakUnit[]>([]);
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wrong-notes")
      .then((res) => res.json())
      .then((data) => {
        setWeakUnits(data.weakUnits ?? []);
        setQuestions(data.questions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const accuracyByUnit = useMemo(() => {
    const map = new Map<number, number | null>();
    weakUnits.forEach((u) => map.set(u.number, u.accuracy));
    return map;
  }, [weakUnits]);

  const grouped = useMemo(() => {
    const map = new Map<string, WrongQuestion[]>();
    for (const q of questions) {
      const list = map.get(q.unit_name) ?? [];
      list.push(q);
      map.set(q.unit_name, list);
    }
    return Array.from(map.entries());
  }, [questions]);

  return (
    <div className="min-h-screen px-6 py-10 sm:px-12">
      <main className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 홈으로
        </Link>
        <h1 className="mt-3 text-2xl font-bold">오답노트</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          틀렸거나 자주 틀리는 문제를 모아 원인을 분석합니다.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-black/50 dark:text-white/50">불러오는 중...</p>
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-black/70 dark:text-white/70">단원별 정답률</h2>
              <div className="mt-3 space-y-2">
                {weakUnits.map((u) => {
                  const isWeak = u.accuracy !== null && u.accuracy < 60;
                  return (
                    <div key={u.id} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 text-black/70 dark:text-white/70">
                        {u.number}. {u.name}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.1]">
                        <div
                          className={`h-full rounded-full ${isWeak ? "bg-red-500" : "bg-green-600"}`}
                          style={{ width: `${u.accuracy ?? 0}%` }}
                        />
                      </div>
                      <span className={`w-20 shrink-0 text-right ${isWeak ? "text-red-500" : "text-black/50 dark:text-white/50"}`}>
                        {u.accuracy === null ? "기록 없음" : `${u.accuracy}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-black/70 dark:text-white/70">
                다시 봐야 할 문제 {questions.length}개
              </h2>
              {questions.length > 0 && (
                <Link
                  href="/cards?source=wrong"
                  className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black"
                >
                  약점 집중 카드퀴즈로 복습
                </Link>
              )}
            </div>

            {questions.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-black/15 p-6 text-center text-sm text-black/50 dark:border-white/20 dark:text-white/50">
                아직 틀린 문제가 없습니다. 기출문제 풀기에서 채점을 진행해보세요.
              </p>
            ) : (
              <div className="mt-4 space-y-6">
                {grouped.map(([unitName, list]) => (
                  <div key={unitName}>
                    <h3 className="mb-2 text-xs font-semibold text-black/50 dark:text-white/50">{unitName}</h3>
                    <div className="space-y-3">
                      {list.map((q) => {
                        const reasons = analyze(q, accuracyByUnit.get(q.unit_number) ?? null);
                        return (
                          <div key={q.id} className="rounded-lg border border-black/10 p-4 dark:border-white/15">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-black/50 dark:text-white/50">
                              {q.year && <span>{q.year}년 {q.session}회</span>}
                              <span>오답 {q.wrong_count}회 · 정답 {q.correct_count}회</span>
                            </div>
                            <p className="mt-2 font-medium leading-relaxed">{q.question}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>
                                <span className="font-semibold">정답</span> {q.answer}
                              </p>
                              {q.explanation && (
                                <p className="text-black/70 dark:text-white/70">
                                  <span className="font-semibold">해설</span> {q.explanation}
                                </p>
                              )}
                            </div>
                            <div className="mt-3 space-y-1 rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                              {reasons.map((r, i) => (
                                <p key={i}>· {r}</p>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
