"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CSRF_FIELD_NAME } from "@/lib/csrf-shared";

type Props = {
  action: (formData: FormData) => Promise<void>;
  csrfToken: string;
};

export function MemberCommentForm({ action, csrfToken }: Props) {
  const t = useTranslations("MemberArea");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!content.trim()) {
      event.preventDefault();
      return;
    }

    if (!window.confirm(t("commentConfirm"))) {
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
      className="flex flex-col gap-3 border border-border bg-white p-4 sm:p-5"
    >
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
      <label className="text-xs font-semibold text-muted">{t("commentLabel")}</label>
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={2000}
        rows={3}
        placeholder={t("commentPlaceholder")}
        className="w-full border border-border p-3 text-sm focus:border-primary focus:outline-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="form-button-primary min-h-10 px-5 py-2"
        >
          {isSubmitting ? t("commentPending") : t("commentSubmit")}
        </button>
      </div>
    </form>
  );
}
