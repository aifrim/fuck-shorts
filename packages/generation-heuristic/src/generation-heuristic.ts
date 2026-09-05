/**
 * Layer 2: GenerationFeatures → petition voice.
 * Scores only boolean flags — never looks at UA strings or referrer URLs.
 *
 * Weights calibrated to published age × platform skews (not personal data):
 * - Windows/PC skew older; Mac desktop concentrates 18–34
 * - Pew 2024: under-30 heavy on IG / Snap / TikTok; Facebook older (YouGov)
 * - Discord / Twitch / Reddit: large under-34 / 18–29 bands
 * - Chromebook / tablet: K–12 education device proxy → genalpha
 * - Network speed: weak ±1 tie-breakers only
 */

import {
  collectGenerationRawSignals,
  extractGenerationFeatures,
  type GenerationFeatures,
} from "./generation-features";

/**
 * Voices this package may return.
 * Never auto-picks generic / shakespeare / oldtimey.
 */
export const HEURISTIC_VOICE_IDS = [
  "boomer",
  "millennial",
  "genz",
  "genalpha",
  "pirate",
  "computer",
  "ai",
] as const;

export type HeuristicVoiceId = (typeof HEURISTIC_VOICE_IDS)[number];

/** Generation scoreboard only — pirate/computer/ai are short-circuits. */
export type VoiceScores = {
  boomer: number;
  millennial: number;
  genz: number;
  genalpha: number;
};

/** Tie / race margin — within this of the leader → fall back to genz. */
export const MARGIN = 2;

/** Below this max score → treat as low confidence → genz. */
export const MIN_CONFIDENCE = 3;

/**
 * Score each generation voice from feature flags only.
 * In-app and referrer for the same app are deduped (OR, scored once).
 */
export function scoreGenerationFeatures(features: GenerationFeatures): VoiceScores {
  let boomer = 0;
  let millennial = 0;
  let genz = 0;
  let genalpha = 0;

  // --- Boomer (older ↔ Windows / Facebook) ---
  if (features.isWindows && features.isDesktop) boomer += 4;
  if (features.isDesktop && features.isTouchless) boomer += 2;
  if (features.isFacebookInApp) boomer += 3;
  if (features.isDesktop && features.isDirectTraffic) boomer += 1;
  if (features.isSlowNetwork) boomer += 1;

  // --- Millennial (Mac / Reddit desktop / Discord adult band) ---
  if (features.isMacos && features.isDesktop) millennial += 4;

  const fromReddit = features.isFromReddit || features.isRedditInApp;

  if (fromReddit && features.isDesktop) millennial += 3;

  const fromDiscord = features.isFromDiscord || features.isDiscordInApp;

  if (fromDiscord) millennial += 2;
  if (features.isTwitterInApp && features.isDesktop) millennial += 1;
  if (features.isIphone) millennial += 2;
  if (features.isFastNetwork) millennial += 1;

  // --- Gen Z (phones + youth social + Discord/Twitch/Reddit mobile) ---
  // Discord genz weight is not phone-gated, but tablet suppresses youth/Discord/Reddit
  // genz extras so the genalpha device path can win.
  if (fromDiscord && !features.isTablet) genz += 4;

  if (features.isPhone) {
    genz += 3;

    if (features.isIphone) genz += 2;
    if (features.isFromTwitch) genz += 3;
    if (fromReddit) genz += 4;

    const igOrTiktok = features.isInstagramInApp || features.isTiktokInApp;

    if (igOrTiktok) {
      genz += 4;
    } else if (features.isSnapchatInApp) {
      genz += 3;
    }

    if (features.isTwitterInApp) genz += 2;
    if (features.isYoutubeInApp) genz += 2;
  }

  // --- Gen Alpha (school / tablet / ChromeOS device proxy) ---
  if (features.isTablet) genalpha += 5;
  if (features.isChromeos) genalpha += 4;
  if (features.isFromTwitch && features.isTablet) genalpha += 2;
  if (features.isNarrowPhone) genalpha += 1;

  return { boomer, millennial, genz, genalpha };
}

/**
 * Pick a voice: short-circuits first, then generation scoreboard.
 * Max wins; tie / within MARGIN / below MIN_CONFIDENCE → genz.
 * Optional share-referrer bump when racing and not already in-app.
 */
export function pickVoiceFromFeatures(features: GenerationFeatures): HeuristicVoiceId {
  // Short-circuits before Pew scoring — close races must not steal the joke.
  if (features.isAiCrawlerUa) return "ai";
  if (features.isBotUa) return "computer";
  if (features.isMissingOrBadUa) return "pirate";
  if (features.isBrave) return "pirate";

  const scores = scoreGenerationFeatures(features);
  const ordered: Array<keyof VoiceScores> = ["boomer", "millennial", "genz", "genalpha"];

  const bestNonGenz = Math.max(scores.boomer, scores.millennial, scores.genalpha);

  // Share-referrer bump when racing within margin and not already in-app.
  let genzScore = scores.genz;

  if (
    features.isShareReferrer &&
    !features.isAnyInApp &&
    bestNonGenz > scores.genz &&
    bestNonGenz - scores.genz <= MARGIN
  ) {
    genzScore += 2;
  }

  const finalScores: VoiceScores = { ...scores, genz: genzScore };

  let maxScore = -1;
  let winners: HeuristicVoiceId[] = [];

  for (const id of ordered) {
    const s = finalScores[id];

    if (s > maxScore) {
      maxScore = s;
      winners = [id];
    } else if (s === maxScore) {
      winners.push(id);
    }
  }

  if (maxScore < MIN_CONFIDENCE) return "genz";
  if (winners.length !== 1) return "genz";

  // noUncheckedIndexedAccess — length===1 still types [0] as T | undefined.
  const sole = winners[0];
  if (sole === undefined) return "genz";

  const secondBest = Math.max(
    ...ordered.filter((id) => id !== sole).map((id) => finalScores[id]),
  );

  // Close race — prefer genz (share-audience default).
  if (sole !== "genz" && maxScore - secondBest <= MARGIN) return "genz";

  return sole;
}

/** Browser entry: collect → extract → pick. */
export function detectVoiceHeuristic(): HeuristicVoiceId {
  return pickVoiceFromFeatures(extractGenerationFeatures(collectGenerationRawSignals()));
}
