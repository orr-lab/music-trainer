import type { ChoiceOption, Mode, Question } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import {
  KEYS,
  countText,
  keyName,
  signatureText,
  vexKeySpec,
  type KeyRow,
  type Naming,
} from "@/lib/data/keys";
import type { Clef } from "@/lib/data/notes";

export const SIGNATURES_MODE_ID = "signatures";

/** Neighbours on the circle: the keys actually worth confusing this one with. */
function neighbours(index: number, howMany: number): KeyRow[] {
  const out: KeyRow[] = [];
  for (let d = 1; out.length < howMany && d <= KEYS.length; d++) {
    for (const i of [index - d, index + d]) {
      if (i >= 0 && i < KEYS.length && out.length < howMany) out.push(KEYS[i]);
    }
  }
  return out;
}

function options(
  index: number,
  naming: Naming,
  mode: "major" | "minor",
): ChoiceOption[] {
  return [KEYS[index], ...neighbours(index, 3)].map((k) => ({
    id: k.id,
    label:
      mode === "major"
        ? keyName(k.tonic, "major", naming)
        : keyName(k.relativeMinor, "minor", naming),
  }));
}

export const signaturesMode: Mode = {
  id: SIGNATURES_MODE_ID,
  title: "Reading key signatures",
  group: "Keys and signatures",
  subtitle: "Simanei mafteach",
  blurb: "See the signature on the staff and name the key.",
  pool: (raw) => {
    const { naming } = readSettings(raw);
    const clefs: Clef[] = ["treble", "bass"];
    const questions: Question[] = [];

    KEYS.forEach((key, index) => {
      for (const clef of clefs) {
        const major = keyName(key.tonic, "major", naming);
        const minor = keyName(key.relativeMinor, "minor", naming);
        const written =
          key.kind === "none"
            ? "No accidentals at all"
            : `${countText(key)}: ${signatureText(key, naming)}`;

        for (const mode of ["major", "minor"] as const) {
          questions.push({
            id: `signatures:${mode}:${clef}:${key.id}`,
            modeId: SIGNATURES_MODE_ID,
            prompt: mode === "major" ? "Which major key?" : "Which minor key?",
            media: {
              kind: "staff",
              payload: { clef, keySignature: vexKeySpec(key) },
            },
            weight: 1 + 0.1 * key.count,
            topics: ["reading key signatures"],
            parts: [
              {
                id: "key",
                label: "Key",
                input: { kind: "choice", options: options(index, naming, mode) },
                accepted: [key.id],
                display: mode === "major" ? major : minor,
                reason: `${written}. That signature is ${major}, or ${minor}.`,
                shuffle: true,
                topics: ["reading key signatures"],
              },
            ],
          });
        }
      }
    });

    return questions;
  },
};
