import { messagesFor } from "./messages";
import type { OgVoiceCopy, TextSeg } from "./types";
import { VOICE_IDS, type VoiceId } from "./voices";

/**
 * OG taglines per voice (Satori segments).
 * Word-boundary spaces trail the prior segment only — a leading space becomes
 * a visible indent when that span wraps onto a new line.
 * Aligned with PageMessages (genz = no notes; millennial = grew up on it).
 */
const OG_TAGLINES: Record<VoiceId, TextSeg[]> = {
  generic: [
    { t: "Vertical is fine. Very-short " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "suck. Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
  boomer: [
    { t: "Vertical video is fine. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Give us a real setting to " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
  genz: [
    { t: "Vertical is fine. " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are pure " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "tho. Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll. ", highlight: "demand" },
    { t: "No notes.", highlight: "ink" },
  ],
  millennial: [
    { t: "Vertical is fine. Very-short " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "and we are tired. Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
  genalpha: [
    { t: "Chat says vertical is high-key fine. " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "though. That is a " },
    { t: "massive L. ", highlight: "ink" },
    { t: "Completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "unalive the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};

export function ogTaglineFor(voice: VoiceId): TextSeg[] {
  return OG_TAGLINES[voice];
}

/** Eyebrow from page messages + tagline segments for OG rendering. */
export function ogCopyFor(voice: VoiceId): OgVoiceCopy {
  return {
    voice,
    eyebrow: messagesFor(voice).eyebrow,
    tagline: ogTaglineFor(voice),
  };
}

/** Uniform pick among voice locales (used on each OG cache miss). */
export function pickRandomOgCopy(): OgVoiceCopy {
  const index = Math.floor(Math.random() * VOICE_IDS.length);
  const voice = VOICE_IDS[index] ?? VOICE_IDS[0]!;

  return ogCopyFor(voice);
}
