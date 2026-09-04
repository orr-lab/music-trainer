"use client";

import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { STAFF_COLORS } from "./StaffMedia";
import type { ValueOption } from "@/lib/engine/types";
import { useLang } from "@/components/useLang";

/**
 * Pick a key on the piano.
 *
 * Tapping highlights rather than submits: black keys are narrow, and a mis-tap
 * should not be graded as not knowing the answer.
 */
export function PianoPicker({
  start,
  options,
  value,
  state,
  locked,
  accepted,
  onAnswer,
}: {
  start: number;
  options: ValueOption[];
  value: string | undefined;
  state: "idle" | "correct" | "wrong";
  locked: boolean;
  accepted: string[];
  onAnswer: (value: string) => void;
}) {
  const { t } = useLang();
  const [pending, setPending] = useState<number | null>(null);

  const marks = [{ semitone: start, color: STAFF_COLORS.muted }];
  if (state === "idle") {
    if (pending !== null) {
      marks.push({ semitone: pending, color: STAFF_COLORS.accent });
    }
  } else if (value !== undefined) {
    marks.push({
      semitone: Number(value),
      color: state === "correct" ? STAFF_COLORS.success : STAFF_COLORS.error,
    });
    if (state === "wrong") {
      marks.push({ semitone: Number(accepted[0]), color: STAFF_COLORS.success });
    }
  }

  const selectable = new Set(options.map((o) => o.value));

  return (
    <div className="flex flex-col gap-4">
      <PianoKeyboard
        marks={marks}
        disabled={locked}
        onSelect={(semitone) => {
          if (!locked && selectable.has(semitone)) setPending(semitone);
        }}
      />
      {locked ? null : (
        <button
          type="button"
          disabled={pending === null}
          onClick={() => pending !== null && onAnswer(String(pending))}
          className={`min-h-14 rounded-xl border text-lead ${
            pending === null
              ? "border-line bg-surface text-muted"
              : "border-accent bg-surface text-ink"
          }`}
        >
          {/* Naming the key would hand over the answer. */}
          {pending === null ? t.q.tapKey : t.q.chooseKey}
        </button>
      )}
    </div>
  );
}
