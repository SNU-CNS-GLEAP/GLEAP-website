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
  // 목록 정렬·화면 표시에 쓰는 "게시일". 관리자가 자유롭게 지정 가능(예: 어제 있었던 행사를
  // 오늘 올려도 어제 날짜로 보이게). 실제 서버 반영 시각은 created_at/updated_at이 담당하므로
  // 이 컬럼은 순수 편집용 날짜.
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // 실제 마지막 수정 시각. Postgres가 자동 갱신하지 않으므로, 글 수정 기능 구현 시
  // 저장 로직에서 명시적으로 new Date()를 넣어줘야 함.
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
