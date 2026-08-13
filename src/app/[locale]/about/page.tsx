import { getLocale, getTranslations } from "next-intl/server";
import { about } from "@/content/about";
import { localize } from "@/lib/localized-text";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("AboutPage");
  const motto = localize(about.motto, locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400" lang={motto.lang}>
        {motto.text}
      </p>
      <div className="flex flex-col gap-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
        {about.paragraphs.map((paragraph, i) => {
          const { text, lang } = localize(paragraph, locale);
          return (
            <p key={i} lang={lang}>
              {text}
            </p>
          );
        })}
      </div>
    </main>
  );
}
