# GLEAP 홈페이지

서울대 자연과학대학 우수학생자치단체 GLEAP 공식 홈페이지.
기존 Wix 사이트(`snucnsgleap.wixsite.com`) 리뉴얼 프로젝트.

## 이 문서에 대해

Claude Code 세션 컨텍스트 겸 인수인계 문서. **결정된 사항과 그 이유**를 담는다.
설계를 바꿀 때는 코드와 함께 이 문서도 갱신할 것.

---

## 프로젝트 성격

- 매우 가벼운 사이트. 소개 / 구성원 / 활동 / 소식(게시판) / 갤러리 수준
- 공개 영역은 가벼운 소개 / 구성원 / 활동 / 소식으로 유지한다.
- 회원 전용 영역에는 프로필, 자유게시판, 댓글, 좋아요를 제공한다.
- 회원 계정은 공개 가입이 아니라 **운영진 초대**로만 만든다.
- **운영 비용 0원**이 요구사항
- 학생 단체라 **집행부가 매년 교체됨** → 인수인계 용이성이 모든 기술 선택의 1순위 기준

---

## 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js (App Router, TypeScript, Tailwind) | 프론트+API 통합. 별도 백엔드 서버 불필요 |
| 호스팅 | Vercel Hobby | 무료. 서버 관리 대상이 생기지 않음 |
| DB / 회원 인증 | Supabase Postgres + Auth | 초대 기반 회원 로그인과 RLS(행 단위 접근 제어)를 한 서비스에서 관리 |
| 이미지 | Vercel Blob | Hobby 1GB 저장 / 10GB 전송 무료 |
| 인증 | iron-session + bcrypt 해시 | 계정 1개라 사용자 테이블 자체가 불필요 |
| 에디터 | Tiptap + `@tiptap/markdown` | 노션형 편집 UI + Markdown 저장을 동시에 확보 |
| i18n | next-intl | App Router 지원 |

### 검토했으나 채택하지 않은 것

- **VPS 구입** — 월 $5 비용도 문제지만, OS 업데이트·TLS 갱신·프로세스 관리를 매 기수 담당할 사람이 필요해짐
- **학내 서버** — 관리 인수인계 난이도. 학교 도메인은 CNAME만 등록하면 외부 호스팅으로도 쓸 수 있어 학내 서버를 쓸 이유가 없음
- **React + FastAPI (기존 getgrida 스택)** — 무료 티어에서 상시 프로세스가 잠들어 첫 요청 지연 발생. 게시물 CRUD뿐인 규모에 백엔드를 분리할 이유 없음
- **Neon 단독 + 자체 회원 인증** — 회원별 세션·권한·초대·행 단위 보안을 따로 구현해야 하므로 현재 요구사항에는 맞지 않음

### 2026-08: 회원 기능으로 인한 변경

초기 버전의 "관리자 1명만 사용하는 정적 사이트" 결정은 공개 홈페이지에만 적용한다.
회원 로그인, 회원 프로필, 자유게시판, 댓글, 좋아요는 Supabase를 사용한다.

- 공개 `/[locale]/news`는 `category = notice` 및 `is_public = true`인 글만 표시한다.
- `/[locale]/community` 아래는 로그인한 회원만 접근한다.
- 데이터 접근의 최종 보안 경계는 Supabase RLS다. 화면에서 버튼을 숨기는 것만으로 권한을 판단하지 않는다.
- 기존 `iron-session` 관리자 화면은 기존 운영 흐름을 보존하기 위해 당장 유지한다. Supabase 운영진(`profiles.is_admin`) 기반 공지 작성·회원 초대 화면은 별도 단계에서 통합한다.

일단은 넣어두지만, 이후 반드시 Neon 등으로 migration 할 것. 
- **Supabase** — DB+인증+스토리지 통합은 편하나 락인이 크고 학습 범위가 넓어짐.
  결정적으로는 리전 문제: Supabase는 서울 리전을 지원하지만(Neon은 없음, 가장 가까운 게 싱가포르),
  **무료 티어는 1주일간 DB 요청이 없으면 프로젝트가 자동 일시정지되고, 이건 수동으로만 재개 가능**함.
  방학·시험 기간에 아무도 안 들어오면 사이트가 조용히 멈춰버리는 리스크가, 서울-싱가포르 왕복
  지연(약 70~100ms, 대부분 정적 페이지라 체감 적음)보다 "매년 담당자 바뀌는" 이 프로젝트엔 더 치명적이라
  판단. Neon 무료 티어는 비활성 시 컴퓨트가 0으로 스케일되지만 다음 요청에 자동으로 깨어남(수동 조치 불필요)

> **2026-08-21 갱신**: 위 migration이 실제로 진행됨 — 회원 로그인·프로필·게시판이
> Better Auth + Neon으로 옮겨갔다. 자세한 구조는 [회원 인증 (Better Auth + Neon)](#회원-인증-better-auth--neon)
> 절 참고. 다만 **`/community/*`(옛 Supabase 경로)가 정리되지 않고 그대로 남아있어서 지금 500
> 에러 상태**다 — 실제 로그인 흐름은 전부 `/member/*`로 이동했는데 `/community/*`는 여전히
> `src/lib/member.ts`(Supabase 버전)를 참조해서, 아무도 로그인시키지 않는 죽은 코드가 됐다.
> 정리(삭제 또는 `/member/community`로 리다이렉트) 필요 — [진행 상황] 참고.

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
DATABASE_URL_UNPOOLED=
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- Vercel의 Neon 연동은 `vercel env pull` 시 `PGHOST`/`POSTGRES_URL`/`POSTGRES_PRISMA_URL` 등
  레거시 호환용 변수를 15개 가까이 같이 내려준다. **우리는 `@neondatabase/serverless`만 쓰므로
  위 두 개(`DATABASE_URL`, `DATABASE_URL_UNPOOLED`) 외 나머지는 지워도 됨** — 안 지워도 동작엔
  문제없지만, 파일이 짧아야 후임이 "이게 다 뭐지" 안 하게 됨
- `src/lib/env.ts`에서 진입 시 존재 여부를 검증하고 없으면 즉시 throw
- **`NEXT_PUBLIC_` 접두사는 브라우저 번들에 노출됨.** public 레포이므로 비밀값에 절대 사용 금지
- Supabase URL과 **publishable key**는 공개되어도 되는 프로젝트 식별·접속 값이며 `NEXT_PUBLIC_` 접두사를 사용한다. `service_role` / secret key는 브라우저와 이 레포에 절대 넣지 않는다.
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

### Neon 브랜치

- **dev용 브랜치**: Neon 콘솔 → 프로젝트 → **Integrations** → Vercel 연동 **Manage** →
  **Settings** → "Create a branch for your development environment" 켜고 Save changes.
  `vercel-dev`라는 영구 브랜치가 만들어지고 Vercel의 **Development** 환경변수가 그 브랜치를
  가리키게 자동 설정됨 — 이 값을 `vercel env pull`이나 복붙으로 `.env.local`에 넣으면 로컬 작업이
  실제 서비스 데이터와 완전히 분리됨. **"Automatically delete obsolete Neon branches"도 같이
  켜둘 것** (안 켜면 PR 미리보기용 브랜치가 계속 쌓임)
- **main → dev로 최신 데이터 가져오기**: 브랜치는 git처럼 머지가 안 됨. dev를 최신 프로덕션
  상태로 갱신하고 싶으면 Neon 콘솔에서 dev 브랜치 선택 → **Reset from parent** (완전 덮어쓰기,
  dev에 있던 내용은 사라짐). 반대 방향(dev → main)은 애초에 필요 없음 — 실제 게시글은
  관리자가 배포된 사이트에서 직접 씀
- **Neon Auth**: 계정이 1개뿐이고 회원가입 자체가 없는 구조라([관리자 인증] 참고) 켜지 않기로
  함. 나중에 정말 필요해지면 Neon 콘솔 → **Auth** 페이지 → Enable Auth (생성 시점에만 되는 설정
  아니라 언제든 추가 가능)

---

## i18n

한국어 / 영어. 확장 가능하게 두되 당분간 2개.

- **경로 기반** (`/ko/about`, `/en/about`). 쿼리스트링(`?lang=`) 방식 아님 — 검색엔진이 별개 페이지로 색인
- `src/app/[locale]/` 아래에 전체 페이지 배치
- `src/proxy.ts`에서 언어 없는 경로 리다이렉트 + 선택 언어 쿠키 저장
  (Next.js 16부터 `middleware.ts` 파일명이 `proxy.ts`로 변경됨 — 기능은 동일, `AGENTS.md` 경고에 따라 로컬 문서로 확인함)
- UI 문구는 `messages/ko.json`, `messages/en.json`. **JSX에 한국어 직접 작성 금지**

> App Router에는 `next.config`의 `i18n` 옵션이 없다. 검색 시 나오는 Pages Router 방식 문서는 무시할 것.

### 게시물 스키마 (Drizzle ORM)

- `src/lib/schema.ts`에 `posts` 테이블 정의, `src/lib/db.ts`가 `@neondatabase/serverless` +
  `drizzle-orm/neon-http`로 만든 클라이언트를 내보냄. 규모(게시물 CRUD 하나)에 Prisma는
  무겁다고 판단 — Drizzle은 스키마가 TS 파일 하나라 읽기 쉽고 마이그레이션도 가벼움
- 컬럼: `type`(자유 문자열 — 월간 글립/저널 클럽/행사/공지사항 등. enum이 아닌 이유는
  분류가 늘어날 수 있는데 enum이면 늘 때마다 마이그레이션이 필요해서), `title_ko`/`body_ko`(필수),
  `title_en`/`body_en`(선택 — 비어있으면 `localize()`가 한국어로 폴백, 아래 번역 절과 동일 규칙),
  `author_name`(선택, 작성자가 직접 입력하는 크레딧 표기용 — 계정이 1개뿐이라 로그인과 무관),
  `created_at`/`updated_at`
- 본문은 Markdown 원문 저장. **렌더링 컴포넌트를 만들 때 raw HTML 통과 옵션(예: `rehype-raw`)은
  절대 켜지 않을 것** — 그래야 본문에 `<script>` 같은 게 섞여도 문자 그대로만 표시되고 실행되지 않음.
  에디터 쪽 확장 제한(폰트/색상 미허용)과 같은 목적의 안전장치
- 마이그레이션: `schema.ts` 수정 → `npm run db:generate`(diff SQL 생성) → `npm run db:migrate`
  (현재 `.env.local`의 `DATABASE_URL_UNPOOLED`가 가리키는 DB에 적용). `drizzle.config.ts`가
  마이그레이션 전용으로 unpooled 연결을 쓰도록 지정돼 있음
- "자동 번역됨" 배지, 활동 카테고리 태그 필드는 아직 스키마에 없음 — 번역 API 연동이랑
  `/activities/[category]` 연계 기능을 실제로 붙일 때 마이그레이션 추가할 것

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
- **구성원 프로필 필드**: `Member` 타입에 `email?`, `links?`(blog/instagram/github/linkedin, 전부 선택)를 추가.
  **학번은 넣지 않기로 함** — 레포가 public이라 커밋 즉시 영구 공개되는데, 학번을 사이트에
  노출할 이유가 딱히 없어서 (기수 정보는 이미 `role`/`department` 문구나 소속 `Cohort`로 충분히 드러남)
- **구성원 사진**: `public/members/` 아래에 `{기수id}{실명}.jpg` 이름으로 커밋 (예: `/members/15문현호.jpg`).
  이름이 어차피 화면에 그대로 노출되므로 파일명도 실명 기반으로 통일 — 별도 식별자(학번 등)를 새로 만들지 않음.
  카드 렌더링은 `src/components/MemberCard.tsx` 하나를 `/members`, `/members/alumni` 양쪽에서 공유
- **Alumni 기준**: 별도 배열이 아니라 `cohorts` 하나에서 파생됨. `members.ts`의 `cohorts`는 1기부터
  최신 기수까지 전부 담고, `CURRENT_COHORT_COUNT`(현재 2)로 지정한 최신 N개 기수만 `currentCohorts`
  (`/members`에 표시), 그 이전 전부가 `alumniCohorts`(`/members/alumni`)로 자동 계산됨. 매년 신입
  기수가 `cohorts`에 추가돼도 이 상수 하나 그대로 두면 가장 오래된 현재 구성원 기수가 자동으로
  alumni로 넘어감 — 코드 수정 불필요. 11~13기는 Wix에서 실명단을 확인해 채워둠(13기는 "13th
  members" 목록, 11·12기는 Wix Alumni 페이지의 기수 드롭다운이 SSR로 내려주는 JSON을 직접
  파싱해 확인). 1~10기는 Wix 쪽에도 드롭다운 옵션(8~12기)만 있고 실제 등록된 인원이 없어
  그대로 빈 자리표시자(`members: []`)로 남겨둠 — 나중에 명단이 확인되면 채울 것
- **Alumni 페이지 UI**: `/members/alumni`는 서버 컴포넌트(SSG 유지)가 `alumniCohorts` 전체를
  클라이언트 컴포넌트 `AlumniCohortBrowser`에 넘기고, 그 안의 `<select>`로 기수를 골라 클라이언트에서
  필터링한다. 기본 선택값은 `DEFAULT_ALUMNI_COHORT_ID`(최신 기수 - `CURRENT_COHORT_COUNT`, 지금은
  13기). API 호출 없이 이미 전달받은 데이터 안에서만 걸러내는 방식이라 정적 렌더링에 영향 없음
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

> 회원 운영진 권한은 이 단일 관리자 비밀번호와 완전히 다른, 별도 체계다. 회원 기능은
> `memberAccess.role`(Better Auth + Neon)로 권한을 판단한다. 두 시스템은 쿠키도 세션 저장소도
> 다르고 서로 전혀 모른다 — 자세한 내용은 아래 [회원 인증 (Better Auth + Neon)](#회원-인증-better-auth--neon) 절 참고.

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

## 회원 인증 (Better Auth + Neon)

`feature/member-neon-auth` 브랜치에서 만들어져 2026-08-21에 main에 merge됨. 관리자 로그인
(iron-session, 위 절)과는 **완전히 독립된 별도 시스템** — 계정도, 쿠키도, 세션 저장소도 다르다.
정식 인증 라이브러리(`better-auth`)를 Neon/Drizzle 위에 얹은 구조로, 회원가입은 공개 가입이
아니라 **사전 승인된 이메일만 가입 가능**(초대 기반, [프로젝트 성격] 원칙과 동일).

### 파일 구조

| 경로 | 역할 |
|---|---|
| `src/lib/member-auth.ts` | 핵심. `betterAuth()` 인스턴스(`memberAuth`) 생성 + 세션 체크 함수(`getCurrentMember`, `requireMember`) |
| `src/lib/member-auth-client.ts` | 브라우저용(`"use client"`) 클라이언트 — 로그인/가입 폼이 여기로 sign-in/sign-up 호출 |
| `src/lib/member-community.ts` | 회원 게시판(글/댓글/좋아요) Drizzle 쿼리 |
| `src/lib/member-email.ts` | 인증·초대 메일 발송. **별도 패키지 없이** 직접 구현 — Gmail은 Node `tls` 모듈로 SMTP 직접 통신, 또는 Resend는 `fetch`로 API 직접 호출 |
| `src/lib/schema.ts` | 기존 `posts` 테이블과 같은 파일에 Better Auth/회원 테이블도 함께 정의 |
| `src/app/api/auth/[...all]/route.ts` | Better Auth의 모든 엔드포인트(로그인/로그아웃/세션/이메일인증 등)를 받는 catch-all 라우트 한 개 (`toNextJsHandler`) |
| `src/app/[locale]/member/*` | 페이지 전체 — `login`, `signup`, 대시보드, `community`(글 목록/작성/상세/수정), `profile`, `members`(명단), `admin`(초대·권한 관리) |
| `src/components/member/*` | `MemberAuthForm`, `MemberLogoutButton`, `MemberCommentForm`, `MemberPostForm`, `MemberProfileForm` |

### 스키마 (전부 `src/lib/schema.ts`)

- Better Auth 표준 테이블 4개: `user`, `session`, `account`, `verification` — 라이브러리가
  요구하는 고정 구조. `betterAuth()`의 `drizzleAdapter(db, { schema: {...} })`로 연결
- 동아리 자체 테이블: `memberAccess`(가입 허용 이메일+역할 — Better Auth엔 초대 전용 가입
  기능이 없어서 직접 만든 allowlist), `memberProfiles`(기수·자기소개·SNS 링크), `memberPosts`/
  `memberComments`/좋아요·싫어요, `memberActivityLogs`

### 호출 패턴

```ts
export const memberAuth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, requireEmailVerification: false },
  hooks: { before: createAuthMiddleware(async (ctx) => {
    // 가입 요청 이메일이 memberAccess에 없으면 여기서 막음 (초대 전용 가입의 실제 구현부)
  }) },
});
```

페이지·Server Action은 전부 맨 앞에 `await requireMember(locale)`을 호출한다 — 세션 없으면
로그인 페이지로 redirect, 있으면 `{ user, role }` 반환. **매 호출마다 `memberAccess`도 다시
조회**하므로, 운영진이 `/member/admin`에서 권한을 회수하면 이미 로그인된 세션이라도 다음
요청부터 즉시 막힌다.

### 알려진 문제: `/community/*`(옛 Supabase 경로) 정리 필요

이번 migration은 로그인·게시판을 `/member/*`로 새로 만들었을 뿐, **옛 `/community/*` 페이지와
`src/lib/member.ts`(Supabase 버전)를 지우지 않고 남겨뒀다.** 실제 로그인은 전부 Better Auth로
가는데 `/community/*`는 여전히 `NEXT_PUBLIC_SUPABASE_URL` 등 이제 `.env.example`에도 없는
변수를 요구해서, 지금 접속하면 500 에러가 난다. 정리 방법은 팀과 상의해서 결정할 것 —
후보는 (a) `/community/*` 라우트·`member.ts`·`src/lib/supabase/*` 통째로 삭제, 또는
(b) `/community` → `/member/community`로 redirect만 걸어 옛 링크 호환성 유지.

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
작성자가 만들 수 있는 것은 문단·제목(H2~H4)·목록·강조·링크·이미지·인용문으로 제한하고,
시각적 표현은 전적으로 CSS가 결정한다.
→ 매년 작성자가 바뀌어도 게시물 스타일이 일관되게 유지되는 유일한 장치.

인용문은 처음엔 목록에서 빠져 있었으나(허용 목록을 만들 때 실사용을 미처 고려 못함),
행사 후기에 참가자 발언을 인용하는 등 실제로 자주 쓰여 다시 켰다. 코드/코드블록/수평선/
밑줄/취소선은 여전히 미허용 — 필요해지면 이 절과 `PostEditor.tsx`를 같이 갱신할 것.

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

#### 이미지 크기 조절: 폭 %만, 자유 드래그 리사이즈는 없음

기본은 CSS(`max-w-full`)로 컨테이너 폭에 맞춘 100% — "확장 선정 원칙"에서 텍스트 스타일을
CSS가 전담하기로 한 것과 같은 방향(매년 작성자가 바뀌어도 게시물 스타일이 흔들리지 않게).
다만 작성자가 이미지를 의도적으로 작게 넣고 싶은 경우를 위해, **비율 고정 + 폭 %만 조절하는
기능**을 얹었다: 이미지를 선택하면 툴바에 25/50/75/100% 버튼이 뜨고(`PostEditor.tsx`의
`ResizableImage`), 높이는 항상 `auto`라 가로세로 비율은 절대 안 깨진다.

`@tiptap/extension-image`(v3)의 자유 드래그 `resize` 옵션은 켜지 않았다 — 픽셀 단위 드래그는
가로/세로를 각각 계산해야 해서 실제로 복잡해지고, 무엇보다 Markdown 표준 이미지 문법
(`![alt](url)`)에는 애초에 width/height를 담을 자리가 없어 그 값이 저장 시점에 사라진다
(raw HTML 저장은 XSS 방지 때문에 이미 금지). % 하나로 제한하니 이 문제가 깔끔하게 풀린다:

- **저장**: `src/lib/image-width.ts`의 `withImageWidth()`가 100%가 아닐 때만 Blob URL에
  `?w=50` 같은 쿼리를 붙여서 Markdown 텍스트 자체에 실어 보낸다. `ResizableImage`의
  `renderMarkdown`/`parseMarkdown`(둘 다 `@tiptap/markdown`이 노드 확장에 제공하는 공식
  확장점)이 저장·복원 양쪽을 담당 — 글을 다시 열면 `parseImageSrc()`가 쿼리를 읽어 폭을
  복원하고, 에디터에 보이는 `src`는 쿼리가 없는 깨끗한 상태로 되돌린다.
- **왜 title이 아니라 쿼리인가**: Markdown 이미지 문법의 `title`(`![alt](url "제목")`)에
  `w:50`처럼 끼워 넣는 방법도 있었지만, title은 나중에 진짜 캡션/툴팁 용도로 쓸 수 있는
  필드라 우리가 만든 표식과 충돌할 수 있어 피했다. 쿼리는 Blob이 실제로 신경 쓰지 않는
  값이고(파일 요청 시엔 렌더러가 미리 떼어냄), 원본 DB의 raw markdown을 봐도 "이 숫자가
  폭이구나"를 바로 알 수 있어 더 명확하다.
- **공개 렌더러**(`news/[id]/page.tsx`)도 같은 `parseImageSrc()`로 쿼리를 읽어 `style={width: N%}`를
  적용하고, 실제 `<img src>`는 쿼리 없는 URL로 요청한다.
- **한 줄에 여러 장(갤러리형 레이아웃)은 지원하지 않는다.** CommonMark/GFM에는 이미지를
  가로로 나란히 배치하는 문법이 원래 없고, 이를 만들려면 raw HTML이나 커스텀 노드
  타입(파서·직렬화·에디터 UI·공개 렌더러를 전부 새로 만들어야 함) 같은 훨씬 큰 작업이
  필요하다. 여러 장을 보기 좋게 배치하고 싶은 경우는 외부 도구(한글 문서 캡처 등)로 미리
  합성한 이미지 한 장을 올리거나, 나중에 만들 별도 **갤러리** 기능([진행 상황] 참고)을
  쓰는 쪽을 권장 — 게시글 본문은 "사진이 올라간다"는 목적 이상으로 무리하지 않는다.

#### Blob 스토어 Access: Public

**Private이 아니라 Public으로 결정.** 본문 Markdown에 이미지 URL을 `![](url)` 형태로
그대로 저장하는 구조([게시물 스키마](#게시물-스키마-drizzle-orm) 절)와 Private가 맞지 않음 —
Private 스토어는 서명된 URL이 일정 시간 후 만료되므로, 저장해둔 Markdown 속 링크가 나중에
깨진다. 이를 피하려면 페이지를 열 때마다 서버에서 URL을 재발급해야 하는데, 그러면
[정적 렌더링](#성능-정적-렌더링) 원칙과 정면충돌한다.

"public 스토어는 위험하다"는 통념은 보통 **S3 public 버킷**(파일 목록을 통째로 브라우징
가능해서 실수로 올린 민감 파일까지 노출되는 사고) 얘기다. Vercel Blob의 public은 다르다 —
버킷 목록 조회 자체가 불가능하고, `put()`이 자동으로 붙이는 랜덤 접미사 덕에 파일마다
개별 URL을 아는 사람만 접근 가능한 unlisted 구조다 (노션·워드프레스 등 대부분의 CMS가
이미지에 쓰는 방식과 동일). 단, **이 스토어에는 원래 공개될 콘텐츠(게시글·구성원·갤러리
사진)만 넣는다** — 회원 전용 게시판 이미지도 URL만 있으면 로그인 없이 열람 가능하다는
뜻이므로, 정말 민감한 자료(개인정보 문서 등)는 애초에 이 Blob 스토어가 아니라 Supabase
Storage + RLS 쪽으로 가야 한다.

#### Wallet-busting(비용 폭탄) 방어

- **쓰기(업로드)**: `BLOB_READ_WRITE_TOKEN`은 서버에만 있고 브라우저로 절대 안 나간다.
  업로드 API 라우트는 반드시 `requireAdmin()`으로 세션을 먼저 확인한 뒤에만 `put()`을
  호출한다. Vercel Blob의 "client upload"(브라우저가 토큰을 직접 받아 업로드) 방식은
  서버 인가 콜백 없이는 아무나 무제한 업로드가 가능해지는 구멍이라 **의도적으로 사용하지
  않는다** — 서버가 대신 업로드를 대행하는 프록시 방식만 사용. 업로드 라우트에 파일 크기
  제한(5MB)도 함께 건다.
- **읽기(다운로드)**: public URL을 스크립트로 반복 요청해 무료 전송량(10GB/월)을 소진시키는
  시나리오는 이론상 가능하나, Vercel Blob 공개 파일은 CDN 캐싱이 걸려 있어 반복 요청 대부분이
  엣지 캐시에서 처리된다. 더 중요한 방어선은 **Vercel 팀 계정에 결제 수단(카드)을 등록하지
  않는 것** — Hobby 플랜은 카드가 없으면 초과 시 과금이 아니라 서비스 일시 제한으로 끝난다.
  → **인수인계 체크리스트에 "카드 미등록 상태 유지" 확인 항목 추가할 것.**

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
- [x] Neon 연결 + 게시물 스키마(`posts` 테이블, Drizzle) — dev 브랜치에 마이그레이션 적용 완료
- [ ] `/news` 목록/상세 페이지 (DB 연동)
- [x] 글 작성 폼 (Tiptap 에디터 + 툴바)
- [x] Blob 이미지 업로드 (에디터 내 삽입 포함) — 업로드/1600px·WebP 변환/폭 % 조절까지 완료
- [ ] 갤러리
- [x] README 인수인계 문서 정리 — 신규 합류자 대상 `README.md` 작성, boilerplate `next_README.md` 제거

---

## 인수인계 체크리스트

- [ ] Vercel 계정 로그인 정보 이양 (팀 볼트)
- [ ] GitHub Organization owner 권한 이양
- [ ] 관리자 비밀번호 교체 절차 문서화
      → bcrypt 해시 생성 → Vercel `ADMIN_PASSWORD_HASH` 교체 → Redeploy
- [ ] Neon / Blob 대시보드 접근 경로 안내
- [ ] 학교 DNS 담당 부서 연락처 기록
- [ ] Vercel 팀 계정에 결제 수단(카드)이 등록되지 않은 상태인지 주기적으로 확인
      → public Blob 스토어의 wallet-busting 방어선 (자세한 근거는 "이미지" 절 참고)
