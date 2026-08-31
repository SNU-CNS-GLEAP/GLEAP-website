"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { assertCsrfToken } from "@/lib/csrf";
import { getMemberInvitationBaseUrl, requireMember } from "@/lib/member-auth";
import { isMemberEmailConfigured, sendMemberInvitationEmail } from "@/lib/member-email";
import {
  authUsers,
  memberActivityLogs,
  memberAccess,
  memberComments,
  memberPostDislikes,
  memberPostLikes,
  memberPosts,
  memberProfiles,
} from "@/lib/schema";

// 이 파일의 함수는 폼 제출 시 서버에서만 실행된다.
// 브라우저가 권한을 주장하더라도, 실제 회원·작성자 검사는 여기서 다시 한다.

// 브라우저의 입력 검증을 우회한 요청도 막기 위해 서버에서 필수값과 길이를 다시 확인한다.
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

// 인스타그램 아이디 정제 (URL이나 @ 기호가 들어와도 순수 아이디만 저장)
function cleanInstagramUsername(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();
  return cleaned ? cleaned : null;
}

// 프로필 링크에는 웹 주소만 저장해 잘못된 프로토콜 입력을 막는다.
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

// 활동 로그는 운영·문제 확인용 기록이다. 일반 회원 목록이나 게시글 화면에는 노출하지 않는다.
async function writeActivity(actorId: string, action: string, targetType: string, targetId?: string) {
  await db.insert(memberActivityLogs).values({
    actorId,
    action,
    targetType,
    targetId: targetId ?? null,
  });
}

export async function createPost(locale: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const category = formData.get("category") === "notice" ? "notice" : "free";

  // 자유글은 모든 승인 회원이 쓸 수 있지만, 공지는 운영진만 작성할 수 있다.
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
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const [post] = await db
    .select({ authorId: memberPosts.authorId, category: memberPosts.category })
    .from(memberPosts)
    .where(eq(memberPosts.id, postId))
    .limit(1);

  // URL이나 폼 값을 바꿔 보내도 남의 글을 수정하지 못하게 서버에서 작성자를 다시 비교한다.
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

export async function deletePost(locale: string, postId: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const [post] = await db
    .select({ authorId: memberPosts.authorId })
    .from(memberPosts)
    .where(eq(memberPosts.id, postId))
    .limit(1);

  // 작성자 본인 또는 운영진(admin) 권한으로 삭제 가능
  const isAuthor = post && post.authorId === member.user.id;
  const isAdmin = member.role === "admin";
  if (!post || (!isAuthor && !isAdmin)) throw new Error("삭제 권한이 없습니다.");

  await db.delete(memberPosts).where(eq(memberPosts.id, postId));
  await writeActivity(member.user.id, "delete", "member_post", postId);
  revalidatePath(`/${locale}/member/community`);
  redirect(`/${locale}/member/community`);
}

export async function togglePostLike(locale: string, postId: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const [existingLike] = await db
    .select({ id: memberPostLikes.id })
    .from(memberPostLikes)
    .where(and(eq(memberPostLikes.postId, postId), eq(memberPostLikes.userId, member.user.id)))
    .limit(1);

  // 이미 좋아요를 눌렀으면 삭제해 취소하고, 없으면 새로 만든다.
  if (existingLike) {
    await db.delete(memberPostLikes).where(eq(memberPostLikes.id, existingLike.id));
  } else {
    // 좋아요를 누를 때 기존 싫어요가 있다면 취소한다.
    await db
      .delete(memberPostDislikes)
      .where(and(eq(memberPostDislikes.postId, postId), eq(memberPostDislikes.userId, member.user.id)));
    await db.insert(memberPostLikes).values({ postId, userId: member.user.id });
  }

  revalidatePath(`/${locale}/member/community`);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function togglePostDislike(locale: string, postId: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const [existingDislike] = await db
    .select({ id: memberPostDislikes.id })
    .from(memberPostDislikes)
    .where(and(eq(memberPostDislikes.postId, postId), eq(memberPostDislikes.userId, member.user.id)))
    .limit(1);

  // 이미 싫어요를 눌렀으면 삭제해 취소하고, 없으면 새로 만든다.
  if (existingDislike) {
    await db.delete(memberPostDislikes).where(eq(memberPostDislikes.id, existingDislike.id));
  } else {
    // 싫어요를 누를 때 기존 좋아요가 있다면 취소한다.
    await db
      .delete(memberPostLikes)
      .where(and(eq(memberPostLikes.postId, postId), eq(memberPostLikes.userId, member.user.id)));
    await db.insert(memberPostDislikes).values({ postId, userId: member.user.id });
  }

  revalidatePath(`/${locale}/member/community`);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function createComment(locale: string, postId: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  // 댓글 작성 전 게시글 존재 여부를 확인해, 삭제된 글에 댓글이 남지 않게 한다.
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

export async function deleteComment(
  locale: string,
  postId: string,
  commentId: string,
  formData: FormData,
) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  const [comment] = await db
    .select({ authorId: memberComments.authorId, postId: memberComments.postId })
    .from(memberComments)
    .where(eq(memberComments.id, commentId))
    .limit(1);

  // 작성자 본인 또는 운영진(admin) 권한으로 댓글 삭제 가능
  const isAuthor = comment && comment.authorId === member.user.id;
  const isAdmin = member.role === "admin";
  if (!comment || (!isAuthor && !isAdmin) || comment.postId !== postId) {
    throw new Error("삭제 권한이 없습니다.");
  }

  await db.delete(memberComments).where(eq(memberComments.id, commentId));
  await writeActivity(member.user.id, "delete", "member_comment", commentId);
  revalidatePath(`/${locale}/member/community/${postId}`);
}

export async function updateMyProfile(locale: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);

  const name = requiredText(formData, "name", 80);
  const cohort = String(formData.get("cohort") ?? "").trim().slice(0, 40) || null;
  const position = String(formData.get("position") ?? "").trim().slice(0, 80);
  const bioText = String(formData.get("bio") ?? "").trim().slice(0, 500);

  // 직책과 한 줄 소개 결합: [직책] 소개글
  const bio = position
    ? bioText
      ? `[${position}] ${bioText}`
      : `[${position}]`
    : bioText || null;

  // 학술/전공 관심 분야
  const academicInterests = String(formData.get("interests") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);

  // 취미 및 개인 관심사
  const hobbies = String(formData.get("hobbies") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);

  const interests = [
    ...academicInterests,
    ...hobbies.map((h) => `취미: ${h}`),
  ].slice(0, 20);

  const instagramUrl = cleanInstagramUsername(formData.get("instagramUrl"));
  const githubUrl = optionalUrl(formData, "githubUrl");

  await db
    .insert(memberProfiles)
    .values({
      userId: member.user.id,
      name,
      cohort,
      bio,
      interests,
      instagramUrl,
      githubUrl,
      role: member.role,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: memberProfiles.userId,
      set: {
        name,
        cohort,
        bio,
        interests,
        instagramUrl,
        githubUrl,
        updatedAt: new Date(),
      },
    });

  await writeActivity(member.user.id, "update", "member_profile", member.user.id);
  revalidatePath(`/${locale}/member`);
  revalidatePath(`/${locale}/member/profile`);
  revalidatePath(`/${locale}/member/members`);
  redirect(`/${locale}/member/profile`);
}

/**
 * 운영진 승인 목록 관리 및 가입 초대장 발송 기능.
 * 이름, 기수, 이메일, 역할을 함께 등록하여 프로필 및 구성원 데이터와 안전하게 연동한다.
 */
export async function approveMemberEmail(locale: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  if (member.role !== "admin") throw new Error("운영진 권한이 필요합니다.");

  const email = approvedEmail(formData);
  const name = String(formData.get("name") ?? "").trim();
  const cohort = String(formData.get("cohort") ?? "").trim().slice(0, 40) || null;
  const role = formData.get("role") === "admin" ? "admin" : "member";
  const sendInvite = formData.get("sendInvite") === "true" || formData.get("sendInvite") === "on";

  await db
    .insert(memberAccess)
    .values({ email, cohort, role, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: memberAccess.email,
      set: { cohort, role, updatedAt: new Date() },
    });

  // 이미 가입한 회원이 있다면 프로필 정보(이름, 기수, 권한)를 함께 동기화한다.
  const [existingUser] = await db
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (existingUser) {
    if (name) {
      await db.update(authUsers).set({ name, updatedAt: new Date() }).where(eq(authUsers.id, existingUser.id));
    }
    await db
      .insert(memberProfiles)
      .values({
        userId: existingUser.id,
        name: name || "회원",
        cohort: cohort || null,
        role,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: memberProfiles.userId,
        set: {
          ...(name ? { name } : {}),
          ...(cohort ? { cohort } : {}),
          role,
          updatedAt: new Date(),
        },
      });
  }

  await writeActivity(member.user.id, "approve", "member_access", email);

  // 초대 메일 자동 발송
  if (sendInvite && isMemberEmailConfigured()) {
    const params = new URLSearchParams();
    params.set("email", email);
    if (name) params.set("name", name);
    if (cohort) params.set("cohort", cohort);

    const inviteUrl = `${getMemberInvitationBaseUrl()}/${locale}/member/signup?${params.toString()}`;
    try {
      await sendMemberInvitationEmail({ email, inviteUrl, name, cohort: cohort ?? undefined, role });
      await writeActivity(member.user.id, "send_invite_email", "member_access", email);
    } catch (err) {
      console.error("초대 메일 발송 실패:", err);
    }
  }

  revalidatePath(`/${locale}/member/admin`);
}

/**
 * 운영진이 특정 회원에게 초대 메일을 다시 발송한다.
 */
export async function resendMemberInvitation(locale: string, email: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  if (member.role !== "admin") throw new Error("운영진 권한이 필요합니다.");

  const [approved] = await db
    .select({
      email: memberAccess.email,
      role: memberAccess.role,
      name: memberProfiles.name,
      cohort: memberProfiles.cohort,
    })
    .from(memberAccess)
    .leftJoin(authUsers, eq(memberAccess.email, authUsers.email))
    .leftJoin(memberProfiles, eq(authUsers.id, memberProfiles.userId))
    .where(eq(memberAccess.email, email))
    .limit(1);

  if (!approved) throw new Error("승인 명단에 없는 이메일입니다.");

  if (!isMemberEmailConfigured()) {
    throw new Error("이메일 발송 설정이 완료되지 않았습니다.");
  }

  const params = new URLSearchParams();
  params.set("email", email);
  if (approved.name) params.set("name", approved.name);
  if (approved.cohort) params.set("cohort", approved.cohort);

  const inviteUrl = `${getMemberInvitationBaseUrl()}/${locale}/member/signup?${params.toString()}`;
  await sendMemberInvitationEmail({
    email,
    inviteUrl,
    name: approved.name ?? undefined,
    cohort: approved.cohort ?? undefined,
    role: approved.role,
  });
  await writeActivity(member.user.id, "resend_invite_email", "member_access", email);
  revalidatePath(`/${locale}/member/admin`);
}

/**
 * 운영진이 승인 명단에서 회원을 삭제(접근 권한 회수 및 계정 정리)한다.
 */
export async function removeMemberAccess(locale: string, email: string, formData: FormData) {
  await assertCsrfToken(formData);
  const member = await requireMember(locale);
  if (member.role !== "admin") throw new Error("운영진 권한이 필요합니다.");

  if (email === "snucnsgleap@gmail.com") {
    throw new Error("기본 관리자 계정은 삭제할 수 없습니다.");
  }

  // 승인 목록에서 삭제하고, 가입된 계정이 있다면 user 테이블에서 삭제 (member_profiles 등 자동 연쇄 삭제)
  await db.delete(authUsers).where(eq(authUsers.email, email));
  await db.delete(memberAccess).where(eq(memberAccess.email, email));
  await writeActivity(member.user.id, "revoke", "member_access", email);
  revalidatePath(`/${locale}/member/admin`);
  revalidatePath(`/${locale}/member/members`);
}
