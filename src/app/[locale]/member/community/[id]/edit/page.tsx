import { notFound } from "next/navigation";
import { MemberPostForm } from "@/components/member/MemberPostForm";
import { updatePost } from "../../actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { getMemberPost } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditMemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post || post.authorId !== member.user.id) notFound();
  const csrfToken = await getCsrfToken();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          회원 전용 커뮤니티
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          글 수정
        </h1>
        <p className="mt-1 text-sm text-muted">
          게시글 내용을 수정한 뒤 저장해 주세요.
        </p>
      </div>

      <MemberPostForm
        locale={locale}
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
