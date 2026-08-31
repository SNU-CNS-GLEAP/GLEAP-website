import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localized-text";
import { getPost } from "@/lib/posts";
import { parseImageSrc } from "@/lib/image-width";
import { AdminEditButton } from "@/components/write/AdminEditButton";
import { PageHero } from "@/components/PageHero";
import { excerpt } from "@/lib/text";
import { localizedAlternates } from "@/lib/site-metadata";
import { defaultNewsContent } from "@/content/managed-site";
import { POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const markdownComponents: Components = {
  h1: (props) => <h2 className="mt-8 text-3xl font-semibold tracking-[-.035em] text-primary-deep" {...props} />,
  h2: (props) => <h3 className="mt-7 text-2xl font-semibold tracking-[-.025em] text-primary-deep" {...props} />,
  h3: (props) => <h4 className="mt-6 text-xl font-semibold text-primary-deep" {...props} />,
  p: (props) => <p className="leading-8" {...props} />,
  a: (props) => (
    <a className="text-primary underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props) => <ul className="list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="list-decimal space-y-2 pl-6" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => <blockquote className="border-l-2 border-accent bg-surface px-5 py-4 text-muted" {...props} />,
  code: (props) => <code className="rounded bg-surface px-1 py-0.5 text-sm" {...props} />,
  img: (props) => {
    const { src, widthPercent } = parseImageSrc(String(props.src ?? ""));
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        src={src}
        alt={props.alt ?? ""}
        className="max-w-full"
        style={widthPercent ? { width: `${widthPercent}%`, height: "auto" } : undefined}
      />
    );
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) return {};

  const post = await getPost(postId);
  if (!post) return {};
  const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
  const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);

  return {
    title: title.text,
    description: excerpt(body.text, 155),
    alternates: localizedAlternates(locale, `/news/${post.id}`),
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const newsContent = defaultNewsContent;
  const copy = newsContent.copy[locale === "en" ? "en" : "ko"];

  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    notFound();
  }

  const post = await getPost(postId);
  if (!post) {
    notFound();
  }

  const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
  const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);
  const missingEnglish = locale === "en" && (title.lang === "ko" || body.lang === "ko");
  const dateFormatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="page-shell flex-1">
      <PageHero eyebrow={`${POST_SECTION_LABELS[post.section as PostSection][locale === "en" ? "en" : "ko"]} · ${post.type}`} title={title.text} titleLang={title.lang}>
        <div className="w-full text-xs leading-6 text-muted">
          <p>{dateFormatter.format(post.publishedAt)}</p>
          {post.authorName && <p>{post.authorName}</p>}
          <AdminEditButton postId={post.id} />
        </div>
      </PageHero>

      <div className="page-content">
        <Link href="/news" className="editorial-link">{copy.backToList}</Link>
        {missingEnglish && (
          <p className="mx-auto mt-8 max-w-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {copy.noEnglishNotice}
          </p>
        )}
        <article className="mx-auto mt-12 flex max-w-3xl flex-col gap-5 border-t-2 border-gold pt-10 text-[1.02rem] text-[#344054]" lang={body.lang}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{body.text}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
