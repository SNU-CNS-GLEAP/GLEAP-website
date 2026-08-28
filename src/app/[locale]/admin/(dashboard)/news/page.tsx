import { setRequestLocale } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/posts";
import { POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { CsrfField } from "@/components/CsrfField";
import { deletePostAction } from "./actions";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminNewsListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, totalPages } = await getPosts({ page });

  const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">게시물 관리</h1>
        <div className="flex gap-2">
          {/* 페이지가 아니라 파일 다운로드 응답을 주는 API 라우트라 prefetch를 꺼둠 —
              켜두면 마우스 호버만으로도 엑셀 파일이 매번 새로 생성됨(hover-prefetch) */}
          <NextLink
            href="/api/admin/posts-export"
            prefetch={false}
            className="rounded border border-border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            엑셀 백업 다운로드
          </NextLink>
          <Link
            href="/admin/news/new"
            className="rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            새 글 쓰기
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted">게시물이 없습니다.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="rounded-full border border-primary px-2 py-0.5 text-primary">
                    {POST_SECTION_LABELS[post.section as PostSection].ko}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5">{post.type}</span>
                  <span>{dateFormatter.format(post.publishedAt)}</span>
                </div>
                <span className="font-medium">{post.titleKo}</span>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/admin/news/${post.id}/edit`}
                  className="rounded border border-border px-2 py-1 text-xs hover:border-primary hover:text-primary"
                >
                  편집
                </Link>
                <form action={deletePostAction.bind(null, locale, post.id)}>
                  <CsrfField />
                  <ConfirmSubmitButton
                    confirmMessage="정말 삭제하시겠습니까? 되돌릴 수 없습니다."
                    className="rounded border border-border px-2 py-1 text-xs text-red-600 hover:border-red-600"
                  >
                    삭제
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={`/admin/news?page=${page - 1}`} className="text-primary hover:underline">
              이전
            </Link>
          ) : (
            <span className="text-muted/50">이전</span>
          )}
          <span className="text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin/news?page=${page + 1}`} className="text-primary hover:underline">
              다음
            </Link>
          ) : (
            <span className="text-muted/50">다음</span>
          )}
        </nav>
      )}
    </main>
  );
}
