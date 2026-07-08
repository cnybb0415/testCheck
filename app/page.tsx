import Link from "next/link";

const FEATURES = [
  {
    href: "/exam",
    title: "기출문제 풀기",
    description: "단원별 / 연도별 / 회차별로 필터링해서 문제를 풀고 정답을 확인합니다.",
    ready: true,
  },
  {
    href: "/cards",
    title: "카드퀴즈",
    description: "단원별 플립 카드로 핵심 개념을 빠르게 암기합니다.",
    ready: true,
  },
  {
    href: "/daily",
    title: "오늘의 문제",
    description: "자주 틀린 문제를 우선으로 매일 랜덤 문제 세트를 풉니다.",
    ready: true,
  },
  {
    href: "/wrong-notes",
    title: "오답노트",
    description: "틀렸던 문제를 모아 원인을 분석하고 다시 복습합니다.",
    ready: true,
  },
  {
    href: "/guide",
    title: "학습 가이드",
    description: "시험 개요, 단기 합격 전략, 추천 자료와 내 약점 요약을 확인합니다.",
    ready: true,
  },
  {
    href: "/dashboard",
    title: "학습 진도 대시보드",
    description: "단원별 정답률과 최근 학습 기록을 한눈에 확인합니다.",
    ready: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16 sm:px-12">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold sm:text-3xl">정보처리기사 실기 학습</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          단원별 카드퀴즈, 기출문제 풀이, 오답노트, 학습 대시보드를 한 곳에서 관리합니다.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) =>
            feature.ready ? (
              <Link
                key={feature.href}
                href={feature.href}
                className="rounded-lg border border-black/10 p-5 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
              >
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">{feature.description}</p>
              </Link>
            ) : (
              <div
                key={feature.href}
                className="rounded-lg border border-dashed border-black/10 p-5 opacity-50 dark:border-white/15"
              >
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">{feature.description}</p>
                <span className="mt-3 inline-block text-xs font-medium text-black/40 dark:text-white/40">준비 중</span>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
