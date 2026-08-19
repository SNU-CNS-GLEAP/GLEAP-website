import { Link } from "@/i18n/navigation";
import { MemberAuthForm } from "@/components/member/MemberAuthForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MemberSignupPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16">
      <div className="mb-6 w-full max-w-sm">
        <h1 className="text-2xl font-semibold">회원가입</h1>
        <p className="mt-2 text-sm text-muted">운영진이 미리 승인한 이메일 주소만 가입할 수 있습니다.</p>
      </div>
      <MemberAuthForm locale={locale} mode="sign-up" />
      <p className="mt-5 text-sm text-muted">
        이미 가입했나요? <Link href="/member/login" className="text-primary underline">로그인</Link>
      </p>
    </main>
  );
}
