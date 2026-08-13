import { useLocale, useTranslations } from "next-intl";
import { localize } from "@/lib/localized-text";

const developerName = { ko: "문현호 (Octo Moon)", en: "Moon Hyunho (Octo Moon)" };

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
          {t("developer")}: {developer.text} ·{" "}
          <a href="mailto:octahedron00@gmail.com" className="hover:text-primary">
            octahedron00@gmail.com
          </a>
        </span>
      </div>
    </footer>
  );
}
