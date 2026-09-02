import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import {
  INTERVAL_CLASSES,
  classLabel,
  intervalsFor,
  toneLabel,
  toneValues,
  type IntervalRow,
} from "@/lib/data/intervals";
import { readSettings } from "@/lib/engine/settings";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  alteredName,
  noteName,
  pitchesBetween,
  semitone,
  step,
  vexKey,
  vexKeyAltered,
} from "@/lib/data/notes";

export const INTERVALS_MODE_ID = "intervals";

/** Distinct sizes only: several intervals can share one. */
function toneOptions(rows: IntervalRow[]): ValueOption[] {
  return toneValues(rows).map((value) => ({ value, label: toneLabel(value) }));
}

const CLASS_OPTIONS = INTERVAL_CLASSES.map((c) => ({
  id: c.id,
  label: c.label,
}));

/** Forward: name the interval, give its size and its classification. */
function forwardQuestions(rows: IntervalRow[]): Question[] {
  const TONE_OPTIONS = toneOptions(rows);
  return rows.map((row) => ({
    id: `intervals:forward:${row.id}`,
    modeId: INTERVALS_MODE_ID,
    prompt: row.name,
    promptSub: "How many tones, and what class?",
    weight: row.weight,
    topics: [row.family],
    parts: [
      {
        id: "tones",
        label: "Tones",
        input: { kind: "value", options: TONE_OPTIONS },
        accepted: [String(row.tones)],
        display: `${toneLabel(row.tones)} tones`,
        reason: row.note,
        topics: ["interval size", row.family],
      },
      {
        id: "class",
        label: "Class",
        input: { kind: "choice", options: CLASS_OPTIONS },
        accepted: row.classes,
        display: row.classes.map(classLabel).join(" or "),
        reason: row.note,
        topics: ["interval class", row.family],
      },
    ],
  }));
}

/**
 * The other direction: two notes on a staff, name the interval between them.
 *
 * Not "how many tones" - a size alone does not name an interval, and asking it
 * that way teaches the wrong thing. Written out, the letters give the number
 * and the accidentals give the quality, which is the actual reading skill. The
 * distractors include the interval that sounds identical but is spelled
 * differently, so the letters have to be counted rather than the semitones.
 */
function readingQuestions(rows: IntervalRow[]): Question[] {
  const questions: Question[] = [];

  for (const clef of ["treble", "bass"] as const) {
    const range = pitchesBetween(...DIFFICULTY_RANGE.easy[clef]);

    for (const low of range) {
      for (const interval of rows) {
        if (interval.letterSpan === null || interval.tones === 0) continue;

        const highStep = step(low) + interval.letterSpan;
        const letter = SCALE_ORDER[((highStep % 7) + 7) % 7];
        const octave = Math.floor(highStep / 7);
        const natural = { letter, octave };
        if (step(natural) > step(range[range.length - 1]) + 2) continue;

        const alter = semitone(low) + interval.tones * 2 - semitone(natural);
        if (alter < -1 || alter > 1) continue;
        const high = { ...natural, alter: alter as -1 | 0 | 1 };

        // Same size spelled another way, then the neighbouring sizes.
        const twin = rows.find(
          (i) => i.tones === interval.tones && i.id !== interval.id && i.letterSpan !== null,
        );
        const near = rows
          .filter(
            (i) =>
              i.letterSpan !== null &&
              i.id !== interval.id &&
              i.id !== twin?.id &&
              i.tones !== 0,
          )
          .sort(
            (a, b) =>
              Math.abs(a.tones - interval.tones) - Math.abs(b.tones - interval.tones),
          );
        const choices = [interval, ...(twin ? [twin] : []), ...near].slice(0, 4);

        questions.push({
          id: `intervals:reading:${clef}:${low.letter}${low.octave}:${interval.id}`,
          modeId: INTERVALS_MODE_ID,
          prompt: "Which interval is this?",
          media: {
            kind: "staff",
            payload: {
              clef,
              notes: `${vexKey(low)},${vexKeyAltered(high)}`,
            },
          },
          weight: interval.weight + 0.2,
          topics: [interval.family],
          parts: [
            {
              id: "name",
              label: "Interval",
              input: {
                kind: "choice",
                options: choices.map((i) => ({ id: i.id, label: i.name })),
              },
              accepted: [interval.id],
              display: interval.name,
              reason: `${noteName(low, "solfege")} up to ${alteredName(
                high,
                "solfege",
              )} is ${interval.letterSpan + 1} letters and ${toneLabel(
                interval.tones,
              )} tones: a ${interval.name}.`,
              shuffle: true,
              topics: ["reading intervals", interval.family],
            },
          ],
        });
      }
    }
  }

  return questions;
}

export const intervalsMode: Mode = {
  id: INTERVALS_MODE_ID,
  title: "Intervals",
  group: "Intervals",
  subtitle: "Mirvachim",
  blurb: "Size in tones and classification, both directions.",
  pool: (raw) => {
    const rows = intervalsFor(readSettings(raw).intervalSet);
    return [...forwardQuestions(rows), ...readingQuestions(rows)];
  },
};
