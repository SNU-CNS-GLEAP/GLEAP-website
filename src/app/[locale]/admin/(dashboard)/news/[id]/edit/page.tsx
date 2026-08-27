import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PostForm } from "@/components/admin/PostForm";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { CsrfField } from "@/components/CsrfField";
import { getPost, getPostTypes } from "@/lib/posts";
import { updatePostAction } from "./actions";
import { deletePostAction } from "../../actions";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">글 편집</h1>
        <form action={deletePostAction.bind(null, locale, postId)}>
          <CsrfField />
          <ConfirmSubmitButton
            confirmMessage="정말 삭제하시겠습니까? 되돌릴 수 없습니다."
            className="rounded border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white"
          >
            삭제
          </ConfirmSubmitButton>
        </form>
      </div>
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
