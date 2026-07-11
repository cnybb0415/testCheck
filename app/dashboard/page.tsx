"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Summary {
  total_questions: number;
  attempted_questions: number;
  total_attempts: number;
  correct_attempts: number;
}

interface UnitStat {
  id: number;
  number: number;
  name: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number | null;
}

interface ModeStat {
  mode: "exam" | "card" | "daily";
  total_attempts: number;
  correct_attempts: number;
}

interface CardStat {
  known: 0 | 1;
  count: number;
}

interface DayActivity {
  day: string;
  total_attempts: number;
  correct_attempts: number;
}

interface RecentAttempt {
  id: number;
  is_correct: 0 | 1;
  mode: "exam" | "card" | "daily";
  attempted_at: string;
  question: string;
  unit_number: number;
  unit_name: string;
}

interface DashboardData {
  summary: Summary;
  unitStats: UnitStat[];
  modeStats: ModeStat[];
  cardStats: CardStat[];
  dailyActivity: DayActivity[];
  recentAttempts: RecentAttempt[];
}

const MODE_LABELS: Record<ModeStat["mode"], string> = {
  exam: "기출문제 풀기",
  card: "카드퀴즈",
  daily: "오늘의 문제",
};

function last14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const activityByDay = useMemo(() => {
    const map = new Map<string, DayActivity>();
    data?.dailyActivity.forEach((d) => map.set(d.day, d));
    return last14Days().map((day) => map.get(day) ?? { day, total_attempts: 0, correct_attempts: 0 });
  }, [data]);

  const maxDayAttempts = Math.max(1, ...activityByDay.map((d) => d.total_attempts));

  const overallAccuracy = data && data.summary.total_attempts > 0
    ? Math.round((data.summary.correct_attempts / data.summary.total_attempts) * 1000) / 10
    : null;

  const coverage = data && data.summary.total_questions > 0
    ? Math.round((data.summary.attempted_questions / data.summary.total_questions) * 1000) / 10
    : null;

  const knownCount = data?.cardStats.find((c) => c.known === 1)?.count ?? 0;
  const unknownCount = data?.cardStats.find((c) => c.known === 0)?.count ?? 0;
  const totalCardReviewed = knownCount + unknownCount;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">학습 진도 대시보드</h1>
      <p className="mt-1 text-sm text-ink-soft">단원별 정답률과 최근 학습 기록을 한눈에 확인합니다.</p>

      {loading || !data ? (
        <p className="mt-8 text-sm text-ink-faint">불러오는 중...</p>
      ) : data.summary.total_attempts === 0 ? (
        <p className="mt-8 rounded-xl2 bg-white p-6 text-center text-sm text-ink-faint shadow-soft">
          아직 채점 기록이 없습니다. 기출문제 풀기, 카드퀴즈, 오늘의 문제를 진행해보세요.
        </p>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl2 bg-mint-100 p-4 shadow-soft">
              <p className="text-xs text-ink-soft">전체 정답률</p>
              <p className="mt-1 text-xl font-bold text-ink">{overallAccuracy ?? "-"}%</p>
            </div>
            <div className="rounded-xl2 bg-cream-100 p-4 shadow-soft">
              <p className="text-xs text-ink-soft">총 시도 횟수</p>
              <p className="mt-1 text-xl font-bold text-ink">{data.summary.total_attempts}</p>
            </div>
            <div className="rounded-xl2 bg-sky-100 p-4 shadow-soft">
              <p className="text-xs text-ink-soft">문제 커버리지</p>
              <p className="mt-1 text-xl font-bold text-ink">
                {data.summary.attempted_questions}/{data.summary.total_questions}
              </p>
              <p className="text-xs text-ink-faint">{coverage ?? 0}%</p>
            </div>
            <div className="rounded-xl2 bg-lavender-100 p-4 shadow-soft">
              <p className="text-xs text-ink-soft">카드 암기 완료</p>
              <p className="mt-1 text-xl font-bold text-ink">
                {knownCount}/{totalCardReviewed || 0}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink-soft">단원별 정답률</h2>
            <div className="mt-3 space-y-2">
              {data.unitStats.map((u) => {
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

          <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink-soft">최근 14일 학습 활동</h2>
            <div className="mt-3 overflow-x-auto">
              <div className="flex min-w-[480px] items-end gap-1.5 sm:min-w-0">
                {activityByDay.map((d) => {
                  const height = Math.max(4, (d.total_attempts / maxDayAttempts) * 64);
                  const dayLabel = d.day.slice(5).replace("-", "/");
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        title={`${dayLabel}: ${d.total_attempts}문제 (정답 ${d.correct_attempts})`}
                        className={`w-full rounded-sm ${d.total_attempts > 0 ? "bg-mint-400" : "bg-mint-50"}`}
                        style={{ height: `${height}px` }}
                      />
                      <span className="text-[10px] text-ink-faint">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink-soft">학습 모드별 기록</h2>
            <div className="mt-3 space-y-2">
              {(["exam", "card", "daily"] as const).map((mode) => {
                const stat = data.modeStats.find((m) => m.mode === mode);
                const total = stat?.total_attempts ?? 0;
                const correct = stat?.correct_attempts ?? 0;
                const accuracy = total > 0 ? Math.round((correct / total) * 1000) / 10 : null;
                return (
                  <div key={mode} className="flex items-center justify-between rounded-lg bg-mint-50 px-4 py-2.5 text-sm">
                    <span className="font-medium text-ink">{MODE_LABELS[mode]}</span>
                    <span className="text-ink-soft">
                      {total}회 시도 {accuracy !== null ? `· 정답률 ${accuracy}%` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-soft">최근 채점 기록</h2>
            <Link href="/wrong-notes" className="text-xs text-ink-faint hover:text-ink hover:underline">
              오답노트 전체 보기 →
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {data.recentAttempts.length === 0 ? (
              <p className="text-sm text-ink-faint">아직 채점 기록이 없습니다.</p>
            ) : (
              data.recentAttempts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl2 bg-white p-3 text-sm shadow-soft">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                      a.is_correct ? "bg-mint-100 text-mint-600" : "bg-rose-100 text-ink"
                    }`}
                  >
                    {a.is_correct ? "정답" : "오답"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{a.question}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {a.unit_number}. {a.unit_name} · {MODE_LABELS[a.mode]} · {new Date(a.attempted_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
