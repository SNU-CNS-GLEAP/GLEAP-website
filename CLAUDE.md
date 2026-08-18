# GLEAP 홈페이지

서울대 자연과학대학 우수학생자치단체 GLEAP 공식 홈페이지.
기존 Wix 사이트(`snucnsgleap.wixsite.com`) 리뉴얼 프로젝트.

## 이 문서에 대해

Claude Code 세션 컨텍스트 겸 인수인계 문서. **결정된 사항과 그 이유**를 담는다.
설계를 바꿀 때는 코드와 함께 이 문서도 갱신할 것.

---

## 프로젝트 성격

- 매우 가벼운 사이트. 소개 / 구성원 / 활동 / 소식(게시판) / 갤러리 수준
- 동적인 부분은 사실상 **게시판 하나**
- 관리자 계정 **1개**. 회원가입·비밀번호 재설정·이메일 인증 없음
- **운영 비용 0원**이 요구사항
- 학생 단체라 **집행부가 매년 교체됨** → 인수인계 용이성이 모든 기술 선택의 1순위 기준

---

## 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js (App Router, TypeScript, Tailwind) | 프론트+API 통합. 별도 백엔드 서버 불필요 |
| 호스팅 | Vercel Hobby | 무료. 서버 관리 대상이 생기지 않음 |
| DB | Neon Postgres | Vercel 마켓플레이스 연동 시 env 자동 주입. 브랜칭 지원 |
| 이미지 | Vercel Blob | Hobby 1GB 저장 / 10GB 전송 무료 |
| 인증 | iron-session + bcrypt 해시 | 계정 1개라 사용자 테이블 자체가 불필요 |
| 에디터 | Tiptap + `@tiptap/markdown` | 노션형 편집 UI + Markdown 저장을 동시에 확보 |
| i18n | next-intl | App Router 지원 |

### 검토했으나 채택하지 않은 것

- **VPS 구입** — 월 $5 비용도 문제지만, OS 업데이트·TLS 갱신·프로세스 관리를 매 기수 담당할 사람이 필요해짐
- **학내 서버** — 관리 인수인계 난이도. 학교 도메인은 CNAME만 등록하면 외부 호스팅으로도 쓸 수 있어 학내 서버를 쓸 이유가 없음
- **React + FastAPI (기존 getgrida 스택)** — 무료 티어에서 상시 프로세스가 잠들어 첫 요청 지연 발생. 게시물 CRUD뿐인 규모에 백엔드를 분리할 이유 없음
- **Supabase** — DB+인증+스토리지 통합은 편하나 락인이 크고 학습 범위가 넓어짐

---

## 소유권 / 계정 구조

- **GitHub**: 개인 계정이 아니라 **Organization 소유 레포**. 개인 계정 소멸 시 레포가 사라지는 것을 방지. owner는 매년 후임에게 이양
- **레포 공개 범위**: public. 비밀값이 레포에 전혀 없으므로 가능. secret scanning 자동 적용, 후배 열람·포트폴리오 이점
- **Vercel**: 동아리 공용 계정. 인계 대상은 사실상 이 계정 하나
- **비밀번호 보관**: 팀 볼트(Bitwarden 등). 카톡·노션 평문 금지

> Hobby 플랜은 시트 1개라 Vercel 팀원 초대 불가.
> 운영 담당자만 공용 계정으로 로그인하고, 일반 기여자는 `.env.example` 복사 + 개인 Neon 브랜치로 개발한다.

---

## 환경변수

`.env.local` (git 제외) / `.env.example` (키 이름만, git 포함).
**키를 추가하면 `.env.example`도 반드시 같이 갱신.**

```
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

- `src/lib/env.ts`에서 진입 시 존재 여부를 검증하고 없으면 즉시 throw
- **`NEXT_PUBLIC_` 접두사는 브라우저 번들에 노출됨.** public 레포이므로 비밀값에 절대 사용 금지
- `.env.local` 수정 후에는 dev 서버 재시작 필요
- Vercel 대시보드에서 값 변경 시 Redeploy 해야 반영됨
- **`ADMIN_PASSWORD_HASH`처럼 `$`로 시작하는 bcrypt 해시를 `.env.local`에 넣을 때는 각 `$`를 `\$`로 이스케이프할 것.**
  Next.js가 로컬에서 `.env.local`을 읽을 때 dotenv-expand로 `$2b`, `$10` 같은 부분을 변수 참조로 오인해 잘라먹는다.
  (Vercel은 값을 직접 주입하므로 이 문제가 없음 — 이스케이프는 로컬 전용)

### 세팅 방법

```bash
git clone <repo> && cd gleap-website
npm install

# 운영 담당자
npx vercel link && npx vercel env pull

# 일반 기여자
cp .env.example .env.local   # 개인 Neon 브랜치 값으로 채움

npm run dev
```

---

## i18n

한국어 / 영어. 확장 가능하게 두되 당분간 2개.

- **경로 기반** (`/ko/about`, `/en/about`). 쿼리스트링(`?lang=`) 방식 아님 — 검색엔진이 별개 페이지로 색인
- `src/app/[locale]/` 아래에 전체 페이지 배치
- `src/proxy.ts`에서 언어 없는 경로 리다이렉트 + 선택 언어 쿠키 저장
  (Next.js 16부터 `middleware.ts` 파일명이 `proxy.ts`로 변경됨 — 기능은 동일, `AGENTS.md` 경고에 따라 로컬 문서로 확인함)
- UI 문구는 `messages/ko.json`, `messages/en.json`. **JSX에 한국어 직접 작성 금지**

> App Router에는 `next.config`의 `i18n` 옵션이 없다. 검색 시 나오는 Pages Router 방식 문서는 무시할 것.

### 게시물 번역

- 스키마는 **언어별 컬럼** 방식 (`title_ko`, `title_en`, `body_ko`, `body_en`). 언어 2개 고정 + 수백 건 규모에서 별도 번역 테이블보다 단순
- 발행 시 번역 API로 영문을 자동 생성해 저장하고 "자동 번역됨" 배지 표시. 관리자가 수정 가능
  - 본문이 Markdown이므로 번역 API가 링크·강조 문법을 깨뜨리지 않는지 확인 필요.
    문제가 있으면 마크다운 인식 옵션이 있는 API를 쓰거나 블록 단위로 분할 전송
- 번역이 없는 경우 한국어 원문을 노출하되 **해당 블록에 `lang="ko"` 명시**
  → 페이지가 `lang="en"`이면 크롬이 번역 제안을 띄우지 않으므로 반드시 필요

### 정적 페이지 콘텐츠 (소개 / 구성원 / 활동)

**DB에 넣지 않고 코드에 데이터 파일로 둔다.** `src/content/*.ts` (about.ts, members.ts, activities.ts).

- 이유: 1년에 몇 번 안 바뀌는 콘텐츠에 DB 스키마 + 관리자 편집 UI까지 만드는 건 과함.
  대신 "배열 항목 고치고 `git push`"로 끝나게 해서 유지보수 비용을 낮춘다.
  사진도 Blob이 아니라 `public/`에 커밋 — 배포 시점에 같이 버전 관리되고 `git revert`로 롤백 가능
- 번역은 `messages/*.json`(UI 문구용)이 아니라 **각 항목 안에 `{ ko, en }` 필드로 나란히** 둔다
  (`src/lib/localized-text.ts`의 `LocalizedText` 타입 + `localize()` 헬퍼).
  두 언어를 별도 파일로 분리하면 항목 개수·순서가 어긋나기 쉬워서, 게시물 스키마의
  `title_ko`/`title_en` 패턴과 동일한 원칙을 그대로 적용한 것
- `en`이 비어있으면 `localize()`가 한국어 원문 + `lang="ko"`를 반환 (게시물과 동일한 fallback 규칙)
- 현재 `src/content/` 안의 데이터는 실제 명단/활동이 아니라 자리표시자(placeholder). 실제 데이터로 교체 필요
- 영문 작성 시 [서울대 자연대 공식 GLEAP 소개 페이지](https://science.snu.ac.kr/en/campus-life/activity/gleap)를
  톤·용어 참고용으로 사용 (활동 3분류를 Academic / Social Contribution / Exchange로 표기).
  `about.ts`는 이미 이 페이지를 참고해 실제 영문으로 채워둔 예시임 — 그대로 복사하지 말고 참고만 할 것

### 헤더 서브메뉴 / 세부 페이지

기존 Wix 사이트(`snucnsgleap.wixsite.com`)의 세부 메뉴 구조를 참고해 각 상위 메뉴를 실제 페이지로 분리:

- **구성원**: `/members`(현재 구성원, `cohorts` 기수별 표시) / `/members/alumni`(`alumni` 배열).
  Wix는 "13기&14기 구성원"처럼 기수를 못박아 링크 이름을 지었지만, 그러면 매년 이름을 바꿔야 해서
  "현재 구성원 / Alumni"로 일반화함 — 실제 기수 목록은 `cohorts` 배열 갱신만으로 처리
- **활동 소개**: `/activities`(3분류 개요, 기존 유지) / `/activities/[category]`(카테고리별 상세).
  `activityCategories`의 `id`(social/academic/exchange)를 라우트 파라미터로 그대로 사용하고
  `generateStaticParams`로 정적 생성 — 새 카테고리를 추가해도 코드 수정 없이 자동으로 페이지 생성됨
- Nav의 드롭다운 라벨 중 "구성원" 하위 항목은 `messages/*.json`(`Nav.membersCurrent`/`membersAlumni`,
  고정 UI 문구)에, "활동 소개" 하위 항목은 `activityCategories`의 `title`을 그대로 재사용
  (콘텐츠 배열이 이미 다국어 필드를 갖고 있어 번역 문구를 중복 관리하지 않기 위함)
- 모바일(`md` 미만)에서는 상단 드롭다운 대신 햄버거 버튼 → 전체 화면 오버레이로 모든 메뉴를
  들여쓰기 트리 형태로 한 번에 보여준다(`src/components/MobileNav.tsx`). 아코디언처럼 접혀있지 않고
  항상 펼쳐진 "사이트맵" 형태 — 메뉴 항목이 10개 안팎으로 적어서 단계별 탐색보다 한눈에 보이는 게 나음
- **소식**: `/news`. Wix 원본에서 빠져있던 탭 — 공지사항/부원 안내/행사 후기/월간 글립(과학 카드뉴스)을
  올릴 게시판 자리. 아직 Neon·에디터가 없어 지금은 "준비 중" 안내만 있는 placeholder
  (`admin` 대시보드와 동일한 패턴). 게시판 스키마가 생기면 이 라우트에 목록/상세를 붙이면 됨
- **활동의 "기수별 실제 내용"은 `activities.ts`에 넣지 않는다.** 이 파일은 "매년 거의 안 바뀌는
  3분류 구조 + 프로그램 이름"만 담당하고, 그 해의 구체적 진행 내용/사진/후기는 게시판(소식)에
  글로 쌓는 것을 전제로 함 — 코드 수정 없이 매년 반복되는 기록이 게시판 쪽에만 생기게 하려는 것.
  게시판 스키마를 만들 때 "활동 카테고리" 태그 필드를 고려하면 나중에 `/activities/[category]`
  페이지에 "관련 소식" 목록을 붙일 수 있음

---

## 관리자 인증

**iron-session + bcrypt. 계정 1개, DB 불필요** (비밀번호 해시는 `ADMIN_PASSWORD_HASH` 환경변수).
그래서 Neon 연결보다 먼저, 정적 페이지와 같은 단계에서 만들어 둠 — 이후 게시판/갤러리 등
모든 관리자 기능이 이 로그인 위에 얹히므로 나중에 끼워 넣는 것보다 먼저 만드는 게 쌌음.

- `src/lib/session.ts`: iron-session 설정 (`getSession()`)
- `src/lib/auth.ts`: `verifyPassword()`, `requireAdmin(locale)` (세션 없으면 로그인 페이지로 redirect)
- `src/app/[locale]/admin/login/`: 로그인 폼 + Server Action (`actions.ts`)
- `src/app/[locale]/admin/(dashboard)/`: 로그인 필요한 라우트 그룹.
  `layout.tsx`에서 `requireAdmin()` 호출 — 이 그룹 안에 게시판/갤러리 관리 페이지를 앞으로 추가
- 로그아웃도 Server Action (`(dashboard)/actions.ts`)
- **관리자 모드 시각 구분**: `Nav.tsx`가 이미 클라이언트 컴포넌트라 `usePathname()`으로
  `/admin` 진입(로그인 페이지 `/admin/login`은 제외) 여부를 판단해 헤더 테두리 색 + "ADMIN" 배지를
  다르게 표시. 세션 쿠키를 직접 읽지 않고 경로만 보는 방식이라, 공개 페이지들의 정적 렌더링에는
  전혀 영향을 주지 않음. 색상은 `--admin` 토큰(디자인 컬러 섹션 참고)
- Footer 우측 끝에 `/admin`으로 가는 작은 링크(`Footer.admin`) 배치 — 로그인 안 된 상태면
  `requireAdmin`이 알아서 로그인 페이지로 보냄

### 공개 페이지에서의 수정 진입점 (설계 방향, 게시판 구현 시 적용)

DB 기반 콘텐츠(소식 게시판)를 관리자가 볼 때는 그 페이지에서 바로 수정 화면으로
들어갈 수 있었으면 한다는 요구가 있었음. 그런데 세션 여부에 따라 페이지 자체의 형태가
갈리면 [성능: 정적 렌더링]에서 지켜온 SSG가 깨진다 — 서버 컴포넌트에서 세션/쿠키를
조회하는 순간 그 페이지 트리 전체가 `ƒ`(동적)로 빠짐.

**결정: 실제 수정 폼/로직은 `admin/(dashboard)` 라우트에만 두고, 공개 페이지에는
클라이언트 컴포넌트로 된 "떠 있는 수정 버튼"만 얹는다.**

- 공개 페이지(서버 컴포넌트)는 세션을 전혀 조회하지 않고 그대로 static 유지
- 버튼을 그리는 클라이언트 컴포넌트(예: `AdminEditToolbar`)가 하이드레이션 후
  가벼운 API(`/api/session-status`류)를 fetch해서 admin이면 버튼을 표시 —
  이 fetch는 CSR이라 페이지의 SSG 여부에 영향을 주지 않음
- 버튼은 `admin/(dashboard)/news/[id]/edit`처럼 이미 동적인 admin 라우트로
  이동시킬 뿐, 수정 폼/로직을 공개 페이지 쪽에 중복 구현하지 않음
- 아직 게시판 스키마가 없어([진행 상황] 미완료 항목) 구현 대상은 없음.
  Neon 연결 + 게시물 스키마 작업 시 이 패턴을 그대로 적용할 것

---

## 디자인 컬러

로고(`public/logo_gleap.png`)의 네이비/그레이 기준 팔레트. **다크모드는 의도적으로 없음** —
로고가 밝은 배경 전용으로 만들어져 있어서, 시스템 다크모드를 따라가면 로고와 배경이 어긋남.

- 색상 토큰은 `src/app/globals.css`의 `:root` 블록 하나에서만 관리
  (`--background`, `--surface`, `--foreground`, `--primary`, `--muted`, `--border`, `--admin`).
  **여기 값만 바꾸면 사이트 전체 색이 바뀜**
- `--admin`은 관리자 대시보드 진입 시 헤더를 구분하는 용도로만 사용 (`primary`의 네이비와
  겹치지 않게 의도적으로 다른 색조(amber 계열)를 선택함)
- Tailwind에서는 `bg-primary`, `text-muted`, `border-border`처럼 그대로 유틸리티 클래스로 사용
  (`@theme inline`에서 `--color-*`로 매핑해둠)

---

## 에디터 / 본문 저장 형식

**Tiptap(위지윅) + `@tiptap/markdown`(양방향 변환). DB에는 Markdown 원문 저장.**

- 작성자는 노션처럼 편집하고, 저장 시 Markdown으로 직렬화
- 외부 Markdown 텍스트를 붙여넣거나 초기 콘텐츠로 주입 가능
- `@tiptap/markdown`은 오픈소스이며 무료.
  DOCX/PDF 변환(Tiptap Conversion)은 별도 유료 제품이므로 사용하지 않는다

### 확장(extension) 선정 원칙

**폰트 크기·색상·정렬 관련 확장은 설치하지 않는다.**
작성자가 만들 수 있는 것은 문단·제목·목록·강조·링크·이미지로 제한하고,
시각적 표현은 전적으로 CSS가 결정한다.
→ 매년 작성자가 바뀌어도 게시물 스타일이 일관되게 유지되는 유일한 장치.

Markdown에는 색상·폰트 크기 문법이 없으므로 저장 단계에서도 한 번 더 걸러진다.

> 확장을 추가·제거할 때는 이 문서의 확장 목록도 함께 갱신할 것.
> 후배가 에디터를 손볼 때 "왜 이 확장만 켜져 있는지"를 알 수 있어야 한다.

### 대안 검토

- **Toast UI Editor** — 툴바 포함 완제품이라 초기 구현은 빠르지만, 커스터마이즈 여지가 적음
- **HTML 저장** — 렌더링은 쉬우나 XSS 대응 부담 + 향후 이식성 저하

Tiptap은 툴바 UI를 직접 만들어야 해서 초기 작업량이 조금 더 많다. (선택 시 감안한 비용)

### 이미지

에디터 내 업로드 버튼 → Blob 업로드 → 본문에 `![](url)` 자동 삽입.
이 기능이 없으면 비개발자가 글을 못 쓴다. **필수 구현.**

---

## 성능: 정적 렌더링

next-intl은 기본적으로 요청 헤더에서 locale을 읽기 때문에, 아무 설정 없이는
`[locale]` 하위 페이지가 전부 동적 렌더링(`ƒ`)으로 빠진다. 매 요청마다 서버 함수를
실행하게 되고, Vercel Hobby 기본 리전(워싱턴 D.C.)까지 왕복하느라 서울에서 200~400ms가
추가로 든다 — 버그가 아니라 설정 누락.

- `src/app/[locale]/layout.tsx`의 `generateStaticParams()`로 `ko`/`en` 두 로케일을 명시
- **모든 `[locale]` 하위 layout·page**에서 `next-intl/server`의 `setRequestLocale(locale)`을
  `params` await 직후에 호출. **하나라도 빠뜨리면 그 아래 트리 전체가 다시 동적으로 남는다** —
  새 페이지를 추가할 때 반드시 같이 넣을 것
- `admin`, `admin/login`은 세션 쿠키를 읽어야 해서 여전히 `ƒ`가 정상. 관리자 전용이라 영향 미미
- `vercel.json`에서 `regions: ["icn1"]`(서울)로 함수 실행 리전 고정.
  → **나중에 Neon 만들 때도 서울/도쿄 리전으로 맞출 것.** Neon은 리전을 나중에 못 바꾸므로
  함수는 서울인데 DB가 미국이면 이번엔 DB 왕복에서 손해를 본다
- 확인 방법: `npm run build` 출력에서 admin 제외 전부 `●`(SSG)인지 확인.
  배포 후에는 응답 헤더 `x-vercel-cache: HIT`/`PRERENDER`, `x-vercel-id`에 `iad1`이 없는지 확인

## 개발 시 주의

- **DB**: Neon 브랜치를 따로 만들어 로컬에서 사용. 운영 연결 문자열을 `.env.local`에 두지 않는다. 스키마 변경이 잦으므로 필수
- **이미지**: Blob은 브랜칭 없음. 개발 중 업로드는 `dev/` 접두사로 저장하고 주기적으로 삭제
- **이미지 최적화**: 업로드 시 가로 1600px 리사이즈 + WebP 변환. 원본 그대로 저장하면 갤러리 100장으로 1GB 소진
- `next.config.ts`의 `images.remotePatterns`에 Blob 도메인 등록 필요

## 배포

- **`git push`가 곧 배포.** Vercel CLI 배포(`vercel --prod`)는 커밋되지 않은 로컬 상태가 그대로 나가므로 상시 사용 금지 (GitHub 장애 시 비상용)
- PR 생성 시 Preview URL 자동 생성
- 문제 발생 시 Vercel 대시보드에서 이전 배포로 롤백

---

## 진행 상황

- [x] 스택 결정
- [x] `create-next-app` 스캐폴딩, 첫 푸시
- [x] GitHub Organization 생성 및 레포 이전
- [x] Vercel 프로젝트 연결, 도메인 추가 → 학교 DNS 신청 (승인까지 시간 소요)
- [x] i18n 구조 세팅 (`[locale]`, proxy, messages) — next-intl 사용, `localePrefix: "always"` 기본값이라 `/ko`, `/en` 모두 접두사 붙음
- [x] 정적 페이지 뼈대 (소개 / 구성원 / 활동) — 라우트·Nav·`src/content/*.ts` 패턴은 완성, 실제 명단·활동 내역은 placeholder라 교체 필요
- [x] 관리자 로그인 (iron-session + bcrypt) — 로그인/세션 유지/로그아웃 확인 완료. 실제 관리 기능(글 작성 등)은 게시판 스키마 이후
- [ ] Neon 연결 + 게시물 스키마 + 목록/상세
- [ ] 글 작성 폼 (Tiptap 에디터 + 툴바)
- [ ] Blob 이미지 업로드 (에디터 내 삽입 포함)
- [ ] 갤러리
- [ ] README 인수인계 문서 정리

---

## 인수인계 체크리스트

- [ ] Vercel 계정 로그인 정보 이양 (팀 볼트)
- [ ] GitHub Organization owner 권한 이양
- [ ] 관리자 비밀번호 교체 절차 문서화
      → bcrypt 해시 생성 → Vercel `ADMIN_PASSWORD_HASH` 교체 → Redeploy
- [ ] Neon / Blob 대시보드 접근 경로 안내
- [ ] 학교 DNS 담당 부서 연락처 기록
