import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { activityCategories } from "@/content/activities";
import { localize } from "@/lib/localized-text";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export function generateStaticParams() {
  return activityCategories.map((category) => ({ category: category.id }));
}

export default async function ActivityCategoryPage({ params }: Props) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);

  const category = activityCategories.find((c) => c.id === categoryId);
  if (!category) {
    notFound();
  }

  const t = await getTranslations("ActivitiesPage");
  const title = localize(category.title, locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link href="/activities" className="text-sm text-muted hover:text-primary">
          {t("backToAll")}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight" lang={title.lang}>
          {title.text}
        </h1>
      </div>
      <div className="flex flex-col gap-6">
        {category.programs.map((program, i) => {
          const name = localize(program.name, locale);
          const description = program.description ? localize(program.description, locale) : null;
          return (
            <section key={i} className="flex flex-col gap-2 border-b border-border pb-6 last:border-0">
              <h2 className="text-lg font-semibold" lang={name.lang}>
                {name.text}
              </h2>
              {description && (
                <p className="text-sm leading-relaxed text-foreground" lang={description.lang}>
                  {description.text}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
