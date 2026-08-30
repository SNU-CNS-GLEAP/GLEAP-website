import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { PageHero } from "@/components/PageHero";
import { historyPageContent } from "@/content/about-navigation";
import { localizedAlternates } from "@/lib/site-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = historyPageContent[locale === "en" ? "en" : "ko"];
  return { title: copy.title, description: copy.lede, alternates: localizedAlternates(locale, "/about/history") };
}

export default async function HistoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = historyPageContent[locale === "en" ? "en" : "ko"];

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />
      <div className="page-content">
        <AboutSectionNav current="history" locale={locale} />

        <section className="mt-12 lg:mt-16">
          <ol className="relative before:absolute before:bottom-0 before:left-[4.55rem] before:top-0 before:w-px before:bg-border sm:before:left-[8.55rem]">
            {copy.entries.map((entry, index) => (
              <li key={entry.year} className="relative grid grid-cols-[4.6rem_minmax(0,1fr)] pb-9 last:pb-0 sm:grid-cols-[8.6rem_minmax(0,1fr)] lg:pb-12">
                <div className="pr-6 text-right sm:pr-10">
                  <span className="font-mono text-[10px] font-semibold tracking-[.12em] text-accent sm:text-[11px]">
                    {entry.year === "NOW" ? copy.present : entry.year}
                  </span>
                </div>
                <span className={`absolute left-[4.22rem] top-0.5 h-2.5 w-2.5 border-2 border-white sm:left-[8.22rem] ${index === copy.entries.length - 1 ? "bg-primary-deep" : "bg-accent"}`} aria-hidden />
                <article className="pl-7 sm:pl-10 lg:grid lg:grid-cols-[minmax(13rem,.42fr)_minmax(0,1fr)] lg:gap-10">
                  <h2 className="text-base font-semibold leading-6 tracking-[-.02em] text-primary-deep sm:text-lg">{entry.title}</h2>
                  <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted lg:mt-0">{entry.description}</p>
                </article>
              </li>
            ))}
          </ol>
          <p className="mt-14 border-t border-border pt-5 text-[11px] leading-5 text-muted">{copy.source}</p>
        </section>
      </div>
    </main>
  );
}
