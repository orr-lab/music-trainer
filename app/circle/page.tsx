"use client";

import Link from "next/link";
import { CircleOfFifths } from "@/components/CircleOfFifths";
import { useProgress } from "@/components/useProgress";
import { readSettings } from "@/lib/engine/settings";

export default function CirclePage() {
  const { progress } = useProgress();
  const { naming } = readSettings(progress.settings);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 p-4 py-12">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lead font-semibold">Ma&apos;agal ha-kvintot</h1>
          <p className="mt-1 text-content text-muted">
            Tap a key. Reference only, nothing here is scored.
          </p>
        </div>
        <Link href="/" className="min-h-12 py-3 pl-4 text-content text-muted">
          Back
        </Link>
      </header>

      <CircleOfFifths naming={naming} />
    </main>
  );
}
