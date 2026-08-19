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

async function findApprovedMember(email: string) {
  const [member] = await db
    .select({ email: memberAccess.email, role: memberAccess.role })
    .from(memberAccess)
    .where(eq(memberAccess.email, email))
    .limit(1);

  return member;
}

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
  baseURL: env.betterAuthUrl,
  trustedOrigins: [env.betterAuthUrl],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // 회원가입 요청은 DB에 실제 계정이 생기기 전에 승인 목록과 대조한다.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

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
