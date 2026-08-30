# CSRF 지적 대응 작업 로그

> 세션이 중간에 끊기는 일이 반복돼서, **작업 단계마다 여기에 먼저 기록**하고 진행한다.
> 끊긴 뒤 새 세션은 이 파일의 마지막 "상태" 줄부터 이어서 하면 된다.
>
> 배경 설명(왜 이렇게 했는지)은 `CLAUDE.md`의 "CSRF 이중 방어" 절과
> `docs/security-audit-2026-08.md`에 있다. 이 파일은 **진행 상황 추적용**이다.

---

## 지금 상태

**단계 2 — 검증 완료, 커밋/푸시만 남음 (2026-08-30)**

- 브랜치: `main-structure` (= Vercel Production 브랜치. GitHub default인 `main` 아님)
- 아래 "단계 1"의 코드 수정이 전부 들어가 있고, 검증까지 끝났다. **아직 미커밋 = 미배포.**
- 남은 일: `git commit` → `git push` → 배포 확인 → 재점검 요청

---

## 남은 지적 내용 (스패로우 재점검)

> "CSRF를 막기 위해 FORM 요소에 Anti-CSRF 토큰을 추가해야 합니다. Anti-CSRF 토큰은
> FORM 요소 내에 **"CSRFToken", "anticsrf", "OWASP_CSRFTOKEN"** 등의 Anti-CSRF 토큰을
> HIDDEN 필드로 추가하여 사용합니다."

지적된 폼 2종 (프로덕션 HTML 기준):

1. `/member/signup` 가입 폼 — **hidden 필드가 이미 있는데도 지적됨**
   ```html
   <input type="hidden" readonly name="csrf_token" value="fc06...45e7">
   ```
2. `/en/news` 검색 폼 — GET 폼이라 의도적으로 토큰을 안 넣었던 곳
   ```html
   <form class="flex flex-wrap gap-2" action="/en/news">
   ```

### 원인 판단

1번이 결정적 단서다. **값이 채워진 hidden 필드가 실제로 존재하는데도 지적됐다**
→ 스캐너는 hidden 필드의 **이름을 자체 사전과 대조**하고, 사전에 없으면 "토큰 없음"으로
판정한다. 리포트 본문이 사전 예시로 `CSRFToken` / `anticsrf` / `OWASP_CSRFTOKEN`
세 개를 명시하고 있고, 우리가 쓰던 snake_case `csrf_token`은 거기 없다.

2번은 "GET 폼은 제외" 같은 예외 없이 **페이지 안의 모든 `<form>`을 검사**한다는 것을 보여준다.

→ 따라서 **(a) 사전에 있는 이름을 쓰고, (b) 예외 없이 모든 `<form>`에 넣는다.**

---

**단계 1 — 코드 수정 완료 (미커밋)**

- `src/lib/csrf-shared.ts` — `CSRF_FIELD_NAMES = ["CSRFToken", "anticsrf", "OWASP_CSRFTOKEN"]`
  (리포트가 예시로 든 세 이름을 전부 심는다), `CSRF_ACCEPTED_FIELD_NAMES`에 구 이름
  `csrf_token`까지 포함해 하위호환 유지
- `src/components/CsrfInputs.tsx` (신규) — `token` 하나를 받아 위 세 이름의 hidden input을 렌더.
  서버/클라이언트 폼이 이 컴포넌트 하나를 공유한다
- `src/components/CsrfField.tsx` — `getCsrfToken()` + `<CsrfInputs />`로 정리 (서버 폼용)
- `src/lib/csrf.ts` — `assertCsrfToken()`이 허용 이름 중 **하나라도** 유효하면 통과하도록 변경
- 클라이언트 폼 6개(`Nav`, `MobileNav`, `MemberAuthForm`, `MemberCommentForm`,
  `MemberPostForm`, `MemberProfileForm`)의 단일 hidden input을 `<CsrfInputs />`로 교체
- `/news` 검색 폼: GET → Server Action(POST) + `redirect()` (이전 세션 작업, 유지)

전체 `<form>` 19개 위치 점검 완료 — 토큰 필드 없는 폼 없음.

---

**단계 2 — 검증 (2026-08-30)**

- [x] 타입체크 (`npx tsc --noEmit`) — 통과
- [x] lint (`npm run lint`) — 에러 0 (기존 미사용 변수 warning 7건만, 이번 작업과 무관)
- [x] 빌드 (`npm run build`) — 성공. 공개 페이지는 전부 `●`(SSG) 유지,
      `/member/login`만 `ƒ`로 바뀜(토큰을 서버에서 발급하게 했으므로 의도된 것)
- [x] **검증 스크립트 추가**: `npm run audit:csrf` (`scripts/audit-csrf.mjs`).
      로그인 없이 도달 가능한 8개 경로를 fetch해 **raw HTML 기준으로** 세 이름의 hidden
      필드가 값과 함께 있는지 확인한다 — 스캐너가 보는 조건과 동일(JS 미실행).
      결과: **검사한 폼 8개, 실패 0개**
      ```
      ✓ /ko/news        ✓ /en/news
      ✓ /ko/member/login  ✓ /en/member/login
      ✓ /ko/member/signup ✓ /en/member/signup
      ✓ /ko/admin/login   ✓ /en/admin/login
      ```
- [x] 브라우저 실동작 확인 (사용자 Chrome, 내장 preview 미사용) — `/ko/news`에서
      "테스트" 검색 → `POST /ko/news` → `searchNews("ko")` → `/ko/news?q=테스트`로
      redirect, 결과 "총 1건". CSRF 검증(`assertCsrfToken`)을 실제로 통과한 것
- [x] 토큰 자체 검증 — 폼에 심긴 세 값 모두 쿠키 비밀값에 대한 HMAC으로 검증 통과,
      1글자 변조한 토큰은 거부, 같은 세션에서 재요청하면 값이 달라지고 그 새 값도
      검증 통과(마스킹 동작 정상)
- [x] 문서 갱신 — `CLAUDE.md`의 "CSRF 이중 방어" 절에 (a) 필드 이름 사전 문제,
      (b) `/news` 폼 GET→POST 전환, (c) 로그인/가입 토큰을 서버 렌더링으로 옮긴 이유,
      (d) `npm run audit:csrf` 사용법 반영
- [ ] 커밋 & push (→ 배포)
- [ ] 배포본에 대해 `npm run audit:csrf -- https://<배포주소>` 재확인 후 재점검 요청

### 프로덕션 baseline 대조 (2026-08-30, 커밋 직전)

스패로우 지적 목록 11건(URL 기준)을 그대로 `audit:csrf`의 검사 경로에 넣고 **수정 전
프로덕션**(`https://gleap-website.vercel.app`)에 돌려서, 우리 진단이 맞는지 확인했다.

```
npm run audit:csrf -- https://gleap-website.vercel.app
→ 검사한 폼 12개, 실패 12개   (지적 11건 + /ko/member/login)
```

**지적 목록이 정확히 재현됐고, 원인이 두 가지였음이 드러났다:**

1. **이름 문제** — `/news`, `/admin/login` 폼에는 아예 토큰 필드가 없거나 옛 이름이었다.
2. **값이 빈 문제 (새로 확인)** — `/member/login`, `/member/signup`의 프로덕션 HTML은
   `<input type="hidden" readOnly name="csrf_token" value="">` 였다. **value가 비어
   있다.** 클라이언트에서 `/api/session-status`로 채우는 방식이었기 때문 — JS를
   실행하지 않는 스캐너 눈에는 "빈 필드 = 토큰 없음"이다. 이름만 고쳤다면 이 두 페이지는
   **또 지적됐을 것**이고, 그래서 토큰을 서버 렌더링으로 옮긴 조치가 꼭 필요했다.
3. **`/ko/member`, `/en/member`, `/ko/admin`, `/en/admin` 4건은 별도의 폼이 아니다** —
   각각 로그인 페이지로 리다이렉트되고, 스캐너가 리다이렉트를 따라간 뒤 **최종 페이지의
   폼을 원래 URL 아래에 기록**한 것. 실제 대상은 위 로그인/가입 폼 그대로다.
   (`audit:csrf`도 `redirect: "follow"`로 같은 조건을 재현한다)

수정본을 로컬에 대고 같은 12개 경로로 돌린 결과:

```
npm run audit:csrf
→ 검사한 폼 12개, 실패 0개
```

---

### 다음에 또 지적되면 확인할 것

1. **정말 배포됐는가** — `git status`로 `origin/main-structure`보다 ahead인지 확인.
   (2026-08-28에 이걸로 한참 헤맸다. `main`이 아니라 `main-structure`가 프로덕션)
2. `npm run audit:csrf -- https://<배포주소>` 가 통과하는가 — 통과하는데도 지적되면
   필드 이름 사전이 아니라 **다른 조건**(예: `<form>`에 `method`/`action` 속성이 없는
   경우)을 보는 것일 수 있다. 그 경우 `MemberAuthForm`처럼 `onSubmit`만 쓰는 폼에
   `method="post"`를 명시해보는 것이 다음 후보다.
