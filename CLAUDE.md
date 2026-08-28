# GLEAP 홈페이지

서울대 자연과학대학 우수학생자치단체 GLEAP 공식 홈페이지.
기존 Wix 사이트(`snucnsgleap.wixsite.com`) 리뉴얼 프로젝트.

## 이 문서에 대해

Claude Code 세션 컨텍스트 겸 인수인계 문서. **결정된 사항과 그 이유**를 담는다.
설계를 바꿀 때는 코드와 함께 이 문서도 갱신할 것.

---

## 프로젝트 성격

- 매우 가벼운 사이트. 소개 / 구성원 / 활동 / 소식(게시판) 수준
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
> 절 참고.
>
> **2026-08-24 갱신**: 옛 `/community/*`(Supabase 경로) 정리 완료. `/community/*` 라우트,
> `/[locale]/login`, `/[locale]/auth/callback`, `src/lib/member.ts`, `src/lib/supabase/*`와
> 이들만 참조하던 컴포넌트(`NewPostForm`, `NewNoticePostForm`, `EditPostForm`, `PostInteractions`,
> `ProfileEditor`, `MemberLoginForm`)를 통째로 삭제했다. `@supabase/ssr`, `@supabase/supabase-js`
> 의존성 및 `proxy.ts`의 Supabase 세션 갱신 코드도 제거 — 이제 이 프로젝트에 Supabase 코드는
> 전혀 남아있지 않다. 회원 로그인·게시판은 전적으로 `/member/*`(Better Auth + Neon)만 사용한다.

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
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

- Vercel의 Neon 연동은 `vercel env pull` 시 `PGHOST`/`POSTGRES_URL`/`POSTGRES_PRISMA_URL` 등
  레거시 호환용 변수를 15개 가까이 같이 내려준다. **우리는 `@neondatabase/serverless`만 쓰므로
  위 두 개(`DATABASE_URL`, `DATABASE_URL_UNPOOLED`) 외 나머지는 지워도 됨** — 안 지워도 동작엔
  문제없지만, 파일이 짧아야 후임이 "이게 다 뭐지" 안 하게 됨
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
  분류가 늘어날 수 있는데 enum이면 늘 때마다 마이그레이션이 필요해서), `section`(공지/학술
  소식/활동 소식 3분류 고정 — 아래 "소식 3분류(section)" 절 참고), `title_ko`/`body_ko`(필수),
  `title_en`/`body_en`(선택 — 비어있으면 `localize()`가 한국어로 폴백, 아래 번역 절과 동일 규칙),
  `author_name`(선택, 작성자가 직접 입력하는 크레딧 표기용 — 계정이 1개뿐이라 로그인과 무관),
  `created_at`/`updated_at`
- 본문은 Markdown 원문 저장. **렌더링 컴포넌트를 만들 때 raw HTML 통과 옵션(예: `rehype-raw`)은
  절대 켜지 않을 것** — 그래야 본문에 `<script>` 같은 게 섞여도 문자 그대로만 표시되고 실행되지 않음.
  에디터 쪽 확장 제한(폰트/색상 미허용)과 같은 목적의 안전장치
- 마이그레이션: `schema.ts` 수정 → `npm run db:generate`(diff SQL 생성) → `npm run db:migrate`
  (현재 `.env.local`의 `DATABASE_URL_UNPOOLED`가 가리키는 DB에 적용). `drizzle.config.ts`가
  마이그레이션 전용으로 unpooled 연결을 쓰도록 지정돼 있음
  > **2026-08-28 갱신 — `npm run db:migrate`가 당장은 깨져 있음.** dev 브랜치 DB를 직접
  > 조회해보니 0003~0006 구간(`member_activity_logs` 등 회원 테이블, `published_at`,
  > `member_post_dislikes`)이 이미 실제 스키마에 반영돼 있는데, `drizzle.__drizzle_migrations`
  > 추적 테이블에는 처음 3개(0000~0002)만 기록돼 있었다 — 즉 누군가 그 구간을
  > `db:migrate` 경로가 아니라 다른 방법(Neon 콘솔 SQL 편집기 등)으로 직접 적용한 것으로
  > 보임. 이 상태에서 `db:migrate`를 그대로 돌리면 0003의 `CREATE TABLE`(IF NOT EXISTS
  > 없음)이 "이미 존재함" 에러로 실패한다. `section` 컬럼 추가 건은 이 문제를 피하려고
  > `drizzle/0006_flaky_ser_duncan.sql`을 실제로 새로 필요한 두 문장(`ADD COLUMN IF NOT
  > EXISTS` + `DO $$ ... EXCEPTION WHEN duplicate_object`로 감싼 제약 추가, 0005/기존
  > 0006 파일과 같은 방어적 스타일)만 남기도록 손으로 고친 뒤, `db:migrate`가 아니라
  > 스크립트로 그 SQL만 dev DB에 직접 실행해서 반영했다. **운영 DB에 이 마이그레이션을
  > 적용할 때도 `db:migrate`를 그냥 돌리지 말고, 운영 DB의 `drizzle.__drizzle_migrations`에
  > 몇 번까지 기록돼 있는지 먼저 확인할 것** — 기록이 여기 dev 브랜치와 같은 지점에서
  > 끊겨 있다면 마찬가지로 실패한다. 이 추적 테이블 자체를 정상화(0003~0006 구간을
  > "이미 적용됨"으로 수동 등록)하는 작업은 이번 범위에서 하지 않았음 — 별도로 처리할 것.
- "자동 번역됨" 배지, 활동 카테고리 태그 필드는 아직 스키마에 없음 — 번역 API 연동이랑
  `/activities/[category]` 연계 기능을 실제로 붙일 때 마이그레이션 추가할 것

### 소식 3분류(section)

`type`(자유 문자열, 분류가 계속 늘어날 수 있는 태그)과 별개로, "공지 / 학술 소식 / 활동
소식" 3분류를 위한 `section` 컬럼을 추가했다(2026-08-28). `type`과 달리 **이 3개 외의
값은 절대 늘어나지 않는다는 전제**라서 접근을 반대로 뒤집었다:

- 고정 목록은 `src/lib/post-sections.ts`의 `POST_SECTIONS`(`"notice" | "academic" |
  "activity"`) 하나에서 관리하고, 한국어/영어 라벨(`POST_SECTION_LABELS`)과 타입 가드
  (`isPostSection`)도 같은 파일에 둔다 — 값을 추가/변경할 때 여기 하나만 고치면 됨
- **DB 쪽도 이중으로 고정한다.** `schema.ts`의 `posts` 테이블에 `check("posts_section_check",
  sql`section in ('notice', 'academic', 'activity')`)` 제약을 걸어서, 서버 코드의 검증을
  우회해 직접 INSERT/UPDATE를 날려도 저 3개 값 외에는 DB 레벨에서 거부된다
  (`member_posts.category`의 `check` 제약과 같은 패턴). **이 문자열 목록을 바꾸면
  `post-sections.ts`의 `POST_SECTIONS`도 반드시 같이 갱신할 것** — 두 군데가 어긋나면
  서버 액션 통과 후 DB insert에서 조용히 막히게 됨
- 관리자 글쓰기/수정 폼(`PostForm.tsx`)에서는 `type`처럼 자유 입력(`datalist`)이 아니라
  `<select>`로 `POST_SECTIONS` 값만 옵션으로 제공 — 애초에 다른 값을 입력할 수 없게
  UI에서부터 막음. Server Action(`new/actions.ts`, `[id]/edit/actions.ts`)에서도
  `isPostSection()`으로 한 번 더 검증(폼을 우회한 요청 대비)
- 공개 `/news` 목록 페이지는 기존 `type` 드롭다운 필터와 별개로, `section` 값 3개 + "전체"를
  탭 형태 링크(`?section=notice` 등)로 얹었다 — "각각을 읽을 수 있게"라는 요구를
  쿼리 파라미터 필터로 구현. 검색 폼 제출 시 현재 선택된 `section`을 잃지 않도록
  hidden input으로 같이 전달함
- 기존 게시물은 마이그레이션에서 `section` 기본값을 `'notice'`(공지)로 채웠다 — 실제로는
  학술/활동 소식에 해당하는 글도 섞여 있을 수 있으므로, 운영진이 관리자 편집 화면에서
  실제 분류에 맞게 하나씩 재지정해야 함

### 게시물 이메일 백업 (2026-08-28)

Neon이 소식 게시물의 유일한 저장소라, 실수로 지우거나 DB 자체에 문제가 생겼을 때 복구할
원문이 하나도 안 남는 상황을 막기 위한 안전망. 별도 백업 인프라(운영 비용 0원 원칙과 충돌)
없이, 관리자가 글을 쓰거나 수정할 때마다 그 시점의 Markdown 원문 전체를 이메일로 자기 자신
(`snucnsgleap@gmail.com` → `snucnsgleap@gmail.com`, 기존 회원 초대 메일과 같은 발신 계정)
에게 보내는 방식으로 구현했다 — 메일함이 곧 타임라인이 있는 백업 저장소가 되는 셈.

- `src/lib/post-backup-email.ts`의 `sendPostBackupEmail()`이 담당. `admin/news/new/actions.ts`,
  `admin/news/[id]/edit/actions.ts` 양쪽에서 `createPost`/`updatePost` 성공 직후, `redirect()`
  하기 전에 호출한다
- 메일 본문에는 제목·본문 모두(한/영), `type`/`section`/작성자 표시명/게시일까지 포함 —
  DB 행 하나를 그대로 복원할 수 있을 만큼의 정보량을 목표로 함
- **켜고 끄는 스위치**: `.env.local`의 `POST_BACKUP_EMAIL_ENABLED`. 값을 비워두거나 아예
  안 쓰면 켜짐(기본값), `false`로 설정하면 꺼짐 — 코드 수정 없이 이 값 하나로 제어된다.
  받는 주소는 `POST_BACKUP_EMAIL_TO`로 바꿀 수 있고, 비워두면 발신 계정(`GMAIL_SMTP_USER`)
  자기 자신에게 감
- 발송에 실패해도(SMTP 설정 누락, 네트워크 오류 등) 글 저장 자체는 절대 막지 않는다 —
  `sendPostBackupEmail()` 내부에서 실패를 잡아 `console.error`로만 남기고 삼킨다. 백업은
  "있으면 좋은" 보조 장치이지, 게시글 작성/수정의 필수 경로가 아니어야 하기 때문
- Gmail SMTP(포트 465, Node `tls` 모듈 직접 통신)·Resend 발송 로직은 기존
  `src/lib/member-email.ts`에 있던 것을 `src/lib/email.ts`(`dispatchEmail`, `isEmailConfigured`)로
  뽑아내 회원 메일과 게시물 백업 메일이 같은 디스패처를 공유하게 했다 — SMTP 연결·인증·재시도
  로직을 두 곳에서 따로 관리하지 않기 위함. `member-email.ts`는 이제 이 공유 모듈을 감싸는
  얇은 래퍼(회원 초대/인증 메일 문구만 담당)로 남음

### 게시물 엑셀 백업 다운로드 (2026-08-28)

이메일 백업(위 절)이 "글 하나하나의 시점별 스냅샷"이라면, 이건 "지금 이 순간 DB 전체"를
한 번에 뽑는 백업. `/admin/news`의 "엑셀 백업 다운로드" 버튼을 누르면 그 순간 `posts`
테이블 전 칼럼(id/section/type/제목·본문 한영/photo/작성자/게시일/생성·수정일시)을 `.xlsx`
한 장으로 즉석 생성해 다운로드시킨다 — 별도 저장소나 배치 작업 없이 요청 시점에만 만들어지는
방식이라 운영 비용 0원 원칙과 맞음.

- `src/app/api/admin/posts-export/route.ts` (GET). `/admin/upload`와 동일한 패턴으로
  `getSession()`을 직접 읽어 `session.isAdmin`이 아니면 401 — 상태를 바꾸지 않는 조회
  요청이라 `requireAdmin()`(리다이렉트 지향)이나 CSRF 토큰은 쓰지 않음
- 엑셀 생성은 `exceljs`(신규 의존성). 워크북 하나·시트 하나("소식")에 헤더 행 + 전체 행을
  그대로 씀. `getAllPostsForExport()`(`src/lib/posts.ts`)가 페이지네이션 없이 전체를 조회
- 관리자 화면(`/admin/news/page.tsx`)의 다운로드 링크는 `@/i18n/navigation`의 `Link`가 아니라
  `next/link`를 `NextLink`로 바로 import해서 씀 — 이 링크는 페이지 이동이 아니라 파일
  다운로드 응답을 주는 API 라우트라 `prefetch={false}`가 필요한데, i18n `Link`는 이 prop을
  그대로 통과시켜주는지 보장이 없어 표준 `next/link`를 직접 쓰는 쪽을 택함.
  `prefetch`를 꺼두지 않으면 마우스만 올려도 hover-prefetch로 엑셀 파일이 매번 새로 생성됨

### 게시물 번역

- 스키마는 **언어별 컬럼** 방식 (`title_ko`, `title_en`, `body_ko`, `body_en`). 언어 2개 고정 + 수백 건 규모에서 별도 번역 테이블보다 단순
- 발행 시 번역 API로 영문을 자동 생성해 저장하고 "자동 번역됨" 배지 표시. 관리자가 수정 가능
  - 본문이 Markdown이므로 번역 API가 링크·강조 문법을 깨뜨리지 않는지 확인 필요.
    문제가 있으면 마크다운 인식 옵션이 있는 API를 쓰거나 블록 단위로 분할 전송
- 번역이 없는 경우 한국어 원문을 노출하되 **해당 블록에 `lang="ko"` 명시**
  → 페이지가 `lang="en"`이면 크롬이 번역 제안을 띄우지 않으므로 반드시 필요

### 정적 페이지 콘텐츠 (소개 / 구성원 / 활동)

**DB에 넣지 않고 코드에 데이터 파일로 둔다.** `src/content/*.ts` (about.ts, members/, activities.ts).

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
- **`src/content/members/` 파일 구조**: 기수가 15개까지 늘어나면서(그리고 앞으로 매년 추가되면서)
  단일 `members.ts` 하나에 다 넣으면 파일이 계속 커져서 특정 기수 명단을 찾고 고치기 번거로워짐.
  그래서 파일 하나가 아니라 디렉터리로 바꿈:
  - `types.ts` — `Member`/`Cohort` 타입 정의
  - `cohorts/01.ts` ~ `cohorts/15.ts` — 기수 하나당 파일 하나, 각자 `Cohort` 객체 하나를 `cohort`로 export
  - `index.ts` — 15개 파일을 import해서 `cohorts` 배열로 합치고, `currentCohorts`/`alumniCohorts`/
    `DEFAULT_ALUMNI_COHORT_ID` 파생 로직([Alumni 기준] 참고)을 그대로 유지
  - 바깥에서 보는 인터페이스(`import { cohorts } from "@/content/members"` 등 named export)는 이전과
    동일 — `members.ts` 파일이 `members/index.ts`로 바뀐 것뿐이라 호출부(`MemberCard.tsx`,
    `/members`, `/members/alumni`, `member-auth.ts`) 수정 불필요
  - 새 기수를 추가할 때: `cohorts/16.ts` 파일을 만들고 `index.ts`의 import 목록과 `cohorts` 배열에
    한 줄씩 추가. Next.js/webpack이 정적으로 분석 가능해야 해서 `fs.readdirSync` 같은 자동 스캔 대신
    명시적 import 나열 방식을 씀 — 파일 하나 깜빡하면 그 기수만 안 보이는 정도라 실수해도 눈에 잘 띔
- **구성원 사진**: `public/members/` 아래에 `{기수id}{실명}.jpg` 이름으로 커밋 (예: `/members/15문현호.jpg`).
  이름이 어차피 화면에 그대로 노출되므로 파일명도 실명 기반으로 통일 — 별도 식별자(학번 등)를 새로 만들지 않음.
  카드 렌더링은 `src/components/MemberCard.tsx` 하나를 `/members`, `/members/alumni` 양쪽에서 공유
  - **사진은 반드시 1:1(정사각형) 비율로 미리 잘라서 커밋할 것.** `MemberCard.tsx`는 카드에서
    사진을 원형(`rounded-full object-cover`)으로 자르는데, Next.js `<Image>`는 리사이즈 시
    `width` 값 하나만 기준으로 축소하고 `height`는 보지 않는다. 그래서 가로로 긴 원본 사진을
    그대로 넣으면 실제로 필요한 세로 해상도보다 훨씬 작게 리사이즈된 상태로 화면에 늘어나서
    흐릿하게 보인다(예: 3040×1748 사진에 `width=120` 요청 시 실제로는 120×69로 줄어듦 — 세로
    112px가 필요한데 69px만 받아 늘어남). 코드 쪽에도 여유 해상도를 요청하는 안전장치
    (`width={480}`)를 넣어뒀지만 이는 완화책일 뿐이라, 원본을 처음부터 정사각형으로 잘라
    넣는 쪽이 원천적으로 더 확실하다.
- **Alumni 기준**: 별도 배열이 아니라 `cohorts` 하나에서 파생됨. `members.ts`의 `cohorts`는 1기부터
  최신 기수까지 전부 담고, `CURRENT_COHORT_COUNT`(현재 2)로 지정한 최신 N개 기수만 `currentCohorts`
  (`/members`에 표시), 그 이전 전부가 `alumniCohorts`(`/members/alumni`)로 자동 계산됨. 매년 신입
  기수가 `cohorts`에 추가돼도 이 상수 하나 그대로 두면 가장 오래된 현재 구성원 기수가 자동으로
  alumni로 넘어감 — 코드 수정 불필요. 11~13기는 Wix에서 실명단을 확인해 채워둠(13기는 "13th
  members" 목록, 11·12기는 Wix Alumni 페이지의 기수 드롭다운이 SSR로 내려주는 JSON을 직접
  파싱해 확인). 1~10기는 Wix 쪽에도 드롭다운 옵션(8~12기)만 있고 실제 등록된 인원이 없어
  그대로 빈 자리표시자(`members: []`)로 남겨둠 — 나중에 명단이 확인되면 채울 것
- **Alumni 페이지 UI (2026-08-27 갱신)**: 드롭다운으로 클라이언트에서 필터링하던 기존 방식
  (`AlumniCohortBrowser`, 클라이언트 컴포넌트)을 버리고 `/activities`·`/activities/[category]`와
  똑같은 패턴으로 재구성함 — 기수별로 실제 URL을 갖는 정적 페이지가 외부 링크 공유·북마크에
  유리하다는 판단.
  - `/members/alumni` — 전체 기수를 최신순으로 나열하고 각 기수로 가는 링크만 보여주는 서버
    컴포넌트 (`activities/page.tsx`와 동일 구조)
  - `/members/alumni/[id]` — 기수 하나의 명단을 보여주는 서버 컴포넌트. `generateStaticParams()`가
    `alumniCohorts`의 모든 id를 미리 생성하고, 존재하지 않는 id는 `notFound()`로 404 처리
    (`activities/[category]/page.tsx`와 동일 구조)
  - 기수 전환 UI는 예전 드롭다운 감성을 그대로 살리되, 관리자 화면의 "떠 있는 수정 버튼" 패턴과
    같은 방식으로 아주 작은 클라이언트 컴포넌트(`AlumniCohortSelect`) 하나만 페이지 상단에
    "섬"처럼 얹었다. 페이지 자체는 여전히 서버 컴포넌트라 `generateStaticParams`/`notFound`가
    그대로 적용되고, 이 컴포넌트만 하이드레이션 후 `<select>`의 `onChange`에서
    `useRouter()`(최상위에서 호출, 콜백 안에서 호출하면 Hooks 규칙 위반)로 `/members/alumni/{id}`로
    `push`한다 — URL이 실제로 바뀌므로 새로고침·공유·북마크 모두 그 기수 그대로 유지됨
  - 서버 컴포넌트가 클라이언트 컴포넌트를 자식으로 렌더링하는 것 자체는 정적 생성에 영향을 주지
    않으므로, 두 라우트 모두 `npm run build` 출력에서 `●`(SSG)로 찍힘 —
    `Nav.tsx`/`MobileNav.tsx`의 "Alumni" 메뉴는 `DEFAULT_ALUMNI_COHORT_ID`를 이용해 최신 alumni
    기수 페이지로 바로 연결(기존 그대로 유지)
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
  올리는 게시판(Neon `posts` 테이블 기반). Nav의 "소식"도 "구성원"/"활동 소개"와 같은 드롭다운으로
  통일해(2026-08-28) `공지`/`학술 소식`/`활동 소식`(`section` 3분류, 위 "소식 3분류(section)" 절 참고)
  각각의 `/news?section=...` 필터 페이지로 바로 연결 — 데스크톱은 `Dropdown` 컴포넌트, 모바일은
  `활동 소개`와 동일하게 헤딩 + 하위 링크 나열 방식(`MobileNav.tsx`)
- **활동의 "기수별 실제 내용"은 `activities.ts`에 넣지 않는다.** 이 파일은 "매년 거의 안 바뀌는
  3분류 구조 + 프로그램 이름"만 담당하고, 그 해의 구체적 진행 내용/사진/후기는 게시판(소식)에
  글로 쌓는 것을 전제로 함 — 코드 수정 없이 매년 반복되는 기록이 게시판 쪽에만 생기게 하려는 것.
  게시판 스키마를 만들 때 "활동 카테고리" 태그 필드를 고려하면 나중에 `/activities/[category]`
  페이지에 "관련 소식" 목록을 붙일 수 있음

---

## 관리자 인증

**iron-session + bcrypt. 계정 1개, DB 불필요** (비밀번호 해시는 `ADMIN_PASSWORD_HASH` 환경변수).
그래서 Neon 연결보다 먼저, 정적 페이지와 같은 단계에서 만들어 둠 — 이후 게시판 등
모든 관리자 기능이 이 로그인 위에 얹히므로 나중에 끼워 넣는 것보다 먼저 만드는 게 쌌음.

- `src/lib/session.ts`: iron-session 설정 (`getSession()`)
- `src/lib/auth.ts`: `verifyPassword()`, `requireAdmin(locale)` (세션 없으면 로그인 페이지로 redirect)
- `src/app/[locale]/admin/login/`: 로그인 폼 + Server Action (`actions.ts`)
- `src/app/[locale]/admin/(dashboard)/`: 로그인 필요한 라우트 그룹.
  `layout.tsx`에서 `requireAdmin()` 호출 — 이 그룹 안에 게시판 관리 페이지를 앞으로 추가
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

> 옛 `/community/*`(Supabase 버전) 페이지는 2026-08-24에 삭제 완료 — 위
> [2026-08-24 갱신] 참고. 회원 로그인·게시판은 이제 `/member/*` 하나뿐이다.

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
  합성한 이미지 한 장을 올려서 우회할 것 — 별도 갤러리 페이지는 만들지 않기로 함
  (2026-08-25 결정, 아래 참고). 게시글 본문은 "사진이 올라간다"는 목적 이상으로 무리하지 않는다.

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
이미지에 쓰는 방식과 동일). 단, **이 스토어에는 원래 공개될 콘텐츠(게시글·구성원
사진)만 넣는다** — 회원 전용 게시판 이미지도 URL만 있으면 로그인 없이 열람 가능하다는
뜻이므로, 정말 민감한 자료(개인정보 문서 등)는 애초에 이 Blob 스토어에 넣지 말고 접근 제어가
가능한 별도 저장소로 가야 한다.

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

## 보안 헤더

`next.config.ts`의 `headers()`에서 전 경로에 일괄 적용. Sparrow 웹 취약점 점검
(2026-08-27, `SECURITY_REMEDIATION.md` 참고) 대응으로 추가함.

- `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY` — 표준값 그대로 적용
- `X-XSS-Protection: 1; mode=block` — 폐기된 헤더라 표준 권고는 명시적 비활성화(`0`)이지만,
  `0`으로 두니 Sparrow 재점검에서 구식 규칙을 계속 요구해 다시 지적됨(2026-08-28 확인).
  어느 값이든 실질 방어력은 없음(CSP가 진짜 방어선)이라 재점검 통과를 우선해 이 값으로 둠
- **CSP는 nonce 없는 정적 버전**. nonce 방식은 매 요청 새 값을 발급해야 해서 전체 페이지를
  동적 렌더링(`ƒ`)으로 돌려야 하는데(Next.js 공식 문서에 명시된 요구사항), 이 프로젝트는
  [정적 렌더링](#성능-정적-렌더링)을 최우선으로 삼기로 했으므로(2026-08-27 결정) 정적 버전을
  택함. 대가로 `script-src`에 `'unsafe-inline'`을 열어둠 — App Router가 하이드레이션 데이터를
  인라인 스크립트(`self.__next_f.push(...)`)로 내려보내는데 정적 페이지는 nonce를 받을 수
  없어서 막으면 전 페이지가 깨짐. `frame-ancestors`/`object-src`/`base-uri`/`form-action`/외부
  오리진 제한(Turnstile 도메인만 허용)은 전부 정상 적용되므로 클릭재킹·폼 하이재킹·임의
  스크립트 주입 방어는 유지됨
- CSP를 고칠 때는(외부 리소스 추가 등) `next.config.ts`의 `cspDirectives`만 수정하면 됨.
  브라우저 콘솔에 CSP 위반 로그가 뜨면 원인 오리진을 해당 지시문에 추가할 것

## CSRF 이중 방어 (더블 서브밋 쿠키)

이 사이트의 모든 폼은 Next.js Server Action(Origin/Host 자체 검증) 또는 Better Auth의
origin-check 미들웨어로 이미 CSRF에서 안전하다. 그런데도 더블 서브밋 쿠키 토큰을
2026-08-27에 추가로 얹었다 — 보안 감사 스캐너가 `<form>` 안의 anti-CSRF hidden 필드
유무만 정적으로 검사해서 이 방어를 인식하지 못하기 때문(`SECURITY_REMEDIATION.md` CSRF
11건 항목). 실질적으로는 이중 방어(defense in depth)이지, 눈속임이 아니다 — 토큰은
실제로 서버에서 검증된다.

- **발급**: `src/proxy.ts`가 매 페이지 요청마다 `gleap_csrf` 쿠키(httpOnly, 32바이트
  랜덤 hex)가 없으면 새로 만든다. next-intl의 `createMiddleware`가 내부적으로
  `new Headers(request.headers)`로 복사해 넘기는 걸 이용해, 쿠키를 만드는 바로 그 요청의
  `cookie` 헤더에도 즉시 반영해 둔다 — 그렇지 않으면 첫 방문(쿠키가 아직 없는 요청) 때
  폼에 빈 토큰이 찍혀서 그 요청의 첫 제출이 항상 실패하는 문제가 생긴다
- **서버 렌더링 폼** (`admin/*`, `member/*` 등 이미 동적 렌더링인 페이지):
  `src/components/CsrfField.tsx`(`getCsrfToken()`으로 쿠키를 읽어 hidden input 렌더)를
  `<form>` 안에 넣는다. 클라이언트 컴포넌트가 폼을 감싸는 경우(`MemberPostForm`,
  `MemberCommentForm`, `MemberProfileForm`)는 페이지(서버 컴포넌트)에서 토큰을 읽어
  `csrfToken` prop으로 내려주고, 컴포넌트가 직접 hidden input을 그린다
- **정적 페이지에 얹힌 클라이언트 폼** (Nav/MobileNav의 로그아웃, `MemberAuthForm`의
  로그인/가입): 이 페이지들은 `cookies()`를 읽으면 안 되므로(읽는 순간 SSG가 깨짐),
  대신 이미 CSR로 호출 중인 `/api/session-status`가 `csrfToken`도 함께 내려주도록
  확장해 재사용한다. `MemberAuthForm`은 fetch 기반 제출이라 hidden input 값을
  `x-csrf-token` 헤더로도 같이 보낸다
- **검증**: Server Action은 맨 앞에서 `assertCsrfToken(formData)`(`src/lib/csrf.ts`)를
  호출 — 폼의 hidden 필드 값이 쿠키와 다르면(timing-safe 비교) 예외를 던진다.
  `MemberAuthForm`이 쓰는 better-auth 경로(`/sign-in/email`, `/sign-up/email`)는
  `src/lib/member-auth.ts`의 `hooks.before`에서 `x-csrf-token` 헤더와 쿠키를 직접
  비교한다 — better-auth의 `ctx.headers`는 `next/headers`의 `cookies()`를 못 써서
  raw `Cookie` 헤더 문자열을 직접 파싱함(`readCsrfCookieFromHeader`)
- **새 mutating 폼을 추가할 때**: Server Action 맨 앞에 `assertCsrfToken(formData)` 호출을
  넣고, 폼에는 상황에 맞게 `<CsrfField />`(서버 렌더링) 또는 `csrfToken` prop(클라이언트
  컴포넌트)을 넣을 것. 상수(`CSRF_FIELD_NAME` 등)는 클라이언트/서버 양쪽에서 쓰므로
  `src/lib/csrf-shared.ts`에 있다 — `src/lib/csrf.ts`는 `"server-only"`라 클라이언트
  컴포넌트에서 직접 import할 수 없음
- **의도적으로 손대지 않은 것**: `NEXT_LOCALE` 쿠키의 HttpOnly 누락(7건)과 `/admin`의
  200 응답(1건)은 스캐너 오탐이 맞고, 여기에 "보이는 변화"를 억지로 만들면 오히려
  기능이 깨진다 — 전자는 next-intl이 언어 전환 시 `document.cookie`로 클라이언트에서
  직접 쓰는 쿠키라 HttpOnly를 걸면 그 동기화가 조용히 실패하고, 후자는 `requireAdmin()`의
  로그인 페이지 리다이렉트 자체가 이미 정상 동작(스캐너가 리다이렉트를 따라가서 최종
  200을 기록한 것)이라 고칠 대상이 없다. CSRF는 진짜로 몇 겹 더 방어를 얹을 수 있어서
  했지만, 이 둘은 "고치는 척"이 곧 회귀이므로 사용자와 상의 후 그대로 둠(2026-08-27)

## 개발 시 주의

- **DB**: Neon 브랜치를 따로 만들어 로컬에서 사용. 운영 연결 문자열을 `.env.local`에 두지 않는다. 스키마 변경이 잦으므로 필수
- **이미지**: Blob은 브랜칭 없음. 개발 중 업로드는 `dev/` 접두사로 저장하고 주기적으로 삭제
- **이미지 최적화**: 업로드 시 가로 1600px 리사이즈 + WebP 변환. 원본 그대로 저장하면 게시글 사진 몇백 장으로 금방 1GB 소진
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
- [x] `/news` 목록/상세 페이지 (DB 연동) — `getPosts`/`getPostTypes`(`src/lib/posts.ts`) + `[id]` 상세, admin 작성/수정까지 확인 완료
- [x] 글 작성 폼 (Tiptap 에디터 + 툴바)
- [x] Blob 이미지 업로드 (에디터 내 삽입 포함) — 업로드/1600px·WebP 변환/폭 % 조절까지 완료
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
