"use client";

import { useEffect, useRef } from "react";

const WIDTH = 300;
const HEIGHT = 210;
/** Leaves room for three ledger lines either side of the staff. */
const STAVE_Y = 78;

/**
 * One note on a staff, drawn by VexFlow.
 *
 * VexFlow is imported dynamically: it is a large library and nothing outside
 * this mode needs it, so it stays out of the initial bundle.
 */
export function StaffMedia({ clef, note }: { clef: string; note: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;

    (async () => {
      const { Renderer, Stave, StaveNote, Voice, Formatter } = await import(
        "vexflow"
      );
      if (cancelled || !host.current) return;

      host.current.innerHTML = "";
      const renderer = new Renderer(host.current, Renderer.Backends.SVG);
      renderer.resize(WIDTH, HEIGHT);
      const ctx = renderer.getContext();

      // The page is near-black; everything VexFlow draws has to be inverted.
      const ink = "#f0f0f4";
      const style = { fillStyle: ink, strokeStyle: ink };
      ctx.setFillStyle(ink);
      ctx.setStrokeStyle(ink);

      const stave = new Stave(4, STAVE_Y, WIDTH - 8);
      stave.addClef(clef);
      stave.setStyle(style);
      stave.setContext(ctx).draw();

      const staveNote = new StaveNote({ keys: [note], duration: "w", clef });
      staveNote.setStyle(style);
      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.addTickables([staveNote]);
      const noteArea = stave.getNoteEndX() - stave.getNoteStartX();
      new Formatter().joinVoices([voice]).format([voice], noteArea);
      // One note left-justifies in its area; nudge it to the middle instead.
      staveNote.setXShift(noteArea / 2 - 30);
      voice.draw(ctx, stave);

      // Scale to the column width instead of overflowing on a narrow phone.
      const svg = host.current.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clef, note]);

  return (
    <div
      ref={host}
      role="img"
      aria-label={`A note on the ${clef} staff`}
      // Fixed box: the staff must not resize as it loads, or the answers move.
      className="mx-auto h-[210px] w-full max-w-[300px]"
    />
  );
}
