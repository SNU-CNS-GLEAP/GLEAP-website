import { approveMemberEmail } from "../community/actions";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberAccessList } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberAdminPage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);
  if (member.role !== "admin") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold">접근 권한 없음</h1>
        <p className="text-muted">이 화면은 운영진만 사용할 수 있습니다.</p>
        <Link href="/member" className="text-primary">회원 홈으로 돌아가기</Link>
      </main>
    );
  }

  const approvedMembers = await getMemberAccessList();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm text-muted">운영진 전용</p>
        <h1 className="text-2xl font-semibold">회원 승인 관리</h1>
        <p className="mt-2 text-sm text-muted">
          이메일을 먼저 승인한 뒤 그 주소의 회원에게 가입 페이지를 안내하세요. 현재는 자동 초대 메일을 보내지 않습니다.
        </p>
      </div>

      <form action={approveMemberEmail.bind(null, locale)} className="flex flex-col gap-4 rounded border border-border p-6 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">승인할 이메일
          <input name="email" type="email" required maxLength={320} placeholder="member@example.com" className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">권한
          <select name="role" defaultValue="member" className="rounded border border-border px-3 py-2 font-normal">
            <option value="member">일반 회원</option>
            <option value="admin">운영진</option>
          </select>
        </label>
        <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">승인 저장</button>
      </form>

      <section className="rounded border border-border">
        <div className="border-b border-border px-5 py-4"><h2 className="font-semibold">승인된 이메일 {approvedMembers.length}개</h2></div>
        <ul className="divide-y divide-border">
          {approvedMembers.map((approved) => (
            <li key={approved.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="break-all">{approved.email}</span>
              <span className="shrink-0 rounded bg-surface px-2 py-1 text-xs">{approved.role === "admin" ? "운영진" : "일반 회원"}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
