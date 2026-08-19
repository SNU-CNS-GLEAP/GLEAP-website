import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function CommunityMemberDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberProfilePage");
  const { supabase, userId } = await requireMember(locale);
  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, name, cohort, bio, interests, instagram_url, github_url")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("posts").select("id, title, content, category, created_at").eq("author_id", id).order("created_at", { ascending: false }),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/community/members" className="w-fit text-sm text-muted hover:text-primary">{t("back")}</Link>
        {profile.id === userId && (
          <Link href="/community/profile" className="rounded border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
            {t("edit")}
          </Link>
        )}
      </div>
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{profile.name ?? t("unknown")}</h1>
          {profile.cohort && <p className="mt-2 text-muted">{profile.cohort}</p>}
        </div>
        {profile.bio && <p className="whitespace-pre-wrap leading-7">{profile.bio}</p>}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest: string) => (
              <span key={interest} className="rounded-full border border-border px-3 py-1 text-sm text-muted">{interest}</span>
            ))}
          </div>
        )}
        {(profile.instagram_url || profile.github_url) && (
          <div className="flex flex-wrap gap-3 text-sm">
            {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("instagram")}</a>}
            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t("github")}</a>}
          </div>
        )}
      </section>
      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-xl font-semibold">{t("posts")}</h2>
        {posts && posts.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/community/posts/${post.id}`} className="block py-4 hover:text-primary">
                  <span className="text-xs text-muted">{post.category === "notice" ? t("notice") : t("free")}</span>
                  <h3 className="mt-1 font-semibold">{post.title}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{post.content}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noPosts")}</p>
        )}
      </section>
    </main>
  );
}
