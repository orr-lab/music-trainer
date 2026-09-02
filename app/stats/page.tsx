"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { useProgress } from "@/components/useProgress";
import {
  accuracy,
  liveDailyStreak,
  weakestTopics,
} from "@/lib/engine/progress";
import { exportProgress } from "@/lib/engine/storage";
import { MODES } from "@/lib/modes/registry";

export default function StatsPage() {
  const { progress, ready, replace, reset } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function download() {
    const blob = new Blob([exportProgress(progress)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `music-trainer-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    try {
      replace(await file.text());
      setNote("Progress imported.");
    } catch {
      setNote("That file could not be read as progress JSON.");
    }
  }

  const weak = weakestTopics(progress);
  const totals = Object.values(progress.modes).reduce(
    (a, m) => ({ seen: a.seen + m.seen, correct: a.correct + m.correct }),
    { seen: 0, correct: 0 },
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-12 p-4 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-lead font-semibold">Stats</h1>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          Back
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface p-4">
        <div>
          <p className="text-lead">{ready ? progress.xp : "—"}</p>
          <p className="text-content text-muted">XP</p>
        </div>
        <div>
          <p className="text-lead">{ready ? liveDailyStreak(progress) : "—"}</p>
          <p className="text-content text-muted">Day streak</p>
        </div>
        <div>
          <p className="text-lead">
            {ready ? `${Math.round(accuracy(totals.seen, totals.correct) * 100)}%` : "—"}
          </p>
          <p className="text-content text-muted">Accuracy</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">Last 12 weeks</h2>
        <Heatmap days={progress.days} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">Modes</h2>
        {MODES.map((mode) => {
          const s = progress.modes[mode.id];
          return (
            <div
              key={mode.id}
              className="flex items-baseline justify-between rounded-xl border border-line bg-surface p-4"
            >
              <span className="text-lead">{mode.subtitle}</span>
              <span className="text-content text-muted">
                {s
                  ? `${Math.round(accuracy(s.seen, s.correct) * 100)}% of ${s.seen} · best ${s.bestStreak}`
                  : "no answers yet"}
              </span>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">Weakest topics</h2>
        {weak.length === 0 ? (
          <p className="text-content text-muted">
            Answer a few more questions and the weak spots show up here.
          </p>
        ) : (
          weak.slice(0, 5).map((t) => (
            <div
              key={t.topic}
              className="flex items-baseline justify-between rounded-xl border border-line bg-surface p-4"
            >
              <span className="text-content">{t.topic}</span>
              <span className="text-content text-muted">
                {Math.round(t.accuracy * 100)}% of {t.seen}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">Progress data</h2>
        <button
          type="button"
          onClick={download}
          className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
        >
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
        {/* Two taps rather than a browser dialog - no modals anywhere. */}
        <button
          type="button"
          onClick={() => {
            if (confirming) {
              reset();
              setConfirming(false);
              setNote("Progress erased.");
            } else {
              setConfirming(true);
              setNote(null);
            }
          }}
          onBlur={() => setConfirming(false)}
          className={`min-h-14 rounded-xl border bg-surface text-lead text-error ${
            confirming ? "border-error" : "border-line active:border-error"
          }`}
        >
          {confirming ? "Tap again to erase everything" : "Reset everything"}
        </button>
        {note ? <p className="text-content text-muted">{note}</p> : null}
      </section>
    </main>
  );
}
