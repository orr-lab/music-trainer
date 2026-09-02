"use client";

import { useEffect, useRef, useState } from "react";
import { StaffMedia, STAFF_COLORS, type StaffGeometry } from "./StaffMedia";
import { SCALE_ORDER, STAFF_LINES, type Clef } from "@/lib/data/notes";
import type { ValueOption } from "@/lib/engine/types";

function keyForStep(step: number): string {
  return `${SCALE_ORDER[((step % 7) + 7) % 7]}/${Math.floor(step / 7)}`;
}

function stepForKey(key: string): number {
  const [letter, octave] = key.split("/");
  return Number(octave) * 7 + SCALE_ORDER.indexOf(letter as never);
}

/**
 * Place a note on the staff.
 *
 * Tapping snaps to the nearest line or space, which on a phone is too coarse to
 * trust on its own - so the arrows move it a step at a time and nothing is
 * submitted until Place is pressed. The note is drawn where it will land, so
 * the answer is visible before it is committed.
 */
export function StaffPicker({
  clef,
  given,
  options,
  value,
  state,
  locked,
  accepted,
  onAnswer,
}: {
  clef: string;
  /** The note already on the staff, if the question supplies one. */
  given?: string;
  options: ValueOption[];
  value: string | undefined;
  state: "idle" | "correct" | "wrong";
  locked: boolean;
  accepted: string[];
  onAnswer: (value: string) => void;
}) {
  const steps = options.map((o) => o.value);
  const min = Math.min(...steps);
  const max = Math.max(...steps);
  // With nothing on the staff to start from, the arrows begin in the middle.
  const origin = given ? stepForKey(given) : Math.round((min + max) / 2);

  const [pending, setPending] = useState<number | null>(null);
  const geometry = useRef<StaffGeometry | null>(null);
  const surface = useRef<HTMLDivElement>(null);

  const clamp = (step: number) => Math.min(max, Math.max(min, step));
  const move = (delta: number) =>
    setPending((current) => clamp((current ?? origin) + delta));

  // Arrow keys move the note, Enter places it.
  useEffect(() => {
    if (locked) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter" && pending !== null) {
        e.preventDefault();
        onAnswer(String(pending));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, pending, onAnswer]);

  function tap(clientY: number) {
    const box = surface.current?.getBoundingClientRect();
    const g = geometry.current;
    if (!box || !g) return;
    const y = ((clientY - box.top) / box.height) * g.height;
    const topStep = STAFF_LINES[clef as Clef].top;
    // Half a line spacing is one step, and y grows downwards.
    setPending(clamp(Math.round(topStep - ((y - g.topLineY) * 2) / g.spacing)));
  }

  const chosen = value !== undefined ? Number(value) : null;
  const correct = Number(accepted[0]);

  const notes = given ? [{ key: given, color: STAFF_COLORS.ink }] : [];
  if (state === "idle") {
    if (pending !== null) {
      notes.push({ key: keyForStep(pending), color: STAFF_COLORS.accent });
    }
  } else if (chosen !== null) {
    notes.push({
      key: keyForStep(chosen),
      color: state === "correct" ? STAFF_COLORS.success : STAFF_COLORS.error,
    });
    if (state === "wrong") {
      notes.push({ key: keyForStep(correct), color: STAFF_COLORS.success });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={surface}
        onClick={(e) => !locked && tap(e.clientY)}
        className={locked ? "" : "cursor-pointer"}
      >
        <StaffMedia
          clef={clef}
          notes={notes}
          onGeometry={(g) => {
            geometry.current = g;
          }}
        />
      </div>

      {locked ? null : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Move the note up one step"
              className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
            >
              &uarr; Up
            </button>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Move the note down one step"
              className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
            >
              &darr; Down
            </button>
          </div>
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
            {/* Never name the pending note: reading it back is the exercise. */}
            {pending === null ? "Tap the staff to place a note" : "Place it here"}
          </button>
        </>
      )}
    </div>
  );
}
