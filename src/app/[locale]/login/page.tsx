import { getTranslations, setRequestLocale } from "next-intl/server";
import { MemberLoginForm } from "@/components/MemberLoginForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberLoginPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-xl text-muted">{t("description")}</p>
      </div>
      <MemberLoginForm
        locale={locale}
        labels={{
          email: t("email"),
          password: t("password"),
          submit: t("submit"),
          pending: t("pending"),
          invalid: t("invalid"),
        }}
      />
      <p className="max-w-xl text-sm text-muted">{t("invitationOnly")}</p>
    </main>
  );
}
