import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Errors");

  return (
    <main className="page-shell flex flex-1 items-center">
      <div className="page-content w-full">
        <p className="page-kicker"><span aria-hidden />{t("notFoundEyebrow")}</p>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-.06em] text-primary-deep sm:text-7xl">{t("notFoundTitle")}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">{t("notFoundDescription")}</p>
        <Link href="/" className="editorial-link mt-8">{t("home")} <span aria-hidden>→</span></Link>
      </div>
    </main>
  );
}
