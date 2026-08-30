import { getTranslations } from "next-intl/server";
import { PostEditor } from "./PostEditor";
import { CsrfField } from "@/components/CsrfField";
import { POST_SECTIONS, POST_SECTION_LABELS, type PostSection } from "@/lib/post-sections";

const ACTIVITY_TYPE_PRESETS = ["교류", "사회공헌"] as const;

type Props = {
  action: (formData: FormData) => void;
  types: string[];
  submitLabel: string;
  errorMessage?: string;
  defaultValues?: {
    type?: string;
    section?: PostSection;
    titleKo?: string;
    titleEn?: string;
    bodyKo?: string;
    bodyEn?: string;
    authorName?: string;
    publishedAt?: string;
  };
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export async function PostForm({ action, types, submitLabel, errorMessage, defaultValues = {} }: Props) {
  const t = await getTranslations("AdminArea");
  const mappingRules = [
    { title: t("mappingNotice"), section: "공지", tag: t("mappingFreeTag") },
    { title: t("mappingAcademic"), section: "학술 소식", tag: t("mappingFreeTag") },
    { title: t("mappingExchange"), section: "활동 소식", tag: "교류" },
    { title: t("mappingSocial"), section: "활동 소식", tag: "사회공헌", note: t("mappingNoSpace") },
  ];

  return (
    <>
      {errorMessage && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
      <form action={action} className="flex flex-col gap-6">
        <CsrfField />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="section">{t("section")}</label>
            <select id="section" name="section" required defaultValue={defaultValues.section ?? "notice"}>
              {POST_SECTIONS.map((section) => (
                <option key={section} value={section}>{POST_SECTION_LABELS[section].ko}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="type">{t("category")}</label>
            <input
              id="type"
              name="type"
              list="post-types"
              required
              maxLength={80}
              defaultValue={defaultValues.type}
              placeholder={t("categoryPlaceholder")}
            />
            <datalist id="post-types">
              {[...new Set([...types, ...ACTIVITY_TYPE_PRESETS])].map((type) => <option key={type} value={type} />)}
            </datalist>
          </div>
        </div>
        <section className="-mt-2 border border-[#cbd8e8] bg-[#f6f8fb] p-4 sm:p-5" aria-labelledby="post-mapping-guide-title">
          <div className="border-l-2 border-primary pl-3">
            <h2 id="post-mapping-guide-title" className="text-sm font-semibold text-primary-deep">{t("mappingGuideTitle")}</h2>
            <p className="mt-1 text-xs leading-5 text-muted">{t("mappingGuideDescription")}</p>
          </div>

          <ul className="mt-4 grid gap-2 lg:grid-cols-2">
            {mappingRules.map((rule) => (
              <li key={rule.title} className="grid gap-2 border border-border bg-white p-3 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-start sm:gap-3">
                <span className="text-sm font-semibold text-primary-deep">{rule.title}</span>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs text-muted">
                  <span className="border border-[#d8e1ec] bg-surface px-2 py-1 font-medium text-foreground">{t("section")}</span>
                  <span aria-hidden>→</span>
                  <strong className="font-semibold text-primary">{rule.section}</strong>
                  <span className="text-[#a9b5c5]" aria-hidden>·</span>
                  {rule.tag === t("mappingFreeTag") ? (
                    <span>{rule.tag}</span>
                  ) : (
                    <>
                      <span className="border border-[#d8e1ec] bg-surface px-2 py-1 font-medium text-foreground">{t("category")}</span>
                      <span aria-hidden>→</span>
                      <strong className="font-semibold text-primary">{rule.tag}</strong>
                    </>
                  )}
                  {rule.note ? <span className="font-medium text-[#8a5b20]">({rule.note})</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_ko">
            {t("titleKo")}
          </label>
          <input
            id="title_ko"
            name="title_ko"
            required
            maxLength={200}
            defaultValue={defaultValues.titleKo}
            className="min-h-11 border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="title_en">
            {t("titleEn")}
          </label>
          <input
            id="title_en"
            name="title_en"
            maxLength={200}
            defaultValue={defaultValues.titleEn}
            className="min-h-11 border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("bodyKo")}</label>
          <PostEditor name="body_ko" defaultValue={defaultValues.bodyKo} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t("bodyEn")}</label>
          <PostEditor name="body_en" defaultValue={defaultValues.bodyEn} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="author_name">
            {t("authorName")}
          </label>
          <input
            id="author_name"
            name="author_name"
            defaultValue={defaultValues.authorName}
            className="min-h-11 w-full border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none sm:w-72"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="published_at">
            {t("publishedAt")}
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            required
            defaultValue={defaultValues.publishedAt ?? todayDateString()}
            className="min-h-11 w-full border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none sm:w-72"
          />
        </div>

        <button
          type="submit"
          className="form-button-primary w-fit"
        >
          {submitLabel}
        </button>
      </form>
    </>
  );
}
