"use client";

import Link from "next/link";
import { useProgress } from "@/components/useProgress";
import { readSettings } from "@/lib/engine/settings";

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
      <div className="flex flex-col gap-4">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onPick(o.id)}
            className={`min-h-14 w-full rounded-xl border px-4 text-lead ${
              value === o.id
                ? "border-accent bg-surface text-ink"
                : "border-line bg-surface text-muted active:border-accent"
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
  const settings = readSettings(progress.settings);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-12 p-4 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-lead font-semibold">Settings</h1>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          Back
        </Link>
      </header>

      <SettingGroup
        label="Note and key names"
        hint="Used for the staff drill and the circle of fifths. Typed answers accept either system whatever this is set to."
        value={settings.naming}
        options={[
          { id: "solfege", label: "do re mi fa sol la si" },
          { id: "letters", label: "A B C D E F G" },
        ]}
        onPick={(v) => setSetting("naming", v)}
      />

      <SettingGroup
        label="Clefs"
        hint="Which clefs the staff drill asks about."
        value={settings.clefs}
        options={[
          { id: "both", label: "Both" },
          { id: "treble", label: "Treble only" },
          { id: "bass", label: "Bass only" },
        ]}
        onPick={(v) => setSetting("clefs", v)}
      />

      <SettingGroup
        label="Staff difficulty"
        hint="How far outside the staff the notes go."
        value={settings.staffDifficulty}
        options={[
          { id: "easy", label: "Inside the staff" },
          { id: "medium", label: "Up to a ledger line or two" },
          { id: "hard", label: "Several ledger lines" },
        ]}
        onPick={(v) => setSetting("staffDifficulty", v)}
      />

      <SettingGroup
        label="Building intervals"
        hint="Place the second note on the staff, or just name it."
        value={settings.buildStyle}
        options={[
          { id: "staff", label: "Place it on the staff" },
          { id: "typed", label: "Type the note name" },
        ]}
        onPick={(v) => setSetting("buildStyle", v)}
      />

      <SettingGroup
        label="Answering the staff drill"
        hint="Tapping is faster; typing is harder, and better practice."
        value={settings.answerStyle}
        options={[
          { id: "buttons", label: "Tap a name" },
          { id: "typing", label: "Type the name" },
        ]}
        onPick={(v) => setSetting("answerStyle", v)}
      />
    </main>
  );
}
