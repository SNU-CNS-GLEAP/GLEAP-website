import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { env } from "./env";
import { getSession } from "./session";

export async function verifyPassword(password: string) {
  return bcrypt.compare(password, env.adminPasswordHash);
}

export async function requireAdmin(locale: string) {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect(`/${locale}/admin/login`);
  }
}
