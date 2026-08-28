# GLEAP 홈페이지

서울대학교 자연과학대학 우수학생자치단체 **GLEAP** 공식 홈페이지.

최첨단 기술, Next.js로 리뉴얼 중에 있습니다.

## 이게 뭐죠

- 소개 / 구성원 / 활동 소개 / 소식(게시판) 페이지로 이루어진 가벼운 사이트
- 한국어·영어 두 언어 지원 (`/ko/...`, `/en/...`)
- 관리자 계정 1개로 소식 게시판 글을 작성·수정 (회원가입 없음)
- 운영 비용 0원 (Vercel Hobby + Neon 무료 티어)

## 기술 스택

- **Next.js** (App Router, TypeScript, Tailwind CSS) — [next-memo.md](next-memo.md)에 설명 정리 중
- **Neon Postgres** — 게시판 데이터 저장, [Drizzle ORM](https://orm.drizzle.team/)으로 스키마 관리
- **Vercel Blob** — 게시글 에디터에서 업로드하는 이미지 저장 (Hobby 무료 티어: 1GB 저장 / 10GB 전송)
- **Vercel** — 호스팅. `git push`가 곧 배포
- *next-intl* — 다국어(i18n)
- *iron-session* — 관리자 로그인

조합 선택의 기준은 [CLAUDE.md의 "스택" 섹션](CLAUDE.md#스택)에 정리하고 있습니다.

## 시작하기

```bash
git clone https://github.com/SNU-CNS-GLEAP/GLEAP-website.git
cd GLEAP-website
npm install
```

### 환경변수 설정

`.env.local` 파일을 만드셔야 합니다. (git에 올라가지 않는 파일).

**운영 담당자**라면 (Vercel 공용 계정: Gleap Google 계정에 연동됨):

```bash
npx vercel link
npx vercel env pull
```

*지금 이걸 성공한 사람이 아직 없습니다*

**일반 기여자**라면, 직접 값을 채우기:

```bash
cp .env.example .env.local
```

- `DATABASE_URL`, `DATABASE_URL_UNPOOLED` — Neon 콘솔에서 각자 개발용 브랜치를 만들고,
  그 브랜치의 connection string을 사용하세요. **실제 서비스 DB 값을 로컬에 두지 마세요.**
- `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` — 운영 담당자에게 문의

> `ADMIN_PASSWORD_HASH`처럼 `$`로 시작하는 값은 `.env.local`에 넣을 때 `\$`로 넣을 것!

### 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 프로젝트 구조

```
src/
  app/[locale]/       페이지 라우트 (ko/en 둘 다 이 안에서 처리)
    admin/            관리자 로그인 + 대시보드
    members/, activities/, news/  각 메뉴 페이지
  components/         공용 UI 컴포넌트 (Nav, Footer, MemberCard 등)
  content/            소개/구성원/활동 콘텐츠 — DB가 아니라 코드로 관리
  lib/                인증, 세션, DB 클라이언트, 스키마 등 핵심 로직
messages/             ko.json / en.json — UI 문구 번역
public/               이미지 등 정적 파일 (구성원 사진 포함)
drizzle/              DB 마이그레이션 파일 (자동 생성, 직접 수정 X)
```

## 자주 하는 작업

**활동/소개 내용 수정** — TXT 수정만 하면 됩니다! `src/content/activities.ts`,
`src/content/about.ts`를 고치고 `git push`하면 끝.

**구성원 추가/수정** — `src/content/members/` 안이 기수별로 파일이 나뉘어 있습니다.

- 기존 기수에 회원 추가/수정: 해당 기수 파일(`src/content/members/cohorts/15.ts`처럼
  2자리 번호.ts)을 열어서 `members` 배열에 항목을 추가하거나 고치면 됩니다.
- 새 기수(예: 16기) 통째로 추가: `src/content/members/cohorts/16.ts` 파일을 새로 만들고
  (기존 파일 아무거나 복사해서 내용만 바꾸는 게 제일 빠름), `src/content/members/index.ts`
  맨 위 import 목록과 `cohorts` 배열에 한 줄씩 추가하세요. 이 등록을 빼먹으면 그 기수가
  화면에 안 보입니다.
- 사진은 `public/members/` 안에 `{기수번호}{실명}.jpg`로 커밋하고(예: `/members/16김철수.jpg`),
  **반드시 1:1(정사각형)로 미리 잘라서** 넣어주세요 — 가로/세로 비율이 안 맞으면 화면에서
  자동으로 잘리거나 화질이 흐려집니다.

**관리자 비밀번호 변경** — bcrypt 해시를 새로 만들어 Vercel의 `ADMIN_PASSWORD_HASH`
환경변수를 교체하고 Redeploy.

**DB 확장 및 관리** — 필요 시, `src/lib/schema.ts`를 고친 뒤:

```bash
npm run db:generate   # 변경분으로 마이그레이션 SQL 생성
npm run db:migrate    # 지금 .env.local이 가리키는 DB에 적용
```

## 배포

`main` 브랜치에 `git push`하면 Vercel이 자동 배포, 30초 후 홈페이지에 반영됩니다.

**`vercel --prod` 써서 직접 배포 금지** — 무슨 일이 일어날지 모릅니다...

## 더 알아보기

- [CLAUDE.md](CLAUDE.md) — 설계 결정과 이유 정리 w/ Claude
- [next-memo.md](next-memo.md) — Next.js 16의 구조/기능 메모

# Honor's wall

## Maintaners list

2026, 2027: 15기 [문현호](https://github.com/octahedron00)

2024, 2025: 13기 [김민준](https://github.com/)

## Dev By 글홈 TF

Gleap 홈페이지 개발 TF 2기 (2026.08.19 ~ 현재)

대표 15기 [문현호](https://github.com/octahedron00)

14기 [박정민](https://github.com/Minhub1204), 
[용현정](https://github.com/ooooowl1029),
[원동현](https://github.com/llZer0ll), 
15기 
[고주형](https://github.com/kojuhyeong),
[정지혜](https://github.com/jungjh06),
[서채원](https://github.com/chaeone15),
[차혜린](https://github.com/HRinCha),
[김민채](https://github.com/)

## 문의하기

내부 문의: 가장 최신 Maintaner를 찾아가세요.

외부 문의: snucnsgleap@gmail.com