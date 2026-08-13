import { getLocale, getTranslations } from "next-intl/server";
import { activityCategories } from "@/content/activities";
import { localize } from "@/lib/localized-text";

export default async function ActivitiesPage() {
  const locale = await getLocale();
  const t = await getTranslations("ActivitiesPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      {activityCategories.map((category) => {
        const title = localize(category.title, locale);
        return (
          <section key={category.id} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold" lang={title.lang}>
              {title.text}
            </h2>
            <ul className="flex flex-col gap-1">
              {category.programs.map((program, i) => {
                const name = localize(program.name, locale);
                return (
                  <li key={i} className="text-foreground" lang={name.lang}>
                    {name.text}
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
