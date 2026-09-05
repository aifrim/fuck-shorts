import { mapReactStrings } from "./map-react-strings";
import { applyVoiceCase, voiceTextCase } from "./text-case";
import { LETTERS } from "./voice";
import type { VoiceId } from "./voices";
import type { ReactNode } from "react";

/** Letter body JSX for the selected voice (casing applied). */
export function letterFor(voice: VoiceId): ReactNode {
  const body = LETTERS[voice]();
  const textCase = voiceTextCase(voice);

  if (textCase === "preserve") return body;

  return mapReactStrings(body, (text) => applyVoiceCase(textCase, text));
}
