import { getTranslations, setRequestLocale } from "next-intl/server";
import { alumni } from "@/content/members";
import { localize } from "@/lib/localized-text";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AlumniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AlumniPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {alumni.map((member, i) => {
          const name = localize(member.name, locale);
          const department = localize(member.department, locale);
          const role = member.role ? localize(member.role, locale) : null;
          return (
            <li key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="h-20 w-20 rounded-full bg-surface" />
              <span className="text-sm font-medium" lang={name.lang}>
                {name.text}
              </span>
              {role && (
                <span className="text-xs text-primary" lang={role.lang}>
                  {role.text}
                </span>
              )}
              <span className="text-xs text-muted" lang={department.lang}>
                {department.text}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
