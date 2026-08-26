import type { LocalizedText } from "@/lib/localized-text";


// 타입 확인하고 입력하세요! 에러가 뜬다면 여기서 났을 것.

export type Member = {
  surname: LocalizedText;
  givenName: LocalizedText;
  role?: LocalizedText;
  department: LocalizedText;
  // public/members/ 안의 경로. 파일명은 "{기수id}{실명}.jpg" (예: /members/15문현호.jpg).
  photo?: string;
  email?: string;
  links?: SNSLinks
};


// SNS 링크의 종류와 공개 순서는 여기서 지정합니다.
// 단, 아이콘은 반드시 이 이름.svg 형식으로 public/icons/ 안에 있어야 함.

export type SNSLinks = {
  tistory?: string;
  naverblog?: string;
  instagram?: string;
  github?: string;
  linkedin?: string;
};

// 공개 순서 기준: 가장 formal한 것부터. (LinkedIn, GitHub, Tistory, Naver Blog, Instagram)
export const SNSLinksOrder = [
  "linkedin", "github", "tistory", "naverblog", "instagram"
] as const;


export type Cohort = {
  id: number;
  label: LocalizedText;
  description: LocalizedText;
  members: Member[];
};
