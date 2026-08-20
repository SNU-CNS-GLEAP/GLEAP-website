import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localized-text";
import { getPost } from "@/lib/posts";
import { parseImageSrc } from "@/lib/image-width";
import { AdminEditButton } from "@/components/admin/AdminEditButton";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

const markdownComponents: Components = {
  h1: (props) => <h2 className="mt-2 text-xl font-semibold" {...props} />,
  h2: (props) => <h3 className="mt-2 text-lg font-semibold" {...props} />,
  h3: (props) => <h4 className="mt-2 text-base font-semibold" {...props} />,
  p: (props) => <p className="leading-relaxed" {...props} />,
  a: (props) => (
    <a className="text-primary underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  ul: (props) => <ul className="list-disc pl-5" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => <blockquote className="border-l-2 border-border pl-4 text-muted" {...props} />,
  code: (props) => <code className="rounded bg-surface px-1 py-0.5 text-sm" {...props} />,
  img: (props) => {
    const { src, widthPercent } = parseImageSrc(String(props.src ?? ""));
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        src={src}
        alt={props.alt ?? ""}
        className="max-w-full rounded"
        style={widthPercent ? { width: `${widthPercent}%`, height: "auto" } : undefined}
      />
    );
  },
};

export default async function NewsDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("NewsPage");

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
  const dateFormatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/news" className="w-fit text-sm text-muted hover:text-primary hover:underline">
        {t("backToList")}
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border px-2 py-0.5">{post.type}</span>
          <span>{dateFormatter.format(post.publishedAt)}</span>
          {post.authorName && <span>· {post.authorName}</span>}
          <AdminEditButton postId={post.id} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight" lang={title.lang}>
          {title.text}
        </h1>
      </div>

      <article className="flex flex-col gap-4 text-foreground" lang={body.lang}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {body.text}
        </ReactMarkdown>
      </article>
    </main>
  );
}
