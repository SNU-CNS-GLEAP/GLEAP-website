import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NewNoticePostForm } from "@/components/NewNoticePostForm";
import { requireMember } from "@/lib/member";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewNoticePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewNoticePage");
  const { supabase, userId } = await requireMember(locale);
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();

  if (!profile?.is_admin) {
    redirect(`/${locale}/community`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/community" className="w-fit text-sm text-muted hover:text-primary">{t("back")}</Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("description")}</p>
      </div>
      <NewNoticePostForm
        locale={locale}
        labels={{
          title: t("fieldTitle"),
          content: t("fieldContent"),
          publishPublicly: t("publishPublicly"),
          submit: t("submit"),
          pending: t("pending"),
          error: t("error"),
        }}
      />
    </main>
  );
}
