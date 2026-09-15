import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  defaultActivitiesContent,
  defaultHomeContent,
  defaultSiteSettings,
} from "@/content/managed-site";
import { getSiteUrl, localizedAlternates } from "@/lib/site-metadata";
import { env } from "@/lib/env";
import { localize } from "@/lib/localized-text";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const settings = defaultSiteSettings;
  const home = defaultHomeContent;
  const metadataCopy = settings.metadata[locale === "en" ? "en" : "ko"];
  const title = "GLEAP | Connect Science, Illuminate the World";
  const description = metadataCopy.description;

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: title,
      template: "%s | GLEAP",
    },
    description,
    applicationName: "GLEAP",
    alternates: localizedAlternates(locale),
    openGraph: {
      type: "website",
      siteName: "GLEAP",
      title,
      description,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      images: [
        {
          url: home.assets.hero,
          width: 1600,
          height: 1067,
          alt: metadataCopy.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [home.assets.hero],
    },
    robots: {
      index: true,
      follow: true,
    },
    // 구글 서치 콘솔 / 네이버 서치어드바이저 소유 확인 태그. 환경변수가 비어 있으면
    // 아무 태그도 렌더되지 않으므로 로컬·프리뷰에서는 신경 쓸 필요가 없다.
    verification: {
      ...(env.googleSiteVerification ? { google: env.googleSiteVerification } : {}),
      ...(env.naverSiteVerification
        ? { other: { "naver-site-verification": env.naverSiteVerification } }
        : {}),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Accessibility" });
  const activities = defaultActivitiesContent;
  const settings = defaultSiteSettings;
  const activityItems = activities.categories.map((category) => {
    const title = localize(category.title, locale);
    return { id: category.id, label: title.text, lang: title.lang };
  });

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <a href="#main-content" className="skip-link">
            {t("skipToContent")}
          </a>
          <Nav activityItems={activityItems} settings={settings} />
          <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <Footer settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
