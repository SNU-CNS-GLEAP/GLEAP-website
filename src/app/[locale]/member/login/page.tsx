import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MemberAuthForm } from "@/components/member/MemberAuthForm";
import { env } from "@/lib/env";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MemberArea" });
  return { title: t("loginTitle"), description: t("loginDescription") };
}

export default async function MemberLoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");

  return (
    <main className="flex flex-1 items-center bg-[radial-gradient(circle_at_80%_10%,rgba(105,216,255,.14),transparent_24rem),linear-gradient(180deg,#fff,#fbfdff)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="mb-8 w-full">
          <p className="page-kicker"><span aria-hidden />{t("privateArea")}</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] text-primary-deep sm:text-5xl">{t("loginTitle")}</h1>
          <p className="mt-4 text-sm leading-7 text-muted">{t("loginDescription")}</p>
        </div>
        <MemberAuthForm
          locale={locale}
          mode="sign-in"
          turnstileSiteKey={env.turnstileSiteKey}
        />
        <p className="mt-5 text-sm text-muted">
          {t("loginPrompt")} <Link href="/member/signup" className="text-primary underline">{t("signupLink")}</Link>
        </p>
      </div>
    </main>
  );
}
