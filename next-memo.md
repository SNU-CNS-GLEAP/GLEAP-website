# Next.js 메모 (App Router, v16 기준)

이 프로젝트가 쓰는 Next.js 16 App Router의 구조와, 예전 버전(특히 Pages Router나
검색 결과에 흔한 오래된 자료)과 달라진 점을 정리한 학습용 메모. 실제로 이
레포에서 어떻게 쓰이고 있는지를 예시로 붙였다.

> 참고로 이 문서는 `node_modules/next/dist/docs/`에 설치된 버전과 정확히 맞는
> 공식 문서를 기반으로 작성했다. Next.js는 버전마다 구조가 꽤 바뀌는 프레임워크라,
> 인터넷에서 찾은 코드가 지금 버전과 안 맞을 수 있다 — 헷갈리면 이 폴더의 문서를
> 먼저 확인할 것 (루트의 `AGENTS.md`에도 같은 경고가 있음).

---

## 1. App Router 기본 구조

Next.js는 두 가지 라우팅 방식이 있는데(App Router / Pages Router), 이 프로젝트는
**App Router**(`src/app/`)를 쓴다. 파일 이름 자체가 라우팅 규칙이 된다.

| 파일 | 역할 |
|---|---|
| `page.tsx` | 이 폴더 경로를 실제 페이지로 노출 (없으면 그 경로는 존재하지 않음) |
| `layout.tsx` | 하위 페이지들을 감싸는 공통 UI (헤더/푸터 등). 중첩 가능 |
| `loading.tsx` | 로딩 스켈레톤 |
| `error.tsx` | 에러 바운더리 |
| `not-found.tsx` | 404 UI |
| `route.ts` | 페이지가 아니라 API 엔드포인트 |

**폴더 = URL 경로.** 예를 들어 이 프로젝트의 실제 구조:

```
src/app/[locale]/members/page.tsx        → /ko/members, /en/members
src/app/[locale]/members/alumni/page.tsx → /ko/members/alumni
src/app/[locale]/activities/[category]/page.tsx → /ko/activities/social 등
```

### 대괄호 `[locale]`, `[category]` — 동적 라우트

폴더 이름을 대괄호로 감싸면 그 부분이 변수가 된다. 값은 `params`로 받는다.
**Next.js 15부터 `params`가 Promise라서 `await` 필요** (아래 4번 항목 참고):

```tsx
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // ...
}
```

### 소괄호 `(dashboard)` — 라우트 그룹

URL에는 안 나타나지만 레이아웃을 묶을 때 쓴다. 이 프로젝트의
`src/app/[locale]/admin/(dashboard)/`가 예시 — `(dashboard)`는 URL 경로에서
빠지고(`/ko/admin`으로 그대로 노출), 그 안의 `layout.tsx`에서만 로그인 체크
(`requireAdmin()`)를 걸어서 로그인 페이지(`admin/login`)는 그 체크에서 제외한다.

### `actions.ts` — Server Actions

`admin/login/actions.ts`, `admin/(dashboard)/actions.ts`처럼 파일 맨 위에
`"use server"`를 선언하면, 그 안의 함수는 브라우저에서 직접 호출해도 서버에서
실행된다. 폼 제출(로그인/로그아웃)에 API route 없이 바로 쓸 수 있는 이유.

---

## 2. Turbopack — 기본 번들러가 됨

Next.js 16부터 `next dev`/`next build` 둘 다 **Turbopack이 기본값**이다
(예전엔 `--turbopack` 플래그를 따로 켜야 했음). Rust로 짜여서 빌드가 훨씬 빠르다.
이 프로젝트 `package.json`의 `dev`/`build` 스크립트에 별도 플래그가 없는 게 바로
이 이유 — 이미 기본으로 켜져 있는 것.

---

## 3. `middleware.ts` → `proxy.ts` (이름 변경)

Next.js 16에서 이름이 바뀌었다. 기능은 동일, 요청이 페이지에 도달하기 전에
가로채서 리다이렉트/헤더 수정 등을 하는 역할.

이 프로젝트의 [`src/proxy.ts`](src/proxy.ts)가 그 파일 — 언어 경로가 없는
URL(`/about`)을 `/ko/about`으로 리다이렉트하고, 사용자가 고른 언어를 쿠키에
저장하는 역할을 한다. (검색하면 여전히 `middleware.ts`로 된 예전 자료가 많이
나오니 혼동 주의.)

---

## 4. Async Request APIs — `params`/`cookies()`가 전부 Promise

Next.js 15에서 도입되고, **16에서는 예전 방식(동기 접근)이 완전히 제거**됐다.
`params`, `searchParams`, `cookies()`, `headers()`가 전부 `await`이 필요하다.

```tsx
// 이 프로젝트 어디서나 이 패턴
type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale); // 아래 6번 항목과 직결
  // ...
}
```

`src/lib/session.ts`의 `getSession()`이 내부적으로 `cookies()`를 쓰는데, 이게
바로 `admin` 라우트가 정적으로 안 되고 항상 `ƒ`(동적)로 남는 이유이기도 하다.

---

## 5. Server Component가 기본값, Client Component는 명시적으로

App Router에서는 **모든 컴포넌트가 기본적으로 서버에서만 렌더링**된다
(브라우저로 JS가 아예 안 내려감). 브라우저 상호작용(`useState`, `onClick`,
`usePathname` 등)이 필요한 파일만 맨 위에 `"use client"`를 선언한다.

이 프로젝트 예시:
- `src/app/[locale]/members/page.tsx` — 서버 컴포넌트. DB/파일에서 데이터
  읽어서 HTML만 만들면 되니 클라이언트 JS가 필요 없음
- `src/components/Nav.tsx` — 클라이언트 컴포넌트. `usePathname()`으로 현재
  경로를 읽어서 admin 모드 배지를 토글해야 하니 브라우저에서 실행돼야 함

**서버 컴포넌트는 `async function`으로 바로 `await`를 써서 데이터를 가져올 수
있다** — `getTranslations()`를 컴포넌트 안에서 바로 `await`하는 게 그 예.

---

## 6. 정적 렌더링(●) vs 동적 렌더링(ƒ) — 이 프로젝트에서 제일 중요한 개념

`npm run build` 결과에 나오는 기호:

- `●` (SSG) — 빌드 시점에 미리 HTML을 만들어둠. 요청마다 서버 함수를 실행하지
  않아 훨씬 빠르고 저렴함
- `ƒ` (Dynamic) — 매 요청마다 서버에서 다시 렌더링

**컴포넌트 트리 어딘가에서 `cookies()`, `headers()`, 요청별로 달라지는 값을
읽는 순간 그 페이지 전체가 `ƒ`로 빠진다.** 이게 [CLAUDE.md](CLAUDE.md)의
"성능: 정적 렌더링" 섹션에서 다루는 내용이고, 지난번 논의한 "공개 페이지에
관리자 수정 버튼 얹기" 설계(세션 조회를 서버 컴포넌트에 넣지 않고 클라이언트
쪽 fetch로 분리)도 결국 이 규칙 때문에 나온 결정이다.

next-intl도 기본적으로 요청 헤더에서 언어를 읽으려고 해서, 각 페이지 맨 위에서
`setRequestLocale(locale)`을 안 불러주면 그 페이지도 자동으로 `ƒ`가 된다 — 이
프로젝트의 모든 페이지가 저 한 줄을 빠짐없이 갖고 있는 이유.

---

## 7. `next/image` 관련 변경 (v16)

- **로컬 이미지 캐시 기본값 변경**: `minimumCacheTTL`이 60초 → 4시간. 이미지
  갱신이 그만큼 늦게 반영될 수 있다는 뜻 (거의 안 바뀌는 프로필 사진 같은 데는
  오히려 유리)
- **기본 품질(`quality`)이 75 하나로 고정**됨 — 여러 화질을 쓰려면
  `next.config.ts`에서 `images.qualities` 배열을 직접 지정해야 함
- **원격 이미지는 `images.domains` 대신 `images.remotePatterns` 사용** (이미
  Blob 이미지 붙일 때 `next.config.ts`에 등록 예정인 부분과 연결됨)

방금 구성원 카드에 쓴 `<Image src="/members/..." />`처럼 `public/` 안의 로컬
이미지는 별도 설정 없이 바로 동작한다.

---

## 8. 앞으로 게시판 만들 때 쓸 캐싱 API

게시물 CRUD를 붙일 때 마주칠 함수들 (Server Actions 안에서 사용):

- `revalidateTag(tag, cacheLife)` — 특정 태그가 붙은 캐시를 "곧" 갱신 (v16부터
  두 번째 인자 필수). 새 글이 좀 늦게 반영돼도 되는 경우 (목록 페이지 등)
- `updateTag(tag)` — 캐시를 즉시 만료 + 새로고침. "내가 방금 쓴 글이 바로
  보여야 하는" 경우 (관리자가 글 저장하자마자 확인하는 흐름)
- `refresh()` — Server Action 안에서 클라이언트 라우터를 새로고침

지금 당장 쓸 데는 없지만, Neon 연결 후 글 작성/수정 폼을 만들 때 "저장 버튼
누르면 목록이 갱신되는" 부분에 필요해진다.

---

## 9. 그 외 알아두면 좋은 것

- **React 19.2**: `useEffectEvent`, `Activity`, `View Transitions` 같은 신규
  API가 딸려 옴. 지금 프로젝트 규모에서는 아직 쓸 일 없음
- **`next lint` 명령 삭제됨**: 린트는 `eslint.config.mjs`를 직접 쓰는 ESLint CLI로
  실행 (`package.json`의 `lint` 스크립트 확인)
- **Node.js 20.9+ 필수**: 18은 더 이상 지원 안 함 (배포 환경 확인 시 참고)
