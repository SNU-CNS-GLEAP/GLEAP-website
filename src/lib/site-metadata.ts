import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const LOCAL_URL = "http://localhost:3000";

/** Vercel이 배포마다 자동으로 주입하는 주소. 대시보드에서 따로 설정할 필요가 없다.
 * `VERCEL_PROJECT_PRODUCTION_URL`은 프로덕션 도메인으로 고정되고, `VERCEL_URL`은 배포마다
 * 달라지는 주소라 프리뷰용 폴백으로만 쓴다. 둘 다 스킴이 없어서 https를 붙여준다. */
function getVercelUrl() {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : undefined;
}

function isLoopback(hostname: string) {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

// robots.txt / sitemap.xml / metadataBase(정규 URL·OG 이미지)가 전부 이 함수 하나를 쓴다.
//
// 2026-08-31: 프로덕션 robots.txt가 `Host: http://localhost:3000`, sitemap.xml의 모든
// <loc>이 localhost로 나가고 있었다. `.env.example`의 `BETTER_AUTH_URL`이
// `http://localhost:3000`이라 그 값이 그대로 Vercel 환경변수에 복사돼 있었던 것.
// 환경변수 하나 고쳐서 끝낼 수도 있었지만, 사람이 값을 다시 잘못 넣으면 조용히 같은 사고가
// 나므로(검색 결과에서 사이트가 통째로 사라지는데 화면상으론 멀쩡해 보인다) 코드에서
// 막는다 — 배포 환경인데 localhost를 가리키면 무시하고 Vercel이 준 주소를 쓴다.
//
// 나중에 학교 도메인(CNAME)이 붙으면 Vercel의 `BETTER_AUTH_URL`을 그 주소로 바꾸면 되고,
// 그때까지는 아무것도 설정하지 않아도 배포 주소가 자동으로 잡힌다.
export function getSiteUrl() {
  const candidates = [process.env.BETTER_AUTH_URL, getVercelUrl(), LOCAL_URL];

  for (const candidate of candidates) {
    if (!candidate) continue;

    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      continue;
    }

    if (process.env.VERCEL && isLoopback(url.hostname)) continue;

    return url;
  }

  return new URL(LOCAL_URL);
}

export function localizedAlternates(locale: string, path = ""): Metadata["alternates"] {
  const normalizedPath = path === "/" ? "" : path;

  return {
    canonical: `/${locale}${normalizedPath}`,
    languages: Object.fromEntries(
      routing.locales.map((supportedLocale) => [
        supportedLocale,
        `/${supportedLocale}${normalizedPath}`,
      ]),
    ),
  };
}
