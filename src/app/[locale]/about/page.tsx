import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { localize } from "@/lib/localized-text";
import { PageHero } from "@/components/PageHero";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultAboutContent } from "@/content/managed-site";
import { AboutSectionNav } from "@/components/AboutSectionNav";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = defaultAboutContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: localizedAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = defaultAboutContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];
  const motto = localize(content.motto, locale);
  const imageCaption = localize(content.imageCaption, locale);

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />

      <div className="page-content">
        <AboutSectionNav current="overview" locale={locale} />

        <section className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <figure className="relative aspect-[5/6] overflow-hidden bg-surface">
              <Image
                src={content.image}
                alt={copy.imageAlt}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-deep/80 to-transparent px-5 pb-5 pt-16 text-xs font-semibold uppercase tracking-[.14em] text-white">
                <span lang={imageCaption.lang}>{imageCaption.text}</span>
              </figcaption>
            </figure>
          </div>

          <div className="lg:pt-12">
            <p className="section-kicker">{copy.storyKicker}</p>
            <h2 className="section-display mt-5">{copy.storyTitle}</h2>
            <p className="mt-8 text-xl font-semibold leading-relaxed text-primary" lang={motto.lang}>{motto.text}</p>
            <div className="mt-8 flex flex-col gap-6 text-[1.02rem] leading-8 text-[#46536a]">
              {content.paragraphs.map((paragraph, i) => {
                const { text, lang } = localize(paragraph, locale);
                return <p key={i} lang={lang}>{text}</p>;
              })}
            </div>
          </div>
        </section>

        <section className="mt-24 border-t border-border pt-12 lg:mt-32 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="section-kicker">{copy.pillarsKicker}</p>
              <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-.045em] text-primary-deep sm:text-4xl">{copy.pillarsTitle}</h2>
            </div>
            <ol className="grid gap-0 border-t border-border sm:grid-cols-3 sm:border-t-0">
              {(["academic", "social", "exchange"] as const).map((value, index) => (
                <li key={value} className="border-b border-border py-7 sm:border-b-0 sm:border-l sm:px-7 sm:py-0">
                  <span className="font-mono text-[10px] text-accent">0{index + 1}</span>
                  <h3 className="mt-5 text-xl font-semibold text-primary-deep">{copy.values[value].title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{copy.values[value].description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
