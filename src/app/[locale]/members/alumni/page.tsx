import { getTranslations, setRequestLocale } from "next-intl/server";
import { alumni } from "@/content/members";
import { MemberCard } from "@/components/MemberCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AlumniPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AlumniPage");
  const labels = await getTranslations("MemberCard");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {alumni.map((member, i) => (
          <MemberCard
            key={i}
            member={member}
            locale={locale}
            labels={{
              email: labels("email"),
              blog: labels("blog"),
              instagram: labels("instagram"),
              github: labels("github"),
              linkedin: labels("linkedin"),
            }}
          />
        ))}
      </ul>
    </main>
  );
}
