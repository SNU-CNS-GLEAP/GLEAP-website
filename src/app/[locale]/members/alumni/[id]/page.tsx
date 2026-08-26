import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alumniCohorts } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { Link } from "@/i18n/navigation";
import { MemberCard } from "@/components/MemberCard";
import { AlumniCohortSelect } from "@/components/AlumniCohortSelect";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  return alumniCohorts.map((cohort) => ({ id: String(cohort.id) }));
}

export default async function AlumniCohortPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const cohort = alumniCohorts.find((c) => c.id === Number(id));
  if (!cohort) {
    notFound();
  }

  const t = await getTranslations("AlumniPage");
  const label = localize(cohort.label, locale);
  const description = localize(cohort.description, locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight" lang={label.lang}>
          {t("title")}
        </h1>
        <AlumniCohortSelect
          cohorts={[...alumniCohorts].reverse()}
          locale={locale}
          selectedId={cohort.id}
          label={t("otherCohorts")}
        />
        <p className="text-sm text-muted" lang={description.lang}>
          {description.text}
        </p>
      </div>

      {cohort.members.length > 0 ? (
        <>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {cohort.members.map((member, i) => (
                <MemberCard key={i} member={member} locale={locale} />
            ))}
            </ul>
            <p className="text-xs text-muted text-center" lang={locale}>
                {t("contactMessage")}
            </p>
        </>
      ) : (
        <p className="text-sm text-muted">{t("empty")}</p>
      )}
    </main>
  );
}
