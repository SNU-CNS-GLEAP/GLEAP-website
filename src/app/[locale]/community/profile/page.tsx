import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProfileEditor } from "@/components/ProfileEditor";
import { requireMember } from "@/lib/member";

type Props = { params: Promise<{ locale: string }> };

export default async function MyProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MyProfilePage");
  const { supabase, userId } = await requireMember(locale);
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, cohort, bio, interests, instagram_url, github_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    throw new Error("A signed-in member must have a profile.");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted">{t("description")}</p>
        </div>
        <Link href={`/community/members/${userId}`} className="rounded border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
          {t("view")}
        </Link>
      </div>
      <ProfileEditor
        profile={profile}
        labels={{
          name: t("name"),
          cohort: t("cohort"),
          bio: t("bio"),
          interests: t("interests"),
          interestsHint: t("interestsHint"),
          instagram: t("instagram"),
          github: t("github"),
          save: t("save"),
          saving: t("saving"),
          password: t("password"),
          passwordHint: t("passwordHint"),
          updatePassword: t("updatePassword"),
          error: t("error"),
          saved: t("saved"),
        }}
      />
    </main>
  );
}
