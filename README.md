# Music Trainer

Theory drilling for the Israeli 5-unit Bagrut track. Hebrew terms in Latin
transliteration, dark UI, phone first. No backend, no accounts - everything is
kept in `localStorage` on the device.

**Stage 1 of 3.** Mode 1 (Mirvachim / intervals) is live, along with the whole
scoring, streak and stats engine. Mode 2 (staff reading) and Mode 3 (circle of
fifths) come next.

## Local setup

Requires Node 20+ (developed on 26).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build, fails on any TypeScript error
npm run lint
```

One quirk worth knowing: `next build` and `next dev` share the Turbopack cache
in `.next/`, and running a build while the dev server is up can fail with
`Failed to open database`. Stop the dev server, or `rm -rf .next`, and build
again.

## How the code is laid out

```
lib/engine/     the generic question engine - knows nothing about music
lib/data/       drill content, one typed file per subject
lib/modes/      turns data into questions, one file per mode + registry.ts
components/     UI
app/            routes: / (home), /drill/[mode], /stats
```

### The engine

Every mode produces `Question` objects (`lib/engine/types.ts`) and the engine
handles the rest. A question is a prompt plus one or more `AnswerPart`s; each
part declares its own input type, its accepted answers, the answer to display in
feedback, and its topic tags.

- `normalize.ts` - case/whitespace/punctuation tolerant comparison
- `grade.ts` - grades parts and questions, computes XP
- `select.ts` - weighted random pick from the pool
- `progress.ts` - streaks, XP, per-mode/topic stats, the day heatmap
- `store.ts` - the single `localStorage`-backed store all components read

Three answer input types exist: `choice` (multiple choice), `value` (discrete
values, used for the tone scale) and `text` (free typing, normalized). A fourth
mode needs a new file in `lib/modes/` and one line in `lib/modes/registry.ts` -
no engine changes.

Repetition: a missed question's selection weight is multiplied by 3, then halved
by each correct answer until it is back to normal after two. That lives in
`nextBoost()` in `progress.ts`.

### Adding drill content

Content is data. To add an interval, add a row to `INTERVALS` in
`lib/data/intervals.ts`:

```ts
{
  id: "nona-gdola",
  name: "nona gdola",       // transliteration, never Hebrew script
  tones: 7,
  classes: ["disonans"],    // more than one entry = more than one right answer
  family: "nonot",          // topic tag for the weakest-topics panel
  weight: 1.2,              // difficulty: scales XP and how often it comes up
  note: "One line shown when the answer is wrong.",
}
```

Both question directions (name -> tones + class, and tones -> name) are
generated from that row. No JSX changes.

`kvarta zaka` carries two entries in `classes`: it is a konsonans zaka on its
own but counts as a disonans against the bass, so both answers are accepted and
the note explains the condition.

### Progress data

One key, `music-trainer:progress:v1`. Export and import as JSON from the Stats
page; `migrate()` in `lib/engine/storage.ts` fills in anything an older or
hand-edited file is missing.

## Deploy

Zero config on Vercel.

```bash
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then import the repo at vercel.com/new and deploy - no environment variables, no
build settings to change. Every push to `main` redeploys.
