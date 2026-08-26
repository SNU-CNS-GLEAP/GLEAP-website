# Cloudflare Turnstile 설정

회원 로그인·회원가입과 관리자 로그인을 Cloudflare Turnstile로 보호한다. 브라우저 위젯만 신뢰하지 않고 모든 인증 요청에서 서버 검증을 강제한다.

## Vercel 환경변수

Vercel 프로젝트의 **Settings → Environment Variables**에 다음 두 값을 등록한다.

- `TURNSTILE_SITE_KEY`: 브라우저 위젯에 전달되는 공개 사이트 키
- `TURNSTILE_SECRET_KEY`: Siteverify 서버 호출에만 사용하는 비밀 키

Production에는 Cloudflare Turnstile 대시보드에서 발급한 운영 키를 넣고, 운영 위젯의 허용 호스트에는 실제 서비스 도메인을 등록한다. Preview와 Development에는 운영 키 대신 Cloudflare 공식 테스트 키 쌍이나 별도 개발용 위젯 키를 환경별로 지정한다.

로컬 개발에서는 `.env.example`을 복사한 `.env.local`에 같은 변수명을 사용한다. 비밀 키에는 `NEXT_PUBLIC_` 접두사를 붙이지 않으며 `.env.local`은 커밋하지 않는다.

환경변수를 추가하거나 교체한 뒤에는 해당 Vercel 환경을 다시 배포해야 한다.

## 보호 범위

- 회원가입: Better Auth `/sign-up/email`
- 회원 로그인: Better Auth `/sign-in/email`
- 관리자 로그인: Next.js 서버 액션에서 Cloudflare Siteverify 직접 검증

Turnstile 토큰은 단회용이며 만료되므로 인증 실패 후 위젯을 초기화해 새 토큰을 발급받는다.
