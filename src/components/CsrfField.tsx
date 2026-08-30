import { getCsrfToken } from "@/lib/csrf";
import { CsrfInputs } from "@/components/CsrfInputs";

// admin/*, member/* 등 이미 동적 렌더링(ƒ)인 서버 컴포넌트 폼에서만 쓴다.
// 정적(SSG) 페이지에 얹힌 클라이언트 폼(Nav 로그아웃, MemberAuthForm)은
// cookies()를 여기서 읽으면 페이지 전체가 동적으로 빠지므로, 대신
// /api/session-status가 내려주는 csrfToken을 클라이언트에서 fetch해 쓴다.
export async function CsrfField() {
  const token = await getCsrfToken();
  return <CsrfInputs token={token} />;
}
