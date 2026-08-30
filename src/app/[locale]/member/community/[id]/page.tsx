import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MemberCommentForm } from "@/components/member/MemberCommentForm";
import { CsrfField } from "@/components/CsrfField";
import { createComment, deleteComment, deletePost, togglePostDislike, togglePostLike } from "../actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { getMemberPost } from "@/lib/member-community";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function MemberPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);
  const post = await getMemberPost(id);
  if (!post) notFound();
  const csrfToken = await getCsrfToken();

  const isAuthor = post.authorId === member.user.id;
  const isAdmin = member.role === "admin";
  const canDeletePost = isAuthor || isAdmin;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={post.category === "notice" ? t("notice") : t("freePost")}
        title={post.title}
        index="01"
        actions={<Link href="/member/community" className="text-[.68rem] font-semibold uppercase tracking-[.16em] text-white/70 hover:text-accent">{t("postBack")}</Link>}
      />

      <article className="border-x border-b border-border bg-white p-6 sm:p-10">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span
            className={`border px-2 py-0.5 font-medium ${
              post.category === "notice" ? "border-[#b49347] text-[#826a31]" : "border-border text-foreground"
            }`}
          >
            {post.category === "notice" ? t("notice") : t("freePost")}
          </span>
          <span className="font-medium text-foreground">{post.authorName}</span>
          <span>·</span>
          <span>{post.createdAt.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}</span>
        </div>

        <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-foreground/90">{post.content}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
          {/* 반응 버튼 (좋아요 / 싫어요 / 댓글 수) */}
          <div className="flex flex-wrap items-center gap-3">
            <form action={togglePostLike.bind(null, locale, post.id)}>
              <CsrfField />
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-border bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-surface"
              >
                <span>{t("like")}</span>
                <span className="font-semibold text-primary">{post.likeCount}</span>
              </button>
            </form>

            <form action={togglePostDislike.bind(null, locale, post.id)}>
              <CsrfField />
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-border bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-surface"
              >
                <span>{t("dislike")}</span>
                <span className="font-semibold text-muted">{post.dislikeCount}</span>
              </button>
            </form>

            <span className="text-sm text-muted">{t("commentsCount", { count: post.commentCount })}</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && (
              <Link
                href={`/member/community/${post.id}/edit`}
                className="border border-border px-3 py-2 text-xs font-medium transition hover:bg-surface"
              >
                {t("edit")}
              </Link>
            )}
            {canDeletePost && (
              <form action={deletePost.bind(null, locale, post.id)}>
                <CsrfField />
                <button
                  type="submit"
                  className="border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  {isAuthor ? t("delete") : t("deleteAdmin")}
                </button>
              </form>
            )}
          </div>
        </div>
      </article>

      {/* 댓글 섹션: 기존 댓글 목록이 먼저 나오고, 작성 란이 맨 아래에 배치됨 */}
      <section className="mt-10 flex flex-col gap-4">
        <h2 className="border-b border-border pb-3 font-serif text-2xl font-normal text-primary-deep">{t("commentsTitle", { count: post.commentCount })}</h2>

        {/* 1. 댓글 목록 */}
        <div className="flex flex-col divide-y divide-border border border-border bg-white">
          {post.comments.map((comment) => (
            <div key={comment.id} className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{comment.authorName}</span>
                  <span>·</span>
                  <span>{comment.createdAt.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}</span>
                </div>
                {(comment.authorId === member.user.id || isAdmin) && (
                  <form action={deleteComment.bind(null, locale, post.id, comment.id)}>
                    <CsrfField />
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      {comment.authorId === member.user.id ? t("delete") : t("deleteAdmin")}
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
              {t("emptyComments")}
            </p>
          )}
        </div>

        {/* 2. 댓글 작성 란 (확인 팝업이 포함된 클라이언트 컴포넌트) */}
        <MemberCommentForm
          action={createComment.bind(null, locale, post.id)}
          csrfToken={csrfToken}
        />
      </section>
    </main>
  );
}
