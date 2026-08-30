import { MemberProfileForm } from "@/components/member/MemberProfileForm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { updateMyProfile } from "../community/actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { getMemberProfile } from "@/lib/member-community";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string }> };

export default async function MyMemberProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);
  const profile = await getMemberProfile(member.user.id);
  const csrfToken = await getCsrfToken();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("privateArea")}
        title={t("profilePageTitle")}
        description={t("profilePageDescription")}
        index="02"
      />

      <MemberProfileForm
        defaultValues={{
          name: profile?.name ?? member.user.name,
          cohort: profile?.cohort ?? "",
          bio: profile?.bio ?? "",
          interests: profile?.interests ?? [],
          instagramUrl: profile?.instagramUrl ?? "",
          githubUrl: profile?.githubUrl ?? "",
        }}
        action={updateMyProfile.bind(null, locale)}
        csrfToken={csrfToken}
      />
    </main>
  );
}
