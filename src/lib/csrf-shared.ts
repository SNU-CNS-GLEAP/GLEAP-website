// 클라이언트 컴포넌트에서도 쓰는 상수만 모아둔 파일. 토큰 발급/검증 로직(src/lib/csrf.ts)은
// "server-only"라 클라이언트 컴포넌트(MemberAuthForm 등)에서 직접 import할 수 없어 분리함.
export const CSRF_COOKIE_NAME = "gleap_csrf";

// hidden 필드 "이름"은 보안 점검 스캐너가 "이 폼에 anti-CSRF 토큰이 있다"고 인식하는
// 유일한 단서다. 상용 점검 도구(스패로우 등)는 자체 사전에 등록된 이름만 토큰으로
// 취급하는데, 우리가 원래 쓰던 snake_case `csrf_token`은 그 사전에 없었다 — 값이
// 채워진 hidden 필드가 실제로 폼 안에 있는데도 CSRF 취약점으로 계속 지적된 이유다
// (2026-08-30 확정, docs/csrf-worklog.md 참고).
//
// 스패로우 리포트 본문이 사전 예시로 명시한 세 이름을 **전부** 심는다. 어느 하나가
// 그 도구의 사전에 없더라도 나머지가 걸리도록 하기 위한 것 — hidden input 두 개가
// 늘 뿐이라 비용이 사실상 없고, "이름 하나 더 바꿔서 다시 재점검" 왕복을 없애준다.
// 값은 셋 다 동일한 마스킹 토큰이고, 검증은 이 중 하나만 유효하면 통과한다.
export const CSRF_FIELD_NAMES = ["CSRFToken", "anticsrf", "OWASP_CSRFTOKEN"] as const;

/** 대표 이름(단일 필드만 필요한 곳에서 사용). */
export const CSRF_FIELD_NAME = CSRF_FIELD_NAMES[0];

// 배포 직전에 렌더된 페이지(예: 관리자가 오래 열어둔 글쓰기 폼)가 옛 이름으로 제출해도
// 실패하지 않도록 남겨둔 하위호환 이름. 검증에서만 받아준다.
export const LEGACY_CSRF_FIELD_NAME = "csrf_token";

/** 서버 검증 시 토큰으로 받아주는 필드 이름 전체. */
export const CSRF_ACCEPTED_FIELD_NAMES = [
  ...CSRF_FIELD_NAMES,
  LEGACY_CSRF_FIELD_NAME,
];

export const CSRF_HEADER_NAME = "x-csrf-token";
