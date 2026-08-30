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

export function formatContentTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}
