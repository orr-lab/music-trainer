"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleOfFifths } from "@/components/CircleOfFifths";
import { useLang } from "@/components/useLang";
import { useProgress } from "@/components/useProgress";
import { readSettings } from "@/lib/engine/settings";

export default function CirclePage() {
  const { progress } = useProgress();
  const { naming } = readSettings(progress.settings);
  const { lang, t } = useLang();
  const [selected, setSelected] = useState(0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 p-4 py-12">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lead font-semibold">{t.circleTitle}</h1>
          <p className="mt-1 text-content text-muted">
            {t.circleSubtitle}
          </p>
        </div>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          {t.back}
        </Link>
      </header>

      <CircleOfFifths
        naming={naming}
        lang={lang}
        selected={selected}
        onSelect={setSelected}
      />
    </main>
  );
}
