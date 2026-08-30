import { CSRF_FIELD_NAMES } from "@/lib/csrf-shared";

/** 폼 안에 심는 anti-CSRF hidden 필드들. 서버 컴포넌트 폼은 <CsrfField />(토큰을
 * 직접 발급)를, 정적 페이지에 얹힌 클라이언트 폼은 fetch로 받아온 토큰을 prop으로
 * 넘겨 이 컴포넌트를 직접 쓴다. 이름을 여러 개 쓰는 이유는 csrf-shared.ts 주석 참고. */
export function CsrfInputs({ token }: { token: string }) {
  return (
    <>
      {CSRF_FIELD_NAMES.map((name) => (
        <input key={name} type="hidden" name={name} value={token} readOnly />
      ))}
    </>
  );
}
