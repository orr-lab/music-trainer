import type { Mode } from "@/lib/engine/types";
import { intervalsMode } from "./intervals";

/** Every drill mode. A new mode is one entry here plus its own file. */
export const MODES: Mode[] = [intervalsMode];

export function getMode(id: string): Mode | undefined {
  return MODES.find((m) => m.id === id);
}
