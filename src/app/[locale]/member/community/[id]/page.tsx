import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createComment, deleteComment, deletePost, togglePostLike } from "../actions";
import { requireMember } from "@/lib/member-auth";
import { getMemberPost } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function MemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post) notFound();

  const isAuthor = post.authorId === member.user.id;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <Link href="/member/community" className="text-sm text-primary">← 회원 게시판</Link>
      <article className="rounded border border-border p-6">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span className={`rounded px-2 py-1 ${post.category === "notice" ? "bg-amber-100 text-amber-900" : "bg-surface"}`}>{post.category === "notice" ? "회원 공지" : "자유글"}</span>
          <span>{post.authorName}</span>
          <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
        </div>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="mt-5 whitespace-pre-wrap leading-7">{post.content}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <form action={togglePostLike.bind(null, locale, post.id)}>
            <button type="submit" className="rounded border border-border px-3 py-2 text-sm hover:bg-surface">좋아요 {post.likeCount}</button>
          </form>
          <span className="text-sm text-muted">댓글 {post.commentCount}</span>
          {isAuthor && (
            <>
              <Link href={`/member/community/${post.id}/edit`} className="rounded border border-border px-3 py-2 text-sm hover:bg-surface">수정</Link>
              <form action={deletePost.bind(null, locale, post.id)}>
                <button type="submit" className="rounded border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">삭제</button>
              </form>
            </>
          )}
        </div>
      </article>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">댓글 {post.commentCount}</h2>
        <form action={createComment.bind(null, locale, post.id)} className="flex flex-col gap-2">
          <textarea name="content" required maxLength={2000} rows={3} placeholder="댓글을 남겨 보세요." className="rounded border border-border px-3 py-2" />
          <button type="submit" className="w-fit rounded bg-primary px-3 py-2 text-sm font-medium text-white">댓글 등록</button>
        </form>
        <div className="flex flex-col divide-y divide-border rounded border border-border">
          {post.comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span>{comment.authorName} · {comment.createdAt.toLocaleDateString("ko-KR")}</span>
                {comment.authorId === member.user.id && (
                  <form action={deleteComment.bind(null, locale, post.id, comment.id)}>
                    <button type="submit" className="text-red-700">삭제</button>
                  </form>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{comment.content}</p>
            </div>
          ))}
          {post.comments.length === 0 && <p className="p-5 text-sm text-muted">아직 댓글이 없습니다.</p>}
        </div>
      </section>
    </main>
  );
}
