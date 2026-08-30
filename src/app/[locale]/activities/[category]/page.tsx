import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { activityCategories } from "@/content/activities";
import { formatContentTemplate, localize } from "@/lib/localized-text";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultActivitiesContent } from "@/content/managed-site";
import { getPosts } from "@/lib/posts";
import { excerpt } from "@/lib/text";

type Props = {
  params: Promise<{ locale: string; category: string }>;
};

export function generateStaticParams() {
  return activityCategories.map((category) => ({ category: category.id }));
}

async function safelyGetRelatedPosts(category: "academic" | "exchange" | "social") {
  try {
    const filters = category === "academic"
      ? { section: "academic" as const }
      : {
          section: "activity" as const,
          type: category === "exchange" ? "교류" : "사회공헌",
        };
    const result = await getPosts({ page: 1, ...filters });
    return result.posts.slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const content = defaultActivitiesContent;
  const category = content.categories.find((item) => item.id === categoryId);
  if (!category) return {};

  const title = localize(category.title, locale);
  const programCopy = content.programCopy[locale === "en" ? "en" : "ko"];

  return {
    title: title.text,
    description: programCopy[categoryId as "academic" | "social" | "exchange"].description,
    alternates: localizedAlternates(locale, `/activities/${categoryId}`),
  };
}

export default async function ActivityCategoryPage({ params }: Props) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);

  const content = defaultActivitiesContent;
  const category = content.categories.find((c) => c.id === categoryId);
  if (!category) {
    notFound();
  }

  const copy = content.copy[locale === "en" ? "en" : "ko"];
  const programCopy = content.programCopy[locale === "en" ? "en" : "ko"];
  const title = localize(category.title, locale);
  const categoryIndex = content.categories.findIndex((item) => item.id === categoryId) + 1;
  const typedCategory = categoryId as "academic" | "exchange" | "social";
  const relatedPosts = await safelyGetRelatedPosts(typedCategory);
  const isEnglish = locale === "en";
  const relatedCopy = isEnglish
    ? {
        eyebrow: "From the newsroom",
        title: `Latest ${title.text} stories`,
        description: "New records appear here automatically when a post is published in the matching section or activity tag.",
        viewAll: "View all related news",
        empty: "Related stories will appear here as they are published.",
      }
    : {
        eyebrow: "From the newsroom",
        title: `최근 ${title.text} 소식`,
        description: "게시글이 해당 구분 또는 활동 태그로 발행되면 이곳에 자동으로 연결됩니다.",
        viewAll: "관련 소식 전체 보기",
        empty: "관련 소식이 발행되면 이곳에 자동으로 표시됩니다.",
      };
  const relatedHref = typedCategory === "academic"
    ? "/news?section=academic"
    : `/news?section=activity&type=${encodeURIComponent(typedCategory === "exchange" ? "교류" : "사회공헌")}`;
  const dateFormatter = new Intl.DateTimeFormat(isEnglish ? "en-US" : "ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <main className="page-shell flex-1">
      <PageHero
        eyebrow={formatContentTemplate(copy.detailEyebrow, { number: String(categoryIndex).padStart(2, "0") })}
        title={title.text}
        titleLang={title.lang}
        description={programCopy[categoryId as "academic" | "social" | "exchange"].description}
      />

      <div className="page-content">
        <Link href="/activities" className="editorial-link">{copy.backToAll}</Link>

        <figure className="relative mt-10 aspect-[16/8] min-h-64 overflow-hidden bg-surface">
          <Image
            src={content.images[categoryId as keyof typeof content.images]}
            alt={title.text}
            fill
            sizes="100vw"
            className="object-cover"
            preload
          />
          <figcaption className="absolute bottom-0 right-0 bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[.14em] text-primary-deep">
            GLEAP · {String(categoryIndex).padStart(2, "0")}
          </figcaption>
        </figure>

        <div className="mt-16 border-t-2 border-gold">
          {category.programs.map((program, index) => {
            const name = localize(program.name, locale);
            const description = program.description ? localize(program.description, locale) : null;
            return (
              <section key={program.name.ko} className="grid gap-5 border-b border-border py-9 md:grid-cols-[.35fr_1fr] md:gap-12 md:py-12">
                <div>
                  <span className="font-mono text-[10px] text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-3 font-serif text-3xl font-normal tracking-[-.035em] text-primary-deep" lang={name.lang}>{name.text}</h2>
                </div>
                {description && <p className="text-[.98rem] leading-8 text-[#526078]" lang={description.lang}>{description.text}</p>}
              </section>
            );
          })}
        </div>

        <section className="mt-24 border-t-2 border-primary-deep pt-8 lg:mt-32 lg:pt-12">
          <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="section-kicker">{relatedCopy.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-.045em] text-primary-deep sm:text-4xl">{relatedCopy.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted">{relatedCopy.description}</p>
              <Link href={relatedHref} className="editorial-link mt-7">{relatedCopy.viewAll} <span aria-hidden>↗</span></Link>
            </div>

            {relatedPosts.length > 0 ? (
              <ol className="border-t border-border">
                {relatedPosts.map((post, index) => {
                  const postTitle = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
                  const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);
                  return (
                    <li key={post.id} className="group grid gap-4 border-b border-border py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-6">
                      <span className="font-mono text-[10px] text-accent">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[.08em] text-muted">
                          <span>{post.type}</span><span>·</span><time dateTime={post.publishedAt.toISOString()}>{dateFormatter.format(post.publishedAt)}</time>
                        </div>
                        <Link href={`/news/${post.id}`} className="mt-3 block font-serif text-2xl tracking-[-.03em] text-primary-deep transition group-hover:text-primary" lang={postTitle.lang}>{postTitle.text}</Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted" lang={body.lang}>{excerpt(body.text)}</p>
                      </div>
                      <span className="hidden self-center text-accent transition group-hover:translate-x-1 sm:block" aria-hidden>→</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="grid min-h-44 place-items-center border-y border-border bg-surface px-6 text-center text-sm text-muted">{relatedCopy.empty}</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
