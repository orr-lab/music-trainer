"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  recordResult,
  replaceProgress,
  resetProgress,
  setSetting,
  subscribe,
} from "@/lib/engine/store";

export function useProgress() {
  const { progress, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {
    progress,
    ready,
    record: recordResult,
    setSetting,
    replace: replaceProgress,
    reset: resetProgress,
  };
}
