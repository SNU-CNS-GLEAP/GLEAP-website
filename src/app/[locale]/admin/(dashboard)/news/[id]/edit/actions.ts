"use server";

import { redirect } from "next/navigation";
import { updatePost } from "@/lib/posts";
import { assertCsrfToken } from "@/lib/csrf";
import { isPostSection } from "@/lib/post-sections";

export async function updatePostAction(locale: string, id: number, formData: FormData) {
  await assertCsrfToken(formData);
  const type = String(formData.get("type") ?? "").trim();
  const sectionRaw = String(formData.get("section") ?? "").trim();
  const titleKo = String(formData.get("title_ko") ?? "").trim();
  const titleEn = String(formData.get("title_en") ?? "").trim();
  const bodyKo = String(formData.get("body_ko") ?? "").trim();
  const bodyEn = String(formData.get("body_en") ?? "").trim();
  const authorName = String(formData.get("author_name") ?? "").trim();
  const publishedAtRaw = String(formData.get("published_at") ?? "");

  if (!type || !isPostSection(sectionRaw) || !titleKo || !bodyKo) {
    redirect(`/${locale}/admin/news/${id}/edit?error=1`);
  }

  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(publishedAtRaw)
    ? new Date(`${publishedAtRaw}T00:00:00.000Z`)
    : new Date();

  await updatePost(id, {
    type,
    section: sectionRaw,
    titleKo,
    titleEn: titleEn || null,
    bodyKo,
    bodyEn: bodyEn || null,
    authorName: authorName || null,
    publishedAt,
  });

  redirect(`/${locale}/news/${id}`);
}
