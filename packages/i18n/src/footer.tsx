import type { ReactNode } from "react";

import { mapReactStrings } from "./map-react-strings";
import { applyVoiceCase, voiceTextCase } from "./text-case";
import { FOOTERS } from "./voice";
import type { VoiceId } from "./voices";

/** Footer body JSX for the selected voice (links included; casing applied). */
export function footerFor(voice: VoiceId): ReactNode {
  const body = FOOTERS[voice]();
  const textCase = voiceTextCase(voice);

  if (textCase === "preserve") return body;

  return mapReactStrings(body, (text) => applyVoiceCase(textCase, text));
}
