import { Link } from "@/i18n/navigation";
import { MemberAuthForm } from "@/components/member/MemberAuthForm";
import { env } from "@/lib/env";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; name?: string; cohort?: string }>;
};

export default async function MemberSignupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { email, name, cohort } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16">
      <div className="mb-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">GLEAP 회원가입</h1>
        <p className="mt-2 text-sm text-muted">
          {name && cohort
            ? `${cohort} ${name}님, 환영합니다! 사용할 비밀번호를 설정해 주세요.`
            : email
              ? "초대받으신 이메일로 사용할 비밀번호와 이름을 설정해 주세요."
              : "운영진이 사전에 승인한 이메일 주소만 가입할 수 있습니다."}
        </p>
      </div>
      <MemberAuthForm
        locale={locale}
        mode="sign-up"
        turnstileSiteKey={env.turnstileSiteKey}
        initialEmail={email ?? ""}
        initialName={name ?? ""}
        initialCohort={cohort ?? ""}
      />
      <p className="mt-5 text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/member/login" className="font-medium text-primary underline hover:opacity-80">
          로그인
        </Link>
      </p>
    </main>
  );
}
