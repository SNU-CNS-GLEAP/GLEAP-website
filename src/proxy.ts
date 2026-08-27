import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { CSRF_COOKIE_NAME } from "@/lib/csrf-shared";

const handleI18nRouting = createMiddleware(routing);

function generateCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function proxy(request: NextRequest) {
  const existingCsrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const csrfToken = existingCsrfToken ?? generateCsrfToken();

  if (!existingCsrfToken) {
    // next-intl이 리다이렉트/리라이트할 때 내부적으로 `new Headers(request.headers)`로
    // 복사해 넘기므로(node_modules/next-intl/.../middleware.js `next()` 참고), 여기서
    // cookie 헤더를 먼저 채워두면 같은 요청의 Server Component에서 cookies()로 바로
    // 읽을 수 있다 — 그렇지 않으면 첫 방문(쿠키가 아직 없는 요청)에 폼에 빈 토큰이
    // 찍혀서 그 요청의 제출이 항상 실패하는 문제가 생긴다.
    const existingCookieHeader = request.headers.get("cookie") ?? "";
    request.headers.set(
      "cookie",
      existingCookieHeader
        ? `${existingCookieHeader}; ${CSRF_COOKIE_NAME}=${csrfToken}`
        : `${CSRF_COOKIE_NAME}=${csrfToken}`,
    );
  }

  const response = handleI18nRouting(request);

  if (!existingCsrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
