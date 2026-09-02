"use client";

import {
  CIRCLE_POSITIONS,
  countText,
  keyById,
  keyName,
  signatureText,
  tonicSymbol,
  type Naming,
} from "@/lib/data/keys";

const SIZE = 340;
const CENTRE = SIZE / 2;
const MAJOR_RADIUS = 132;
const MAJOR_NODE = 27;
const MINOR_RADIUS = 66;
const MINOR_NODE = 18;

function position(index: number, radius: number) {
  const angle = ((index * 30 - 90) * Math.PI) / 180;
  // Rounded because Node and the browser disagree on the last digit of
  // Math.cos, which is enough to trip a hydration mismatch.
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    x: round(CENTRE + radius * Math.cos(angle)),
    y: round(CENTRE + radius * Math.sin(angle)),
  };
}

/**
 * The circle, as a diagram or as a way of answering.
 *
 * Controlled: whoever uses it owns the selection. The reference page keeps it
 * in state; the drill hands it straight to the engine.
 */
export function CircleOfFifths({
  naming,
  selected,
  onSelect,
  showDetail = true,
  statusFor,
  labels = "all",
}: {
  naming: Naming;
  selected: number | null;
  onSelect: (index: number) => void;
  /** The reference page lists what is at the selected position. */
  showDetail?: boolean;
  /** Marks a position right or wrong once an answer has been graded. */
  statusFor?: (index: number) => "correct" | "wrong" | undefined;
  /**
   * "all" for the reference. "anchor" while a question is open: only do at the
   * top is named, because a fully labelled circle turns "a fifth down" into
   * "one step anticlockwise" and asks nothing about keys.
   */
  labels?: "all" | "anchor";
}) {
  const keys =
    selected === null
      ? []
      : CIRCLE_POSITIONS[selected].ids.map(keyById).filter((k) => k !== undefined);

  return (
    <div className="flex flex-col gap-8">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto w-full max-w-[360px]"
        role="group"
        aria-label="Circle of fifths"
      >
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={MAJOR_RADIUS}
          className="fill-none stroke-line"
          strokeWidth={1}
        />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={MINOR_RADIUS}
          className="fill-none stroke-line"
          strokeWidth={1}
        />

        {CIRCLE_POSITIONS.map((slot, i) => {
          const major = keyById(slot.ids[0]);
          const alt = slot.ids[1] ? keyById(slot.ids[1]) : undefined;
          if (!major) return null;
          const outer = position(i, MAJOR_RADIUS);
          const inner = position(i, MINOR_RADIUS);
          const isSelected = i === selected;
          const named = labels === "all" || i === 0;
          const status = statusFor?.(i);
          const outerFill =
            status === "correct"
              ? "fill-success stroke-success"
              : status === "wrong"
                ? "fill-error stroke-error"
                : isSelected
                  ? "fill-accent stroke-accent"
                  : "fill-surface stroke-line";
          const marked = isSelected || status !== undefined;

          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={keyName(major.tonic, "major", naming)}
              aria-pressed={isSelected}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle
                cx={outer.x}
                cy={outer.y}
                r={MAJOR_NODE}
                className={outerFill}
                strokeWidth={1}
              />
              <text
                x={outer.x}
                y={alt ? outer.y - 1 : outer.y + 4}
                textAnchor="middle"
                className={marked ? "fill-ground" : "fill-ink"}
                style={{ fontSize: 13 }}
              >
                {named ? tonicSymbol(major.tonic, naming) : ""}
              </text>
              {alt ? (
                <text
                  x={outer.x}
                  y={outer.y + 11}
                  textAnchor="middle"
                  className={marked ? "fill-ground" : "fill-muted"}
                  style={{ fontSize: 10 }}
                >
                  {named ? tonicSymbol(alt.tonic, naming) : ""}
                </text>
              ) : null}

              <circle
                cx={inner.x}
                cy={inner.y}
                r={MINOR_NODE}
                className={
                  marked ? "fill-surface stroke-accent" : "fill-ground stroke-line"
                }
                strokeWidth={1}
              />
              <text
                x={inner.x}
                y={inner.y + 4}
                textAnchor="middle"
                className={marked ? "fill-accent" : "fill-muted"}
                style={{ fontSize: 11 }}
              >
                {named ? tonicSymbol(major.relativeMinor, naming) : ""}
              </text>
            </g>
          );
        })}

        <text
          x={CENTRE}
          y={CENTRE - 4}
          opacity={labels === "all" ? 1 : 0.4}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          mazhor
        </text>
        <text
          x={CENTRE}
          y={CENTRE + 12}
          opacity={labels === "all" ? 1 : 0.4}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          minor
        </text>
      </svg>

      {showDetail ? (
      <div className="flex flex-col gap-4">
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4"
          >
            <p className="text-lead">{keyName(key.tonic, "major", naming)}</p>
            <p className="text-content text-muted">
              {countText(key)}
              {key.kind === "none" ? "" : ` · ${signatureText(key, naming)}`}
            </p>
            <p className="text-content text-muted">
              Relative minor: {keyName(key.relativeMinor, "minor", naming)}
            </p>
          </div>
        ))}
        {keys.length > 1 ? (
          <p className="text-content text-muted">
            These two are the same sounding key, spelled two ways.
          </p>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
