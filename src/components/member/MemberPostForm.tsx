"use client";

import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  mode: "create" | "edit";
  isAdmin: boolean;
  defaultValues?: {
    category?: string;
    title?: string;
    content?: string;
  };
  action: (formData: FormData) => Promise<void>;
};

export function MemberPostForm({
  locale,
  mode,
  isAdmin,
  defaultValues,
  action,
}: Props) {
  const [category, setCategory] = useState(defaultValues?.category || "free");
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmMessage = isEdit
      ? "게시글을 수정하시겠습니까?"
      : "게시글을 등록하시겠습니까?";

    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">게시판 분류</label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
        >
          <option value="free">자유글</option>
          {isAdmin && <option value="notice">회원 공지</option>}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">제목</label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="제목을 입력해 주세요"
          className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">내용</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={20000}
          rows={12}
          placeholder="내용을 입력해 주세요..."
          className="rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Link
          href="/member/community"
          className="text-sm font-medium text-muted hover:underline"
        >
          취소하고 돌아가기
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition shadow-sm"
        >
          {isSubmitting
            ? "처리 중…"
            : isEdit
              ? "수정 완료"
              : "등록하기"}
        </button>
      </div>
    </form>
  );
}
