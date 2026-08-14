import { useLocale, useTranslations } from "next-intl";
import { localize } from "@/lib/localized-text";

const developerName = { ko: "15기 문현호", en: "15th Moon Hyunho" };

const developerLink = "https://github.com/SNU-CNS-GLEAP/GLEAP-website";

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const year = new Date().getFullYear();
  const developer = localize(developerName, locale);

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 py-3 text-center text-xs text-muted">
        <span>{t("rights", { year })}</span>
        <span aria-hidden>·</span>
        <span>
          {t("contact")}:{" "}
          <a href="mailto:snucnsgleap@gmail.com" className="hover:text-primary">
            snucnsgleap@gmail.com
          </a>
        </span>
        <span aria-hidden>·</span>
        <span lang={developer.lang}>
          {t("developer")}:{" "}
          <a href={developerLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
          {developer.text}
          </a>
        </span>
      </div>
    </footer>
  );
}
