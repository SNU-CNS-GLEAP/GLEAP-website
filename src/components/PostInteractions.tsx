"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId: string;
  userId: string;
  likeCount: number;
  initiallyLiked: boolean;
  labels: {
    like: string;
    unlike: string;
    likes: string;
    comment: string;
    commentPlaceholder: string;
    submitComment: string;
    error: string;
  };
};

export function PostInteractions({ postId, userId, likeCount, initiallyLiked, labels }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initiallyLiked);
  const [count, setCount] = useState(likeCount);
  const [pendingLike, setPendingLike] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleLike() {
    setError(null);
    setPendingLike(true);
    const supabase = createClient();
    const { error: likeError } = liked
      ? await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)
      : await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });

    if (likeError) {
      setError(labels.error);
      setPendingLike(false);
      return;
    }

    setLiked((value) => !value);
    setCount((value) => value + (liked ? -1 : 1));
    setPendingLike(false);
    router.refresh();
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;

    const supabase = createClient();
    const { error: commentError } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: userId,
      content,
    });

    if (commentError) {
      setError(labels.error);
      return;
    }

    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          disabled={pendingLike}
          className="rounded border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {liked ? labels.unlike : labels.like}
        </button>
        <span className="text-sm text-muted">{labels.likes.replace("{count}", String(count))}</span>
      </div>
      <form onSubmit={submitComment} className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="comment-content">{labels.comment}</label>
        <textarea
          id="comment-content"
          name="content"
          required
          maxLength={2000}
          rows={3}
          placeholder={labels.commentPlaceholder}
          className="resize-y rounded border border-border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="w-fit rounded bg-primary px-3 py-2 text-sm font-medium text-white">
          {labels.submitComment}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
