import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getLegalDocument,
  getLegalTitle,
  isLegalDocumentKey,
  legalDocumentKeys,
  type LegalDocumentKey,
} from "@/content/legal";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string; document: string }>;
};

export function generateStaticParams() {
  return legalDocumentKeys.map((document) => ({ document }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, document } = await params;
  if (!isLegalDocumentKey(document)) return {};
  const policy = getLegalDocument(locale, document);
  return {
    title: policy.title,
    description: policy.summary,
    alternates: {
      languages: {
        ko: `/ko/legal/${document}`,
        en: `/en/legal/${document}`,
      },
    },
  };
}

export default async function LegalDocumentPage({ params }: Props) {
  const { locale, document } = await params;
  if (!isLegalDocumentKey(document)) notFound();

  const policy = getLegalDocument(locale, document);
  const isEnglish = locale === "en";

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.shell}>
          <p className={styles.eyebrow}>{policy.eyebrow}</p>
          <h1>{policy.title}</h1>
          <p className={styles.summary}>{policy.summary}</p>
          <div className={styles.meta}>
            <span>{isEnglish ? "Effective" : "시행일"} · {policy.effectiveDate}</span>
            <span>{policy.status}</span>
          </div>
        </div>
      </header>

      <div className={`${styles.shell} ${styles.layout}`}>
        <nav className={styles.index} aria-label={isEnglish ? "Legal documents" : "정책 문서"}>
          <p>{isEnglish ? "Documents" : "정책 문서"}</p>
          {legalDocumentKeys.map((key) => (
            <Link
              key={key}
              href={`/legal/${key}`}
              aria-current={key === document ? "page" : undefined}
              className={key === document ? styles.current : undefined}
            >
              {getLegalTitle(locale, key)}
            </Link>
          ))}
        </nav>

        <article className={styles.article}>
          {policy.sections.map((section, sectionIndex) => (
            <section key={`${section.heading}-${sectionIndex}`}>
              <h2>{section.heading}</h2>
              <div className={styles.blocks}>
                {section.blocks.map((block, blockIndex) => {
                  const key = `${sectionIndex}-${blockIndex}`;
                  if (block.type === "paragraph") return <p key={key}>{block.text}</p>;
                  if (block.type === "callout") return <p key={key} className={styles.callout}>{block.text}</p>;
                  if (block.type === "list") {
                    return (
                      <ul key={key}>
                        {block.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    );
                  }
                  return (
                    <div className={styles.tableWrap} key={key}>
                      <table>
                        <thead>
                          <tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rowIndex) => (
                            <tr key={`${rowIndex}-${row[0]}`}>
                              {row.map((cell, cellIndex) => <td key={`${cellIndex}-${cell}`}>{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {policy.references?.length ? (
            <section>
              <h2>{isEnglish ? "Official references" : "공식 참고자료"}</h2>
              <ul className={styles.references}>
                {policy.references.map((reference) => (
                  <li key={reference.url}>
                    <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label} ↗</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {policy.related?.length ? (
            <aside className={styles.related}>
              <p>{isEnglish ? "Related documents" : "함께 확인할 문서"}</p>
              <div>
                {policy.related.map((key: LegalDocumentKey) => (
                  <Link key={key} href={`/legal/${key}`}>{getLegalTitle(locale, key)} →</Link>
                ))}
              </div>
            </aside>
          ) : null}
        </article>
      </div>
    </main>
  );
}
