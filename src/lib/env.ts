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
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  betterAuthUrl: required("BETTER_AUTH_URL"),
  // Gmail SMTP 발송 설정
  gmailSmtpUser: optional("GMAIL_SMTP_USER"),
  gmailSmtpAppPassword: optional("GMAIL_SMTP_APP_PASSWORD"),
  // Resend 발송 설정 (선택/대체)
  resendApiKey: optional("RESEND_API_KEY"),
  emailFrom: optional("EMAIL_FROM") || (optional("GMAIL_SMTP_USER") ? `GLEAP <${optional("GMAIL_SMTP_USER")}>` : undefined),
};
