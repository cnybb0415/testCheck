"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WeakUnit {
  id: number;
  number: number;
  name: string;
  total_attempts: number;
  accuracy: number | null;
}

export default function GuidePage() {
  const [weakUnits, setWeakUnits] = useState<WeakUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wrong-notes")
      .then((res) => res.json())
      .then((data) => setWeakUnits(data.weakUnits ?? []))
      .catch(() => setWeakUnits([]))
      .finally(() => setLoading(false));
  }, []);

  const attempted = weakUnits.filter((u) => u.total_attempts > 0);
  const weakest = [...attempted].sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100)).slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">학습 가이드</h1>
      <p className="mt-1 text-sm text-ink-soft">정보처리기사 실기 시험 정보와 단기 합격 전략을 정리했습니다.</p>

      {!loading && attempted.length > 0 && (
        <section className="mt-6 rounded-xl2 bg-cream-100 p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-ink">지금 가장 신경 써야 할 단원</h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {weakest.map((u) => (
              <li key={u.id}>
                {u.number}. {u.name} — 정답률 {u.accuracy}% ({u.total_attempts}문제 시도)
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3 text-sm">
            <Link href="/wrong-notes" className="rounded-md bg-white px-3 py-1.5 font-medium text-ink shadow-soft">
              오답노트 보기
            </Link>
            <Link href="/cards?source=wrong" className="rounded-md bg-mint-400 px-3 py-1.5 font-medium text-white">
              약점 카드로 복습
            </Link>
          </div>
        </section>
      )}

      <section className="mt-8 rounded-xl2 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">시험 개요</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <li>· 시험 시간 150분(2시간 30분), 주관식 20문항, 100점 만점, 60점(약 12문항) 이상 합격</li>
          <li>· 문제 유형은 단답형(단어 답)과 약술형(한두 문장 서술형) 위주</li>
          <li>· 2022년 이후로는 채점 편의상 단답형·선택형 비중이 높아지는 추세</li>
          <li>· 계산 문제를 제외하면 대부분 부분점수가 존재 (예: 답 2개 중 1개만 맞아도 절반 인정)</li>
          <li>· 정답·채점기준은 비공개 — 정확하고 간결하게, 서술형은 관련 개념을 덧붙여 조금 더 자세히 쓰는 것이 유리</li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">과목별 배점 (참고용, 회차마다 변동 가능)</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <li>· 알고리즘(프로그래밍 언어 활용) 25점</li>
          <li>· 데이터베이스 구축 25점</li>
          <li>· 업무프로세스(소프트웨어 설계/개발) 15점</li>
          <li>· 전산영어 10점</li>
          <li>· IT 신기술 동향 및 시스템 관리(정보시스템 구축 관리) 25점</li>
        </ul>
        <p className="mt-2 text-xs text-ink-faint">
          데이터베이스와 소프트웨어 설계는 필기·실기 모두 비중이 크고, 네트워크·IT 법규는 상대적으로 비중이 낮습니다.
        </p>
      </section>

      <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">단기간(4~6주) 합격 전략</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>
            <span className="font-medium text-ink">눈으로 읽지 말고 직접 풀기.</span> 실기는 주관식이라 &quot;아는 것 같다&quot;와 &quot;답을 쓸 수 있다&quot;는 다릅니다.
            이 사이트의 기출문제 풀기/카드퀴즈로 매번 직접 답을 적어보세요.
          </li>
          <li>
            <span className="font-medium text-ink">100점이 아니라 60점(12문항)을 목표로 설계.</span> 자신 있는 단원부터 확실히 잡고,
            약점 단원은 오답노트에서 반복 노출시키는 방식이 효율적입니다.
          </li>
          <li>
            <span className="font-medium text-ink">비전공자는 코드/SQL 트레이싱에 가장 많은 시간을 배정.</span>
            C/Java/Python 기본 문법 → 제어문·함수·배열·포인터·클래스 순으로 한 줄씩 손으로 따라가며 결과를 예측하는 연습이 핵심입니다.
          </li>
          <li>
            <span className="font-medium text-ink">쉬운 회차를 노리기보다 어떤 회차든 60점을 넘기는 실력을 목표.</span>
            특정 회차가 어려우면 다음 회차가 쉬워지는 경향이 있지만, 난이도를 예측해 전략을 짜는 것보다 기본기를 확실히 하는 편이 안전합니다.
          </li>
          <li>
            <span className="font-medium text-ink">매일 오늘의 문제 + 약점 카드퀴즈로 짧게 반복.</span> 한 번에 몰아서 푸는 것보다
            매일 조금씩, 특히 오답노트에 쌓인 문제를 반복 노출시키는 것이 단기 암기에 효과적입니다.
          </li>
        </ol>
      </section>

      <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">답안 작성 팁</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <li>· 채점관이 알아보기 쉽게 글씨를 또박또박 쓰기 (오타/악필로 인한 감점 방지)</li>
          <li>· 서술형은 핵심 답 + 관련 개념 한 줄을 덧붙이면 부분점수에 유리</li>
          <li>· 계산 문제는 풀이 과정을 반드시 남기기 (풀이가 틀리면 0점, 과정이 맞고 답만 틀리면 부분점수 가능)</li>
          <li>· 모르는 문제도 관련 키워드를 최대한 적어 부분점수를 노리기</li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-ink">참고할 만한 자료</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a href="https://www.youtube.com/@weekendcode" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline">
              주말코딩 (YouTube)
            </a>
            <p className="text-ink-soft">
              비전공자 대상으로 핵심만 짚어주는 실기 강의. 인프런 &quot;일주일만에 합격하는 정보처리기사 실기&quot; 강좌도 함께 운영.
            </p>
          </li>
          <li>
            <a
              href="https://www.inflearn.com/course/%EC%9D%BC%EC%A3%BC%EC%9D%BC%EB%A7%8C%EC%97%90-%ED%95%A9%EA%B2%A9%ED%95%98%EB%8A%94-%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EA%B8%B0%EC%82%AC-%EC%8B%A4%EA%B8%B0"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline"
            >
              일주일만에 합격하는 정보처리기사 실기 (인프런)
            </a>
            <p className="text-ink-soft">단기 합격 후기가 많이 언급되는 강좌.</p>
          </li>
          <li>
            <a href="https://namu.wiki/w/정보처리기사/출제경향" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline">
              나무위키 · 정보처리기사/출제경향
            </a>
            <p className="text-ink-soft">과목별 출제 비중과 최근 경향을 정리한 문서.</p>
          </li>
          <li>
            <a href="https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1320" target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline">
              Q-net · 정보처리기사 국가자격 상세정보
            </a>
            <p className="text-ink-soft">공식 출제기준, 시행 일정 등 원본 자료.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
