"use client";

import { useMemo, useState } from "react";
import type { Cohort } from "@/content/members";
import { localize } from "@/lib/localized-text";
import { MemberCard } from "@/components/MemberCard";

type Labels = {
  email: string;
  tistory: string;
  naverblog: string;
  instagram: string;
  github: string;
  linkedin: string;
};

type Props = {
  // 오름차순(1기 -> 13기) 전제. 드롭다운에는 최신 기수가 먼저 오도록 뒤집어서 보여줌.
  cohorts: Cohort[];
  locale: string;
  defaultCohortId: number;
  selectLabel: string;
  emptyLabel: string;
  labels: Labels;
};

export function AlumniCohortBrowser({ cohorts, locale, defaultCohortId, selectLabel, emptyLabel, labels }: Props) {
  const [selectedId, setSelectedId] = useState(defaultCohortId);
  const selected = useMemo(
    () => cohorts.find((cohort) => cohort.id === selectedId) ?? cohorts[cohorts.length - 1],
    [cohorts, selectedId],
  );
  const description = selected ? localize(selected.description, locale) : null;
  const options = useMemo(() => [...cohorts].reverse(), [cohorts]);

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
        <span className="text-muted">{selectLabel}</span>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-fit rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
        >
          {options.map((cohort) => {
            const label = localize(cohort.label, locale);
            return (
              <option key={cohort.id} value={cohort.id} lang={label.lang}>
                {label.text}
              </option>
            );
          })}
        </select>
      </label>
      {selected && (
        <section className="flex flex-col gap-4">
          {description && (
            <p className="text-sm text-muted" lang={description.lang}>
              {description.text}
            </p>
          )}
          {selected.members.length > 0 ? (
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {selected.members.map((member, i) => (
                <MemberCard key={i} member={member} locale={locale} labels={labels} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{emptyLabel}</p>
          )}
        </section>
      )}
    </div>
  );
}
