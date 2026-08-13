import { getLocale } from "next-intl/server";
import { login } from "./actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const locale = await getLocale();
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">관리자 로그인</h1>
      <form action={login.bind(null, locale)} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          required
          autoFocus
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white dark:bg-white dark:text-black"
        >
          로그인
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>
      )}
    </main>
  );
}
