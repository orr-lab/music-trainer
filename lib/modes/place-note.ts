import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  noteName,
  pitchesBetween,
  positionText,
  step,
  type Clef,
} from "@/lib/data/notes";

export const PLACE_NOTE_MODE_ID = "place-note";

export const placeNoteMode: Mode = {
  id: PLACE_NOTE_MODE_ID,
  title: "Writing notes",
  group: "The staff",
  subtitle: "Ktivat tavim",
  blurb: "Given a name, put the note on the staff.",
  pool: (raw) => {
    const settings = readSettings(raw);
    const clefs: Clef[] =
      settings.clefs === "both" ? ["treble", "bass"] : [settings.clefs];

    const questions: Question[] = [];

    for (const clef of clefs) {
      const range = pitchesBetween(
        ...DIFFICULTY_RANGE[settings.staffDifficulty][clef],
      );
      const positions: ValueOption[] = range.map((p) => ({
        value: step(p),
        label: noteName(p, settings.naming),
      }));

      for (const letter of SCALE_ORDER) {
        const matching = range.filter((p) => p.letter === letter);
        if (matching.length === 0) continue;

        questions.push({
          id: `place-note:${clef}:${letter}`,
          modeId: PLACE_NOTE_MODE_ID,
          prompt: noteName({ letter, octave: 4 }, settings.naming),
          promptSub: `put it on the ${clef} staff`,
          weight: 1,
          topics: ["writing notes"],
          parts: [
            {
              id: "position",
              label: "Position",
              input: {
                kind: "value",
                options: positions,
                render: { kind: "staff-picker", payload: { clef } },
              },
              // Any octave counts: the exercise is knowing where the letter
              // lives on this clef, not which one of its octaves was meant.
              accepted: matching.map((p) => String(step(p))),
              display: `${noteName(matching[0], settings.naming)} - ${positionText(
                matching[0],
                clef,
              ).replace(/\.$/, "")}${
                matching.length > 1 ? ", or any other octave of it" : ""
              }`,
              reason: `Any ${noteName(
                matching[0],
                settings.naming,
              )} counts. The lowest one on this staff is the ${positionText(
                matching[0],
                clef,
              ).toLowerCase()}`,
              topics: ["writing notes", `${clef} clef`],
            },
          ],
        });
      }
    }

    return questions;
  },
};
