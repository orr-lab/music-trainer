import type { QuestionResult } from "./types";
import { xpFor } from "./grade";

export const PROGRESS_VERSION = 1;

export interface QuestionStat {
  seen: number;
  correct: number;
  /** Selection multiplier. 3x after a miss, halved per correct, floor 1. */
  boost: number;
  lastSeen: number;
}

export interface ModeStat {
  seen: number;
  correct: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
}

export interface TopicStat {
  seen: number;
  correct: number;
}

export interface Progress {
  version: number;
  xp: number;
  currentStreak: number;
  bestStreak: number;
  modes: Record<string, ModeStat>;
  questions: Record<string, QuestionStat>;
  topics: Record<string, TopicStat>;
  /** YYYY-MM-DD -> answers that day, for the heatmap. */
  days: Record<string, number>;
  dailyStreak: number;
  bestDailyStreak: number;
  lastDay: string | null;
  settings: Record<string, string | number | boolean>;
}

export function emptyProgress(): Progress {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    currentStreak: 0,
    bestStreak: 0,
    modes: {},
    questions: {},
    topics: {},
    days: {},
    dailyStreak: 0,
    bestDailyStreak: 0,
    lastDay: null,
    settings: {},
  };
}

function emptyMode(): ModeStat {
  return { seen: 0, correct: 0, currentStreak: 0, bestStreak: 0, xp: 0 };
}

/** Local-time YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

export const MISS_BOOST = 3;

/** 3x after a miss, halved by each correct answer, back to normal after two. */
export function nextBoost(prev: number, correct: boolean): number {
  if (!correct) return MISS_BOOST;
  return prev <= 1 ? 1 : Math.max(1, prev / 2);
}

/** Fold one graded answer into the progress record. Pure - returns a new object. */
export function applyResult(prev: Progress, result: QuestionResult): Progress {
  const next: Progress = {
    ...prev,
    modes: { ...prev.modes },
    questions: { ...prev.questions },
    topics: { ...prev.topics },
    days: { ...prev.days },
  };

  const gained = xpFor(result);
  next.xp += gained;

  next.currentStreak = result.correct ? prev.currentStreak + 1 : 0;
  next.bestStreak = Math.max(prev.bestStreak, next.currentStreak);

  const mode = { ...(prev.modes[result.modeId] ?? emptyMode()) };
  mode.seen += 1;
  mode.xp += gained;
  if (result.correct) {
    mode.correct += 1;
    mode.currentStreak += 1;
    mode.bestStreak = Math.max(mode.bestStreak, mode.currentStreak);
  } else {
    mode.currentStreak = 0;
  }
  next.modes[result.modeId] = mode;

  const qPrev = prev.questions[result.questionId];
  next.questions[result.questionId] = {
    seen: (qPrev?.seen ?? 0) + 1,
    correct: (qPrev?.correct ?? 0) + (result.correct ? 1 : 0),
    boost: nextBoost(qPrev?.boost ?? 1, result.correct),
    lastSeen: result.answeredAt,
  };

  for (const { topic, correct } of result.topicResults) {
    const t = prev.topics[topic] ?? { seen: 0, correct: 0 };
    next.topics[topic] = {
      seen: t.seen + 1,
      correct: t.correct + (correct ? 1 : 0),
    };
  }

  const today = dayKey(new Date(result.answeredAt));
  next.days[today] = (prev.days[today] ?? 0) + 1;
  if (prev.lastDay !== today) {
    next.dailyStreak =
      prev.lastDay === shiftDay(today, -1) ? prev.dailyStreak + 1 : 1;
    next.lastDay = today;
    next.bestDailyStreak = Math.max(prev.bestDailyStreak, next.dailyStreak);
  }

  return next;
}

/** Daily streak as of now - a stored streak goes stale once a day is skipped. */
export function liveDailyStreak(p: Progress, now: Date = new Date()): number {
  if (!p.lastDay) return 0;
  const today = dayKey(now);
  if (p.lastDay === today || p.lastDay === shiftDay(today, -1)) {
    return p.dailyStreak;
  }
  return 0;
}

export function accuracy(seen: number, correct: number): number {
  return seen === 0 ? 0 : correct / seen;
}

/** Topics sorted worst-first. `minSeen` keeps one unlucky answer off the list. */
export function weakestTopics(
  p: Progress,
  minSeen = 4,
): { topic: string; seen: number; correct: number; accuracy: number }[] {
  return Object.entries(p.topics)
    .filter(([, t]) => t.seen >= minSeen)
    .map(([topic, t]) => ({
      topic,
      seen: t.seen,
      correct: t.correct,
      accuracy: accuracy(t.seen, t.correct),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.seen - a.seen);
}
