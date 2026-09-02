import type { AnswerPart, Question } from "./types";

function shuffled<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function presentPart(part: AnswerPart, rng: () => number): AnswerPart {
  if (!part.shuffle || part.input.kind === "text") return part;
  return {
    ...part,
    input:
      part.input.kind === "choice"
        ? { kind: "choice", options: shuffled(part.input.options, rng) }
        : { kind: "value", options: shuffled(part.input.options, rng) },
  };
}

/**
 * Prepare a question for display. Called once per serving, not per render, so
 * the options stay put while the user is answering.
 */
export function present(
  question: Question,
  rng: () => number = Math.random,
): Question {
  if (!question.parts.some((p) => p.shuffle)) return question;
  return { ...question, parts: question.parts.map((p) => presentPart(p, rng)) };
}
