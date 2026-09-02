import type { Mode } from "@/lib/engine/types";
import { intervalsMode } from "./intervals";
import { keysMode } from "./keys";
import { notesMode } from "./notes";

/** Every drill mode. A new mode is one entry here plus its own file. */
export const MODES: Mode[] = [intervalsMode, notesMode, keysMode];

export const MIXED_MODE_ID = "all";

/**
 * Everything at once - the default for daily practice.
 *
 * Results still carry each question's own `modeId`, so a mixed session feeds
 * the per-mode stats exactly as a single-mode session would.
 */
const mixedMode: Mode = {
  id: MIXED_MODE_ID,
  title: "Mixed practice",
  subtitle: "Ta'arovet",
  blurb: "Every mode at once.",
  pool: (settings) => MODES.flatMap((m) => m.pool(settings)),
};

export function getMode(id: string): Mode | undefined {
  if (id === MIXED_MODE_ID) return mixedMode;
  return MODES.find((m) => m.id === id);
}
