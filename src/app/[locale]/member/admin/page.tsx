import { approveMemberEmail, removeMemberAccess, resendMemberInvitation } from "../community/actions";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberAccessList } from "@/lib/member-community";
import { isMemberEmailConfigured } from "@/lib/member-email";

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
  const emailConfigured = isMemberEmailConfigured();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">운영진 전용</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">회원 승인 및 초대 관리</h1>
          <p className="mt-1 text-sm text-muted">
            부원의 이메일을 등록하고 가입 초대 링크를 발송합니다.
          </p>
        </div>
        <Link href="/member" className="text-sm font-medium text-primary hover:underline">
          ← 회원 홈으로
        </Link>
      </div>

      {/* 발송 시스템 상태 카드 */}
      <div className={`rounded-xl border p-4 text-sm ${emailConfigured ? "border-emerald-200 bg-emerald-50/50 text-emerald-900" : "border-amber-200 bg-amber-50/50 text-amber-900"}`}>
        <div className="flex items-center gap-2 font-semibold">
          <span>{emailConfigured ? "✅ 이메일 발송 연결됨" : "⚠️ 이메일 발송 설정 대기 중"}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {emailConfigured
            ? "Gmail SMTP 또는 메일 서비스가 연결되어 있어 승인 시 초대장이 자동으로 발송됩니다."
            : "환경변수(GMAIL_SMTP_USER, GMAIL_SMTP_APP_PASSWORD)가 등록되면 초대 메일이 실제 자동 발송됩니다."}
        </p>
      </div>

      {/* 신규 회원 승인 및 초대 폼 */}
      <form action={approveMemberEmail.bind(null, locale)} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">신규 회원 등록 및 초대장 발송</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
            이메일 주소
            <input
              name="email"
              type="email"
              required
              maxLength={320}
              placeholder="member@snu.ac.kr"
              className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            부여할 권한
            <select
              name="role"
              defaultValue="member"
              className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
            >
              <option value="member">일반 회원</option>
              <option value="admin">운영진</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              name="sendInvite"
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 rounded border-border text-primary"
            />
            등록 즉시 가입 초대 메일 발송하기
          </label>
          <button
            type="submit"
            className="w-fit rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
          >
            승인 및 초대장 발송
          </button>
        </div>
      </form>

      {/* 승인 목록 테이블 */}
      <section className="rounded-xl border border-border bg-background shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">승인된 회원 명단 ({approvedMembers.length}명)</h2>
        </div>
        <div className="divide-y divide-border">
          {approvedMembers.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">등록된 승인 회원이 없습니다.</p>
          ) : (
            approvedMembers.map((approved) => (
              <div key={approved.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{approved.email}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${approved.role === "admin" ? "bg-amber-100 text-amber-900" : "bg-surface text-muted"}`}>
                      {approved.role === "admin" ? "운영진" : "일반 회원"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {approved.isRegistered ? (
                      <span className="text-emerald-700 font-medium">✓ 가입 완료 ({approved.registeredName ?? "이름 없음"})</span>
                    ) : (
                      <span className="text-amber-700 font-medium">⏳ 가입 대기 중 (초대 발송됨)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form action={resendMemberInvitation.bind(null, locale, approved.email)}>
                    <button
                      type="submit"
                      disabled={!emailConfigured}
                      className="rounded border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface disabled:opacity-40 transition"
                    >
                      초대장 재발송
                    </button>
                  </form>
                  {approved.email !== "snucnsgleap@gmail.com" && (
                    <form action={removeMemberAccess.bind(null, locale, approved.email)}>
                      <button
                        type="submit"
                        className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        삭제
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
