import type { Cohort } from "../types";

// 이주영의 원본 Wix 데이터는 role 필드에 한글 대신 영문("Social Contribution Team Leader")만
// 들어 있었음(원본 입력 실수로 추정) — 다른 12기 사회공헌팀장 표기와 통일해 한글을 채움.
export const cohort: Cohort = {
  id: 12,
  label: { ko: "12기", en: "12th" },
  description: { ko: "GLEAP 12기 회원 명단입니다.", en: "Roster of GLEAP's 12th generation members." },
  members: [
    { name: { ko: "우윤호", en: "Woo Yun-ho" }, role: { ko: "회장", en: "President" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "박수현", en: "Park Su-hyun" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "통계학과", en: "Dept of Statistics" } },
    { name: { ko: "김도연", en: "Kim Do-yeon" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" } },
    { name: { ko: "김태훈", en: "Kim Tae-hoon" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { name: { ko: "김형환", en: "Kim Hyung-hwan" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "통계학과", en: "Dept of Statistics" } },
    { name: { ko: "배윤진", en: "Bae Yun-jin" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { name: { ko: "이성빈", en: "Lee Sung-bin" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" } },
    { name: { ko: "이주영", en: "Lee Ju-young" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" } },
    { name: { ko: "임동빈", en: "Lim Dong-bin" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "생명과학부", en: "Dept of Life Sciences" } },
    { name: { ko: "최우정", en: "Choi Woo-jung" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "화학부", en: "Dept of Chemistry" } },
  ],
};
