import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface font-sans">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-16 py-32 text-center">
        <Image
          src="/logo_gleap_text.png"
          alt={t("title")}
          width={799}
          height={279}
          className="h-24 w-auto"
          priority
        />
        <p className="text-lg text-muted">{t("subtitle")}</p>
        <p className="text-sm text-muted">{t("description")}</p>
      </main>
    </div>
  );
}
