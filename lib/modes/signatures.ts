import type { ChoiceOption, Mode, Question } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import type { Lang } from "@/lib/i18n/lang";
import { NO_ACCIDENTALS } from "@/lib/i18n/music";
import { reasons } from "@/lib/i18n/reasons";
import { copy } from "@/lib/i18n/ui";
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
  lang: Lang,
  mode: "major" | "minor",
): ChoiceOption[] {
  return [KEYS[index], ...neighbours(index, 3)].map((k) => ({
    id: k.id,
    label:
      mode === "major"
        ? keyName(k.tonic, "major", naming, lang)
        : keyName(k.relativeMinor, "minor", naming, lang),
  }));
}

export const signaturesMode: Mode = {
  id: SIGNATURES_MODE_ID,
  title: "Reading key signatures",
  group: "Keys and signatures",
  subtitle: "Simanei mafteach",
  blurb: "See the signature on the staff and name the key.",
  pool: (raw) => {
    const { naming, lang } = readSettings(raw);
    const t = copy(lang).q;
    const r = reasons(lang);
    const clefs: Clef[] = ["treble", "bass"];
    const questions: Question[] = [];

    KEYS.forEach((key, index) => {
      for (const clef of clefs) {
        const major = keyName(key.tonic, "major", naming, lang);
        const minor = keyName(key.relativeMinor, "minor", naming, lang);
        const written =
          key.kind === "none"
            ? NO_ACCIDENTALS[lang]
            : `${countText(key, lang)}: ${signatureText(key, naming, lang)}`;

        for (const mode of ["major", "minor"] as const) {
          questions.push({
            id: `signatures:${mode}:${clef}:${key.id}`,
            modeId: SIGNATURES_MODE_ID,
            prompt: mode === "major" ? t.whichMajorKey : t.whichMinorKey,
            media: {
              kind: "staff",
              payload: { clef, keySignature: vexKeySpec(key) },
            },
            weight: 1 + 0.1 * key.count,
            topics: ["reading key signatures"],
            parts: [
              {
                id: "key",
                label: t.keyLabel,
                input: { kind: "choice", options: options(index, naming, lang, mode) },
                accepted: [key.id],
                display: mode === "major" ? major : minor,
                reason: r.thatSignatureIs(written, major, minor),
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
