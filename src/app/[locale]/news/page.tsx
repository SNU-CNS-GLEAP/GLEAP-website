import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewsPage");

  if (!hasSupabaseConfig()) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted">{t("comingSoon")}</p>
      </main>
    );
  }

  const supabase = createPublicClient();
  const { data: notices } = await supabase
    .from("posts")
    .select("id, title, content, created_at")
    .eq("category", "notice")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      {notices && notices.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link href={`/news/${notice.id}`} className="block py-5 hover:text-primary">
                <h2 className="text-lg font-semibold">{notice.title}</h2>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-muted">{notice.content}</p>
                <time className="mt-2 block text-xs text-muted">
                  {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                    new Date(notice.created_at),
                  )}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t("empty")}</p>
      )}
    </main>
  );
}
