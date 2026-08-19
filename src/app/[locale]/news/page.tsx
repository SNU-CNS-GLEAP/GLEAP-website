import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localized-text";
import { getPosts, getPostTypes } from "@/lib/posts";
import { excerpt } from "@/lib/text";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewsPage");

  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const type = sp.type?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ posts, total, totalPages }, types] = await Promise.all([
    getPosts({ page, q, type }),
    getPostTypes(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function buildHref(overrides: { page?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    const nextPage = overrides.page;
    if (nextPage && nextPage !== "1") params.set("page", nextPage);
    const queryString = params.toString();
    return queryString ? `/news?${queryString}` : "/news";
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

      <form action={`/${locale}/news`} className="flex flex-wrap gap-2">
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("filterAll")}</option>
          {types.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t("search")}
        </button>
      </form>

      {posts.length === 0 ? (
        <p className="text-muted">{t("empty")}</p>
      ) : (
        <>
          <p className="text-xs text-muted">{t("totalCount", { count: total })}</p>
          <ul className="flex flex-col divide-y divide-border">
            {posts.map((post) => {
              const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
              const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);
              return (
                <li key={post.id} className="flex flex-col gap-1 py-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="rounded-full border border-border px-2 py-0.5">{post.type}</span>
                    <span>{dateFormatter.format(post.createdAt)}</span>
                    {post.authorName && <span>· {post.authorName}</span>}
                  </div>
                  <span className="text-lg font-medium" lang={title.lang}>
                    {title.text}
                  </span>
                  <p className="text-sm text-muted" lang={body.lang}>
                    {excerpt(body.text)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={buildHref({ page: String(page - 1) })} className="text-primary hover:underline">
              {t("prev")}
            </Link>
          ) : (
            <span className="text-muted/50">{t("prev")}</span>
          )}
          <span className="text-muted">{t("pageOf", { page, totalPages })}</span>
          {page < totalPages ? (
            <Link href={buildHref({ page: String(page + 1) })} className="text-primary hover:underline">
              {t("next")}
            </Link>
          ) : (
            <span className="text-muted/50">{t("next")}</span>
          )}
        </nav>
      )}
    </main>
  );
}
