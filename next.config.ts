import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// X-XSS-Protection은 폐기된 헤더라 "0"(비활성화)이 표준 권고값이다.
// 스캐너는 구식 규칙("1; mode=block")을 기대해 재점검에서 다시 지적될 수 있는데,
// 그건 스캐너 규칙이 오래된 것이지 실제 방어력과는 무관하다 — CSP가 실제 XSS 방어선이다.
// (보안 감사 대응 문서 SECURITY_REMEDIATION.md 1번 항목 참고)
//
// CSP는 nonce를 쓰지 않는 정적 버전이다. nonce 방식은 매 요청마다 값을 새로
// 발급해야 해서 페이지를 전부 동적 렌더링으로 돌려야 하는데("성능: 정적 렌더링"
// 절 참고, Next.js 공식 문서도 이 요구사항을 명시함), 이 프로젝트는 SSG 유지를
// 최우선으로 두기로 결정했다(2026-08-27). 그 대가로 script-src만 'unsafe-inline'을
// 허용한다 — Next.js App Router가 하이드레이션 데이터를 인라인 스크립트
// (`self.__next_f.push(...)`)로 내려보내는데, 정적 페이지는 nonce를 못 받으므로
// 이걸 열어두지 않으면 모든 페이지가 깨진다. 나머지 지시문(frame-ancestors,
// object-src, base-uri, form-action, 외부 오리진 제한)은 전부 정상 적용되므로
// 클릭재킹·폼 하이재킹·외부 스크립트 주입 방어는 그대로 유지된다.
// Turnstile(로그인/가입 폼)이 challenges.cloudflare.com의 스크립트와 iframe을
// 쓰므로 그 도메인만 명시적으로 허용했다.
//
// 'unsafe-eval'은 `next dev`(NODE_ENV !== "production")에서만 추가한다. React/Next의
// 개발 모드 Fast Refresh·스택트레이스 재구성 기능이 eval()을 쓰는데, 프로덕션 스크립트에는
// 원래 eval()이 전혀 없다(브라우저 콘솔 경고 문구 그대로). 그래서 실제 배포(Vercel, NODE_ENV
// 항상 production)나 `npm run start` 프리뷰에는 이 값이 절대 안 붙고, 로컬 `npm run dev`에서만
// CSP가 개발 서버의 eval 사용을 막지 않도록 열어준다.
const isDev = process.env.NODE_ENV !== "production";

const cspDirectives = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  `style-src 'self' 'unsafe-inline'`,
  // 소식 게시물 사진(에디터 업로드)이 저장되는 Vercel Blob public 도메인. 이게 없으면
  // 업로드 자체는 성공해도 브라우저가 CSP img-src 위반으로 표시를 차단한다(2026-08-28 발견) —
  // images.remotePatterns에 등록된 호스트 패턴과 동일하게 맞춰둘 것.
  `img-src 'self' blob: data: https://*.public.blob.vercel-storage.com`,
  `font-src 'self'`,
  `connect-src 'self' https://challenges.cloudflare.com`,
  `frame-src https://challenges.cloudflare.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join("; ");

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Content-Security-Policy", value: cspDirectives },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
