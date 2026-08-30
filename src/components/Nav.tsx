"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { MobileNav } from "@/components/MobileNav";
import { logout } from "@/app/[locale]/admin/(dashboard)/actions";
import type { SiteSettingsDocument } from "@/content/managed-site";
import { aboutNavigationItems } from "@/content/about-navigation";
import { localize } from "@/lib/localized-text";
import { CSRF_FIELD_NAME } from "@/lib/csrf-shared";
import { POST_SECTIONS, POST_SECTION_LABELS } from "@/lib/post-sections";

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
};

function GlobeIcon() {
  return (
    <span aria-hidden="true" className="relative block h-[19px] w-[19px] rounded-full border-[1.5px] border-current">
      <span className="absolute inset-y-[-1.5px] left-1/2 w-[8px] -translate-x-1/2 rounded-[50%] border-x border-current" />
      <span className="absolute inset-x-[-1.5px] top-1/2 -translate-y-1/2 border-t border-current" />
    </span>
  );
}

function CloseIcon() {
  return (
    <span aria-hidden="true" className="relative block h-5 w-5">
      <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
      <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
    </span>
  );
}

function MegaTrigger({
  label,
  active,
  open,
  controls,
  onOpen,
}: {
  label: string;
  active: boolean;
  open: boolean;
  controls: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={onOpen}
      onFocus={onOpen}
      aria-expanded={open}
      aria-controls={controls}
      className={`flex h-[76px] items-center border-b-2 px-4 text-[16px] font-semibold tracking-[-.01em] transition hover:border-accent hover:text-primary ${active || open ? "border-accent text-primary-deep" : "border-transparent"}`}
    >
      {label}
    </button>
  );
}

export type ActivityNavItem = {
  id: string;
  label: string;
  lang?: string;
};

export function Nav({ activityItems, settings }: { activityItems: ActivityNavItem[]; settings: SiteSettingsDocument }) {
  const locale = useLocale();
  const navigation = settings.navigation[locale === "en" ? "en" : "ko"];
  const pathname = usePathname();
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [openMega, setOpenMega] = useState<"about" | "members" | "activities" | "news" | null>(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpenMega(null);
      setLanguageOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!openMega && !languageOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMega(null);
        setLanguageOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const trigger = languageOpen
        ? languageTriggerRef.current
        : headerRef.current?.querySelector<HTMLButtonElement>(
            `[aria-controls="site-mega-${openMega}"]`,
          );
      setOpenMega(null);
      setLanguageOpen(false);
      trigger?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [languageOpen, openMega]);

  // 경로 기반 체크는 로그인 상태 fetch가 끝나기 전에도(또는 실패해도) /admin 안에서는
  // 바로 표시되게 하는 fallback. 실제 로그인 상태(isAdminSession)는 /admin 밖에서도
  // 헤더가 유지되게 함 — 세션 쿠키를 서버 컴포넌트에서 직접 읽지 않으므로 공개 페이지의
  // 정적 렌더링에는 영향 없음 (CLAUDE.md "공개 페이지에서의 수정 진입점" 패턴).
  const isAdminMode =
    isAdminSession || (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login"));
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const isEnglish = locale === "en";
  const megaContent = openMega === "about"
    ? {
        eyebrow: "ABOUT GLEAP",
        title: isEnglish ? "Science connected by people" : "사람으로 연결되는 과학",
        description: isEnglish
          ? "Discover GLEAP's identity, message, history, and the rhythm of its year."
          : "GLEAP의 정체성과 인사말, 성장의 기록, 한 해의 흐름을 살펴보세요.",
        rootHref: "/about" as const,
        rootLabel: navigation.about,
        items: aboutNavigationItems.map((item) => {
          const label = localize(item.label, locale);
          return { href: item.href, label: label.text, lang: label.lang };
        }),
      }
    : openMega === "members"
    ? {
        eyebrow: "GLEAP PEOPLE",
        title: isEnglish ? "People who explore together" : "함께 탐구하는 사람들",
        description: isEnglish
          ? "Meet the current members shaping GLEAP and the alumni who have shared its journey."
          : "GLEAP을 만들어가는 현재 구성원과 그 여정을 함께한 동문을 만나보세요.",
        rootHref: "/members" as const,
        rootLabel: navigation.members,
        items: [
          { href: "/members" as const, label: navigation.membersCurrent },
          { href: "/members/alumni" as const, label: navigation.membersAlumni },
        ],
      }
    : openMega === "activities"
      ? {
          eyebrow: "GLEAP PROGRAMS",
          title: isEnglish ? "Curiosity put into action" : "호기심을 행동으로",
          description: isEnglish
            ? "Explore the programs where scientific curiosity becomes shared experience and meaningful action."
            : "과학적 호기심이 함께하는 경험과 의미 있는 실천으로 이어지는 활동을 살펴보세요.",
          rootHref: "/activities" as const,
          rootLabel: navigation.activities,
          items: activityItems.map((item) => ({
            href: `/activities/${item.id}` as const,
            label: item.label,
            lang: item.lang,
          })),
        }
      : openMega === "news"
        ? {
            eyebrow: "GLEAP NEWSROOM",
            title: isEnglish ? "Stories from across GLEAP" : "GLEAP의 오늘을 전하는 소식",
            description: isEnglish
              ? "Browse notices, academic updates, and stories from GLEAP activities."
              : "공지사항과 학술 소식, 활동 현장의 이야기를 한곳에서 살펴보세요.",
            rootHref: "/news" as const,
            rootLabel: navigation.news,
            items: POST_SECTIONS.map((section) => ({
              href: `/news?section=${section}` as const,
              label: POST_SECTION_LABELS[section][isEnglish ? "en" : "ko"],
            })),
          }
      : null;

  return (
    <header
      ref={headerRef}
      data-site-header
      onMouseLeave={() => {
        setOpenMega(null);
        setLanguageOpen(false);
      }}
      className={`sticky top-0 z-40 w-full border-b bg-background ${isAdminMode ? "border-b-2 border-admin" : "border-border/80"}`}
    >
      <div className="mx-auto flex h-[72px] max-w-[94rem] items-center justify-between px-6 md:px-10 lg:grid lg:h-[76px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:px-12">
        <Link
          href="/"
          onMouseEnter={() => {
            setOpenMega(null);
            setLanguageOpen(false);
          }}
          onFocus={() => {
            setOpenMega(null);
            setLanguageOpen(false);
          }}
          className="group flex items-center gap-3 lg:justify-self-start"
          aria-label="GLEAP"
        >
          <Image src="/logo_gleap.png" alt="GLEAP" width={767} height={219} className="h-6 w-auto transition-opacity group-hover:opacity-75 sm:h-7" loading="eager" />
          <span className="hidden h-4 w-px bg-border lg:block" aria-hidden />
          <span className="hidden whitespace-nowrap text-[11px] font-normal leading-none tracking-[.04em] text-muted lg:block">
            <span className="font-normal text-primary">G</span>lobal {" "}
            <span className="font-normal text-primary">LEA</span>dership
            <br />
            <span className="font-normal text-primary">P</span>rogram
          </span>
          {isAdminMode && (
            <span className="rounded bg-admin px-1.5 py-0.5 text-[10px] font-semibold text-white">
              ADMIN
            </span>
          )}
        </Link>

        <nav
          aria-label={navigation.primaryNavigation}
          className="hidden h-full items-center justify-center gap-10 lg:flex xl:gap-16"
        >
          <MegaTrigger
            label={navigation.about}
            active={isActive("/about")}
            open={openMega === "about"}
            controls="site-mega-about"
            onOpen={() => {
              setLanguageOpen(false);
              setOpenMega("about");
            }}
          />
          <MegaTrigger
            label={navigation.members}
            active={isActive("/members")}
            open={openMega === "members"}
            controls="site-mega-members"
            onOpen={() => {
              setLanguageOpen(false);
              setOpenMega("members");
            }}
          />
          <MegaTrigger
            label={navigation.activities}
            active={isActive("/activities")}
            open={openMega === "activities"}
            controls="site-mega-activities"
            onOpen={() => {
              setLanguageOpen(false);
              setOpenMega("activities");
            }}
          />
          <MegaTrigger
            label={navigation.news}
            active={isActive("/news")}
            open={openMega === "news"}
            controls="site-mega-news"
            onOpen={() => {
              setLanguageOpen(false);
              setOpenMega("news");
            }}
          />
        </nav>

        <div className="hidden items-center justify-self-end gap-2 lg:flex">
          <div
            className="relative after:absolute after:inset-x-0 after:top-full after:h-2 after:content-['']"
            onMouseEnter={() => {
              setOpenMega(null);
              setLanguageOpen(true);
            }}
            onMouseLeave={() => setLanguageOpen(false)}
          >
            <button
              ref={languageTriggerRef}
              type="button"
              aria-label={languageOpen
                ? (isEnglish ? "Close language menu" : "언어 메뉴 닫기")
                : (isEnglish ? "Change language" : "언어 변경")}
              aria-expanded={languageOpen}
              aria-controls="site-language-menu"
              onClick={() => {
                setOpenMega(null);
                setLanguageOpen((current) => !current);
              }}
              className={`flex h-10 w-10 items-center justify-center border transition hover:border-primary hover:text-primary ${languageOpen ? "border-primary text-primary" : "border-border text-primary-deep"}`}
            >
              {languageOpen ? <CloseIcon /> : <GlobeIcon />}
            </button>

            <div
              id="site-language-menu"
              role="menu"
              aria-hidden={!languageOpen}
              inert={!languageOpen}
              className={`absolute right-0 top-[calc(100%+.5rem)] z-50 min-w-36 border border-border bg-background p-1.5 shadow-[0_16px_40px_rgba(7,27,73,.14)] transition ${languageOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0"}`}
            >
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  hrefLang={l}
                  role="menuitem"
                  aria-current={locale === l ? "page" : undefined}
                  onClick={() => setLanguageOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-[13px] transition hover:bg-surface hover:text-primary ${locale === l ? "font-semibold text-primary" : "text-foreground"}`}
                >
                  <span>{localeLabels[l]}</span>
                  <span className="text-[10px] uppercase tracking-[.1em] text-muted">{l}</span>
                </Link>
              ))}
              {isAdminMode && (
                <form action={logout.bind(null, locale)} className="mt-1 border-t border-border pt-1">
                  <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
                  <button type="submit" className="w-full px-3 py-2 text-left text-[12px] text-admin hover:bg-surface">
                    {navigation.logout}
                  </button>
                </form>
              )}
            </div>
          </div>

          <Link
            href="/member"
            onMouseEnter={() => {
              setOpenMega(null);
              setLanguageOpen(false);
            }}
            onFocus={() => {
              setOpenMega(null);
              setLanguageOpen(false);
            }}
            aria-current={isActive("/member") ? "page" : undefined}
            className="flex h-10 items-center border border-primary-deep bg-primary-deep px-4 text-[13px] font-semibold tracking-[.02em] text-white transition hover:border-accent hover:bg-accent"
          >
            {navigation.community}
          </Link>
        </div>

        <MobileNav
          locale={locale}
          isAdminMode={isAdminMode}
          csrfToken={csrfToken}
          activityItems={activityItems}
          navigation={navigation}
        />
      </div>

      {megaContent && (
        <div
          id={`site-mega-${openMega}`}
          className="site-mega-panel absolute inset-x-0 top-full z-50 hidden border-b border-t border-border bg-background shadow-[0_24px_70px_rgba(7,27,73,.14)] lg:block"
          aria-label={megaContent.rootLabel}
        >
          <div className="mx-auto grid max-w-[94rem] grid-cols-[minmax(18rem,.72fr)_minmax(0,1.28fr)] px-10 xl:px-12">
            <div className="border-r border-border py-9 pr-12">
              <p className="font-mono text-[10px] font-semibold tracking-[.16em] text-accent">{megaContent.eyebrow}</p>
              <h2 className="site-mega-title mt-4 max-w-[12ch] text-[clamp(2rem,3vw,3.25rem)] font-semibold leading-[1.04] tracking-[-.055em] text-primary-deep">
                {megaContent.title}
              </h2>
              <p className="mt-5 max-w-md text-[13px] leading-7 text-muted">{megaContent.description}</p>
            </div>

            <div className="py-9 pl-12">
              <div className="flex items-center justify-between border-b border-primary-deep pb-4">
                <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-muted">
                  {isEnglish ? "Explore" : "살펴보기"}
                </span>
                <Link
                  href={megaContent.rootHref}
                  onClick={() => setOpenMega(null)}
                  className="flex items-center gap-3 text-[12px] font-semibold text-primary-deep transition hover:gap-4 hover:text-accent"
                >
                  {isEnglish ? `All ${megaContent.rootLabel}` : `${megaContent.rootLabel} 전체 보기`}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-10">
                {megaContent.items.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    lang={"lang" in item ? item.lang : undefined}
                    onClick={() => setOpenMega(null)}
                    className="group grid min-h-20 grid-cols-[2.5rem_1fr_auto] items-center border-b border-border transition hover:border-accent"
                  >
                    <span className="font-mono text-[10px] tracking-[.12em] text-muted">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-[15px] font-semibold text-foreground transition group-hover:text-primary">{item.label}</span>
                    <span className="translate-x-0 text-sm text-accent transition group-hover:translate-x-1" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
