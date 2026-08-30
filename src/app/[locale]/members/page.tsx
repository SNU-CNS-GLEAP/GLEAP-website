import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MemberCard } from "@/components/MemberCard";
import { localize } from "@/lib/localized-text";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultMembersContent } from "@/content/managed-site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = defaultMembersContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: localizedAlternates(locale, "/members"),
  };
}

export default async function MembersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = defaultMembersContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];
  const sortedCohorts = [...content.cohorts].sort((a, b) => a.id - b.id);
  const latestCohortId = Math.max(...sortedCohorts.map((cohort) => cohort.id));
  const currentCohorts = sortedCohorts.filter(
    (cohort) => cohort.id > latestCohortId - content.currentCohortCount,
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-primary-deep">{copy.title}</h1>
      {currentCohorts.map((cohort) => {
        const label = localize(cohort.label, locale);
        const description = localize(cohort.description, locale);

        return (
          <section key={cohort.id} className="flex flex-col gap-4 pb-4" aria-labelledby={`cohort-${cohort.id}`}>
            <h2 id={`cohort-${cohort.id}`} className="text-xl font-semibold" lang={label.lang}>{label.text}</h2>
            <p className="text-sm text-muted" lang={description.lang}>{description.text}</p>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {cohort.members.map((member) => (
                <MemberCard
                  key={`${member.surname.ko}${member.givenName.ko}`}
                  member={member}
                  locale={locale}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
