import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlumniCohortBrowser } from "@/components/AlumniCohortBrowser";
import { PageHero } from "@/components/PageHero";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultMembersContent } from "@/content/managed-site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = defaultMembersContent;
  const copy = content.alumniCopy[locale === "en" ? "en" : "ko"];

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: localizedAlternates(locale, "/members/alumni"),
  };
}

export default async function AlumniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const labels = await getTranslations("MemberCard");
  const content = defaultMembersContent;
  const copy = content.alumniCopy[locale === "en" ? "en" : "ko"];
  const sortedCohorts = [...content.cohorts].sort((a, b) => a.id - b.id);
  const latestCohortId = Math.max(...sortedCohorts.map((cohort) => cohort.id));
  const alumniCohorts = sortedCohorts.filter(
    (cohort) => cohort.id <= latestCohortId - content.currentCohortCount,
  );
  const defaultCohortId = latestCohortId - content.currentCohortCount;

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />
      <div className="page-content">
        <div className="grid gap-6 border-b border-primary-deep pb-8 lg:grid-cols-[.42fr_1fr] lg:items-end">
          <p className="section-kicker">{copy.rosterKicker}</p>
          <p className="max-w-2xl text-sm leading-7 text-muted">{copy.lede}</p>
        </div>
        <div className="mt-8">
          <AlumniCohortBrowser
            cohorts={alumniCohorts}
            locale={locale}
            defaultCohortId={defaultCohortId}
            selectLabel={copy.selectCohort}
            emptyLabel={copy.empty}
            labels={{
              email: labels("email"),
              blog: labels("blog"),
              instagram: labels("instagram"),
              github: labels("github"),
              linkedin: labels("linkedin"),
            }}
          />
        </div>
      </div>
    </main>
  );
}
