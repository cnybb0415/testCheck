"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Unit {
  id: number;
  number: number;
  name: string;
}

interface CardQuestion {
  id: number;
  unit_name: string;
  year: number | null;
  session: number | null;
  question: string;
  answer: string;
  explanation: string | null;
  keywords: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function CardsPageInner() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source"); // "wrong" 이면 오답노트 기반 약점 집중 모드

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [pool, setPool] = useState<CardQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [queue, setQueue] = useState<CardQuestion[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (source === "wrong") return;
    fetch("/api/units")
      .then((res) => res.json())
      .then(setUnits)
      .catch(() => setUnits([]));
  }, [source]);

  async function loadPool() {
    setLoading(true);
    try {
      if (source === "wrong") {
        const res = await fetch("/api/wrong-notes");
        const data = await res.json();
        setPool(data.questions ?? []);
      } else {
        const params = new URLSearchParams();
        if (selectedUnit) params.set("unit", selectedUnit);
        const res = await fetch(`/api/questions?${params.toString()}`);
        const data = await res.json();
        setPool(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (source === "wrong") {
      loadPool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  function startQuiz() {
    const shuffled = shuffle(pool);
    setQueue(shuffled);
    setTotalCount(shuffled.length);
    setMasteredCount(0);
    setRetryCount(0);
    setFlipped(false);
    setStarted(true);
  }

  const current = queue[0];

  function handleKnown(known: boolean) {
    if (!current) return;

    fetch("/api/card-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: current.id, known: known ? 1 : 0 }),
    }).catch(() => {});

    setFlipped(false);

    if (known) {
      setMasteredCount((c) => c + 1);
      setQueue((q) => q.slice(1));
    } else {
      setRetryCount((c) => c + 1);
      setQueue((q) => [...q.slice(1), q[0]]);
    }
  }

  const isFinished = started && queue.length === 0;

  const progressLabel = useMemo(() => {
    if (!started) return "";
    return `${masteredCount} / ${totalCount}`;
  }, [started, masteredCount, totalCount]);

  if (source === "wrong") {
    if (!started) {
      return (
        <QuizShell title="약점 집중 카드퀴즈" subtitle="오답노트에 있는 문제만 모아서 복습합니다.">
          {loading ? (
            <p className="text-sm text-ink-faint">불러오는 중...</p>
          ) : pool.length === 0 ? (
            <p className="rounded-xl2 bg-white p-6 text-center text-sm text-ink-faint shadow-soft">
              아직 취약 문제가 없습니다. 기출문제를 먼저 풀어보세요.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">총 {pool.length}문제</p>
              <button onClick={startQuiz} className="rounded-md bg-mint-400 px-4 py-2 text-sm font-medium text-white">
                약점 카드 시작하기
              </button>
            </div>
          )}
        </QuizShell>
      );
    }
  } else if (!started) {
    return (
      <QuizShell title="카드퀴즈" subtitle="단원을 고르고 플립 카드로 빠르게 암기하세요.">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="rounded-lg border-none bg-white px-3 py-2 text-sm text-ink shadow-soft"
          >
            <option value="">전체 단원 (셔플)</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.number}>
                {unit.number}. {unit.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadPool}
            className="rounded-lg bg-white px-3 py-2 text-sm text-ink-soft shadow-soft hover:text-ink"
          >
            문제 불러오기
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-ink-faint">불러오는 중...</p>
          ) : pool.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-soft">총 {pool.length}문제</p>
              <button onClick={startQuiz} className="rounded-md bg-mint-400 px-4 py-2 text-sm font-medium text-white">
                카드퀴즈 시작하기
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink-faint">&quot;문제 불러오기&quot;를 눌러 카드 목록을 준비하세요.</p>
          )}
        </div>
      </QuizShell>
    );
  }

  if (isFinished) {
    return (
      <QuizShell title="카드퀴즈 완료" subtitle="이번 세션을 모두 마쳤습니다.">
        <div className="space-y-2 text-sm text-ink-soft">
          <p>총 카드 {totalCount}개를 모두 익혔습니다.</p>
          <p>다시 봐야 했던 횟수: {retryCount}회</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={startQuiz} className="rounded-md bg-white px-4 py-2 text-sm text-ink shadow-soft">
            다시 풀기
          </button>
          <Link href="/" className="rounded-md bg-mint-400 px-4 py-2 text-sm font-medium text-white">
            홈으로
          </Link>
        </div>
      </QuizShell>
    );
  }

  return (
    <QuizShell title={source === "wrong" ? "약점 집중 카드퀴즈" : "카드퀴즈"} subtitle={progressLabel}>
      {current && (
        <div className="flex flex-col items-center">
          <div
            onClick={() => setFlipped((f) => !f)}
            className="flex min-h-[220px] w-full max-w-lg cursor-pointer flex-col justify-center rounded-xl2 bg-white p-8 text-center shadow-card transition-transform hover:-translate-y-0.5"
          >
            <span className="mb-3 text-xs text-ink-faint">{current.unit_name}</span>
            {!flipped ? (
              <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-ink">{current.question}</p>
            ) : (
              <div className="space-y-3 text-left">
                <p className="whitespace-pre-wrap text-ink">
                  <span className="font-semibold">정답</span> {current.answer}
                </p>
                {current.explanation && (
                  <p className="whitespace-pre-wrap text-sm text-ink-soft">
                    <span className="font-semibold text-ink">해설</span> {current.explanation}
                  </p>
                )}
                {current.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {current.keywords.map((k) => (
                      <span key={k} className="rounded bg-mint-50 px-2 py-0.5 text-xs text-mint-600">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <span className="mt-4 text-xs text-ink-faint">
              {flipped ? "카드를 클릭하면 앞면으로" : "카드를 클릭하면 정답 확인"}
            </span>
          </div>

          {flipped && (
            <div className="mt-5 flex gap-3">
              <button onClick={() => handleKnown(false)} className="rounded-md bg-white px-4 py-2 text-sm text-ink-soft shadow-soft hover:text-ink">
                몰랐음
              </button>
              <button
                onClick={() => handleKnown(true)}
                className="rounded-md bg-mint-400 px-4 py-2 text-sm font-medium text-white hover:bg-mint-500"
              >
                알았음
              </button>
            </div>
          )}

          <p className="mt-4 text-xs text-ink-faint">남은 카드: {queue.length}</p>
        </div>
      )}
    </QuizShell>
  );
}

function QuizShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <span className="text-sm text-ink-faint">{subtitle}</span>}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function CardsPage() {
  return (
    <Suspense>
      <CardsPageInner />
    </Suspense>
  );
}
