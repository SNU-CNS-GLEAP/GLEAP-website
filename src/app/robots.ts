import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/write/", "/*/member/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
