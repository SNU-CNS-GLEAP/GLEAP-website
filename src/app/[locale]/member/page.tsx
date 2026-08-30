import { MemberLogoutButton } from "@/components/member/MemberLogoutButton";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireMember } from "@/lib/member-auth";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MemberHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={`${t("privateArea")}${member.role === "admin" ? ` · ${t("admin")}` : ""}`}
        title={t("greeting", { name: member.user.name })}
        description={t("hubDescription")}
        actions={<MemberLogoutButton locale={locale} />}
      />

      <div className="grid border-x border-b border-border sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/member/community"
          className="group flex min-h-72 flex-col justify-between border-b border-border bg-white p-7 transition hover:bg-surface sm:border-r lg:border-b-0"
        >
          <div>
            <span className="font-serif text-4xl text-primary/30">01</span>
            <h2 className="mt-10 font-serif text-2xl text-primary-deep transition group-hover:text-primary">
              {t("boardTitle")}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
              {t("boardDescription")}
            </p>
          </div>
          <span className="mt-8 flex items-center justify-between border-t border-border pt-4 text-[.68rem] font-semibold uppercase tracking-[.18em] text-primary">
            {t("boardLink")} <span aria-hidden>→</span>
          </span>
        </Link>

        <Link
          href="/member/profile"
          className="group flex min-h-72 flex-col justify-between border-b border-border bg-white p-7 transition hover:bg-surface lg:border-b-0 lg:border-r"
        >
          <div>
            <span className="font-serif text-4xl text-primary/30">02</span>
            <h2 className="mt-10 font-serif text-2xl text-primary-deep transition group-hover:text-primary">
              {t("profileTitle")}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
              {t("profileDescription")}
            </p>
          </div>
          <span className="mt-8 flex items-center justify-between border-t border-border pt-4 text-[.68rem] font-semibold uppercase tracking-[.18em] text-primary">
            {t("profileLink")} <span aria-hidden>→</span>
          </span>
        </Link>

        <Link
          href="/member/members"
          className="group flex min-h-72 flex-col justify-between bg-white p-7 transition hover:bg-surface sm:col-span-2 lg:col-span-1"
        >
          <div>
            <span className="font-serif text-4xl text-primary/30">03</span>
            <h2 className="mt-10 font-serif text-2xl text-primary-deep transition group-hover:text-primary">
              {t("directoryTitle")}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-7 text-muted">
              {t("directoryDescription")}
            </p>
          </div>
          <span className="mt-8 flex items-center justify-between border-t border-border pt-4 text-[.68rem] font-semibold uppercase tracking-[.18em] text-primary">
            {t("directoryLink")} <span aria-hidden>→</span>
          </span>
        </Link>
      </div>

      {member.role === "admin" && (
        <Link
          href="/member/admin"
          className="group grid gap-5 bg-[#b49347] px-7 py-7 text-primary-deep transition hover:bg-[#c7a755] sm:grid-cols-[auto_1fr_auto] sm:items-center"
        >
          <span className="font-serif text-3xl">A</span>
          <span>
            <strong className="block font-serif text-xl font-normal">{t("adminPanelTitle")}</strong>
            <span className="mt-1 block text-sm text-primary-deep/70">{t("adminPanelDescription")}</span>
          </span>
          <span className="text-[.68rem] font-bold uppercase tracking-[.18em]">{t("adminPanelLink")} →</span>
        </Link>
      )}
    </main>
  );
}
