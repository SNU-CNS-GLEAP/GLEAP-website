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
- [ ] 정적 페이지 (소개 / 구성원 / 활동)
- [ ] Neon 연결 + 게시물 스키마 + 목록/상세
- [ ] 관리자 로그인
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
