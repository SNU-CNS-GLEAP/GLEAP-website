import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { getMemberPosts } from "@/lib/member-community";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberCommunityPage({ params }: Props) {
  const { locale } = await params;
  await requireMember(locale);
  const posts = await getMemberPosts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">회원 전용</p>
          <h1 className="text-2xl font-semibold">회원 게시판</h1>
        </div>
        <Link href="/member/community/new" className="rounded bg-primary px-4 py-2 text-sm font-medium text-white">글쓰기</Link>
      </div>
      {posts.length === 0 ? (
        <p className="rounded border border-dashed border-border p-8 text-center text-muted">아직 작성된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded border border-border">
          {posts.map((post) => (
            <Link key={post.id} href={`/member/community/${post.id}`} className="p-5 hover:bg-surface">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <span className={`rounded px-2 py-1 ${post.category === "notice" ? "bg-amber-100 text-amber-900" : "bg-surface"}`}>
                  {post.category === "notice" ? "회원 공지" : "자유글"}
                </span>
                <span>{post.authorName}</span>
                <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
              </div>
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{post.content}</p>
              <p className="mt-3 text-xs text-muted">댓글 {post.commentCount} · 좋아요 {post.likeCount}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
