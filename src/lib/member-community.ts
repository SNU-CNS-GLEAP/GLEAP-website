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
    .orderBy(memberProfiles.name);
}

/** 운영진 화면에서만 쓰는 승인 이메일 목록이다. */
export async function getMemberAccessList() {
  return db
    .select({
      id: memberAccess.id,
      email: memberAccess.email,
      role: memberAccess.role,
      createdAt: memberAccess.createdAt,
    })
    .from(memberAccess)
    .orderBy(memberAccess.createdAt);
}
