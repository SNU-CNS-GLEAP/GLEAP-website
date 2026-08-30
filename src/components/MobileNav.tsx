"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { logout } from "@/app/[locale]/admin/(dashboard)/actions";
import type { ActivityNavItem } from "@/components/Nav";
import type { NavCopy } from "@/content/managed-site";
import { aboutNavigationItems } from "@/content/about-navigation";
import { localize } from "@/lib/localized-text";
import { CSRF_FIELD_NAME } from "@/lib/csrf-shared";
import { POST_SECTIONS, POST_SECTION_LABELS } from "@/lib/post-sections";

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

export function MobileNav({
  locale,
  isAdminMode,
  csrfToken,
  activityItems,
  navigation,
}: {
  locale: string;
  isAdminMode: boolean;
  csrfToken: string;
  activityItems: ActivityNavItem[];
  navigation: NavCopy;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeNav = () => setOpen(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={navigation.menu}
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-border bg-background"
      >
        <span className="h-0.5 w-5 bg-foreground" />
        <span className="h-0.5 w-5 bg-foreground" />
        <span className="h-0.5 w-5 bg-foreground" />
      </button>

      <div
        ref={dialogRef}
        id="mobile-site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={navigation.menu}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 ease-out ${
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border px-6">
          <span className="text-xs font-semibold uppercase tracking-[.2em] text-muted">{navigation.menu}</span>
          <button
            ref={closeRef}
            type="button"
            aria-label={navigation.close}
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="flex h-10 w-10 items-center justify-center border border-border text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8 text-2xl tracking-[-.03em]">
          <Link href="/about" onClick={closeNav} className={`pt-2 font-medium hover:text-primary ${isActive("/about") ? "text-primary" : ""}`}>
            {navigation.about}
          </Link>
          {aboutNavigationItems.map((item) => {
            const label = localize(item.label, locale);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeNav}
                aria-current={pathname === item.href ? "page" : undefined}
                className="py-2 pl-4 text-base text-muted hover:text-primary"
                lang={label.lang}
              >
                {label.text}
              </Link>
            );
          })}

          <Link href="/members" onClick={closeNav} className={`pt-2 font-medium hover:text-primary ${isActive("/members") ? "text-primary" : ""}`}>{navigation.members}</Link>
          <Link href="/members" onClick={closeNav} aria-current={pathname === "/members" ? "page" : undefined} className="py-2 pl-4 text-base text-muted hover:text-primary">
            {navigation.membersCurrent}
          </Link>
          <Link href="/members/alumni" onClick={closeNav} className="py-2 pl-4 text-base text-muted hover:text-primary">
            {navigation.membersAlumni}
          </Link>

          <Link href="/activities" onClick={closeNav} className={`pt-2 font-medium hover:text-primary ${isActive("/activities") ? "text-primary" : ""}`}>{navigation.activities}</Link>
          {activityItems.map((item) => {
            return (
              <Link
                key={item.id}
                href={`/activities/${item.id}`}
                onClick={closeNav}
                className="py-2 pl-4 text-base text-muted hover:text-primary"
                lang={item.lang}
              >
                {item.label}
              </Link>
            );
          })}

          <Link href="/news" onClick={closeNav} aria-current={isActive("/news") ? "page" : undefined} className={`py-2 font-medium hover:text-primary ${isActive("/news") ? "text-primary" : ""}`}>
            {navigation.news}
          </Link>
          {POST_SECTIONS.map((section) => (
            <Link
              key={section}
              href={`/news?section=${section}`}
              onClick={closeNav}
              className="py-2 pl-4 text-base text-muted hover:text-primary"
            >
              {POST_SECTION_LABELS[section][locale === "en" ? "en" : "ko"]}
            </Link>
          ))}
          <Link href="/member" onClick={closeNav} aria-current={isActive("/member") ? "page" : undefined} className={`py-2 font-medium hover:text-primary ${isActive("/member") ? "text-primary" : ""}`}>
            {navigation.community}
          </Link>
        </nav>

        <div className="flex items-center gap-4 border-t border-border px-6 py-4 text-sm text-muted">
          {routing.locales.map((l) => (
            <Link key={l} href={pathname} locale={l} hrefLang={l} aria-current={locale === l ? "page" : undefined} onClick={closeNav} className={locale === l ? "font-semibold text-primary" : "hover:text-primary"}>
              {localeLabels[l]}
            </Link>
          ))}
          {isAdminMode && (
            <form action={logout.bind(null, locale)} className="ml-auto">
              <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
              <button type="submit" className="text-admin hover:underline">
              {navigation.logout}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
