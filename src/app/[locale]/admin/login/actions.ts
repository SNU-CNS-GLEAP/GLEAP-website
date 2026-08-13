"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function login(locale: string, formData: FormData) {
  const password = formData.get("password");

  if (typeof password !== "string" || !(await verifyPassword(password))) {
    redirect(`/${locale}/admin/login?error=1`);
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect(`/${locale}/admin`);
}
