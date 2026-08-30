"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell flex flex-1 items-center">
      <div className="page-content w-full">
        <p className="page-kicker"><span aria-hidden />{t("errorEyebrow")}</p>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-.06em] text-primary-deep sm:text-7xl">{t("errorTitle")}</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">{t("errorDescription")}</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button type="button" onClick={() => retry()} className="form-button-primary">{t("retry")}</button>
          <Link href="/" className="editorial-link">{t("home")} <span aria-hidden>→</span></Link>
        </div>
      </div>
    </main>
  );
}
