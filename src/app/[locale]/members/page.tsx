import { getTranslations, setRequestLocale } from "next-intl/server";
import { currentCohorts } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { MemberCard } from "@/components/MemberCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MembersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MembersPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      {currentCohorts.map((cohort) => {
        const label = localize(cohort.label, locale);
        const description = localize(cohort.description, locale);
        return (
          <section key={cohort.id} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold" lang={label.lang}>
              {label.text}
            </h2>
            <p className="text-sm text-muted" lang={description.lang}>
              {description.text}
            </p>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {cohort.members.map((member, i) => (
                <MemberCard
                  key={i}
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
