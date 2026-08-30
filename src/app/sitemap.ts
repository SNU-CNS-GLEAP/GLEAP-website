import type { MetadataRoute } from "next";
import { activityCategories } from "@/content/activities";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-metadata";
import { legalDocumentKeys } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const staticPaths = ["", "/about", "/about/dean", "/about/history", "/about/schedule", "/members", "/members/alumni", "/activities", "/news"];
  const paths = [
    ...staticPaths,
    ...activityCategories.map((category) => `/activities/${category.id}`),
    ...legalDocumentKeys.map((document) => `/legal/${document}`),
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: new URL(`/${locale}${path}`, siteUrl).toString(),
      changeFrequency: path === "/news" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : path === "/news" ? 0.8 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((supportedLocale) => [
            supportedLocale,
            new URL(`/${supportedLocale}${path}`, siteUrl).toString(),
          ]),
        ),
      },
    })),
  );
}
