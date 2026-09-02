import { emptyProgress, PROGRESS_VERSION, type Progress } from "./progress";

const KEY = "music-trainer:progress:v1";

export function loadProgress(): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* quota or private mode - drilling still works, just unsaved */
  }
}

/** Fill in anything a older or hand-edited file is missing. */
export function migrate(raw: unknown): Progress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Progress>;
  return {
    ...base,
    ...p,
    version: PROGRESS_VERSION,
    modes: { ...base.modes, ...(p.modes ?? {}) },
    questions: { ...base.questions, ...(p.questions ?? {}) },
    topics: { ...base.topics, ...(p.topics ?? {}) },
    days: { ...base.days, ...(p.days ?? {}) },
    settings: { ...base.settings, ...(p.settings ?? {}) },
  };
}

export function exportProgress(p: Progress): string {
  return JSON.stringify(p, null, 2);
}

export function importProgress(json: string): Progress {
  return migrate(JSON.parse(json));
}
