import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewsPage");

  if (!hasSupabaseConfig()) {
    notFound();
  }

  const supabase = createPublicClient();
  const { data: notice } = await supabase
    .from("posts")
    .select("id, title, content, created_at")
    .eq("id", id)
    .eq("category", "notice")
    .eq("is_public", true)
    .maybeSingle();

  if (!notice) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/news" className="w-fit text-sm text-muted hover:text-primary">
        {t("backToList")}
      </Link>
      <article className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{notice.title}</h1>
          <time className="mt-2 block text-sm text-muted">
            {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(notice.created_at))}
          </time>
        </div>
        <div className="whitespace-pre-wrap leading-7">{notice.content}</div>
      </article>
    </main>
  );
}
