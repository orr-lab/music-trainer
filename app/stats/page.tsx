"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Heatmap } from "@/components/Heatmap";
import { useLang } from "@/components/useLang";
import { useProgress } from "@/components/useProgress";
import {
  accuracy,
  liveDailyStreak,
  weakestTopics,
} from "@/lib/engine/progress";
import { exportProgress } from "@/lib/engine/storage";
import { modeName } from "@/lib/i18n/music";
import { MODES } from "@/lib/modes/registry";

export default function StatsPage() {
  const { progress, ready, replace, reset } = useProgress();
  const { lang, t } = useLang();
  const tc = t;
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
      setNote(t.imported);
    } catch {
      setNote(t.importFailed);
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
        <h1 className="text-lead font-semibold">{t.stats}</h1>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          {t.back}
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-surface p-4">
        <div>
          <p className="text-lead">{ready ? progress.xp : "—"}</p>
          <p className="text-content text-muted">{t.xp}</p>
        </div>
        <div>
          <p className="text-lead">{ready ? liveDailyStreak(progress) : "—"}</p>
          <p className="text-content text-muted">{t.dayStreak}</p>
        </div>
        <div>
          <p className="text-lead">
            {ready ? `${Math.round(accuracy(totals.seen, totals.correct) * 100)}%` : "—"}
          </p>
          <p className="text-content text-muted">{t.accuracy}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">{t.lastWeeks}</h2>
        <Heatmap days={progress.days} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">{t.modes}</h2>
        {MODES.map((mode) => {
          const s = progress.modes[mode.id];
          return (
            <div
              key={mode.id}
              className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <span className="text-content text-ink">{modeName(mode.id, lang)}</span>
              <span className="shrink-0 text-content text-muted">
                {s
                  ? t.ofSeen(Math.round(accuracy(s.seen, s.correct) * 100), s.seen)
                  : t.notStarted}
              </span>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">{t.weakestTopics}</h2>
        {weak.length === 0 ? (
          <p className="text-content text-muted">
            {t.weakestEmpty}
          </p>
        ) : (
          weak.slice(0, 5).map((topic) => (
            <div
              key={topic.topic}
              className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3"
            >
              <span className="text-content text-ink">{topic.topic}</span>
              <span className="text-content text-muted">
                {tc.ofSeen(Math.round(topic.accuracy * 100), topic.seen)}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-content text-muted">{t.progressData}</h2>
        <button
          type="button"
          onClick={download}
          className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
        >
          {t.exportJson}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="min-h-14 rounded-xl border border-line bg-surface text-lead transition-colors hover:border-muted active:border-accent"
        >
          {t.importJson}
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
              setNote(t.erased);
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
          {confirming ? t.resetConfirm : t.resetEverything}
        </button>
        {note ? <p className="text-content text-muted">{note}</p> : null}
      </section>
    </main>
  );
}
