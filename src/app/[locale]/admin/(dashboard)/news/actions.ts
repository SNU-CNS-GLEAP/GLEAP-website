"use server";

import { redirect } from "next/navigation";
import { deletePost } from "@/lib/posts";

export async function deletePostAction(locale: string, id: number) {
  await deletePost(id);
  redirect(`/${locale}/admin/news`);
}
