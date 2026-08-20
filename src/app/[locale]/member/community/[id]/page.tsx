import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MemberCommentForm } from "@/components/member/MemberCommentForm";
import { createComment, deleteComment, deletePost, togglePostDislike, togglePostLike } from "../actions";
import { requireMember } from "@/lib/member-auth";
import { getMemberPost } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function MemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post) notFound();

  const isAuthor = post.authorId === member.user.id;
  const isAdmin = member.role === "admin";
  const canDeletePost = isAuthor || isAdmin;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <Link href="/member/community" className="text-sm font-medium text-primary hover:underline">
        ← 회원 게시판
      </Link>

      <article className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span
            className={`rounded px-2 py-0.5 font-medium ${
              post.category === "notice" ? "bg-amber-100 text-amber-900" : "bg-surface text-foreground"
            }`}
          >
            {post.category === "notice" ? "회원 공지" : "자유글"}
          </span>
          <span className="font-medium text-foreground">{post.authorName}</span>
          <span>·</span>
          <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{post.title}</h1>
        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">{post.content}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
          {/* 반응 버튼 (좋아요 / 싫어요 / 댓글 수) */}
          <div className="flex flex-wrap items-center gap-3">
            <form action={togglePostLike.bind(null, locale, post.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm font-medium hover:bg-surface transition shadow-sm"
              >
                <span>❤️ 좋아요</span>
                <span className="font-semibold text-primary">{post.likeCount}</span>
              </button>
            </form>

            <form action={togglePostDislike.bind(null, locale, post.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm font-medium hover:bg-surface transition shadow-sm"
              >
                <span>💔 싫어요</span>
                <span className="font-semibold text-muted">{post.dislikeCount}</span>
              </button>
            </form>

            <span className="text-sm text-muted">댓글 {post.commentCount}개</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <Link
                href={`/member/community/${post.id}/edit`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface transition"
              >
                수정
              </Link>
            )}
            {canDeletePost && (
              <form action={deletePost.bind(null, locale, post.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  {isAuthor ? "삭제" : "삭제 (운영진)"}
                </button>
              </form>
            )}
          </div>
        </div>
      </article>

      {/* 댓글 섹션: 기존 댓글 목록이 먼저 나오고, 작성 란이 맨 아래에 배치됨 */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">댓글 ({post.commentCount})</h2>

        {/* 1. 댓글 목록 */}
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-background shadow-sm">
          {post.comments.map((comment) => (
            <div key={comment.id} className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{comment.authorName}</span>
                  <span>·</span>
                  <span>{comment.createdAt.toLocaleDateString("ko-KR")}</span>
                </div>
                {(comment.authorId === member.user.id || isAdmin) && (
                  <form action={deleteComment.bind(null, locale, post.id, comment.id)}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      {comment.authorId === member.user.id ? "삭제" : "삭제 (운영진)"}
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}

          {post.comments.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">
              아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </p>
          )}
        </div>

        {/* 2. 댓글 작성 란 (확인 팝업이 포함된 클라이언트 컴포넌트) */}
        <MemberCommentForm action={createComment.bind(null, locale, post.id)} />
      </section>
    </main>
  );
}
