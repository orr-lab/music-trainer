/**
 * Mirvachim (intervals) - the entire drill content for Mode 1.
 *
 * Adding an interval means adding a row here. No component knows these names.
 */

export type IntervalClassId =
  | "konsonans-zaka"
  | "konsonans-lo-zaka"
  | "disonans";

export interface IntervalClassOption {
  id: IntervalClassId;
  /** Transliterated label shown to the user. */
  label: string;
  /** English gloss, for the feedback line only. */
  gloss: string;
}

export const INTERVAL_CLASSES: IntervalClassOption[] = [
  { id: "konsonans-zaka", label: "konsonans zaka", gloss: "perfect consonance" },
  {
    id: "konsonans-lo-zaka",
    label: "konsonans lo-zaka",
    gloss: "imperfect consonance",
  },
  { id: "disonans", label: "disonans", gloss: "dissonance" },
];

export interface IntervalRow {
  id: string;
  /** Hebrew name in Latin transliteration. Never Hebrew script. */
  name: string;
  /** Size in tones. Halves are real values: 2.5 renders as "2½". */
  tones: number;
  /**
   * Every classification that counts as correct. More than one entry means the
   * interval genuinely has more than one right answer - see kvarta zaka.
   */
  classes: IntervalClassId[];
  /** Topic tag for the weakest-topics panel. */
  family: string;
  /** Difficulty weight: scales XP and how often the question comes up. */
  weight: number;
  /** One-line reason shown after a wrong answer. */
  note: string;
}

export const INTERVALS: IntervalRow[] = [
  {
    id: "prima",
    name: "prima",
    tones: 0,
    classes: ["konsonans-zaka"],
    family: "prima & oktava",
    weight: 0.8,
    note: "Prima is a unison - no distance at all, and a konsonans zaka.",
  },
  {
    id: "sekunda-ktana",
    name: "sekunda ktana",
    tones: 0.5,
    classes: ["disonans"],
    family: "sekundot",
    weight: 1,
    note: "Half a tone - the sharpest disonans there is.",
  },
  {
    id: "sekunda-gdola",
    name: "sekunda gdola",
    tones: 1,
    classes: ["disonans"],
    family: "sekundot",
    weight: 1,
    note: "A whole tone. Both sekundot are disonansim.",
  },
  {
    id: "terza-ktana",
    name: "terza ktana",
    tones: 1.5,
    classes: ["konsonans-lo-zaka"],
    family: "terzot",
    weight: 1,
    note: "Terzot and sextot are the konsonansim lo-zakim.",
  },
  {
    id: "terza-gdola",
    name: "terza gdola",
    tones: 2,
    classes: ["konsonans-lo-zaka"],
    family: "terzot",
    weight: 1,
    note: "Terzot and sextot are the konsonansim lo-zakim.",
  },
  {
    id: "kvarta-zaka",
    name: "kvarta zaka",
    tones: 2.5,
    classes: ["konsonans-zaka", "disonans"],
    family: "kvarta & triton",
    weight: 1.4,
    note: "Kvarta zaka is a konsonans zaka on its own, but counts as a disonans when it sits against the bass (the 6-4 chord). Both answers are accepted.",
  },
  {
    id: "triton",
    name: "triton",
    tones: 3,
    classes: ["disonans"],
    family: "kvarta & triton",
    weight: 1.3,
    note: "Three whole tones - kvarta mugdelet / kvinta mukhtenet. Always a disonans.",
  },
  {
    id: "kvinta-zaka",
    name: "kvinta zaka",
    tones: 3.5,
    classes: ["konsonans-zaka"],
    family: "kvinta",
    weight: 1,
    note: "Kvinta zaka joins prima and oktava as a konsonans zaka.",
  },
  {
    id: "sexta-ktana",
    name: "sexta ktana",
    tones: 4,
    classes: ["konsonans-lo-zaka"],
    family: "sextot",
    weight: 1.2,
    note: "Sextot are konsonansim lo-zakim, like the terzot they invert into.",
  },
  {
    id: "sexta-gdola",
    name: "sexta gdola",
    tones: 4.5,
    classes: ["konsonans-lo-zaka"],
    family: "sextot",
    weight: 1.2,
    note: "Sextot are konsonansim lo-zakim, like the terzot they invert into.",
  },
  {
    id: "septima-ktana",
    name: "septima ktana",
    tones: 5,
    classes: ["disonans"],
    family: "septimot",
    weight: 1.2,
    note: "Septimot are disonansim - a whole tone short of the oktava.",
  },
  {
    id: "septima-gdola",
    name: "septima gdola",
    tones: 5.5,
    classes: ["disonans"],
    family: "septimot",
    weight: 1.2,
    note: "Half a tone under the oktava - the sharpest septima, and a disonans.",
  },
  {
    id: "oktava",
    name: "oktava",
    tones: 6,
    classes: ["konsonans-zaka"],
    family: "prima & oktava",
    weight: 0.8,
    note: "Same pitch class an octave up - a konsonans zaka.",
  },
];

/** 0 -> "0", 0.5 -> "½", 2.5 -> "2½". */
export function toneLabel(tones: number): string {
  const whole = Math.floor(tones);
  const half = tones - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? "½" : `${whole}½`;
}

export function classLabel(id: IntervalClassId): string {
  return INTERVAL_CLASSES.find((c) => c.id === id)?.label ?? id;
}
