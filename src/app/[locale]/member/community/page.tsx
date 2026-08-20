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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">회원 게시판</h1>
        </div>
        <Link href="/member/community/new" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition shadow-sm">
          글쓰기
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          <p className="text-base font-medium">아직 작성된 글이 없습니다.</p>
          <p className="mt-1 text-sm">첫 번째 이야기를 공유해 보세요!</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
          {posts.map((post) => (
            <Link key={post.id} href={`/member/community/${post.id}`} className="p-5 hover:bg-surface transition">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <span className={`rounded-full px-2.5 py-0.5 font-medium ${post.category === "notice" ? "bg-amber-100 text-amber-900" : "bg-surface text-foreground border border-border"}`}>
                  {post.category === "notice" ? "회원 공지" : "자유글"}
                </span>
                <span className="font-semibold text-foreground">{post.authorName}</span>
                <span>·</span>
                <span>{post.createdAt.toLocaleDateString("ko-KR")}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground hover:text-primary transition">{post.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted leading-relaxed">{post.content}</p>
              <div className="mt-3.5 flex items-center gap-3 text-xs text-muted">
                <span>댓글 {post.commentCount}개</span>
                <span>·</span>
                <span className="text-primary font-medium">❤️ 좋아요 {post.likeCount}</span>
                <span>·</span>
                <span>💔 싫어요 {post.dislikeCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
