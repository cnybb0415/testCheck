import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "fs";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { importQuestions } from "../lib/import-questions";

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL(또는 POSTGRES_URL) 환경 변수가 필요합니다. .env.local을 확인하세요.");
  }
  const sql: NeonQueryFunction<false, false> = neon(connectionString);

  const dataDir = path.join(process.cwd(), "data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json")).sort();

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
    const result = await importQuestions(sql, raw);
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    console.log(`  ${file}: ${result.inserted}개 추가, ${result.skipped}개 건너뜀(중복)`);
  }

  console.log(`시드 완료: 총 ${totalInserted}개 추가, ${totalSkipped}개 건너뜀(중복)`);
}

main().catch((error) => {
  console.error("시드 실패:", error);
  process.exit(1);
});
