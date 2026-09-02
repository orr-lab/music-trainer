import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
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
function placeable(clef: Clef): ValueOption[] {
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
    const { naming } = readSettings(raw);
    const questions: Question[] = [];

    for (const key of KEYS) {
      if (key.kind === "none") continue;
      const order = key.kind === "diezim" ? SHARP_ORDER : FLAT_ORDER;
      const orderText = order.map((a) => tonicName(a, naming)).join(" ");

      for (const clef of ["treble", "bass"] as const) {
        const wanted = signatureSteps(key, clef);
        questions.push({
          id: `write-signature:${clef}:${key.id}`,
          modeId: WRITE_SIGNATURE_MODE_ID,
          prompt: keyName(key.tonic, "major", naming),
          promptSub: `write the signature on the ${clef} staff`,
          weight: 1 + 0.15 * key.count,
          topics: ["writing key signatures"],
          parts: [
            {
              id: "signature",
              label: "Signature",
              input: {
                kind: "value",
                options: placeable(clef),
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
              display: signatureText(key, naming),
              reason: `${keyName(key.tonic, "major", naming)} has ${countText(
                key,
              )}: ${signatureText(
                key,
                naming,
              )}. ${key.kind === "diezim" ? "Diezim" : "Bemolim"} always go in this order: ${orderText}.`,
              topics: ["writing key signatures"],
            },
          ],
        });
      }
    }

    return questions;
  },
};
