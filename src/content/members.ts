import type { LocalizedText } from "@/lib/localized-text";

export type Member = {
  name: LocalizedText;
  role?: LocalizedText;
  department: LocalizedText;
  photo?: string;
};

export type Cohort = {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  members: Member[];
};

// TODO: 실제 동문 명단으로 교체. cohorts와 별개로, 진급/졸업한 이전 기수 회원을 담는다.
export const alumni: Member[] = [
  {
    name: { ko: "김철수" },
    role: { ko: "12기 회장" },
    department: { ko: "물리천문학부" },
  },
];

// TODO: 실제 기수/명단으로 교체. 항목 하나가 회원 한 명. photo는 /public 안의 경로.
export const cohorts: Cohort[] = [
  {
    id: "14",
    label: { ko: "14기", en: "14th" },
    description: {
      ko: "GLEAP에서 일 년을 거쳐 진급한 senior는 각 부서의 팀장을 맡아 GLEAP을 이끌어나갑니다.",
    },
    members: [
      {
        name: { ko: "홍길동" },
        role: { ko: "회장" },
        department: { ko: "수리과학부" },
      },
    ],
  },
  {
    id: "15",
    label: { ko: "15기", en: "15th" },
    description: {
      ko: "GLEAP 회원은 처음 1년 동안 junior로서 GLEAP 활동에 기여하며 배워나갑니다.",
    },
    members: [
      {
        name: { ko: "문현호" },
        department: { ko: "생명과학부" },
      },
    ],
  },
];
