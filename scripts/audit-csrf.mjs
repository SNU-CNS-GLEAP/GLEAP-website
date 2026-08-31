// 모든 공개 폼에 anti-CSRF hidden 필드가 "실제 값과 함께" 렌더링되는지 검사한다.
//
// 배경: 보안 점검 스캐너(스패로우)는 JS를 실행하지 않고 raw HTML만 본다. 그래서
// 클라이언트에서 fetch로 토큰을 채우는 방식은 스캐너 눈에 "빈 값 = 토큰 없음"으로
// 보인다. 또한 스캐너는 hidden 필드의 "이름"을 자체 사전과 대조하므로 이름도
// 사전(CSRFToken / anticsrf / OWASP_CSRFTOKEN)에 있어야 한다.
// 자세한 경위는 docs/csrf-worklog.md, CLAUDE.md "CSRF 이중 방어" 절 참고.
//
// 사용법:
//   npm run audit:csrf                      (기본 http://localhost:3000)
//   npm run audit:csrf -- https://내도메인   (배포된 사이트 점검)

//
// 로그인이 필요한 화면(회원 게시판/프로필, 관리자 대시보드)까지 검사하려면 브라우저에서
// 로그인한 뒤 그 세션 쿠키를 환경변수로 넘긴다:
//
//   AUDIT_COOKIE="<Cookie 헤더 값 전체>" npm run audit:csrf
//
// 쿠키 얻는 법: 로그인한 탭에서 개발자도구(F12) > Network > 아무 문서 요청 클릭 >
// Request Headers의 `Cookie:` 줄 값을 통째로 복사. 이 값은 로그인 세션 그 자체이므로
// 커밋하거나 남에게 공유하지 말 것 — 터미널에 한 번 쓰고 끝낸다.

const BASE = process.argv[2]?.replace(/\/$/, "") ?? "http://localhost:3000";
const COOKIE = process.env.AUDIT_COOKIE?.trim();

// 스캐너 사전에 있는 이름들. src/lib/csrf-shared.ts의 CSRF_FIELD_NAMES와 같아야 한다.
// (2026-08-31: 세 개만 심었는데도 재점검이 모든 폼을 계속 지적해서, OWASP ZAP 기본
//  사전 전체로 넓혔다. 경위는 csrf-shared.ts 주석 참고)
const FIELD_NAMES = [
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
];

// 로그인 없이 스캐너가 도달할 수 있는 폼이 있는 경로 전부.
const PATHS = [
  "/ko/news",
  "/en/news",
  // 로그인이 필요한 두 진입점. 스캐너는 리다이렉트를 따라간 뒤 최종 페이지의 <form>을
  // 원래 URL 아래에 기록하므로(2026-08-30 리포트에 /ko/member, /ko/admin이 그대로 올라온
  // 이유 — /admin은 2026-08-31에 /write로 바뀌기 전 경로명), 여기서도 redirect를 따라가
  // 같은 조건으로 검사한다.
  "/ko/member",
  "/en/member",
  "/ko/write",
  "/en/write",
  "/ko/member/login",
  "/en/member/login",
  "/ko/member/signup",
  "/en/member/signup",
  "/ko/write/login",
  "/en/write/login",
];

// AUDIT_COOKIE가 있을 때만 추가로 검사하는, 로그인해야 보이는 화면들.
// 쿠키가 없으면 전부 로그인 페이지로 리다이렉트돼 의미가 없으므로 건너뛴다.
const AUTHED_PATHS = [
  // 회원 (Better Auth 세션)
  "/ko/member",
  "/ko/member/community",
  "/ko/member/community/new",
  "/ko/member/profile",
  "/ko/member/members",
  "/ko/member/admin", // 운영진 계정일 때만 접근 가능
  // 관리자 (iron-session)
  "/ko/write",
  "/ko/write/news",
  "/ko/write/news/new",
];

function extractForms(html) {
  // <form ...> ... </form> 를 통째로 뽑는다(중첩 form은 HTML에서 불가능하므로 안전).
  return [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map((m) => m[0]);
}

function findTokens(formHtml) {
  const found = [];
  for (const name of FIELD_NAMES) {
    const re = new RegExp(`<input[^>]*name="${name}"[^>]*>`, "i");
    const tag = formHtml.match(re)?.[0];
    if (!tag) continue;
    const value = tag.match(/\bvalue="([^"]*)"/i)?.[1] ?? "";
    found.push({ name, value });
  }
  return found;
}

let failures = 0;
let formCount = 0;

const targets = COOKIE ? [...PATHS, ...AUTHED_PATHS] : PATHS;
if (COOKIE) {
  console.log("AUDIT_COOKIE 감지 - 로그인이 필요한 화면까지 검사합니다.");
  console.log("");
}

for (const path of targets) {
  let html;
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: "follow",
      headers: COOKIE ? { cookie: COOKIE } : {},
    });
    if (!res.ok) {
      console.log(`✗ ${path} — HTTP ${res.status}`);
      failures += 1;
      continue;
    }
    html = await res.text();
  } catch (error) {
    console.log(`✗ ${path} — 요청 실패: ${error.message}`);
    failures += 1;
    continue;
  }

  // 쿠키 모드인데 로그인 화면으로 튕겼다면 "검사됨"이 아니라 세션 문제다.
  if (COOKIE && AUTHED_PATHS.includes(path) && /name="password"/i.test(html)) {
    console.log(`! ${path} - 로그인 화면으로 보임 (세션 만료 또는 권한 부족). 이 경로는 미검사`);
    continue;
  }

  const forms = extractForms(html);
  if (forms.length === 0) {
    console.log(`· ${path} — <form> 없음`);
    continue;
  }

  forms.forEach((form, index) => {
    formCount += 1;
    const label = `${path} [form ${index + 1}/${forms.length}]`;
    const tokens = findTokens(form);
    const missingNames = FIELD_NAMES.filter((n) => !tokens.some((t) => t.name === n));
    const emptyNames = tokens.filter((t) => !t.value).map((t) => t.name);

    if (missingNames.length > 0 || emptyNames.length > 0) {
      failures += 1;
      console.log(`✗ ${label}`);
      if (missingNames.length > 0) console.log(`    누락된 필드: ${missingNames.join(", ")}`);
      if (emptyNames.length > 0) console.log(`    값이 빈 필드: ${emptyNames.join(", ")}`);
      console.log(`    ${form.slice(0, 200).replace(/\s+/g, " ")}…`);
    } else {
      console.log(
        `✓ ${label} — 토큰 필드 ${tokens.length}개 (${tokens[0].value.slice(0, 12)}…)`,
      );
    }
  });
}

console.log(`\n검사한 폼 ${formCount}개, 실패 ${failures}개 (${BASE})`);
if (failures > 0) {
  if (!COOKIE) {
    console.log("");
    console.log("※ 로그인이 필요한 폼(write/*, member/* 대시보드)은 검사하지 않았다.");
    console.log("  AUDIT_COOKIE 환경변수에 세션 쿠키를 넣으면 그 화면까지 검사한다(파일 상단 주석 참고).");
  }
  process.exit(1);
}
