import type { LocalizedText } from "@/lib/localized-text";

// 학번은 개인정보라 사이트에 공개하지 않기로 함(레포가 public이라 커밋 즉시 영구 노출됨).
// 필요하면 role/department 문구에 기수 정보를 녹이는 정도로 충분.
export type Member = {
  name: LocalizedText;
  role?: LocalizedText;
  department: LocalizedText;
  // public/members/ 안의 경로. 파일명은 "{기수id}-{실명}.webp" (예: /members/15-문현호.webp).
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

// TODO: 실제 동문 명단으로 교체. cohorts와 별개로, 진급/졸업한 이전 기수 회원을 담는다.
export const alumni: Member[] = [
  {
    name: { ko: "김철수" },
    role: { ko: "12기 회장" },
    department: { ko: "물리천문학부" },
  },
];

// TODO: 실제 기수/명단으로 교체. 항목 하나가 회원 한 명.
// 채우는 예시 (전부 선택 필드 — 없는 항목은 그냥 생략):
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
    },
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
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14원동현.jpg",
      },
      
      {
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14원동현.jpg",
      },
      
      {
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14원동현.jpg",
      },
      
      {
        name: { ko: "원동현", en: "Won Dong-hyun" },
        role: { ko: "부회장", en: "Vice President" },
        department: { ko: "생명과학부", en: "Dep't of Life Sciences" },
        photo: "/members/14원동현.jpg",
        links: {
          blog: "https://octahedron00.tistory.com",
          github: "https://github.com/octahedron00",
          linkedin: "https://www.linkedin.com/in/moon-hyunho-9a0b4b1a6/",
        },
      },
      
    ],
  },
  {
    id: 15,
    label: { ko: "15기", en: "15th" },
    description: {
      ko: "GLEAP 회원은 처음 1년 동안 junior로서 GLEAP 활동에 기여하며 배워나갑니다.",
    },
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
