import type { Cohort } from "../types";

// Wix "14th members"(당시 junior) 로스터 그대로 — 이번 해에 진급해 지금 14기(senior)가 됨.
// 회장/부회장 외 나머지 인원의 실제 담당 직책은 아직 미확인이라 학과만 채움.
export const cohort: Cohort = {
  id: 14,
  label: { ko: "14기", en: "14th" },
  description: { ko: "GLEAP 14기 회원 명단입니다.", en: "Roster of GLEAP's 14th generation members." },
  members: [
    {
      name: { ko: "용현정", en: "YONG Hyunjung" },
      role: { ko: "회장", en: "President" },
      department: { ko: "화학부", en: "Dept of Chemistry" },
      photo: "/members/14용현정.jpg",
    },
    {
      name: { ko: "원동현", en: "WON Donghyun" },
      role: { ko: "부회장", en: "Vice President" },
      department: { ko: "생명과학부", en: "Dept of Biological Sciences" },
      photo: "/members/14원동현.jpg",
      links: {
        github: "https://github.com/llZer0ll"
      },
    },
    {
      name: { ko: "김희주", en: "KIM Heeju" },
      role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" },
      department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
      photo: "/members/14김희주.jpg",
    },
    {
      name: { ko: "박정민", en: "PARK Jungmin" },
      role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" },
      department: { ko: "생명과학부", en: "Dept of Biological Sciences" },
      photo: "/members/14박정민.jpg",
      links: {
        github: "https://github.com/minhub1204"
      },
      email: "aaa13017@snu.ac.kr"
    },
    {
      name: { ko: "박준형", en: "PARK Junhyung" },
      role: { ko: "학술팀장", en: "Academic Team Leader" },
      department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
      photo: "/members/14박준형.jpg",
    },
    {
      name: { ko: "배영주", en: "BAE Youngju" },
      role: { ko: "교류팀장", en: "Exchange Team Leader" },
      department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
      photo: "/members/14배영주.jpg",
    },
    {
      name: { ko: "민현기", en: "MIN Hyunki" },
      role: { ko: "학술팀장", en: "Academic Team Leader" },
      department: { ko: "생명과학부", en: "Dept of Biological Sciences" },
      photo: "/members/14민현기.jpg",
    },
    {
      name: { ko: "신재훈", en: "SHIN Jaehoon" },
      role: { ko: "교류팀장", en: "Exchange Team Leader" },
      department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" },
      photo: "/members/14신재훈.jpg",
    },
    {
      name: { ko: "양정윤", en: "YANG Jungyoon" },
      role: { ko: "학술팀장", en: "Academic Team Leader" },
      department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
      photo: "/members/14양정윤.jpg",
    },
    {
      name: { ko: "오석훈", en: "OH Seokhoon" },
      role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" },
      department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
      photo: "/members/14오석훈.jpg",
      links: {
        github: "https://github.com/Seokhun-Oh"
      },
    },
  ],
};
