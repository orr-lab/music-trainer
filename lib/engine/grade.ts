import type { AnswerPart, Question, QuestionResult, PartResult } from "./types";
import { matches } from "./normalize";

export function gradePart(part: AnswerPart, given: string): PartResult {
  return { partId: part.id, given, correct: matches(given, part.accepted) };
}

/** Grade a whole question from a map of partId -> raw answer. */
export function gradeQuestion(
  question: Question,
  answers: Record<string, string>,
): QuestionResult {
  const parts = question.parts.map((p) => gradePart(p, answers[p.id] ?? ""));
  const topicResults = question.parts.flatMap((p, i) =>
    (p.topics ?? question.topics).map((topic) => ({
      topic,
      correct: parts[i].correct,
    })),
  );
  return {
    questionId: question.id,
    modeId: question.modeId,
    weight: question.weight,
    parts,
    correct: parts.every((p) => p.correct),
    topicResults,
    answeredAt: Date.now(),
  };
}

/** XP for a result: full weight only when every part landed. */
export function xpFor(result: QuestionResult): number {
  const hit = result.parts.filter((p) => p.correct).length;
  if (hit === 0) return 0;
  return Math.round(20 * result.weight * (hit / result.parts.length));
}
