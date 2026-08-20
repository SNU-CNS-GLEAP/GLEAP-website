import { notFound } from "next/navigation";
import { updatePost } from "../../actions";
import { requireMember } from "@/lib/member-auth";
import { getMemberPost } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditMemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post || post.authorId !== member.user.id) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div><p className="text-sm text-muted">회원 전용</p><h1 className="text-2xl font-semibold">글 수정</h1></div>
      <form action={updatePost.bind(null, locale, post.id)} className="flex flex-col gap-4 rounded border border-border p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium">분류
          <select name="category" defaultValue={post.category} className="rounded border border-border px-3 py-2 font-normal">
            <option value="free">자유글</option>
            {member.role === "admin" && <option value="notice">회원 공지</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">제목
          <input name="title" required maxLength={200} defaultValue={post.title} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">내용
          <textarea name="content" required maxLength={20000} rows={12} defaultValue={post.content} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <button type="submit" className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white">저장</button>
      </form>
    </main>
  );
}
