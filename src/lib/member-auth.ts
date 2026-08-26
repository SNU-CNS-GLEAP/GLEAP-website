import "server-only";

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { cohorts } from "@/content/members";
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
 * Vercel Preview 및 Production 배포 환경 주소를 동적으로 감지하여
 * 로그인 쿠키 및 CORS/Origin을 정확히 맞춘다.
 */
export function getAuthBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return env.betterAuthUrl || "https://gleap-website.vercel.app";
}

/**
 * 초대 메일은 Vercel Preview 주소가 아니라 항상 공개 운영 도메인을 사용한다.
 * Preview Deployment Protection 때문에 수신자에게 Vercel 로그인이 요구되는 것을 막는다.
 */
export function getMemberInvitationBaseUrl() {
  return env.betterAuthUrl || "https://gleap-website.vercel.app";
}

const authBaseUrl = getAuthBaseUrl();

// Neon Auth 베타에서는 공개 회원가입을 완전히 끄는 기능이 없으므로,
// member_access 테이블을 실제 동아리 회원 명단(허용 목록)으로 사용한다.
export async function findApprovedMember(email: string) {
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
  // 대표 사이트, 모든 Vercel Preview/Production 도메인 및 로컬호스트를 동적으로 허용
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    const origins: string[] = [
      "https://gleap-website.vercel.app",
      "https://www.gleap-website.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ];

    if (authBaseUrl) origins.push(authBaseUrl);
    if (env.betterAuthUrl) origins.push(env.betterAuthUrl);

    if (origin) {
      if (origin.endsWith(".vercel.app") || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        origins.push(origin);
      }
    }

    return origins;
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: false,
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
  // 가입이 완료되면 DB 후크로 인증 완료 처리 및 기존 구성원 명단과 연동된 프로필을 자동 생성한다.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const approvedMember = await findApprovedMember(
            normalizeEmail(user.email),
          );

          if (!approvedMember) return;

          // 관리자가 member_access에 등록한 승인 회원은 가입 즉시 emailVerified 상태로 갱신
          await db
            .update(authUsers)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where(eq(authUsers.id, user.id));

          // 기존 구성원 명단(src/content/members.ts)에서 이름으로 기수 및 프로필 링크 자동 연동
          let matchedCohort: string | null = null;
          let matchedBio: string | null = null;
          let matchedInstagram: string | null = null;
          let matchedGithub: string | null = null;

          for (const c of cohorts) {
            const found = c.members.find(
              (m) => m.name.ko === user.name || m.name.en === user.name,
            );
            if (found) {
              matchedCohort = `${c.id}기`;
              if (found.department?.ko) {
                matchedBio = found.role?.ko
                  ? `${found.department.ko} · ${found.role.ko}`
                  : found.department.ko;
              }
              if (found.links?.instagram) matchedInstagram = found.links.instagram;
              if (found.links?.github) matchedGithub = found.links.github;
              break;
            }
          }

          await db
            .insert(memberProfiles)
            .values({
              userId: user.id,
              name: user.name,
              cohort: matchedCohort,
              bio: matchedBio,
              instagramUrl: matchedInstagram,
              githubUrl: matchedGithub,
              role: approvedMember.role,
            })
            .onConflictDoNothing();
        },
      },
    },
  },
});

/** 현재 로그인 사용자가 운영진 승인 목록에 남아 있는지 확인하고 세션을 반환한다. */
export async function getCurrentMember() {
  const session = await memberAuth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const approvedMember = await findApprovedMember(
    normalizeEmail(session.user.email),
  );

  // 운영진 승인 명단에 없는 이메일이면 접근 차단
  if (!approvedMember) return null;

  // 만약 DB에 emailVerified가 false로 남아있다면, 이미 member_access로 승인된 회원이므로 true로 자동 갱신
  if (!session.user.emailVerified) {
    await db
      .update(authUsers)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(authUsers.id, session.user.id));
  }

  return {
    user: {
      ...session.user,
      emailVerified: true,
    },
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
