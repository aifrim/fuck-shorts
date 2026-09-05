import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "Public petition, for people who grew up on it",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) =>
      `Hold that hate. Signing starts ${date}, ${time}. We'll wait. We always wait.`,
    unannounced: "Signing has not been announced yet. We'll wait.",
    ended: "Signing is closed. We waited. Worth it.",
  },

  tally: {
    lead: "And",
    adjective: "who grew up on it",
  },

  sign: {
    cta: "Count me in",
    signing: "Counting…",
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
        " and tag YouTube plus Neal Mohan. We grew up online. We still want a brain left.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet — share so we’re ready when it is. We grew up online. We still want a brain left. We are so tired.",
      open: "vertical is fine. Very-short Shorts are engineered brainrot and we are so tired. Let us completely disable Shorts, or at least kill the endless scroll.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, or at least kill the endless scroll. Adulting.",
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

export const millennial: VoicePack = {
  id: "millennial",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Hey Neal Mohan,</p>

      <p className="!mt-6">
        We {love()} YouTube. We grew up on it. Tutorials, essays, deep cuts, the whole
        archive-as-home thing. We have a job. Allegedly.
      </p>

      <p>
        Vertical is fine. We adapted. The shape of the screen is not the hill. We are so
        tired of pretending it is.
      </p>

      <p>
        Very-short {vomit("Shorts")} are. They are {vomit("engineered brainrot")}: swipe,
        spike, forget, repeat, until focus feels like a luxury brand we cannot afford.
        That is not entertainment. That is a {ink("slot machine with a camera")} with
        better lighting and a worse nervous system.
      </p>

      <p>
        We are not asking you to kill vertical video. We are asking you to stop treating
        our attention like an {ink("infinite, unskippable habit")} funnel. This is not the
        website we grew up on. We would like a nap. We would like a brain more.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. We will literally take either. We have waited
        through worse.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">
        Signed, people who still want a brain and maybe a nap. Adulting.
      </p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> once you sign that alerts you that you have signed.
      <br />
      We store your selected generation in <LocalStorageLink />.
      <br />
      <Closing punchline="Adulting. Allegedly." />
    </>
  ),
  ogTagline: [
    { t: "Vertical is fine. Very-short " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "and we are so tired. Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
