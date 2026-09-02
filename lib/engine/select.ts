import type { Question } from "./types";
import type { Progress } from "./progress";

/** Unseen questions get a mild nudge so a fresh pool covers itself quickly. */
const UNSEEN_BOOST = 1.6;

export function selectionWeight(q: Question, progress: Progress): number {
  const stat = progress.questions[q.id];
  const boost = stat ? stat.boost : UNSEEN_BOOST;
  return Math.max(0.01, q.weight * boost);
}

/**
 * Weighted random pick. Missed questions resurface more often; the previous
 * question is excluded so nothing repeats back to back.
 */
export function selectQuestion(
  pool: Question[],
  progress: Progress,
  previousId?: string,
  rng: () => number = Math.random,
): Question | null {
  if (pool.length === 0) return null;
  const candidates =
    pool.length > 1 ? pool.filter((q) => q.id !== previousId) : pool;

  const weights = candidates.map((q) => selectionWeight(q, progress));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}
