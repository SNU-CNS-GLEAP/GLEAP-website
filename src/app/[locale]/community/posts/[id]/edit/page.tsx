import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EditPostForm } from "@/components/EditPostForm";
import { requireMember } from "@/lib/member";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditCommunityPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("EditPostPage");
  const { supabase, userId } = await requireMember(locale);
  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, title, content")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    notFound();
  }
  if (post.author_id !== userId) {
    redirect(`/${locale}/community/posts/${id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href={`/community/posts/${id}`} className="w-fit text-sm text-muted hover:text-primary">{t("back")}</Link>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <EditPostForm
        locale={locale}
        post={post}
        labels={{
          title: t("fieldTitle"),
          content: t("fieldContent"),
          save: t("save"),
          saving: t("saving"),
          delete: t("delete"),
          confirmDelete: t("confirmDelete"),
          error: t("error"),
        }}
      />
    </main>
  );
}
