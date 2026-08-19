import { setRequestLocale } from "next-intl/server";
import { PostForm } from "@/components/admin/PostForm";
import { getPostTypes } from "@/lib/posts";
import { createPostAction } from "./actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewPostPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;
  const types = await getPostTypes();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">새 글 쓰기</h1>
      <PostForm
        action={createPostAction.bind(null, locale)}
        types={types}
        submitLabel="게시하기"
        errorMessage={error ? "분류·한국어 제목·한국어 본문은 필수입니다." : undefined}
      />
    </main>
  );
}
