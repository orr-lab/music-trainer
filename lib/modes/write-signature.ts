import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { CLEF_NAMES, FLATS_WORD, SHARPS_WORD } from "@/lib/i18n/music";
import type { Lang } from "@/lib/i18n/lang";
import { reasons } from "@/lib/i18n/reasons";
import { copy } from "@/lib/i18n/ui";
import {
  KEYS,
  FLAT_ORDER,
  SHARP_ORDER,
  countText,
  keyName,
  signatureSteps,
  signatureText,
  tonicName,
  vexKeySpec,
} from "@/lib/data/keys";
import { STAFF_LINES, SCALE_ORDER, noteName, type Clef } from "@/lib/data/notes";

export const WRITE_SIGNATURE_MODE_ID = "write-signature";

/** Anywhere on the staff, or just off it - so a wrong line is possible. */
function placeable(clef: Clef, lang: Lang): ValueOption[] {
  const { bottom, top } = STAFF_LINES[clef];
  const out: ValueOption[] = [];
  for (let step = bottom - 2; step <= top + 2; step++) {
    out.push({
      value: step,
      label: noteName(
        {
          letter: SCALE_ORDER[((step % 7) + 7) % 7],
          octave: Math.floor(step / 7),
        },
        "solfege",
        lang,
      ),
    });
  }
  return out;
}

export const writeSignatureMode: Mode = {
  id: WRITE_SIGNATURE_MODE_ID,
  title: "Writing key signatures",
  group: "Keys and signatures",
  subtitle: "Ktivat simanei mafteach",
  blurb: "Place every accidental, in order, on the right line.",
  pool: (raw) => {
    const { naming, lang } = readSettings(raw);
    const t = copy(lang).q;
    const r = reasons(lang);
    const questions: Question[] = [];

    for (const key of KEYS) {
      if (key.kind === "none") continue;
      const order = key.kind === "diezim" ? SHARP_ORDER : FLAT_ORDER;
      const orderText = order.map((a) => tonicName(a, naming, lang)).join(" ");

      for (const clef of ["treble", "bass"] as const) {
        const wanted = signatureSteps(key, clef);
        questions.push({
          id: `write-signature:${clef}:${key.id}`,
          modeId: WRITE_SIGNATURE_MODE_ID,
          prompt: keyName(key.tonic, "major", naming, lang),
          promptSub: t.writeSignatureOn(CLEF_NAMES[clef][lang]),
          weight: 1 + 0.15 * key.count,
          topics: ["writing key signatures"],
          parts: [
            {
              id: "signature",
              label: t.signatureLabel,
              input: {
                kind: "value",
                options: placeable(clef, lang),
                render: {
                  kind: "signature-writer",
                  payload: {
                    clef,
                    glyph: key.kind === "diezim" ? "#" : "b",
                    count: key.count,
                    correctSignature: vexKeySpec(key),
                  },
                },
              },
              accepted: [wanted.join(",")],
              display: signatureText(key, naming, lang),
              reason: `${r.keyHas(
                keyName(key.tonic, "major", naming, lang),
                countText(key, lang),
                signatureText(key, naming, lang),
              )} ${r.signatureOrder(
                key.kind === "diezim" ? SHARPS_WORD[lang] : FLATS_WORD[lang],
                orderText,
              )}`,
              topics: ["writing key signatures"],
            },
          ],
        });
      }
    }

    return questions;
  },
};
