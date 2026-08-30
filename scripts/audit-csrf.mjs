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

const BASE = process.argv[2]?.replace(/\/$/, "") ?? "http://localhost:3000";

// 스캐너 사전에 있는 이름들. src/lib/csrf-shared.ts의 CSRF_FIELD_NAMES와 같아야 한다.
const FIELD_NAMES = ["CSRFToken", "anticsrf", "OWASP_CSRFTOKEN"];

// 로그인 없이 스캐너가 도달할 수 있는 폼이 있는 경로 전부.
const PATHS = [
  "/ko/news",
  "/en/news",
  // 로그인이 필요한 두 진입점. 스캐너는 리다이렉트를 따라간 뒤 최종 페이지의 <form>을
  // 원래 URL 아래에 기록하므로(2026-08-30 리포트에 /ko/member, /ko/admin 등이 그대로
  // 올라온 이유), 여기서도 redirect를 따라가 같은 조건으로 검사한다.
  "/ko/member",
  "/en/member",
  "/ko/admin",
  "/en/admin",
  "/ko/member/login",
  "/en/member/login",
  "/ko/member/signup",
  "/en/member/signup",
  "/ko/admin/login",
  "/en/admin/login",
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

for (const path of PATHS) {
  let html;
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
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
      console.log(`✓ ${label} — ${tokens.map((t) => `${t.name}=${t.value.slice(0, 12)}…`).join(" ")}`);
    }
  });
}

console.log(`\n검사한 폼 ${formCount}개, 실패 ${failures}개 (${BASE})`);
if (failures > 0) {
  console.log("\n※ 로그인이 필요한 폼(admin/*, member/* 대시보드)은 이 스크립트가 도달하지 못한다.");
  process.exit(1);
}
