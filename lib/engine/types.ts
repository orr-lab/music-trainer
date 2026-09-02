/**
 * The generic question engine.
 *
 * Nothing in this file knows anything about music. A mode produces `Question`
 * objects; scoring, streaks, stats and repetition consume them. Adding a mode
 * means adding a generator, never editing the engine.
 */

/** How the user supplies one answer part. */
export type AnswerInput =
  /** Pick one label from a list. */
  | { kind: "choice"; options: ChoiceOption[] }
  /**
   * Pick one discrete value from an ordered scale (the tone values, a position
   * on a staff). `render` names a custom renderer for the choice; the engine
   * never looks inside it.
   */
  | { kind: "value"; options: ValueOption[]; render?: Media }
  /** Type an answer; graded against `accepted` after normalization. */
  | { kind: "text"; placeholder?: string };

export interface ChoiceOption {
  /** Stable id, also the value compared against `accepted`. */
  id: string;
  label: string;
}

export interface ValueOption {
  /** Numeric value, stringified for comparison against `accepted`. */
  value: number;
  label: string;
}

/** One thing the user has to answer. A question may have several. */
export interface AnswerPart {
  id: string;
  /** Short label above the input, e.g. "Tones". */
  label: string;
  input: AnswerInput;
  /**
   * Every answer that counts as correct, already normalized.
   * More than one entry means genuine alternatives (kvarta zaka's two
   * classifications, "sol" and "g" for the same note) - not typo tolerance,
   * which normalization handles.
   */
  accepted: string[];
  /** Canonical answer shown in feedback. */
  display: string;
  /** One line explaining why, shown on a wrong answer. */
  reason?: string;
  /** Overrides the question's topics for stats purposes. */
  topics?: string[];
  /**
   * Shuffle the options each time the question is served. Set it where a fixed
   * order would let the answer be memorised by position; leave it off where a
   * stable order makes drilling faster (an ascending scale, a fixed triad of
   * classifications).
   */
  shuffle?: boolean;
}

/**
 * Something for the UI to draw - as a question's prompt, or as the way an
 * answer is given. The engine treats this as opaque: the UI keeps a registry of
 * renderers by `kind`, so a mode can show a staff, a diagram or anything else
 * without the engine learning what those are.
 */
export interface Media {
  kind: string;
  payload: Record<string, string | number | boolean>;
}

export interface Question {
  /** Stable across sessions - the repetition system keys off it. */
  id: string;
  modeId: string;
  prompt: string;
  promptSub?: string;
  media?: Media;
  parts: AnswerPart[];
  /** Difficulty weight, scales XP and base selection frequency. */
  weight: number;
  /**
   * Scales how often the question is picked, without touching what it is worth.
   * Used by the mixed pool to give each mode an equal share of a session
   * regardless of how many questions it happens to contain.
   */
  selectionBias?: number;
  topics: string[];
}

/** A drill mode: a title and a finite pool of questions. */
export interface Mode {
  id: string;
  title: string;
  /** Transliterated name, shown as the subtitle. */
  subtitle: string;
  blurb: string;
  /** The complete question pool. Called once per session. */
  pool: (settings: ModeSettings) => Question[];
}

/** Per-mode settings bag. Modes read the keys they care about. */
export type ModeSettings = Record<string, string | number | boolean>;

/** What the user submitted for one part, and whether it was right. */
export interface PartResult {
  partId: string;
  given: string;
  correct: boolean;
}

export interface QuestionResult {
  questionId: string;
  modeId: string;
  weight: number;
  parts: PartResult[];
  /** True only when every part is correct. */
  correct: boolean;
  /** Topics touched, per part, for the weakest-topics panel. */
  topicResults: { topic: string; correct: boolean }[];
  answeredAt: number;
}
