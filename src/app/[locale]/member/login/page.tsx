import { Link } from "@/i18n/navigation";
import { MemberAuthForm } from "@/components/member/MemberAuthForm";
import { env } from "@/lib/env";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MemberLoginPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16">
      <div className="mb-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold">회원 로그인</h1>
        <p className="mt-2 text-sm text-muted">승인된 GLEAP 회원만 로그인할 수 있습니다.</p>
      </div>
      <MemberAuthForm
        locale={locale}
        mode="sign-in"
        turnstileSiteKey={env.turnstileSiteKey}
      />
      <p className="mt-5 text-sm text-muted">
        처음 오셨나요? <Link href="/member/signup" className="text-primary underline">승인된 이메일로 회원가입</Link>
      </p>
    </main>
  );
}
