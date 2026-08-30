import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeMotion } from "@/components/HomeMotion";
import { IdentityImageCarousel } from "@/components/IdentityImageCarousel";
import { excerpt } from "@/lib/text";
import { localize } from "@/lib/localized-text";
import { defaultHomeContent } from "@/content/managed-site";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getHomepagePosts() {
  try {
    const { getPosts } = await import("@/lib/posts");
    const [academic, activity, notice] = await Promise.all([
      getPosts({ page: 1, section: "academic" }),
      getPosts({ page: 1, section: "activity" }),
      getPosts({ page: 1, section: "notice" }),
    ]);

    return {
      latestNews: [...academic.posts, ...activity.posts]
        .sort(
          (a, b) =>
            b.publishedAt.getTime() - a.publishedAt.getTime() || b.id - a.id,
        )
        .slice(0, 3),
      notices: notice.posts.slice(0, 3),
    };
  } catch {
    return { latestNews: [], notices: [] };
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [content, homepagePosts] = await Promise.all([
    Promise.resolve(defaultHomeContent),
    getHomepagePosts(),
  ]);

  const isEnglish = locale === "en";
  const copy = content.copy[isEnglish ? "en" : "ko"];
  const { latestNews, notices } = homepagePosts;
  const dateFormatter = new Intl.DateTimeFormat(isEnglish ? "en-CA" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const sectionCopy = isEnglish
    ? {
        news: "News",
        notice: "Notices",
        viewAll: "View all",
        explore: "Explore activities",
        emptyNews: "New stories are being prepared.",
        emptyNotice: "There are no announcements at this time.",
      }
    : {
        news: "새소식",
        notice: "공지사항",
        viewAll: "더보기",
        explore: "활동 탐색하기",
        emptyNews: "새로운 소식을 준비하고 있습니다.",
        emptyNotice: "현재 등록된 공지사항이 없습니다.",
      };

  const identityCopy = isEnglish
    ? {
        description:
          " is an officially recognized undergraduate organization established by the SNU College of Natural Sciences in 2012. Guided by the motto ‘Connect Science, Illuminate the World,’ students plan and carry out every initiative themselves as a self-governing organization.",
        status: "As of 2026, GLEAP consists of ten 14th-cohort members and ten 15th-cohort members.",
      }
    : {
        description:
          "은 2012년 서울대학교 자연과학대학이 설립한 공인된 학부생 단체로, ‘Connect Science, Illuminate the World’라는 모토 아래 학생들이 직접 모든 활동을 기획하고 실행하는 학생자치단체입니다.",
        status: "2026년 현재 14기 10명, 15기 10명으로 구성되어 있습니다.",
      };

  const identitySlides = isEnglish
    ? [
        {
          src: "/home/identity-slide-1.webp",
          alt: "GLEAP members posing together in a studio",
          label: "GLEAP members",
        },
        {
          src: "/home/identity-slide-2.webp",
          alt: "GLEAP members gathered on the College of Natural Sciences stairs",
          label: "Together in science",
        },
        {
          src: "/home/identity-slide-3.webp",
          alt: "Participants at the 2026 GLEAP Natural Science Concert in Busan",
          label: "Science in action",
        },
      ]
    : [
        {
          src: "/home/identity-slide-1.webp",
          alt: "스튜디오에서 함께 포즈를 취한 GLEAP 구성원",
          label: "GLEAP 구성원",
        },
        {
          src: "/home/identity-slide-2.webp",
          alt: "자연과학대학 계단에 모인 GLEAP 구성원",
          label: "함께하는 탐구",
        },
        {
          src: "/home/identity-slide-3.webp",
          alt: "2026 부산 GLEAP 자연과학콘서트 참가자",
          label: "과학을 행동으로",
        },
      ];

  const activitiesHeadingCopy = isEnglish
    ? {
        firstLine: "We explore deeply, share generously, and connect globally.",
        secondLine: "Every GLEAP initiative begins along one of these three paths.",
      }
    : {
        firstLine: "깊이 탐구하고, 아낌없이 나누며, 더 넓은 세계와 연결됩니다.",
        secondLine: "GLEAP의 모든 프로그램은 이 세 방향에서 출발합니다.",
      };

  const activityCards = [
    {
      id: "academic",
      index: "01",
      orbit: copy.programs.academic.tag,
      title: copy.programs.academic.title,
      description: copy.programs.academic.description,
      tags: isEnglish
        ? ["#Academic Seminar", "#Journal Club", "#Monthly GLEAP"]
        : ["#학술세미나", "#저널 클럽", "#월간 GLEAP"],
      image: content.assets.academic,
      imageAlt: copy.media.academicAlt,
    },
    {
      id: "social",
      index: "02",
      orbit: copy.programs.social.tag,
      title: copy.programs.social.title,
      description: copy.programs.social.description,
      tags: isEnglish
        ? ["#Science Concert", "#GLEAMING"]
        : ["#자연과학콘서트", "#글리밍"],
      image: content.assets.social,
      imageAlt: copy.media.socialAlt,
    },
    {
      id: "exchange",
      index: "03",
      orbit: copy.programs.exchange.tag,
      title: copy.programs.exchange.title,
      description: copy.programs.exchange.description,
      tags: isEnglish
        ? ["#GLEAP Night", "#STEM Exchange", "#KPF Exchange", "#TI:um Exchange"]
        : ["#글립의 밤", "#공유교류", "#KPF교류", "#티:움(TI:um)교류"],
      image: content.assets.exchange,
      imageAlt: copy.media.exchangeAlt,
    },
  ];

  return (
    <main className={styles.page} data-home-page>
      <HomeMotion />

      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.heroMedia} aria-hidden="true">
          <Image
            src={content.assets.hero}
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            className={styles.heroImage}
          />
          <span className={styles.heroShade} />
        </div>

        <div className={`${styles.reveal} ${styles.heroContent}`} data-reveal>
          <h1 id="home-hero-title" className={styles.heroTitle}>
            <span>{copy.hero.lineOne} {copy.hero.lineTwo}</span>
            <span>{copy.hero.lineThree} {copy.hero.lineFour}</span>
          </h1>
          <p className={styles.heroDescription}>
            {isEnglish ? (
              <>
                GLEAP is a student-led Honor Society whose outstanding natural science students learn beyond disciplinary boundaries,
                <br />
                share what they learn with society, and connect with the world.
              </>
            ) : (
              <>
                GLEAP은 탁월한 자연과학도들이 지식의 경계를 넘어 배우고,
                <br />
                사회와 나누며, 세계와 연결되는 학생 주도 Honor Society입니다.
              </>
            )}
          </p>
          <div className={styles.heroActions}>
            <Link href="/about" className={styles.primaryButton}>
              {copy.hero.primaryCta}<span aria-hidden="true">→</span>
            </Link>
            <Link href="/activities" className={styles.secondaryButton}>
              {copy.hero.secondaryCta}<span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.updatesSection} aria-label={isEnglish ? "News and notices" : "새소식과 공지사항"}>
        <div className={styles.updatesInner}>
          <section className={`${styles.reveal} ${styles.updatePanel}`} data-reveal>
            <header className={styles.updateHeader}>
              <h2>{sectionCopy.news}</h2>
              <Link href="/news?section=academic" className={styles.moreLink}>
                {sectionCopy.viewAll}<span aria-hidden="true">›</span>
              </Link>
            </header>

            {latestNews.length > 0 ? (
              <ol className={styles.updateList}>
                {latestNews.map((post) => {
                  const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
                  const body = localize({ ko: post.bodyKo, en: post.bodyEn ?? undefined }, locale);
                  return (
                    <li key={post.id}>
                      <Link href={`/news/${post.id}`} className={styles.updateRow}>
                        <div className={styles.updateTitleLine}>
                          <h3 lang={title.lang}>{title.text}</h3>
                          <time dateTime={post.publishedAt.toISOString()}>{dateFormatter.format(post.publishedAt)}</time>
                        </div>
                        <p lang={body.lang}>{excerpt(body.text, 90)}</p>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className={styles.emptyState}>{sectionCopy.emptyNews}</p>
            )}
          </section>

          <section className={`${styles.reveal} ${styles.updatePanel}`} data-reveal>
            <header className={styles.updateHeader}>
              <h2>{sectionCopy.notice}</h2>
              <Link href="/news?section=notice" className={styles.moreLink}>
                {sectionCopy.viewAll}<span aria-hidden="true">›</span>
              </Link>
            </header>

            {notices.length > 0 ? (
              <ol className={styles.updateList}>
                {notices.map((post) => {
                  const title = localize({ ko: post.titleKo, en: post.titleEn ?? undefined }, locale);
                  return (
                    <li key={post.id}>
                      <Link href={`/news/${post.id}`} className={`${styles.updateRow} ${styles.noticeRow}`}>
                        <div className={styles.updateTitleLine}>
                          <h3 lang={title.lang}>{title.text}</h3>
                          <time dateTime={post.publishedAt.toISOString()}>{dateFormatter.format(post.publishedAt)}</time>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className={styles.emptyState}>{sectionCopy.emptyNotice}</p>
            )}
          </section>
        </div>
      </section>

      <section className={styles.identitySection} aria-labelledby="identity-title">
        <div className={styles.identityInner}>
          <div className={`${styles.reveal} ${styles.identityCopy}`} data-reveal>
            <p className={styles.sectionEyebrow}>{copy.intro.eyebrow}</p>
            <h2 id="identity-title">{copy.intro.title}</h2>
            <p className={styles.identityDescription}>
              GLEAP(<span className={styles.acronymInitial}>G</span>lobal {" "}
              <span className={styles.acronymInitial}>LEA</span>dership {" "}
              <span className={styles.acronymInitial}>P</span>rogram){identityCopy.description}
            </p>
            <p className={styles.identityStatus}>{identityCopy.status}</p>
            <Link href="/members" className={styles.inlineLink}>
              {copy.intro.cta}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <figure className={`${styles.reveal} ${styles.identityMedia}`} data-reveal>
            <IdentityImageCarousel
              slides={identitySlides}
              isEnglish={isEnglish}
            />
          </figure>
        </div>
      </section>

      <section className={styles.activitiesSection} aria-labelledby="activities-title">
        <div className={styles.sectionInner}>
          <header className={`${styles.reveal} ${styles.activitiesHeader}`} data-reveal>
            <p className={styles.sectionEyebrow}>{copy.programs.eyebrow}</p>
            <h2 id="activities-title">{copy.programs.title}</h2>
            <p>
              <span>{activitiesHeadingCopy.firstLine}</span>
              <span>{activitiesHeadingCopy.secondLine}</span>
            </p>
          </header>

          <div className={styles.activityGrid}>
            {activityCards.map((activity) => (
              <article
                key={activity.id}
                className={`${styles.reveal} ${styles.activityCard}`}
                data-activity={activity.id}
                data-reveal
              >
                <div className={styles.activityMedia}>
                  <Image
                    src={activity.image}
                    alt={activity.imageAlt}
                    fill
                    sizes="(min-width: 900px) 31vw, (min-width: 600px) 50vw, 100vw"
                    className={styles.activityImage}
                  />
                  <span className={styles.activityShade} aria-hidden="true" />
                  <div className={styles.activityHeading}>
                    <p>{activity.index} {activity.orbit}</p>
                    <h3>{activity.title}</h3>
                  </div>
                </div>

                <div className={styles.activityBody}>
                  <p>{activity.description}</p>
                  <ul className={styles.activityTags} aria-label={activity.title}>
                    {activity.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                  <Link href={`/activities/${activity.id}`} className={styles.inlineLink}>
                    {sectionCopy.explore}<span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
