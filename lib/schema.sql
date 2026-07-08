-- 정보처리기사 실기 학습 사이트 DB 스키마 (Postgres / Neon)

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL
);

-- 기출/연습 문제
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER NOT NULL REFERENCES units(id),
  year INTEGER,
  session INTEGER,
  type TEXT NOT NULL CHECK (type IN ('단답형', '서술형', '코드')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb, -- 카드퀴즈용 핵심 키워드
  source TEXT NOT NULL DEFAULT 'practice' CHECK (source IN ('exam', 'practice', 'imported')),
  last_seen_at TIMESTAMPTZ, -- 랜덤 혼합 출제 가중치 계산용 (추후 사용)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 문제 풀이 기록 (오답노트 / 대시보드 집계의 기반)
CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  is_correct SMALLINT NOT NULL CHECK (is_correct IN (0, 1)),
  user_answer TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('exam', 'card', 'daily')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 카드퀴즈 진행 상태 (알았음/몰랐음)
CREATE TABLE IF NOT EXISTS card_progress (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  known SMALLINT NOT NULL CHECK (known IN (0, 1)),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 오늘의 문제 (날짜별로 고정된 랜덤 문제 셋)
CREATE TABLE IF NOT EXISTS daily_questions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE(date, question_id)
);

CREATE INDEX IF NOT EXISTS idx_questions_unit ON questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_questions_year_session ON questions(year, session);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_attempted_at ON attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_card_progress_question ON card_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON daily_questions(date);
