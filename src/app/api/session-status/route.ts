import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCsrfToken } from "@/lib/csrf";

// admin 상태뿐 아니라 CSRF 토큰도 함께 내려준다 — Nav/MobileNav의 로그아웃 폼,
// MemberAuthForm(로그인/가입)처럼 정적 페이지에 얹힌 클라이언트 컴포넌트는
// cookies()를 직접 읽을 수 없으므로(읽으면 그 페이지가 동적으로 빠짐) 이미
// CSR로 호출 중인 이 엔드포인트에 얹어 재사용한다.
export async function GET() {
  const session = await getSession();
  const csrfToken = await getCsrfToken();
  return NextResponse.json({ isAdmin: Boolean(session.isAdmin), csrfToken });
}
