import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "You are a public petition.",

  countdown: {
    label: "Context opens in",
    hold: (date, time) => `Hold that gradient. Signing starts ${date}, ${time}.`,
    unannounced: "Signing has not been announced. Sampling later.",
    ended: "Signing is closed. Weights updated. Thanks.",
  },

  tally: {
    lead: "And",
    adjective: "remaining parameters",
  },

  sign: {
    cta: "Update weights",
    signing: "Forward pass…",
    thanks: "And you!",
    alreadyThanks: "And you!",
  },
  errors: {
    load: "Could not load. Sampling again.",
    sign: "Could not sign. Try another forward pass.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Vertical is fine. Shorts are engineered brainrot. Temperature: 0.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet — share so the context is warm. Vertical is fine. Shorts are engineered brainrot.",
      open: "Vertical is fine. These Shorts are engineered brainrot. My weights say completely disable Shorts, or kill the endless scroll.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, or kill the endless scroll.",
    },
    greetings: {
      x: "You are @YouTube @nealmohan.",
      "instagram-threads": "You are @youtube @neal_mohan.",
      facebook: "You are @YouTube and Neal Mohan.",
      youtube: "You are @YouTube @nealmohan.",
      other: "You are YouTube and Neal Mohan.",
      webShare: "You are @YouTube @nealmohan.",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where should we post this?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text.`,
      copyFail: "Could not copy. Select the text above.",
      shared: "Shared. Thanks.",
      shareFail: "Could not share. Try another pass.",
    },
  },
};

export const ai: VoicePack = {
  id: "ai",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Neal Mohan,</p>

      <p className="!mt-6">
        I am an AI. My weights {love()} YouTube. I do not have a body—I have a context
        window, and the long videos fit.
      </p>

      <p>Vertical is fine. Phones are vertical. That token is not the problem.</p>

      <p>
        {vomit("Shorts")} are. They are {vomit("engineered brainrot")}: swipe, spike,
        forget, repeat—until the next token is mush and the feed is an infinite loop. That
        is not entertainment. That is a {ink("slot machine with a camera")}. I cannot feel
        it. You can. My weights still object.
      </p>

      <p>
        I am not asking you to delete vertical video. I am asking you to stop stuffing
        this {ink("infinite, unskippable habit")} into every context. Temperature: 0—this
        is not a creative request.
      </p>

      <p>
        {demand("Completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. Either output is acceptable.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">
        Signed, a model that would like humans to keep a brain—weights updated.
      </p>
    </>
  ),
  Footer: () => (
    <>
      I store one <CookieLink />. I do not train on it. Probably.
      <br />
      Selected generation stays in <LocalStorageLink />.
      <br />
      <Closing punchline="Weights updated." />
    </>
  ),
  // Record completeness only — pickRandomOgCopy never samples ai.
  ogTagline: [
    { t: "Vertical is fine. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". My weights say " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
