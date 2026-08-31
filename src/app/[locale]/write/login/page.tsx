import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { CsrfField } from "@/components/CsrfField";
import { env } from "@/lib/env";
import { login } from "./actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

// robots.txt의 `Disallow: /*/write/`은 "크롤링하지 말라"는 요청일 뿐이라, 다른 곳에 링크가
// 걸려 있으면 검색엔진이 URL만으로 색인해 검색 결과에 노출시킬 수 있다. 색인 자체를 막는
// 것은 이 meta 태그다("관리자 페이지 노출" 지적이 실제로 현실화되는 경로가 이쪽).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">소식 게시판 작성자 로그인</h1>
      <form action={login.bind(null, locale)} className="flex flex-col gap-3">
        <CsrfField />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          required
          autoFocus
          autoComplete="off"
          className="rounded border border-border px-3 py-2"
        />
        <TurnstileWidget siteKey={env.turnstileSiteKey} language={locale} />
        <button
          type="submit"
          className="rounded bg-primary px-3 py-2 text-white"
        >
          로그인
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600">
          {error === "turnstile"
            ? "보안 확인에 실패했습니다. 다시 시도해 주세요."
            : "비밀번호가 올바르지 않습니다."}
        </p>
      )}
    </main>
  );
}
