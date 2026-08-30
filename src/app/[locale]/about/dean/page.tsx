import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { PageHero } from "@/components/PageHero";
import { deanPageContent } from "@/content/about-navigation";
import { localizedAlternates } from "@/lib/site-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = deanPageContent[locale === "en" ? "en" : "ko"];
  return {
    title: copy.title,
    description: copy.lede,
    alternates: localizedAlternates(locale, "/about/dean"),
  };
}

export default async function DeanMessagePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = deanPageContent[locale === "en" ? "en" : "ko"];

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} />

      <div className="page-content">
        <AboutSectionNav current="dean" locale={locale} />

        <section className="mt-14 border-y border-border py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">{copy.status}</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-.025em] text-primary-deep sm:text-3xl">{copy.lede}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">{copy.description}</p>
        </section>
      </div>
    </main>
  );
}
