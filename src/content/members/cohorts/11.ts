import type { Cohort } from "../types";

export const cohort: Cohort = {
  id: 11,
  label: { ko: "11기", en: "11th" },
  description: { ko: "GLEAP 11기 회원 명단입니다.", en: "Roster of GLEAP's 11th generation members." },
  members: [
    { surname: { ko: "함", en: "Ham" }, givenName: { ko: "성종", en: "Sung-jong" }, role: { ko: "회장", en: "President" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { surname: { ko: "김", en: "Kim" }, givenName: { ko: "병주", en: "Byung-joo" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { surname: { ko: "김", en: "Kim" }, givenName: { ko: "도훈", en: "Do-hoon" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { surname: { ko: "손", en: "Son" }, givenName: { ko: "현기", en: "Hyun-ki" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { surname: { ko: "이", en: "Lee" }, givenName: { ko: "동해", en: "Dong-hae" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { surname: { ko: "서", en: "Seo" }, givenName: { ko: "현우", en: "Hyun-woo" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
  ],
};
