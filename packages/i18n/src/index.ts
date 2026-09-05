/**
 * Petition copy for every voice — page UI, letter JSX, OG taglines, brand.
 */

export {
  HASHTAG,
  PAGE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  THEME_DARK_LABEL,
  THEME_GROUP_LABEL,
  THEME_LIGHT_LABEL,
} from "./brand";

export { letterFor } from "./letters";

export { footerFor } from "./footer";

export { toAsciiBinary, toAsciiBinaryPreservingSocial } from "./ascii-binary";

export { applyVoiceCase, voiceTextCase, type VoiceTextCase } from "./text-case";

export { MESSAGES, messagesFor, sharePitchFor } from "./messages";

export {
  OG_EXCLUDED_VOICE_IDS,
  OG_VOICE_IDS,
  ogCopyFor,
  ogTaglineFor,
  pickRandomOgCopy,
} from "./og-taglines";

export type {
  CountdownCopy,
  OgVoiceCopy,
  PageMessages,
  ShareActionCopy,
  ShareCopy,
  ShareFlashCopy,
  ShareGreetings,
  ShareIntroParts,
  SharePlatformLabels,
  SharePitchByPhase,
  SignCopy,
  TallyCopy,
  SignErrorCopy,
  TextHighlight,
  TextSeg,
} from "./types";

export {
  DEFAULT_VOICE,
  VOICE_IDS,
  VOICE_STORAGE_KEY,
  VOICES,
  parseStoredVoice,
  type VoiceId,
  type VoiceMeta,
} from "./voices";
