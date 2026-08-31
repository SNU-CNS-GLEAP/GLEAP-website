import { approveMemberEmail, removeMemberAccess, resendMemberInvitation } from "../community/actions";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CsrfField } from "@/components/CsrfField";
import { requireMember } from "@/lib/member-auth";
import { getMemberAccessList } from "@/lib/member-community";
import { isMemberEmailConfigured } from "@/lib/member-email";
import { ConfirmSubmitButton } from "@/components/write/ConfirmSubmitButton";
import { MemberPortalHeader } from "@/components/member/MemberPortalHeader";

type Props = { params: Promise<{ locale: string }> };

export default async function MemberAdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("MemberArea");
  const member = await requireMember(locale);
  if (member.role !== "admin") {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
        <h1 className="text-2xl font-semibold">{t("accessDenied")}</h1>
        <p className="text-muted">{t("accessDeniedDescription")}</p>
        <Link href="/member" className="text-primary">{t("returnMemberHome")}</Link>
      </main>
    );
  }

  const approvedMembers = await getMemberAccessList();
  const emailConfigured = isMemberEmailConfigured();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:py-14">
      <MemberPortalHeader
        kicker={t("adminKicker")}
        title={t("adminTitle")}
        description={t("adminDescription")}
        index="A"
        actions={<Link href="/member" className="text-[.68rem] font-semibold uppercase tracking-[.16em] text-white/70 hover:text-accent">{t("backMemberHome")}</Link>}
      />

      <div className="flex flex-col gap-8 border-x border-b border-border bg-white p-6 sm:p-9">

      {/* 발송 시스템 상태 카드 */}
      <div className={`border-l-2 p-4 text-sm ${emailConfigured ? "border-emerald-500 bg-emerald-50/50 text-emerald-900" : "border-[#b49347] bg-amber-50/50 text-amber-900"}`}>
        <div className="flex items-center gap-2 font-semibold">
          <span>{emailConfigured ? `✅ ${t("emailConnected")}` : `⚠️ ${t("emailPending")}`}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {emailConfigured
            ? t("emailConnectedDescription")
            : t("emailPendingDescription")}
        </p>
      </div>

      {/* 신규 회원 승인 및 초대 폼 */}
      <form action={approveMemberEmail.bind(null, locale)} className="flex flex-col gap-5 border border-border bg-white p-6">
        <CsrfField />
        <h2 className="font-serif text-xl font-normal text-primary-deep">{t("inviteTitle")}</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {t("nameLabel")}
            <input
              name="name"
              type="text"
              required
              maxLength={80}
              placeholder={t("namePlaceholder")}
              className="min-h-11 border border-border px-3 font-normal focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {t("cohort")}
            <input
              name="cohort"
              type="text"
              maxLength={40}
              placeholder={t("cohortPlaceholder")}
              defaultValue={t("cohortDefault")}
              className="min-h-11 border border-border px-3 font-normal focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2 lg:col-span-2">
            {t("emailLabel")}
            <input
              name="email"
              type="email"
              required
              maxLength={320}
              placeholder="member@snu.ac.kr"
              className="min-h-11 border border-border px-3 font-normal focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              {t("role")}
              <select
                name="role"
                defaultValue="member"
                className="rounded-lg border border-border px-3 py-1.5 font-normal focus:border-primary focus:outline-none"
              >
                <option value="member">{t("memberRole")}</option>
                <option value="admin">{t("adminRole")}</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                name="sendInvite"
                type="checkbox"
                defaultChecked={true}
                className="h-4 w-4 rounded border-border text-primary"
              />
              {t("sendInvitation")}
            </label>
          </div>

          <button
            type="submit"
            className="form-button-primary w-fit"
          >
            {t("approveInvitation")}
          </button>
        </div>
      </form>

      {/* 승인 목록 테이블 */}
      <section className="border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">{t("approvedList", { count: approvedMembers.length })}</h2>
        </div>
        <div className="divide-y divide-border">
          {approvedMembers.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">{t("emptyApproved")}</p>
          ) : (
            approvedMembers.map((approved) => (
              <div key={approved.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {approved.registeredName || t("notRegistered")}
                    </span>
                    {approved.registeredCohort && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {approved.registeredCohort}
                      </span>
                    )}
                    <span className="text-sm text-muted">({approved.email})</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${approved.role === "admin" ? "bg-amber-100 text-amber-900" : "bg-surface text-muted"}`}>
                      {approved.role === "admin" ? t("adminRole") : t("memberRole")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {approved.isRegistered ? (
                      <span className="text-emerald-700 font-medium">✓ {t("registered")}</span>
                    ) : (
                      <span className="text-amber-700 font-medium">⏳ {t("waiting")}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form action={resendMemberInvitation.bind(null, locale, approved.email)}>
                    <CsrfField />
                    <button
                      type="submit"
                      disabled={!emailConfigured}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface disabled:opacity-40 transition"
                    >
                      {t("resend")}
                    </button>
                  </form>
                  {approved.email !== "snucnsgleap@gmail.com" && (
                    <form action={removeMemberAccess.bind(null, locale, approved.email)}>
                      <CsrfField />
                      <ConfirmSubmitButton
                        confirmMessage={t("removeConfirm", { email: approved.email })}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        {t("remove")}
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </div>
    </main>
  );
}
