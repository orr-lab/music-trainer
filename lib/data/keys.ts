/**
 * Ma'agal ha-kvintot (circle of fifths) - content for Mode 3 and the reference
 * diagram. All fifteen major keys, in line-of-fifths order.
 */

import type { Lang } from "@/lib/i18n/lang";
import {
  FLATS_WORD,
  FLAT_WORD,
  MAJOR_WORD,
  MINOR_WORD,
  NO_ACCIDENTALS,
  SHARPS_WORD,
  SHARP_WORD,
  SOLFEGE_SYLLABLES,
} from "@/lib/i18n/music";

export type Naming = "solfege" | "letters";

export interface Tonic {
  letter: "c" | "d" | "e" | "f" | "g" | "a" | "b";
  /** "" natural, "#" diez, "b" bemol. */
  accidental: "" | "#" | "b";
}

const LETTER_ORDER: Tonic["letter"][] = ["c", "d", "e", "f", "g", "a", "b"];

function syllable(letter: Tonic["letter"], lang: Lang): string {
  return SOLFEGE_SYLLABLES[lang][LETTER_ORDER.indexOf(letter)];
}

export function tonicName(
  t: Tonic,
  naming: Naming,
  lang: Lang = "translit",
): string {
  if (naming === "letters") {
    return t.letter.toUpperCase() + t.accidental;
  }
  const suffix =
    t.accidental === "#"
      ? ` ${SHARP_WORD[lang]}`
      : t.accidental === "b"
        ? ` ${FLAT_WORD[lang]}`
        : "";
  return syllable(t.letter, lang) + suffix;
}

/** Compact form for the diagram: "sol♭" / "G♭", no mazhor/minor word. */
export function tonicSymbol(
  t: Tonic,
  naming: Naming,
  lang: Lang = "translit",
): string {
  const base =
    naming === "letters" ? t.letter.toUpperCase() : syllable(t.letter, lang);
  return base + (t.accidental === "#" ? "♯" : t.accidental === "b" ? "♭" : "");
}

export function keyName(
  t: Tonic,
  mode: "major" | "minor",
  naming: Naming,
  lang: Lang = "translit",
): string {
  const word = mode === "major" ? MAJOR_WORD[lang] : MINOR_WORD[lang];
  return `${tonicName(t, naming, lang)} ${word}`;
}

/** The accidentals of a signature always appear in this order. */
export const SHARP_ORDER: Tonic[] = [
  { letter: "f", accidental: "#" },
  { letter: "c", accidental: "#" },
  { letter: "g", accidental: "#" },
  { letter: "d", accidental: "#" },
  { letter: "a", accidental: "#" },
  { letter: "e", accidental: "#" },
  { letter: "b", accidental: "#" },
];

export const FLAT_ORDER: Tonic[] = [
  { letter: "b", accidental: "b" },
  { letter: "e", accidental: "b" },
  { letter: "a", accidental: "b" },
  { letter: "d", accidental: "b" },
  { letter: "g", accidental: "b" },
  { letter: "c", accidental: "b" },
  { letter: "f", accidental: "b" },
];

export type SignatureKind = "diezim" | "bemolim" | "none";

export interface KeyRow {
  id: string;
  tonic: Tonic;
  /** How many accidentals in the signature, 0-7. */
  count: number;
  kind: SignatureKind;
  relativeMinor: Tonic;
}

const t = (letter: Tonic["letter"], accidental: Tonic["accidental"] = ""): Tonic => ({
  letter,
  accidental,
});

/**
 * Ordered by fifths, flattest first. Index +1 is a fifth up, -1 a fifth down,
 * which is where the "move a fifth" questions come from.
 */
export const KEYS: KeyRow[] = [
  { id: "cb", tonic: t("c", "b"), count: 7, kind: "bemolim", relativeMinor: t("a", "b") },
  { id: "gb", tonic: t("g", "b"), count: 6, kind: "bemolim", relativeMinor: t("e", "b") },
  { id: "db", tonic: t("d", "b"), count: 5, kind: "bemolim", relativeMinor: t("b", "b") },
  { id: "ab", tonic: t("a", "b"), count: 4, kind: "bemolim", relativeMinor: t("f") },
  { id: "eb", tonic: t("e", "b"), count: 3, kind: "bemolim", relativeMinor: t("c") },
  { id: "bb", tonic: t("b", "b"), count: 2, kind: "bemolim", relativeMinor: t("g") },
  { id: "f", tonic: t("f"), count: 1, kind: "bemolim", relativeMinor: t("d") },
  { id: "c", tonic: t("c"), count: 0, kind: "none", relativeMinor: t("a") },
  { id: "g", tonic: t("g"), count: 1, kind: "diezim", relativeMinor: t("e") },
  { id: "d", tonic: t("d"), count: 2, kind: "diezim", relativeMinor: t("b") },
  { id: "a", tonic: t("a"), count: 3, kind: "diezim", relativeMinor: t("f", "#") },
  { id: "e", tonic: t("e"), count: 4, kind: "diezim", relativeMinor: t("c", "#") },
  { id: "b", tonic: t("b"), count: 5, kind: "diezim", relativeMinor: t("g", "#") },
  { id: "fs", tonic: t("f", "#"), count: 6, kind: "diezim", relativeMinor: t("d", "#") },
  { id: "cs", tonic: t("c", "#"), count: 7, kind: "diezim", relativeMinor: t("a", "#") },
];

/** The accidentals of a key's signature, in order of appearance. */
export function signature(key: KeyRow): Tonic[] {
  if (key.kind === "none") return [];
  const order = key.kind === "diezim" ? SHARP_ORDER : FLAT_ORDER;
  return order.slice(0, key.count);
}

export function signatureText(
  key: KeyRow,
  naming: Naming,
  lang: Lang = "translit",
): string {
  const parts = signature(key);
  if (parts.length === 0) return NO_ACCIDENTALS[lang];
  return parts.map((p) => tonicName(p, naming, lang)).join(", ");
}

export function countText(key: KeyRow, lang: Lang = "translit"): string {
  if (key.kind === "none") return NO_ACCIDENTALS[lang];
  const one = key.count === 1;
  const word = key.kind === "diezim"
    ? (one ? SHARP_WORD : SHARPS_WORD)[lang]
    : (one ? FLAT_WORD : FLATS_WORD)[lang];
  return `${key.count} ${word}`;
}

/** What VexFlow calls this key, for `stave.addKeySignature`. */
export function vexKeySpec(key: KeyRow): string {
  return key.tonic.letter.toUpperCase() + key.tonic.accidental;
}

/**
 * Where the accidentals of a signature are written, as diatonic steps
 * (octave * 7 + letter index). These positions are convention, not free
 * choice: the sharps and flats of a key signature always sit on exactly these
 * lines and spaces, in this order.
 *
 * Treble is given; bass is the same shapes two octaves lower.
 */
const TREBLE_SHARP_STEPS = [
  38, // F#5, top line
  35, // C#5, third space
  39, // G#5, the space above the staff
  36, // D#5, fourth line
  33, // A#4, second space
  37, // E#5, fourth space
  34, // B#4, third line
];

const TREBLE_FLAT_STEPS = [
  34, // Bb4, third line
  37, // Eb5, fourth space
  33, // Ab4, second space
  36, // Db5, fourth line
  32, // Gb4, second line
  35, // Cb5, third space
  31, // Fb4, first space
];

const BASS_OFFSET = -14;

export function signatureSteps(key: KeyRow, clef: "treble" | "bass"): number[] {
  if (key.kind === "none") return [];
  const steps =
    key.kind === "diezim" ? TREBLE_SHARP_STEPS : TREBLE_FLAT_STEPS;
  const offset = clef === "bass" ? BASS_OFFSET : 0;
  return steps.slice(0, key.count).map((s) => s + offset);
}

/** Every position an accidental of this kind could occupy, in order. */
export function signatureSlots(
  kind: SignatureKind,
  clef: "treble" | "bass",
): number[] {
  if (kind === "none") return [];
  const steps = kind === "diezim" ? TREBLE_SHARP_STEPS : TREBLE_FLAT_STEPS;
  const offset = clef === "bass" ? BASS_OFFSET : 0;
  return steps.map((s) => s + offset);
}

/**
 * The seven notes of a major scale, ascending from its tonic.
 *
 * Derived from the key signature rather than stored: a scale IS its signature
 * applied to the seven letters, and deriving it here means the two can never
 * disagree - which is also the thing worth learning about them.
 */
export function scaleNotes(key: KeyRow): Tonic[] {
  const marks = signature(key);
  const start = LETTER_ORDER.indexOf(key.tonic.letter);
  return Array.from({ length: 7 }, (_, i) => {
    const letter = LETTER_ORDER[(start + i) % 7];
    const altered = marks.find((m) => m.letter === letter);
    return { letter, accidental: altered ? altered.accidental : "" };
  });
}

/** The scale written out: "re mi fa diez sol la si do diez". */
export function scaleText(key: KeyRow, naming: Naming, lang: Lang): string {
  return scaleNotes(key)
    .map((n) => tonicName(n, naming, lang))
    .join(" ");
}

export function keyById(id: string): KeyRow | undefined {
  return KEYS.find((k) => k.id === id);
}

/**
 * The twelve clock positions, C at the top and sharps clockwise. Two positions
 * carry an enharmonic pair; the reference diagram shows both.
 */
export const CIRCLE_POSITIONS: { ids: string[] }[] = [
  { ids: ["c"] },
  { ids: ["g"] },
  { ids: ["d"] },
  { ids: ["a"] },
  { ids: ["e"] },
  { ids: ["b", "cb"] },
  { ids: ["fs", "gb"] },
  { ids: ["cs", "db"] },
  { ids: ["ab"] },
  { ids: ["eb"] },
  { ids: ["bb"] },
  { ids: ["f"] },
];
