import type { Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import {
  CIRCLE_POSITIONS,
  countText,
  keyById,
  keyName,
  tonicSymbol,
} from "@/lib/data/keys";

export const CIRCLE_NAV_MODE_ID = "circle-nav";

export const circleNavMode: Mode = {
  id: CIRCLE_NAV_MODE_ID,
  title: "Finding keys on the circle",
  group: "Keys and signatures",
  subtitle: "Nivut ba-ma'agal",
  blurb: "Point at the key on the circle itself.",
  pool: (raw) => {
    const { naming } = readSettings(raw);
    const questions: Question[] = [];

    const positions: ValueOption[] = CIRCLE_POSITIONS.map((slot, i) => {
      const key = keyById(slot.ids[0]);
      return { value: i, label: key ? tonicSymbol(key.tonic, naming) : String(i) };
    });

    const render = { kind: "circle-picker", payload: { naming } };

    CIRCLE_POSITIONS.forEach((slot, index) => {
      const key = keyById(slot.ids[0]);
      if (!key) return;
      const here = keyName(key.tonic, "major", naming);

      for (const [step, word] of [
        [1, "up"],
        [-1, "down"],
      ] as const) {
        const targetIndex = (index + step + 12) % 12;
        const target = keyById(CIRCLE_POSITIONS[targetIndex].ids[0]);
        if (!target) continue;
        const targetName = keyName(target.tonic, "major", naming);

        questions.push({
          id: `circle-nav:fifth-${word}:${key.id}`,
          modeId: CIRCLE_NAV_MODE_ID,
          prompt: here,
          promptSub: `tap the key a fifth ${word}`,
          weight: 1 + 0.1 * key.count,
          topics: ["finding keys on the circle"],
          parts: [
            {
              id: "position",
              label: "Position",
              input: { kind: "value", options: positions, render },
              accepted: [String(targetIndex)],
              display: targetName,
              reason: `A fifth ${word} from ${here} is ${targetName} - one step ${
                step === 1 ? "clockwise" : "anticlockwise"
              } round the circle.`,
              topics: ["finding keys on the circle"],
            },
          ],
        });
      }

      // Both spellings of an enharmonic position get asked; they land in the
      // same place, which is the point.
      for (const id of slot.ids) {
        const spelling = keyById(id);
        if (!spelling) continue;
        questions.push({
          id: `circle-nav:signature:${spelling.id}`,
          modeId: CIRCLE_NAV_MODE_ID,
          prompt: countText(spelling),
          promptSub: "tap the major key with this signature",
          weight: 1 + 0.1 * spelling.count,
          topics: ["finding keys on the circle"],
          parts: [
            {
              id: "position",
              label: "Position",
              input: { kind: "value", options: positions, render },
              accepted: [String(index)],
              display: keyName(spelling.tonic, "major", naming),
              reason: `${countText(spelling)} is ${keyName(
                spelling.tonic,
                "major",
                naming,
              )}, ${index === 0 ? "at the top of the circle" : `${index} ${
                index === 1 ? "step" : "steps"
              } clockwise from do mazhor`}.`,
              topics: ["finding keys on the circle"],
            },
          ],
        });
      }
    });

    return questions;
  },
};
