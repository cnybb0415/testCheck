import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { UNITS } from "../lib/types";

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL(또는 POSTGRES_URL) 환경 변수가 필요합니다. .env.local을 확인하세요.");
  }
  const sql = neon(connectionString);

  const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }

  for (const unit of UNITS) {
    await sql`
      INSERT INTO units (number, name)
      VALUES (${unit.number}, ${unit.name})
      ON CONFLICT (number) DO NOTHING
    `;
  }

  console.log(`마이그레이션 완료: 구문 ${statements.length}개 실행, 단원 ${UNITS.length}개 확인`);
}

main().catch((error) => {
  console.error("마이그레이션 실패:", error);
  process.exit(1);
});
