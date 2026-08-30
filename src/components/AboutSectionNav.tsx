import { Link } from "@/i18n/navigation";
import { aboutNavigationItems, type AboutPageKey } from "@/content/about-navigation";
import { localize } from "@/lib/localized-text";

export function AboutSectionNav({ current, locale }: { current: AboutPageKey; locale: string }) {
  return (
    <nav aria-label={locale === "en" ? "About GLEAP" : "글립 소개"} className="border-y border-border">
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {aboutNavigationItems.map((item) => {
          const label = localize(item.label, locale);
          const isCurrent = item.id === current;

          return (
            <li key={item.id} className="border-b border-border last:border-b-0 sm:nth-[2n+1]:border-r sm:nth-last-[-n+2]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`group flex min-h-24 items-center gap-4 px-4 py-5 transition sm:px-5 ${
                  isCurrent ? "bg-primary-deep text-white" : "bg-white hover:bg-surface"
                }`}
              >
                <span className={`font-mono text-[10px] tracking-[.14em] ${isCurrent ? "text-cyan" : "text-accent"}`}>
                  {item.index}
                </span>
                <span className="text-sm font-semibold" lang={label.lang}>{label.text}</span>
                <span className={`ml-auto transition group-hover:translate-x-1 ${isCurrent ? "text-cyan" : "text-muted"}`} aria-hidden>→</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
