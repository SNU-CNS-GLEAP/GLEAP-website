import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CommunityPage");
  const { supabase, userId } = await requireMember(locale);

  const [{ data: posts }, { data: comments }, { data: likes }, { data: currentProfile }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, author_id, title, content, category, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("comments").select("post_id"),
    supabase.from("post_likes").select("post_id"),
    supabase.from("profiles").select("is_admin").eq("id", userId).single(),
  ]);

  const authorIds = [...new Set((posts ?? []).map((post) => post.author_id))];
  const { data: profiles } = authorIds.length
    ? await supabase.from("profiles").select("id, name, cohort").in("id", authorIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const commentCount = new Map<string, number>();
  const likeCount = new Map<string, number>();

  for (const comment of comments ?? []) {
    commentCount.set(comment.post_id, (commentCount.get(comment.post_id) ?? 0) + 1);
  }
  for (const like of likes ?? []) {
    likeCount.set(like.post_id, (likeCount.get(like.post_id) ?? 0) + 1);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/community/members" className="rounded border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary">
            {t("members")}
          </Link>
          <Link href="/community/new" className="rounded bg-primary px-3 py-2 text-sm font-medium text-white">
            {t("write")}
          </Link>
          {currentProfile?.is_admin && (
            <Link href="/community/notice/new" className="rounded border border-primary px-3 py-2 text-sm font-medium text-primary">
              {t("writeNotice")}
            </Link>
          )}
        </div>
      </div>

      {posts && posts.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {posts.map((post) => {
            const profile = profileById.get(post.author_id);
            return (
              <li key={post.id}>
                <Link href={`/community/posts/${post.id}`} className="block py-5 hover:text-primary">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span>{post.category === "notice" ? t("notice") : t("free")}</span>
                    <span aria-hidden>·</span>
                    <span>{profile?.name ?? t("unknownAuthor")}</span>
                    {profile?.cohort && <span>{profile.cohort}</span>}
                  </div>
                  <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-muted">{post.content}</p>
                  <div className="mt-2 flex gap-3 text-xs text-muted">
                    <span>{t("comments", { count: commentCount.get(post.id) ?? 0 })}</span>
                    <span>{t("likes", { count: likeCount.get(post.id) ?? 0 })}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">{t("empty")}</p>
      )}
    </main>
  );
}
