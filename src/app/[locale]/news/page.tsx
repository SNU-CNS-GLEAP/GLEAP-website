import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatContentTemplate, localize } from "@/lib/localized-text";
import { getPosts, getPostTypes, PAGE_SIZE } from "@/lib/posts";
import { excerpt } from "@/lib/text";
import { AdminEditButton } from "@/components/admin/AdminEditButton";
import { PageHero } from "@/components/PageHero";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultNewsContent } from "@/content/managed-site";
import { isPostSection, POST_SECTIONS, POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; section?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = defaultNewsContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];

  return {
    title: copy.title,
    description: copy.metaDescription,
    alternates: localizedAlternates(locale, "/news"),
  };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = defaultNewsContent;
  const copy = content.copy[locale === "en" ? "en" : "ko"];

  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const type = sp.type?.trim() || undefined;
  const sectionRaw = sp.section?.trim();
  const section: PostSection | undefined = sectionRaw && isPostSection(sectionRaw) ? sectionRaw : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ posts, total, totalPages }, types] = await Promise.all([
    getPosts({ page, q, type, section }),
    getPostTypes(),
  ]).catch(() => [
    { posts: [], total: 0, totalPages: 1 },
    [],
  ] as const);

  const dateFormatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function buildHref(overrides: { page?: string; section?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    const nextSection = overrides.section !== undefined ? overrides.section : (section ?? "");
    if (nextSection) params.set("section", nextSection);
    const nextPage = overrides.page;
    if (nextPage && nextPage !== "1") params.set("page", nextPage);
    const queryString = params.toString();
    return queryString ? `/news?${queryString}` : "/news";
  }

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={copy.eyebrow} title={copy.title} description={copy.lede} />

      <div className="page-content">
        <nav aria-label={copy.filterLabel} className="mb-8 flex flex-wrap gap-2 border-b border-border pb-5">
          <Link href={buildHref({ section: "" })} className={`border px-4 py-2 text-xs font-semibold transition ${!section ? "border-primary-deep bg-primary-deep text-white" : "border-border bg-white text-muted hover:border-primary hover:text-primary"}`}>
            {copy.sectionAll}
          </Link>
          {POST_SECTIONS.map((value) => (
            <Link key={value} href={buildHref({ section: value })} className={`border px-4 py-2 text-xs font-semibold transition ${section === value ? "border-primary-deep bg-primary-deep text-white" : "border-border bg-white text-muted hover:border-primary hover:text-primary"}`}>
              {POST_SECTION_LABELS[value][locale === "en" ? "en" : "ko"]}
            </Link>
          ))}
        </nav>

        <form action={`/${locale}/news`} className="grid gap-3 border-y border-border py-5 sm:grid-cols-[12rem_minmax(0,1fr)_auto]">
          {section && <input type="hidden" name="section" value={section} />}
          <label>
            <span className="sr-only">{copy.filterLabel}</span>
            <select name="type" defaultValue={type ?? ""} className="min-h-12 w-full border border-border bg-background px-4 text-sm">
              <option value="">{copy.filterAll}</option>
              {types.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{copy.searchLabel}</span>
            <input type="search" name="q" defaultValue={q ?? ""} placeholder={copy.searchPlaceholder} className="min-h-12 w-full border border-border bg-background px-4 text-sm" />
          </label>
          <button type="submit" className="form-button-primary">{copy.search}</button>
        </form>

        <div className="mt-10 flex items-center justify-between gap-4 border-b-2 border-gold pb-4 text-xs text-muted">
          <span>{formatContentTemplate(copy.totalCount, { count: total })}</span>
          {(q || type || section) && <Link href="/news" className="font-medium text-primary hover:underline">{copy.reset}</Link>}
        </div>

        {posts.length === 0 ? (
          <div className="grid min-h-64 place-items-center border-b border-border text-sm text-muted">{copy.empty}</div>
        ) : (
          <ol>
            {posts.map((post, index) => {
              const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
              const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);
              return (
                <li key={post.id} className="group grid gap-4 border-b border-border py-8 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-6">
                  <span className="font-mono text-[10px] text-accent">{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span className={`border px-2 py-1 font-semibold ${post.section === "notice" ? "border-gold text-[#7d6632]" : post.section === "academic" ? "border-accent text-accent" : "border-primary text-primary"}`}>
                        {POST_SECTION_LABELS[post.section as PostSection][locale === "en" ? "en" : "ko"]}
                      </span>
                      <span className="border border-border px-2 py-1">{post.type}</span>
                      <span>{dateFormatter.format(post.publishedAt)}</span>
                      {post.authorName && <span>· {post.authorName}</span>}
                      <AdminEditButton postId={post.id} />
                    </div>
                    <Link href={`/news/${post.id}`} className="mt-4 block font-serif text-2xl font-normal tracking-[-.025em] text-primary-deep group-hover:text-primary sm:text-3xl" lang={title.lang}>{title.text}</Link>
                    <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-7 text-muted" lang={body.lang}>{excerpt(body.text)}</p>
                  </div>
                  <Link href={`/news/${post.id}`} aria-label={title.text} className="hidden self-center text-xl text-muted transition group-hover:translate-x-1 group-hover:text-primary sm:block">→</Link>
                </li>
              );
            })}
          </ol>
        )}

        {totalPages > 1 && (
          <nav aria-label={copy.title} className="mt-10 flex items-center justify-center gap-5 text-sm">
            {page > 1 ? <Link href={buildHref({ page: String(page - 1) })} className="editorial-link">← {copy.prev}</Link> : <span className="text-muted/50">← {copy.prev}</span>}
            <span className="font-mono text-xs text-muted">{formatContentTemplate(copy.pageOf, { page, totalPages })}</span>
            {page < totalPages ? <Link href={buildHref({ page: String(page + 1) })} className="editorial-link">{copy.next} →</Link> : <span className="text-muted/50">{copy.next} →</span>}
          </nav>
        )}
      </div>
    </main>
  );
}
