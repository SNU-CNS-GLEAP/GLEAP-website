export type LocalizedText = {
  ko: string;
  en?: string;
};

export function localize(field: LocalizedText, locale: string) {
  if (locale === "en" && field.en) {
    return { text: field.en, lang: undefined };
  }
  return { text: field.ko, lang: "ko" as const };
}
