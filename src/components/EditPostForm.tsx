"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  post: { id: string; title: string; content: string };
  labels: {
    title: string;
    content: string;
    save: string;
    saving: string;
    delete: string;
    confirmDelete: string;
    error: string;
  };
};

export function EditPostForm({ locale, post, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: String(formData.get("title") ?? "").trim(),
        content: String(formData.get("content") ?? "").trim(),
      })
      .eq("id", post.id);

    if (updateError) {
      setError(labels.error);
      setPending(false);
      return;
    }

    router.replace(`/${locale}/community/posts/${post.id}`);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(labels.confirmDelete)) return;
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", post.id);

    if (deleteError) {
      setError(labels.error);
      setPending(false);
      return;
    }

    router.replace(`/${locale}/community`);
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <form onSubmit={save} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.title}
          <input
            name="title"
            defaultValue={post.title}
            required
            maxLength={200}
            className="rounded border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.content}
          <textarea
            name="content"
            defaultValue={post.content}
            required
            maxLength={20000}
            rows={12}
            className="resize-y rounded border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? labels.saving : labels.save}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="rounded border border-red-700 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
          >
            {labels.delete}
          </button>
        </div>
      </form>
    </div>
  );
}
