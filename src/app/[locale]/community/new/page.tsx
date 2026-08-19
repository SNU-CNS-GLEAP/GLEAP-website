import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewPostForm } from "@/components/NewPostForm";
import { requireMember } from "@/lib/member";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewCommunityPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewPostPage");
  await requireMember(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/community" className="w-fit text-sm text-muted hover:text-primary">{t("back")}</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <NewPostForm
        locale={locale}
        labels={{
          title: t("fieldTitle"),
          content: t("fieldContent"),
          submit: t("submit"),
          pending: t("pending"),
          error: t("error"),
        }}
      />
    </main>
  );
}
