/**
 * Mirvachim (intervals) - the entire drill content for Mode 1.
 *
 * Adding an interval means adding a row here. No component knows these names.
 */

export type IntervalClassId =
  | "konsonans-mushlam"
  | "konsonans-lo-mushlam"
  | "disonans";

export interface IntervalClassOption {
  id: IntervalClassId;
  /** Transliterated label shown to the user. */
  label: string;
  /** English gloss, for the feedback line only. */
  gloss: string;
}

export const INTERVAL_CLASSES: IntervalClassOption[] = [
  { id: "konsonans-mushlam", label: "konsonans mushlam", gloss: "perfect consonance" },
  {
    id: "konsonans-lo-mushlam",
    label: "konsonans lo-mushlam",
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
  /**
   * How many letter names the interval spans: 0 for a prima, 1 a sekunda, 2 a
   * terza, and so on. This is the half of an interval's identity that the tone
   * count does not carry - fa to si and si to fa are both three tones, but one
   * is a kvarta and the other a kvinta. `null` for the triton, which is a
   * description of a size rather than a spelling.
   */
  letterSpan: number | null;
  /** Topic tag for the weakest-topics panel. */
  family: string;
  /**
   * True for the mugdal and muktan intervals, which the interval-set setting
   * can leave out.
   */
  extended?: boolean;
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
    letterSpan: 0,
    classes: ["konsonans-mushlam"],
    family: "prima & oktava",
    weight: 0.8,
    note: "Prima is a unison - no distance at all, and a konsonans mushlam.",
  },
  {
    id: "sekunda-ktana",
    name: "sekunda ktana",
    tones: 0.5,
    letterSpan: 1,
    classes: ["disonans"],
    family: "sekundot",
    weight: 1,
    note: "Half a tone - the sharpest disonans there is.",
  },
  {
    id: "sekunda-gdola",
    name: "sekunda gdola",
    tones: 1,
    letterSpan: 1,
    classes: ["disonans"],
    family: "sekundot",
    weight: 1,
    note: "A whole tone. Both sekundot are disonansim.",
  },
  {
    id: "terza-ktana",
    name: "terza ktana",
    tones: 1.5,
    letterSpan: 2,
    classes: ["konsonans-lo-mushlam"],
    family: "terzot",
    weight: 1,
    note: "Terzot and sextot are the konsonansim lo-mushlamim.",
  },
  {
    id: "terza-gdola",
    name: "terza gdola",
    tones: 2,
    letterSpan: 2,
    classes: ["konsonans-lo-mushlam"],
    family: "terzot",
    weight: 1,
    note: "Terzot and sextot are the konsonansim lo-mushlamim.",
  },
  {
    id: "kvarta-zaka",
    name: "kvarta zaka",
    tones: 2.5,
    letterSpan: 3,
    classes: ["konsonans-mushlam", "disonans"],
    family: "kvarta & triton",
    weight: 1.4,
    note: "Kvarta zaka is a konsonans mushlam on its own, but counts as a disonans when it sits against the bass (the 6-4 chord). Both answers are accepted.",
  },
  {
    id: "triton",
    name: "triton",
    tones: 3,
    letterSpan: null,
    classes: ["disonans"],
    family: "kvarta & triton",
    weight: 1.3,
    note: "Three whole tones - kvarta mugdelet / kvinta mukhtenet. Always a disonans.",
  },
  {
    id: "kvinta-zaka",
    name: "kvinta zaka",
    tones: 3.5,
    letterSpan: 4,
    classes: ["konsonans-mushlam"],
    family: "kvinta",
    weight: 1,
    note: "Kvinta zaka joins prima and oktava as a konsonans mushlam.",
  },
  {
    id: "sexta-ktana",
    name: "sexta ktana",
    tones: 4,
    letterSpan: 5,
    classes: ["konsonans-lo-mushlam"],
    family: "sextot",
    weight: 1.2,
    note: "Sextot are konsonansim lo-mushlamim, like the terzot they invert into.",
  },
  {
    id: "sexta-gdola",
    name: "sexta gdola",
    tones: 4.5,
    letterSpan: 5,
    classes: ["konsonans-lo-mushlam"],
    family: "sextot",
    weight: 1.2,
    note: "Sextot are konsonansim lo-mushlamim, like the terzot they invert into.",
  },
  {
    id: "septima-ktana",
    name: "septima ktana",
    tones: 5,
    letterSpan: 6,
    classes: ["disonans"],
    family: "septimot",
    weight: 1.2,
    note: "Septimot are disonansim - a whole tone short of the oktava.",
  },
  {
    id: "septima-gdola",
    name: "septima gdola",
    tones: 5.5,
    letterSpan: 6,
    classes: ["disonans"],
    family: "septimot",
    weight: 1.2,
    note: "Half a tone under the oktava - the sharpest septima, and a disonans.",
  },
  {
    id: "oktava",
    name: "oktava",
    tones: 6,
    letterSpan: 7,
    classes: ["konsonans-mushlam"],
    family: "prima & oktava",
    weight: 0.8,
    note: "Same pitch class an octave up - a konsonans mushlam.",
  },
  // Mugdal and muktan intervals. All of them are disonansim, and each one
  // sounds identical to some other interval - which is the point: the name
  // comes from the letters, not from the sound.
  {
    id: "prima-mugdelet",
    name: "prima mugdelet",
    tones: 0.5,
    letterSpan: 0,
    classes: ["disonans"],
    family: "prima & oktava",
    extended: true,
    weight: 1.4,
    note: "Same letter, a semitone wider: do to do diez. Do to re bemol is the same sound but two letters, so that one is a sekunda ktana.",
  },
  {
    id: "sekunda-mugdelet",
    name: "sekunda mugdelet",
    tones: 1.5,
    letterSpan: 1,
    classes: ["disonans"],
    family: "sekundot",
    extended: true,
    weight: 1.4,
    note: "Neighbouring letters a tone and a half apart - the wide step in the harmonic minor. Sounds like a terza ktana.",
  },
  {
    id: "kvarta-mugdelet",
    name: "kvarta mugdelet",
    tones: 3,
    letterSpan: 3,
    classes: ["disonans"],
    family: "kvarta & triton",
    extended: true,
    weight: 1.3,
    note: "Four letters and three whole tones: fa to si. Same sound as a kvinta muktenet, spelled differently.",
  },
  {
    id: "kvinta-muktenet",
    name: "kvinta muktenet",
    tones: 3,
    letterSpan: 4,
    classes: ["disonans"],
    family: "kvinta",
    extended: true,
    weight: 1.3,
    note: "Five letters and three whole tones: si to fa. Same sound as a kvarta mugdelet, spelled differently.",
  },
  {
    id: "kvinta-mugdelet",
    name: "kvinta mugdelet",
    tones: 4,
    letterSpan: 4,
    classes: ["disonans"],
    family: "kvinta",
    extended: true,
    weight: 1.4,
    note: "A kvinta zaka widened by a semitone - the fifth of an augmented triad. Sounds like a sexta ktana.",
  },
  {
    id: "septima-muktenet",
    name: "septima muktenet",
    tones: 4.5,
    letterSpan: 6,
    classes: ["disonans"],
    family: "septimot",
    extended: true,
    weight: 1.4,
    note: "A septima ktana narrowed by a semitone - the seventh of a diminished seventh chord. Sounds like a sexta gdola.",
  },
  {
    id: "sexta-mugdelet",
    name: "sexta mugdelet",
    tones: 5,
    letterSpan: 5,
    classes: ["disonans"],
    family: "sextot",
    extended: true,
    weight: 1.4,
    note: "A sexta gdola widened by a semitone, as in an augmented sixth chord. Sounds like a septima ktana.",
  },
];

/** 0 -> "0", 0.5 -> "½", 2.5 -> "2½". */
export function toneLabel(tones: number): string {
  const whole = Math.floor(tones);
  const half = tones - whole >= 0.5;
  if (!half) return String(whole);
  return whole === 0 ? "½" : `${whole}½`;
}

/** The rows a session should draw on, given the interval-set setting. */
export function intervalsFor(set: "basic" | "full"): IntervalRow[] {
  return set === "full" ? INTERVALS : INTERVALS.filter((i) => !i.extended);
}

/** Distinct sizes, ascending - the tone scale shown as answer buttons. */
export function toneValues(rows: IntervalRow[]): number[] {
  return [...new Set(rows.map((i) => i.tones))].sort((a, b) => a - b);
}

export function classLabel(id: IntervalClassId): string {
  return INTERVAL_CLASSES.find((c) => c.id === id)?.label ?? id;
}
