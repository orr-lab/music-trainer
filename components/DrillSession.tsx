"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnswerInput, type PartState } from "@/components/AnswerInput";
import { useProgress } from "@/components/useProgress";
import { gradeQuestion, xpFor } from "@/lib/engine/grade";
import { selectQuestion } from "@/lib/engine/select";
import type { Question, QuestionResult } from "@/lib/engine/types";
import { getMode } from "@/lib/modes/registry";

const ADVANCE_DELAY_MS = 600;

export function DrillSession({ modeId }: { modeId: string }) {
  const mode = getMode(modeId);
  const { progress, ready, record } = useProgress();

  // The selector needs the freshest stats without re-running effects on
  // every answer.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const settingsKey = JSON.stringify(progress.settings);
  const pool = useMemo(
    () => (mode ? mode.pool(progress.settings) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, settingsKey],
  );

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuestionResult | null>(null);
  const [session, setSession] = useState({ asked: 0, correct: 0 });

  const advance = useCallback(() => {
    setQuestion((prev) => selectQuestion(pool, progressRef.current, prev?.id));
    setAnswers({});
    setResult(null);
  }, [pool]);

  useEffect(() => {
    if (ready && !question && pool.length > 0) advance();
  }, [ready, question, pool, advance]);

  // Auto-advance on a fully correct answer; a wrong one waits for Next.
  useEffect(() => {
    if (!result?.correct) return;
    const t = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [result, advance]);

  const answerPart = useCallback(
    (partId: string, value: string) => {
      if (!question || result) return;
      const next = { ...answers, [partId]: value };
      setAnswers(next);
      if (question.parts.every((p) => next[p.id] !== undefined)) {
        const graded = gradeQuestion(question, next);
        setResult(graded);
        record(graded);
        setSession((s) => ({
          asked: s.asked + 1,
          correct: s.correct + (graded.correct ? 1 : 0),
        }));
      }
    },
    [answers, question, record, result],
  );

  const activePart = question?.parts.find((p) => answers[p.id] === undefined);

  // Desktop: number keys pick an answer, Enter moves on.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        if (result && !result.correct) advance();
        return;
      }
      if (!activePart || result) return;
      if (activePart.input.kind === "text") return;
      const digit = Number(e.key);
      if (!Number.isInteger(digit) || digit < 1) return;
      const options =
        activePart.input.kind === "choice"
          ? activePart.input.options.map((o) => o.id)
          : activePart.input.options.map((o) => String(o.value));
      const picked = options[digit - 1];
      if (picked !== undefined) answerPart(activePart.id, picked);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePart, answerPart, advance, result]);

  if (!mode) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-4">
        <p className="text-lead text-muted">No such mode.</p>
        <Link href="/" className="text-content text-accent">
          Back
        </Link>
      </main>
    );
  }

  const partState = (partId: string): PartState => {
    if (!result) return "idle";
    return result.parts.find((p) => p.partId === partId)?.correct
      ? "correct"
      : "wrong";
  };

  const wrongParts = result
    ? question?.parts.filter(
        (p) => !result.parts.find((r) => r.partId === p.id)?.correct,
      ) ?? []
    : [];
  // Parts of one question often share a reason - say it once.
  const reasons = [
    ...new Set(wrongParts.map((p) => p.reason).filter(Boolean)),
  ] as string[];

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col p-4">
      <header className="flex items-center justify-between text-content text-muted">
        <Link href="/" className="min-h-12 py-3 pr-4">
          &larr; Back
        </Link>
        <div className="flex gap-4">
          <span>
            Streak{" "}
            <span className="text-ink">
              {progress.modes[mode.id]?.currentStreak ?? 0}
            </span>
          </span>
          <span>
            Session{" "}
            <span className="text-ink">
              {session.correct}/{session.asked}
            </span>
          </span>
        </div>
      </header>

      {question ? (
        <div className="flex flex-1 flex-col gap-8 pt-8 pb-16">
          <div className="text-center">
            <h1 className="text-display font-semibold tracking-tight">
              {question.prompt}
            </h1>
            {question.promptSub ? (
              <p className="mt-4 text-content text-muted">{question.promptSub}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-8">
            {question.parts.map((part) => (
              <section key={part.id} className="flex flex-col gap-4">
                {question.parts.length > 1 ? (
                  <h2 className="text-content text-muted">{part.label}</h2>
                ) : null}
                <AnswerInput
                  key={`${question.id}:${part.id}`}
                  part={part}
                  value={answers[part.id]}
                  state={partState(part.id)}
                  locked={result !== null}
                  keyHints={activePart?.id === part.id}
                  onAnswer={(value) => answerPart(part.id, value)}
                />
              </section>
            ))}
          </div>

          {/* Fixed height: feedback never pushes the answers around. */}
          <div className="min-h-32">
            {result ? (
              result.correct ? (
                <p className="text-lead text-success">
                  Correct &middot; +{xpFor(result)} XP
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {wrongParts.map((p) => (
                    <p key={p.id} className="text-lead text-error">
                      {p.label}: {p.display}
                    </p>
                  ))}
                  {reasons.map((reason) => (
                    <p key={reason} className="text-content text-muted">
                      {reason}
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={advance}
                    className="min-h-14 w-full rounded-xl border border-accent bg-surface text-lead text-ink"
                  >
                    Next
                  </button>
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-content text-muted">Loading&hellip;</p>
        </div>
      )}
    </main>
  );
}
