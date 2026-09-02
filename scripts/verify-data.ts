/**
 * Data integrity checks for the drill content.
 *
 * The whole app is driven by lib/data, so this is where a mistake would do real
 * damage: a relative minor that is not a minor third down, a key signature with
 * the wrong number of accidentals, a note whose ledger lines are miscounted.
 * Run with `npm run verify:data` after editing any data file.
 */
import * as N from "../lib/data/notes";
import * as K from "../lib/data/keys";
import { MODES, getMode, MIXED_MODE_ID } from "../lib/modes/registry";
import { DEFAULT_SETTINGS } from "../lib/engine/settings";
import { matches } from "../lib/engine/normalize";
import { selectQuestion } from "../lib/engine/select";
import { applyResult, emptyProgress } from "../lib/engine/progress";
import { gradeQuestion } from "../lib/engine/grade";
import type { AppSettings } from "../lib/engine/settings";
import type { ModeSettings } from "../lib/engine/types";

let failures = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { failures++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const p = (letter: N.Letter, octave: number): N.Pitch => ({ letter, octave });

// --- Mode 2: staff positions -------------------------------------------------
eq("treble E4 line 1", N.positionText(p("e",4),"treble"), "1st line of the treble staff, counting up.");
eq("treble F4 space 1", N.positionText(p("f",4),"treble"), "1st space of the treble staff, counting up.");
eq("treble G4 line 2", N.positionText(p("g",4),"treble"), "2nd line of the treble staff, counting up.");
eq("treble F5 line 5", N.positionText(p("f",5),"treble"), "5th line of the treble staff, counting up.");
eq("bass C3 space 2", N.positionText(p("c",3),"bass"), "2nd space of the bass staff, counting up.");
eq("bass G2 line 1", N.positionText(p("g",2),"bass"), "1st line of the bass staff, counting up.");
eq("bass A3 line 5", N.positionText(p("a",3),"bass"), "5th line of the bass staff, counting up.");

eq("middle C is 1 ledger below treble", N.ledgerLines(p("c",4),"treble"), 1);
eq("middle C is 1 ledger above bass", N.ledgerLines(p("c",4),"bass"), 1);
eq("D4 hangs below treble, no ledger", N.ledgerLines(p("d",4),"treble"), 0);
eq("A3 is 2 ledgers below treble", N.ledgerLines(p("a",3),"treble"), 2);
eq("G5 no ledger above treble", N.ledgerLines(p("g",5),"treble"), 0);
eq("A5 is 1 ledger above treble", N.ledgerLines(p("a",5),"treble"), 1);
eq("C6 is 2 ledgers above treble", N.ledgerLines(p("c",6),"treble"), 2);
eq("C2 is 2 ledgers below bass", N.ledgerLines(p("c",2),"bass"), 2);

const easyTreble = N.pitchesBetween(...N.DIFFICULTY_RANGE.easy.treble);
eq("easy treble = E4..F5", easyTreble.map(N.vexKey), ["e/4","f/4","g/4","a/4","b/4","c/5","d/5","e/5","f/5"]);
eq("easy treble has no ledger lines", easyTreble.every(x => N.ledgerLines(x,"treble") === 0), true);
const easyBass = N.pitchesBetween(...N.DIFFICULTY_RANGE.easy.bass);
eq("easy bass has no ledger lines", easyBass.every(x => N.ledgerLines(x,"bass") === 0), true);
const hardTreble = N.pitchesBetween(...N.DIFFICULTY_RANGE.hard.treble);
eq("hard treble reaches 2 ledgers both ways", [
  Math.max(...hardTreble.filter(x=>N.step(x) < N.STAFF_LINES.treble.bottom).map(x=>N.ledgerLines(x,"treble"))),
  Math.max(...hardTreble.filter(x=>N.step(x) > N.STAFF_LINES.treble.top).map(x=>N.ledgerLines(x,"treble"))),
], [2,2]);

// --- Typed answers -----------------------------------------------------------
eq("G accepts both systems", N.acceptedNames(p("g", 4)), ["g", "sol", "so"]);
eq("padding and case are ignored", matches("  SOL ", N.acceptedNames(p("g", 4))), true);
eq("ti is accepted for si", matches("Ti", N.acceptedNames(p("b", 4))), true);
eq("an empty answer is never correct", matches("", N.acceptedNames(p("c", 4))), false);

// No note name may be accepted for a different note - the thing normalization
// is most likely to break.
for (const a of N.SCALE_ORDER) {
  for (const b of N.SCALE_ORDER) {
    if (a === b) continue;
    for (const spelling of N.acceptedNames(p(a, 4))) {
      eq(
        `"${spelling}" is not accepted for ${b}`,
        matches(spelling, N.acceptedNames(p(b, 4))),
        false,
      );
    }
  }
}

// --- Mode 3: the circle ------------------------------------------------------
const SEMI: Record<string, number> = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
const pc = (t: K.Tonic) => (SEMI[t.letter] + (t.accidental === "#" ? 1 : t.accidental === "b" ? -1 : 0) + 12) % 12;
const letterIndex = (t: K.Tonic) => ["c","d","e","f","g","a","b"].indexOf(t.letter);

for (const key of K.KEYS) {
  eq(`${key.id}: signature length matches count`, K.signature(key).length, key.count);
  // Relative minor: a minor third below, spelled two letter-steps down.
  eq(`${key.id}: relative minor letter`, letterIndex(key.relativeMinor), (letterIndex(key.tonic) + 5) % 7);
  eq(`${key.id}: relative minor is 3 semitones down`, (pc(key.tonic) - pc(key.relativeMinor) + 12) % 12, 3);
}
K.KEYS.forEach((key, i) => {
  const expectedCount = Math.abs(i - 7);
  eq(`${key.id}: count from circle position`, key.count, expectedCount);
  const expectedKind = i === 7 ? "none" : i < 7 ? "bemolim" : "diezim";
  eq(`${key.id}: kind from circle position`, key.kind, expectedKind);
  if (i > 0) {
    eq(`${K.KEYS[i-1].id} -> ${key.id} is a fifth up`, (pc(key.tonic) - pc(K.KEYS[i-1].tonic) + 12) % 12, 7);
  }
});
eq("fifteen keys", K.KEYS.length, 15);
eq("C major has no accidentals", K.signatureText(K.keyById("c")!, "solfege"), "ein simanim");
eq("A major signature", K.signatureText(K.keyById("a")!, "solfege"), "fa diez, do diez, sol diez");
eq("Eb major signature", K.signatureText(K.keyById("eb")!, "letters"), "Bb, Eb, Ab");
eq("F# major has six sharps", K.countText(K.keyById("fs")!), "6 diezim");
eq("key name solfege", K.keyName(K.keyById("bb")!.tonic, "major", "solfege"), "si bemol mazhor");
eq("relative minor name", K.keyName(K.keyById("a")!.relativeMinor, "minor", "solfege"), "fa diez minor");

// Twelve clock positions, each a fifth above the last.
K.CIRCLE_POSITIONS.forEach((slot, i) => {
  const here = K.keyById(slot.ids[0])!;
  const prev = K.keyById(K.CIRCLE_POSITIONS[(i + 11) % 12].ids[0])!;
  eq(`circle position ${i} is a fifth above the previous`, (pc(here.tonic) - pc(prev.tonic) + 12) % 12, 7);
  if (slot.ids[1]) {
    eq(`circle position ${i} enharmonic pair sounds the same`, pc(here.tonic), pc(K.keyById(slot.ids[1])!.tonic));
  }
});

// --- Every mode's generated questions ---------------------------------------
const settingsMatrix: AppSettings[] = [
  DEFAULT_SETTINGS,
  { ...DEFAULT_SETTINGS, naming: "letters" },
  { ...DEFAULT_SETTINGS, staffDifficulty: "hard", clefs: "treble" },
  { ...DEFAULT_SETTINGS, answerStyle: "typing", staffDifficulty: "medium" },
];

for (const settings of settingsMatrix) {
  const label = Object.values(settings).join("/");
  const ids = new Set<string>();

  for (const mode of MODES) {
    const pool = mode.pool(settings as unknown as ModeSettings);
    eq(`${mode.id} [${label}]: pool is not empty`, pool.length > 0, true);

    for (const q of pool) {
      eq(`${q.id}: unique id`, ids.has(q.id), false);
      ids.add(q.id);
      eq(`${q.id}: belongs to its mode`, q.modeId, mode.id);
      eq(`${q.id}: has a prompt`, q.prompt.length > 0, true);
      eq(`${q.id}: has parts`, q.parts.length > 0, true);
      eq(`${q.id}: positive weight`, q.weight > 0, true);

      for (const part of q.parts) {
        eq(`${q.id}/${part.id}: has accepted answers`, part.accepted.length > 0, true);
        eq(`${q.id}/${part.id}: has a display answer`, part.display.length > 0, true);
        eq(`${q.id}/${part.id}: has a reason`, (part.reason ?? "").length > 0, true);
        // The answer has to actually be reachable from the offered options.
        if (part.input.kind === "choice" || part.input.kind === "value") {
          const offered =
            part.input.kind === "choice"
              ? part.input.options.map((o) => o.id)
              : part.input.options.map((o) => String(o.value));
          eq(
            `${q.id}/${part.id}: a correct answer is on offer`,
            offered.some((o) => matches(o, part.accepted)),
            true,
          );
          // Exactly the intended options are correct - no option matches by
          // accident once normalization has flattened it.
          eq(
            `${q.id}/${part.id}: no option is correct by accident`,
            offered.filter((o) => matches(o, part.accepted)).length,
            offered.filter((o) => part.accepted.includes(o)).length,
          );
          eq(`${q.id}/${part.id}: no duplicate options`, new Set(offered).size, offered.length);
        }
      }
    }
  }

  const mixed = getMode(MIXED_MODE_ID)!.pool(settings as unknown as ModeSettings);
  eq(
    `mixed [${label}]: pool is every mode combined`,
    mixed.length,
    MODES.reduce((n, m) => n + m.pool(settings as unknown as ModeSettings).length, 0),
  );
}

// --- Selection ---------------------------------------------------------------
// A seeded generator, so a failure here is reproducible.
let seed = 12345;
const rng = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

for (const id of [...MODES.map((m) => m.id), MIXED_MODE_ID]) {
  const pool = getMode(id)!.pool(DEFAULT_SETTINGS as unknown as ModeSettings);
  let progress = emptyProgress();
  let previous = selectQuestion(pool, progress, undefined, rng);
  eq(`${id}: selection returns a question`, previous !== null, true);

  let sameId = 0;
  let samePrompt = 0;
  const drawn = new Set<string>();

  for (let i = 0; i < 4000; i++) {
    const next = selectQuestion(pool, progress, previous ?? undefined, rng);
    if (!next) { eq(`${id}: selection never runs dry`, false, true); break; }
    if (previous && next.id === previous.id) sameId++;
    // Only meaningful where the prompt names the subject; a drawn question's
    // prompt is a fixed instruction.
    if (previous && !previous.media && !next.media && next.prompt === previous.prompt) {
      samePrompt++;
    }
    drawn.add(next.id);
    // Answer everything wrong, which is the case that most distorts weights.
    progress = applyResult(progress, gradeQuestion(next, {}));
    previous = next;
  }

  eq(`${id}: never repeats a question back to back`, sameId, 0);
  eq(`${id}: never repeats a written prompt back to back`, samePrompt, 0);
  eq(`${id}: every question comes up`, drawn.size, pool.length);
}

// A miss really does make a question more likely than a clean one.
{
  const pool = getMode("intervals")!.pool(DEFAULT_SETTINGS as unknown as ModeSettings);
  let progress = emptyProgress();
  const missed = pool[0];
  const clean = pool[1];
  progress = applyResult(progress, gradeQuestion(missed, {}));
  const answers = Object.fromEntries(clean.parts.map((p) => [p.id, p.accepted[0]]));
  progress = applyResult(progress, gradeQuestion(clean, answers));
  eq("a missed question outweighs a clean one", 
    progress.questions[missed.id].boost > progress.questions[clean.id].boost, true);
  eq("a miss sets the boost to 3", progress.questions[missed.id].boost, 3);
  // Two correct answers walk it back to normal.
  const missedAnswers = Object.fromEntries(missed.parts.map((p) => [p.id, p.accepted[0]]));
  progress = applyResult(progress, gradeQuestion(missed, missedAnswers));
  eq("one correct answer halves the boost", progress.questions[missed.id].boost, 1.5);
  progress = applyResult(progress, gradeQuestion(missed, missedAnswers));
  eq("two correct answers clear the boost", progress.questions[missed.id].boost, 1);
}

console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
