/**
 * Answer normalization. Case-insensitive, whitespace- and punctuation-tolerant.
 * Genuine synonyms ("sol" / "g") are not handled here - a part lists every
 * acceptable answer in `accepted`, so the engine stays music-agnostic.
 */
export function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/♯/g, "#")
    .replace(/♭/g, "b")
    .replace(/[^a-z0-9#.\/-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Compare a user answer against a part's accepted list. */
export function matches(given: string, accepted: string[]): boolean {
  const g = normalize(given);
  if (!g) return false;
  return accepted.some((a) => normalize(a) === g);
}
