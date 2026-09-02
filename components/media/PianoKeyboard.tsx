"use client";

import {
  BLACK_OFFSETS,
  HIGHEST,
  LOWEST,
  LOW_OCTAVE,
  OCTAVE_COUNT,
  WHITE_OFFSETS,
  isBlack,
} from "@/lib/data/keyboard";
import { STAFF_COLORS } from "./StaffMedia";

const KEY_W = 24;
const WHITE_H = 116;
const BLACK_W = 15;
const BLACK_H = 74;
const LABEL_H = 16;

function whiteKeys(): number[] {
  const keys: number[] = [];
  for (let o = 0; o < OCTAVE_COUNT; o++) {
    for (const offset of WHITE_OFFSETS) keys.push((LOW_OCTAVE + o) * 12 + offset);
  }
  keys.push(HIGHEST);
  return keys;
}

function blackKeys(): number[] {
  const keys: number[] = [];
  for (let o = 0; o < OCTAVE_COUNT; o++) {
    for (const offset of BLACK_OFFSETS) keys.push((LOW_OCTAVE + o) * 12 + offset);
  }
  return keys;
}

const WHITE = whiteKeys();
const BLACK = blackKeys();
const WIDTH = WHITE.length * KEY_W;
const HEIGHT = WHITE_H + LABEL_H;

/** x of a black key: straddling the gap after the white key below it. */
function blackX(semitone: number): number {
  const index = WHITE.indexOf(semitone - 1);
  return (index + 1) * KEY_W - BLACK_W / 2;
}

export interface KeyMark {
  semitone: number;
  color: string;
}

/**
 * Two octaves of piano, for counting semitones on.
 *
 * Marks colour individual keys - the note you start from, the one you pick,
 * the one that was right. When `onSelect` is given the keys are buttons.
 */
export function PianoKeyboard({
  marks,
  onSelect,
  disabled,
}: {
  marks: KeyMark[];
  onSelect?: (semitone: number) => void;
  disabled?: boolean;
}) {
  const colorOf = (semitone: number) =>
    marks.find((m) => m.semitone === semitone)?.color;
  const interactive = onSelect !== undefined && !disabled;

  function key(semitone: number, black: boolean) {
    const mark = colorOf(semitone);
    const x = black ? blackX(semitone) : WHITE.indexOf(semitone) * KEY_W;
    const fill = mark ?? (black ? "#141419" : "#e8e8ee");
    return (
      <rect
        key={semitone}
        x={x}
        y={0}
        width={black ? BLACK_W : KEY_W}
        height={black ? BLACK_H : WHITE_H}
        rx={2}
        fill={fill}
        stroke="#26262e"
        strokeWidth={1}
        onClick={interactive ? () => onSelect?.(semitone) : undefined}
        className={interactive ? "cursor-pointer" : undefined}
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto w-full max-w-[420px]"
      role={interactive ? "group" : "img"}
      aria-label="Piano keyboard"
    >
      {WHITE.map((s) => key(s, false))}
      {BLACK.map((s) => key(s, true))}
      {/* Every C is labelled, so the octave you are in is never a guess. */}
      {WHITE.filter((s) => s % 12 === 0).map((s) => (
        <text
          key={`label-${s}`}
          x={WHITE.indexOf(s) * KEY_W + KEY_W / 2}
          y={HEIGHT - 4}
          textAnchor="middle"
          fill={STAFF_COLORS.ink}
          style={{ fontSize: 10 }}
          opacity={0.55}
        >
          do
        </text>
      ))}
    </svg>
  );
}

export { LOWEST, HIGHEST, isBlack };
