/**
 * Progress lives in one module-level store rather than React state.
 *
 * localStorage can only be read on the client, and reading it into state from
 * an effect is how the first version managed to save an empty record over real
 * progress. An external store hydrates once, on first subscribe, and every
 * consumer sees the same snapshot.
 */
import type { QuestionResult } from "./types";
import { applyResult, emptyProgress, type Progress } from "./progress";
import { importProgress, loadProgress, saveProgress } from "./storage";

export interface Snapshot {
  progress: Progress;
  /** False until localStorage has been read - render dashes, not zeros. */
  ready: boolean;
}

/** Stable identity, shared by the server render and the pre-hydration client. */
const INITIAL: Snapshot = { progress: emptyProgress(), ready: false };

let snapshot: Snapshot = INITIAL;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(progress: Progress) {
  snapshot = { progress, ready: true };
  saveProgress(progress);
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!snapshot.ready) {
    // First subscriber hydrates. Effects only run on the client, so this never
    // touches localStorage during a server render.
    snapshot = { progress: loadProgress(), ready: true };
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return INITIAL;
}

export function recordResult(result: QuestionResult): void {
  set(applyResult(snapshot.progress, result));
}

export function setSetting(key: string, value: string | number | boolean): void {
  set({
    ...snapshot.progress,
    settings: { ...snapshot.progress.settings, [key]: value },
  });
}

export function replaceProgress(json: string): void {
  set(importProgress(json));
}

export function resetProgress(): void {
  set(emptyProgress());
}
