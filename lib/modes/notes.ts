import type { ChoiceOption, Mode, Question } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import {
  DIFFICULTY_RANGE,
  SCALE_ORDER,
  acceptedNames,
  ledgerLines,
  noteName,
  pitchesBetween,
  positionText,
  vexKey,
  type Clef,
} from "@/lib/data/notes";

export const NOTES_MODE_ID = "notes";

export const notesMode: Mode = {
  id: NOTES_MODE_ID,
  title: "Staff reading",
  group: "The staff",
  subtitle: "Kriat tavim",
  blurb: "Name the note on the staff, treble and bass.",
  pool: (raw) => {
    const settings = readSettings(raw);
    const clefs: Clef[] =
      settings.clefs === "both" ? ["treble", "bass"] : [settings.clefs];

    const options: ChoiceOption[] = SCALE_ORDER.map((letter) => ({
      id: letter,
      label: noteName({ letter, octave: 4 }, settings.naming),
    }));

    const questions: Question[] = [];
    for (const clef of clefs) {
      const [low, high] = DIFFICULTY_RANGE[settings.staffDifficulty][clef];
      for (const pitch of pitchesBetween(low, high)) {
        const ledgers = ledgerLines(pitch, clef);
        const both =
          settings.naming === "solfege"
            ? `${noteName(pitch, "solfege")} (${noteName(pitch, "letters")})`
            : `${noteName(pitch, "letters")} (${noteName(pitch, "solfege")})`;

        questions.push({
          // Deliberately free of the difficulty and naming settings: it is the
          // same note either way, and its stats should not fragment.
          id: `notes:${clef}:${pitch.letter}${pitch.octave}`,
          modeId: NOTES_MODE_ID,
          prompt: "Name the note",
          media: { kind: "staff", payload: { clef, notes: vexKey(pitch) } },
          // Ledger lines are the hard part, so they are worth more.
          weight: 1 + 0.2 * Math.min(ledgers, 3),
          topics: [`${clef} clef`],
          parts: [
            {
              id: "name",
              label: "Note",
              input:
                settings.answerStyle === "typing"
                  ? {
                      kind: "text",
                      placeholder:
                        settings.naming === "solfege" ? "do re mi…" : "A–G",
                    }
                  : { kind: "choice", options },
              // Both naming systems are always accepted.
              accepted: acceptedNames(pitch),
              display: both,
              reason: positionText(pitch, clef),
              topics: [
                `${clef} clef`,
                ...(ledgers > 0 ? ["ledger lines"] : []),
              ],
            },
          ],
        });
      }
    }
    return questions;
  },
};
