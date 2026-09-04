"use client";

import { useEffect, useRef } from "react";

const WIDTH = 300;
const HEIGHT = 210;

/** Exported so an overlay can share the same coordinate space. */
export const STAFF_WIDTH = WIDTH;
export const STAFF_HEIGHT = HEIGHT;
/**
 * VexFlow draws the first line about 40px below the stave's y, so this puts the
 * five lines in the middle of the box with equal room for ledger lines above
 * and below.
 */
const STAVE_Y = 45;

/**
 * VexFlow needs literal colours, so these mirror the tokens in globals.css.
 * Change one and change the other.
 */
export const STAFF_COLORS = {
  ink: "#f0f0f4",
  muted: "#8a8a96",
  accent: "#7c5cff",
  success: "#35d07f",
  error: "#ff5a5a",
};

export interface StaffNote {
  /** VexFlow key, e.g. "c/4". */
  key: string;
  color: string;
}

/**
 * VexFlow draws clefs, noteheads and accidentals as text in Bravura, and it
 * starts loading that font asynchronously when the module is imported. Drawing
 * before it arrives silently falls back to the UI font, which renders the clef
 * as a mangled glyph and noteheads as the letter o - so wait for it, once, and
 * share the wait between every staff on the page.
 */
let musicFontReady: Promise<void> | null = null;

function whenMusicFontReady(): Promise<void> {
  musicFontReady ??= (async () => {
    if (typeof document === "undefined" || !document.fonts) return;
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (document.fonts.check("30pt Bravura")) return;
      try {
        await document.fonts.load("30pt Bravura");
      } catch {
        /* not registered yet; the loop tries again */
      }
      if (document.fonts.check("30pt Bravura")) return;
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  })();
  return musicFontReady;
}

export interface StaffGeometry {
  /** y of the top staff line, in viewBox units. */
  topLineY: number;
  /** Distance between staff lines; half of it is one step. */
  spacing: number;
  height: number;
}

/**
 * A staff with one or more notes, drawn by VexFlow.
 *
 * VexFlow is imported dynamically: it is a large library and only the staff
 * modes need it, so it stays out of the initial bundle.
 */
export function StaffMedia({
  clef,
  notes,
  keySignature,
  height = HEIGHT,
  onGeometry,
}: {
  clef: string;
  notes: StaffNote[];
  /** VexFlow key spec, e.g. "Db" - draws the signature after the clef. */
  keySignature?: string;
  /**
   * Box height. The default leaves room for ledger lines either side; a staff
   * that cannot have any - a bare key signature - can be shorter.
   */
  height?: number;
  onGeometry?: (geometry: StaffGeometry) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const report = useRef(onGeometry);
  useEffect(() => {
    report.current = onGeometry;
  }, [onGeometry]);

  // A string key, so re-rendering only happens when the drawing changes.
  const signature = notes.map((n) => `${n.key}:${n.color}`).join("|");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;

    (async () => {
      const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } =
        await import("vexflow");
      await whenMusicFontReady();
      if (cancelled || !host.current) return;

      const drawn = signature
        ? signature.split("|").map((entry) => {
            const [key, color] = entry.split(":");
            return { key, color };
          })
        : [];

      host.current.innerHTML = "";
      const renderer = new Renderer(host.current, Renderer.Backends.SVG);
      renderer.resize(WIDTH, height);
      const ctx = renderer.getContext();

      // The page is near-black; everything VexFlow draws has to be inverted.
      const ink = STAFF_COLORS.ink;
      ctx.setFillStyle(ink);
      ctx.setStrokeStyle(ink);

      const stave = new Stave(4, STAVE_Y, WIDTH - 8);
      stave.addClef(clef);
      if (keySignature) stave.addKeySignature(keySignature);
      stave.setStyle({ fillStyle: ink, strokeStyle: ink });
      stave.setContext(ctx).draw();

      report.current?.({
        topLineY: stave.getYForLine(0),
        spacing: stave.getSpacingBetweenLines(),
        height,
      });

      if (drawn.length > 0) {
        // Whole, half or quarter notes, so the bar is always full.
        const duration =
          drawn.length === 1 ? "w" : drawn.length === 2 ? "h" : "q";
        const beats = drawn.length <= 2 ? 4 : drawn.length;

        const staveNotes = drawn.map((n) => {
          const note = new StaveNote({ keys: [n.key], duration, clef });
          // A key like "f#/4" positions the note but does not draw the sign.
          // Parsed rather than searched: "b/4" is the note B, not a flat.
          const mark = n.key.split("/")[0].slice(1);
          if (mark) note.addModifier(new Accidental(mark), 0);
          note.setStyle({ fillStyle: n.color, strokeStyle: n.color });
          return note;
        });

        const voice = new Voice({ numBeats: beats, beatValue: 4 });
        voice.addTickables(staveNotes);
        const noteArea = stave.getNoteEndX() - stave.getNoteStartX();
        new Formatter().joinVoices([voice]).format([voice], noteArea);
        if (staveNotes.length === 1) {
          // One note left-justifies in its area; nudge it to the middle.
          staveNotes[0].setXShift(noteArea / 2 - 30);
        }
        voice.draw(ctx, stave);
      }

      // Scale to the column width instead of overflowing on a narrow phone.
      const svg = host.current.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${WIDTH} ${height}`);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clef, signature, keySignature, height]);

  return (
    <div
      ref={host}
      role="img"
      aria-label={`A ${clef} staff`}
      // Fixed box: the staff must not resize as it loads, or the answers move.
      className="notation mx-auto w-full max-w-[300px]"
      style={{ height }}
    />
  );
}
