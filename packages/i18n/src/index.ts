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

export { MESSAGES, messagesFor } from "./messages";

export {
  ogCopyFor,
  ogTaglineFor,
  pickRandomOgCopy,
} from "./og-taglines";

export type {
  CountdownCopy,
  FooterNoteCopy,
  OgVoiceCopy,
  PageMessages,
  ShareActionCopy,
  ShareCopy,
  ShareFlashCopy,
  ShareGreetings,
  ShareIntroParts,
  SignCopy,
  TallyCopy,
  VoteErrorCopy,
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
