"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { assertCsrfToken } from "@/lib/csrf";

export async function login(locale: string, formData: FormData) {
  await assertCsrfToken(formData);
  const turnstileToken = formData.get("cf-turnstile-response");
  const password = formData.get("password");

  if (!(await verifyTurnstileToken(turnstileToken))) {
    redirect(`/${locale}/admin/login?error=turnstile`);
  }

  if (typeof password !== "string" || !(await verifyPassword(password))) {
    redirect(`/${locale}/admin/login?error=credentials`);
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect(`/${locale}/admin`);
}
