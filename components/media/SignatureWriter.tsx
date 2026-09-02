"use client";

import { useRef, useState } from "react";
import {
  StaffMedia,
  STAFF_COLORS,
  STAFF_WIDTH,
  STAFF_HEIGHT,
  type StaffGeometry,
} from "./StaffMedia";
import { STAFF_LINES, type Clef } from "@/lib/data/notes";
import type { ValueOption } from "@/lib/engine/types";

/** Where the accidentals sit horizontally: just after the clef, evenly spaced. */
const FIRST_X = 58;
const STEP_X = 15;

/**
 * Write a key signature: place each accidental, in order, on the right line.
 *
 * The answer is the whole sequence, so nothing is graded until Done. Undo
 * exists because getting the fourth one wrong should not mean starting over.
 */
export function SignatureWriter({
  clef,
  glyph,
  count,
  correctSignature,
  options,
  value,
  state,
  locked,
  accepted,
  onAnswer,
}: {
  clef: string;
  /** "#" or "b" - which accidental is being written. */
  glyph: string;
  count: number;
  /** VexFlow key spec, drawn as the model answer when this is got wrong. */
  correctSignature: string;
  options: ValueOption[];
  value: string | undefined;
  state: "idle" | "correct" | "wrong";
  locked: boolean;
  accepted: string[];
  onAnswer: (value: string) => void;
}) {
  const [placed, setPlaced] = useState<number[]>([]);
  // State, not a ref: the glyph positions are worked out during render.
  const [geometry, setGeometry] = useState<StaffGeometry | null>(null);
  const surface = useRef<HTMLDivElement>(null);

  const steps = options.map((o) => o.value);
  const min = Math.min(...steps);
  const max = Math.max(...steps);

  const shown = state === "idle" ? placed : (value ?? "").split(",").map(Number);
  const wanted = accepted[0].split(",").map(Number);

  function yFor(step: number): number | null {
    if (!geometry) return null;
    return (
      geometry.topLineY +
      ((STAFF_LINES[clef as Clef].top - step) * geometry.spacing) / 2
    );
  }

  function tap(clientY: number) {
    const box = surface.current?.getBoundingClientRect();
    if (!box || !geometry || placed.length >= count) return;
    const y = ((clientY - box.top) / box.height) * geometry.height;
    const step = Math.round(
      STAFF_LINES[clef as Clef].top -
        ((y - geometry.topLineY) * 2) / geometry.spacing,
    );
    setPlaced([...placed, Math.min(max, Math.max(min, step))]);
  }

  const colorFor = (index: number) => {
    if (state === "idle") return STAFF_COLORS.accent;
    return shown[index] === wanted[index]
      ? STAFF_COLORS.success
      : STAFF_COLORS.error;
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={surface}
        onClick={(e) => !locked && tap(e.clientY)}
        className={`relative mx-auto h-[${STAFF_HEIGHT}px] w-full max-w-[${STAFF_WIDTH}px] ${
          locked ? "" : "cursor-pointer"
        }`}
        style={{ height: STAFF_HEIGHT, maxWidth: STAFF_WIDTH }}
      >
        <StaffMedia
          clef={clef}
          notes={[]}
          onGeometry={(g) =>
            setGeometry((current) =>
              current && current.topLineY === g.topLineY ? current : g,
            )
          }
        />
        <svg
          viewBox={`0 0 ${STAFF_WIDTH} ${STAFF_HEIGHT}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {shown.map((step, i) => {
            const y = yFor(step);
            if (y === null) return null;
            return (
              <text
                key={`${i}-${step}`}
                x={FIRST_X + i * STEP_X}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colorFor(i)}
                style={{ fontSize: 26 }}
              >
                {glyph === "#" ? "♯" : "♭"}
              </text>
            );
          })}
        </svg>
      </div>

      {locked ? null : (
        <>
          <p className="text-center text-content text-muted">
            {placed.length} of {count} placed
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={placed.length === 0}
              onClick={() => setPlaced(placed.slice(0, -1))}
              className={`min-h-14 rounded-xl border bg-surface text-lead ${
                placed.length === 0
                  ? "border-line text-muted"
                  : "border-line text-ink active:border-accent"
              }`}
            >
              Undo
            </button>
            <button
              type="button"
              disabled={placed.length !== count}
              onClick={() => onAnswer(placed.join(","))}
              className={`min-h-14 rounded-xl border bg-surface text-lead ${
                placed.length === count
                  ? "border-accent text-ink"
                  : "border-line text-muted"
              }`}
            >
              Done
            </button>
          </div>
        </>
      )}

      {state === "wrong" ? (
        <div className="flex flex-col gap-2">
          <p className="text-content text-muted">How it should look:</p>
          <StaffMedia
            clef={clef}
            notes={[]}
            keySignature={correctSignature}
            height={120}
          />
        </div>
      ) : null}
    </div>
  );
}
