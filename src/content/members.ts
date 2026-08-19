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

// Alumni는 더 이상 별도 배열이 아니라 cohorts 기반으로 계산됨(아래 [Alumni 기준] 참고).
// 기존 Wix 사이트("13기 & 14기 구성원" / "Alumni" 페이지, 2026-08 스냅샷)에서 옮겨 옴.
// 13기 10명은 Wix "13th members" 목록에 기수가 명시돼 있었고, 나머지 16명(당시 기수 미확인)은
// Wix Alumni 페이지의 기수 드롭다운(SSR로 내려오는 JSON, 8~12기 옵션 중 11·12기에만 실제 인원이
// 있었음)을 다시 확인해 11기 6명 / 12기 10명으로 정확히 배정함 — 8·9·10기는 드롭다운 옵션만
// 있고 원본에도 등록된 인원이 없어 우리 쪽도 그대로 빈 자리표시자로 둠.
// 영문 이름은 전부 추정 로마자 표기 — 본인 확인 후 실제 선호 표기로 교정 필요.

// 항목 하나가 회원 한 명. 채우는 예시 (전부 선택 필드 — 없는 항목은 그냥 생략):
// {
//   name: { ko: "문현호" },
//   role: { ko: "부회장" },
//   department: { ko: "생명과학부" },
//   photo: "/members/15문현호.jpg",
//   email: "example@snu.ac.kr",
//   links: { blog: "https://...", instagram: "https://instagram.com/...", github: "https://github.com/..." },
// }
// [Alumni 기준] 매년 최신 2개 기수(현재 활동 중인 junior/senior)만 "구성원"이고 나머지는
// 전부 "Alumni"다. 아래 CURRENT_COHORT_COUNT만 바꾸면 기준이 조정됨 — cohorts에 새 기수가
// 추가돼도(예: 16기 신입 모집) 코드 수정 없이 자동으로 최신 2개만 구성원, 그 이전은 alumni로 재계산됨.
const CURRENT_COHORT_COUNT = 2;

// 1~13기는 아직 명단이 정리되지 않은 자리표시자(placeholder) — id/label만 확정하고 members는
// 빈 배열로 둠. 13기만 Wix에 기수가 명시된 실제 인원(10명, 위 [Alumni 기준] 주석 참고)이 있어 채워둠.
export const cohorts: Cohort[] = [
  {
    id: 1,
    label: { ko: "1기", en: "1st" },
    description: { ko: "GLEAP 1기 회원 명단입니다.", en: "Roster of GLEAP's 1st generation members." },
    members: [],
  },
  {
    id: 2,
    label: { ko: "2기", en: "2nd" },
    description: { ko: "GLEAP 2기 회원 명단입니다.", en: "Roster of GLEAP's 2nd generation members." },
    members: [],
  },
  {
    id: 3,
    label: { ko: "3기", en: "3rd" },
    description: { ko: "GLEAP 3기 회원 명단입니다.", en: "Roster of GLEAP's 3rd generation members." },
    members: [],
  },
  {
    id: 4,
    label: { ko: "4기", en: "4th" },
    description: { ko: "GLEAP 4기 회원 명단입니다.", en: "Roster of GLEAP's 4th generation members." },
    members: [],
  },
  {
    id: 5,
    label: { ko: "5기", en: "5th" },
    description: { ko: "GLEAP 5기 회원 명단입니다.", en: "Roster of GLEAP's 5th generation members." },
    members: [],
  },
  {
    id: 6,
    label: { ko: "6기", en: "6th" },
    description: { ko: "GLEAP 6기 회원 명단입니다.", en: "Roster of GLEAP's 6th generation members." },
    members: [],
  },
  {
    id: 7,
    label: { ko: "7기", en: "7th" },
    description: { ko: "GLEAP 7기 회원 명단입니다.", en: "Roster of GLEAP's 7th generation members." },
    members: [],
  },
  {
    id: 8,
    label: { ko: "8기", en: "8th" },
    description: { ko: "GLEAP 8기 회원 명단입니다.", en: "Roster of GLEAP's 8th generation members." },
    members: [],
  },
  {
    id: 9,
    label: { ko: "9기", en: "9th" },
    description: { ko: "GLEAP 9기 회원 명단입니다.", en: "Roster of GLEAP's 9th generation members." },
    members: [],
  },
  {
    id: 10,
    label: { ko: "10기", en: "10th" },
    description: { ko: "GLEAP 10기 회원 명단입니다.", en: "Roster of GLEAP's 10th generation members." },
    members: [],
  },
  {
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
  },
  {
    id: 12,
    label: { ko: "12기", en: "12th" },
    description: { ko: "GLEAP 12기 회원 명단입니다.", en: "Roster of GLEAP's 12th generation members." },
    // 이주영의 원본 Wix 데이터는 role 필드에 한글 대신 영문("Social Contribution Team Leader")만
    // 들어 있었음(원본 입력 실수로 추정) — 다른 12기 사회공헌팀장 표기와 통일해 한글을 채움.
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
  },
  {
    id: 13,
    label: { ko: "13기", en: "13th" },
    description: { ko: "GLEAP 13기 회원 명단입니다.", en: "Roster of GLEAP's 13th generation members." },
    // Wix "13th members" 로스터 (기수가 명시돼 있어 확실히 매핑 가능했던 10명). role의 "13기 " 접두어는
    // 이제 cohort로 표현되므로 제거함.
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
  },
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
        department: { ko: "화학부", en: "Dept of Chemistry" },
        photo: "/members/14용현정.jpg",
      },
      {
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dept of Life Sciences" },
        photo: "/members/14원동현.jpg",
      },
      {
        name: { ko: "김희주", en: "Kim Hee-ju" },
        department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
        photo: "/members/14김희주.jpg",
      },
      {
        name: { ko: "박정민", en: "Park Jung-min" },
        department: { ko: "생명과학부", en: "Dept of Life Sciences" },
        photo: "/members/14박정민.jpg",
      },
      {
        name: { ko: "박준형", en: "Park Jun-hyung" },
        department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
        photo: "/members/14박준형.jpg",
      },
      {
        name: { ko: "배영주", en: "Bae Young-ju" },
        department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
        photo: "/members/14배영주.jpg",
      },
      {
        name: { ko: "민현기", en: "Min Hyun-ki" },
        department: { ko: "생명과학부", en: "Dept of Life Sciences" },
        photo: "/members/14민현기.jpg",
      },
      {
        name: { ko: "신재훈", en: "Shin Jae-hoon" },
        department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" },
        photo: "/members/14신재훈.jpg",
      },
      {
        name: { ko: "양정윤", en: "Yang Jung-yoon" },
        department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
        photo: "/members/14양정윤.jpg",
      },
      {
        name: { ko: "오석훈", en: "Oh Seok-hoon" },
        department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
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
        name: { ko: "고주형", en: "Ko Juhyeong" },
        department: { ko: "화학부", en: "Dept of Chemistry" },
        photo: "/members/15고주형.jpg",
      },
      {
        name: { ko: "김도현", en: "Kim Dohyun" },
        department: { ko: "통계학과", en: "Dept of Statistics" },
        photo: "/members/15김도현.jpg",
      },
      {
        name: { ko: "김민채", en: "Kim Minchae" },
        department: { ko: "수리과학부", en: "Dept of Mathematical Sciences" },
        photo: "/members/15김민채.jpg",
      },
      {
        name: { ko: "김성민", en: "Kim Seongmin" },
        department: { ko: "화학부", en: "Dept of Chemistry" },
        photo: "/members/15김성민.jpg",
      },
      {
        name: { ko: "문현호", en: "Moon Hyun-ho" },
        department: { ko: "생명과학부", en: "Dept of Life Sciences" },
        photo: "/members/15문현호.jpg",
        links: {
          blog: "https://octahedron00.tistory.com",
          github: "https://github.com/octahedron00",
          linkedin: "https://www.linkedin.com/in/moon-hyunho-9a0b4b1a6/",
        },
      },
      {
        name: { ko: "서채원", en: "Seo Chaeone" },
        department: { ko: "화학부", en: "Dept of Chemistry" },
        photo: "/members/15서채원.jpg",
      },
      {
        name: { ko: "이다인", en: "Lee Dain" },
        department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
        photo: "/members/15이다인.jpg",
      },
      {
        name: { ko: "정지혜", en: "Jung Ji Hye" },
        department: { ko: "생명과학부", en: "Dept of Life Sciences" },
        photo: "/members/15정지혜.jpg",
      },
      {
        name: { ko: "차혜린", en: "Cha Hyerin" },
        department: { ko: "지구환경과학부", en: "Dept of Earth and Environmental Sciences" },
        photo: "/members/15차혜린.jpg",
      },
      {
        name: { ko: "한수민", en: "Han Sumin" },
        department: { ko: "물리천문학부", en: "Dept of Physics and Astronomy" },
        photo: "/members/15한수민.jpg",
      },
    ],
  },
];

const sortedCohorts = [...cohorts].sort((a, b) => a.id - b.id);
const latestCohortId = Math.max(...cohorts.map((c) => c.id));

// "구성원" 페이지(현재 활동 중, 최신 2개 기수)에 쓰임.
export const currentCohorts = sortedCohorts.filter((c) => c.id > latestCohortId - CURRENT_COHORT_COUNT);

// "Alumni" 페이지(최신 2개 기수를 제외한 나머지 전부)에 쓰임.
export const alumniCohorts = sortedCohorts.filter((c) => c.id <= latestCohortId - CURRENT_COHORT_COUNT);

// Alumni 드롭다운 기본 선택값 — "최신 -2기" (지금은 15 - 2 = 13기).
export const DEFAULT_ALUMNI_COHORT_ID = latestCohortId - CURRENT_COHORT_COUNT;
