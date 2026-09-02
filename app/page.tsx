"use client";

import Link from "next/link";
import { useProgress } from "@/components/useProgress";
import {
  accuracy,
  answeredToday,
  liveDailyStreak,
} from "@/lib/engine/progress";
import { readSettings } from "@/lib/engine/settings";
import { MIXED_MODE_ID, groupedModes } from "@/lib/modes/registry";

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
  const goal = readSettings(progress.settings).sessionLength;
  const today = answeredToday(progress);
  const streak = liveDailyStreak(progress);
  const done = today >= goal;
  const show = (v: number | string) => (ready ? String(v) : "—");

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-12 p-4 py-12">
      <header className="flex items-baseline justify-between">
        <h1 className="text-lead font-semibold">Music Trainer</h1>
        <span className="text-content text-muted">Bagrut 5 yechidot</span>
      </header>

      {/*
        One thing to do. Everything else on this screen is a detour, so it is
        the only element that looks like a button.
      */}
      <section className="flex flex-col gap-4">
        <Link
          href={`/drill/${MIXED_MODE_ID}`}
          className="flex min-h-16 items-center justify-center rounded-xl bg-accent px-4 text-lead font-semibold text-ground transition-opacity hover:opacity-90"
        >
          {done ? "Another round" : "Practise"}
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={Math.min(today, goal)}
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-label="Today's practice"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{
                width: `${ready ? Math.min(100, (today / goal) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="text-content text-muted">
            {!ready
              ? "—"
              : done
                ? `Done today · ${streak}-day streak`
                : `${today} of ${goal} today`}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface p-4">
        <Stat label="XP" value={show(progress.xp)} />
        <Stat label="Day streak" value={show(streak)} />
        <Stat label="Best run" value={show(progress.bestStreak)} />
      </section>

      {/*
        One row per mode rather than a card: nine cards is a wall, and the list
        is for choosing, not for reading.
      */}
      {groupedModes().map(({ group, modes }) => (
        <section key={group} className="flex flex-col gap-2">
          <h2 className="mb-2 text-content text-muted">{group}</h2>
          {modes.map((mode) => {
            const stat = progress.modes[mode.id];
            return (
              <Link
                key={mode.id}
                href={`/drill/${mode.id}`}
                className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-muted active:border-accent"
              >
                <span className="text-content text-ink">{mode.subtitle}</span>
                <span className="shrink-0 text-content text-muted">
                  {ready && stat
                    ? `${Math.round(accuracy(stat.seen, stat.correct) * 100)}%`
                    : "new"}
                </span>
              </Link>
            );
          })}
        </section>
      ))}

      <nav className="flex gap-4 text-content text-muted">
        <Link href="/circle" className="py-3 transition-colors hover:text-ink">
          Circle
        </Link>
        <Link href="/stats" className="py-3 transition-colors hover:text-ink">
          Stats
        </Link>
        <Link href="/settings" className="py-3 transition-colors hover:text-ink">
          Settings
        </Link>
      </nav>
    </main>
  );
}
