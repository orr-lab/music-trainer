import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import {
  INTERVALS,
  INTERVAL_CLASSES,
  classLabel,
  toneLabel,
} from "@/lib/data/intervals";

export const INTERVALS_MODE_ID = "intervals";

const TONE_OPTIONS: ValueOption[] = INTERVALS.map((i) => ({
  value: i.tones,
  label: toneLabel(i.tones),
})).sort((a, b) => a.value - b.value);

const CLASS_OPTIONS = INTERVAL_CLASSES.map((c) => ({
  id: c.id,
  label: c.label,
}));

/** Forward: name the interval, give its size and its classification. */
function forwardQuestions(): Question[] {
  return INTERVALS.map((row) => ({
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
 * Four options, not all thirteen - the distractors are the nearest intervals by
 * size, which is where the confusion actually lives. Picked deterministically so
 * a question always looks the same and its stats stay comparable.
 */
function reverseQuestions(): Question[] {
  return INTERVALS.map((row) => {
    const distractors = INTERVALS.filter((i) => i.id !== row.id)
      .sort(
        (a, b) =>
          Math.abs(a.tones - row.tones) - Math.abs(b.tones - row.tones) ||
          a.tones - b.tones,
      )
      .slice(0, 3);
    const options = [row, ...distractors]
      .sort((a, b) => a.tones - b.tones)
      .map((i) => ({ id: i.id, label: i.name }));

    return {
      id: `intervals:reverse:${row.id}`,
      modeId: INTERVALS_MODE_ID,
      prompt: `${toneLabel(row.tones)} tones`,
      promptSub: "Which interval is this?",
      weight: row.weight + 0.2,
      topics: [row.family],
      parts: [
        {
          id: "name",
          label: "Interval",
          input: { kind: "choice", options },
          accepted: [row.id, row.name],
          display: row.name,
          reason: row.note,
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
  pool: () => [...forwardQuestions(), ...reverseQuestions()],
};
