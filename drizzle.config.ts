import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// 마이그레이션은 풀링 없는 직접 연결(DATABASE_URL_UNPOOLED)로 실행 — CLAUDE.md 환경변수 절 참고.
export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
