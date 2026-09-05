/** Petition window helpers — shared by Astro prerender gate and SignPanel. */

/** Null means unset / invalid ISO. */
export function parsePetitionInstant(value: string | undefined): number | null {
  if (!value?.trim()) return null;

  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

export type PetitionPhase = "unannounced" | "countdown" | "open" | "ended";

/** Phase at `now` from optional start/end ISO strings. */
export function petitionPhase(
  startIso: string | undefined,
  endIso: string | undefined,
  now: number = Date.now(),
): PetitionPhase {
  const startMs = parsePetitionInstant(startIso);

  if (startMs === null) return "unannounced";
  if (now < startMs) return "countdown";

  const endMs = parsePetitionInstant(endIso);

  if (endMs !== null && now >= endMs) return "ended";

  return "open";
}

/** True while signing is open (started, not ended). */
export function petitionIsOpen(
  startIso: string | undefined,
  endIso: string | undefined,
  now: number = Date.now(),
): boolean {
  return petitionPhase(startIso, endIso, now) === "open";
}
