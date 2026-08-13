import { getLocale, getTranslations } from "next-intl/server";
import { cohorts } from "@/content/members";
import { localize } from "@/lib/localized-text";

export default async function MembersPage() {
  const locale = await getLocale();
  const t = await getTranslations("MembersPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      {cohorts.map((cohort) => {
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
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {cohort.members.map((member, i) => {
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
          </section>
        );
      })}
    </main>
  );
}
