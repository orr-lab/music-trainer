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
 * Reverse: given a size in tones, name the interval.
 *
 * One question per size rather than per interval, because several intervals
 * share a size - 3 tones is a kvarta mugdelet, a kvinta muktenet or a triton.
 * The distractors are all other sizes, so exactly one option is right, and the
 * feedback names the other spellings of the same distance.
 */
function reverseQuestions(rows: IntervalRow[]): Question[] {
  const sizes = toneValues(rows);

  return sizes.map((tones) => {
    const named = rows.filter((i) => i.tones === tones);
    const row = named[0];
    const others = named.slice(1);

    const distractors = rows.filter((i) => i.tones !== tones)
      .sort(
        (a, b) =>
          Math.abs(a.tones - tones) - Math.abs(b.tones - tones) ||
          a.tones - b.tones,
      )
      .filter(
        (candidate, index, list) =>
          list.findIndex((other) => other.tones === candidate.tones) === index,
      )
      .slice(0, 3);

    const options = [row, ...distractors]
      .sort((a, b) => a.tones - b.tones)
      .map((i) => ({ id: i.id, label: i.name }));

    return {
      id: `intervals:reverse:${tones}`,
      modeId: INTERVALS_MODE_ID,
      prompt: `${toneLabel(tones)} tones`,
      promptSub: "Which interval is this?",
      weight: row.weight + 0.2,
      topics: [row.family],
      parts: [
        {
          id: "name",
          label: "Interval",
          input: { kind: "choice", options },
          accepted: named.map((i) => i.id),
          display: named.map((i) => i.name).join(" or "),
          reason:
            others.length === 0
              ? row.note
              : `${toneLabel(tones)} tones is a ${row.name} - or ${others
                  .map((i) => i.name)
                  .join(" or ")}, which is the same distance spelled with
                  different letters.`.replace(/\s+/g, " "),
          shuffle: true,
          topics: ["naming intervals", row.family],
        },
      ],
    };
  });
}

export const intervalsMode: Mode = {
  id: INTERVALS_MODE_ID,
  title: "Intervals",
  group: "Intervals",
  subtitle: "Mirvachim",
  blurb: "Size in tones and classification, both directions.",
  pool: (raw) => {
    const rows = intervalsFor(readSettings(raw).intervalSet);
    return [...forwardQuestions(rows), ...reverseQuestions(rows)];
  },
};
