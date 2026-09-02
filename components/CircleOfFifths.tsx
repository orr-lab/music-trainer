"use client";

import { useState } from "react";
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

export function CircleOfFifths({ naming }: { naming: Naming }) {
  const [selected, setSelected] = useState(0);
  const keys = CIRCLE_POSITIONS[selected].ids
    .map(keyById)
    .filter((k) => k !== undefined);

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

          return (
            <g
              key={i}
              role="button"
              tabIndex={0}
              aria-label={keyName(major.tonic, "major", naming)}
              aria-pressed={isSelected}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(i);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <circle
                cx={outer.x}
                cy={outer.y}
                r={MAJOR_NODE}
                className={
                  isSelected
                    ? "fill-accent stroke-accent"
                    : "fill-surface stroke-line"
                }
                strokeWidth={1}
              />
              <text
                x={outer.x}
                y={alt ? outer.y - 1 : outer.y + 4}
                textAnchor="middle"
                className={isSelected ? "fill-ground" : "fill-ink"}
                style={{ fontSize: 13 }}
              >
                {tonicSymbol(major.tonic, naming)}
              </text>
              {alt ? (
                <text
                  x={outer.x}
                  y={outer.y + 11}
                  textAnchor="middle"
                  className={isSelected ? "fill-ground" : "fill-muted"}
                  style={{ fontSize: 10 }}
                >
                  {tonicSymbol(alt.tonic, naming)}
                </text>
              ) : null}

              <circle
                cx={inner.x}
                cy={inner.y}
                r={MINOR_NODE}
                className={
                  isSelected
                    ? "fill-surface stroke-accent"
                    : "fill-ground stroke-line"
                }
                strokeWidth={1}
              />
              <text
                x={inner.x}
                y={inner.y + 4}
                textAnchor="middle"
                className={isSelected ? "fill-accent" : "fill-muted"}
                style={{ fontSize: 11 }}
              >
                {tonicSymbol(major.relativeMinor, naming)}
              </text>
            </g>
          );
        })}

        <text
          x={CENTRE}
          y={CENTRE - 4}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          mazhor
        </text>
        <text
          x={CENTRE}
          y={CENTRE + 12}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          minor
        </text>
      </svg>

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
    </div>
  );
}
