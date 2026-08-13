import { getLocale } from "next-intl/server";
import { logout } from "./actions";

export default async function AdminDashboardPage() {
  const locale = await getLocale();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">관리자</h1>
      <p className="text-muted">
        로그인되었습니다. 게시물 관리 기능은 다음 단계에서 추가됩니다.
      </p>
      <form action={logout.bind(null, locale)}>
        <button
          type="submit"
          className="w-fit rounded border border-border px-3 py-2 text-sm"
        >
          로그아웃
        </button>
      </form>
    </main>
  );
}
