"use client";

import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CsrfInputs } from "@/components/CsrfInputs";

type Props = {
  locale: string;
  defaultValues?: {
    name?: string;
    cohort?: string | null;
    bio?: string | null;
    interests?: string[];
    instagramUrl?: string | null;
    githubUrl?: string | null;
  };
  action: (formData: FormData) => Promise<void>;
  csrfToken: string;
};

// bio 문자열에서 [직책]과 한 줄 소개를 파싱 (정규식 플래그 오류 없이 안전하게 파싱)
function parseBioAndPosition(rawBio?: string | null): { position: string; bio: string } {
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

// interests 배열에서 전공/학술 분야와 취미를 분리
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

export function MemberProfileForm({ locale, defaultValues, action, csrfToken }: Props) {
  const parsed = parseBioAndPosition(defaultValues?.bio);
  const parsedInterests = parseInterestsAndHobbies(defaultValues?.interests);

  const [name, setName] = useState(defaultValues?.name || "");
  const [cohort, setCohort] = useState(defaultValues?.cohort || "");
  const [position, setPosition] = useState(parsed.position);
  const [bio, setBio] = useState(parsed.bio);
  const [academicInterests, setAcademicInterests] = useState(
    parsedInterests.academic.join(", ")
  );
  const [hobbies, setHobbies] = useState(parsedInterests.hobbies.join(", "));

  // URL 형태나 @가 포함된 경우 아이디만 추출하여 초기값으로 설정
  const initialInstagramId = (defaultValues?.instagramUrl || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  const [instagramId, setInstagramId] = useState(initialInstagramId);
  const [githubUrl, setGithubUrl] = useState(defaultValues?.githubUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("프로필을 저장하시겠습니까?")) {
      event.preventDefault();
      return;
    }
    setIsSubmitting(true);
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8"
    >
      <CsrfInputs token={csrfToken} />
      {/* 1. 기본 정보 (이름, 기수) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            이름 (실명) <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="홍길동"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">기수</label>
          <input
            name="cohort"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            maxLength={40}
            placeholder="예: 14기"
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 2. 직책 / 소속 팀 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          직책 / 소속 팀
        </label>
        <input
          name="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          maxLength={80}
          placeholder="예: 회장단, 사회공헌팀, 교류팀, 학술팀, 홍보팀 (또는 학술팀장, 부원 등)"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* 3. 학술 / 전공 관심 분야 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          관심 분야 (전공·학술)
        </label>
        <input
          name="interests"
          value={academicInterests}
          onChange={(e) => setAcademicInterests(e.target.value)}
          placeholder="예: AI, 생화학, 수리과학, 천문학, 유기화학, 통계"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-muted">
          쉼표(,)로 구분해 여러 개를 입력할 수 있습니다.
        </span>
      </div>

      {/* 4. 취미 및 개인 관심사 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          취미 및 관심사
        </label>
        <input
          name="hobbies"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
          placeholder="예: 만화, 게임, 포켓몬, 밴드 음악, 축구"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-muted">
          쉼표(,)로 구분해 여러 개를 입력할 수 있습니다.
        </span>
      </div>

      {/* 5. 한 줄 소개 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">
          한 줄 소개
        </label>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="자신을 소개하는 한 줄을 자유롭게 입력해 주세요."
          className="rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-none"
        />
      </div>

      {/* 6. SNS 링크 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Instagram 아이디 (선택)
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm font-medium text-muted">
              @
            </span>
            <input
              name="instagramUrl"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              placeholder="gleap_snu"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-8 pr-3.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            GitHub 주소 (선택)
          </label>
          <input
            name="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Link
          href="/member"
          className="text-sm font-medium text-muted hover:underline"
        >
          취소하고 돌아가기
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition shadow-sm"
        >
          {isSubmitting ? "저장 중…" : "프로필 저장"}
        </button>
      </div>
    </form>
  );
}
