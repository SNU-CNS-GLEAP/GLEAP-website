import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  authUsers,
  memberComments,
  memberPostLikes,
  memberPosts,
  memberAccess,
  memberProfiles,
} from "@/lib/schema";

// 기존 공개 소식은 기존 posts 테이블이 담당한다.
// 이 파일의 member_* 테이블은 로그인한 GLEAP 회원만 사용하는 커뮤니티 데이터다.

// 목록 화면에서 댓글·좋아요 수를 함께 가져온다.
// 두 테이블을 동시에 연결하므로 count(distinct ...)로 실제 개수만 센다.
export async function getMemberPosts() {
  return db
    .select({
      id: memberPosts.id,
      authorId: memberPosts.authorId,
      authorName: authUsers.name,
      category: memberPosts.category,
      title: memberPosts.title,
      content: memberPosts.content,
      createdAt: memberPosts.createdAt,
      commentCount: sql<number>`count(distinct ${memberComments.id})::int`,
      likeCount: sql<number>`count(distinct ${memberPostLikes.id})::int`,
    })
    .from(memberPosts)
    .innerJoin(authUsers, eq(memberPosts.authorId, authUsers.id))
    .leftJoin(memberComments, eq(memberComments.postId, memberPosts.id))
    .leftJoin(memberPostLikes, eq(memberPostLikes.postId, memberPosts.id))
    .groupBy(memberPosts.id, authUsers.id)
    .orderBy(desc(memberPosts.createdAt));
}

// 상세 화면은 게시글·집계·댓글을 나누어 조회해 각 데이터의 역할을 명확히 한다.
export async function getMemberPost(postId: string) {
  const [post] = await db
    .select({
      id: memberPosts.id,
      authorId: memberPosts.authorId,
      authorName: authUsers.name,
      category: memberPosts.category,
      title: memberPosts.title,
      content: memberPosts.content,
      createdAt: memberPosts.createdAt,
      updatedAt: memberPosts.updatedAt,
    })
    .from(memberPosts)
    .innerJoin(authUsers, eq(memberPosts.authorId, authUsers.id))
    .where(eq(memberPosts.id, postId))
    .limit(1);

  if (!post) return null;

  const [counts] = await db
    .select({
      commentCount: sql<number>`count(distinct ${memberComments.id})::int`,
      likeCount: sql<number>`count(distinct ${memberPostLikes.id})::int`,
    })
    .from(memberPosts)
    .leftJoin(memberComments, eq(memberComments.postId, memberPosts.id))
    .leftJoin(memberPostLikes, eq(memberPostLikes.postId, memberPosts.id))
    .where(eq(memberPosts.id, postId));

  const comments = await db
    .select({
      id: memberComments.id,
      authorId: memberComments.authorId,
      authorName: authUsers.name,
      content: memberComments.content,
      createdAt: memberComments.createdAt,
      updatedAt: memberComments.updatedAt,
    })
    .from(memberComments)
    .innerJoin(authUsers, eq(memberComments.authorId, authUsers.id))
    .where(eq(memberComments.postId, postId))
    .orderBy(memberComments.createdAt);

  return { ...post, ...counts, comments };
}

// 회원/프로필 페이지에서 공통으로 쓰는 단일 프로필 조회다.
// 접근 권한은 페이지에서 requireMember로 먼저 확인한다.
export async function getMemberProfile(userId: string) {
  const [profile] = await db
    .select({
      userId: memberProfiles.userId,
      name: memberProfiles.name,
      cohort: memberProfiles.cohort,
      bio: memberProfiles.bio,
      interests: memberProfiles.interests,
      instagramUrl: memberProfiles.instagramUrl,
      githubUrl: memberProfiles.githubUrl,
      role: memberProfiles.role,
      updatedAt: memberProfiles.updatedAt,
    })
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

// 회원 목록 페이지용 조회다. 공개 사이트의 Members 페이지 데이터와는 분리되어 있다.
export async function getMemberProfiles() {
  return db
    .select({
      userId: memberProfiles.userId,
      name: memberProfiles.name,
      cohort: memberProfiles.cohort,
      bio: memberProfiles.bio,
      interests: memberProfiles.interests,
      instagramUrl: memberProfiles.instagramUrl,
      githubUrl: memberProfiles.githubUrl,
      role: memberProfiles.role,
    })
    .from(memberProfiles)
    .orderBy(desc(memberProfiles.cohort), memberProfiles.name);
}

/** 운영진 화면에서 쓰는 승인 이메일 목록 (가입 완료 여부, 등록 이름 및 기수 연동). */
export async function getMemberAccessList() {
  return db
    .select({
      id: memberAccess.id,
      email: memberAccess.email,
      role: memberAccess.role,
      createdAt: memberAccess.createdAt,
      registeredName: authUsers.name,
      registeredCohort: memberProfiles.cohort,
      isRegistered: sql<boolean>`${authUsers.id} is not null`,
    })
    .from(memberAccess)
    .leftJoin(authUsers, eq(memberAccess.email, authUsers.email))
    .leftJoin(memberProfiles, eq(authUsers.id, memberProfiles.userId))
    .orderBy(desc(memberAccess.createdAt));
}
