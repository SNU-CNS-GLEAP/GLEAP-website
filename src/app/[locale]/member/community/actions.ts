"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/member-auth";
import {
  authUsers,
  memberActivityLogs,
  memberAccess,
  memberComments,
  memberPostLikes,
  memberPosts,
  memberProfiles,
} from "@/lib/schema";

function requiredText(formData: FormData, key: string, maxLength: number) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value || value.length > maxLength) throw new Error("입력 내용을 다시 확인해 주세요.");
  return value;
}

function approvedEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
    throw new Error("올바른 이메일 주소를 입력해 주세요.");
  }
  return email;
}

function optionalUrl(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function writeActivity(actorId: string, action: string, targetType: string, targetId?: string) {
  await db.insert(memberActivityLogs).values({
    actorId,
    action,
    targetType,
    targetId: targetId ?? null,
  });
}

export async function createPost(locale: string, formData: FormData) {
  const member = await requireMember(locale);
  const category = formData.get("category") === "notice" ? "notice" : "free";

  if (category === "notice" && member.role !== "admin") {
    throw new Error("공지 작성 권한이 없습니다.");
  }

  const [post] = await db
    .insert(memberPosts)
    .values({
      authorId: member.user.id,
      category,
      title: requiredText(formData, "title", 200),
      content: requiredText(formData, "content", 20000),
    })
    .returning({ id: memberPosts.id });

  await writeActivity(member.user.id, "create", "member_post", post.id);
  revalidatePath(`/${locale}/member/community`);
  redirect(`/${locale}/member/community/${post.id}`);
}

export async function updatePost(locale: string, postId: string, formData: FormData) {
  const member = await requireMember(locale);
  const [post] = await db
    .select({ authorId: memberPosts.authorId, category: memberPosts.category })
    .from(memberPosts)
    .where(eq(memberPosts.id, postId))
    .limit(1);

  if (!post || post.authorId !== member.user.id) throw new Error("수정 권한이 없습니다.");

  const requestedCategory = formData.get("category") === "notice" ? "notice" : "free";
  if (requestedCategory === "notice" && member.role !== "admin") {
    throw new Error("공지 작성 권한이 없습니다.");
  }

  await db
    .update(memberPosts)
    .set({
      category: requestedCategory,
      title: requiredText(formData, "title", 200),
      content: requiredText(formData, "content", 20000),
      updatedAt: new Date(),
    })
    .where(eq(memberPosts.id, postId));

  await writeActivity(member.user.id, "update", "member_post", postId);
  revalidatePath(`/${locale}/member/community`);
  revalidatePath(`/${locale}/member/community/${postId}`);
  redirect(`/${locale}/member/community/${postId}`);
}

export async function deletePost(locale: string, postId: string) {
  const member = await requireMember(locale);
  const [post] = await db
    .select({ authorId: memberPosts.authorId })
    .from(memberPosts)
    .where(eq(memberPosts.id, postId))
    .limit(1);

  if (!post || post.authorId !== member.user.id) throw new Error("삭제 권한이 없습니다.");

  await db.delete(memberPosts).where(eq(memberPosts.id, postId));
  await writeActivity(member.user.id, "delete", "member_post", postId);
  revalidatePath(`/${locale}/member/community`);
  redirect(`/${locale}/member/community`);
}

export async function togglePostLike(locale: string, postId: string) {
  const member = await requireMember(locale);
  const [existingLike] = await db
    .select({ id: memberPostLikes.id })
    .from(memberPostLikes)
    .where(and(eq(memberPostLikes.postId, postId), eq(memberPostLikes.userId, member.user.id)))
    .limit(1);

  if (existingLike) {
    await db.delete(memberPostLikes).where(eq(memberPostLikes.id, existingLike.id));
  } else {
    await db.insert(memberPostLikes).values({ postId, userId: member.user.id });
  }

  revalidatePath(`/${locale}/member/community`);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function createComment(locale: string, postId: string, formData: FormData) {
  const member = await requireMember(locale);
  const [post] = await db.select({ id: memberPosts.id }).from(memberPosts).where(eq(memberPosts.id, postId)).limit(1);
  if (!post) throw new Error("존재하지 않는 글입니다.");

  const [comment] = await db
    .insert(memberComments)
    .values({
      postId,
      authorId: member.user.id,
      content: requiredText(formData, "content", 2000),
    })
    .returning({ id: memberComments.id });

  await writeActivity(member.user.id, "create", "member_comment", comment.id);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function deleteComment(locale: string, postId: string, commentId: string) {
  const member = await requireMember(locale);
  const [comment] = await db
    .select({ authorId: memberComments.authorId, postId: memberComments.postId })
    .from(memberComments)
    .where(eq(memberComments.id, commentId))
    .limit(1);

  if (!comment || comment.authorId !== member.user.id || comment.postId !== postId) {
    throw new Error("삭제 권한이 없습니다.");
  }

  await db.delete(memberComments).where(eq(memberComments.id, commentId));
  await writeActivity(member.user.id, "delete", "member_comment", commentId);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function updateMyProfile(locale: string, formData: FormData) {
  const member = await requireMember(locale);
  const interests = String(formData.get("interests") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);

  await db
    .insert(memberProfiles)
    .values({
      userId: member.user.id,
      name: requiredText(formData, "name", 80),
      cohort: String(formData.get("cohort") ?? "").trim().slice(0, 40) || null,
      bio: String(formData.get("bio") ?? "").trim().slice(0, 500) || null,
      interests,
      instagramUrl: optionalUrl(formData, "instagramUrl"),
      githubUrl: optionalUrl(formData, "githubUrl"),
      role: member.role,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: memberProfiles.userId,
      set: {
        name: requiredText(formData, "name", 80),
        cohort: String(formData.get("cohort") ?? "").trim().slice(0, 40) || null,
        bio: String(formData.get("bio") ?? "").trim().slice(0, 500) || null,
        interests,
        instagramUrl: optionalUrl(formData, "instagramUrl"),
        githubUrl: optionalUrl(formData, "githubUrl"),
        updatedAt: new Date(),
      },
    });

  await writeActivity(member.user.id, "update", "member_profile", member.user.id);
  revalidatePath(`/${locale}/member`);
  revalidatePath(`/${locale}/member/profile`);
  redirect(`/${locale}/member/profile`);
}

/**
 * 초대 메일 자동 발송 전까지 사용하는 운영진 승인 목록 관리 기능.
 * 여기에 등록된 이메일만 가입 화면에서 계정을 만들 수 있다.
 */
export async function approveMemberEmail(locale: string, formData: FormData) {
  const member = await requireMember(locale);
  if (member.role !== "admin") throw new Error("운영진 권한이 필요합니다.");

  const email = approvedEmail(formData);
  const role = formData.get("role") === "admin" ? "admin" : "member";

  await db
    .insert(memberAccess)
    .values({ email, role, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: memberAccess.email,
      set: { role, updatedAt: new Date() },
    });

  // 이미 가입한 회원의 프로필 표기도 새 권한과 맞춘다.
  const [existingUser] = await db
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (existingUser) {
    await db
      .update(memberProfiles)
      .set({ role, updatedAt: new Date() })
      .where(eq(memberProfiles.userId, existingUser.id));
  }

  await writeActivity(member.user.id, "approve", "member_access", email);
  revalidatePath(`/${locale}/member/admin`);
}
