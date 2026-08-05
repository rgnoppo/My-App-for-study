export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .trim();
}

export function matches(haystack: string, query: string): boolean {
  if (!query.trim()) return false;
  return normalizeArabic(haystack).includes(normalizeArabic(query));
}
