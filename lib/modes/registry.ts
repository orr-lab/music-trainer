import type { Mode } from "@/lib/engine/types";
import { buildMode } from "./build";
import { circleNavMode } from "./circle-nav";
import { intervalsMode } from "./intervals";
import { keysMode } from "./keys";
import { notesMode } from "./notes";
import { placeNoteMode } from "./place-note";
import { semitonesMode } from "./semitones";
import { signaturesMode } from "./signatures";
import { writeSignatureMode } from "./write-signature";

/** Every drill mode. A new mode is one entry here plus its own file. */
export const MODES: Mode[] = [
  intervalsMode,
  semitonesMode,
  notesMode,
  placeNoteMode,
  buildMode,
  keysMode,
  signaturesMode,
  writeSignatureMode,
  circleNavMode,
];

export const MIXED_MODE_ID = "all";

/**
 * Everything at once - the default for daily practice.
 *
 * Results still carry each question's own `modeId`, so a mixed session feeds
 * the per-mode stats exactly as a single-mode session would.
 *
 * Each mode gets an equal share of the session rather than a share
 * proportional to how many questions it happens to hold - otherwise the circle
 * of fifths and the interval building, which generate far more questions than
 * the others, would crowd everything else out.
 */
const mixedMode: Mode = {
  id: MIXED_MODE_ID,
  title: "Mixed practice",
  group: "",
  subtitle: "Ta'arovet",
  blurb: "Every mode at once.",
  pool: (settings) =>
    MODES.flatMap((mode) => {
      const questions = mode.pool(settings);
      const share = questions.length > 0 ? 1 / questions.length : 0;
      return questions.map((q) => ({ ...q, selectionBias: share }));
    }),
};

/** Modes in menu order, under their headings. */
export function groupedModes(): { group: string; modes: Mode[] }[] {
  const groups: { group: string; modes: Mode[] }[] = [];
  for (const mode of MODES) {
    const existing = groups.find((g) => g.group === mode.group);
    if (existing) existing.modes.push(mode);
    else groups.push({ group: mode.group, modes: [mode] });
  }
  return groups;
}

export function getMode(id: string): Mode | undefined {
  if (id === MIXED_MODE_ID) return mixedMode;
  return MODES.find((m) => m.id === id);
}
