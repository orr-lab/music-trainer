/**
 * The piano keyboard used for counting semitones.
 *
 * Everything here is in absolute semitones - octave * 12 + offset - because
 * that is the unit being counted. Two octaves plus the closing C, so an octave
 * can be counted from any starting key.
 */

import type { Lang } from "@/lib/i18n/lang";
import { SHARP_WORD, SOLFEGE_SYLLABLES } from "@/lib/i18n/music";

export const WHITE_OFFSETS = [0, 2, 4, 5, 7, 9, 11];
export const BLACK_OFFSETS = [1, 3, 6, 8, 10];

export const LOW_OCTAVE = 4;
export const OCTAVE_COUNT = 2;

/** Lowest and highest key on the drawn keyboard. */
export const LOWEST = LOW_OCTAVE * 12;
export const HIGHEST = (LOW_OCTAVE + OCTAVE_COUNT) * 12;

const LETTERS = ["c", "d", "e", "f", "g", "a", "b"] as const;


export function isBlack(semitone: number): boolean {
  return BLACK_OFFSETS.includes(((semitone % 12) + 12) % 12);
}

/** "fa diez" / "F#". Black keys are always named as sharps here. */
export function keyName(
  semitone: number,
  naming: "solfege" | "letters",
  lang: Lang = "translit",
): string {
  const offset = ((semitone % 12) + 12) % 12;
  const base = isBlack(semitone) ? offset - 1 : offset;
  const index = WHITE_OFFSETS.indexOf(base);
  const name =
    naming === "solfege"
      ? SOLFEGE_SYLLABLES[lang][index]
      : LETTERS[index].toUpperCase();
  if (!isBlack(semitone)) return name;
  return naming === "solfege" ? `${name} ${SHARP_WORD[lang]}` : `${name}#`;
}

/** Every key on the drawn keyboard, low to high. */
export function allKeys(): number[] {
  const keys: number[] = [];
  for (let s = LOWEST; s <= HIGHEST; s++) keys.push(s);
  return keys;
}

/** The keys passed through while counting, named - the counting itself. */
export function countingRun(
  from: number,
  to: number,
  naming: "solfege" | "letters",
  lang: Lang = "translit",
): string {
  const direction = to >= from ? 1 : -1;
  const names: string[] = [];
  for (let s = from; s !== to + direction; s += direction) {
    names.push(keyName(s, naming, lang));
  }
  return names.join(" - ");
}
