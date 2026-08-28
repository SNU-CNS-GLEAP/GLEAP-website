function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() || undefined;
}

export const env = {
  adminPasswordHash: required("ADMIN_PASSWORD_HASH"),
  sessionSecret: required("SESSION_SECRET"),
  databaseUrl: required("DATABASE_URL"),
  blobReadWriteToken: optional("BLOB_READ_WRITE_TOKEN") || "",
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  betterAuthUrl: required("BETTER_AUTH_URL"),
  // Turnstile 사이트 키는 서버 컴포넌트가 위젯에 전달하고, 비밀 키는 서버 검증에만 사용한다.
  turnstileSiteKey: required("TURNSTILE_SITE_KEY"),
  turnstileSecretKey: required("TURNSTILE_SECRET_KEY"),
  // Gmail SMTP 발송 설정
  gmailSmtpUser: optional("GMAIL_SMTP_USER"),
  gmailSmtpAppPassword: optional("GMAIL_SMTP_APP_PASSWORD"),
  // Resend 발송 설정 (선택/대체)
  resendApiKey: optional("RESEND_API_KEY"),
  emailFrom: optional("EMAIL_FROM") || (optional("GMAIL_SMTP_USER") ? `GLEAP <${optional("GMAIL_SMTP_USER")}>` : undefined),
  // 소식 게시물 작성/수정 시 본문을 이메일로 백업 발송할지 여부. 값을 명시적으로 "false"로
  // 두지 않는 한 기본 켜짐 — 나중에 끄고 싶으면 이 값만 "false"로 바꾸면 됨(코드 수정 불필요).
  postBackupEmailEnabled: optional("POST_BACKUP_EMAIL_ENABLED") !== "false",
  // 백업 메일을 받을 주소. 비어있으면 발신 계정(GMAIL_SMTP_USER) 자신에게 보낸다 — 즉 기본은
  // "snucnsgleap@gmail.com이 자기 자신에게 보내는" 자체 백업.
  postBackupEmailTo: optional("POST_BACKUP_EMAIL_TO") || optional("GMAIL_SMTP_USER"),
};
