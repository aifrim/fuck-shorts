import { messagesFor } from "./messages";
import { applyVoiceCase, voiceTextCase } from "./text-case";
import type { OgVoiceCopy, TextSeg } from "./types";
import { OG_TAGLINES } from "./voice";
import { VOICE_IDS, type VoiceId } from "./voices";

/**
 * Voices that never appear on /og.png (site toggle only).
 * Computer/AI stay out of the share-card lottery.
 */
export const OG_EXCLUDED_VOICE_IDS = ["computer", "ai"] as const;

function isOgExcluded(voice: VoiceId): boolean {
  for (const id of OG_EXCLUDED_VOICE_IDS) {
    if (id === voice) return true;
  }

  return false;
}

/** Voices eligible for random OG copy (VOICE_IDS minus computer/ai). */
export const OG_VOICE_IDS = VOICE_IDS.filter((id) => !isOgExcluded(id));

export function ogTaglineFor(voice: VoiceId): TextSeg[] {
  const textCase = voiceTextCase(voice);
  const segments = OG_TAGLINES[voice];

  if (textCase === "preserve") return segments;

  return segments.map((seg) => ({
    ...seg,
    t: applyVoiceCase(textCase, seg.t),
  }));
}

/** Eyebrow from page messages + tagline segments for OG rendering. */
export function ogCopyFor(voice: VoiceId): OgVoiceCopy {
  return {
    voice,
    eyebrow: messagesFor(voice).eyebrow,
    tagline: ogTaglineFor(voice),
  };
}

/** Uniform pick among OG-eligible voices (used on each OG cache miss). */
export function pickRandomOgCopy(): OgVoiceCopy {
  const pool = OG_VOICE_IDS;
  const index = Math.floor(Math.random() * pool.length);
  const voice = pool[index] ?? pool[0]!;

  return ogCopyFor(voice);
}
