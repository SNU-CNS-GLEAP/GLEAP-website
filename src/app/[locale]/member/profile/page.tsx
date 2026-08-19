import { updateMyProfile } from "../community/actions";
import { requireMember } from "@/lib/member-auth";
import { getMemberProfile } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

export default async function MyMemberProfilePage({ params }: Props) {
  const { locale } = await params;
  const member = await requireMember(locale);
  const profile = await getMemberProfile(member.user.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm text-muted">회원 전용</p>
        <h1 className="text-2xl font-semibold">내 프로필</h1>
        <p className="mt-2 text-sm text-muted">연락처·주소 등 민감한 개인정보는 입력하지 마세요.</p>
      </div>
      <form action={updateMyProfile.bind(null, locale)} className="flex flex-col gap-4 rounded border border-border p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium">이름
          <input name="name" required maxLength={80} defaultValue={profile?.name ?? member.user.name} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">기수
          <input name="cohort" maxLength={40} defaultValue={profile?.cohort ?? ""} placeholder="예: 2026 봄" className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">한 줄 소개
          <textarea name="bio" maxLength={500} rows={4} defaultValue={profile?.bio ?? ""} className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">관심 분야
          <input name="interests" defaultValue={profile?.interests?.join(", ") ?? ""} placeholder="예: 웹 개발, 디자인" className="rounded border border-border px-3 py-2 font-normal" />
          <span className="text-xs font-normal text-muted">쉼표(,)로 구분해 주세요.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">Instagram 주소 (선택)
          <input name="instagramUrl" type="url" defaultValue={profile?.instagramUrl ?? ""} placeholder="https://instagram.com/..." className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">GitHub 주소 (선택)
          <input name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ""} placeholder="https://github.com/..." className="rounded border border-border px-3 py-2 font-normal" />
        </label>
        <button type="submit" className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white">저장</button>
      </form>
    </main>
  );
}
