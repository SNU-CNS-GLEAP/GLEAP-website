import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfiles } from "@/lib/member-community";
import { MemberDirectoryView } from "@/components/member/MemberDirectoryView";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberDirectoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  await requireMember(locale);
  const profiles = await getMemberProfiles();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("privateArea")}
        title={t("directoryPageTitle")}
        description={t("directoryPageDescription")}
        index="03"
        actions={(
          <>
          <Link
            href="/member/profile"
            className="border border-white/30 bg-white px-4 py-3 text-[.68rem] font-semibold uppercase tracking-[.16em] text-primary-deep transition hover:bg-accent"
          >
            {t("editMyProfile")}
          </Link>
          <Link
            href="/member"
            className="px-2 py-3 text-[.68rem] font-semibold uppercase tracking-[.16em] text-white/70 hover:text-accent"
          >
            {t("backMemberHome")}
          </Link>
          </>
        )}
      />

      {profiles.length === 0 ? (
        <div className="border-x border-b border-border p-16 text-center text-muted">
          <p className="font-serif text-xl text-primary-deep">{t("emptyProfiles")}</p>
          <p className="mt-1 text-sm">
            {t("emptyProfilesHint")}
          </p>
        </div>
      ) : (
        <MemberDirectoryView profiles={profiles} />
      )}
    </main>
  );
}
