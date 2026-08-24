import type { Cohort } from "../types";

export const cohort: Cohort = {
  id: 11,
  label: { ko: "11기", en: "11th" },
  description: { ko: "GLEAP 11기 회원 명단입니다.", en: "Roster of GLEAP's 11th generation members." },
  members: [
    { name: { ko: "함성종", en: "Ham Sung-jong" }, role: { ko: "회장", en: "President" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "김병주", en: "Kim Byung-joo" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { name: { ko: "김도훈", en: "Kim Do-hoon" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { name: { ko: "손현기", en: "Son Hyun-ki" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { name: { ko: "이동해", en: "Lee Dong-hae" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { name: { ko: "서현우", en: "Seo Hyun-woo" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
  ],
};
