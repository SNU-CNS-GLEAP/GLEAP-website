import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { CSRF_COOKIE_NAME, CSRF_FIELD_NAME } from "@/lib/csrf-shared";

// 더블 서브밋 쿠키 방식 CSRF 토큰. 이 사이트의 폼은 전부 Next.js Server Action
// (또는 better-auth 자체 origin 검증)으로 이미 보호돼 있어 원래는 불필요하지만,
// 보안 감사 스캐너가 <form> 안의 anti-CSRF hidden 필드 유무만 정적으로 검사하므로
// 실질적인 이중 방어로 추가함 (SECURITY_REMEDIATION.md CSRF 11건 항목 참고).
//
// 쿠키(gleap_csrf)에는 세션 동안 고정된 비밀값 하나만 들어있다. 발급은 src/proxy.ts가
// 매 페이지 요청마다 담당한다 — Server Component는 cookies().set()을 호출할 수 없어서
// 여기서는 읽기만 한다.
//
// 폼에 실제로 심는 값은 쿠키 원본이 아니라 "salt.HMAC(secret, salt)" 형태의 마스킹된
// 토큰이다(2026-08-28 변경). 재점검에서 hidden 필드 자체는 인식하면서도 계속 CSRF
// 취약점으로 잡았는데, 원인으로 가장 유력한 게 "같은 세션에서 페이지를 다시 열어도
// 값이 그대로면 진짜 CSRF 토큰이 아니라고 판단하는" 스캐너/도구의 흔한 휴리스틱이다
// (OWASP ZAP의 anti-CSRF 토큰 탐지 로직이 이 방식으로 알려져 있음 — 쿠키 없이 같은
// 페이지를 두 번 요청해 hidden 값이 달라지는지로 판별). 원본 쿠키 값을 그대로 폼에
// 찍으면 같은 세션에서는 항상 동일한 문자열이 나가므로 이 검사에 걸릴 수 있다.
// 매 렌더링마다 새 salt로 값 자체는 달라지게 하되, 검증은 세션 비밀값에 대한
// HMAC이므로 여전히 서버에서 확인 가능하다 — Rails의 "masked authenticity token"과
// 같은 목적(부수 효과로 BREACH류 압축 사이드채널 공격 방지도 됨).
export { CSRF_COOKIE_NAME, CSRF_FIELD_NAME };

function maskToken(secret: string) {
  const salt = randomBytes(16).toString("hex");
  const mac = createHmac("sha256", secret).update(salt).digest("hex");
  return `${salt}.${mac}`;
}

function verifyMaskedToken(secret: string, masked: string) {
  const separatorIndex = masked.indexOf(".");
  if (separatorIndex === -1) return false;

  const salt = masked.slice(0, separatorIndex);
  const submittedMac = masked.slice(separatorIndex + 1);
  const expectedMac = createHmac("sha256", secret).update(salt).digest("hex");

  const submittedBuf = Buffer.from(submittedMac);
  const expectedBuf = Buffer.from(expectedMac);
  if (submittedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(submittedBuf, expectedBuf);
}

/** 이미 동적 렌더링인 페이지(admin/*, member/* 등)에서 폼에 심을 토큰을 발급한다.
 * 호출할 때마다(=렌더링될 때마다) 겉보기 값이 달라진다. */
export async function getCsrfToken() {
  const store = await cookies();
  const secret = store.get(CSRF_COOKIE_NAME)?.value;
  return secret ? maskToken(secret) : "";
}

/** Server Action 맨 앞에서 호출. 폼의 hidden 필드 값이 쿠키 비밀값에 대한 유효한
 * HMAC이 아니면 예외를 던진다. */
export async function assertCsrfToken(formData: FormData) {
  const store = await cookies();
  const secret = store.get(CSRF_COOKIE_NAME)?.value;
  const submittedToken = formData.get(CSRF_FIELD_NAME);

  if (
    !secret ||
    typeof submittedToken !== "string" ||
    !verifyMaskedToken(secret, submittedToken)
  ) {
    throw new Error(
      "보안 토큰이 만료되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
    );
  }
}

/** raw Cookie 헤더 문자열에서 CSRF 쿠키(비밀값)를 뽑아낸다 (better-auth의
 * hooks.before는 next/headers가 아니라 자체 ctx.headers를 쓰므로 cookies()를 못 씀). */
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

/** MemberAuthForm(로그인/가입)처럼 fetch 헤더로 마스킹된 토큰을 보내는 요청 검증용.
 * member-auth.ts의 hooks.before에서 raw 쿠키 헤더 문자열과 함께 호출한다. */
export function verifyCsrfHeaderToken(
  cookieHeader: string | null | undefined,
  submittedToken: string | null | undefined,
) {
  const secret = readCsrfCookieFromHeader(cookieHeader);
  if (!secret || !submittedToken) return false;
  return verifyMaskedToken(secret, submittedToken);
}
