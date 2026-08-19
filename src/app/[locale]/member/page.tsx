import { MemberLogoutButton } from "@/components/member/MemberLogoutButton";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MemberHomePage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <p className="text-sm text-muted">회원 전용</p>
      <h1 className="text-2xl font-semibold">안녕하세요, {member.user.name}님</h1>
      <p className="text-muted">회원 전용 커뮤니티와 프로필을 이용할 수 있습니다.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/member/community" className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">회원 게시판</Link>
        <Link href="/member/profile" className="rounded border border-border px-4 py-2 text-sm font-medium hover:bg-surface">내 프로필</Link>
        <Link href="/member/members" className="rounded border border-border px-4 py-2 text-sm font-medium hover:bg-surface">회원 목록</Link>
        {member.role === "admin" && <Link href="/member/admin" className="rounded border border-border px-4 py-2 text-sm font-medium hover:bg-surface">회원 승인 관리</Link>}
      </div>
      <MemberLogoutButton locale={locale} />
    </main>
  );
}
