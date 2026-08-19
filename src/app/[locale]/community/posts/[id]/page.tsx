import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PostInteractions } from "@/components/PostInteractions";
import { requireMember } from "@/lib/member";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function CommunityPostPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PostPage");
  const { supabase, userId } = await requireMember(locale);

  const [{ data: post }, { data: comments }, { data: likes }] = await Promise.all([
    supabase.from("posts").select("id, author_id, title, content, category, created_at, updated_at").eq("id", id).maybeSingle(),
    supabase.from("comments").select("id, author_id, content, created_at").eq("post_id", id).order("created_at", { ascending: true }),
    supabase.from("post_likes").select("user_id").eq("post_id", id),
  ]);

  if (!post) {
    notFound();
  }

  const authorIds = [...new Set([post.author_id, ...(comments ?? []).map((comment) => comment.author_id)])];
  const { data: profiles } = await supabase.from("profiles").select("id, name, cohort").in("id", authorIds);
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const author = profileById.get(post.author_id);
  const isAuthor = post.author_id === userId;
  const likedByCurrentUser = (likes ?? []).some((like) => like.user_id === userId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/community" className="w-fit text-sm text-muted hover:text-primary">{t("back")}</Link>
        {isAuthor && (
          <Link href={`/community/posts/${post.id}/edit`} className="rounded border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
            {t("edit")}
          </Link>
        )}
      </div>
      <article className="flex flex-col gap-4">
        <div>
          <div className="flex gap-2 text-sm text-muted">
            <span>{post.category === "notice" ? t("notice") : t("free")}</span>
            <span aria-hidden>·</span>
            <Link href={`/community/members/${post.author_id}`} className="hover:text-primary">
              {author?.name ?? t("unknownAuthor")}
            </Link>
            {author?.cohort && <span>{author.cohort}</span>}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{post.title}</h1>
          <time className="mt-2 block text-sm text-muted">
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(post.created_at))}
          </time>
        </div>
        <div className="whitespace-pre-wrap leading-7">{post.content}</div>
      </article>
      <PostInteractions
        postId={post.id}
        userId={userId}
        likeCount={likes?.length ?? 0}
        initiallyLiked={likedByCurrentUser}
        labels={{
          like: t("like"),
          unlike: t("unlike"),
          likes: t("likes", { count: "{count}" }),
          comment: t("comment"),
          commentPlaceholder: t("commentPlaceholder"),
          submitComment: t("submitComment"),
          error: t("interactionError"),
        }}
      />
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("comments", { count: comments?.length ?? 0 })}</h2>
        {comments && comments.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {comments.map((comment) => {
              const commentAuthor = profileById.get(comment.author_id);
              return (
                <li key={comment.id} className="py-4">
                  <div className="flex flex-wrap gap-x-2 text-sm">
                    <Link href={`/community/members/${comment.author_id}`} className="font-medium hover:text-primary">
                      {commentAuthor?.name ?? t("unknownAuthor")}
                    </Link>
                    <time className="text-muted">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(comment.created_at))}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noComments")}</p>
        )}
      </section>
    </main>
  );
}
