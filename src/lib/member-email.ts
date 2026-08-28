import "server-only";

import { dispatchEmail, isEmailConfigured } from "@/lib/email";

type SendMemberVerificationEmailInput = {
  email: string;
  verificationUrl: string;
};

type SendMemberInvitationEmailInput = {
  email: string;
  inviteUrl: string;
  name?: string;
  cohort?: string;
  role?: string;
};

export function isMemberEmailConfigured(): boolean {
  return isEmailConfigured();
}

const LF = String.fromCharCode(10);

/**
 * 관리자가 회원을 승인했을 때 가입 링크와 함께 보내는 회원가입 초대장
 */
export async function sendMemberInvitationEmail({
  email,
  inviteUrl,
  name,
  cohort,
  role = "member",
}: SendMemberInvitationEmailInput): Promise<void> {
  const roleName = role === "admin" ? "운영진" : "회원";
  const subject = "[GLEAP] 서울대학교 자연과학대학 GLEAP 회원가입 초대장";
  const greeting = name ? `안녕하세요, ${name}님!` : "안녕하세요!";
  const cohortText = cohort ? `[기수]: ${cohort}` : "";
  
  const text = [
    greeting,
    "본 계정이 서울대학교 자연과학대학 우수학생단체 GLEAP 홈페이지에 등록되었습니다.",
    "",
    cohortText,
    `[부여된 권한]: ${roleName}`,
    "",
    "아래 링크를 눌러 비밀번호를 설정하고 회원가입을 완료해 주세요:",
    inviteUrl,
    "",
    "※ 이 링크는 본인 전용 초대 링크입니다. 타인에게 공유하지 마세요.",
    "※ 본인이 요청하지 않았거나 관련이 없다면 이 메일을 무시해 주세요.",
    "",
    "- 서울대학교 자연과학대학 GLEAP 운영진 드림",
  ]
    .filter((line) => line !== undefined && line !== null)
    .join(LF);

  await dispatchEmail({ to: email, subject, text });
}

/**
 * Better Auth 이메일 인증용 메일 발송
 */
export async function sendMemberVerificationEmail({
  email,
  verificationUrl,
}: SendMemberVerificationEmailInput): Promise<void> {
  const subject = "[GLEAP] 이메일 인증을 완료해 주세요";
  const text = [
    "안녕하세요!",
    "GLEAP 회원가입을 계속하려면 아래 링크를 눌러 이메일 인증을 완료해 주세요:",
    "",
    verificationUrl,
    "",
    "※ 본인이 요청하지 않았다면 이 이메일을 무시해 주세요.",
    "",
    "- 서울대학교 자연과학대학 GLEAP",
  ].join(LF);

  await dispatchEmail({ to: email, subject, text });
}
