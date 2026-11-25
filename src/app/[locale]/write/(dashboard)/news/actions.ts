"use server";

import { redirect } from "next/navigation";
import { deletePost } from "@/lib/posts";
import { assertCsrfToken } from "@/lib/csrf";
import { revalidateNewsPages } from "./revalidate";

export async function deletePostAction(locale: string, id: number, formData: FormData) {
  await assertCsrfToken(formData);
  await deletePost(id);
  revalidateNewsPages(id);
  redirect(`/${locale}/write/news`);
}
