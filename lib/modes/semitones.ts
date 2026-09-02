import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { INTERVALS, toneLabel } from "@/lib/data/intervals";
import {
  HIGHEST,
  LOWEST,
  allKeys,
  countingRun,
  isBlack,
  keyName,
} from "@/lib/data/keyboard";

export const SEMITONES_MODE_ID = "semitones";

/** Every interval except the unison, which has nothing to count. */
const COUNTABLE = INTERVALS.filter((i) => i.tones > 0);

const TONE_OPTIONS: ValueOption[] = COUNTABLE.map((i) => ({
  value: i.tones,
  label: toneLabel(i.tones),
})).sort((a, b) => a.value - b.value);

export const semitonesMode: Mode = {
  id: SEMITONES_MODE_ID,
  title: "Counting semitones",
  group: "Intervals",
  subtitle: "Sfirat tonim",
  blurb: "Count the distance out on a keyboard, key by key.",
  pool: (raw) => {
    const { naming } = readSettings(raw);
    const questions: Question[] = [];

    const positions: ValueOption[] = allKeys().map((semitone) => ({
      value: semitone,
      label: keyName(semitone, naming),
    }));

    const lowStarts = allKeys().filter((s) => s < LOWEST + 12);
    const highStarts = allKeys().filter((s) => s >= LOWEST + 12 && s < HIGHEST);
    const naturalLows = lowStarts.filter((s) => !isBlack(s));

    // Find the key, counting from the one that is marked.
    for (const [starts, up] of [
      [lowStarts, true],
      [highStarts.filter((s) => !isBlack(s)), false],
    ] as const) {
      for (const start of starts) {
        for (const interval of COUNTABLE) {
          const semitones = interval.tones * 2;
          const target = up ? start + semitones : start - semitones;
          if (target < LOWEST || target > HIGHEST) continue;

          questions.push({
            id: `semitones:pick:${start}:${up ? "up" : "down"}:${interval.id}`,
            modeId: SEMITONES_MODE_ID,
            prompt: interval.name,
            promptSub: `${up ? "above" : "below"} the marked key`,
            weight: interval.weight + (isBlack(start) ? 0.2 : 0),
            topics: ["counting semitones"],
            parts: [
              {
                id: "key",
                label: "Key",
                input: {
                  kind: "value",
                  options: positions,
                  render: { kind: "piano-picker", payload: { start, naming } },
                },
                accepted: [String(target)],
                display: keyName(target, naming),
                reason: `A ${interval.name} is ${toneLabel(
                  interval.tones,
                )} tones, so ${semitones} semitones. Count them: ${countingRun(
                  start,
                  target,
                  naming,
                )}.`,
                topics: ["counting semitones", interval.family],
              },
            ],
          });
        }
      }
    }

    // The other direction: two keys are marked, measure the gap.
    for (const start of naturalLows) {
      for (const interval of COUNTABLE) {
        const target = start + interval.tones * 2;
        if (target > HIGHEST) continue;

        questions.push({
          id: `semitones:measure:${start}:${interval.id}`,
          modeId: SEMITONES_MODE_ID,
          prompt: "How far apart are these?",
          media: {
            kind: "piano",
            payload: { from: start, to: target },
          },
          weight: interval.weight,
          topics: ["counting semitones"],
          parts: [
            {
              id: "tones",
              label: "Tones",
              input: { kind: "value", options: TONE_OPTIONS },
              accepted: [String(interval.tones)],
              display: `${toneLabel(interval.tones)} tones - a ${interval.name}`,
              reason: `${interval.tones * 2} semitones, which is ${toneLabel(
                interval.tones,
              )} tones: a ${interval.name}. Count them: ${countingRun(
                start,
                target,
                naming,
              )}.`,
              topics: ["counting semitones", interval.family],
            },
          ],
        });
      }
    }

    return questions;
  },
};
