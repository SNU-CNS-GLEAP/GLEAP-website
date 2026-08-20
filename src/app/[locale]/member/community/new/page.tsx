import { createPost } from "../actions";
import { requireMember } from "@/lib/member-auth";

type Props = { params: Promise<{ locale: string }> };

export default async function NewMemberPostPage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm text-muted">회원 전용</p>
        <h1 className="text-2xl font-semibold">새 글 작성</h1>
      </div>
      <form action={createPost.bind(null, locale)} className="flex flex-col gap-4 rounded border border-border p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          분류
          <select name="category" className="rounded border border-border px-3 py-2 font-normal">
            <option value="free">자유글</option>
            {member.role === "admin" && <option value="notice">회원 공지</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          제목
          <input name="title" required maxLength={200} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          내용
          <textarea name="content" required maxLength={20000} rows={12} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <button type="submit" className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white">등록</button>
      </form>
    </main>
  );
}
