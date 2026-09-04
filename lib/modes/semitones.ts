import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { copy } from "@/lib/i18n/ui";
import {
  familyName,
  intervalName,
  intervalsFor,
  toneLabel,
  toneValues,
} from "@/lib/data/intervals";
import {
  HIGHEST,
  LOWEST,
  allKeys,
  countingRun,
  isBlack,
  keyName,
} from "@/lib/data/keyboard";

export const SEMITONES_MODE_ID = "semitones";

export const semitonesMode: Mode = {
  id: SEMITONES_MODE_ID,
  title: "Counting semitones",
  group: "Intervals",
  subtitle: "Sfirat tonim",
  blurb: "Count the distance out on a keyboard, key by key.",
  pool: (raw) => {
    const settings = readSettings(raw);
    const naming = settings.naming;
    const lang = settings.lang;
    const t = copy(lang).q;
    // Every interval except the unison, which has nothing to count.
    const COUNTABLE = intervalsFor(settings.intervalSet).filter(
      (i) => i.tones > 0,
    );
    const TONE_OPTIONS: ValueOption[] = toneValues(COUNTABLE).map((value) => ({
      value,
      label: toneLabel(value),
    }));
    const questions: Question[] = [];

    const positions: ValueOption[] = allKeys().map((semitone) => ({
      value: semitone,
      label: keyName(semitone, naming, lang),
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
            prompt: intervalName(interval, lang),
            promptSub: up ? t.markedKeyAbove : t.markedKeyBelow,
            weight: interval.weight + (isBlack(start) ? 0.2 : 0),
            topics: ["counting semitones"],
            parts: [
              {
                id: "key",
                label: t.keyKeyboardLabel,
                input: {
                  kind: "value",
                  options: positions,
                  render: { kind: "piano-picker", payload: { start, naming } },
                },
                accepted: [String(target)],
                display: keyName(target, naming, lang),
                reason: `A ${interval.name} is ${toneLabel(
                  interval.tones,
                )} tones, so ${semitones} semitones. Count them: ${countingRun(
                  start,
                  target,
                  naming,
                )}.`,
                topics: ["counting semitones", familyName(interval.family, lang)],
              },
            ],
          });
        }
      }
    }

    // The other direction: two keys are marked, measure the gap. One question
    // per distance, not per name - the keys cannot tell you which spelling it
    // is, so the answer is the size and the feedback names them all.
    const sizes = toneValues(COUNTABLE);
    for (const start of naturalLows) {
      for (const tones of sizes) {
        const named = COUNTABLE.filter((i) => i.tones === tones);
        const interval = named[0];
        const target = start + tones * 2;
        if (target > HIGHEST) continue;
        const allNames = named.map((i) => intervalName(i, lang)).join(t.orJoin);

        questions.push({
          id: `semitones:measure:${start}:${tones}`,
          modeId: SEMITONES_MODE_ID,
          prompt: t.howFarApart,
          media: {
            kind: "piano",
            payload: { from: start, to: target },
          },
          weight: interval.weight,
          topics: ["counting semitones"],
          parts: [
            {
              id: "tones",
              label: t.tones,
              input: { kind: "value", options: TONE_OPTIONS },
              accepted: [String(tones)],
              display: `${toneLabel(tones)} tones - ${allNames}`,
              reason: `${tones * 2} semitones, which is ${toneLabel(
                tones,
              )} tones: ${allNames}. On a keyboard the spelling is invisible - it is the letters that decide the name. Count them: ${countingRun(
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
