import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "fuck", line2: "shorts" },
  eyebrow: "public petition, no notes",

  countdown: {
    label: "petition drops in",
    hold: (date, time) => `hold that hate. signing goes live ${date}, ${time}. no notes.`,
    unannounced: "signing has not been announced yet. no notes.",
    ended: "signing is closed. no notes.",
  },

  tally: {
    lead: "And",
    adjective: "no notes people",
  },

  sign: {
    cta: "i’m in",
    signing: "locking in…",
    thanks: "and you!",
    alreadyThanks: "and you!",
  },
  errors: {
    load: "couldn’t load the petition. refresh and try again.",
    sign: "couldn’t sign. refresh and try again.",
  },

  share: {
    eyebrow: "then tell YouTube",
    intro: {
      before: "post with ",
      after:
        " and tag YouTube plus Neal Mohan. vertical is chill. Shorts brainrot is not. no notes.",
    },
    pitch: {
      countdown:
        "signing isn’t open yet — share anyway so the drop hits. vertical is chill. Shorts brainrot is not. no notes.",
      open: "vertical is fine. Shorts are pure engineered brainrot tho. let us completely disable Shorts, or at least kill the endless scroll. no notes.",
      ended:
        "signing is closed — we showed up. keep the pressure: completely disable Shorts, or at least kill the endless scroll. no notes.",
    },
    greetings: {
      x: "ok @YouTube @nealmohan",
      "instagram-threads": "ok @youtube @neal_mohan",
      facebook: "ok @YouTube and Neal Mohan",
      youtube: "ok @YouTube @nealmohan",
      other: "ok YouTube and Neal Mohan",
      webShare: "ok @YouTube @nealmohan",
    },
    platforms: {
      youtube: "youtube",
      x: "x / twitter",
      "instagram-threads": "instagram / threads",
      facebook: "facebook",
      other: "dm / other",
    },
    where: "where are we posting this?",
    sheet: "share sheet",
    actions: {
      copy: "copy share text",
      copying: "copying…",
      share: "share this petition",
      sharing: "sharing…",
    },
    flash: {
      copied: (label) => `copied ${label} text.`,
      copyFail: "couldn’t copy rn. try selecting the text above.",
      shared: "shared. thanks.",
      shareFail: "couldn’t share rn.",
    },
  },
};

export const genz: VoicePack = {
  id: "genz",
  textCase: "lower",
  messages,
  Letter: () => (
    <>
      <p>ok neal mohan,</p>

      <p className="!mt-6">
        we {love()} youtube. like, actually. the long stuff. the weird niches. the comfort
        rewatches. no notes.
      </p>

      <p>vertical is fine. we live on phones. format is not the villain. be so fr.</p>

      <p>
        {vomit("Shorts")} though. they are {vomit("engineered brainrot")}: swipe, spike,
        void, repeat, until your attention span files for unemployment. not entertainment.
        a {ink("slot machine with a camera")}. the audacity.
      </p>

      <p>
        nobody said delete vertical. we said stop force-feeding this{" "}
        {ink("infinite, unskippable habit")} like it is a personality. it&apos;s giving
        casino and we are so not doing that.
      </p>

      <p>
        let us {demand("completely disable Shorts")}. or at least{" "}
        {demand("kill the endless scroll")}. be so fr.
      </p>

      <p className="!mt-6">{ink("fix it.")}</p>

      <p className="!mt-6">
        signed, people who would like one (1) remaining brain cell. no notes.
      </p>
    </>
  ),
  Footer: () => (
    <>
      One <CookieLink /> after you sign that alerts you that you signed.
      <br />
      Selected generation lives in <LocalStorageLink />.
      <br />
      <Closing punchline="that’s it. no notes." />
    </>
  ),
  ogTagline: [
    { t: "vertical is fine. " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are pure " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "tho. let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "kill the endless scroll. ", highlight: "demand" },
    { t: "no notes.", highlight: "ink" },
  ],
};
