import type { VoiceId } from "./voices";

/** How a voice presents casing on screen. */
export type VoiceTextCase = "preserve" | "lower";

/**
 * Per-voice casing. Kept here (not on VOICE_PACKS) so SSR can call
 * voiceTextCase without loading every letter JSX module first.
 */
export const VOICE_TEXT_CASE: Record<VoiceId, VoiceTextCase> = {
  genalpha: "preserve",
  genz: "lower",
  millennial: "preserve",
  boomer: "preserve",
  shakespeare: "preserve",
  oldtimey: "preserve",
  pirate: "preserve",
  computer: "preserve",
  ai: "preserve",
  reptile: "preserve",
  generic: "preserve",
};

/** Casing mode for a voice — drive applyVoiceCase / CSS from this. */
export function voiceTextCase(voice: VoiceId): VoiceTextCase {
  return VOICE_TEXT_CASE[voice];
}

/**
 * Apply the voice’s text case to a string.
 * `lower` → full lowercase; `preserve` → unchanged.
 */
export function applyVoiceCase(textCase: VoiceTextCase, text: string): string {
  if (textCase === "lower") return text.toLowerCase();

  return text;
}
