import type { PageMessages, SharePitchByPhase } from "./types";
import { applyVoiceCase, voiceTextCase } from "./text-case";
import { MESSAGES } from "./voice";
import type { VoiceId } from "./voices";

export { MESSAGES };

/** Resolve social pitch for a petition window (`unannounced` → countdown). */
export function sharePitchFor(
  pitch: SharePitchByPhase,
  phase: "unannounced" | "countdown" | "open" | "ended",
): string {
  if (phase === "ended") return pitch.ended;
  if (phase === "open") return pitch.open;
  return pitch.countdown;
}

/**
 * Deep-apply a string mapper to PageMessages (including fn return values).
 * No regex — only typeof / array / object walks.
 */
function mapMessageStrings(value: unknown, map: (text: string) => string): unknown {
  if (typeof value === "string") return map(value);

  if (typeof value === "function") {
    return (...args: never[]) => {
      const result = (value as (...a: never[]) => unknown)(...args);

      return typeof result === "string" ? map(result) : result;
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => mapMessageStrings(entry, map));
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};

    for (const key of Object.keys(value as object)) {
      out[key] = mapMessageStrings((value as Record<string, unknown>)[key], map);
    }

    return out;
  }

  return value;
}

export function messagesFor(voice: VoiceId): PageMessages {
  const raw = MESSAGES[voice];
  const textCase = voiceTextCase(voice);

  if (textCase === "preserve") return raw;

  return mapMessageStrings(raw, (text) => applyVoiceCase(textCase, text)) as PageMessages;
}
