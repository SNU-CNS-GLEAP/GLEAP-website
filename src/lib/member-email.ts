import "server-only";

import tls from "node:tls";
import { env } from "@/lib/env";

type SendMemberVerificationEmailInput = {
  email: string;
  verificationUrl: string;
};

type SendMemberInvitationEmailInput = {
  email: string;
  inviteUrl: string;
  role?: string;
};

export function isMemberEmailConfigured(): boolean {
  const hasGmail = Boolean(env.gmailSmtpUser && env.gmailSmtpAppPassword);
  const hasResend = Boolean(env.resendApiKey && env.emailFrom);
  return hasGmail || hasResend;
}

/**
 * Node.js 내장 TLS 모듈을 사용하여 외부 패키지 없이 Gmail SMTP(포트 465)로 메일을 직접 발송한다.
 */
async function sendViaGmailSmtp({
  user,
  pass,
  from,
  to,
  subject,
  text,
}: {
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const cleanPass = pass.replace(/\s+/g, ""); // Google 앱 비밀번호 공백 제거
  const host = "smtp.gmail.com";
  const port = 465;

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: true,
      },
      () => {
        // Connected to Gmail TLS SMTP
      },
    );

    let buffer = "";
    let step = 0;

    socket.setEncoding("utf-8");

    const commands = [
      () => `EHLO gleap.snu.ac.kr\r
`,
      () => `AUTH LOGIN\r
`,
      () => `${Buffer.from(user).toString("base64")}\r
`,
      () => `${Buffer.from(cleanPass).toString("base64")}\r
`,
      () => `MAIL FROM:<${user}>\r
`,
      () => `RCPT TO:<${to}>\r
`,
      () => `DATA\r
`,
    ];

    function sendNext() {
      if (step < commands.length) {
        const cmd = commands[step]();
        step++;
        socket.write(cmd);
      } else if (step === commands.length) {
        step++;
        const headers = [
          `From: ${from}`,
          `To: ${to}`,
          `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
          `MIME-Version: 1.0`,
          `Content-Type: text/plain; charset=UTF-8`,
          `Content-Transfer-Encoding: base64`,
          ``,
          Buffer.from(text).toString("base64"),
          `\r
.\r
`,
        ].join("\r
");
        socket.write(headers);
      } else {
        socket.write("QUIT\r
");
      }
    }

    socket.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split("\r
");
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1];
      const statusCode = parseInt(lastLine?.slice(0, 3) || "0", 10);

      if (statusCode >= 400) {
        socket.end();
        return reject(new Error(`Gmail SMTP 에러 (${statusCode}): ${lastLine}`));
      }

      if (lastLine && (lastLine[3] === " " || lastLine.length === 3)) {
        buffer = "";
        if (statusCode === 221) {
          socket.end();
          return resolve();
        }
        sendNext();
      }
    });

    socket.on("error", (err) => {
      reject(err);
    });

    socket.setTimeout(15000, () => {
      socket.destroy();
      reject(new Error("Gmail SMTP 서버 연결 시간이 초과되었습니다."));
    });
  });
}

/**
 * 이메일 발송 통합 디스패처 (Gmail SMTP 우선, Resend 차선)
 */
async function dispatchEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const from = env.emailFrom || (env.gmailSmtpUser ? `GLEAP <${env.gmailSmtpUser}>` : "GLEAP <snucnsgleap@gmail.com>");

  // 1. Gmail SMTP 발송
  if (env.gmailSmtpUser && env.gmailSmtpAppPassword) {
    await sendViaGmailSmtp({
      user: env.gmailSmtpUser,
      pass: env.gmailSmtpAppPassword,
      from,
      to,
      subject,
      text,
    });
    return;
  }

  // 2. Resend API 발송
  if (env.resendApiKey && env.emailFrom) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [to],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend 이메일 발송 실패: ${errorText}`);
    }
    return;
  }

  throw new Error("이메일 발송 설정(Gmail SMTP 또는 Resend)이 완료되지 않았습니다.");
}

/**
 * 관리자가 회원을 승인했을 때 가입 링크와 함께 보내는 회원가입 초대장
 */
export async function sendMemberInvitationEmail({
  email,
  inviteUrl,
  role = "member",
}: SendMemberInvitationEmailInput): Promise<void> {
  const roleName = role === "admin" ? "운영진" : "회원";
  const subject = "[GLEAP] 서울대학교 자연과학대학 GLEAP 회원가입 초대장";
  const text = [
    "안녕하세요!",
    "서울대학교 자연과학대학 우수학생모임 GLEAP 회원으로 등록되었습니다.",
    "",
    `[부여된 권한]: ${roleName}`,
    "",
    "아래 링크를 눌러 비밀번호를 설정하고 회원가입을 완료해 주세요:",
    inviteUrl,
    "",
    "※ 이 링크는 본인 전용 초대 링크입니다. 타인에게 공유하지 마세요.",
    "※ 본인이 요청하지 않았거나 관련이 없다면 이 메일을 무시해 주세요.",
    "",
    "- 서울대학교 자연과학대학 GLEAP 운영진 드림",
  ].join("
");

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
  ].join("
");

  await dispatchEmail({ to: email, subject, text });
}
