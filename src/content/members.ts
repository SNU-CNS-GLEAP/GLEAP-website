import type { LocalizedText } from "@/lib/localized-text";

// 학번은 개인정보라 사이트에 공개하지 않기로 함(레포가 public이라 커밋 즉시 영구 노출됨).
// 필요하면 role/department 문구에 기수 정보를 녹이는 정도로 충분.
export type Member = {
  name: LocalizedText;
  role?: LocalizedText;
  department: LocalizedText;
  // public/members/ 안의 경로. 파일명은 "{기수id}{실명}.jpg" (예: /members/15문현호.jpg).
  // 어차피 이름이 화면에 그대로 노출되므로 파일명도 실명으로 — 학번 같은 식별자를 새로 안 만들어도 됨.
  photo?: string;
  email?: string;
  // 전부 선택 입력. 비워두면 해당 아이콘/버튼이 자동으로 숨겨짐.
  links?: {
    blog?: string; // 네이버 블로그든 티스토리든 URL만
    instagram?: string;
    github?: string;
    linkedin?: string;
  };
};

export type Cohort = {
  id: number;
  label: LocalizedText;
  description: LocalizedText;
  members: Member[];
};

// 기존 Wix 사이트(snucnsgleap.wixsite.com/mysite)의 "13기 & 14기 구성원" / "Alumni" 페이지를
// 옮겨 옴 (2026-08 기준). Wix 스냅샷 시점의 13기(senior)는 그 뒤로 활동을 마쳐 이제 alumni로,
// 14기(junior)는 진급해 지금 cohorts의 14기(senior)로 대응된다. Wix Alumni 페이지의 16명은
// 정확한 기수(8~12기 드롭다운)를 못 가져와서 기수 표기 없이 이름/직책/학과만 남김.
// 영문 이름은 전부 추정 로마자 표기 — 본인 확인 후 실제 선호 표기로 교정 필요.
export const alumni: Member[] = [
  // --- 13기 (Wix "13th members") ---
  { name: { ko: "김민준", en: "Kim Min-jun" }, role: { ko: "13기", en: "13th Gen." }, department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" } },
  { name: { ko: "임하온", en: "Lim Ha-on" }, role: { ko: "13기 부회장", en: "13th Gen. Vice President" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "김연우", en: "Kim Yeon-woo" }, role: { ko: "13기 사회공헌팀장", en: "13th Gen. Social Contribution Team Leader" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "엄동현", en: "Eom Dong-hyun" }, role: { ko: "13기 교류팀장", en: "13th Gen. Exchange Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
  { name: { ko: "오세현", en: "Oh Se-hyun" }, role: { ko: "13기 학술팀장", en: "13th Gen. Academic Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
  { name: { ko: "이연우", en: "Lee Yeon-woo" }, role: { ko: "13기 교류팀장", en: "13th Gen. Exchange Team Leader" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "이예진", en: "Lee Ye-jin" }, role: { ko: "13기 홍보팀장", en: "13th Gen. PR Team Leader" }, department: { ko: "화학부", en: "Dep't of Chemistry" } },
  { name: { ko: "조경아", en: "Jo Kyung-ah" }, role: { ko: "13기 홍보팀장", en: "13th Gen. PR Team Leader" }, department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" } },
  { name: { ko: "최일규", en: "Choi Il-gyu" }, role: { ko: "13기 사회공헌팀장", en: "13th Gen. Social Contribution Team Leader" }, department: { ko: "화학부", en: "Dep't of Chemistry" } },
  { name: { ko: "황세웅", en: "Hwang Se-woong" }, role: { ko: "13기 사회공헌팀장", en: "13th Gen. Social Contribution Team Leader" }, department: { ko: "지구환경과학부", en: "Dep't of Earth and Environmental Sciences" } },
  // --- Wix "Alumni" 페이지 (8~12기, 개인별 정확한 기수 미확인) ---
  { name: { ko: "우윤호", en: "Woo Yun-ho" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "박수현", en: "Park Su-hyun" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "통계학과", en: "Dep't of Statistics" } },
  { name: { ko: "김도연", en: "Kim Do-yeon" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "지구환경과학부", en: "Dep't of Earth and Environmental Sciences" } },
  { name: { ko: "김태훈", en: "Kim Tae-hoon" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
  { name: { ko: "김형환", en: "Kim Hyung-hwan" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "통계학과", en: "Dep't of Statistics" } },
  { name: { ko: "배윤진", en: "Bae Yun-jin" }, role: { ko: "홍보팀장", en: "PR Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
  { name: { ko: "이성빈", en: "Lee Sung-bin" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
  { name: { ko: "이주영", en: "Lee Ju-young" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "지구환경과학부", en: "Dep't of Earth and Environmental Sciences" } },
  { name: { ko: "임동빈", en: "Lim Dong-bin" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "최우정", en: "Choi Woo-jung" }, role: { ko: "교류팀장", en: "Exchange Team Leader" }, department: { ko: "화학부", en: "Dep't of Chemistry" } },
  { name: { ko: "함성종", en: "Ham Sung-jong" }, department: { ko: "생명과학부", en: "Dep't of Life Sciences" } },
  { name: { ko: "김병주", en: "Kim Byung-joo" }, role: { ko: "부회장", en: "Vice President" }, department: { ko: "화학부", en: "Dep't of Chemistry" } },
  { name: { ko: "김도훈", en: "Kim Do-hoon" }, role: { ko: "학술팀장", en: "Academic Team Leader" }, department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" } },
  { name: { ko: "손현기", en: "Son Hyun-ki" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" } },
  { name: { ko: "이동해", en: "Lee Dong-hae" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" } },
  { name: { ko: "서현우", en: "Seo Hyun-woo" }, role: { ko: "사회공헌팀장", en: "Social Contribution Team Leader" }, department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" } },
];

// 항목 하나가 회원 한 명. 채우는 예시 (전부 선택 필드 — 없는 항목은 그냥 생략):
// {
//   name: { ko: "문현호" },
//   role: { ko: "부회장" },
//   department: { ko: "생명과학부" },
//   photo: "/members/15문현호.jpg",
//   email: "example@snu.ac.kr",
//   links: { blog: "https://...", instagram: "https://instagram.com/...", github: "https://github.com/..." },
// }
export const cohorts: Cohort[] = [
  {
    id: 14,
    label: { ko: "14기", en: "14th" },
    description: {
      ko: "GLEAP에서 일 년을 거쳐 진급한 senior는 각 부서의 팀장을 맡아 GLEAP을 이끌어나갑니다.",
      en: "Having advanced through their first year, our senior members now lead GLEAP as team leaders in each department.",
    },
    // Wix "14th members"(당시 junior) 로스터 그대로 — 이번 해에 진급해 지금 14기(senior)가 됨.
    // 회장/부회장 외 나머지 인원의 실제 담당 직책은 아직 미확인이라 학과만 채움.
    members: [
      {
        name: { ko: "용현정", en: "Yong Hyun-jung" },
        role: { ko: "회장", en: "President" },
        department: { ko: "화학부", en: "Dep't of Chemistry" },
        photo: "/members/14용현정.jpg",
      },
      {
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14원동현.jpg",
      },
      {
        name: { ko: "김희주", en: "Kim Hee-ju" },
        department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" },
        photo: "/members/14김희주.jpg",
      },
      {
        name: { ko: "박정민", en: "Park Jung-min" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14박정민.jpg",
      },
      {
        name: { ko: "박준형", en: "Park Jun-hyung" },
        department: { ko: "지구환경과학부", en: "Dep't of Earth and Environmental Sciences" },
        photo: "/members/14박준형.jpg",
      },
      {
        name: { ko: "배영주", en: "Bae Young-ju" },
        department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" },
        photo: "/members/14배영주.jpg",
      },
      {
        name: { ko: "민현기", en: "Min Hyun-ki" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14민현기.jpg",
      },
      {
        name: { ko: "신재훈", en: "Shin Jae-hoon" },
        department: { ko: "수리과학부", en: "Dep't of Mathematical Sciences" },
        photo: "/members/14신재훈.jpg",
      },
      {
        name: { ko: "양정윤", en: "Yang Jung-yoon" },
        department: { ko: "지구환경과학부", en: "Dep't of Earth and Environmental Sciences" },
        photo: "/members/14양정윤.jpg",
      },
      {
        name: { ko: "오석훈", en: "Oh Seok-hoon" },
        department: { ko: "물리천문학부", en: "Dep't of Physics and Astronomy" },
        photo: "/members/14오석훈.jpg",
      },
    ],
  },
  {
    id: 15,
    label: { ko: "15기", en: "15th" },
    description: {
      ko: "GLEAP 회원은 처음 1년 동안 junior로서 GLEAP 활동에 기여하며 배워나갑니다.",
      en: "For their first year, GLEAP members contribute and learn as juniors.",
    },
    // TODO: 15기는 Wix 사이트보다 나중에 들어온 기수라 문현호 외 나머지 명단은 다른 부원들에게 확인 필요.
    members: [
      {
        name: { ko: "문현호", en: "Moon Hyunho" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/15문현호.jpg",
        links: {
          blog: "https://octahedron00.tistory.com",
          github: "https://github.com/octahedron00",
          linkedin: "https://www.linkedin.com/in/moon-hyunho-9a0b4b1a6/",
        },
      },
    ],
  },
];
