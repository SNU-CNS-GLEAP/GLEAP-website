"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { activityCategories } from "@/content/activities";
import { localize } from "@/lib/localized-text";
import { MobileNav } from "@/components/MobileNav";

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

function Dropdown({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: { href: string; label: string; lang?: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:text-primary"
      >
        {label}
      </button>
      <div
        className={`absolute left-0 top-full z-10 mt-2 flex min-w-40 origin-top flex-col rounded border border-border bg-background py-1 shadow-sm transition-all duration-150 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <Link
          href={href}
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm hover:bg-surface hover:text-primary"
        >
          {label}
        </Link>
        <div className="my-1 border-t border-border" />
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            lang={item.lang}
            className="px-4 py-2 text-sm hover:bg-surface hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Nav() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const isAdminMode = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  return (
    <header
      className={`border-b ${isAdminMode ? "border-b-2 border-admin bg-surface" : "border-border"}`}
    >
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo_gleap.png" alt="GLEAP" width={767} height={219} className="h-7 w-auto" priority />
          {isAdminMode && (
            <span className="rounded bg-admin px-1.5 py-0.5 text-[10px] font-semibold text-white">
              ADMIN
            </span>
          )}
        </Link>

        <div className="hidden gap-6 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/about" className="hover:text-primary">
            {t("about")}
          </Link>
          <Dropdown
            label={t("members")}
            href="/members"
            items={[
              { href: "/members", label: t("membersCurrent") },
              { href: "/members/alumni", label: t("membersAlumni") },
            ]}
          />
          <Dropdown
            label={t("activities")}
            href="/activities"
            items={activityCategories.map((category) => {
              const title = localize(category.title, locale);
              return { href: `/activities/${category.id}`, label: title.text, lang: title.lang };
            })}
          />
          <Link href="/news" className="hover:text-primary">
            {t("news")}
          </Link>
          <Link href="/community" className="hover:text-primary">
            {t("community")}
          </Link>
        </div>

        <div className="hidden gap-3 text-sm text-muted md:flex">
          {routing.locales.map((l) => (
            <Link key={l} href={pathname} locale={l} className="hover:text-primary">
              {localeLabels[l]}
            </Link>
          ))}
        </div>

        <MobileNav locale={locale} />
      </nav>
    </header>
  );
}
