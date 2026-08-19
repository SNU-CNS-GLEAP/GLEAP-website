import { getTranslations, setRequestLocale } from "next-intl/server";
import { alumniCohorts, DEFAULT_ALUMNI_COHORT_ID } from "@/content/members";
import { AlumniCohortBrowser } from "@/components/AlumniCohortBrowser";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AlumniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AlumniPage");
  const labels = await getTranslations("MemberCard");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <AlumniCohortBrowser
        cohorts={alumniCohorts}
        locale={locale}
        defaultCohortId={DEFAULT_ALUMNI_COHORT_ID}
        selectLabel={t("selectCohort")}
        emptyLabel={t("empty")}
        labels={{
          email: labels("email"),
          blog: labels("blog"),
          instagram: labels("instagram"),
          github: labels("github"),
          linkedin: labels("linkedin"),
        }}
      />
    </main>
  );
}
