import {
  boolean,
  check,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

// Better Auth가 로그인 정보를 저장하는 기본 테이블들.
// 외부에서 DB에 직접 접근하지 않고, Next.js 서버의 Better Auth만 이 테이블을 사용한다.
export const authUsers = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const authSessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const authAccounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    issuer: text("issuer").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    // Better Auth는 provider가 아니라 issuer + accountId 조합을 계정 식별자로 쓴다.
    uniqueIndex("account_issuer_account_unique").on(table.issuer, table.accountId),
  ],
);

export const authVerifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

// 운영진이 승인한 이메일 목록. 이 테이블에 있는 이메일만 회원가입할 수 있다.
// 초대 메일 자동 발송은 나중에 붙여도 이 승인 구조는 그대로 사용한다.
export const memberAccess = pgTable("member_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 로그인 계정과 1:1인 회원 프로필. 민감한 개인정보는 저장하지 않는다.
export const memberProfiles = pgTable("member_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cohort: text("cohort"),
  bio: text("bio"),
  interests: text("interests").array().notNull().default([]),
  instagramUrl: text("instagram_url"),
  githubUrl: text("github_url"),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 회원 공간의 글은 기존 공개 소식(posts)과 분리한다.
// 따라서 회원 전용 자유글·공지·댓글은 공개 뉴스 운영에 영향을 주지 않는다.
export const memberPosts = pgTable(
  "member_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    category: text("category").notNull().default("free"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("member_posts_category_check", sql`category in ('free', 'notice')`),
    check("member_posts_title_length", sql`char_length(trim(title)) between 1 and 200`),
    check("member_posts_content_length", sql`char_length(trim(content)) between 1 and 20000`),
    index("member_posts_created_at_idx").on(table.createdAt),
    index("member_posts_author_id_idx").on(table.authorId),
  ],
);

export const memberComments = pgTable(
  "member_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => memberPosts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("member_comments_content_length", sql`char_length(trim(content)) between 1 and 2000`),
    index("member_comments_post_created_at_idx").on(table.postId, table.createdAt),
    index("member_comments_author_id_idx").on(table.authorId),
  ],
);

// 한 회원은 하나의 글에 좋아요를 한 번만 남길 수 있다.
export const memberPostLikes = pgTable(
  "member_post_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => memberPosts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("member_post_likes_post_user_unique").on(table.postId, table.userId),
    index("member_post_likes_post_id_idx").on(table.postId),
  ],
);

// 운영상 필요한 최소 활동 기록. 비밀번호·접속 IP 같은 민감 정보는 기록하지 않는다.
export const memberActivityLogs = pgTable(
  "member_activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").references(() => authUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("member_activity_logs_created_at_idx").on(table.createdAt),
    index("member_activity_logs_actor_id_idx").on(table.actorId),
  ],
);
