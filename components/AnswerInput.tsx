"use client";

import { useState } from "react";
import type { AnswerPart } from "@/lib/engine/types";
import { matches } from "@/lib/engine/normalize";
import { AnswerMediaView } from "@/components/media";

export type PartState = "idle" | "correct" | "wrong";

interface Props {
  part: AnswerPart;
  value: string | undefined;
  state: PartState;
  locked: boolean;
  /** Digit shown for the first options while this part is the active one. */
  keyHints: boolean;
  onAnswer: (value: string) => void;
}

function optionClasses(args: {
  selected: boolean;
  state: PartState;
  isAnswer: boolean;
}): string {
  const { selected, state, isAnswer } = args;
  const base =
    "flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border px-2 text-lead transition-colors sm:px-4";
  if (state === "idle") {
    return `${base} ${
      selected
        ? "border-accent bg-surface text-ink"
        : "border-line bg-surface text-ink active:border-accent"
    }`;
  }
  if (isAnswer) return `${base} border-success bg-surface text-success`;
  if (selected && state === "wrong")
    return `${base} border-error bg-surface text-error`;
  return `${base} border-line bg-surface text-muted`;
}

function KeyHint({ digit, show }: { digit: number; show: boolean }) {
  if (!show || digit > 9) return null;
  return (
    <span className="hidden rounded border border-line px-1.5 text-content text-muted sm:inline">
      {digit}
    </span>
  );
}

export function AnswerInput({
  part,
  value,
  state,
  locked,
  keyHints,
  onAnswer,
}: Props) {
  // Cleared by remounting: DrillSession keys this component per question.
  const [draft, setDraft] = useState("");

  if (part.input.kind === "text") {
    const border =
      state === "correct"
        ? "border-success text-success"
        : state === "wrong"
          ? "border-error text-error"
          : "border-line text-ink focus:border-accent";
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!locked && draft.trim()) onAnswer(draft);
        }}
      >
        <input
          value={state === "idle" ? draft : (value ?? "")}
          onChange={(e) => setDraft(e.target.value)}
          disabled={locked}
          // Typing mode is opt-in, so raising the keyboard is what was asked for.
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={part.input.placeholder}
          className={`min-h-14 w-full rounded-xl border bg-surface px-4 text-center text-lead outline-none ${border}`}
        />
      </form>
    );
  }

  // Some answers are given by drawing rather than by picking from a list.
  if (part.input.kind === "value" && part.input.render) {
    return (
      <AnswerMediaView
        render={part.input.render}
        options={part.input.options}
        value={value}
        state={state}
        locked={locked}
        accepted={part.accepted}
        onAnswer={onAnswer}
      />
    );
  }

  const options =
    part.input.kind === "choice"
      ? part.input.options.map((o) => ({ key: o.id, label: o.label, value: o.id }))
      : part.input.options.map((o) => ({
          key: String(o.value),
          label: o.label,
          value: String(o.value),
        }));

  /*
   * Long labels get their own row; a handful of short ones (the tone scale,
   * seven note names) go in a grid so the whole question stays on one screen.
   * Driven by the options themselves, so the engine keeps its ignorance.
   */
  const compact =
    options.length > 4 && options.every((o) => o.label.length <= 6);
  const layout = compact
    ? "grid-cols-5 gap-3 sm:grid-cols-7 sm:gap-4"
    : "grid-cols-1 gap-4";

  return (
    <div className={`grid ${layout}`}>
      {options.map((o, i) => (
        <button
          key={o.key}
          type="button"
          disabled={locked}
          onClick={() => onAnswer(o.value)}
          className={optionClasses({
            selected: value === o.value,
            state,
            isAnswer: state !== "idle" && matches(o.value, part.accepted),
          })}
        >
          <KeyHint digit={i + 1} show={keyHints && state === "idle"} />
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
