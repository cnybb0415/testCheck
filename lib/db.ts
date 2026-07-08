import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let client: Sql | undefined;

// DB 연결은 실제 쿼리가 실행되는 시점에 지연 생성한다.
// (Next.js 빌드의 "Collecting page data" 단계에서 라우트 모듈을 import만 해도
//  DATABASE_URL이 없다는 이유로 빌드가 깨지는 것을 방지하기 위함)
function getClient(): Sql {
  if (!client) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL(또는 POSTGRES_URL) 환경 변수가 설정되지 않았습니다. Neon Postgres 연결 문자열을 .env.local에 추가하세요."
      );
    }
    client = neon(connectionString);
  }
  return client;
}

export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _thisArg, args) {
    return Reflect.apply(getClient() as unknown as (...a: unknown[]) => unknown, undefined, args);
  },
  get(_target, prop) {
    const value = (getClient() as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
