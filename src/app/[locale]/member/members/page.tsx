import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfiles } from "@/lib/member-community";
import { MemberDirectoryView } from "@/components/member/MemberDirectoryView";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberDirectoryPage({ params }: Props) {
  const { locale } = await params;
  await requireMember(locale);
  const profiles = await getMemberProfiles();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
      {/* 상단 헤더 */}
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            회원 전용 공간
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            GLEAP 구성원 명단
          </h1>
          <p className="mt-1 text-sm text-muted">
            동아리 부원을 클릭하면 상세 프로필 정보를 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/member/profile"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface transition shadow-sm"
          >
            내 프로필 수정
          </Link>
          <Link
            href="/member"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← 회원 홈
          </Link>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <p className="text-base font-medium">아직 등록된 회원 프로필이 없습니다.</p>
          <p className="mt-1 text-sm">
            운영진 관리 페이지에서 회원을 초대하면 프로필이 연동됩니다.
          </p>
        </div>
      ) : (
        <MemberDirectoryView profiles={profiles} />
      )}
    </main>
  );
}
