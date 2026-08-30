import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatContentTemplate, localize } from "@/lib/localized-text";
import type { SiteSettingsDocument } from "@/content/managed-site";

const BRAND_MOTTO = "Connect Science, Illuminate the World.";

export function Footer({ settings }: { settings: SiteSettingsDocument }) {
  const locale = useLocale();
  const year = new Date().getFullYear();
  const isEnglish = locale === "en";
  const copy = settings.footer[isEnglish ? "en" : "ko"];
  const developer = localize(settings.developerName, locale);
  const navigation = settings.navigation[isEnglish ? "en" : "ko"];
  const relatedSites = isEnglish ? "Related sites" : "관련 사이트";
  const institution = isEnglish
    ? "SNU College of Natural Sciences · GLEAP"
    : "서울대학교 자연과학대학 · GLEAP";
  const operator = isEnglish
    ? "Operated by SNU College of Natural Sciences GLEAP"
    : "운영: 서울대학교 자연과학대학 GLEAP";
  const legalLinks = isEnglish
    ? [
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/terms", label: "Terms of Use" },
        { href: "/legal/email-rejection", label: "No Email Collection" },
        { href: "/legal/copyright", label: "Copyright Notice" },
      ]
    : [
        { href: "/legal/privacy", label: "개인정보처리방침" },
        { href: "/legal/terms", label: "이용약관" },
        { href: "/legal/email-rejection", label: "이메일무단수집거부" },
        { href: "/legal/copyright", label: "저작권 안내" },
      ];

  return (
    <footer className="site-footer text-foreground">
      <div className="mx-auto max-w-[94rem] px-6 md:px-10 xl:px-12">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#dbe4f0] py-5 text-[10px] font-semibold uppercase tracking-[.15em] text-primary">
          <span>Seoul National University</span>
          <span className="hidden h-3 w-px bg-[#c9d6e7] sm:block" aria-hidden />
          <span>College of Natural Sciences</span>
          <span className="ml-auto text-muted">Established 2012</span>
        </div>

        <div className="grid gap-12 py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-18 xl:gap-24">
          <div>
            <Image src="/logo_gleap.png" alt="GLEAP" width={767} height={219} className="h-7 w-auto" />
            <h2 className="mt-7 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-[-.035em] text-primary-deep sm:text-4xl">
              {BRAND_MOTTO}
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="border-l-2 border-primary pl-3 text-[10px] font-semibold uppercase tracking-[.16em] text-primary-deep">{copy.explore}</p>
              <nav className="mt-5 flex flex-col gap-3 text-sm text-muted">
                <Link href="/about" className="transition hover:text-primary">{navigation.about}</Link>
                <Link href="/activities" className="transition hover:text-primary">{navigation.activities}</Link>
                <Link href="/members" className="transition hover:text-primary">{navigation.members}</Link>
                <Link href="/news" className="transition hover:text-primary">{navigation.news}</Link>
              </nav>
            </div>

            <div>
              <p className="border-l-2 border-primary pl-3 text-[10px] font-semibold uppercase tracking-[.16em] text-primary-deep">{copy.contact}</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-muted">
                <a href={`mailto:${settings.contactEmail}`} className="break-words transition hover:text-primary">{settings.contactEmail}</a>
                <span>{copy.location}</span>
                <Link href="/member" className="transition hover:text-primary">{navigation.community}</Link>
              </div>
            </div>

            <div>
              <p className="border-l-2 border-primary pl-3 text-[10px] font-semibold uppercase tracking-[.16em] text-primary-deep">{relatedSites}</p>
              <div className="mt-5 flex flex-col gap-3 text-sm text-muted">
                <a href="https://www.snu.ac.kr/" target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">
                  {isEnglish ? "Seoul National University" : "서울대학교"}
                </a>
                <a href="https://science.snu.ac.kr/" target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">
                  {isEnglish ? "College of Natural Sciences" : "자연과학대학"}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#dbe4f0] py-5 text-[11px] text-muted lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label={isEnglish ? "Policies" : "정책 문서"}>
            {legalLinks.map((item, index) => (
              <span key={item.href} className="contents">
                {index > 0 ? <span aria-hidden className="text-[#b4c0d0]">·</span> : null}
                <Link
                  href={item.href}
                  className={`transition hover:text-primary ${item.href === "/legal/privacy" ? "font-bold text-primary-deep" : ""}`}
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:justify-end lg:text-right">
            <span>{operator}</span>
            <span aria-hidden className="text-[#b4c0d0]">·</span>
            <a href={`mailto:${settings.contactEmail}`} className="transition hover:text-primary">
              {isEnglish ? "Contact" : "문의"}: {settings.contactEmail}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-primary-deep text-white/70">
        <div className="mx-auto flex max-w-[94rem] flex-col gap-3 px-6 py-5 text-[11px] sm:flex-row sm:items-center md:px-10 xl:px-12">
          <span>{formatContentTemplate(copy.rights, { year })}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:ml-auto sm:justify-end sm:text-right">
            <span>{institution}</span>
            <span aria-hidden className="text-white/30">·</span>
            <span lang={developer.lang}>
              {copy.developer}: <a href={settings.developerLink} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{developer.text}</a>
            </span>
            <span aria-hidden className="text-white/30">·</span>
            <Link href="/admin" className="transition hover:text-white">{copy.admin}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
