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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      {/* 상단 웰컴 헤더 */}
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              회원 전용 공간
            </span>
            {member.role === "admin" && (
              <span className="rounded bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                운영진
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            안녕하세요, {member.user.name}님
          </h1>
          <p className="mt-1 text-sm text-muted">
            GLEAP 회원 전용 커뮤니티 및 회원 관리 허브입니다.
          </p>
        </div>
        <div className="pt-2 sm:pt-0">
          <MemberLogoutButton locale={locale} />
        </div>
      </div>

      {/* 대시보드 카드 그리드 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 회원 게시판 */}
        <Link
          href="/member/community"
          className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        >
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
              <span className="text-xl">📝</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
              회원 게시판
            </h2>
            <p className="mt-2 text-sm text-muted">
              공지사항 확인 및 부원들과 자유롭게 소통하고 글을 작성할 수 있습니다.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
            게시판 바로가기 →
          </span>
        </Link>

        {/* 내 프로필 */}
        <Link
          href="/member/profile"
          className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        >
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <span className="text-xl">📇</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
              내 프로필
            </h2>
            <p className="mt-2 text-sm text-muted">
              기수, 관심 분야, 한 줄 소개, SNS 링크 등 내 프로필 정보를 관리합니다.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
            프로필 수정 →
          </span>
        </Link>

        {/* 회원 목록 */}
        <Link
          href="/member/members"
          className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        >
          <div>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <span className="text-xl">👥</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
              회원 목록
            </h2>
            <p className="mt-2 text-sm text-muted">
              동아리 부원들의 프로필과 기수별 소개 정보를 확인합니다.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
            명단 둘러보기 →
          </span>
        </Link>

        {/* 운영진 전용: 회원 승인 관리 */}
        {member.role === "admin" && (
          <Link
            href="/member/admin"
            className="group flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md sm:col-span-2 lg:col-span-3"
          >
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-900 group-hover:bg-amber-600 group-hover:text-white transition">
                <span className="text-xl">⚙️</span>
              </div>
              <h2 className="text-lg font-semibold text-amber-950 group-hover:text-amber-700 transition">
                운영진 전용: 회원 승인 및 권한 관리
              </h2>
              <p className="mt-2 text-sm text-amber-900/80">
                신규 회원의 가입 허용 이메일(화이트리스트)을 등록하고 운영진 권한을 설정합니다.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-xs font-medium text-amber-800">
              관리자 페이지 바로가기 →
            </span>
          </Link>
        )}
      </div>
    </main>
  );
}
