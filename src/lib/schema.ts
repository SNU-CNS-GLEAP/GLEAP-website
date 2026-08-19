import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// 소식(게시판) 게시물. 스키마 방식은 CLAUDE.md "게시물 번역" 절의 결정을 따름:
// 언어별 컬럼(title_ko/title_en) + en이 비어있으면 localize()가 한국어로 폴백.
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  // 자유 문자열 — "월간 글립" / "저널 클럽" / "행사" / "공지사항" 등.
  // enum이 아니라 텍스트인 이유: 분류가 늘어날 수 있는데, enum이면 늘 때마다 마이그레이션 필요.
  type: text("type").notNull(),
  // 게시물 대표 이미지. 높은 확률로 Blob에 업로드된 이미지 경로. (기타 이미지 경로도 허용하지만... 편집기 지원 이슈로 Blob 업로드가 대부분)
  photo: text("photo"),
  titleKo: text("title_ko").notNull(),
  titleEn: text("title_en"),
  // Markdown 원문 저장 (Tiptap + @tiptap/markdown로 변환). 렌더링 시 raw HTML 통과는 절대 켜지 않을 것.
  bodyKo: text("body_ko").notNull(),
  bodyEn: text("body_en"),
  // 작성자가 직접 입력하는 이름 표기용 크레딧. 로그인 계정과 무관(관리자 1명뿐이라 계정 연결 의미 없음), 선택 입력.
  authorName: text("author_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
