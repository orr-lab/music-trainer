import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { CLEF_NAMES } from "@/lib/i18n/music";
import { copy } from "@/lib/i18n/ui";
import { familyName, intervalName, intervalsFor, toneLabel } from "@/lib/data/intervals";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  acceptedAlteredNames,
  alteredName,
  answerValue,
  noteName,
  pitchesBetween,
  semitone,
  step,
  vexKey,
  type AlteredPitch,
  type Clef,
  type Pitch,
} from "@/lib/data/notes";

export const BUILD_MODE_ID = "build";

/**
 * Only naturals are used, on both ends. That is not a shortcut: between two
 * natural notes the interval is fully determined, so a name plus a starting
 * note picks out exactly one answer, with no accidental to spell. Every one of
 * the thirteen intervals still turns up - the triton as fa-si, sekunda ktana as
 * mi-fa and si-do, and so on.
 */
function pitchAt(from: Pitch, steps: number): Pitch {
  const s = step(from) + steps;
  return { letter: SCALE_ORDER[((s % 7) + 7) % 7], octave: Math.floor(s / 7) };
}

/** "do re mi" - the letters to count through, which is how it is taught. */
function letterRun(
  from: Pitch,
  to: Pitch,
  naming: "solfege" | "letters",
): string {
  const distance = step(to) - step(from);
  const direction = distance >= 0 ? 1 : -1;
  const names: string[] = [];
  for (let i = 0; i <= Math.abs(distance); i++) {
    names.push(noteName(pitchAt(from, i * direction), naming));
  }
  return names.join(" ");
}

export const buildMode: Mode = {
  id: BUILD_MODE_ID,
  title: "Building intervals",
  group: "Intervals",
  subtitle: "Bniyat mirvachim",
  blurb: "Given a note and an interval, place the other note.",
  pool: (raw) => {
    const settings = readSettings(raw);
    const lang = settings.lang;
    const t = copy(lang).q;
    const rows = intervalsFor(settings.intervalSet);
    const clefs: Clef[] =
      settings.clefs === "both" ? ["treble", "bass"] : [settings.clefs];

    const questions: Question[] = [];

    for (const clef of clefs) {
      const range = pitchesBetween(
        ...DIFFICULTY_RANGE[settings.staffDifficulty][clef],
      );
      // Every position the answer could be placed on, for the staff picker.
      const positions: ValueOption[] = range.map((p) => ({
        value: step(p),
        label: noteName(p, settings.naming),
      }));

      for (const start of range) {
        for (const interval of rows) {
          if (interval.letterSpan === null || interval.tones === 0) continue;

          for (const up of [true, false]) {
            // The letters fix where the note sits; the accidental then makes
            // the distance right. That is the whole exercise, and it is why
            // naturals-only was too easy.
            const targetStep = up
              ? step(start) + interval.letterSpan
              : step(start) - interval.letterSpan;
            const natural: Pitch = {
              letter: SCALE_ORDER[((targetStep % 7) + 7) % 7],
              octave: Math.floor(targetStep / 7),
            };
            if (!positions.some((p) => p.value === targetStep)) continue;

            const wanted = up
              ? semitone(start) + interval.tones * 2
              : semitone(start) - interval.tones * 2;
            const alter = wanted - semitone(natural);
            // A double sharp or double flat is beyond what this drill spells.
            if (alter < -1 || alter > 1) continue;
            const target: AlteredPitch = { ...natural, alter: alter as -1 | 0 | 1 };

            const direction = up ? "above" : "below";
            const directionText = up ? t.aboveTheNote : t.belowTheNote;
            const startName = noteName(start, settings.naming, lang);
            const targetName = alteredName(target, settings.naming, lang);

            questions.push({
              id: `build:${clef}:${start.letter}${start.octave}:${
                up ? "up" : "down"
              }:${interval.id}`,
              modeId: BUILD_MODE_ID,
              prompt: intervalName(interval, lang),
              promptSub: directionText,
              media:
                settings.buildStyle === "typed"
                  ? { kind: "staff", payload: { clef, notes: vexKey(start) } }
                  : undefined,
              weight: interval.weight + (up ? 0 : 0.3) + (alter === 0 ? 0 : 0.2),
              topics: ["building intervals"],
              parts: [
                {
                  id: "note",
                  label: up ? t.noteAbove : t.noteBelow,
                  input:
                    settings.buildStyle === "typed"
                      ? {
                          kind: "text",
                          placeholder:
                            settings.naming === "solfege"
                              ? t.typePlaceholderSolfege
                              : t.typePlaceholderLetters,
                        }
                      : {
                          kind: "value",
                          options: positions,
                          render: {
                            kind: "staff-picker",
                            payload: { clef, given: vexKey(start) },
                          },
                        },
                  accepted:
                    settings.buildStyle === "typed"
                      ? acceptedAlteredNames(target)
                      : [answerValue(target)],
                  display: `${targetName} (${target.letter.toUpperCase()}${
                    target.alter === 1 ? "#" : target.alter === -1 ? "b" : ""
                  }${target.octave})`,
                  reason: `A ${interval.name} is ${
                    interval.letterSpan + 1
                  } letters and ${toneLabel(
                    interval.tones,
                  )} tones, so ${direction} ${startName} it lands on ${targetName}. Count the letters: ${letterRun(
                    start,
                    natural,
                    settings.naming,
                  )}.`,
                  topics: [
                    "building intervals",
                    familyName(interval.family, lang),
                    CLEF_NAMES[clef][lang],
                  ],
                },
              ],
            });
          }
        }
      }
    }

    return questions;
  },
};
