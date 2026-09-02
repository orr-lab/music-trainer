"use client";

import { dayKey, shiftDay } from "@/lib/engine/progress";

const WEEKS = 12;

/** Accent at four opacities - the palette has no second color to spend. */
function level(count: number): string {
  if (count === 0) return "bg-line";
  if (count < 5) return "bg-accent/30";
  if (count < 15) return "bg-accent/60";
  return "bg-accent";
}

export function Heatmap({ days }: { days: Record<string, number> }) {
  const today = dayKey();
  // A rolling window ending today; columns are weeks, not calendar weeks.
  const start = shiftDay(today, -(WEEKS * 7 - 1));
  const cells: { key: string; count: number }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const key = shiftDay(start, i);
    cells.push({ key, count: days[key] ?? 0 });
  }

  return (
    <div className="flex gap-1 overflow-x-auto">
      {Array.from({ length: WEEKS }, (_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {cells.slice(w * 7, w * 7 + 7).map((c) => (
            <div
              key={c.key}
              title={`${c.key}: ${c.count}`}
              className={`h-4 w-4 rounded-sm ${level(c.count)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
