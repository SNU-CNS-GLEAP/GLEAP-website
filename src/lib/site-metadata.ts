import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const LOCAL_URL = "http://localhost:3000";

export function getSiteUrl() {
  const candidate = process.env.BETTER_AUTH_URL ?? LOCAL_URL;

  try {
    return new URL(candidate);
  } catch {
    return new URL(LOCAL_URL);
  }
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
