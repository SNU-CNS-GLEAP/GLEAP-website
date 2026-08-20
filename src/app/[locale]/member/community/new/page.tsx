import { MemberPostForm } from "@/components/member/MemberPostForm";
import { createPost } from "../actions";
import { requireMember } from "@/lib/member-auth";

type Props = { params: Promise<{ locale: string }> };

export default async function NewMemberPostPage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          회원 전용 커뮤니티
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          새 글 작성
        </h1>
        <p className="mt-1 text-sm text-muted">
          GLEAP 부원들과 공유하고 싶은 이야기를 자유롭게 작성해 보세요.
        </p>
      </div>

      <MemberPostForm
        locale={locale}
        mode="create"
        isAdmin={member.role === "admin"}
        action={createPost.bind(null, locale)}
      />
    </main>
  );
}
