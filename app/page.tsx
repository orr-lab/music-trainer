"use client";

import Link from "next/link";
import { useProgress } from "@/components/useProgress";
import { accuracy, liveDailyStreak } from "@/lib/engine/progress";
import { MODES } from "@/lib/modes/registry";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-lead text-ink">{value}</span>
      <span className="text-content text-muted">{label}</span>
    </div>
  );
}

export default function Home() {
  const { progress, ready } = useProgress();
  const show = (v: number | string) => (ready ? String(v) : "—");

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-12 p-4 py-12">
      <header>
        <h1 className="text-lead font-semibold">Music Trainer</h1>
        <p className="mt-1 text-content text-muted">
          Teoriya - Bagrut 5 yechidot
        </p>
      </header>

      <section className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface p-4">
        <Stat label="XP" value={show(progress.xp)} />
        <Stat
          label="Day streak"
          value={show(liveDailyStreak(progress))}
        />
        <Stat label="Best streak" value={show(progress.bestStreak)} />
      </section>

      <section className="flex flex-col gap-4">
        {MODES.map((mode) => {
          const stat = progress.modes[mode.id];
          const acc = stat ? Math.round(accuracy(stat.seen, stat.correct) * 100) : 0;
          return (
            <Link
              key={mode.id}
              href={`/drill/${mode.id}`}
              className="flex min-h-14 flex-col gap-1 rounded-xl border border-line bg-surface p-4 active:border-accent"
            >
              <span className="text-lead">{mode.subtitle}</span>
              <span className="text-content text-muted">{mode.blurb}</span>
              <span className="mt-2 text-content text-muted">
                {ready && stat
                  ? `${stat.seen} answered · ${acc}% · streak ${stat.currentStreak}`
                  : "Not started"}
              </span>
            </Link>
          );
        })}
      </section>

      <nav className="flex flex-col gap-4">
        <Link
          href="/stats"
          className="flex min-h-14 items-center justify-center rounded-xl border border-line bg-surface text-lead active:border-accent"
        >
          Stats
        </Link>
      </nav>
    </main>
  );
}
