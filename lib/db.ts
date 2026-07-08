import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL(또는 POSTGRES_URL) 환경 변수가 설정되지 않았습니다. Neon Postgres 연결 문자열을 .env.local에 추가하세요."
  );
}

export const sql: NeonQueryFunction<false, false> = neon(connectionString);
