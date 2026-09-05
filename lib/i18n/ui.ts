/**
 * Every word the interface says, in all three languages.
 *
 * One file, so a wrong or unnatural phrase is found and fixed in one place.
 * The question wording lives here too - a drill is mostly its questions, and
 * translating the buttons but not the questions would be worse than not
 * translating at all.
 */
import type { Lang } from "./lang";

export interface Copy {
  appName: string;
  tagline: string;
  practise: string;
  anotherRound: string;
  todayProgress: (done: number, goal: number) => string;
  doneToday: (streak: number) => string;
  xp: string;
  dayStreak: string;
  bestRun: string;
  notStarted: string;
  groups: Record<string, string>;
  circle: string;
  circleHint: string;
  stats: string;
  statsHint: string;
  settings: string;
  settingsHint: string;

  back: string;
  streak: string;
  next: string;
  seeResults: string;
  correctPlus: (xp: number) => string;
  loading: string;
  noSuchMode: string;

  sessionVerdict: (percent: number) => string;
  thisRound: string;
  doneForNow: string;
  mostTrouble: (topic: string) => string;

  accuracy: string;
  lastWeeks: string;
  modes: string;
  weakestTopics: string;
  weakestEmpty: string;
  progressData: string;
  exportJson: string;
  importJson: string;
  resetEverything: string;
  resetConfirm: string;
  imported: string;
  importFailed: string;
  erased: string;
  ofSeen: (percent: number, seen: number) => string;

  circleTitle: string;
  circleSubtitle: string;
  relativeMinor: (name: string) => string;
  enharmonicNote: string;

  /** The settings page. */
  s: {
    language: string;
    languageHint: string;
    sessionLength: string;
    sessionLengthHint: string;
    questionCount: (n: number) => string;
    naming: string;
    namingHint: string;
    namingSolfege: string;
    namingLetters: string;
    intervalSet: string;
    intervalSetHint: string;
    intervalFull: string;
    intervalBasic: string;
    clefs: string;
    clefsHint: string;
    both: string;
    trebleOnly: string;
    bassOnly: string;
    staffDifficulty: string;
    staffDifficultyHint: string;
    onTheLines: string;
    oneLedger: string;
    fourLedgers: string;
    buildStyle: string;
    buildStyleHint: string;
    placeOnStaff: string;
    typeTheName: string;
    answerStyle: string;
    answerStyleHint: string;
    tapAName: string;
    typeIt: string;
  };

  /** Question wording, shared by the modes. */
  q: {
    howManyTonesAndClass: string;
    tones: string;
    classLabel: string;
    whichInterval: string;
    intervalLabel: string;
    nameTheNote: string;
    noteLabel: string;
    putItOn: (clef: string) => string;
    positionLabel: string;
    aboveTheNote: string;
    belowTheNote: string;
    noteAbove: string;
    noteBelow: string;
    howManyAccidentals: string;
    howMany: string;
    whichKind: string;
    whichMajorKey: string;
    whichMinorKey: string;
    keyLabel: string;
    relativeMinorQ: string;
    relativeMajorQ: string;
    relativeMinorLabel: string;
    relativeMajorLabel: string;
    moveFifth: (dir: "up" | "down") => string;
    tapFifth: (dir: "up" | "down") => string;
    tapKeyWithSignature: string;
    nameAccidentals: string;
    signatureLabel: string;
    writeSignatureOn: (clef: string) => string;
    howFarApart: string;
    markedKeyAbove: string;
    markedKeyBelow: string;
    keyKeyboardLabel: string;
    typePlaceholderSolfege: string;
    typePlaceholderLetters: string;
    tapStaff: string;
    placeItHere: string;
    up: string;
    down: string;
    tapKey: string;
    chooseKey: string;
    undo: string;
    done: string;
    placedCount: (n: number, total: number) => string;
    howItLooks: string;
    orJoin: string;
    whichDegree: (degree: string) => string;
    degreeLabel: string;
    isItInScale: (note: string) => string;
    inScaleLabel: string;
    yes: string;
    no: string;
  };
}

const translit: Copy = {
  appName: "Music Trainer",
  tagline: "Bagrut 5 yechidot",
  practise: "Practise",
  anotherRound: "Another round",
  todayProgress: (d, g) => `${d} of ${g} today`,
  doneToday: (s) => `Done today · ${s}-day streak`,
  xp: "XP",
  dayStreak: "Day streak",
  bestRun: "Best run",
  notStarted: "new",
  groups: {
    Intervals: "Mirvachim",
    "The staff": "Tavim",
    "Keys and signatures": "Sulamot ve-simanim",
  },
  circle: "Ma'agal",
  circleHint: "Reference",
  stats: "Stats",
  statsHint: "Progress",
  settings: "Settings",
  settingsHint: "Difficulty",

  back: "Back",
  streak: "Streak",
  next: "Next",
  seeResults: "See how you did",
  correctPlus: (xp) => `Correct · +${xp} XP`,
  loading: "Loading…",
  noSuchMode: "No such mode.",

  sessionVerdict: (p) =>
    p === 100
      ? "Clean sweep."
      : p >= 80
        ? "Good round."
        : p >= 50
          ? "Worth another go."
          : "That one was rough - which is the point of drilling it.",
  thisRound: "This round",
  doneForNow: "Done for now",
  mostTrouble: (t) =>
    `Most trouble with ${t}. Those questions will come round more often.`,

  accuracy: "Accuracy",
  lastWeeks: "Last 12 weeks",
  modes: "Modes",
  weakestTopics: "Weakest topics",
  weakestEmpty: "Answer a few more questions and the weak spots show up here.",
  progressData: "Progress data",
  exportJson: "Export JSON",
  importJson: "Import JSON",
  resetEverything: "Reset everything",
  resetConfirm: "Tap again to erase everything",
  imported: "Progress imported.",
  importFailed: "That file could not be read as progress JSON.",
  erased: "Progress erased.",
  ofSeen: (p, s) => `${p}% of ${s}`,

  circleTitle: "Ma'agal ha-kvintot",
  circleSubtitle: "Tap a key. Reference only, nothing here is scored.",
  relativeMinor: (n) => `Relative minor: ${n}`,
  enharmonicNote: "These two are the same sounding key, spelled two ways.",

  s: {
    language: "Language",
    languageHint:
      "The Hebrew terms in Latin letters, the same terms in Hebrew, or the international names - major third, perfect fifth.",
    sessionLength: "Session length",
    sessionLengthHint:
      "How many questions before a session ends. Shorter is easier to actually start.",
    questionCount: (n) => `${n} questions`,
    naming: "Note and key names",
    namingHint:
      "Used for the staff drill and the circle of fifths. Typed answers accept either system whatever this is set to.",
    namingSolfege: "do re mi fa sol la si",
    namingLetters: "A B C D E F G",
    intervalSet: "Which intervals",
    intervalSetHint:
      "Mugdal and muktan intervals are where the name stops following the tone count - fa to si and si to fa are both three tones, but one is a kvarta and the other a kvinta.",
    intervalFull: "Everything, including mugdal and muktan",
    intervalBasic: "Zaka, ktana and gdola only",
    clefs: "Clefs",
    clefsHint: "Which clefs the staff drills ask about.",
    both: "Both",
    trebleOnly: "Treble only",
    bassOnly: "Bass only",
    staffDifficulty: "Staff difficulty",
    staffDifficultyHint:
      "How far outside the staff the notes go. Wider means more notes to meet, and less repetition.",
    onTheLines: "Inside the staff only",
    oneLedger: "Up to one ledger line",
    fourLedgers: "Up to four ledger lines",
    buildStyle: "Building intervals",
    buildStyleHint: "Place the second note on the staff, or just name it.",
    placeOnStaff: "Place it on the staff",
    typeTheName: "Type the note name",
    answerStyle: "Answering the staff drill",
    answerStyleHint: "Tapping is faster; typing is harder, and better practice.",
    tapAName: "Tap a name",
    typeIt: "Type the name",
  },

  q: {
    howManyTonesAndClass: "How many tones, and what class?",
    tones: "Tones",
    classLabel: "Class",
    whichInterval: "Which interval is this?",
    intervalLabel: "Interval",
    nameTheNote: "Name the note",
    noteLabel: "Note",
    putItOn: (c) => `put it on ${c}`,
    positionLabel: "Position",
    aboveTheNote: "above the note shown",
    belowTheNote: "below the note shown",
    noteAbove: "The note above",
    noteBelow: "The note below",
    howManyAccidentals: "How many accidentals, and which kind?",
    howMany: "How many",
    whichKind: "Which kind",
    whichMajorKey: "Which major key?",
    whichMinorKey: "Which minor key?",
    keyLabel: "Key",
    relativeMinorQ: "What is the relative minor?",
    relativeMajorQ: "What is the relative major?",
    relativeMinorLabel: "Relative minor",
    relativeMajorLabel: "Relative major",
    moveFifth: (d) => `Move one fifth ${d}`,
    tapFifth: (d) => `tap the key a fifth ${d}`,
    tapKeyWithSignature: "tap the major key with this signature",
    nameAccidentals: "Name the accidentals, in order",
    signatureLabel: "Signature",
    writeSignatureOn: (c) => `write the signature on ${c}`,
    howFarApart: "How far apart are these?",
    markedKeyAbove: "above the marked key",
    markedKeyBelow: "below the marked key",
    keyKeyboardLabel: "Key",
    typePlaceholderSolfege: "do, fa diez…",
    typePlaceholderLetters: "A–G, F#",
    tapStaff: "Tap the staff to place a note",
    placeItHere: "Place it here",
    up: "Up",
    down: "Down",
    tapKey: "Tap a key",
    chooseKey: "Choose this key",
    undo: "Undo",
    done: "Done",
    placedCount: (n, t) => `${n} of ${t} placed`,
    howItLooks: "How it should look:",
    orJoin: " or ",
    whichDegree: (d) => `which note is the ${d}?`,
    degreeLabel: "Note",
    isItInScale: (n) => `is ${n} in it?`,
    inScaleLabel: "In the scale",
    yes: "Yes",
    no: "No",
  },
};

const he: Copy = {
  appName: "מאמן תאוריה",
  tagline: "בגרות 5 יחידות",
  practise: "תרגול",
  anotherRound: "סיבוב נוסף",
  todayProgress: (d, g) => `${d} מתוך ${g} היום`,
  doneToday: (s) => `הושלם היום · רצף של ${s} ימים`,
  xp: "נקודות",
  dayStreak: "רצף ימים",
  bestRun: "הרצף הטוב ביותר",
  notStarted: "חדש",
  groups: {
    Intervals: "מרווחים",
    "The staff": "תווים",
    "Keys and signatures": "סולמות וסימני מפתח",
  },
  circle: "המעגל",
  circleHint: "עיון",
  stats: "נתונים",
  statsHint: "התקדמות",
  settings: "הגדרות",
  settingsHint: "רמת קושי",

  back: "חזרה",
  streak: "רצף",
  next: "הבא",
  seeResults: "לסיכום",
  correctPlus: (xp) => `נכון · ${xp}+ נקודות`,
  loading: "טוען…",
  noSuchMode: "אין מצב כזה.",

  sessionVerdict: (p) =>
    p === 100
      ? "הכול נכון."
      : p >= 80
        ? "סיבוב טוב."
        : p >= 50
          ? "שווה עוד סיבוב."
          : "היה קשה - וזו בדיוק הסיבה לתרגל את זה.",
  thisRound: "בסיבוב הזה",
  doneForNow: "מספיק להיום",
  mostTrouble: (t) => `הכי הרבה טעויות ב${t}. השאלות האלה יחזרו יותר.`,

  accuracy: "דיוק",
  lastWeeks: "12 השבועות האחרונים",
  modes: "מצבי תרגול",
  weakestTopics: "הנושאים החלשים",
  weakestEmpty: "אחרי עוד כמה שאלות הנקודות החלשות יופיעו כאן.",
  progressData: "נתוני התקדמות",
  exportJson: "ייצוא JSON",
  importJson: "ייבוא JSON",
  resetEverything: "איפוס הכול",
  resetConfirm: "לחיצה נוספת תמחק הכול",
  imported: "ההתקדמות יובאה.",
  importFailed: "לא ניתן לקרוא את הקובץ הזה.",
  erased: "ההתקדמות נמחקה.",
  ofSeen: (p, s) => `${p}% מתוך ${s}`,

  circleTitle: "מעגל הקווינטות",
  circleSubtitle: "לחצו על סולם. לעיון בלבד, אין כאן ניקוד.",
  relativeMinor: (n) => `המינור המקביל: ${n}`,
  enharmonicNote: "שני אלה נשמעים אותו דבר, בשתי כתיבות שונות.",

  s: {
    language: "שפה",
    languageHint:
      "המונחים בעברית, אותם מונחים באותיות לועזיות, או השמות הבינלאומיים - major third, perfect fifth.",
    sessionLength: "אורך סבב",
    sessionLengthHint: "כמה שאלות עד סוף הסבב. קצר יותר קל יותר להתחיל.",
    questionCount: (n) => `${n} שאלות`,
    naming: "שמות תווים וסולמות",
    namingHint:
      "משמש לתרגילי החמשה ולמעגל הקווינטות. תשובות בהקלדה מתקבלות בשתי השיטות בכל מקרה.",
    namingSolfege: "דו רה מי פה סול לה סי",
    namingLetters: "A B C D E F G",
    intervalSet: "אילו מרווחים",
    intervalSetHint:
      "במרווחים מוגדלים ומוקטנים השם כבר לא נגזר ממספר הטונים - פה עד סי וסי עד פה שניהם שלושה טונים, אבל אחד קוורטה והשני קווינטה.",
    intervalFull: "הכול, כולל מוגדלים ומוקטנים",
    intervalBasic: "רק זכים, קטנים וגדולים",
    clefs: "מפתחות",
    clefsHint: "באילו מפתחות תרגילי החמשה עוסקים.",
    both: "שניהם",
    trebleOnly: "מפתח סול בלבד",
    bassOnly: "מפתח פה בלבד",
    staffDifficulty: "רמת קושי בחמשה",
    staffDifficultyHint:
      "כמה רחוק מהחמשה מגיעים התווים. טווח רחב יותר - יותר תווים ופחות חזרתיות.",
    onTheLines: "בתוך החמשה בלבד",
    oneLedger: "עד שורת עזר אחת",
    fourLedgers: "עד ארבע שורות עזר",
    buildStyle: "בניית מרווחים",
    buildStyleHint: "למקם את התו השני על החמשה, או פשוט לכתוב את שמו.",
    placeOnStaff: "למקם על החמשה",
    typeTheName: "להקליד את השם",
    answerStyle: "מענה בתרגיל קריאת התווים",
    answerStyleHint: "לחיצה מהירה יותר; הקלדה קשה יותר, ומתרגלת טוב יותר.",
    tapAName: "לחיצה על שם",
    typeIt: "הקלדת השם",
  },

  q: {
    howManyTonesAndClass: "כמה טונים, ואיזה סוג?",
    tones: "טונים",
    classLabel: "סוג",
    whichInterval: "איזה מרווח זה?",
    intervalLabel: "מרווח",
    nameTheNote: "מהו התו?",
    noteLabel: "תו",
    putItOn: (c) => `כתבו אותו ב${c}`,
    positionLabel: "מיקום",
    aboveTheNote: "מעל התו שמוצג",
    belowTheNote: "מתחת לתו שמוצג",
    noteAbove: "התו שמעל",
    noteBelow: "התו שמתחת",
    howManyAccidentals: "כמה סימנים, ואיזה סוג?",
    howMany: "כמה",
    whichKind: "איזה סוג",
    whichMajorKey: "איזה סולם מז'ורי?",
    whichMinorKey: "איזה סולם מינורי?",
    keyLabel: "סולם",
    relativeMinorQ: "מהו המינור המקביל?",
    relativeMajorQ: "מהו המז'ור המקביל?",
    relativeMinorLabel: "מינור מקביל",
    relativeMajorLabel: "מז'ור מקביל",
    moveFifth: (d) => (d === "up" ? "קווינטה למעלה" : "קווינטה למטה"),
    tapFifth: (d) =>
      d === "up" ? "לחצו על הסולם קווינטה מעל" : "לחצו על הסולם קווינטה מתחת",
    tapKeyWithSignature: "לחצו על הסולם המז'ורי עם הסימנים האלה",
    nameAccidentals: "מהם הסימנים, לפי הסדר?",
    signatureLabel: "סימני מפתח",
    writeSignatureOn: (c) => `כתבו את סימני המפתח ב${c}`,
    howFarApart: "מה המרחק ביניהם?",
    markedKeyAbove: "מעל הקליד המסומן",
    markedKeyBelow: "מתחת לקליד המסומן",
    keyKeyboardLabel: "קליד",
    typePlaceholderSolfege: "דו, פה דיאז…",
    typePlaceholderLetters: "A–G, F#",
    tapStaff: "לחצו על החמשה כדי למקם תו",
    placeItHere: "למקם כאן",
    up: "למעלה",
    down: "למטה",
    tapKey: "לחצו על קליד",
    chooseKey: "לבחור את הקליד הזה",
    undo: "ביטול",
    done: "סיום",
    placedCount: (n, t) => `${n} מתוך ${t} מוקמו`,
    howItLooks: "כך זה צריך להיראות:",
    orJoin: " או ",
    whichDegree: (d) => `איזה צליל הוא ה${d}?`,
    degreeLabel: "צליל",
    isItInScale: (n) => `האם ${n} נמצא בו?`,
    inScaleLabel: "בסולם",
    yes: "כן",
    no: "לא",
  },
};

const en: Copy = {
  ...translit,
  s: {
    ...translit.s,
    intervalSetHint:
      "Augmented and diminished intervals are where the name stops following the tone count - F to B and B to F are both three tones, but one is a fourth and the other a fifth.",
    intervalFull: "Everything, including augmented and diminished",
    intervalBasic: "Perfect, minor and major only",
    namingSolfege: "do re mi fa sol la ti",
  },
  tagline: "Bagrut, 5 units",
  groups: {
    Intervals: "Intervals",
    "The staff": "The staff",
    "Keys and signatures": "Keys and signatures",
  },
  circle: "Circle",
  circleTitle: "The circle of fifths",
  q: {
    ...translit.q,
    typePlaceholderSolfege: "do, F sharp…",
    putItOn: (c) => `put it on the ${c} staff`,
    writeSignatureOn: (c) => `write the signature on the ${c} staff`,
  },
};

export const COPY: Record<Lang, Copy> = { translit, he, en };

export function copy(lang: Lang): Copy {
  return COPY[lang];
}
