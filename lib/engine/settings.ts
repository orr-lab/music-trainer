import type { ModeSettings } from "./types";

/**
 * User settings. Stored loosely in `progress.settings` so the engine never has
 * to know what any of them mean; modes read them through `readSettings`.
 */
export interface AppSettings {
  /** Note and key names: "sol" / "sol mazhor", or "G" / "G major". */
  naming: "solfege" | "letters";
  /** Which clefs Mode 2 draws from. */
  clefs: "treble" | "bass" | "both";
  /** How far outside the staff Mode 2 goes. */
  staffDifficulty: "easy" | "medium" | "hard";
  /** Tap one of seven names, or type the answer. */
  answerStyle: "buttons" | "typing";
  /** Build an interval by placing it on the staff, or by naming the note. */
  buildStyle: "staff" | "typed";
  /** Whether the mugdal and muktan intervals are in play. */
  intervalSet: "basic" | "full";
  /** Questions in one session. A session that ends is one you can finish. */
  sessionLength: 8 | 12 | 20;
}

export const DEFAULT_SETTINGS: AppSettings = {
  naming: "solfege",
  clefs: "both",
  staffDifficulty: "medium",
  answerStyle: "buttons",
  buildStyle: "staff",
  intervalSet: "full",
  sessionLength: 12,
};

function pick<K extends keyof AppSettings>(
  raw: ModeSettings,
  key: K,
  allowed: readonly AppSettings[K][],
): AppSettings[K] {
  const value = raw[key];
  return allowed.includes(value as AppSettings[K])
    ? (value as AppSettings[K])
    : DEFAULT_SETTINGS[key];
}

export function readSettings(raw: ModeSettings): AppSettings {
  return {
    naming: pick(raw, "naming", ["solfege", "letters"]),
    clefs: pick(raw, "clefs", ["treble", "bass", "both"]),
    staffDifficulty: pick(raw, "staffDifficulty", ["easy", "medium", "hard"]),
    answerStyle: pick(raw, "answerStyle", ["buttons", "typing"]),
    buildStyle: pick(raw, "buildStyle", ["staff", "typed"]),
    intervalSet: pick(raw, "intervalSet", ["basic", "full"]),
    sessionLength: pick(raw, "sessionLength", [8, 12, 20]),
  };
}
