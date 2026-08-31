// 클라이언트 컴포넌트에서도 쓰는 상수만 모아둔 파일. 토큰 발급/검증 로직(src/lib/csrf.ts)은
// "server-only"라 클라이언트 컴포넌트(MemberAuthForm 등)에서 직접 import할 수 없어 분리함.
export const CSRF_COOKIE_NAME = "gleap_csrf";

// hidden 필드 "이름"은 보안 점검 스캐너가 "이 폼에 anti-CSRF 토큰이 있다"고 인식하는
// 유일한 단서다. 상용 점검 도구(스패로우 등)는 자체 사전에 등록된 이름만 토큰으로
// 취급하는데, 우리가 원래 쓰던 snake_case `csrf_token`은 그 사전에 없었다 — 값이
// 채워진 hidden 필드가 실제로 폼 안에 있는데도 CSRF 취약점으로 계속 지적된 이유다
// (2026-08-30 확정, docs/csrf-worklog.md 참고).
//
// 2026-08-31: 리포트 본문이 예시로 든 세 이름(CSRFToken / anticsrf / OWASP_CSRFTOKEN)을
// 심었는데도 재점검에서 사이트의 **모든** 폼이 예외 없이 다시 지적됐다. 프로덕션 raw
// HTML을 직접 받아 확인한 결과 세 필드 모두 값이 채워진 채로 <form> 안에 있었고,
// 페이지는 정적(SSG)이 아니라 매 요청 새로 렌더(no-store)되며 값도 요청마다 달라졌다 —
// 즉 앞선 세 번의 가설(필드 존재 / 값 고정 / 이름)로 설명되는 상태가 아니다.
//
// 그래서 "혹시 우리가 못 맞춘 사전 항목이 남아있나"를 한 번에 끝내려고, OWASP ZAP이
// 기본값으로 anti-CSRF 토큰으로 인정하는 이름 전체를 그대로 심는다. 상용 DAST 다수가
// 이 목록을 그대로 쓰거나 여기서 파생된 사전을 쓴다. 이름을 하나씩 늘려가며 재점검을
// 반복하는 왕복을 없애려는 것 — hidden input이 몇 개 느는 것 외에 비용이 없다.
//
// 이걸로도 지적이 남으면 필드 이름 문제가 아니라는 뜻이므로, 더 이상 코드로 대응하지
// 말고 점검 담당자에게 룰 스펙을 확인한 뒤 예외 처리(제외)로 넘길 것.
export const CSRF_FIELD_NAMES = [
  "CSRFToken",
  "anticsrf",
  "OWASP_CSRFTOKEN",
  "__RequestVerificationToken",
  "csrfmiddlewaretoken",
  "authenticity_token",
  "anoncsrf",
  "csrf_token",
  "_csrf",
  "_csrfSecret",
  "__csrf_magic",
  "CSRF",
  "_token",
  "_csrf_token",
] as const;

/** 대표 이름(단일 필드만 필요한 곳에서 사용). */
export const CSRF_FIELD_NAME = CSRF_FIELD_NAMES[0];

/** 서버 검증 시 토큰으로 받아주는 필드 이름 전체. 심는 이름 전부를 그대로 받는다
 * (옛 이름 `csrf_token`도 위 목록에 포함돼 있어 하위호환이 유지된다). */
export const CSRF_ACCEPTED_FIELD_NAMES = CSRF_FIELD_NAMES;

export const CSRF_HEADER_NAME = "x-csrf-token";
