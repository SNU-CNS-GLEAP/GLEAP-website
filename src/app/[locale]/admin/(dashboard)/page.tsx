import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logout } from "./actions";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">관리자</h1>
      <p className="text-muted">로그인되었습니다.</p>
      <Link
        href="/admin/news/new"
        className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        새 글 쓰기
      </Link>
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
