// drizzle-kit의 `migrate` CLI 대신 이 스크립트를 쓴다.
//
// `drizzle-kit migrate`는 postgresql 다이얼렉트에서 Neon 호스트를 감지하면 내부적으로
// 웹소켓 기반 연결(@neondatabase/serverless의 Pool/Client)로 전환하는데, Vercel의 빌드
// 샌드박스는 아웃바운드 웹소켓을 막아둔 것으로 보인다(로컬에서는 성공, Vercel 빌드에서만
// "can only connect ... through a websocket" 경고 뒤 실패 — 2026-08-28 확인). 반면 앱
// 런타임이 실제로 쓰는 `drizzle-orm/neon-http`는 순수 HTTPS(fetch)라 이 제약이 없다.
// 그래서 마이그레이션도 같은 neon-http 드라이버로, drizzle-orm이 제공하는 migrate()
// 함수를 직접 호출한다 — 웹소켓을 전혀 쓰지 않으므로 빌드/런타임 어디서든 동작한다.
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });

const db = drizzle(process.env.DATABASE_URL_UNPOOLED);

try {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[db:migrate] migrations applied successfully");
} catch (err) {
  console.error("[db:migrate] failed:", err);
  process.exit(1);
}
