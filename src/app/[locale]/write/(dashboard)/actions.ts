"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { assertCsrfToken } from "@/lib/csrf";

export async function logout(locale: string, formData: FormData) {
  await assertCsrfToken(formData);
  const session = await getSession();
  session.destroy();
  redirect(`/${locale}/write/login`);
}
