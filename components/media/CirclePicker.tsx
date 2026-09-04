"use client";

import { CircleOfFifths } from "@/components/CircleOfFifths";
import type { Naming } from "@/lib/data/keys";
import type { Lang } from "@/lib/i18n/lang";

/**
 * Answer by pointing at the circle.
 *
 * Twelve positions instead of four names, so there is nothing to eliminate -
 * you either know where the key sits or you do not. The targets are large, so
 * a tap commits straight away.
 */
export function CirclePicker({
  naming,
  lang,
  value,
  state,
  locked,
  accepted,
  onAnswer,
}: {
  naming: Naming;
  lang: Lang;
  value: string | undefined;
  state: "idle" | "correct" | "wrong";
  locked: boolean;
  accepted: string[];
  onAnswer: (value: string) => void;
}) {
  const chosen = value !== undefined ? Number(value) : null;
  const correct = Number(accepted[0]);

  return (
    <CircleOfFifths
      naming={naming}
      lang={lang}
      selected={state === "idle" ? chosen : null}
      showDetail={false}
      // Named only once it has been answered, so the feedback still teaches.
      labels={state === "idle" ? "anchor" : "all"}
      onSelect={(index) => {
        if (!locked) onAnswer(String(index));
      }}
      statusFor={
        state === "idle"
          ? undefined
          : (index) => {
              if (index === correct) return "correct";
              if (index === chosen) return "wrong";
              return undefined;
            }
      }
    />
  );
}
