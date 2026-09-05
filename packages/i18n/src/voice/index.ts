import type { ReactNode } from "react";

import type { PageMessages, TextSeg } from "../types";
import type { VoiceId } from "../voices";
import { ai } from "./ai";
import { boomer } from "./boomer";
import { computer } from "./computer";
import { genalpha } from "./genalpha";
import { generic } from "./generic";
import { genz } from "./genz";
import { millennial } from "./millennial";
import { oldtimey } from "./oldtimey";
import { assertPackTextCase, type VoicePack } from "./pack";
import { pirate } from "./pirate";
import { reptile } from "./reptile";
import { shakespeare } from "./shakespeare";

export type { VoicePack } from "./pack";

/** All voice packs keyed by id (order follows VOICE_IDS elsewhere). */
export const VOICE_PACKS: Record<VoiceId, VoicePack> = {
  genalpha,
  genz,
  millennial,
  boomer,
  shakespeare,
  oldtimey,
  pirate,
  computer,
  ai,
  reptile,
  generic,
};

for (const id of Object.keys(VOICE_PACKS) as VoiceId[]) {
  assertPackTextCase(VOICE_PACKS[id]);
}

export const MESSAGES: Record<VoiceId, PageMessages> = {
  genalpha: genalpha.messages,
  genz: genz.messages,
  millennial: millennial.messages,
  boomer: boomer.messages,
  shakespeare: shakespeare.messages,
  oldtimey: oldtimey.messages,
  pirate: pirate.messages,
  computer: computer.messages,
  ai: ai.messages,
  reptile: reptile.messages,
  generic: generic.messages,
};

export const LETTERS: Record<VoiceId, () => ReactNode> = {
  genalpha: genalpha.Letter,
  genz: genz.Letter,
  millennial: millennial.Letter,
  boomer: boomer.Letter,
  shakespeare: shakespeare.Letter,
  oldtimey: oldtimey.Letter,
  pirate: pirate.Letter,
  computer: computer.Letter,
  ai: ai.Letter,
  reptile: reptile.Letter,
  generic: generic.Letter,
};

export const FOOTERS: Record<VoiceId, () => ReactNode> = {
  genalpha: genalpha.Footer,
  genz: genz.Footer,
  millennial: millennial.Footer,
  boomer: boomer.Footer,
  shakespeare: shakespeare.Footer,
  oldtimey: oldtimey.Footer,
  pirate: pirate.Footer,
  computer: computer.Footer,
  ai: ai.Footer,
  reptile: reptile.Footer,
  generic: generic.Footer,
};

export const OG_TAGLINES: Record<VoiceId, TextSeg[]> = {
  genalpha: genalpha.ogTagline,
  genz: genz.ogTagline,
  millennial: millennial.ogTagline,
  boomer: boomer.ogTagline,
  shakespeare: shakespeare.ogTagline,
  oldtimey: oldtimey.ogTagline,
  pirate: pirate.ogTagline,
  computer: computer.ogTagline,
  ai: ai.ogTagline,
  reptile: reptile.ogTagline,
  generic: generic.ogTagline,
};
