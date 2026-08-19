import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PostForm } from "@/components/admin/PostForm";
import { getPost, getPostTypes } from "@/lib/posts";
import { updatePostAction } from "./actions";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditPostPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { error } = await searchParams;

  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    notFound();
  }

  const [post, types] = await Promise.all([getPost(postId), getPostTypes()]);
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">글 편집</h1>
      <PostForm
        action={updatePostAction.bind(null, locale, postId)}
        types={types}
        submitLabel="저장하기"
        errorMessage={error ? "분류·한국어 제목·한국어 본문은 필수입니다." : undefined}
        defaultValues={{
          type: post.type,
          titleKo: post.titleKo,
          titleEn: post.titleEn ?? undefined,
          bodyKo: post.bodyKo,
          bodyEn: post.bodyEn ?? undefined,
          authorName: post.authorName ?? undefined,
          publishedAt: post.publishedAt.toISOString().slice(0, 10),
        }}
      />
    </main>
  );
}
