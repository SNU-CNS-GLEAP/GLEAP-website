import "server-only";

import { env } from "@/lib/env";

type SendMemberVerificationEmailInput = {
  email: string;
  verificationUrl: string;
};

export function isMemberEmailConfigured() {
  return Boolean(env.resendApiKey && env.emailFrom);
}

/**
 * 인증 링크와 API 키는 로그에 남기지 않는다.
 * EMAIL_FROM은 Resend에서 인증한 발신자여야 한다.
 */
export async function sendMemberVerificationEmail({
  email,
  verificationUrl,
}: SendMemberVerificationEmailInput) {
  if (!env.resendApiKey || !env.emailFrom) {
    throw new Error("회원 인증 이메일 설정이 완료되지 않았습니다.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [email],
      subject: "[GLEAP] 이메일 인증을 완료해 주세요",
      text: [
        "GLEAP 회원가입을 계속하려면 아래 링크를 눌러 이메일 인증을 완료해 주세요.",
        "",
        verificationUrl,
        "",
        "본인이 요청하지 않았다면 이 이메일을 무시해 주세요.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error("회원 인증 이메일을 보내지 못했습니다.");
  }
}
