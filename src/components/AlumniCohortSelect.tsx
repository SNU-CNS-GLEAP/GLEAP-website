"use client";

import type { Cohort } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { useRouter } from "@/i18n/navigation";

type Props = {
  // 최신 기수가 먼저 오도록 이미 뒤집힌 배열 전제.
  cohorts: Cohort[];
  locale: string;
  selectedId: number;
  label: string;
};

export function AlumniCohortSelect({ cohorts, locale, selectedId, label }: Props) {
  const router = useRouter();

  return (
    <label className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
      <span className="text-muted">{label}</span>
      <select
        value={selectedId}
        onChange={(e) => router.push(`/members/alumni/${e.target.value}`)}
        className="w-fit rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
      >
        {cohorts.map((cohort) => {
          const cohortLabel = localize(cohort.label, locale);
          return (
            <option key={cohort.id} value={cohort.id} lang={cohortLabel.lang}>
              {cohortLabel.text}
            </option>
          );
        })}
      </select>
    </label>
  );
}
