import { describe, expect, it } from "vitest";

import {
  extractGenerationFeatures,
  type GenerationFeatures,
  type GenerationRawSignals,
} from "../src/generation-features";

function raw(overrides: Partial<GenerationRawSignals> = {}): GenerationRawSignals {
  return {
    userAgent: "",
    platform: "",
    uaMobileHint: null,
    maxTouchPoints: 0,
    innerWidth: 1280,
    effectiveType: "",
    referrer: "",
    braveNavigator: false,
    uaBrands: [],
    ...overrides,
  };
}

describe("extractGenerationFeatures", () => {
  it("maps iPhone UA to phone + ios + iphone", () => {
    const features = extractGenerationFeatures(
      raw({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        platform: "iPhone",
        maxTouchPoints: 5,
        innerWidth: 390,
      }),
    );

    expect(features.isPhone).toBe(true);
    expect(features.isTablet).toBe(false);
    expect(features.isDesktop).toBe(false);
    expect(features.isIos).toBe(true);
    expect(features.isIphone).toBe(true);
    expect(features.isAndroid).toBe(false);
  });

  it("maps iPad UA to tablet + ios, not phone", () => {
    const features = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        platform: "iPad",
        maxTouchPoints: 5,
        innerWidth: 820,
      }),
    );

    expect(features.isTablet).toBe(true);
    expect(features.isPhone).toBe(false);
    expect(features.isDesktop).toBe(false);
    expect(features.isIos).toBe(true);
    expect(features.isIphone).toBe(false);
  });

  it("splits Android phone vs tablet on Mobile token", () => {
    const phone = extractGenerationFeatures(
      raw({
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36",
        platform: "Linux armv8l",
        maxTouchPoints: 5,
        innerWidth: 412,
      }),
    );
    const tablet = extractGenerationFeatures(
      raw({
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Safari/537.36",
        platform: "Linux armv8l",
        maxTouchPoints: 5,
        innerWidth: 800,
      }),
    );

    expect(phone.isPhone).toBe(true);
    expect(phone.isAndroid).toBe(true);
    expect(phone.isTablet).toBe(false);

    expect(tablet.isTablet).toBe(true);
    expect(tablet.isAndroid).toBe(true);
    expect(tablet.isPhone).toBe(false);
  });

  it("flags Windows / Mac / CrOS desktops", () => {
    const windows = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        platform: "Win32",
      }),
    );
    const mac = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
        platform: "MacIntel",
      }),
    );
    const chromeos = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)",
        platform: "Linux x86_64",
      }),
    );

    expect(windows.isWindows).toBe(true);
    expect(windows.isDesktop).toBe(true);
    expect(windows.isMacos).toBe(false);

    expect(mac.isMacos).toBe(true);
    expect(mac.isDesktop).toBe(true);
    expect(mac.isWindows).toBe(false);

    expect(chromeos.isChromeos).toBe(true);
    expect(chromeos.isDesktop).toBe(true);
    expect(chromeos.isLinux).toBe(false);
  });

  it("maps referrer hosts to share flags", () => {
    const discord = extractGenerationFeatures(
      raw({ referrer: "https://discord.com/channels/1/2" }),
    );
    const twitch = extractGenerationFeatures(
      raw({ referrer: "https://www.twitch.tv/someone" }),
    );
    const reddit = extractGenerationFeatures(
      raw({ referrer: "https://www.reddit.com/r/youtube/" }),
    );
    const direct = extractGenerationFeatures(raw({ referrer: "" }));

    expect(discord.isFromDiscord).toBe(true);
    expect(discord.isShareReferrer).toBe(true);
    expect(discord.isDirectTraffic).toBe(false);

    expect(twitch.isFromTwitch).toBe(true);
    expect(twitch.isShareReferrer).toBe(true);

    expect(reddit.isFromReddit).toBe(true);
    expect(reddit.isShareReferrer).toBe(true);

    expect(direct.isDirectTraffic).toBe(true);
    expect(direct.isShareReferrer).toBe(false);
  });

  it("detects in-app UA tokens", () => {
    const cases: Array<{
      ua: string;
      flag: keyof GenerationFeatures;
    }> = [
      { ua: "Mozilla/5.0 FBAN/FBIOS FBAV/1.0", flag: "isFacebookInApp" },
      { ua: "Mozilla/5.0 Instagram 300.0.0", flag: "isInstagramInApp" },
      { ua: "Mozilla/5.0 musical_ly_30.0.0", flag: "isTiktokInApp" },
      { ua: "Mozilla/5.0 TikTok 32.0.0", flag: "isTiktokInApp" },
      { ua: "Mozilla/5.0 BytedanceWebview", flag: "isTiktokInApp" },
      { ua: "Mozilla/5.0 Snapchat/12.0", flag: "isSnapchatInApp" },
      { ua: "Mozilla/5.0 Discord/1.0", flag: "isDiscordInApp" },
      { ua: "Mozilla/5.0 TwitterAndroid", flag: "isTwitterInApp" },
      { ua: "Mozilla/5.0 Reddit/2024", flag: "isRedditInApp" },
      { ua: "Mozilla/5.0 YouTube/19.0", flag: "isYoutubeInApp" },
    ];

    for (const { ua, flag } of cases) {
      const features = extractGenerationFeatures(raw({ userAgent: ua }));

      expect(features[flag]).toBe(true);
      expect(features.isAnyInApp).toBe(true);
    }
  });

  it("flags Discord in-app with empty referrer", () => {
    const features = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 Discord/1.0 Mobile",
        referrer: "",
      }),
    );

    expect(features.isDiscordInApp).toBe(true);
    expect(features.isFromDiscord).toBe(false);
    expect(features.isYouthSocialInApp).toBe(true);
    expect(features.isDirectTraffic).toBe(true);
  });

  it("sets youth composite when IG and TikTok both present", () => {
    const features = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 Instagram TikTok Mobile",
      }),
    );

    expect(features.isInstagramInApp).toBe(true);
    expect(features.isTiktokInApp).toBe(true);
    expect(features.isYouthSocialInApp).toBe(true);
  });

  it("maps touchless, narrow phone, and network flags", () => {
    const touchless = extractGenerationFeatures(
      raw({ maxTouchPoints: 0, innerWidth: 1440 }),
    );
    const narrow = extractGenerationFeatures(
      raw({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        maxTouchPoints: 5,
        innerWidth: 360,
      }),
    );
    const slow = extractGenerationFeatures(raw({ effectiveType: "2g" }));
    const fast4g = extractGenerationFeatures(raw({ effectiveType: "4g" }));
    const fastEmpty = extractGenerationFeatures(raw({ effectiveType: "" }));

    expect(touchless.isTouchless).toBe(true);
    expect(narrow.isNarrowPhone).toBe(true);
    expect(slow.isSlowNetwork).toBe(true);
    expect(slow.isFastNetwork).toBe(false);
    expect(fast4g.isFastNetwork).toBe(true);
    expect(fastEmpty.isFastNetwork).toBe(true);
  });

  it("flags empty or short UA as missing/bad", () => {
    expect(extractGenerationFeatures(raw()).isMissingOrBadUa).toBe(true);
    expect(extractGenerationFeatures(raw({ userAgent: "-" })).isMissingOrBadUa).toBe(
      true,
    );
    expect(
      extractGenerationFeatures(raw({ userAgent: "short-agent" })).isMissingOrBadUa,
    ).toBe(true);
  });

  it("flags GPTBot as AI crawler and Googlebot/curl as bot", () => {
    const gpt = extractGenerationFeatures(
      raw({
        userAgent:
          "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0",
      }),
    );
    const google = extractGenerationFeatures(
      raw({
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }),
    );
    const curl = extractGenerationFeatures(raw({ userAgent: "curl/8.0.1" }));

    expect(gpt.isAiCrawlerUa).toBe(true);
    expect(gpt.isBotUa).toBe(true);
    expect(google.isAiCrawlerUa).toBe(false);
    expect(google.isBotUa).toBe(true);
    expect(curl.isBotUa).toBe(true);
    expect(curl.isMissingOrBadUa).toBe(true);
  });

  it("flags Brave via navigator, UA token, or UA-CH brand", () => {
    const longChrome =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    const viaNav = extractGenerationFeatures(
      raw({ userAgent: longChrome, braveNavigator: true }),
    );
    const viaUa = extractGenerationFeatures(
      raw({
        userAgent: `${longChrome} Brave/1.60`,
      }),
    );
    const viaBrand = extractGenerationFeatures(
      raw({ userAgent: longChrome, uaBrands: ["Chromium", "Brave", "Not-A.Brand"] }),
    );

    expect(viaNav.isBrave).toBe(true);
    expect(viaUa.isBrave).toBe(true);
    expect(viaBrand.isBrave).toBe(true);
  });
});
