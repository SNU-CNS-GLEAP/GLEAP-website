import "server-only";

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  isMemberEmailConfigured,
  sendMemberVerificationEmail,
} from "@/lib/member-email";
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
  memberAccess,
  memberProfiles,
} from "@/lib/schema";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Vercel Preview는 배포마다 별도의 주소를 사용한다. Preview 환경에서는
 * Vercel이 제공하는 현재 배포 주소를 사용해 로그인 쿠키와 CORS를 맞춘다.
 */
function getAuthBaseUrl() {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return env.betterAuthUrl;
}

const authBaseUrl = getAuthBaseUrl();

// Neon Auth 베타에서는 공개 회원가입을 완전히 끄는 기능이 없으므로,
// member_access 테이블을 실제 동아리 회원 명단(허용 목록)으로 사용한다.
async function findApprovedMember(email: string) {
  const [member] = await db
    .select({ email: memberAccess.email, role: memberAccess.role })
    .from(memberAccess)
    .where(eq(memberAccess.email, email))
    .limit(1);

  return member;
}

// Better Auth는 로그인·세션·계정 테이블을 관리하고,
// member_access는 "누가 GLEAP 회원인지"와 운영진 역할을 별도로 관리한다.
export const memberAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  secret: env.betterAuthSecret,
  baseURL: authBaseUrl,
  // 운영 사이트와 현재 배포 중인 Preview 주소에서만 인증 요청을 허용한다.
  trustedOrigins: [env.betterAuthUrl, authBaseUrl],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // 이메일 소유를 확인하기 전에는 로그인 세션을 만들지 않는다.
    requireEmailVerification: true,
  },
  emailVerification: {
    // 가입 직후 이메일 주소의 실제 소유 여부를 확인한다.
    sendOnSignUp: true,
    // 인증 전 로그인 시에도 새 인증 링크를 다시 보낸다.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMemberVerificationEmail({
        email: user.email,
        verificationUrl: url,
      });
    },
  },
  // 회원가입 요청은 DB에 실제 계정이 생기기 전에 승인 목록과 대조한다.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      if (!isMemberEmailConfigured()) {
        throw new APIError("BAD_REQUEST", {
          message: "이메일 인증 설정을 준비 중입니다. 운영진에게 문의해 주세요.",
        });
      }

      const email = normalizeEmail(ctx.body?.email);
      const approvedMember = await findApprovedMember(email);

      if (!approvedMember) {
        throw new APIError("BAD_REQUEST", {
          message: "운영진이 승인한 이메일 주소만 회원가입할 수 있습니다.",
        });
      }
    }),
  },
  // 가입이 완료되면 빈 프로필을 자동 생성한다. 화면에서 이후 회원이 직접 채운다.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const approvedMember = await findApprovedMember(
            normalizeEmail(user.email),
          );

          if (!approvedMember) return;

          await db
            .insert(memberProfiles)
            .values({
              userId: user.id,
              name: user.name,
              role: approvedMember.role,
            })
            .onConflictDoNothing();
        },
      },
    },
  },
});

/** 현재 로그인 사용자가 운영진 승인 목록에 남아 있는지 함께 확인한다. */
export async function getCurrentMember() {
  const session = await memberAuth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const approvedMember = await findApprovedMember(
    normalizeEmail(session.user.email),
  );

  if (!approvedMember) return null;

  return {
    user: session.user,
    role: approvedMember.role,
  };
}

/** 회원 전용 페이지에서 호출한다. 미로그인·미승인 사용자는 로그인 화면으로 보낸다. */
export async function requireMember(locale: string) {
  const member = await getCurrentMember();

  if (!member) {
    redirect(`/${locale}/member/login`);
  }

  return member;
}
