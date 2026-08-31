# CSRF 지적 대응 작업 로그

> 세션이 중간에 끊기는 일이 반복돼서, **작업 단계마다 여기에 먼저 기록**하고 진행한다.
> 끊긴 뒤 새 세션은 이 파일의 마지막 "상태" 줄부터 이어서 하면 된다.
>
> 배경 설명(왜 이렇게 했는지)은 `CLAUDE.md`의 "CSRF 이중 방어" 절과
> `docs/security-audit-2026-08.md`에 있다. 이 파일은 **진행 상황 추적용**이다.

---

## 지금 상태

**단계 2 — 검증 완료, 커밋/푸시만 남음 (2026-08-30)**

- 작업 브랜치: `main-structure`. **프로덕션은 `main`이다** — 여기 push한 것만으로는
  `gleap-website.vercel.app`이 바뀌지 않는다(CLAUDE.md "브랜치 구조" 절 참고)
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

### 로그인 화면 실측 검증 (2026-08-30, 임시 감사 계정)

스크립트로는 로그인 없는 화면만 볼 수 있어서, 회원 화면은 사용자가 직접 로그인한
브라우저에서 확인했다(비밀번호는 사용자가 입력, 이후 조작만 자동).

**렌더된 HTML 확인** — 아래 폼 전부 세 이름이 값과 함께 들어있음:

| 화면 | 폼 |
|---|---|
| `/ko/member/community/new` | 글쓰기 1개 |
| `/ko/member/profile` | 프로필 수정 1개 |
| `/ko/member/community/{id}` | 좋아요 / 싫어요 / 글 삭제 / 댓글 삭제 / 댓글 작성 5개 |

`/ko/member`, `/ko/member/community`, `/ko/member/members`는 폼이 없는 화면이라
검사 대상이 아니다. `/ko/member/admin`은 임시 계정에 운영진 권한이 없어 "접근 권한
없음" 화면이 떠서 미검사(= 권한 제어 자체는 정상 동작).

**실제 제출로 assertCsrfToken 동작 확인** (dev DB 대상, 테스트 데이터는 삭제함):

- 글 작성 → 성공 (상세 페이지로 이동)
- 댓글 작성 → 성공
- 좋아요 토글 → 성공 (0 → 1)
- 프로필 저장 → 성공
- 글 삭제 → 성공 (목록으로 이동, 글·댓글 제거됨)
- **음성 테스트**: 프로필 폼의 hidden 필드 3개를 브라우저에서 임의 값으로 바꾸고 제출 →
  `assertCsrfToken`(`src/lib/csrf.ts:74`)이 예외를 던져 `updateMyProfile`이 막힘.
  검증이 형식적으로만 붙어있는 게 아니라 실제로 동작함을 확인

**남은 미검사 영역** — 계정이 없어 확인 못 한 곳:

- `/ko/member/admin`의 폼 3개 (승인/재발송/권한회수) — 운영진 권한 계정 필요
- `/ko/admin/*`의 폼 4개 (로그아웃, 글 삭제 2곳, `PostForm`) — 관리자 비밀번호 로그인 필요

**발견한 UX 문제 (별건, 미수정)**: 토큰이 무효일 때 서버는 정확히 막지만 화면에는
아무 안내도 뜨지 않고 버튼이 "저장 중…" 상태로 멈춘다. 토큰이 만료된 사용자는 이유를
알 수 없다. `MemberProfileForm` 등 클라이언트 폼의 에러 처리에서 서버 예외를 잡아
메시지를 띄우도록 고치는 것이 좋겠다.

---

### 다음에 또 지적되면 확인할 것

1. **정말 배포됐는가** — `git log origin/main --oneline`에 해당 커밋이 있는지 확인.
   프로덕션은 `main` 하나뿐이고, 작업 브랜치(`main-structure` 등)에 push한 것만으로는
   `gleap-website.vercel.app`이 바뀌지 않는다. 2026-08-28에도, 8-30에도 이걸로 헤맸다
2. `npm run audit:csrf -- https://<배포주소>` 가 통과하는가 — 통과하는데도 지적되면
   필드 이름 사전이 아니라 **다른 조건**(예: `<form>`에 `method`/`action` 속성이 없는
   경우)을 보는 것일 수 있다. 그 경우 `MemberAuthForm`처럼 `onSubmit`만 쓰는 폼에
   `method="post"`를 명시해보는 것이 다음 후보다.

---

## 4차 재점검 (2026-08-31 10:25) — 세 이름으로도 전수 지적

`gleap-snu.csv` 기준 CSRF 지적 11건. **위 "다음에 또 지적되면 확인할 것"을 순서대로
돌려본 결과, 1·2번이 모두 통과인데도 지적이 남았다.**

| 확인 항목 | 결과 |
|---|---|
| 배포 여부 | `882b2f2`(8/30 15:14) → `main` 머지 8/30 21:34. 스캔(8/31 10:25)보다 앞섬 |
| 프로덕션 raw HTML | 세 필드 모두 값과 함께 `<form>` 안에 존재 |
| 정적(SSG) 여부 | `Cache-Control: private, no-store` / `X-Vercel-Cache: MISS` — 매 요청 새로 렌더 |
| 토큰 값 고정 여부 | 같은 URL 두 번 요청 시 값이 매번 다름 (`5b488103…` → `704b8833…`) |
| 쿠키 발급 | `Set-Cookie: gleap_csrf=…; HttpOnly` 정상 |
| 봇 User-Agent | 동일하게 렌더됨 (JS 없이 raw HTML만 봐도 보임) |

### 지적 목록 자체가 단서

11건을 URL별로 풀면 실제 폼은 4종뿐이다:

- `/ko|/en` × `news`(검색), `admin/login`, `member/login`, `member/signup` → 8건
- `/ko|/en/admin` → `admin/login`으로 307 리다이렉트된 중복 기록 → 2건
- `/ko/member` → `member/login`으로 307 리다이렉트된 중복 기록 → 1건

**사이트에 존재하는 모든 폼이 하나도 빠짐없이 같은 90% 신뢰도로 올라왔다.** 토큰이
있는 폼과 없는 폼이 갈린 게 아니라 전수 지적이다. 3차까지는 "지적된 폼 / 안 된 폼"이
갈려서 원인을 좁힐 수 있었지만 이번엔 그 신호가 없다 — 이 룰이 폼 내용을 보고 판정하는
게 아닐 가능성이 크다(`이슈 상태: 미지정` / `조치 상태: 검토 대기`, CSV에 `제외 여부`
컬럼이 있는 것도 "자동 판정 불가 → 수동 검토" 해석과 맞는다).

### 단계 1 — 코드 수정: ZAP 기본 사전 전체로 확대

"혹시 못 맞춘 사전 항목이 남았나"를 한 번에 끝내려는 마지막 코드 대응.
이름을 하나씩 늘려가며 재점검하는 왕복을 없애는 것이 목적이다.

- `src/lib/csrf-shared.ts` — `CSRF_FIELD_NAMES`를 3개 → **14개**로 확대.
  OWASP ZAP이 기본값으로 anti-CSRF 토큰으로 인정하는 이름 전체(`CSRFToken`, `anticsrf`,
  `OWASP_CSRFTOKEN`, `__RequestVerificationToken`, `csrfmiddlewaretoken`,
  `authenticity_token`, `anoncsrf`, `csrf_token`, `_csrf`, `_csrfSecret`,
  `__csrf_magic`, `CSRF`, `_token`, `_csrf_token`). 상용 DAST 다수가 이 목록이나
  그 파생 사전을 쓴다
- `CSRF_ACCEPTED_FIELD_NAMES = CSRF_FIELD_NAMES`로 단순화 — 구 이름 `csrf_token`이
  목록에 포함돼 `LEGACY_CSRF_FIELD_NAME` 상수가 불필요해졌다
- `scripts/audit-csrf.mjs` — `FIELD_NAMES`를 같은 14개로 동기화
- 렌더링 경로(`CsrfInputs.tsx` / `CsrfField.tsx`)는 배열을 map할 뿐이라 수정 없음

### 단계 2 — 검증

- [x] 타입체크 (`npx tsc --noEmit`) — 통과
- [x] `npm run audit:csrf` (로컬) — **검사한 폼 12개, 실패 0개**, 각 폼에 토큰 필드 14개
- [x] 실제 제출로 `assertCsrfToken` 통과 확인 — `/ko/news` 검색 폼을 JS 없이
      (렌더된 hidden 필드 그대로) POST → `303 → /ko/news?q=%ED%85%8C%EC%8A%A4%ED%8A%B8`,
      "보안 토큰이 만료" 예외 없음. 이름을 14개로 늘려도 검증 경로가 깨지지 않는다
- [ ] 커밋 & push (→ 배포) 후 `npm run audit:csrf -- https://gleap-website.vercel.app`

### 이걸로도 지적이 남으면

**더 이상 코드로 대응하지 않는다.** 필드 이름 문제가 아니라는 뜻이므로:

1. 점검 담당자에게 룰 스펙을 직접 확인한다 — "hidden 필드 이름을 어떤 사전과
   대조하는지, 아니면 `<form>` 존재만으로 올라오는 항목인지". 근거로 프로덕션 HTML
   캡처와 위 표를 첨부한다
2. `NEXT_LOCALE` HttpOnly(7건) / `/admin` 200(1건) 오탐과 같이 **`제외 여부`로 예외
   처리**한다

> 남은 기술적 후보가 하나 있긴 하다: `MemberAuthForm`(로그인/가입)의 `<form>`에는
> `method`/`action` 속성이 아예 없다(`onSubmit`으로만 제출). 다만 `/news`·`admin/login`
> 폼은 `method="POST" action=""`가 붙어있는데도 똑같이 지적됐으므로, 이 속성이 원인일
> 가능성은 낮다. 굳이 시도한다면 non-JS 환경에서 폼이 실제 POST 이동을 하게 되는
> 부작용을 먼저 확인할 것.
