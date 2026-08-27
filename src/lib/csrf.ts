import "server-only";
import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { CSRF_COOKIE_NAME, CSRF_FIELD_NAME } from "@/lib/csrf-shared";

// 더블 서브밋 쿠키 방식 CSRF 토큰. 이 사이트의 폼은 전부 Next.js Server Action
// (또는 better-auth 자체 origin 검증)으로 이미 보호돼 있어 원래는 불필요하지만,
// 보안 감사 스캐너가 <form> 안의 anti-CSRF hidden 필드 유무만 정적으로 검사하므로
// 실질적인 이중 방어로 추가함 (SECURITY_REMEDIATION.md CSRF 11건 항목 참고).
//
// 토큰 발급은 src/proxy.ts가 매 페이지 요청마다 담당한다 — Server Component는
// cookies().set()을 호출할 수 없어서 여기서는 읽기만 한다.
export { CSRF_COOKIE_NAME, CSRF_FIELD_NAME };

/** 이미 동적 렌더링인 페이지(admin/*, member/* 등)에서 폼에 심을 토큰을 읽는다. */
export async function getCsrfToken() {
  const store = await cookies();
  return store.get(CSRF_COOKIE_NAME)?.value ?? "";
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Server Action 맨 앞에서 호출. 폼의 hidden 필드 값이 쿠키와 다르면 예외를 던진다. */
export async function assertCsrfToken(formData: FormData) {
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE_NAME)?.value;
  const submittedToken = formData.get(CSRF_FIELD_NAME);

  if (
    !cookieToken ||
    typeof submittedToken !== "string" ||
    !safeEqual(cookieToken, submittedToken)
  ) {
    throw new Error(
      "보안 토큰이 만료되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
    );
  }
}

/** raw Cookie 헤더 문자열에서 CSRF 쿠키 값을 뽑아낸다 (better-auth의 hooks.before는
 * next/headers가 아니라 자체 ctx.headers를 쓰므로 cookies()를 못 씀. member-auth.ts에서 씀). */
export function readCsrfCookieFromHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim();
    if (key === CSRF_COOKIE_NAME) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }
  return undefined;
}
