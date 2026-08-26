import { getTranslations, setRequestLocale } from "next-intl/server";
import { alumniCohorts } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AlumniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AlumniPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <ul className="flex flex-col gap-3">
        {[...alumniCohorts].reverse().map((cohort) => {
          const label = localize(cohort.label, locale);
          return (
            <li key={cohort.id}>
              <Link
                href={`/members/alumni/${cohort.id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-foreground hover:border-primary"
              >
                <span lang={label.lang}>{label.text}</span>
                <span className="text-sm text-muted">{t("viewCohort")}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
