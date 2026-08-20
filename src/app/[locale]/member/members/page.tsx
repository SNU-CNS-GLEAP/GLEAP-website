import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfiles } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

type Profile = Awaited<ReturnType<typeof getMemberProfiles>>[number];

function getMemberPhotoPath(cohort?: string | null, name?: string | null): string | null {
  if (!name || name.includes("관리자") || name.includes("GLEAP")) return null;
  const cleanCohort = cohort ? cohort.replace(/[^0-9]/g, "") : "";
  if (cleanCohort) {
    return `/members/${cleanCohort}${name}.jpg`;
  }
  return `/members/${name}.jpg`;
}

function MemberCard({ profile }: { profile: Profile }) {
  const isOfficialAdmin =
    profile.name.includes("관리자") || profile.name.includes("GLEAP");
  const photoPath = isOfficialAdmin ? "/logo_gleap.png" : getMemberPhotoPath(profile.cohort, profile.name);

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div>
        <div className="flex items-center gap-4">
          {isOfficialAdmin ? (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface p-2.5">
              <Image
                src="/logo_gleap.png"
                alt="GLEAP"
                width={56}
                height={56}
                className="h-auto w-full object-contain"
              />
            </div>
          ) : photoPath ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface">
              <Image
                src={photoPath}
                alt={profile.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 text-xl font-bold text-primary border border-primary/20">
              {profile.name.slice(0, 2)}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-keep text-lg font-bold text-foreground">
                {profile.name}
              </h3>
              {isOfficialAdmin ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  공식 계정
                </span>
              ) : profile.role === "admin" ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  운영진
                </span>
              ) : null}
            </div>

            {profile.cohort && (
              <span className="mt-0.5 text-xs font-semibold text-primary">
                {profile.cohort}
              </span>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/80 break-keep whitespace-pre-wrap">
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
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-3.5 text-xs font-medium text-primary">
          {profile.instagramUrl && (
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <span>📷 Instagram</span>
            </a>
          )}
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <span>🐙 GitHub</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default async function MemberDirectoryPage({ params }: Props) {
  const { locale } = await params;
  await requireMember(locale);
  const profiles = await getMemberProfiles();

  // 1. 관리자 / 공식 계정
  const adminProfiles = profiles.filter(
    (p) => p.name.includes("관리자") || p.name.includes("GLEAP") || (!p.cohort && p.role === "admin")
  );

  // 2. 현재 활동 기수 (15기 Junior, 14기 Senior)
  const active15Profiles = profiles.filter(
    (p) => !adminProfiles.includes(p) && (p.cohort === "15기" || p.cohort === "15")
  );
  const active14Profiles = profiles.filter(
    (p) => !adminProfiles.includes(p) && (p.cohort === "14기" || p.cohort === "14")
  );

  // 3. 역대 회원 및 기타 기수 (13기 이하 또는 기타)
  const alumniProfiles = profiles.filter(
    (p) =>
      !adminProfiles.includes(p) &&
      !active15Profiles.includes(p) &&
      !active14Profiles.includes(p)
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            회원 전용 공간
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            GLEAP 구성원 명단
          </h1>
          <p className="mt-1 text-sm text-muted">
            동아리 부원들의 프로필과 기수별 소개 정보를 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/member/profile"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface transition shadow-sm"
          >
            내 프로필 수정
          </Link>
          <Link href="/member" className="text-sm font-medium text-primary hover:underline">
            ← 회원 홈
          </Link>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <p className="text-base font-medium">아직 등록된 회원 프로필이 없습니다.</p>
          <p className="mt-1 text-sm">운영진 관리 페이지에서 회원을 초대하면 프로필이 연동됩니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* 1. 운영진 / 관리자 섹션 */}
          {adminProfiles.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h2 className="text-xl font-bold text-foreground">운영진 (Admin)</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  {adminProfiles.length}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {adminProfiles.map((profile) => (
                  <MemberCard key={profile.userId} profile={profile} />
                ))}
              </div>
            </section>
          )}

          {/* 2. 현재 활동 기수 섹션 (15기 Junior & 14기 Senior) */}
          {(active15Profiles.length > 0 || active14Profiles.length > 0) && (
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="text-xl">✨</span>
                <h2 className="text-xl font-bold text-foreground">현재 활동 기수 (Active Members)</h2>
              </div>

              {/* 15기 */}
              {active15Profiles.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      15기 (Junior)
                    </span>
                    <span className="text-xs text-muted">총 {active15Profiles.length}명</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {active15Profiles.map((profile) => (
                      <MemberCard key={profile.userId} profile={profile} />
                    ))}
                  </div>
                </div>
              )}

              {/* 14기 */}
              {active14Profiles.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      14기 (Senior)
                    </span>
                    <span className="text-xs text-muted">총 {active14Profiles.length}명</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {active14Profiles.map((profile) => (
                      <MemberCard key={profile.userId} profile={profile} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 3. 역대 회원 섹션 (Alumni) */}
          {alumniProfiles.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="text-xl">🎓</span>
                <h2 className="text-xl font-bold text-foreground">역대 회원 (Alumni)</h2>
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted">
                  {alumniProfiles.length}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {alumniProfiles.map((profile) => (
                  <MemberCard key={profile.userId} profile={profile} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
