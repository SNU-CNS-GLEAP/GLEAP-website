import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { formatContentTemplate, localize } from "@/lib/localized-text";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultActivitiesContent } from "@/content/managed-site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = defaultActivitiesContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: localizedAlternates(locale, "/activities"),
  };
}

export default async function ActivitiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = defaultActivitiesContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];
  const overviewTitle = locale === "en"
    ? "GLEAP's Three Activities."
    : "GLEAP의 3가지 활동.";
  const programCopy = content.programCopy[locale === "en" ? "en" : "ko"];

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />
      <div className="page-content">
        <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="section-kicker">{copy.overviewKicker}</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-.05em] text-primary-deep sm:text-5xl">{overviewTitle}</h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-muted lg:pt-7">{copy.lede}</p>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-3 lg:gap-7">
          {content.categories.map((category, index) => {
            const title = localize(category.title, locale);
            return (
              <article key={category.id} className="group border-t-2 border-gold pt-4">
                <Link href={`/activities/${category.id}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                    <Image
                      src={content.images[category.id as keyof typeof content.images]}
                      alt={programCopy[category.id as "academic" | "social" | "exchange"].title}
                      fill
                      sizes="(min-width: 1024px) 31vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[.12em] text-muted">
                    <span>0{index + 1}</span>
                    <span>{formatContentTemplate(copy.programCount, { count: category.programs.length })}</span>
                  </div>
                  <h3 className="mt-5 font-serif text-4xl font-normal tracking-[-.04em] text-primary-deep group-hover:text-primary" lang={title.lang}>{title.text}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{programCopy[category.id as "academic" | "social" | "exchange"].description}</p>
                  <span className="editorial-link mt-6">{copy.learnMore} <span aria-hidden>↗</span></span>
                </Link>
                <ul className="mt-7 border-t border-border pt-4 text-xs leading-6 text-muted">
                  {category.programs.map((program) => {
                    const name = localize(program.name, locale);
                    return <li key={program.name.ko} className="flex items-center gap-2" lang={name.lang}><span className="text-gold" aria-hidden>—</span>{name.text}</li>;
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
