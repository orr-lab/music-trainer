"use client";

import Link from "next/link";
import { useLang } from "@/components/useLang";
import { useProgress } from "@/components/useProgress";
import { accuracy, liveDailyStreak } from "@/lib/engine/progress";

/** The topic that went wrong most often, if one stands out. */
function weakest(misses: string[]): string | null {
  if (misses.length === 0) return null;
  const counts = new Map<string, number>();
  for (const topic of misses) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-lead text-ink">{value}</span>
      <span className="text-content text-muted">{label}</span>
    </div>
  );
}

/**
 * The end of a session.
 *
 * A drill with no end never gets finished, only abandoned - so this is the
 * point of the whole session length: somewhere to arrive.
 */
export function SessionComplete({
  asked,
  correct,
  xp,
  misses,
  onAgain,
}: {
  asked: number;
  correct: number;
  xp: number;
  misses: string[];
  onAgain: () => void;
}) {
  const { progress } = useProgress();
  const { t } = useLang();
  const percent = Math.round(accuracy(asked, correct) * 100);
  const weak = weakest(misses);

  const verdict = t.sessionVerdict(percent);

  return (
    <div className="animate-rise flex flex-1 flex-col justify-center gap-12 py-12">
      <div className="text-center">
        <h1 className="text-display font-semibold tracking-tight">
          {correct}/{asked}
        </h1>
        <p className="mt-4 text-content text-muted">{verdict}</p>
      </div>

      <section className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface p-4">
        <Figure value={`${percent}%`} label={t.thisRound} />
        <Figure value={`+${xp}`} label={t.xp} />
        <Figure
          value={String(liveDailyStreak(progress))}
          label={t.dayStreak}
        />
      </section>

      {weak ? (
        <p className="text-center text-content text-muted">{t.mostTrouble(weak)}</p>
      ) : null}

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onAgain}
          className="min-h-14 rounded-xl border border-accent bg-surface text-lead text-ink transition-colors hover:bg-line/40"
        >
          {t.anotherRound}
        </button>
        <Link
          href="/"
          className="flex min-h-14 items-center justify-center rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted"
        >
          {t.doneForNow}
        </Link>
      </div>
    </div>
  );
}
