"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export function Nav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/">{t("home")}</Link>
          <Link href="/about">{t("about")}</Link>
          <Link href="/members">{t("members")}</Link>
          <Link href="/activities">{t("activities")}</Link>
        </div>
        <div className="flex gap-3 text-sm text-zinc-500">
          {routing.locales.map((locale) => (
            <Link key={locale} href={pathname} locale={locale}>
              {localeLabels[locale]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
