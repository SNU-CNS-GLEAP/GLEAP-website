# 회원 전용 기능: Neon + Better Auth 설정

이 기능은 기존 공개 소식 테이블 `posts`와 분리되어 있습니다.

- 공개 소식/뉴스: 기존 Neon `posts` 테이블과 기존 관리자 화면을 계속 사용
- 회원 전용: `member_*` 테이블과 Better Auth의 `user`, `session`, `account`, `verification` 테이블 사용
- 회원 전용 DB 주소는 브라우저에 노출하지 않고, Next.js 서버에서만 사용

## 배포 전 1회 설정

### 1. Neon 마이그레이션 실행

프로젝트 루트에서 다음을 실행합니다. 실행 환경에는 `DATABASE_URL_UNPOOLED`이 있어야 합니다.

```bash
npm run db:migrate
```

이 명령은 `drizzle/0002_*`, `0003_*`, `0004_*` 파일을 순서대로 실행해 회원 계정·프로필·게시판·댓글·좋아요 테이블을 만듭니다.

### 2. 인증 및 이메일 환경 변수 추가

Vercel 프로젝트 **Settings → Environment Variables**에 아래 값을 Production과 Preview에 추가합니다.

```text
BETTER_AUTH_SECRET=<32바이트 이상 무작위 문자열>
BETTER_AUTH_URL=https://gleap-website.vercel.app
RESEND_API_KEY=<Resend API 키>
EMAIL_FROM=GLEAP <noreply@인증한-도메인>
```

Preview 배포는 Vercel이 자동으로 만든 개별 주소를 사용합니다. 코드가 그
주소를 자동 인식하므로 Preview용으로 `BETTER_AUTH_URL`을 따로 바꿀 필요는
없습니다.

로컬 개발에서는 `.env.local`에 다음처럼 넣습니다.

```text
BETTER_AUTH_SECRET=<배포용과 다른 무작위 문자열>
BETTER_AUTH_URL=http://localhost:3000
```

`BETTER_AUTH_SECRET`은 예를 들어 `openssl rand -base64 32`로 만들 수 있습니다. 이 값과 Neon DB 연결 문자열은 절대 GitHub에 올리지 않습니다.

`EMAIL_FROM`의 도메인은 먼저 Resend에서 소유권을 인증해야 합니다. `gleap-website.vercel.app`은 웹사이트 주소이므로 이메일 발신 도메인으로 쓸 수 없습니다. 동아리가 DNS를 관리하는 도메인(예: `gleap.snu.ac.kr`를 실제로 관리할 권한이 있을 때)을 Resend에 등록하고, 안내되는 SPF·DKIM DNS 레코드를 추가한 뒤 사용합니다.

이메일 설정이 비어 있으면 회원가입은 의도적으로 차단됩니다. 인증 메일 없이 계정만 생기는 상황을 막기 위해서입니다.

### 3. 첫 운영진 이메일 승인

아직 운영진 계정이 하나도 없으므로, Neon SQL Editor에서 아래의 `<운영진 이메일>`만 실제 이메일로 바꾸어 **한 번** 실행합니다.

```sql
insert into member_access (email, role)
values ('<운영진 이메일>', 'admin')
on conflict (email)
do update set role = excluded.role, updated_at = now();
```

그 이메일로 `/ko/member/signup`에서 가입하면 운영진 권한이 적용됩니다. 그 뒤에는 회원 홈의 **회원 승인 관리** 화면에서 다른 회원 이메일을 승인할 수 있습니다.

## 운영 흐름

1. 운영진이 회원 승인 관리에서 실제 이메일을 등록한다.
2. 운영진이 회원에게 `https://gleap-website.vercel.app/ko/member/signup` 주소를 안내한다.
3. 승인된 이메일만 비밀번호를 설정해 가입할 수 있다.
4. 가입 직후 발송된 인증 링크를 해당 이메일 계정에서 누른다.
5. 인증을 마친 회원만 로그인해 프로필, 회원 게시판, 댓글, 좋아요를 사용한다.
6. 일반 회원은 자유글만 작성하며, 회원 공지는 운영진만 작성한다.

현재는 **승인 목록 + 이메일 인증 방식**이다. 운영진은 회원별로 초대 메일을 보내지 않으며, 승인된 회원이 직접 가입을 시작하면 인증 메일이 발송된다.

## 주의

Neon 콘솔의 관리형 **Neon Auth (Beta)** 는 이 기능에서 사용하지 않습니다. 현재 공개 가입을 제한할 수 없으므로, 회원 전용 가입 제한은 이 프로젝트에 설치된 Better Auth와 `member_access` 승인 목록이 담당합니다.
