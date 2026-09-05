import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "Public petition",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) => `Signing starts ${date}, ${time}.`,
    unannounced: "Signing has not been announced yet.",
    ended: "Signing is closed. Thanks for being here.",
  },

  tally: {
    lead: "And",
    adjective: "good people",
  },

  sign: {
    cta: "Sign",
    signing: "Signing…",
    thanks: "And you!",
    alreadyThanks: "And you!",
  },
  errors: {
    load: "Couldn’t load the petition. Please try again.",
    sign: "Couldn’t sign. Please try again.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Vertical is fine. Very-short Shorts aren’t.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet — but Shorts still suck. Share now so we hit hard when it opens. Vertical is fine. Very-short Shorts aren’t.",
      open: "vertical is fine. Very-short Shorts suck. Let us completely disable Shorts, or at least kill the endless scroll.",
      ended:
        "Signing is closed — we showed up. Keep pressure on YouTube: completely disable Shorts, or at least kill the endless scroll.",
    },
    greetings: {
      x: "Hey @YouTube @nealmohan",
      "instagram-threads": "Hey @youtube @neal_mohan",
      facebook: "Hey @YouTube and Neal Mohan",
      youtube: "Hey @YouTube @nealmohan",
      other: "Hey YouTube and Neal Mohan",
      webShare: "Hey @YouTube @nealmohan",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where do you want to share?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text.`,
      copyFail: "Couldn’t copy right now. Try selecting the text above.",
      shared: "Shared. Thanks.",
      shareFail: "Couldn’t share right now.",
    },
  },
};

export const generic: VoicePack = {
  id: "generic",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Neal Mohan,</p>

      <p className="!mt-6">We {love()} YouTube.</p>

      <p>Vertical is fine. People hold phones. The format is not the crime.</p>

      <p>
        Very-short {vomit("Shorts")} are. They are {vomit("engineered brainrot")}: swipe,
        spike, forget, repeat, until attention is mush and the feed never ends. That is
        not entertainment. That is a {ink("slot machine with a camera")}.
      </p>

      <p>
        We are not asking you to kill vertical video. We are asking you to stop stuffing
        it down our throats as an {ink("infinite, unskippable habit")}.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">Signed, people who still want a brain.</p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> once you sign that alerts you that you have signed.
      <br />
      We store your selected generation in <LocalStorageLink />.
      <br />
      <Closing />
    </>
  ),
  ogTagline: [
    { t: "Vertical is fine. Very-short " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "suck. Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
