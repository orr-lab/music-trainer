import type { Question } from "./types";
import type { Progress } from "./progress";

/** Unseen questions get a mild nudge so a fresh pool covers itself quickly. */
const UNSEEN_BOOST = 1.6;

export function selectionWeight(q: Question, progress: Progress): number {
  const stat = progress.questions[q.id];
  const boost = stat ? stat.boost : UNSEEN_BOOST;
  return Math.max(0.0001, q.weight * (q.selectionBias ?? 1) * boost);
}

/**
 * Weighted random pick. Missed questions resurface more often.
 *
 * The previous question is excluded, and so is anything sharing its prompt:
 * several questions ask different things about one key, and seeing that key
 * three times running reads as a stutter even though the questions differ.
 */
export function selectQuestion(
  pool: Question[],
  progress: Progress,
  previous?: Question,
  rng: () => number = Math.random,
): Question | null {
  if (pool.length === 0) return null;
  let candidates = pool;
  if (previous && pool.length > 1) {
    candidates = pool.filter((q) => q.id !== previous.id);
    // Where the prompt is the subject - a key, an interval - two questions
    // about it in a row read as a stutter even though they ask different
    // things. Where the subject is a drawing, the prompt is a constant
    // instruction ("Name the note") and says nothing about repetition.
    if (!previous.media) {
      const fresh = candidates.filter(
        (q) => q.media !== undefined || q.prompt !== previous.prompt,
      );
      if (fresh.length > 0) candidates = fresh;
    }
    if (candidates.length === 0) candidates = pool;
  }

  const weights = candidates.map((q) => selectionWeight(q, progress));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
