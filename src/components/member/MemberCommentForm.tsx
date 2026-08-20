"use client";

import { FormEvent, useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function MemberCommentForm({ action }: Props) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!content.trim()) {
      event.preventDefault();
      return;
    }

    if (!window.confirm("댓글을 등록하시겠습니까?")) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        setContent("");
        setIsSubmitting(false);
      }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:p-5 shadow-sm"
    >
      <label className="text-xs font-semibold text-muted">댓글 작성하기</label>
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={2000}
        rows={3}
        placeholder="댓글을 입력해 주세요..."
        className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:outline-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition shadow-sm"
        >
          {isSubmitting ? "등록 중…" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
