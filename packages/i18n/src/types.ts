/** Semantic highlight roles shared by letter JSX and OG tagline segments. */
export type TextHighlight = "vomit" | "demand" | "ink" | "love";

/** Plain-text segment for OG / Satori (not Solid JSX). */
export type TextSeg = {
  t: string;
  highlight?: TextHighlight;
};

/** Share-section intro split around #FuckShorts (hashtag stays bold at render). */
export type ShareIntroParts = {
  before: string;
  after: string;
};

/** Platform openers (handles stay; diction shifts with voice). */
export type ShareGreetings = {
  x: string;
  "instagram-threads": string;
  facebook: string;
  youtube: string;
  other: string;
  /** Default body when using the system share sheet. */
  webShare: string;
};

/** Copy / share button idle + busy labels. */
export type ShareActionCopy = {
  copy: string;
  copying: string;
  share: string;
  sharing: string;
};

/** SharePrompt success / failure flashes. */
export type ShareFlashCopy = {
  /**
   * Shown after clipboard copy.
   * `platformLabel` is the SharePrompt chip name (e.g. "X / Twitter", "DM / Other"),
   * not a greeting or handle — used in “Copied {label} text.”
   */
  copied: (platformLabel: string) => string;
  copyFail: string;
  shared: string;
  shareFail: string;
};

/** SharePrompt copy for one voice. */
export type ShareCopy = {
  eyebrow: string;
  intro: ShareIntroParts;
  pitch: string;
  greetings: ShareGreetings;
  where: string;
  sheet: string;
  actions: ShareActionCopy;
  flash: ShareFlashCopy;
};

/** Stacked tally: “And” / count / adjective. */
export type TallyCopy = {
  lead: string;
  adjective: string;
};

/** Sign button + post-sign thanks. */
export type SignCopy = {
  cta: string;
  signing: string;
  thanks: string;
  alreadyThanks: string;
};

/** VotePanel load / sign failure messages. */
export type VoteErrorCopy = {
  load: string;
  sign: string;
};

/** Pre-open countdown label + hold message. */
export type CountdownCopy = {
  label: string;
  /** Assemble with formatted UTC date + time from VotePanel. */
  hold: (date: string, time: string) => string;
};

/** Footer note around the local-storage link + signature-count line. */
export type FooterNoteCopy = {
  before: string;
  /** Closes the local-storage sentence (usually "."). */
  afterStorage: string;
  /** Starts on its own line (signature count + voice punchline). */
  line2: string;
};

/**
 * All user-facing landing copy for one voice “locale”
 * (letter body lives in letters.tsx).
 */
export type PageMessages = {
  eyebrow: string;
  countdown: CountdownCopy;
  tally: TallyCopy;
  sign: SignCopy;
  errors: VoteErrorCopy;
  share: ShareCopy;
  footer: FooterNoteCopy;
};

/** Eyebrow + highlighted tagline for OG image rendering. */
export type OgVoiceCopy = {
  voice: string;
  eyebrow: string;
  tagline: TextSeg[];
};
