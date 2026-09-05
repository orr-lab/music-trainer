import type { ChoiceOption, Mode, Question } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import {
  KEYS,
  keyName,
  scaleNotes,
  scaleText,
  tonicName,
  type Tonic,
} from "@/lib/data/keys";
import { degreeName } from "@/lib/i18n/music";
import { reasons } from "@/lib/i18n/reasons";
import { copy } from "@/lib/i18n/ui";

export const SCALES_MODE_ID = "scales";

/** Degrees worth asking: the tonic is free and the octave repeats it. */
const DEGREES = [2, 3, 4, 5, 6, 7];

const withAccidental = (t: Tonic, accidental: Tonic["accidental"]): Tonic => ({
  letter: t.letter,
  accidental,
});

export const scalesMode: Mode = {
  id: SCALES_MODE_ID,
  title: "Major scales",
  group: "Keys and signatures",
  subtitle: "Sulamot mazhoriyim",
  blurb: "The notes of every major scale, degree by degree.",
  pool: (raw) => {
    const { naming, lang } = readSettings(raw);
    const t = copy(lang).q;
    const r = reasons(lang);
    const questions: Question[] = [];

    const label = (note: Tonic) => tonicName(note, naming, lang);

    for (const key of KEYS) {
      const notes = scaleNotes(key);
      const name = keyName(key.tonic, "major", naming, lang);
      const spelling = scaleText(key, naming, lang);
      const weight = 1 + 0.1 * key.count;

      // Which note is the third? - the step that makes interval quality
      // stop needing any counting.
      for (const degree of DEGREES) {
        const answer = notes[degree - 1];

        // Wrong on purpose in the two ways that actually happen: the right
        // letter without its accidental, and the neighbouring degrees.
        const candidates: Tonic[] = [answer];
        if (answer.accidental !== "") {
          candidates.push(withAccidental(answer, ""));
        } else {
          candidates.push(withAccidental(answer, key.kind === "bemolim" ? "b" : "#"));
        }
        for (const offset of [-1, 1, 2]) {
          const neighbour = notes[(degree - 1 + offset + 7) % 7];
          if (!candidates.some((c) => label(c) === label(neighbour))) {
            candidates.push(neighbour);
          }
        }

        const options: ChoiceOption[] = candidates
          .slice(0, 4)
          .map((note) => ({ id: label(note), label: label(note) }));

        questions.push({
          id: `scales:degree:${key.id}:${degree}`,
          modeId: SCALES_MODE_ID,
          prompt: name,
          promptSub: t.whichDegree(degreeName(degree, lang)),
          weight,
          topics: ["major scales"],
          parts: [
            {
              id: "note",
              label: t.degreeLabel,
              input: { kind: "choice", options },
              accepted: [label(answer)],
              display: label(answer),
              reason: r.scaleDegree(
                name,
                spelling,
                degreeName(degree, lang),
                label(answer),
              ),
              shuffle: true,
              topics: ["major scales"],
            },
          ],
        });
      }

      // Is this note in the scale? Asked about the notes the signature
      // decides, since those are the only ones in doubt - and never about the
      // tonic, which is in its own scale by definition.
      const decided = notes
        .slice(1)
        .filter((n) => n.accidental !== "")
        .slice(0, 3);
      const asked: { note: Tonic; inScale: boolean }[] = [];
      for (const note of decided) {
        asked.push({ note, inScale: true });
        asked.push({ note: withAccidental(note, ""), inScale: false });
      }
      if (asked.length === 0) {
        // A scale with no accidentals: ask the naturals, and the sharps it
        // would need if it had any.
        for (const note of notes.slice(1, 4)) {
          asked.push({ note, inScale: true });
          asked.push({ note: withAccidental(note, "#"), inScale: false });
        }
      }

      for (const { note, inScale } of asked) {
        questions.push({
          id: `scales:in:${key.id}:${note.letter}${note.accidental}`,
          modeId: SCALES_MODE_ID,
          prompt: name,
          promptSub: t.isItInScale(label(note)),
          weight,
          topics: ["major scales"],
          parts: [
            {
              id: "member",
              label: t.inScaleLabel,
              input: {
                kind: "choice",
                options: [
                  { id: "yes", label: t.yes },
                  { id: "no", label: t.no },
                ],
              },
              accepted: [inScale ? "yes" : "no"],
              display: inScale ? t.yes : t.no,
              reason: r.scaleMembership(label(note), name, inScale, spelling),
              topics: ["major scales"],
            },
          ],
        });
      }
    }

    return questions;
  },
};
