import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "en",
  // 로컬 dev(http)에서는 Secure 쿠키가 저장되지 않으므로 production에서만 켠다
  // (admin 세션 쿠키의 secure 조건과 동일한 패턴, src/lib/session.ts 참고)
  localeCookie: {
    secure: process.env.NODE_ENV === "production",
  },
});

export type Locale = (typeof routing.locales)[number];
