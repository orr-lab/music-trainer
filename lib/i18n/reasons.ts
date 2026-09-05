/**
 * The sentences the app builds at runtime: what a note's position is, why an
 * interval is what it is, where a key sits on the circle.
 *
 * These are the most-read text in the app after the question itself - they are
 * what you see every time you get something wrong - so they are translated
 * properly rather than left in English behind a translated interface.
 */
import type { Lang } from "./lang";

export type Where = "above" | "below";

export interface Reasons {
  tones: (amount: string) => string;
  /** "1st line of the treble staff, counting up" */
  onLine: (ordinal: number, clef: string) => string;
  onSpace: (ordinal: number, clef: string) => string;
  justOutside: (where: Where, clef: string) => string;
  ledgers: (count: number, where: Where, clef: string) => string;

  readingInterval: (
    low: string,
    high: string,
    letters: number,
    tones: string,
    name: string,
  ) => string;
  buildInterval: (
    name: string,
    letters: number,
    tones: string,
    where: Where,
    start: string,
    target: string,
    run: string,
  ) => string;
  anyOctave: (name: string, position: string) => string;
  orAnyOctave: string;

  countUp: (name: string, tones: string, semitones: number, run: string) => string;
  measured: (semitones: number, tones: string, names: string, run: string) => string;

  keyHas: (key: string, count: string, signature: string) => string;
  signatureIs: (count: string, key: string, signature: string) => string;
  sharesSignature: (a: string, b: string, direction: Where) => string;
  fifthFrom: (where: Where, from: string, to: string) => string;
  fifthRound: (where: Where, from: string, to: string) => string;
  signatureOrder: (kind: string, order: string) => string;
  thatSignatureIs: (written: string, major: string, minor: string) => string;
  atTopOfCircle: (count: string, key: string) => string;
  stepsFromC: (count: string, key: string, steps: number) => string;
  keyboardSpelling: string;
  /** The whole scale spelled out, so the answer is seen in its context. */
  scaleDegree: (key: string, spelling: string, degree: string, note: string) => string;
  scaleMembership: (
    note: string,
    key: string,
    inScale: boolean,
    spelling: string,
  ) => string;
}

const ORDINALS: Record<Lang, string[]> = {
  translit: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
  en: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
  // שורה is feminine, רווח is masculine, so the two sentences need different
  // ordinals - "הרווח הראשונה" is wrong.
  he: ["הראשונה", "השנייה", "השלישית", "הרביעית", "החמישית", "השישית", "השביעית", "השמינית"],
};

const ORDINALS_HE_M = [
  "הראשון",
  "השני",
  "השלישי",
  "הרביעי",
  "החמישי",
  "השישי",
  "השביעי",
  "השמיני",
];

const english: Reasons = {
  tones: (a) => `${a} tones`,
  onLine: (o, clef) => `${ORDINALS.en[o]} line of the ${clef} staff, counting up.`,
  onSpace: (o, clef) => `${ORDINALS.en[o]} space of the ${clef} staff, counting up.`,
  justOutside: (w, clef) => `Just ${w} the ${clef} staff, in the space next to it.`,
  ledgers: (n, w, clef) =>
    `${n === 1 ? "1 ledger line" : `${n} ledger lines`} ${w} the ${clef} staff.`,

  readingInterval: (low, high, letters, tones, name) =>
    `${low} up to ${high} is ${letters} letters and ${tones} tones: a ${name}.`,
  buildInterval: (name, letters, tones, where, start, target, run) =>
    `A ${name} is ${letters} letters and ${tones} tones, so ${where} ${start} it lands on ${target}. Count the letters: ${run}.`,
  anyOctave: (name, position) =>
    `Any ${name} counts. The lowest one on this staff: ${position}`,
  orAnyOctave: ", or any other octave of it",

  countUp: (name, tones, semitones, run) =>
    `A ${name} is ${tones} tones, so ${semitones} semitones. Count them: ${run}.`,
  measured: (semitones, tones, names, run) =>
    `${semitones} semitones, which is ${tones} tones: ${names}. Count them: ${run}.`,

  keyHas: (key, count, signature) => `${key} has ${count}: ${signature}.`,
  signatureIs: (count, key, signature) => `${count} is ${key}: ${signature}.`,
  sharesSignature: (a, b, direction) =>
    `${a} shares a signature with ${b} - a minor third ${direction} the tonic.`,
  fifthFrom: (where, from, to) =>
    `A fifth ${where} from ${from} is ${to} - one accidental ${where === "above" ? "sharper" : "flatter"}.`,
  fifthRound: (where, from, to) =>
    `A fifth ${where} from ${from} is ${to} - one step ${where === "above" ? "clockwise" : "anticlockwise"} round the circle.`,
  signatureOrder: (kind, order) => `${kind} always go in this order: ${order}.`,
  thatSignatureIs: (written, major, minor) =>
    `${written}. That signature is ${major}, or ${minor}.`,
  atTopOfCircle: (count, key) => `${count} is ${key}, at the top of the circle.`,
  stepsFromC: (count, key, steps) =>
    `${count} is ${key}, ${steps} ${steps === 1 ? "step" : "steps"} clockwise from the top.`,
  keyboardSpelling:
    "On a keyboard the spelling is invisible - it is the letters that decide the name.",
  scaleDegree: (key, spelling, degree, note) =>
    `${key} is ${spelling}. Counting up from the tonic, the ${degree} is ${note}.`,
  scaleMembership: (note, key, inScale, spelling) =>
    `${key} is ${spelling}. ${note} is ${inScale ? "in it" : "not in it"}.`,
};

const hebrew: Reasons = {
  // "מעל" takes a space; "ל" is a prefix and does not. Writing them inline
  // produced "מעלדו" - correct words, no gap.
  tones: (a) => `${a} טונים`,
  onLine: (o, clef) => `השורה ${ORDINALS.he[o]} ב${clef}, מלמטה למעלה.`,
  onSpace: (o, clef) => `הרווח ${ORDINALS_HE_M[o]} ב${clef}, מלמטה למעלה.`,
  justOutside: (w, clef) =>
    `${w === "above" ? `מעל ${clef}` : `מתחת ל${clef}`}, ברווח הצמוד לחמשה.`,
  ledgers: (n, w, clef) =>
    `${n === 1 ? "שורת עזר אחת" : `${n} שורות עזר`} ${
      w === "above" ? `מעל ${clef}` : `מתחת ל${clef}`
    }.`,

  readingInterval: (low, high, letters, tones, name) =>
    `מ${low} עד ${high} יש ${letters} אותיות ו-${tones} טונים: ${name}.`,
  // Phrased with יש rather than a copula: the interval names are mostly
  // feminine but טריטון is not, and this way the sentence fits both.
  buildInterval: (name, letters, tones, where, start, target, run) =>
    `ב${name} יש ${letters} אותיות ו-${tones} טונים, ולכן ${
      where === "above" ? `מעל ${start}` : `מתחת ל${start}`
    } מגיעים ל${target}. ספרו את האותיות: ${run}.`,
  anyOctave: (name, position) =>
    `כל ${name} נחשב. הנמוך ביותר בחמשה הזאת: ${position}`,
  orAnyOctave: ", או כל אוקטבה אחרת שלו",

  countUp: (name, tones, semitones, run) =>
    `ב${name} יש ${tones} טונים, כלומר ${semitones} חצאי טונים. ספרו אותם: ${run}.`,
  measured: (semitones, tones, names, run) =>
    `${semitones} חצאי טונים, שהם ${tones} טונים: ${names}. ספרו אותם: ${run}.`,

  keyHas: (key, count, signature) => `ל${key} יש ${count}: ${signature}.`,
  signatureIs: (count, key, signature) =>
    `הסולם עם ${count} הוא ${key}: ${signature}.`,
  sharesSignature: (a, b, direction) =>
    `ל${a} ול${b} אותם סימני מפתח - טרצה קטנה ${
      direction === "above" ? "מעל הטוניקה" : "מתחת לטוניקה"
    }.`,
  fifthFrom: (where, from, to) =>
    `קווינטה ${where === "above" ? `מעל ${from}` : `מתחת ל${from}`} היא ${to} - סימן אחד ${
      where === "above" ? "יותר" : "פחות"
    }.`,
  fifthRound: (where, from, to) =>
    `קווינטה ${where === "above" ? `מעל ${from}` : `מתחת ל${from}`} היא ${to} - צעד אחד ${
      where === "above" ? "עם כיוון השעון" : "נגד כיוון השעון"
    } במעגל.`,
  signatureOrder: (kind, order) => `${kind} תמיד מופיעים בסדר הזה: ${order}.`,
  thatSignatureIs: (written, major, minor) =>
    `${written}. הסימנים האלה הם ${major}, או ${minor}.`,
  atTopOfCircle: (count, key) => `הסולם עם ${count} הוא ${key}, בראש המעגל.`,
  stepsFromC: (count, key, steps) =>
    `הסולם עם ${count} הוא ${key}, ${steps} צעדים עם כיוון השעון מלמעלה.`,
  keyboardSpelling:
    "על הקלידים לא רואים את הכתיב - האותיות הן שקובעות את שם המרווח.",
  scaleDegree: (key, spelling, degree, note) =>
    `${key} הוא ${spelling}. סופרים מהטוניקה למעלה, וה${degree} היא ${note}.`,
  scaleMembership: (note, key, inScale, spelling) =>
    `${key} הוא ${spelling}. ${note} ${inScale ? "נמצא בו" : "לא נמצא בו"}.`,
};

const translit: Reasons = {
  ...english,
  sharesSignature: (a, b, direction) =>
    `${a} shares a signature with ${b} - a terza ktana ${direction} the tonic.`,
};

export const REASONS: Record<Lang, Reasons> = { translit, he: hebrew, en: english };

export function reasons(lang: Lang): Reasons {
  return REASONS[lang];
}
