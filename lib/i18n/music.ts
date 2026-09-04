/**
 * Every musical term, in all three languages.
 *
 * Kept together on purpose: this is the file to correct if a term is not what
 * your class calls it, and nothing else needs touching when it changes.
 */
import type { Lang } from "./lang";

export type Phrase = Record<Lang, string>;

export function say(phrase: Phrase, lang: Lang): string {
  return phrase[lang];
}

/** Interval names, keyed by the ids in lib/data/intervals.ts. */
export const INTERVAL_NAMES: Record<string, Phrase> = {
  prima: { translit: "prima", he: "פרימה", en: "unison" },
  "sekunda-ktana": {
    translit: "sekunda ktana",
    he: "סקונדה קטנה",
    en: "minor 2nd",
  },
  "sekunda-gdola": {
    translit: "sekunda gdola",
    he: "סקונדה גדולה",
    en: "major 2nd",
  },
  "terza-ktana": { translit: "terza ktana", he: "טרצה קטנה", en: "minor 3rd" },
  "terza-gdola": { translit: "terza gdola", he: "טרצה גדולה", en: "major 3rd" },
  "kvarta-zaka": { translit: "kvarta zaka", he: "קוורטה זכה", en: "perfect 4th" },
  triton: { translit: "triton", he: "טריטון", en: "tritone" },
  "kvinta-zaka": { translit: "kvinta zaka", he: "קווינטה זכה", en: "perfect 5th" },
  "sexta-ktana": { translit: "sexta ktana", he: "סקסטה קטנה", en: "minor 6th" },
  "sexta-gdola": { translit: "sexta gdola", he: "סקסטה גדולה", en: "major 6th" },
  "septima-ktana": {
    translit: "septima ktana",
    he: "ספטימה קטנה",
    en: "minor 7th",
  },
  "septima-gdola": {
    translit: "septima gdola",
    he: "ספטימה גדולה",
    en: "major 7th",
  },
  oktava: { translit: "oktava", he: "אוקטבה", en: "octave" },
  "prima-mugdelet": {
    translit: "prima mugdelet",
    he: "פרימה מוגדלת",
    en: "augmented unison",
  },
  "sekunda-mugdelet": {
    translit: "sekunda mugdelet",
    he: "סקונדה מוגדלת",
    en: "augmented 2nd",
  },
  "kvarta-mugdelet": {
    translit: "kvarta mugdelet",
    he: "קוורטה מוגדלת",
    en: "augmented 4th",
  },
  "kvinta-muktenet": {
    translit: "kvinta muktenet",
    he: "קווינטה מוקטנת",
    en: "diminished 5th",
  },
  "kvinta-mugdelet": {
    translit: "kvinta mugdelet",
    he: "קווינטה מוגדלת",
    en: "augmented 5th",
  },
  "septima-muktenet": {
    translit: "septima muktenet",
    he: "ספטימה מוקטנת",
    en: "diminished 7th",
  },
  "sexta-mugdelet": {
    translit: "sexta mugdelet",
    he: "סקסטה מוגדלת",
    en: "augmented 6th",
  },
};

export const CLASS_NAMES: Record<string, Phrase> = {
  "konsonans-mushlam": {
    translit: "konsonans mushlam",
    he: "קונסוננס מושלם",
    en: "perfect consonance",
  },
  "konsonans-lo-mushlam": {
    translit: "konsonans lo-mushlam",
    he: "קונסוננס לא מושלם",
    en: "imperfect consonance",
  },
  disonans: { translit: "disonans", he: "דיסוננס", en: "dissonance" },
};

/** Interval families, used as topic tags in the stats. */
export const FAMILY_NAMES: Record<string, Phrase> = {
  "prima & oktava": {
    translit: "prima & oktava",
    he: "פרימה ואוקטבה",
    en: "unisons & octaves",
  },
  sekundot: { translit: "sekundot", he: "סקונדות", en: "2nds" },
  terzot: { translit: "terzot", he: "טרצות", en: "3rds" },
  "kvarta & triton": {
    translit: "kvarta & triton",
    he: "קוורטה וטריטון",
    en: "4ths & the tritone",
  },
  kvinta: { translit: "kvinta", he: "קווינטה", en: "5ths" },
  sextot: { translit: "sextot", he: "סקסטות", en: "6ths" },
  septimot: { translit: "septimot", he: "ספטימות", en: "7ths" },
};

/** The solfege syllables. Letter names are A-G in every language. */
export const SOLFEGE_SYLLABLES: Record<Lang, string[]> = {
  translit: ["do", "re", "mi", "fa", "sol", "la", "si"],
  he: ["דו", "רה", "מי", "פה", "סול", "לה", "סי"],
  en: ["do", "re", "mi", "fa", "sol", "la", "ti"],
};

export const SHARP_WORD: Phrase = { translit: "diez", he: "דיאז", en: "sharp" };
export const FLAT_WORD: Phrase = { translit: "bemol", he: "במול", en: "flat" };
export const SHARPS_WORD: Phrase = {
  translit: "diezim",
  he: "דיאזים",
  en: "sharps",
};
export const FLATS_WORD: Phrase = {
  translit: "bemolim",
  he: "במולים",
  en: "flats",
};
export const NO_ACCIDENTALS: Phrase = {
  translit: "ein simanim",
  he: "אין סימנים",
  en: "no accidentals",
};
export const MAJOR_WORD: Phrase = { translit: "mazhor", he: "מז'ור", en: "major" };
export const MINOR_WORD: Phrase = { translit: "minor", he: "מינור", en: "minor" };

export const CLEF_NAMES: Record<string, Phrase> = {
  treble: { translit: "mafteach sol", he: "מפתח סול", en: "treble" },
  bass: { translit: "mafteach fa", he: "מפתח פה", en: "bass" },
};

/** Mode names and one-line descriptions, keyed by mode id. */
export const MODE_NAMES: Record<string, { name: Phrase; blurb: Phrase }> = {
  all: {
    name: { translit: "Ta'arovet", he: "תערובת", en: "Mixed practice" },
    blurb: {
      translit: "Everything at once - the one to open daily.",
      he: "הכול ביחד - זה שכדאי לפתוח כל יום.",
      en: "Everything at once - the one to open daily.",
    },
  },
  intervals: {
    name: { translit: "Mirvachim", he: "מרווחים", en: "Intervals" },
    blurb: {
      translit: "Size in tones, class, and reading them on the staff.",
      he: "גודל בטונים, סוג, וזיהוי על החמשה.",
      en: "Size in tones, class, and reading them on the staff.",
    },
  },
  semitones: {
    name: { translit: "Sfirat tonim", he: "ספירת טונים", en: "Counting tones" },
    blurb: {
      translit: "Count the distance out on a keyboard, key by key.",
      he: "לספור את המרחק על הקלידים, קליד אחרי קליד.",
      en: "Count the distance out on a keyboard, key by key.",
    },
  },
  notes: {
    name: { translit: "Kriat tavim", he: "קריאת תווים", en: "Reading notes" },
    blurb: {
      translit: "Name the note on the staff, treble and bass.",
      he: "לזהות את התו על החמשה, במפתח סול ובמפתח פה.",
      en: "Name the note on the staff, treble and bass.",
    },
  },
  "place-note": {
    name: { translit: "Ktivat tavim", he: "כתיבת תווים", en: "Writing notes" },
    blurb: {
      translit: "Given a name, put the note on the staff.",
      he: "לפי השם, לכתוב את התו על החמשה.",
      en: "Given a name, put the note on the staff.",
    },
  },
  build: {
    name: {
      translit: "Bniyat mirvachim",
      he: "בניית מרווחים",
      en: "Building intervals",
    },
    blurb: {
      translit: "Given a note and an interval, place the other note.",
      he: "לפי תו ומרווח, למקם את התו השני.",
      en: "Given a note and an interval, place the other note.",
    },
  },
  keys: {
    name: {
      translit: "Ma'agal ha-kvintot",
      he: "מעגל הקווינטות",
      en: "Circle of fifths",
    },
    blurb: {
      translit: "Key signatures, relative minors, and moving by fifths.",
      he: "סימני מפתח, מינור מקביל, ותנועה בקווינטות.",
      en: "Key signatures, relative minors, and moving by fifths.",
    },
  },
  signatures: {
    name: {
      translit: "Simanei mafteach",
      he: "סימני מפתח",
      en: "Reading key signatures",
    },
    blurb: {
      translit: "See the signature on the staff and name the key.",
      he: "לראות את הסימנים על החמשה ולזהות את הסולם.",
      en: "See the signature on the staff and name the key.",
    },
  },
  "write-signature": {
    name: {
      translit: "Ktivat simanei mafteach",
      he: "כתיבת סימני מפתח",
      en: "Writing key signatures",
    },
    blurb: {
      translit: "Place every accidental, in order, on the right line.",
      he: "למקם כל סימן, לפי הסדר, על השורה הנכונה.",
      en: "Place every accidental, in order, on the right line.",
    },
  },
  "circle-nav": {
    name: {
      translit: "Nivut ba-ma'agal",
      he: "ניווט במעגל",
      en: "Finding keys on the circle",
    },
    blurb: {
      translit: "Point at the key on the circle itself.",
      he: "להצביע על הסולם במעגל עצמו.",
      en: "Point at the key on the circle itself.",
    },
  },
};

export function modeName(id: string, lang: Lang): string {
  return MODE_NAMES[id]?.name[lang] ?? id;
}

export function modeBlurb(id: string, lang: Lang): string {
  return MODE_NAMES[id]?.blurb[lang] ?? "";
}
