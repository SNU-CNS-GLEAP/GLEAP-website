"use client";

import Image from "next/image";
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
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo_gleap.png" alt="GLEAP" width={767} height={219} className="h-7 w-auto" priority />
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/about" className="hover:text-primary">
            {t("about")}
          </Link>
          <Link href="/members" className="hover:text-primary">
            {t("members")}
          </Link>
          <Link href="/activities" className="hover:text-primary">
            {t("activities")}
          </Link>
        </div>
        <div className="flex gap-3 text-sm text-muted">
          {routing.locales.map((locale) => (
            <Link key={locale} href={pathname} locale={locale} className="hover:text-primary">
              {localeLabels[locale]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
