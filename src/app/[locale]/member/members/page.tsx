import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfiles } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

function getMemberPhotoPath(cohort?: string | null, name?: string | null): string | null {
  if (!name) return null;
  const cleanCohort = cohort ? cohort.replace(/[^0-9]/g, "") : "";
  if (cleanCohort) {
    return `/members/${cleanCohort}${name}.jpg`;
  }
  return `/members/${name}.jpg`;
}

export default async function MemberDirectoryPage({ params }: Props) {
  const { locale } = await params;
  await requireMember(locale);
  const profiles = await getMemberProfiles();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">회원 전용 공간</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">GLEAP 구성원 명단</h1>
          <p className="mt-1 text-sm text-muted">
            동아리 부원들의 프로필과 기수별 소개 정보를 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/member/profile" className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition">
            내 프로필 수정
          </Link>
          <Link href="/member" className="text-sm font-medium text-primary hover:underline">
            ← 회원 홈
          </Link>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          <p className="text-base font-medium">아직 등록된 회원 프로필이 없습니다.</p>
          <p className="mt-1 text-sm">운영진 관리 페이지에서 회원을 초대하면 프로필이 연동됩니다.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => {
            const photoPath = getMemberPhotoPath(profile.cohort, profile.name);

            return (
              <article
                key={profile.userId}
                className="flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start gap-4">
                    {photoPath ? (
                      <Image
                        src={photoPath}
                        alt={profile.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-full object-cover border border-border bg-surface"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary border border-border">
                        {profile.name.slice(0, 1)}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
                        {profile.role === "admin" && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            운영진
                          </span>
                        )}
                      </div>
                      {profile.cohort && (
                        <span className="mt-0.5 text-xs font-medium text-primary">
                          {profile.cohort}
                        </span>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="mt-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {profile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(profile.instagramUrl || profile.githubUrl) && (
                  <div className="mt-5 flex gap-3 border-t border-border pt-3 text-xs font-medium text-primary">
                    {profile.instagramUrl && (
                      <a
                        href={profile.instagramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>📷 Instagram</span>
                      </a>
                    )}
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>🐙 GitHub</span>
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
