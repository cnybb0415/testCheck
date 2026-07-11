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
      .catch(() => {
        setWeakUnits([]);
        setQuestions([]);
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
    <div>
      <h1 className="text-2xl font-bold text-ink">오답노트</h1>
      <p className="mt-1 text-sm text-ink-soft">틀렸거나 자주 틀리는 문제를 모아 원인을 분석합니다.</p>

      {loading ? (
        <p className="mt-8 text-sm text-ink-faint">불러오는 중...</p>
      ) : (
        <>
          <section className="mt-8 rounded-xl2 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink-soft">단원별 정답률</h2>
            <div className="mt-3 space-y-2">
              {weakUnits.map((u) => {
                const isWeak = u.accuracy !== null && u.accuracy < 60;
                return (
                  <div key={u.id} className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
                    <span className="w-20 shrink-0 truncate text-ink-soft sm:w-40">
                      {u.number}. {u.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-mint-50">
                      <div
                        className={`h-full rounded-full ${isWeak ? "bg-rose-200" : "bg-mint-400"}`}
                        style={{ width: `${u.accuracy ?? 0}%` }}
                      />
                    </div>
                    <span className={`w-14 shrink-0 text-right sm:w-20 ${isWeak ? "text-rose-200" : "text-ink-faint"}`}>
                      {u.accuracy === null ? "기록 없음" : `${u.accuracy}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-soft">다시 봐야 할 문제 {questions.length}개</h2>
            {questions.length > 0 && (
              <Link href="/cards?source=wrong" className="rounded-md bg-mint-400 px-3 py-1.5 text-xs font-medium text-white">
                약점 집중 카드퀴즈로 복습
              </Link>
            )}
          </div>

          {questions.length === 0 ? (
            <p className="mt-4 rounded-xl2 bg-white p-6 text-center text-sm text-ink-faint shadow-soft">
              아직 틀린 문제가 없습니다. 기출문제 풀기에서 채점을 진행해보세요.
            </p>
          ) : (
            <div className="mt-4 space-y-6">
              {grouped.map(([unitName, list]) => (
                <div key={unitName}>
                  <h3 className="mb-2 text-xs font-semibold text-ink-faint">{unitName}</h3>
                  <div className="space-y-3">
                    {list.map((q) => {
                      const reasons = analyze(q, accuracyByUnit.get(q.unit_number) ?? null);
                      return (
                        <div key={q.id} className="rounded-xl2 bg-white p-4 shadow-soft">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                            {q.year && (
                              <span>
                                {q.year}년 {q.session}회
                              </span>
                            )}
                            <span>
                              오답 {q.wrong_count}회 · 정답 {q.correct_count}회
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap break-words font-medium leading-relaxed text-ink">{q.question}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="whitespace-pre-wrap break-words text-ink">
                              <span className="font-semibold">정답</span> {q.answer}
                            </p>
                            {q.explanation && (
                              <p className="whitespace-pre-wrap break-words text-ink-soft">
                                <span className="font-semibold text-ink">해설</span> {q.explanation}
                              </p>
                            )}
                          </div>
                          <div className="mt-3 space-y-1 rounded-md bg-cream-100 p-3 text-xs text-ink-soft">
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
    </div>
  );
}
