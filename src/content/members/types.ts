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
    tistory?: string;
    naverblog?: string;
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
