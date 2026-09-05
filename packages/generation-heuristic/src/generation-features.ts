/**
 * Layer 1: raw browser signals → GenerationFeatures boolean bag.
 * Does not score or pick a voice — that lives in generation-heuristic.ts.
 */

export type GenerationRawSignals = {
  userAgent: string;
  /** navigator.userAgentData?.platform ?? navigator.platform ?? "" */
  platform: string;
  /** userAgentData?.mobile ?? null */
  uaMobileHint: boolean | null;
  maxTouchPoints: number;
  innerWidth: number;
  /** NetworkInformation.effectiveType or "" */
  effectiveType: string;
  /** document.referrer or "" */
  referrer: string;
  /** true when `navigator.brave` exists (sync; no isBrave() promise) */
  braveNavigator: boolean;
  /** UA-CH brand names from userAgentData.brands */
  uaBrands: readonly string[];
};

export type GenerationFeatures = {
  // device
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // OS
  isIos: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMacos: boolean;
  isChromeos: boolean;
  isLinux: boolean;

  // input / viewport
  isTouchless: boolean;
  isNarrowPhone: boolean;

  // network
  isSlowNetwork: boolean;
  isFastNetwork: boolean;

  // referrer
  isFromDiscord: boolean;
  isFromTwitch: boolean;
  isFromReddit: boolean;
  isFromTwitter: boolean;
  isFromYoutube: boolean;
  isDirectTraffic: boolean;

  // in-app browsers
  isFacebookInApp: boolean;
  isInstagramInApp: boolean;
  isTiktokInApp: boolean;
  isSnapchatInApp: boolean;
  isDiscordInApp: boolean;
  isTwitterInApp: boolean;
  isRedditInApp: boolean;
  isYoutubeInApp: boolean;

  // composites
  isIphone: boolean;
  isShareReferrer: boolean;
  isYouthSocialInApp: boolean;
  isAnyInApp: boolean;

  // short-circuit flags (checked before generation scoring)
  isBrave: boolean;
  isMissingOrBadUa: boolean;
  isAiCrawlerUa: boolean;
  isBotUa: boolean;
};

/** AI crawler UA needles — checked before generic bot tokens. */
const AI_CRAWLER_NEEDLES = [
  "gptbot",
  "chatgpt-user",
  "claudebot",
  "anthropic",
  "google-extended",
  "ccbot",
  "perplexitybot",
  "bytespider",
] as const;

/** Explicit non-AI bot / scraper UA needles. */
const BOT_UA_NEEDLES = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "applebot",
  "curl/",
  "wget/",
  "python-requests",
  "axios/",
  "bot",
  "crawler",
  "spider",
  "scraper",
] as const;

function includesAny(haystack: string, needles: readonly string[]): boolean {
  for (const needle of needles) {
    if (haystack.includes(needle)) return true;
  }

  return false;
}

/** Empty, tiny, or placeholder UA — treat as spoofed / missing. */
function missingOrBadUa(ua: string): boolean {
  if (ua.length === 0) return true;
  if (ua.length < 20) return true;
  if (ua === "-") return true;
  if (ua === "undefined") return true;
  if (ua === "null") return true;

  return false;
}

function brandIncludes(brands: readonly string[], fragment: string): boolean {
  for (const brand of brands) {
    if (brand.includes(fragment)) return true;
  }

  return false;
}

function hostIncludes(referrer: string, fragments: readonly string[]): boolean {
  if (referrer.length === 0) return false;

  let host = referrer;
  const schemeSep = referrer.indexOf("://");

  if (schemeSep >= 0) {
    host = referrer.slice(schemeSep + 3);
  }

  const slash = host.indexOf("/");

  if (slash >= 0) {
    host = host.slice(0, slash);
  }

  const hostLower = host.toLowerCase();

  for (const fragment of fragments) {
    if (hostLower.includes(fragment)) return true;
  }

  return false;
}

/**
 * Pure mapping from raw signals to boolean features.
 * Uses includes / startsWith / simple loops — no regex.
 */
export function extractGenerationFeatures(raw: GenerationRawSignals): GenerationFeatures {
  const ua = raw.userAgent;
  const platform = raw.platform;

  const isIos =
    includesAny(ua, ["iPhone", "iPad", "iPod"]) ||
    (platform === "MacIntel" && raw.maxTouchPoints > 1);

  const isAndroid = ua.includes("Android");
  const isWindows =
    includesAny(ua, ["Windows", "Win32", "Win64"]) || platform.startsWith("Win");
  const isMacos =
    !isIos && (includesAny(ua, ["Macintosh", "Mac OS X"]) || platform.startsWith("Mac"));
  const isChromeos = includesAny(ua, ["CrOS", "ChromeOS"]);
  const isLinux =
    !isAndroid && !isChromeos && (ua.includes("Linux") || platform.startsWith("Linux"));

  // iPadOS desktop-mode UAs look like Mac; treat iPad token or touch Mac as tablet.
  const isIpad =
    ua.includes("iPad") ||
    (platform === "MacIntel" && raw.maxTouchPoints > 1 && !ua.includes("iPhone"));

  const hasMobileToken = ua.includes("Mobile");
  const uaSaysPhone =
    ua.includes("iPhone") ||
    ua.includes("iPod") ||
    (isAndroid && hasMobileToken) ||
    raw.uaMobileHint === true;

  let isPhone = false;
  let isTablet = false;
  let isDesktop = false;

  if (isIpad || (isAndroid && !hasMobileToken && raw.uaMobileHint !== true)) {
    isTablet = true;
  } else if (uaSaysPhone || (raw.uaMobileHint === true && !isIpad)) {
    isPhone = true;
  } else if (
    raw.innerWidth > 0 &&
    raw.innerWidth < 768 &&
    raw.maxTouchPoints > 0 &&
    (isIos || isAndroid)
  ) {
    // Narrow touch mobile without clear tablet markers.
    isPhone = true;
  } else {
    isDesktop = true;
  }

  // Mutually exclusive device class.
  if (isTablet) {
    isPhone = false;
    isDesktop = false;
  } else if (isPhone) {
    isDesktop = false;
  }

  const isTouchless = raw.maxTouchPoints === 0;
  const isNarrowPhone = raw.innerWidth > 0 && raw.innerWidth < 380;

  const effective = raw.effectiveType.toLowerCase();
  const isSlowNetwork = effective === "slow-2g" || effective === "2g";
  // Missing / unknown / 4g / wifi-like → treat as fast (weak millennial tie-break).
  const isFastNetwork = !isSlowNetwork && (effective === "4g" || effective === "");

  const isFromDiscord = hostIncludes(raw.referrer, ["discord.com", "discord.gg"]);
  const isFromTwitch = hostIncludes(raw.referrer, ["twitch.tv"]);
  const isFromReddit = hostIncludes(raw.referrer, ["reddit.com"]);
  const isFromTwitter = hostIncludes(raw.referrer, ["twitter.com", "x.com", "t.co"]);
  const isFromYoutube = hostIncludes(raw.referrer, ["youtube.com", "youtu.be"]);
  const isDirectTraffic = raw.referrer.length === 0;

  const isFacebookInApp = includesAny(ua, ["FBAN", "FBAV", "FB_IAB"]);
  const isInstagramInApp = ua.includes("Instagram");
  const isTiktokInApp = includesAny(ua, ["musical_ly", "TikTok", "BytedanceWebview"]);
  const isSnapchatInApp = ua.includes("Snapchat");
  const isDiscordInApp = ua.includes("Discord");
  const isTwitterInApp = includesAny(ua, ["Twitter", "TwitterAndroid"]);
  const isRedditInApp = ua.includes("Reddit");
  const isYoutubeInApp = ua.includes("YouTube");

  const isIphone = isPhone && isIos;
  const isShareReferrer = isFromDiscord || isFromTwitch || isFromReddit;
  const isYouthSocialInApp =
    isInstagramInApp || isTiktokInApp || isSnapchatInApp || isDiscordInApp;
  const isAnyInApp =
    isFacebookInApp ||
    isInstagramInApp ||
    isTiktokInApp ||
    isSnapchatInApp ||
    isDiscordInApp ||
    isTwitterInApp ||
    isRedditInApp ||
    isYoutubeInApp;

  const uaLower = ua.toLowerCase();
  const isMissingOrBadUa = missingOrBadUa(ua);
  const isAiCrawlerUa = includesAny(uaLower, AI_CRAWLER_NEEDLES);
  // AI crawlers also match "bot"; callers short-circuit AI first.
  const isBotUa = includesAny(uaLower, BOT_UA_NEEDLES);
  const isBrave =
    raw.braveNavigator || ua.includes("Brave") || brandIncludes(raw.uaBrands, "Brave");

  return {
    isPhone,
    isTablet,
    isDesktop,
    isIos,
    isAndroid,
    isWindows,
    isMacos,
    isChromeos,
    isLinux,
    isTouchless,
    isNarrowPhone,
    isSlowNetwork,
    isFastNetwork,
    isFromDiscord,
    isFromTwitch,
    isFromReddit,
    isFromTwitter,
    isFromYoutube,
    isDirectTraffic,
    isFacebookInApp,
    isInstagramInApp,
    isTiktokInApp,
    isSnapchatInApp,
    isDiscordInApp,
    isTwitterInApp,
    isRedditInApp,
    isYoutubeInApp,
    isIphone,
    isShareReferrer,
    isYouthSocialInApp,
    isAnyInApp,
    isBrave,
    isMissingOrBadUa,
    isAiCrawlerUa,
    isBotUa,
  };
}

type NavigatorWithUaData = Navigator & {
  brave?: unknown;
  userAgentData?: {
    platform?: string;
    mobile?: boolean;
    brands?: ReadonlyArray<{ brand?: string }>;
  };
};

type NetworkInformationLike = {
  effectiveType?: string;
};

/**
 * Browser-only collector — thin wrapper around navigator / document.
 * Not unit-tested in depth (plan: out of unit-test scope).
 */
export function collectGenerationRawSignals(): GenerationRawSignals {
  const nav = navigator as NavigatorWithUaData;
  const connection = (nav as Navigator & { connection?: NetworkInformationLike })
    .connection;

  const brandEntries = nav.userAgentData?.brands;
  const uaBrands: string[] = [];

  if (brandEntries) {
    for (const entry of brandEntries) {
      if (typeof entry.brand === "string") uaBrands.push(entry.brand);
    }
  }

  return {
    userAgent: nav.userAgent ?? "",
    platform: nav.userAgentData?.platform ?? nav.platform ?? "",
    uaMobileHint:
      typeof nav.userAgentData?.mobile === "boolean" ? nav.userAgentData.mobile : null,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    innerWidth: typeof window !== "undefined" ? window.innerWidth : 0,
    effectiveType: connection?.effectiveType ?? "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    braveNavigator: typeof nav.brave === "object" && nav.brave !== null,
    uaBrands,
  };
}
