"use client";

import Link from "next/link";
import { useLang } from "@/components/useLang";
import { useProgress } from "@/components/useProgress";
import { readSettings } from "@/lib/engine/settings";

function columns(options: { label: string }[]): string {
  if (!options.every((o) => o.label.length <= 14)) return "grid-cols-1";
  return options.length === 2 ? "grid-cols-2" : "grid-cols-3";
}

function SettingGroup({
  label,
  hint,
  value,
  options,
  onPick,
}: {
  label: string;
  hint?: string;
  value: string;
  options: { id: string; label: string }[];
  onPick: (id: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-content">{label}</h2>
        {hint ? <p className="mt-1 text-content text-muted">{hint}</p> : null}
      </div>
      {/*
        Short labels sit side by side; long ones need their own row. Written
        out rather than interpolated, because Tailwind only generates the class
        names it can see in the source.
      */}
      <div className={`grid gap-4 ${columns(options)}`}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onPick(o.id)}
            className={`min-h-14 w-full rounded-xl border px-3 text-content transition-colors sm:text-lead ${
              value === o.id
                ? "border-accent bg-surface text-ink"
                : "border-line bg-surface text-muted hover:border-muted hover:text-ink active:border-accent"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { progress, setSetting } = useProgress();
  const { t } = useLang();
  const settings = readSettings(progress.settings);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-12 p-4 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-lead font-semibold">{t.settings}</h1>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          {t.back}
        </Link>
      </header>

      <SettingGroup
        label={t.s.language}
        hint={t.s.languageHint}
        value={settings.lang}
        options={[
          { id: "translit", label: "Ivrit, otiyot lo'aziyot" },
          { id: "he", label: "עברית" },
          { id: "en", label: "English" },
        ]}
        onPick={(v) => setSetting("lang", v)}
      />

      <SettingGroup
        label={t.s.sessionLength}
        hint={t.s.sessionLengthHint}
        value={String(settings.sessionLength)}
        options={[
          { id: "8", label: t.s.questionCount(8) },
          { id: "12", label: t.s.questionCount(12) },
          { id: "20", label: t.s.questionCount(20) },
        ]}
        onPick={(v) => setSetting("sessionLength", Number(v))}
      />

      <SettingGroup
        label={t.s.naming}
        hint={t.s.namingHint}
        value={settings.naming}
        options={[
          { id: "solfege", label: t.s.namingSolfege },
          { id: "letters", label: t.s.namingLetters },
        ]}
        onPick={(v) => setSetting("naming", v)}
      />

      <SettingGroup
        label={t.s.intervalSet}
        hint={t.s.intervalSetHint}
        value={settings.intervalSet}
        options={[
          { id: "full", label: t.s.intervalFull },
          { id: "basic", label: t.s.intervalBasic },
        ]}
        onPick={(v) => setSetting("intervalSet", v)}
      />

      <SettingGroup
        label={t.s.clefs}
        hint={t.s.clefsHint}
        value={settings.clefs}
        options={[
          { id: "both", label: t.s.both },
          { id: "treble", label: t.s.trebleOnly },
          { id: "bass", label: t.s.bassOnly },
        ]}
        onPick={(v) => setSetting("clefs", v)}
      />

      <SettingGroup
        label={t.s.staffDifficulty}
        hint={t.s.staffDifficultyHint}
        value={settings.staffDifficulty}
        options={[
          { id: "easy", label: t.s.onTheLines },
          { id: "medium", label: t.s.oneLedger },
          { id: "hard", label: t.s.fourLedgers },
        ]}
        onPick={(v) => setSetting("staffDifficulty", v)}
      />

      <SettingGroup
        label={t.s.buildStyle}
        hint={t.s.buildStyleHint}
        value={settings.buildStyle}
        options={[
          { id: "staff", label: t.s.placeOnStaff },
          { id: "typed", label: t.s.typeTheName },
        ]}
        onPick={(v) => setSetting("buildStyle", v)}
      />

      <SettingGroup
        label={t.s.answerStyle}
        hint={t.s.answerStyleHint}
        value={settings.answerStyle}
        options={[
          { id: "buttons", label: t.s.tapAName },
          { id: "typing", label: t.s.typeIt },
        ]}
        onPick={(v) => setSetting("answerStyle", v)}
      />
    </main>
  );
}
