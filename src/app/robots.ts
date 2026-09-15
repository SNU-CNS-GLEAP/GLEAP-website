import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-metadata";

// 2026-09-15: 도메인이 붙은 뒤 Vercel 엣지 리퀘스트가 하루 10만 수준으로 뛰었다. 상위 IP를
// 조회해보니 57.141.0.0~57.149.255.255(ARIN 등록명 FB-BLOCK, Meta Platforms) / AS32934,
// 즉 Meta의 AI 학습용 크롤러가 전체의 95% 이상이었다. Hobby 한도가 월 100만이라 이대로면
// 20일쯤에 사이트가 멈춘다. 검색 유입도 공격도 아니고 그냥 AI 크롤러였다.
//
// 아래 목록은 "우리가 얻는 것이 0인데 트래픽만 먹는" 봇만 골라 막는다. 검색엔진
// (Googlebot, Bingbot, 네이버 Yeti, 다음)은 당연히 열어두고, 링크 미리보기 봇도 살려둔다.

/** AI 학습 데이터 수집용. 색인·유입에 기여하지 않으므로 막아도 잃는 게 없다. */
const AI_TRAINING_CRAWLERS = [
  // 이번 사태의 장본인. Meta는 이 UA가 robots.txt를 따른다고 문서화해 두었다.
  "meta-externalagent",
  "meta-externalfetcher",
  "GPTBot", // OpenAI 학습용 (검색용 OAI-SearchBot과 다른 UA라 그쪽은 안 막음)
  "ClaudeBot",
  "anthropic-ai",
  "CCBot", // Common Crawl — 수많은 AI 데이터셋의 원본이 된다
  "Bytespider", // ByteDance. 가장 공격적이고 robots.txt를 자주 무시한다
  "Amazonbot",
  "PerplexityBot",
  "Omgilibot",
  "Diffbot",
  // 아래 둘은 "AI 학습 전용" 옵트아웃 토큰이다. 막아도 각 사의 일반 검색 색인
  // (Googlebot / Applebot)에는 영향이 없다 — 그래서 안전하게 막을 수 있다.
  "Google-Extended",
  "Applebot-Extended",
];

/** SEO 분석 도구용. 우리가 그 도구들을 쓰지 않으므로 순수 비용이다. */
const SEO_TOOL_CRAWLERS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
];

// 링크를 공유했을 때 썸네일·제목을 만들어주는 봇. Meta 것을 막는다고 이쪽까지 IP나 ASN으로
// 통째로 끊으면 인스타그램·페이스북·카카오톡에 사이트 링크를 올릴 때 미리보기가 사라진다.
// 동아리 홍보에 직접 손해이므로 **반드시 살려둘 것** — 위 목록에 추가하지 말 것.
const LINK_PREVIEW_BOTS = [
  "facebookexternalhit",
  "Twitterbot",
  "Slackbot-LinkExpanding",
  "kakaotalk-scrap",
];

const PRIVATE_PATHS = ["/api/", "/*/write/", "/*/member/"];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      // 기본 규칙. 검색엔진은 전부 여기에 해당한다.
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      // 미리보기 봇에도 관리자/회원 경로는 똑같이 가린다.
      {
        userAgent: LINK_PREVIEW_BOTS,
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: [...AI_TRAINING_CRAWLERS, ...SEO_TOOL_CRAWLERS],
        disallow: "/",
      },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
