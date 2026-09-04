"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnswerInput, type PartState } from "@/components/AnswerInput";
import { QuestionMediaView } from "@/components/media";
import { SessionComplete } from "@/components/SessionComplete";
import { useLang } from "@/components/useLang";
import { useProgress } from "@/components/useProgress";
import { gradeQuestion, xpFor } from "@/lib/engine/grade";
import { present } from "@/lib/engine/present";
import { selectQuestion } from "@/lib/engine/select";
import type { Question, QuestionResult } from "@/lib/engine/types";
import { readSettings } from "@/lib/engine/settings";
import { getMode } from "@/lib/modes/registry";

const ADVANCE_DELAY_MS = 600;

export function DrillSession({ modeId }: { modeId: string }) {
  const mode = getMode(modeId);
  const { progress, ready, record } = useProgress();
  const { t } = useLang();

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
  const [session, setSession] = useState({ asked: 0, correct: 0, xp: 0 });
  const [misses, setMisses] = useState<string[]>([]);
  const length = readSettings(progress.settings).sessionLength;
  const finished = session.asked >= length;

  // Read inside advance() without making it depend on them.
  const sessionRef = useRef(session);
  const lengthRef = useRef(length);
  useEffect(() => {
    sessionRef.current = session;
    lengthRef.current = length;
  }, [session, length]);

  const advance = useCallback(() => {
    setAnswers({});
    setResult(null);
    if (sessionRef.current.asked >= lengthRef.current) {
      // Out of questions for this session; the summary takes the screen.
      setQuestion(null);
      return;
    }
    setQuestion((prev) => {
      const next = selectQuestion(pool, progressRef.current, prev ?? undefined);
      // Shuffle once, here - not on every render, or the options would move
      // under the user's thumb.
      return next ? present(next) : null;
    });
  }, [pool]);

  useEffect(() => {
    // Deals the first question once the store has been read, and re-deals when
    // a settings change rebuilds the pool. There is no event to hang this on:
    // opening the page is the trigger.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready && !finished && !question && pool.length > 0) advance();
  }, [ready, finished, question, pool, advance]);

  // Auto-advance on a fully correct answer; a wrong one waits for Next.
  useEffect(() => {
    if (!result?.correct) return;
    const t = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
  }, [result, advance]);

  const restart = useCallback(() => {
    setSession({ asked: 0, correct: 0, xp: 0 });
    setMisses([]);
    setAnswers({});
    setResult(null);
    setQuestion(null);
  }, []);

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
          xp: s.xp + xpFor(graded),
        }));
        if (!graded.correct) {
          setMisses((m) => [
            ...m,
            ...graded.topicResults.filter((t) => !t.correct).map((t) => t.topic),
          ]);
        }
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
      // A custom renderer handles its own keys.
      if (activePart.input.kind === "value" && activePart.input.render) return;
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
        <p className="text-lead text-muted">{t.noSuchMode}</p>
        <Link href="/" className="text-content text-accent">
          {t.back}
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
        <Link href="/" className="min-h-12 py-3 pr-4 transition-colors hover:text-ink">
          &larr; {t.back}
        </Link>
        <span>
          {t.streak} <span className="text-ink">{progress.currentStreak}</span>
        </span>
      </header>

      {/* How much of the session is left, without a number to read. */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={Math.min(session.asked, length)}
        aria-valuemin={0}
        aria-valuemax={length}
        aria-label="Session progress"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${(Math.min(session.asked, length) / length) * 100}%` }}
        />
      </div>

      {finished && !question ? (
        <SessionComplete
          asked={session.asked}
          correct={session.correct}
          xp={session.xp}
          misses={misses}
          onAgain={restart}
        />
      ) : question ? (
        <div
          key={question.id}
          className="animate-rise flex flex-1 flex-col gap-8 pt-8 pb-16 sm:justify-center sm:pb-8"
        >
          <div className="shrink-0 text-center">
            {question.media ? <QuestionMediaView media={question.media} /> : null}
            {/*
              A prompt with a sub-line underneath it is the subject of the
              question - an interval, a key - and carries the screen. A prompt
              on its own is an instruction ("Name the note") sitting under a
              drawing that is itself the subject.
            */}
            {question.promptSub ? (
              <>
                <h1
                  className={`text-display font-semibold tracking-tight ${
                    question.media ? "mt-4" : ""
                  }`}
                >
                  {question.prompt}
                </h1>
                <p className="mt-4 text-content text-muted">
                  {question.promptSub}
                </p>
              </>
            ) : (
              <h1 className={`text-lead ${question.media ? "mt-4" : ""}`}>
                {question.prompt}
              </h1>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-8">
            {question.parts.map((part) => (
              <section key={part.id} className="flex flex-col gap-4">
                {question.parts.length > 1 ? (
                  <h2 className="text-center text-content text-muted">
                    {part.label}
                  </h2>
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

          {/*
            Feedback sits below the answers and never pushes them around. On a
            phone the page flows downwards, so a minimum is enough. On a wider
            screen the block is centred, which only stays still if its height is
            fixed - hence the exact height there.
          */}
          <div
            className="min-h-32 shrink-0 sm:h-56 sm:overflow-y-auto"
            aria-live="polite"
          >
            {result ? (
              result.correct ? (
                <p className="text-lead text-success">
                  {t.correctPlus(xpFor(result))}
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
                    className="min-h-14 w-full rounded-xl border border-accent bg-surface text-lead text-ink transition-colors hover:bg-line/40"
                  >
                    {session.asked >= length ? t.seeResults : t.next}
                  </button>
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-content text-muted">{t.loading}</p>
        </div>
      )}
    </main>
  );
}
