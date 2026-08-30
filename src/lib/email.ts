import "server-only";

import tls from "node:tls";
import { env } from "@/lib/env";

export function isEmailConfigured(): boolean {
  const hasGmail = Boolean(env.gmailSmtpUser && env.gmailSmtpAppPassword);
  const hasResend = Boolean(env.resendApiKey && env.emailFrom);
  return hasGmail || hasResend;
}

const CRLF = String.fromCharCode(13, 10);

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

  return new Promise<void>((resolve, reject) => {
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
      () => `EHLO gleap.snu.ac.kr${CRLF}`,
      () => `AUTH LOGIN${CRLF}`,
      () => `${Buffer.from(user).toString("base64")}${CRLF}`,
      () => `${Buffer.from(cleanPass).toString("base64")}${CRLF}`,
      () => `MAIL FROM:<${user}>${CRLF}`,
      () => `RCPT TO:<${to}>${CRLF}`,
      () => `DATA${CRLF}`,
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
          ``,
          `.`,
          ``,
        ].join(CRLF);
        socket.write(headers);
      } else {
        socket.write(`QUIT${CRLF}`);
      }
    }

    socket.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split(CRLF);
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
 * 이메일 발송 통합 디스패처 (Gmail SMTP 우선, Resend 차선).
 * 회원 인증/초대 메일(member-email.ts)과 소식 게시물 백업 메일(post-backup-email.ts)이
 * 이 함수 하나를 공유한다 — SMTP 연결·재시도 로직을 두 곳에서 따로 관리하지 않기 위함.
 */
export async function dispatchEmail({
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
