"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { activityCategories } from "@/content/activities";
import { localize } from "@/lib/localized-text";

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export function MobileNav({ locale }: { locale: string }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeNav = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span className="h-0.5 w-5 bg-foreground" />
        <span className="h-0.5 w-5 bg-foreground" />
        <span className="h-0.5 w-5 bg-foreground" />
      </button>

      <div
        className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-200 ease-out ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-sm font-medium text-muted">{t("menu")}</span>
          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-6 text-lg">
          <Link href="/" onClick={closeNav} className="py-2 font-medium hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/about" onClick={closeNav} className="py-2 font-medium hover:text-primary">
            {t("about")}
          </Link>

          <span className="pt-2 font-medium">{t("members")}</span>
          <Link href="/members" onClick={closeNav} className="py-2 pl-4 text-base text-muted hover:text-primary">
            {t("membersCurrent")}
          </Link>
          <Link href="/members/alumni" onClick={closeNav} className="py-2 pl-4 text-base text-muted hover:text-primary">
            {t("membersAlumni")}
          </Link>

          <span className="pt-2 font-medium">{t("activities")}</span>
          {activityCategories.map((category) => {
            const title = localize(category.title, locale);
            return (
              <Link
                key={category.id}
                href={`/activities/${category.id}`}
                onClick={closeNav}
                className="py-2 pl-4 text-base text-muted hover:text-primary"
                lang={title.lang}
              >
                {title.text}
              </Link>
            );
          })}

          <Link href="/news" onClick={closeNav} className="py-2 font-medium hover:text-primary">
            {t("news")}
          </Link>
          <Link href="/member" onClick={closeNav} className="py-2 font-medium hover:text-primary">
            {t("community")}
          </Link>
        </nav>

        <div className="flex gap-4 border-t border-border px-6 py-4 text-sm text-muted">
          {routing.locales.map((l) => (
            <Link key={l} href={pathname} locale={l} onClick={closeNav} className="hover:text-primary">
              {localeLabels[l]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
