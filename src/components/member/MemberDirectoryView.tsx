"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Profile = {
  userId: string;
  name: string;
  cohort: string | null;
  bio: string | null;
  interests: string[];
  instagramUrl: string | null;
  githubUrl: string | null;
  role: string;
};

type Props = {
  profiles: Profile[];
};

function getMemberPhotoPath(
  cohort?: string | null,
  name?: string | null
): string | null {
  if (!name || name.includes("관리자") || name.includes("GLEAP")) return null;
  const cleanCohort = cohort ? cohort.replace(/[^0-9]/g, "") : "";
  if (cleanCohort) {
    return `/members/${cleanCohort}${name}.jpg`;
  }
  return `/members/${name}.jpg`;
}

function getInstagramLink(
  idOrUrl?: string | null
): { url: string; display: string } | null {
  if (!idOrUrl) return null;
  const cleanId = idOrUrl
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();
  if (!cleanId) return null;
  return {
    url: `https://instagram.com/${cleanId}`,
    display: `@${cleanId}`,
  };
}

function parseBioAndPosition(rawBio?: string | null): {
  position: string;
  bio: string;
} {
  if (!rawBio) return { position: "", bio: "" };
  if (rawBio.startsWith("[") && rawBio.includes("]")) {
    const closeIdx = rawBio.indexOf("]");
    return {
      position: rawBio.slice(1, closeIdx).trim(),
      bio: rawBio.slice(closeIdx + 1).trim(),
    };
  }
  return { position: "", bio: rawBio.trim() };
}

function parseInterestsAndHobbies(rawInterests?: string[] | null): {
  academic: string[];
  hobbies: string[];
} {
  if (!rawInterests) return { academic: [], hobbies: [] };
  const academic: string[] = [];
  const hobbies: string[] = [];

  for (const item of rawInterests) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (
      trimmed.startsWith("취미:") ||
      trimmed.startsWith("취미 :") ||
      trimmed.startsWith("hobby:")
    ) {
      const cleanHobby = trimmed
        .replace(/^(취미\s*:\s*|hobby\s*:\s*)/i, "")
        .trim();
      if (cleanHobby) hobbies.push(cleanHobby);
    } else {
      academic.push(trimmed);
    }
  }

  return { academic, hobbies };
}

export function MemberDirectoryView({ profiles }: Props) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedProfile(null);
      }
    }
    if (selectedProfile) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedProfile]);

  // 1. 관리자 / 공식 계정
  const adminProfiles = profiles.filter(
    (p) =>
      p.name.includes("관리자") ||
      p.name.includes("GLEAP") ||
      (!p.cohort && p.role === "admin")
  );

  // 2. 현재 활동 기수 (15기 Junior, 14기 Senior)
  const active15Profiles = profiles.filter(
    (p) =>
      !adminProfiles.includes(p) &&
      (p.cohort === "15기" || p.cohort === "15")
  );
  const active14Profiles = profiles.filter(
    (p) =>
      !adminProfiles.includes(p) &&
      (p.cohort === "14기" || p.cohort === "14")
  );

  // 3. 역대 회원 및 기타 기수 (13기 이하 또는 기타)
  const alumniProfiles = profiles.filter(
    (p) =>
      !adminProfiles.includes(p) &&
      !active15Profiles.includes(p) &&
      !active14Profiles.includes(p)
  );

  function renderMemberCompactCard(profile: Profile) {
    const isOfficialAdmin =
      profile.name.includes("관리자") || profile.name.includes("GLEAP");
    const photoPath = isOfficialAdmin
      ? "/logo_gleap.png"
      : getMemberPhotoPath(profile.cohort, profile.name);

    return (
      <button
        key={profile.userId}
        type="button"
        onClick={() => setSelectedProfile(profile)}
        className="group flex items-center gap-3.5 rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {isOfficialAdmin ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface p-2">
            <Image
              src="/logo_gleap.png"
              alt="GLEAP"
              width={40}
              height={40}
              className="h-auto w-full object-contain"
            />
          </div>
        ) : photoPath ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
            <Image
              src={photoPath}
              alt={profile.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/20 text-base font-bold text-primary">
            {profile.name.slice(0, 2)}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="break-keep font-bold text-foreground group-hover:text-primary transition">
              {profile.name}
            </span>
            {isOfficialAdmin ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                공식
              </span>
            ) : profile.role === "admin" ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                운영진
              </span>
            ) : null}
          </div>
          {profile.cohort && (
            <span className="text-xs font-semibold text-primary/90">
              {profile.cohort}
            </span>
          )}
        </div>

        <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition">
          상세 →
        </span>
      </button>
    );
  }

  // 모달에 표시할 파싱된 데이터
  const selectedBioAndPos = selectedProfile
    ? parseBioAndPosition(selectedProfile.bio)
    : { position: "", bio: "" };
  const selectedInterestsAndHobbies = selectedProfile
    ? parseInterestsAndHobbies(selectedProfile.interests)
    : { academic: [], hobbies: [] };
  const selectedInstagram = selectedProfile
    ? getInstagramLink(selectedProfile.instagramUrl)
    : null;
  const selectedPhotoPath = selectedProfile
    ? selectedProfile.name.includes("관리자") ||
      selectedProfile.name.includes("GLEAP")
      ? "/logo_gleap.png"
      : getMemberPhotoPath(selectedProfile.cohort, selectedProfile.name)
    : null;
  const isSelectedAdmin =
    selectedProfile?.name.includes("관리자") ||
    selectedProfile?.name.includes("GLEAP");

  return (
    <>
      <div className="flex flex-col gap-10">
        {/* 1. 운영진 / 공식 계정 */}
        {adminProfiles.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>
              <h2 className="text-lg font-bold text-foreground">운영진 (Admin)</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                {adminProfiles.length}
              </span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {adminProfiles.map(renderMemberCompactCard)}
            </div>
          </section>
        )}

        {/* 2. 현재 활동 기수 (15기 Junior & 14기 Senior) */}
        {(active15Profiles.length > 0 || active14Profiles.length > 0) && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-lg">✨</span>
              <h2 className="text-lg font-bold text-foreground">
                현재 활동 기수 (Active Members)
              </h2>
            </div>

            {/* 15기 */}
            {active15Profiles.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    15기 (Junior)
                  </span>
                  <span className="text-xs text-muted">
                    총 {active15Profiles.length}명
                  </span>
                </div>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {active15Profiles.map(renderMemberCompactCard)}
                </div>
              </div>
            )}

            {/* 14기 */}
            {active14Profiles.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    14기 (Senior)
                  </span>
                  <span className="text-xs text-muted">
                    총 {active14Profiles.length}명
                  </span>
                </div>
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {active14Profiles.map(renderMemberCompactCard)}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. 역대 회원 (Alumni) */}
        {alumniProfiles.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-lg">🎓</span>
              <h2 className="text-lg font-bold text-foreground">
                역대 회원 (Alumni)
              </h2>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-muted">
                {alumniProfiles.length}
              </span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {alumniProfiles.map(renderMemberCompactCard)}
            </div>
          </section>
        )}
      </div>

      {/* 4. 프로필 상세 모달 팝업 창 */}
      {selectedProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="relative flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setSelectedProfile(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted hover:bg-border hover:text-foreground transition text-lg"
            >
              ✕
            </button>

            {/* 프로필 헤더 */}
            <div className="flex items-center gap-5 border-b border-border pb-6">
              {isSelectedAdmin ? (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface p-3">
                  <Image
                    src="/logo_gleap.png"
                    alt="GLEAP"
                    width={72}
                    height={72}
                    className="h-auto w-full object-contain"
                  />
                </div>
              ) : selectedPhotoPath ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                  <Image
                    src={selectedPhotoPath}
                    alt={selectedProfile.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/20 text-2xl font-bold text-primary">
                  {selectedProfile.name.slice(0, 2)}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-keep text-2xl font-bold text-foreground">
                    {selectedProfile.name}
                  </h3>
                  {isSelectedAdmin ? (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      공식 계정
                    </span>
                  ) : selectedProfile.role === "admin" ? (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      운영진
                    </span>
                  ) : null}
                </div>

                {selectedProfile.cohort && (
                  <span className="inline-block w-fit rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {selectedProfile.cohort}
                  </span>
                )}
              </div>
            </div>

            {/* 상세 프로필 정보 목록 */}
            <div className="flex flex-col gap-4 text-sm">
              {/* 직책 / 소속 팀 */}
              {selectedBioAndPos.position && (
                <div className="flex flex-col gap-1 rounded-xl bg-surface/60 p-3.5">
                  <span className="text-xs font-semibold text-muted">
                    🏢 직책 / 소속 팀
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedBioAndPos.position}
                  </span>
                </div>
              )}

              {/* 학술 / 전공 관심 분야 */}
              {selectedInterestsAndHobbies.academic.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-surface/60 p-3.5">
                  <span className="text-xs font-semibold text-muted">
                    🔬 학술 / 전공 관심 분야
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterestsAndHobbies.academic.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-background px-2.5 py-1 text-xs font-medium text-primary border border-border shadow-2xs"
                      >
                        #{item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 취미 및 개인 관심사 */}
              {selectedInterestsAndHobbies.hobbies.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-surface/60 p-3.5">
                  <span className="text-xs font-semibold text-muted">
                    🎮 취미 및 관심사
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterestsAndHobbies.hobbies.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-background px-2.5 py-1 text-xs font-medium text-foreground border border-border shadow-2xs"
                      >
                        #{item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 한 줄 소개 */}
              {selectedBioAndPos.bio && (
                <div className="flex flex-col gap-1 rounded-xl bg-surface/60 p-3.5">
                  <span className="text-xs font-semibold text-muted">
                    💬 한 줄 소개
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 font-normal">
                    {selectedBioAndPos.bio}
                  </p>
                </div>
              )}

              {/* SNS 및 외부 링크 */}
              {(selectedInstagram || selectedProfile.githubUrl) && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {selectedInstagram && (
                    <a
                      href={selectedInstagram.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-primary hover:bg-surface transition shadow-xs"
                    >
                      <span>📷 Instagram ({selectedInstagram.display})</span>
                    </a>
                  )}
                  {selectedProfile.githubUrl && (
                    <a
                      href={selectedProfile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface transition shadow-xs"
                    >
                      <span>🐙 GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* 하단 닫기 */}
            <div className="flex justify-end border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
