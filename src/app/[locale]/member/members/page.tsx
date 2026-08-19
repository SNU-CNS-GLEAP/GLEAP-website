import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfiles } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberDirectoryPage({ params }: Props) {
  const { locale } = await params;
  await requireMember(locale);
  const profiles = await getMemberProfiles();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-muted">회원 전용</p><h1 className="text-2xl font-semibold">회원 목록</h1></div>
        <Link href="/member/profile" className="text-sm text-primary">내 프로필 수정</Link>
      </div>
      {profiles.length === 0 ? (
        <p className="rounded border border-dashed border-border p-8 text-center text-muted">아직 등록된 회원 프로필이 없습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <article key={profile.userId} className="rounded border border-border p-5">
              <div className="flex items-center gap-2"><h2 className="font-semibold">{profile.name}</h2>{profile.role === "admin" && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">운영진</span>}</div>
              {profile.cohort && <p className="mt-1 text-sm text-muted">{profile.cohort}</p>}
              {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
              {profile.interests.length > 0 && <p className="mt-3 text-xs text-muted">관심 분야: {profile.interests.join(", ")}</p>}
              <div className="mt-4 flex gap-3 text-sm text-primary">
                {profile.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="underline">Instagram</a>}
                {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="underline">GitHub</a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
