"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  labels: {
    title: string;
    content: string;
    publishPublicly: string;
    submit: string;
    pending: string;
    error: string;
  };
};

export function NewNoticePostForm({ locale, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const supabase = createClient();
    const { data: claimsData } = await supabase.auth.getClaims();
    const authorId = claimsData?.claims.sub;

    if (typeof authorId !== "string") {
      router.replace(`/${locale}/login`);
      router.refresh();
      return;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      author_id: authorId,
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
      category: "notice",
      is_public: formData.get("isPublic") === "on",
    });

    if (insertError) {
      setError(labels.error);
      setPending(false);
      return;
    }

    router.replace(`/${locale}/community`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.title}
        <input name="title" required maxLength={200} className="rounded border border-border bg-background px-3 py-2 font-normal" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.content}
        <textarea name="content" required maxLength={20000} rows={12} className="resize-y rounded border border-border bg-background px-3 py-2 font-normal" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="isPublic" type="checkbox" defaultChecked />
        {labels.publishPublicly}
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending} className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? labels.pending : labels.submit}
      </button>
    </form>
  );
}
