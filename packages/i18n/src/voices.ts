/** Petition voice IDs. Toggle order: youngest → oldest, GENERIC last. */
export const VOICE_IDS = [
  "genalpha",
  "genz",
  "millennial",
  "boomer",
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
  { id: "generic", label: "GENERIC" },
];

export const DEFAULT_VOICE: VoiceId = "generic";

/** Browser key for the last selected petition voice. */
export const VOICE_STORAGE_KEY = "fuck-shorts:voice";

/**
 * Accept only known voice ids from storage; anything else falls back to GENERIC.
 * Equality against VOICE_IDS — no regex.
 */
export function parseStoredVoice(value: string | null): VoiceId {
  if (value === null) return DEFAULT_VOICE;

  for (const id of VOICE_IDS) {
    if (id === value) return id;
  }

  return DEFAULT_VOICE;
}
