import { MemberProfileForm } from "@/components/member/MemberProfileForm";
import { updateMyProfile } from "../community/actions";
import { requireMember } from "@/lib/member-auth";
import { getCsrfToken } from "@/lib/csrf";
import { getMemberProfile } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

export default async function MyMemberProfilePage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);
  const profile = await getMemberProfile(member.user.id);
  const csrfToken = await getCsrfToken();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          회원 전용 공간
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          내 프로필 관리
        </h1>
        <p className="mt-1 text-sm text-muted">
          동아리 부원들에게 공개되는 프로필 정보를 수정합니다. (연락처 등 민감 정보는 기재하지 마세요)
        </p>
      </div>

      <MemberProfileForm
        locale={locale}
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
