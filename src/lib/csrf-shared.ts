// 클라이언트 컴포넌트에서도 쓰는 상수만 모아둔 파일. 토큰 발급/검증 로직(src/lib/csrf.ts)은
// "server-only"라 클라이언트 컴포넌트(MemberAuthForm 등)에서 직접 import할 수 없어 분리함.
export const CSRF_COOKIE_NAME = "gleap_csrf";
export const CSRF_FIELD_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";
