# 정보처리기사 실기 학습 사이트

정보처리기사 실기 시험 대비용 개인 학습 웹앱. 단원별 카드퀴즈, 기출문제 풀기, 오늘의 문제, 오답노트, 학습 진도 대시보드를 제공한다.

## 기술 스택

- Frontend / Backend: Next.js 14 (App Router)
- DB: Neon Postgres (`@neondatabase/serverless`)
- Validation: Zod
- 배포: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. DB 연결 설정

Vercel Storage(또는 [neon.com](https://neon.com))에서 Postgres 데이터베이스를 만들고, 연결 문자열을 `.env.local`에 넣는다. `.env.local.example`을 복사해서 사용하면 된다.

```bash
cp .env.local.example .env.local
# DATABASE_URL 값을 실제 Neon 연결 문자열로 교체
```

Vercel 프로젝트에 DB를 연결해뒀다면 아래 명령으로도 받을 수 있다.

```bash
vercel env pull .env.local
```

### 3. 스키마 마이그레이션 + 시드 데이터 삽입

```bash
npm run db:migrate   # 테이블 생성 + 5개 단원 등록
npm run db:seed      # 단원별 연습문제 50개 삽입 (data/seed-questions.json)
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 폴더 구조

```
app/
  api/
    units/route.ts             # GET  단원 목록
    questions/route.ts         # GET  문제 목록 (unit/year/session 필터)
    questions/import/route.ts  # POST 문제 JSON 배열 import
lib/
  schema.sql            # Postgres 스키마
  db.ts                 # Neon 커넥션 (sql 태그드 템플릿)
  types.ts              # 타입 정의 + zod import 스키마
  import-questions.ts   # seed 스크립트/import API가 공유하는 upsert 로직
scripts/
  migrate.ts             # npm run db:migrate
  seed.ts                 # npm run db:seed
data/
  seed-questions.json     # 단원별 연습문제 50개 (source: "practice")
```

## DB 스키마 개요

- `units` — 5개 단원 (소프트웨어 설계 / 개발, 데이터베이스 구축, 프로그래밍 언어 활용, 정보시스템 구축 관리)
- `questions` — 문제 본체. `source`는 `exam`(검증된 기출) / `practice`(연습문제) / `imported`(사용자 추가)로 구분
- `attempts` — 채점 기록 (`mode`: exam/card/daily) — 오답노트·대시보드 집계의 기반
- `card_progress` — 카드퀴즈 알았음/몰랐음 상태
- `daily_questions` — 날짜별로 고정된 오늘의 문제 세트

## 문제 데이터 추가하기

`POST /api/questions/import`에 아래 형식의 JSON 배열을 보내면 된다. 동일한 `(unit, year, session, question)` 조합은 자동으로 건너뛴다.

```json
[
  {
    "unit": 1,
    "year": 2023,
    "session": 2,
    "type": "단답형",
    "question": "...",
    "answer": "...",
    "explanation": "...",
    "keywords": ["..."],
    "source": "exam"
  }
]
```

## 참고

`data/seed-questions.json`의 50문제는 실기 출제 범위를 반영해 만든 연습문제이며, 실제 기출 원문이 아니다(`source: "practice"`). 검증된 기출문제는 위 import API로 추가하면 된다.

## Vercel 배포

1. GitHub 저장소를 Vercel에 Import
2. Storage 탭에서 Neon Postgres 생성 후 프로젝트에 연결 (`DATABASE_URL` 자동 주입)
3. 최초 1회 로컬 또는 Vercel CLI에서 `npm run db:migrate`, `npm run db:seed` 실행
4. Deploy
