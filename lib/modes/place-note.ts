import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { CLEF_NAMES } from "@/lib/i18n/music";
import { copy } from "@/lib/i18n/ui";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  alterSuffix,
  alteredName,
  answerValue,
  noteName,
  pitchesBetween,
  positionText,
  step,
  type AlteredPitch,
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
    const lang = settings.lang;
    const t = copy(lang).q;
    const clefs: Clef[] =
      settings.clefs === "both" ? ["treble", "bass"] : [settings.clefs];

    const questions: Question[] = [];

    for (const clef of clefs) {
      const range = pitchesBetween(
        ...DIFFICULTY_RANGE[settings.staffDifficulty][clef],
      );
      const positions: ValueOption[] = range.map((p) => ({
        value: step(p),
        label: noteName(p, settings.naming, lang),
      }));

      for (const letter of SCALE_ORDER) {
        const matching = range.filter((p) => p.letter === letter);
        if (matching.length === 0) continue;

        for (const alter of [0, 1, -1] as const) {
          const target: AlteredPitch = { ...matching[0], alter };
          const name = alteredName(target, settings.naming, lang);

          questions.push({
            id: `place-note:${clef}:${letter}${alterSuffix(alter)}`,
            modeId: PLACE_NOTE_MODE_ID,
            prompt: name,
            promptSub: t.putItOn(CLEF_NAMES[clef][lang]),
            weight: alter === 0 ? 1 : 1.2,
            topics: ["writing notes"],
            parts: [
              {
                id: "position",
                label: t.positionLabel,
                input: {
                  kind: "value",
                  options: positions,
                  render: { kind: "staff-picker", payload: { clef } },
                },
                // Any octave counts: the exercise is knowing where the letter
                // lives on this clef, and which sign it needs - not which one
                // of its octaves was meant.
                accepted: matching.map((p) => answerValue({ ...p, alter })),
                display: `${name} - ${positionText(matching[0], clef).replace(
                  /\.$/,
                  "",
                )}${matching.length > 1 ? ", or any other octave of it" : ""}`,
                reason: `Any ${name} counts. The lowest one on this staff: ${positionText(
                  matching[0],
                  clef,
                ).toLowerCase()}`,
                topics: ["writing notes", CLEF_NAMES[clef][lang]],
              },
            ],
          });
        }
      }
    }

    return questions;
  },
};
