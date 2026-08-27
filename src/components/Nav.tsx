"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { activityCategories } from "@/content/activities";
import { localize } from "@/lib/localized-text";
import { MobileNav } from "@/components/MobileNav";
import { logout } from "@/app/[locale]/admin/(dashboard)/actions";
import { DEFAULT_ALUMNI_COHORT_ID } from "@/content/members";
import { CSRF_FIELD_NAME } from "@/lib/csrf-shared";

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
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch("/api/session-status")
      .then((res) => res.json())
      .then((data) => {
        setIsAdminSession(Boolean(data.isAdmin));
        setCsrfToken(typeof data.csrfToken === "string" ? data.csrfToken : "");
      })
      .catch(() => {});
    // pathname을 deps에 넣는 이유: 이 컴포넌트는 루트 레이아웃에 있어 클라이언트 전환 시
    // 리마운트되지 않는다. deps가 []면 로그인/로그아웃(둘 다 redirect로 경로가 바뀜) 이후에도
    // 최초 마운트 시점의 로그인 상태가 그대로 남아 헤더가 안 바뀌는 문제가 있었음.
  }, [pathname]);

  // 경로 기반 체크는 로그인 상태 fetch가 끝나기 전에도(또는 실패해도) /admin 안에서는
  // 바로 표시되게 하는 fallback. 실제 로그인 상태(isAdminSession)는 /admin 밖에서도
  // 헤더가 유지되게 함 — 세션 쿠키를 서버 컴포넌트에서 직접 읽지 않으므로 공개 페이지의
  // 정적 렌더링에는 영향 없음 (CLAUDE.md "공개 페이지에서의 수정 진입점" 패턴).
  const isAdminMode =
    isAdminSession || (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login"));

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
              { href: `/members/alumni/${DEFAULT_ALUMNI_COHORT_ID}`, label: t("membersAlumni") },
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
          <Link href="/member" className="hover:text-primary">
            {t("community")}
          </Link>
        </div>

        <div className="hidden items-center gap-3 text-sm text-muted md:flex">
          {routing.locales.map((l) => (
            l !== locale && (
              <Link key={l} href={pathname} locale={l} className="hover:text-primary">
                {localeLabels[l]}
              </Link>
            )
          ))}
          {isAdminMode && (
            <form action={logout.bind(null, locale)}>
              <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
              <button type="submit" className="text-admin hover:underline">
                로그아웃
              </button>
            </form>
          )}
        </div>

        <MobileNav locale={locale} isAdminMode={isAdminMode} csrfToken={csrfToken} />
      </nav>
    </header>
  );
}
