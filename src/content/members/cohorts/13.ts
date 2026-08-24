import type { Cohort } from "../types";

// Wix "13th members" 로스터 (기수가 명시돼 있어 확실히 매핑 가능했던 10명). role의 "13기 " 접두어는
// 이제 cohort로 표현되므로 제거함.
export const cohort: Cohort = {
  id: 13,
  label: { ko: "13기", en: "13th" },
  description: { ko: "GLEAP 13기 회원 명단입니다.", en: "Roster of GLEAP's 13th generation members." },
  members: [
    { name: { ko: "김민준", en: "Kim Min-jun" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { name: { ko: "임하온", en: "Lim Ha-on" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "김연우", en: "Kim Yeon-woo" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "엄동현", en: "Eom Dong-hyun" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { name: { ko: "오세현", en: "Oh Se-hyun" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { name: { ko: "이연우", en: "Lee Yeon-woo" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "이예진", en: "Lee Ye-jin" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { name: { ko: "조경아", en: "Jo Kyung-ah" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" } },
    { name: { ko: "최일규", en: "Choi Il-gyu" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
    { name: { ko: "황세웅", en: "Hwang Se-woong" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" } },
  ],
};
