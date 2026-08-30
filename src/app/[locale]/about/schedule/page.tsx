import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AboutSectionNav } from "@/components/AboutSectionNav";
import { PageHero } from "@/components/PageHero";
import { schedulePageContent } from "@/content/about-navigation";
import { localizedAlternates } from "@/lib/site-metadata";

type Props = { params: Promise<{ locale: string }> };

const toneClass = {
  primary: "bg-primary-deep",
  academic: "bg-accent",
  exchange: "bg-primary-deep",
  social: "bg-cyan",
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = schedulePageContent[locale === "en" ? "en" : "ko"];
  return { title: copy.title, description: copy.lede, alternates: localizedAlternates(locale, "/about/schedule") };
}

export default async function AnnualSchedulePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = schedulePageContent[locale === "en" ? "en" : "ko"];

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />
      <div className="page-content">
        <AboutSectionNav current="schedule" locale={locale} />

        <section className="mt-12 lg:mt-16">
          <div className="grid gap-5 border-y border-border py-6 sm:grid-cols-[minmax(12rem,.35fr)_minmax(0,1fr)] sm:items-center sm:gap-10">
            <h2 className="text-sm font-semibold text-primary-deep">{copy.recurringTitle}</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
              {copy.recurring.map((item) => <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-accent" aria-hidden />{item}</li>)}
            </ul>
          </div>

          <ol className="relative mt-12 before:absolute before:bottom-0 before:left-[4.55rem] before:top-0 before:w-px before:bg-border sm:before:left-[8.55rem]">
            {copy.entries.map((entry) => (
              <li key={`${entry.months}-${entry.title}`} className="relative grid grid-cols-[4.6rem_minmax(0,1fr)] pb-9 last:pb-0 sm:grid-cols-[8.6rem_minmax(0,1fr)] lg:pb-12">
                <div className="pr-6 text-right sm:pr-10">
                  <span className="block font-mono text-[10px] font-semibold tracking-[.1em] text-primary-deep sm:text-[11px]">{entry.months}</span>
                  <span className="mt-1 hidden text-[10px] uppercase tracking-[.12em] text-muted sm:block">{entry.season}</span>
                </div>
                <span className={`absolute left-[4.22rem] top-0.5 h-2.5 w-2.5 border-2 border-white sm:left-[8.22rem] ${toneClass[entry.tone]}`} aria-hidden />
                <article className="border-t border-border pl-7 pt-4 sm:pl-10 lg:grid lg:grid-cols-[minmax(13rem,.42fr)_minmax(0,1fr)] lg:gap-10">
                  <h2 className="text-base font-semibold leading-6 tracking-[-.02em] text-primary-deep sm:text-lg">{entry.title}</h2>
                  <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted lg:mt-0">{entry.description}</p>
                </article>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
