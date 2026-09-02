import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { intervalsFor, toneLabel } from "@/lib/data/intervals";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  acceptedNames,
  noteName,
  pitchesBetween,
  semitone,
  step,
  vexKey,
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
        for (const target of range) {
          const distance = semitone(target) - semitone(start);
          // Unisons are not a drill, and nothing wider than an octave.
          if (distance === 0 || Math.abs(distance) > 12) continue;

          // Both halves have to match: three tones across four letters is a
          // kvarta mugdelet, across five letters a kvinta muktenet. The triton
          // has no letter span and is never the answer here.
          const letters = Math.abs(step(target) - step(start));
          const interval = rows.find(
            (i) => i.tones === Math.abs(distance) / 2 && i.letterSpan === letters,
          );
          if (!interval) continue;

          const up = distance > 0;
          const direction = up ? "above" : "below";
          const startName = noteName(start, settings.naming);
          const targetName = noteName(target, settings.naming);
          const spelled = `${target.letter.toUpperCase()}${target.octave}`;

          questions.push({
            // Stable across every setting: it is the same exercise however it
            // is named or answered.
            id: `build:${clef}:${start.letter}${start.octave}:${
              up ? "up" : "down"
            }:${interval.id}`,
            modeId: BUILD_MODE_ID,
            prompt: interval.name,
            promptSub: `${direction} the note shown`,
            // In typed mode the staff is the prompt; the picker draws its own.
            media:
              settings.buildStyle === "typed"
                ? { kind: "staff", payload: { clef, notes: vexKey(start) } }
                : undefined,
            // Downwards is the harder direction, and gets asked as often.
            weight: interval.weight + (up ? 0 : 0.3),
            topics: ["building intervals"],
            parts: [
              {
                id: "note",
                label: up ? "The note above" : "The note below",
                input:
                  settings.buildStyle === "typed"
                    ? {
                        kind: "text",
                        placeholder:
                          settings.naming === "solfege" ? "do re mi…" : "A–G",
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
                    ? acceptedNames(target)
                    : [String(step(target))],
                display: `${targetName} (${spelled})`,
                reason: `A ${interval.name} is ${toneLabel(
                  interval.tones,
                )} tones, so ${direction} ${startName} it lands on ${targetName}. Count the letters: ${letterRun(
                  start,
                  target,
                  settings.naming,
                )}.`,
                topics: ["building intervals", interval.family, `${clef} clef`],
              },
            ],
          });
        }
      }
    }

    return questions;
  },
};
