/**
 * Three ways to read the same theory.
 *
 * "translit" is the Hebrew vocabulary in Latin letters, which is how these
 * terms get written in an English-language setting. "he" is the same
 * vocabulary in Hebrew, and reads right to left. "en" is the international
 * naming - major third, perfect fifth - which is what English-language
 * material and most software use.
 */
export type Lang = "he" | "en" | "translit";

export const LANGS: Lang[] = ["translit", "he", "en"];

/** What each option calls itself, in itself. */
export const LANG_NAMES: Record<Lang, string> = {
  translit: "Ivrit be-otiyot lo'aziyot",
  he: "עברית",
  en: "English",
};

export function isRtl(lang: Lang): boolean {
  return lang === "he";
}
