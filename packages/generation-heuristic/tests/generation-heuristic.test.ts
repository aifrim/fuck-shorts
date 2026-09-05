import { describe, expect, it } from "vitest";

import type { GenerationFeatures } from "../src/generation-features";
import {
  pickVoiceFromFeatures,
  scoreGenerationFeatures,
} from "../src/generation-heuristic";

/** All-false bag; override only the flags under test. */
function features(
  overrides: Partial<GenerationFeatures> = {},
): GenerationFeatures {
  return {
    isPhone: false,
    isTablet: false,
    isDesktop: false,
    isIos: false,
    isAndroid: false,
    isWindows: false,
    isMacos: false,
    isChromeos: false,
    isLinux: false,
    isTouchless: false,
    isNarrowPhone: false,
    isSlowNetwork: false,
    isFastNetwork: false,
    isFromDiscord: false,
    isFromTwitch: false,
    isFromReddit: false,
    isFromTwitter: false,
    isFromYoutube: false,
    isDirectTraffic: false,
    isFacebookInApp: false,
    isInstagramInApp: false,
    isTiktokInApp: false,
    isSnapchatInApp: false,
    isDiscordInApp: false,
    isTwitterInApp: false,
    isRedditInApp: false,
    isYoutubeInApp: false,
    isIphone: false,
    isShareReferrer: false,
    isYouthSocialInApp: false,
    isAnyInApp: false,
    ...overrides,
  };
}

describe("pickVoiceFromFeatures", () => {
  it("picks boomer for Windows desktop touchless direct", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isDesktop: true,
          isWindows: true,
          isTouchless: true,
          isDirectTraffic: true,
        }),
      ),
    ).toBe("boomer");
  });

  it("picks millennial for Mac desktop", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isDesktop: true,
          isMacos: true,
        }),
      ),
    ).toBe("millennial");
  });

  it("picks genz for phone + Discord in-app without referrer", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isDiscordInApp: true,
          isYouthSocialInApp: true,
          isAnyInApp: true,
          isDirectTraffic: true,
        }),
      ),
    ).toBe("genz");
  });

  it("picks genz for phone + Discord referrer without in-app", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isFromDiscord: true,
          isShareReferrer: true,
        }),
      ),
    ).toBe("genz");
  });

  it("does not double-count Discord referrer + in-app", () => {
    const both = features({
      isPhone: true,
      isFromDiscord: true,
      isDiscordInApp: true,
      isShareReferrer: true,
      isYouthSocialInApp: true,
      isAnyInApp: true,
    });
    const referrerOnly = features({
      isPhone: true,
      isFromDiscord: true,
      isShareReferrer: true,
    });

    expect(scoreGenerationFeatures(both).genz).toBe(
      scoreGenerationFeatures(referrerOnly).genz,
    );
    expect(pickVoiceFromFeatures(both)).toBe("genz");
  });

  it("picks genz for phone + Twitch", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isFromTwitch: true,
          isShareReferrer: true,
        }),
      ),
    ).toBe("genz");
  });

  it("picks genalpha for tablet", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isTablet: true,
        }),
      ),
    ).toBe("genalpha");
  });

  it("picks genalpha for ChromeOS + tablet", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isTablet: true,
          isChromeos: true,
        }),
      ),
    ).toBe("genalpha");
  });

  it("defaults to genz when all flags false / low confidence", () => {
    expect(pickVoiceFromFeatures(features())).toBe("genz");
  });

  it("picks boomer for Facebook in-app + Windows desktop", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isDesktop: true,
          isWindows: true,
          isFacebookInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("boomer");
  });

  it("picks millennial for Reddit in-app + Mac desktop", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isDesktop: true,
          isMacos: true,
          isRedditInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("millennial");
  });

  it("picks genz for Reddit in-app + phone", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isRedditInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("genz");
  });

  it("picks genz for TikTok in-app + phone", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isTiktokInApp: true,
          isYouthSocialInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("genz");
  });

  it("caps IG + TikTok in-app on phone (same genz bucket)", () => {
    const both = features({
      isPhone: true,
      isInstagramInApp: true,
      isTiktokInApp: true,
      isYouthSocialInApp: true,
      isAnyInApp: true,
    });
    const tiktokOnly = features({
      isPhone: true,
      isTiktokInApp: true,
      isYouthSocialInApp: true,
      isAnyInApp: true,
    });

    expect(scoreGenerationFeatures(both).genz).toBe(
      scoreGenerationFeatures(tiktokOnly).genz,
    );
    expect(pickVoiceFromFeatures(both)).toBe("genz");
  });

  it("picks genz for Snap in-app + phone", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isPhone: true,
          isSnapchatInApp: true,
          isYouthSocialInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("genz");
  });

  it("picks genalpha for IG in-app + tablet (tablet beats youth in-app)", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isTablet: true,
          isInstagramInApp: true,
          isYouthSocialInApp: true,
          isAnyInApp: true,
        }),
      ),
    ).toBe("genalpha");
  });

  it("picks genalpha for Twitch + tablet", () => {
    expect(
      pickVoiceFromFeatures(
        features({
          isTablet: true,
          isFromTwitch: true,
          isShareReferrer: true,
        }),
      ),
    ).toBe("genalpha");
  });

  it("falls back to genz on tie / within margin", () => {
    // Artificial near-tie: boomer 4 vs genz 3 → within MARGIN → genz.
    const near = features({
      isDesktop: true,
      isWindows: true,
      // no touchless / facebook / direct → boomer = 4
      isPhone: true,
      // phone alone → genz = 3; within margin of boomer
      // But isDesktop and isPhone are mutually exclusive in extractor;
      // hand-built fixture can still probe the decision rule.
    });

    // Force scores via conflicting device flags in the fixture.
    expect(pickVoiceFromFeatures(near)).toBe("genz");
  });
});
