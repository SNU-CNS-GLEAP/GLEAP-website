import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MemberPostForm } from "@/components/member/MemberPostForm";
import { updatePost } from "../../actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { getMemberPost } from "@/lib/member-community";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditMemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post || post.authorId !== member.user.id) notFound();
  const csrfToken = await getCsrfToken();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("newPostKicker")}
        title={t("editPostTitle")}
        description={t("editPostDescription")}
        index="E"
      />

      <MemberPostForm
        mode="edit"
        isAdmin={member.role === "admin"}
        defaultValues={{
          category: post.category,
          title: post.title,
          content: post.content,
        }}
        action={updatePost.bind(null, locale, post.id)}
        csrfToken={csrfToken}
      />
    </main>
  );
}
