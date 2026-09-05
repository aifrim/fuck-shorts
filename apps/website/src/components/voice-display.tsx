import {
  applyVoiceCase,
  toAsciiBinary,
  voiceTextCase,
  type VoiceId,
} from "@fuck-shorts/i18n";
import type { ReactNode } from "react";

/**
 * Apply voice casing, then computer bits if needed.
 * Computer keeps English in aria-label (after casing).
 */
export function voiceText(voice: VoiceId, text: string): ReactNode {
  const cased = applyVoiceCase(voiceTextCase(voice), text);

  if (voice !== "computer") return cased;

  return (
    <span className="font-mono" aria-label={cased}>
      {toAsciiBinary(cased)}
    </span>
  );
}

/** Signature tally — base-2 when computer so the screen stays 0/1 only. */
export function voiceCount(voice: VoiceId, count: number): string {
  if (voice === "computer") return count.toString(2);

  return count.toLocaleString();
}
