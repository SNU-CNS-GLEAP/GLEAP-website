// 소식 게시물의 고정 3분류(공지/학술 소식/활동 소식). 기존 `type`(자유 문자열, 분류가
// 늘어날 수 있는 태그)과 달리, 이 값은 절대 늘어나지 않는다는 전제로 3개로 못박는다.
// DB에는 schema.ts의 check 제약으로 이 값 외에는 저장 자체가 안 되게 이중으로 막는다 —
// 여기 배열을 바꾸면 schema.ts의 check 문자열도 반드시 같이 갱신할 것.
export const POST_SECTIONS = ["notice", "academic", "activity"] as const;

export type PostSection = (typeof POST_SECTIONS)[number];

export const POST_SECTION_LABELS: Record<PostSection, { ko: string; en: string }> = {
  notice: { ko: "공지", en: "Notice" },
  academic: { ko: "학술 소식", en: "Academic News" },
  activity: { ko: "활동 소식", en: "Activity News" },
};

export function isPostSection(value: string): value is PostSection {
  return (POST_SECTIONS as readonly string[]).includes(value);
}
