/** Semantic highlight roles shared by letter JSX and OG tagline segments. */
export type TextHighlight = "vomit" | "demand" | "ink" | "love";

/** Plain-text segment for OG / Satori (not React JSX). */
export type TextSeg = {
  t: string;
  highlight?: TextHighlight;
};

/** Share-section intro split around #FuckShorts (hashtag stays bold at render). */
export type ShareIntroParts = {
  before: string;
  after: string;
};

/**
 * Social share body pitch by petition window.
 * `unannounced` UI uses `countdown` copy.
 */
export type SharePitchByPhase = {
  countdown: string;
  open: string;
  ended: string;
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

/** Share destination chip labels (same keys as greetings, minus webShare). */
export type SharePlatformLabels = {
  youtube: string;
  x: string;
  "instagram-threads": string;
  facebook: string;
  other: string;
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
  pitch: SharePitchByPhase;
  greetings: ShareGreetings;
  /** Destination chip labels shown in the radiogroup. */
  platforms: SharePlatformLabels;
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

/** SignPanel load / sign failure messages. */
export type SignErrorCopy = {
  load: string;
  sign: string;
};

/** Pre-open countdown label + hold message, or unannounced when no start date. */
export type CountdownCopy = {
  label: string;
  /** Assemble with formatted UTC date + time from SignPanel. */
  hold: (date: string, time: string) => string;
  /** Shown when PUBLIC_PETITION_START / PETITION_START is unset. */
  unannounced: string;
  /** Shown after PUBLIC_PETITION_END / PETITION_END has passed. */
  ended: string;
};

/**
 * All user-facing landing chrome for one voice “locale”
 * (letter + footer + OG live beside messages in `voice/<id>.tsx`).
 */
export type PageMessages = {
  /** Hero brand stacked on two lines. */
  title: {
    line1: string;
    line2: string;
  };
  eyebrow: string;
  countdown: CountdownCopy;
  tally: TallyCopy;
  sign: SignCopy;
  errors: SignErrorCopy;
  share: ShareCopy;
};

/** Eyebrow + highlighted tagline for OG image rendering. */
export type OgVoiceCopy = {
  voice: string;
  eyebrow: string;
  tagline: TextSeg[];
};
