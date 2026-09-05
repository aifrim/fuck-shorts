import type { ReactNode } from "react";

import type { VoiceTextCase } from "../text-case";
import { VOICE_TEXT_CASE } from "../text-case";
import type { PageMessages, TextSeg } from "../types";
import type { VoiceId } from "../voices";

/** One voice’s full petition copy: UI strings, letter, footer, OG tagline. */
export type VoicePack = {
  id: VoiceId;
  /** Global casing for this voice (must match VOICE_TEXT_CASE[id]). */
  textCase: VoiceTextCase;
  messages: PageMessages;
  Letter: () => ReactNode;
  Footer: () => ReactNode;
  ogTagline: TextSeg[];
};

/** Assert pack textCase matches the SSR-safe map (catches drift at module load). */
export function assertPackTextCase(pack: VoicePack): void {
  if (pack.textCase !== VOICE_TEXT_CASE[pack.id]) {
    throw new Error(`Voice pack ${pack.id} textCase ${pack.textCase} ≠ VOICE_TEXT_CASE`);
  }
}
