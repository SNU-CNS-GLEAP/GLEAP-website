import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireMember } from "@/lib/member-auth";
import { getMemberPosts } from "@/lib/member-community";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberCommunityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  await requireMember(locale);
  const posts = await getMemberPosts();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("communityPrivate")}
        title={t("communityTitle")}
        index="01"
        actions={(
          <Link href="/member/community/new" className="border border-white/30 bg-white px-5 py-3 text-[.68rem] font-semibold uppercase tracking-[.18em] text-primary-deep transition hover:bg-accent">
            {t("write")}
          </Link>
        )}
      />
      {posts.length === 0 ? (
        <div className="border-x border-b border-border px-8 py-20 text-center text-muted">
          <p className="font-serif text-xl text-primary-deep">{t("emptyPostsTitle")}</p>
          <p className="mt-1 text-sm">{t("emptyPostsDescription")}</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border border-x border-b border-border bg-white">
          {posts.map((post, index) => (
            <Link key={post.id} href={`/member/community/${post.id}`} className="group grid gap-4 p-6 transition hover:bg-surface sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:p-7">
              <span className="font-serif text-2xl text-primary/35">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[.7rem] uppercase tracking-[.1em] text-muted">
                  <span className={`border px-2.5 py-1 font-semibold ${post.category === "notice" ? "border-[#b49347] text-[#826a31]" : "border-border text-foreground"}`}>
                    {post.category === "notice" ? t("notice") : t("freePost")}
                  </span>
                  <span className="font-semibold text-foreground">{post.authorName}</span>
                  <span>·</span>
                  <span>{post.createdAt.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US")}</span>
                </div>
                <h2 className="font-serif text-xl text-primary-deep transition group-hover:text-primary">{post.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">{post.content}</p>
              </div>
              <div className="flex gap-3 text-xs text-muted sm:flex-col sm:items-end">
                <span>{t("commentsCount", { count: post.commentCount })}</span>
                <span>{t("likesCount", { count: post.likeCount })}</span>
                <span>{t("dislikesCount", { count: post.dislikeCount })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
