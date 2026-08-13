import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin(locale);

  return <>{children}</>;
}
