# Music Trainer

Theory drilling for the Israeli 5-unit Bagrut track. Hebrew terms in Latin
transliteration, dark UI, phone first. No backend, no accounts - everything is
kept in `localStorage` on the device.

Nine drill modes, plus a mixed session that draws from all of them. Most skills
are drilled in both directions - reading and writing, naming and placing.

Intervals:

- **Mirvachim** - size in tones and classification, both directions.
- **Sfirat tonim** - count the distance out on a piano keyboard, key by key:
  find the key an interval away, or measure the gap between two marked keys.
- **Bniyat mirvachim** - given a note on the staff and an interval, place the
  other note, above or below, on the staff or by naming it.

The staff:

- **Kriat tavim** - name the note, treble and bass, drawn with VexFlow.
- **Ktivat tavim** - the reverse: given a name, put the note on the staff.

Keys and signatures:

- **Ma'agal ha-kvintot** - how many accidentals, which key has them, relative
  minors both ways, moving by fifths, and the order of the accidentals.
- **Simanei mafteach** - a real key signature drawn on the staff: name the key,
  major or minor.
- **Ktivat simanei mafteach** - the reverse: place every accidental yourself, in
  order, on the right line.
- **Nivut ba-ma'agal** - answer by pointing at the circle itself, twelve
  positions rather than four names.

Plus an interactive circle diagram at `/circle` as an unscored reference, and a
settings page for naming system, clefs, staff difficulty and answer style.

## Local setup

Requires Node 20+ (developed on 26).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build         # production build, fails on any TypeScript error
npm run lint
npm run verify:data   # checks the drill content itself - see below
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
components/media/   things questions draw: the staff, the piano, the circle,
                    and the pickers built on them
app/            routes: / · /drill/[mode] · /circle · /stats · /settings
scripts/        the data checks behind `npm run verify:data`
```

### The engine

Every mode produces `Question` objects (`lib/engine/types.ts`) and the engine
handles the rest. A question is a prompt - text, or a `media` block the UI knows
how to draw - plus one or more `AnswerPart`s. Each part declares its own input
type, its accepted answers, the answer to show in feedback, and its topic tags.

- `normalize.ts` - case/whitespace/punctuation tolerant comparison
- `grade.ts` - grades parts and questions, computes XP
- `select.ts` - weighted random pick from the pool
- `present.ts` - shuffles option order where a fixed order could be memorised
- `progress.ts` - streaks, XP, per-mode/topic stats, the day heatmap
- `settings.ts` - the user settings, read by modes, opaque to the engine
- `store.ts` - the single `localStorage`-backed store all components read

Three answer input types exist: `choice` (multiple choice), `value` (discrete
values - the tone scale, accidental counts, a position on a staff, a key on a
piano) and `text` (free typing, normalized).

A `value` input can name a `render` for itself, the same way a question can
carry `media`. That is how placing a note on a staff, picking a piano key,
pointing at the circle and writing a whole key signature all work without the
engine learning what any of those are: each is one case in
`components/media/index.tsx` plus one component. An input that collects a
sequence, as writing a key signature does, submits its options joined by
commas; the engine still just compares strings.

A new mode needs a new file in `lib/modes/` and one line in
`lib/modes/registry.ts`.

Repetition: a missed question's selection weight is multiplied by 3, then halved
by each correct answer until it is back to normal after two. That lives in
`nextBoost()` in `progress.ts`.

The mixed session gives each mode an equal share rather than a share
proportional to its size. Without that, the two generated modes - the circle of
fifths and interval building - would crowd out the others, since between them
they hold most of the questions. A question's `weight` still decides what it is
worth; `selectionBias` decides only how often it comes up.

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

Both question directions are generated from that row, and so are the
interval-building questions in Mode 4. Notes and keys work the same way, in
`lib/data/notes.ts` and `lib/data/keys.ts`. No JSX changes.

Mode 4 uses naturals at both ends. That is not a shortcut: between two natural
notes the interval is fully determined, so an interval name plus a starting note
picks out exactly one answer with no accidental to spell. All twelve non-unison
intervals still turn up - the triton as fa-si, the sekunda ktana as mi-fa and
si-do - and `verify:data` asserts that each one can be built in both
directions.

`kvarta zaka` carries two entries in `classes`: it is a konsonans zaka on its
own but counts as a disonans against the bass, so both answers are accepted and
the note explains the condition.

### Checking the content

`npm run verify:data` compiles the data and modes and asserts the things that
would quietly corrupt a drill:

- every relative minor really is a minor third down, spelled correctly
- every key's signature length matches its accidental count, and each step
  around the circle really is a fifth
- ledger-line counts and staff positions ("2nd space of the bass staff")
- every built interval spans the right number of semitones *and* the right
  number of letter names, checked independently of how it was generated
- every key signature's accidentals are the right letters in the right order,
  and sit on or beside the staff for their clef
- the semitone counts on the piano match the keys actually marked
- no staff is drawn blank - a question whose media names neither notes nor a
  key signature is unanswerable
- across four settings combinations, every generated question has a unique id,
  a reason, and exactly the intended correct options on offer
- no note name is accidentally accepted for a different note

Run it after editing anything in `lib/data/`.

### Progress data

One key, `music-trainer:progress:v1`. Export and import as JSON from the Stats
page; `migrate()` in `lib/engine/storage.ts` fills in anything an older or
hand-edited file is missing.

## On a phone

There is a web manifest and generated icons, so on iOS use Share → Add to Home
Screen and it opens full screen with no browser chrome. Progress lives in that
browser's storage, so export the JSON before clearing site data.

## Deploy

Live at **https://learntheory.orrknaan.com**, from
**https://github.com/orr-lab/music-trainer**.

The Vercel project is connected to the repo, so pushing to `main` deploys:

```bash
git push
```

To deploy without pushing, or to check a build before it goes out:

```bash
vercel --prod
```

Zero config - no environment variables, no build settings. The one thing worth
remembering is that all progress lives in the browser on the device, so it does
not follow you between phone and laptop. Export the JSON from the Stats page
before clearing site data.
