"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  Layers,
  CalendarCheck,
  AlertCircle,
  Compass,
  BarChart3,
  ArrowUpRight,
  Flame,
} from "lucide-react";

const FEATURES = [
  {
    href: "/exam",
    title: "기출문제 풀기",
    description: "단원 / 연도 / 회차별로 필터링해서 문제를 풀고 정답을 확인합니다.",
    icon: BookOpenCheck,
    bg: "bg-mint-100",
    iconBg: "bg-mint-400",
  },
  {
    href: "/cards",
    title: "카드퀴즈",
    description: "단원별 플립 카드로 핵심 개념을 빠르게 암기합니다.",
    icon: Layers,
    bg: "bg-cream-100",
    iconBg: "bg-cream-200",
  },
  {
    href: "/daily",
    title: "오늘의 문제",
    description: "자주 틀린 문제를 우선으로 매일 랜덤 문제 세트를 풉니다.",
    icon: CalendarCheck,
    bg: "bg-sky-100",
    iconBg: "bg-sky-200",
  },
  {
    href: "/wrong-notes",
    title: "오답노트",
    description: "틀렸던 문제를 모아 원인을 분석하고 다시 복습합니다.",
    icon: AlertCircle,
    bg: "bg-rose-100",
    iconBg: "bg-rose-200",
  },
  {
    href: "/guide",
    title: "학습 가이드",
    description: "시험 개요, 단기 합격 전략, 추천 자료와 내 약점 요약을 확인합니다.",
    icon: Compass,
    bg: "bg-lavender-100",
    iconBg: "bg-lavender-200",
  },
  {
    href: "/dashboard",
    title: "학습 진도 대시보드",
    description: "단원별 정답률과 최근 학습 기록을 한눈에 확인합니다.",
    icon: BarChart3,
    bg: "bg-peach-100",
    iconBg: "bg-peach-200",
  },
];

interface DashboardSummary {
  summary: {
    total_questions: number;
    attempted_questions: number;
    total_attempts: number;
    correct_attempts: number;
  };
  unitStats: { id: number; number: number; name: string; accuracy: number | null }[];
  recentAttempts: { id: number; is_correct: 0 | 1; question: string; attempted_at: string }[];
}

export default function Home() {
  const [data, setData] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const accuracy =
    data && data.summary.total_attempts > 0
      ? Math.round((data.summary.correct_attempts / data.summary.total_attempts) * 100)
      : null;

  const weakest = data?.unitStats
    ? [...data.unitStats].filter((u) => u.accuracy !== null).sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))[0]
    : null;

  const today = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-faint">{today}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">정보처리기사 실기 학습</h1>
        <p className="mt-2 text-sm text-ink-soft">
          단원별 카드퀴즈, 기출문제 풀이, 오답노트, 학습 대시보드를 한 곳에서 관리합니다.
        </p>

        <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-faint">둘러보기</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group relative overflow-hidden rounded-xl2 ${feature.bg} p-5 shadow-soft transition-transform hover:-translate-y-0.5`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${feature.iconBg} text-white`}>
                  <Icon size={19} />
                </div>
                <h2 className="mt-4 font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{feature.description}</p>
                <ArrowUpRight
                  size={18}
                  className="absolute right-4 top-4 text-ink/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden w-[280px] shrink-0 flex-col gap-4 lg:flex">
        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mint-400 text-lg font-bold text-white">
              정
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">오늘도 화이팅!</p>
              <p className="text-xs text-ink-faint">꾸준함이 합격을 만듭니다</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold text-ink-faint">전체 정답률</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold text-ink">{accuracy ?? "-"}</span>
            <span className="pb-1 text-sm text-ink-faint">{accuracy !== null ? "%" : ""}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mint-50">
            <div className="h-full rounded-full bg-mint-400" style={{ width: `${accuracy ?? 0}%` }} />
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            {data ? `총 ${data.summary.total_attempts}회 시도 · ${data.summary.attempted_questions}/${data.summary.total_questions}문제 커버` : "불러오는 중..."}
          </p>
        </div>

        {weakest && (
          <div className="rounded-xl2 bg-rose-100 p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-rose-200" />
              <p className="text-xs font-semibold text-ink-soft">지금 신경 써야 할 단원</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">
              {weakest.number}. {weakest.name}
            </p>
            <p className="text-xs text-ink-faint">정답률 {weakest.accuracy}%</p>
            <Link
              href="/cards?source=wrong"
              className="mt-3 inline-block rounded-md bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-soft"
            >
              약점 카드로 복습 →
            </Link>
          </div>
        )}

        <div className="rounded-xl2 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold text-ink-faint">최근 채점 기록</p>
          <div className="mt-3 space-y-2.5">
            {data?.recentAttempts.length ? (
              data.recentAttempts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.is_correct ? "bg-mint-400" : "bg-rose-200"}`}
                  />
                  <p className="line-clamp-1 text-ink-soft">{a.question}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-faint">아직 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
