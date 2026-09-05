import type { ChoiceOption, Mode, Question, ValueOption } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import type { Lang } from "@/lib/i18n/lang";
import { reasons } from "@/lib/i18n/reasons";
import { copy } from "@/lib/i18n/ui";
import {
  FLATS_WORD,
  NO_ACCIDENTALS,
  SHARPS_WORD,
} from "@/lib/i18n/music";
import {
  FLAT_ORDER,
  KEYS,
  SHARP_ORDER,
  countText,
  keyName,
  signature,
  signatureText,
  tonicName,
  type KeyRow,
  type Naming,
} from "@/lib/data/keys";

export const KEYS_MODE_ID = "keys";

const COUNT_OPTIONS: ValueOption[] = Array.from({ length: 8 }, (_, i) => ({
  value: i,
  label: String(i),
}));

function kindOptions(lang: Lang): ChoiceOption[] {
  return [
    { id: "diezim", label: SHARPS_WORD[lang] },
    { id: "bemolim", label: FLATS_WORD[lang] },
    { id: "none", label: NO_ACCIDENTALS[lang] },
  ];
}

/** More accidentals, more to remember. */
function weightOf(key: KeyRow): number {
  return 1 + 0.1 * key.count;
}

/**
 * Distractors are the key's neighbours on the circle - the ones actually
 * confusable - rather than four keys picked at random.
 */
function neighbours(index: number, howMany: number): KeyRow[] {
  const out: KeyRow[] = [];
  for (let d = 1; out.length < howMany; d++) {
    for (const i of [index - d, index + d]) {
      if (i >= 0 && i < KEYS.length && out.length < howMany) out.push(KEYS[i]);
    }
    if (d > KEYS.length) break;
  }
  return out;
}

function majorOptions(
  index: number,
  naming: Naming,
  lang: Lang,
  mode: "major" | "minor" = "major",
): ChoiceOption[] {
  return [KEYS[index], ...neighbours(index, 3)].map((k) => ({
    id: k.id,
    label:
      mode === "major"
        ? keyName(k.tonic, "major", naming, lang)
        : keyName(k.relativeMinor, "minor", naming, lang),
  }));
}

export const keysMode: Mode = {
  id: KEYS_MODE_ID,
  title: "Circle of fifths",
  group: "Keys and signatures",
  subtitle: "Ma'agal ha-kvintot",
  blurb: "Key signatures, relative minors, and moving by fifths.",
  pool: (raw) => {
    const { naming, lang } = readSettings(raw);
    const t = copy(lang).q;
    const r = reasons(lang);
    const KIND_OPTIONS = kindOptions(lang);
    const questions: Question[] = [];

    KEYS.forEach((key, index) => {
      const major = keyName(key.tonic, "major", naming, lang);
      const minor = keyName(key.relativeMinor, "minor", naming, lang);
      const weight = weightOf(key);

      // 1. How many accidentals, and which kind?
      questions.push({
        id: `keys:count:${key.id}`,
        modeId: KEYS_MODE_ID,
        prompt: major,
        promptSub: t.howManyAccidentals,
        weight,
        topics: ["key signatures"],
        parts: [
          {
            id: "count",
            label: t.howMany,
            input: { kind: "value", options: COUNT_OPTIONS },
            accepted: [String(key.count)],
            display: String(key.count),
            reason: r.keyHas(major, countText(key, lang), signatureText(key, naming, lang)),
            topics: ["key signatures"],
          },
          {
            id: "kind",
            label: t.whichKind,
            input: { kind: "choice", options: KIND_OPTIONS },
            accepted: [key.kind],
            display: KIND_OPTIONS.find((o) => o.id === key.kind)?.label ?? key.kind,
            reason: r.keyHas(major, countText(key, lang), signatureText(key, naming, lang)),
            topics: ["key signatures"],
          },
        ],
      });

      // 2. Which key has this signature? Skipped for C, whose "0" is shared
      // with no one but would still read as a trick question.
      if (key.kind !== "none") {
        questions.push({
          id: `keys:which:${key.id}`,
          modeId: KEYS_MODE_ID,
          prompt: countText(key, lang),
          promptSub: t.whichMajorKey,
          weight,
          topics: ["key signatures"],
          parts: [
            {
              id: "key",
              label: t.keyLabel,
              input: { kind: "choice", options: majorOptions(index, naming, lang) },
              accepted: [key.id],
              display: major,
              reason: r.signatureIs(countText(key, lang), major, signatureText(key, naming, lang)),
              shuffle: true,
              topics: ["key signatures"],
            },
          ],
        });
      }

      // 3. Relative minor, and back again.
      questions.push({
        id: `keys:relminor:${key.id}`,
        modeId: KEYS_MODE_ID,
        prompt: major,
        promptSub: t.relativeMinorQ,
        weight,
        topics: ["relative minor"],
        parts: [
          {
            id: "minor",
            label: t.relativeMinorLabel,
            input: { kind: "choice", options: majorOptions(index, naming, lang, "minor") },
            accepted: [key.id],
            display: minor,
            reason: r.sharesSignature(minor, major, "below"),
            shuffle: true,
            topics: ["relative minor"],
          },
        ],
      });

      questions.push({
        id: `keys:relmajor:${key.id}`,
        modeId: KEYS_MODE_ID,
        prompt: minor,
        promptSub: t.relativeMajorQ,
        weight,
        topics: ["relative minor"],
        parts: [
          {
            id: "major",
            label: t.relativeMajorLabel,
            input: { kind: "choice", options: majorOptions(index, naming, lang) },
            accepted: [key.id],
            display: major,
            reason: r.sharesSignature(major, minor, "above"),
            shuffle: true,
            topics: ["relative minor"],
          },
        ],
      });

      // 4. Move one fifth, in each direction that stays on the circle.
      for (const [step, word] of [
        [1, "up"],
        [-1, "down"],
      ] as const) {
        const up = step === 1 ? "above" : "below";
        const target = KEYS[index + step];
        if (!target) continue;
        questions.push({
          id: `keys:fifth-${word}:${key.id}`,
          modeId: KEYS_MODE_ID,
          prompt: major,
          promptSub: t.moveFifth(word),
          weight,
          topics: ["circle order"],
          parts: [
            {
              id: "target",
              label: t.moveFifth(word),
              input: { kind: "choice", options: majorOptions(index + step, naming, lang) },
              accepted: [target.id],
              display: keyName(target.tonic, "major", naming, lang),
              reason: r.fifthFrom(
                up,
                major,
                keyName(target.tonic, "major", naming, lang),
              ),
              shuffle: true,
              topics: ["circle order"],
            },
          ],
        });
      }

      // 5. Name the accidentals in order. Only worth asking past the first one.
      if (key.count >= 2) {
        const correct = signature(key).map((s) => tonicName(s, naming, lang));
        const swapped = [...correct];
        [swapped[correct.length - 2], swapped[correct.length - 1]] = [
          swapped[correct.length - 1],
          swapped[correct.length - 2],
        ];
        const fullOrder = key.kind === "diezim" ? SHARP_ORDER : FLAT_ORDER;
        const orderText = fullOrder.map((a) => tonicName(a, naming, lang)).join(" ");
        const extra = fullOrder[key.count];
        // Correct, last two swapped, one short, and one too many. Each is a
        // mistake someone actually makes.
        const candidates = [
          correct.join(", "),
          swapped.join(", "),
          correct.slice(0, -1).join(", "),
          extra
            ? [...correct, tonicName(extra, naming, lang)].join(", ")
            : correct.slice(1).join(", "),
        ];
        const options: ChoiceOption[] = [];
        for (const label of candidates) {
          if (!options.some((o) => o.label === label)) {
            options.push({ id: label, label });
          }
        }
        questions.push({
          id: `keys:signature:${key.id}`,
          modeId: KEYS_MODE_ID,
          prompt: major,
          promptSub: t.nameAccidentals,
          weight: weight + 0.3,
          topics: ["accidental order"],
          parts: [
            {
              id: "signature",
              label: t.signatureLabel,
              input: { kind: "choice", options },
              accepted: [correct.join(", ")],
              display: correct.join(", "),
              reason: r.signatureOrder(
                key.kind === "diezim" ? SHARPS_WORD[lang] : FLATS_WORD[lang],
                orderText,
              ),
              shuffle: true,
              topics: ["accidental order"],
            },
          ],
        });
      }
    });

    return questions;
  },
};
