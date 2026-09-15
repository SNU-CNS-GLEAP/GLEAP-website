import type { MetadataRoute } from "next";
import { activityCategories } from "@/content/activities";
import { alumniCohorts } from "@/content/members";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-metadata";
import { legalDocumentKeys } from "@/content/legal";
import { getPostSitemapEntries } from "@/lib/posts";

// 소식 게시물이 새로 올라와도 다음 배포 전까지 sitemap에 안 잡히면 색인이 늦어진다.
// 1시간마다 다시 만들게 해 두면 배포와 무관하게 새 글이 반영된다.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** 로케일별 URL + hreflang 대체 링크를 한 벌로 만든다. */
function localizedEntries(
  path: string,
  siteUrl: URL,
  extra: Omit<Entry, "url" | "alternates"> = {},
): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: new URL(`/${locale}${path}`, siteUrl).toString(),
    ...extra,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((supportedLocale) => [
          supportedLocale,
          new URL(`/${supportedLocale}${path}`, siteUrl).toString(),
        ]),
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticPaths = [
    "",
    "/about",
    "/about/dean",
    "/about/history",
    "/about/schedule",
    "/members",
    "/members/alumni",
    "/activities",
    "/wall-of-honor",
    "/news",
  ];

  const paths = [
    ...staticPaths,
    ...activityCategories.map((category) => `/activities/${category.id}`),
    ...alumniCohorts.map((cohort) => `/members/alumni/${cohort.id}`),
    ...legalDocumentKeys.map((document) => `/legal/${document}`),
  ];

  const pages = paths.flatMap((path) =>
    localizedEntries(path, siteUrl, {
      changeFrequency: path === "/news" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/news" ? 0.8 : 0.7,
    }),
  );

  // DB가 잠깐 안 되더라도 sitemap 전체가 빌드 실패로 날아가면 안 된다 —
  // 정적 페이지 목록만이라도 내보내는 쪽이 검색엔진에 낫다.
  let postEntries: Awaited<ReturnType<typeof getPostSitemapEntries>> = [];
  try {
    postEntries = await getPostSitemapEntries();
  } catch (error) {
    console.error("[sitemap] 소식 게시물 조회 실패, 정적 경로만 내보냅니다.", error);
  }

  const posts = postEntries.flatMap((post) =>
    localizedEntries(`/news/${post.id}`, siteUrl, {
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  return [...pages, ...posts];
}
