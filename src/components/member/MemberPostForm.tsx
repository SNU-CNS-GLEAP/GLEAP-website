"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CsrfInputs } from "@/components/CsrfInputs";

type Props = {
  mode: "create" | "edit";
  isAdmin: boolean;
  defaultValues?: {
    category?: string;
    title?: string;
    content?: string;
  };
  action: (formData: FormData) => Promise<void>;
  csrfToken: string;
};

export function MemberPostForm({
  mode,
  isAdmin,
  defaultValues,
  action,
  csrfToken,
}: Props) {
  const t = useTranslations("MemberArea");
  const [category, setCategory] = useState(defaultValues?.category || "free");
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmMessage = isEdit
      ? t("postFormConfirmEdit")
      : t("postFormConfirmCreate");

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
      className="flex flex-col gap-7 border-x border-b border-border bg-white p-6 sm:p-10"
    >
      <CsrfInputs token={csrfToken} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">{t("postCategory")}</label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-12 border border-border bg-white px-4 text-sm font-medium focus:border-primary focus:outline-none"
        >
          <option value="free">{t("freePost")}</option>
          {isAdmin && <option value="notice">{t("notice")}</option>}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">{t("postTitle")}</label>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder={t("postTitlePlaceholder")}
          className="min-h-12 border border-border bg-white px-4 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">{t("postContent")}</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={20000}
          rows={12}
          placeholder={t("postContentPlaceholder")}
          className="border border-border bg-white p-4 text-sm leading-relaxed focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Link
          href="/member/community"
          className="text-sm font-medium text-muted hover:underline"
        >
          {t("cancel")}
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="form-button-primary"
        >
          {isSubmitting
            ? t("postPending")
            : isEdit
              ? t("postUpdate")
              : t("postCreate")}
        </button>
      </div>
    </form>
  );
}
