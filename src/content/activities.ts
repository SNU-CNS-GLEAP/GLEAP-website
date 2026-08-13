import type { LocalizedText } from "@/lib/localized-text";

export type ActivityCategory = {
  id: string;
  title: LocalizedText;
  programs: { name: LocalizedText; description?: LocalizedText }[];
};

// TODO: 실제 활동 내역으로 교체.
export const activityCategories: ActivityCategory[] = [
  {
    id: "social",
    title: { ko: "사회 공헌" },
    programs: [{ name: { ko: "톡톡멘토링" } }, { name: { ko: "자연과학콘서트" } }],
  },
  {
    id: "academic",
    title: { ko: "학술" },
    programs: [{ name: { ko: "학술 세미나" } }, { name: { ko: "월간 글립" } }],
  },
  {
    id: "exchange",
    title: { ko: "교류" },
    programs: [
      { name: { ko: "국내 학생 단체 교류" } },
      { name: { ko: "해외 학술문화탐방" } },
      { name: { ko: "글립의 밤" } },
    ],
  },
];
