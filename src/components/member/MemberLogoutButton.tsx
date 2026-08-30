"use client";

import { memberAuthClient } from "@/lib/member-auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function MemberLogoutButton({ locale }: { locale: string }) {
  const t = useTranslations("MemberArea");
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await memberAuthClient.signOut();
        router.push(`/${locale}/member/login`);
        router.refresh();
      }}
      className="w-fit rounded border border-border px-3 py-2 text-sm hover:bg-surface"
    >
      {t("logout")}
    </button>
  );
}
