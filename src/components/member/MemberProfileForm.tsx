"use client";

import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";

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
};

export function MemberProfileForm({
  locale,
  defaultValues,
  action,
}: Props) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [cohort, setCohort] = useState(defaultValues?.cohort || "");
  const [bio, setBio] = useState(defaultValues?.bio || "");
  const [interests, setInterests] = useState(defaultValues?.interests?.join(", ") || "");

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
      className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">이름 (실명)</label>
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">한 줄 소개 / 직책</label>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="자신을 소개하는 한 줄을 입력해 주세요."
          className="rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">관심 분야</label>
        <input
          name="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="예: 생명, 물리, 화학, 지구, 수학, 통계"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-muted">쉼표(,)로 구분해 여러 개를 입력할 수 있습니다.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">Instagram 아이디 (선택)</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm font-medium text-muted">@</span>
            <input
              name="instagramUrl"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              placeholder="gleap_snu"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-8 pr-3.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <span className="text-xs text-muted">웹 주소 대신 인스타그램 아이디만 입력해 주세요.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">GitHub 주소 (선택)</label>
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
