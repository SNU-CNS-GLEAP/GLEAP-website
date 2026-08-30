import { MemberPostForm } from "@/components/member/MemberPostForm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPost } from "../actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string }> };

export default async function NewMemberPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);
  const csrfToken = await getCsrfToken();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("newPostKicker")}
        title={t("newPostTitle")}
        description={t("newPostDescription")}
        index="N"
      />

      <MemberPostForm
        mode="create"
        isAdmin={member.role === "admin"}
        action={createPost.bind(null, locale)}
        csrfToken={csrfToken}
      />
    </main>
  );
}
