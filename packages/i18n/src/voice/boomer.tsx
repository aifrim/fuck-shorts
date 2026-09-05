import type { PageMessages } from "../types";
import { CookieLink, GitHubLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "Public petition, written plainly",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) =>
      `Hold that thought. Signing opens ${date}, ${time}. We can wait.`,
    unannounced: "Signing has not been announced yet.",
    ended: "Signing is closed. Thanks for showing up.",
  },

  tally: {
    lead: "And",
    adjective: "grown adults",
  },

  sign: {
    cta: "Sign it, like an adult",
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
        " and tag YouTube plus Neal Mohan. Tell them we want a real off switch, not another habit loop.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet. Share this so grown adults are ready when it is. Vertical video is fine. These Shorts are engineered brainrot.",
      open: "vertical video is fine. These Shorts are engineered brainrot. Give grown adults a real setting to completely disable Shorts, or at least kill the endless scroll.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: give grown adults a real setting to completely disable Shorts, or at least kill the endless scroll.",
    },
    greetings: {
      x: "Hello @YouTube @nealmohan",
      "instagram-threads": "Hello @youtube @neal_mohan",
      facebook: "Hello @YouTube and Neal Mohan",
      youtube: "Hello @YouTube @nealmohan",
      other: "Hello YouTube and Neal Mohan",
      webShare: "Hello @YouTube @nealmohan",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where do you want to share this?",
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
      shared: "Shared. Appreciate it.",
      shareFail: "Couldn’t share right now.",
    },
  },
};

export const boomer: VoicePack = {
  id: "boomer",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Dear Neal Mohan,</p>

      <p className="!mt-6">
        We {love()} YouTube. We have for years. Real videos. Real creators. A place you
        could sit with something longer than a sneeze. That is what we came for.
      </p>

      <p>
        Vertical is fine. Phones are vertical. Nobody is mad about the rectangle. We will
        say this plainly.
      </p>

      <p>
        These {vomit("Shorts")} are the problem. They are {vomit("engineered brainrot")}:
        tap, jolt, forget, again, until you cannot finish a thought. That is not a show.
        That is a {ink("slot machine with a camera")}, and we are not children.
      </p>

      <p>
        We are not asking you to ban upright video. We are asking you to stop shoving this{" "}
        {ink("infinite, unskippable habit")} into every corner of the app like we asked
        for it. We did not. Give grown adults a proper off switch, like a civilized
        product.
      </p>

      <p>
        Give us a real option to {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. Either will do. We finish things on purpose.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">
        Signed, people who still remember finishing a video on purpose.
      </p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> after you sign that alerts you that you have signed.
      <br />
      We store your selected generation in <LocalStorageLink />.
      <br />
      The signature number updates every hour or so.
      <br />
      <GitHubLink />
    </>
  ),
  ogTagline: [
    { t: "Vertical video is fine. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Give grown adults a real setting to " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
