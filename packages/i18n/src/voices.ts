/** Petition voice IDs. Toggle order: youngest → oldest, style voices, GENERIC last. */
export const VOICE_IDS = [
  "genalpha",
  "genz",
  "millennial",
  "boomer",
  "shakespeare",
  "oldtimey",
  "pirate",
  "computer",
  "ai",
  "reptile",
  "generic",
] as const;

export type VoiceId = (typeof VOICE_IDS)[number];

export type VoiceMeta = {
  id: VoiceId;
  /** Short uppercase label shown in the radiogroup. */
  label: string;
};

export const VOICES: VoiceMeta[] = [
  // Gen Alpha: streamer energy (aura/based vibes), same petition thesis.
  { id: "genalpha", label: "GEN ALPHA" },
  { id: "genz", label: "GEN Z" },
  { id: "millennial", label: "MILLENNIAL" },
  { id: "boomer", label: "BOOMER" },
  { id: "shakespeare", label: "SHAKESPEARE" },
  { id: "oldtimey", label: "OLD'TIMEY" },
  { id: "pirate", label: "YARR" },
  // ASCII p=112 + c=99 — how you enter computer mode (bits are the body copy).
  { id: "computer", label: "10010011" },
  { id: "ai", label: "AI" },
  // Failed human disguise — fellow humans, then the scales slip.
  { id: "reptile", label: "REPTILE" },
  { id: "generic", label: "GENERIC" },
];

/** First paint / SSG voice before storage or heuristic runs. */
export const DEFAULT_VOICE: VoiceId = "computer";

/** Browser key for the last selected petition voice. */
export const VOICE_STORAGE_KEY = "fuck-shorts:voice";

/**
 * Accept only known voice ids from storage; anything else falls back to DEFAULT_VOICE.
 * Equality against VOICE_IDS — no regex.
 */
export function parseStoredVoice(value: string | null): VoiceId {
  if (value === null) return DEFAULT_VOICE;

  for (const id of VOICE_IDS) {
    if (id === value) return id;
  }

  return DEFAULT_VOICE;
}
