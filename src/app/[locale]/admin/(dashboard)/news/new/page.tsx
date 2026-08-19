import { setRequestLocale } from "next-intl/server";
import { PostEditor } from "@/components/admin/PostEditor";
import { getPostTypes } from "@/lib/posts";
import { createPostAction } from "./actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NewPostPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;
  const types = await getPostTypes();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">새 글 쓰기</h1>
      {error && (
        <p className="text-sm text-red-600">분류·한국어 제목·한국어 본문은 필수입니다.</p>
      )}

      <form action={createPostAction.bind(null, locale)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="type">
            분류
          </label>
          <input
            id="type"
            name="type"
            list="post-types"
            required
            placeholder="예: 공지사항"
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
          <datalist id="post-types">
            {types.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_ko">
            제목 (한국어)
          </label>
          <input
            id="title_ko"
            name="title_ko"
            required
            className="rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_en">
            제목 (English, 선택)
          </label>
          <input id="title_en" name="title_en" className="rounded border border-border px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">본문 (한국어)</label>
          <PostEditor name="body_ko" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">본문 (English, 선택)</label>
          <PostEditor name="body_en" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="author_name">
            작성자 표시명 (선택)
          </label>
          <input
            id="author_name"
            name="author_name"
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="published_at">
            게시일
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            defaultValue={todayDateString()}
            required
            className="w-fit rounded border border-border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          게시하기
        </button>
      </form>
    </main>
  );
}
