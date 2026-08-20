import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member";

type Props = { params: Promise<{ locale: string }> };

export default async function CommunityMembersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CommunityMembersPage");
  const { supabase, userId } = await requireMember(locale);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, cohort, bio, interests")
    .order("cohort", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("description")}</p>
        </div>
        <Link href="/community/profile" className="rounded border border-border px-3 py-2 text-sm hover:border-primary hover:text-primary">
          {t("myProfile")}
        </Link>
      </div>
      {profiles && profiles.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="rounded border border-border p-4">
              <Link href={`/community/members/${profile.id}`} className="block hover:text-primary">
                <div className="flex flex-wrap gap-x-2">
                  <h2 className="font-semibold">{profile.name ?? t("unknown")}</h2>
                  {profile.cohort && <span className="text-sm text-muted">{profile.cohort}</span>}
                  {profile.id === userId && <span className="text-xs text-muted">{t("me")}</span>}
                </div>
                {profile.bio && <p className="mt-2 line-clamp-2 text-sm text-muted">{profile.bio}</p>}
                {profile.interests && profile.interests.length > 0 && (
                  <p className="mt-2 text-xs text-muted">{profile.interests.join(" · ")}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t("empty")}</p>
      )}
    </main>
  );
}
