/**
 * Staff reading content for Mode 2.
 *
 * Naturals only - this drill is about reading a position on the staff, not
 * about accidentals, which belong to the key-signature work in Mode 3.
 */

export type Clef = "treble" | "bass";
export type Letter = "c" | "d" | "e" | "f" | "g" | "a" | "b";
export type StaffDifficulty = "easy" | "medium" | "hard";

/** Answer buttons always appear in scale order - do re mi fa sol la si. */
export const SCALE_ORDER: Letter[] = ["c", "d", "e", "f", "g", "a", "b"];

export const SOLFEGE: Record<Letter, string> = {
  c: "do",
  d: "re",
  e: "mi",
  f: "fa",
  g: "sol",
  a: "la",
  b: "si",
};

/** Spellings accepted in the typed answer beyond the two canonical ones. */
const ALTERNATES: Partial<Record<Letter, string[]>> = {
  g: ["so"],
  b: ["ti"],
};

export interface Pitch {
  letter: Letter;
  octave: number;
}

/** Diatonic step index - C0 is 0, D0 is 1. Ledger lines count in these. */
export function step(p: Pitch): number {
  return p.octave * 7 + SCALE_ORDER.indexOf(p.letter);
}

export function vexKey(p: Pitch): string {
  return `${p.letter}/${p.octave}`;
}

export function noteName(p: Pitch, naming: "solfege" | "letters"): string {
  return naming === "solfege" ? SOLFEGE[p.letter] : p.letter.toUpperCase();
}

/** Both naming systems are always accepted, whichever one is on display. */
export function acceptedNames(p: Pitch): string[] {
  return [p.letter, SOLFEGE[p.letter], ...(ALTERNATES[p.letter] ?? [])];
}

/** The five lines, as diatonic steps: bottom line and top line. */
export const STAFF_LINES: Record<Clef, { bottom: number; top: number }> = {
  // E4 up to F5
  treble: { bottom: step({ letter: "e", octave: 4 }), top: step({ letter: "f", octave: 5 }) },
  // G2 up to A3
  bass: { bottom: step({ letter: "g", octave: 2 }), top: step({ letter: "a", octave: 3 }) },
};

/**
 * How far outside the staff each difficulty reaches, as inclusive pitch bounds.
 * Easy stays between the lines; hard runs several ledger lines either way.
 */
export const DIFFICULTY_RANGE: Record<
  StaffDifficulty,
  Record<Clef, [Pitch, Pitch]>
> = {
  easy: {
    treble: [{ letter: "e", octave: 4 }, { letter: "f", octave: 5 }],
    bass: [{ letter: "g", octave: 2 }, { letter: "a", octave: 3 }],
  },
  medium: {
    treble: [{ letter: "c", octave: 4 }, { letter: "a", octave: 5 }],
    bass: [{ letter: "e", octave: 2 }, { letter: "c", octave: 4 }],
  },
  hard: {
    treble: [{ letter: "a", octave: 3 }, { letter: "c", octave: 6 }],
    bass: [{ letter: "c", octave: 2 }, { letter: "e", octave: 4 }],
  },
};

/** Every natural pitch between two bounds, inclusive. */
export function pitchesBetween(low: Pitch, high: Pitch): Pitch[] {
  const out: Pitch[] = [];
  for (let s = step(low); s <= step(high); s++) {
    out.push({ letter: SCALE_ORDER[((s % 7) + 7) % 7], octave: Math.floor(s / 7) });
  }
  return out;
}

/** Ledger lines the note needs. 0 when it sits on the staff. */
export function ledgerLines(p: Pitch, clef: Clef): number {
  const { bottom, top } = STAFF_LINES[clef];
  const s = step(p);
  if (s < bottom) return Math.floor((bottom - s) / 2);
  if (s > top) return Math.floor((s - top) / 2);
  return 0;
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

/** A one-line description of where the note sits - the wrong-answer hint. */
export function positionText(p: Pitch, clef: Clef): string {
  const { bottom, top } = STAFF_LINES[clef];
  const s = step(p);
  const ledgers = ledgerLines(p, clef);

  if (s >= bottom && s <= top) {
    const offset = s - bottom;
    const onLine = offset % 2 === 0;
    const index = Math.floor(offset / 2);
    return onLine
      ? `${ORDINALS[index]} line of the ${clef} staff, counting up.`
      : `${ORDINALS[index]} space of the ${clef} staff, counting up.`;
  }

  const where = s > top ? "above" : "below";
  const lines = ledgers === 1 ? "1 ledger line" : `${ledgers} ledger lines`;
  return ledgers === 0
    ? `Just ${where} the ${clef} staff, in the space next to it.`
    : `${lines} ${where} the ${clef} staff.`;
}
