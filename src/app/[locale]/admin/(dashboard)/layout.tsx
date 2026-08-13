import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  await requireAdmin(locale);

  return <>{children}</>;
}
