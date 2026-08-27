"use server";

import { redirect } from "next/navigation";
import { deletePost } from "@/lib/posts";
import { assertCsrfToken } from "@/lib/csrf";

export async function deletePostAction(locale: string, id: number, formData: FormData) {
  await assertCsrfToken(formData);
  await deletePost(id);
  redirect(`/${locale}/admin/news`);
}
