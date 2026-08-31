import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 대시보드 하위 페이지 전부에 상속된다. 로그인해야 볼 수 있는 화면이라 크롤러가 본문까지
// 도달할 일은 없지만, 로그인 페이지와 같은 이유로 URL 색인 자체를 막아둔다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
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
