import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "A public petition, writ in the old tongue",

  countdown: {
    label: "The petition opens anon",
    hold: (date, time) => `Hold thy spite. Signing commenceth ${date}, ${time}.`,
    unannounced: "Signing hath not been announced.",
    ended: "Signing is closed. Thanks for thy mark.",
  },

  tally: {
    lead: "And",
    adjective: "souls yet possessed of wit",
  },

  sign: {
    cta: "Make thy mark",
    signing: "Marking…",
    thanks: "And thee!",
    alreadyThanks: "And thee!",
  },
  errors: {
    load: "The petition would not load. Prithee try again.",
    sign: "Thy mark would not take. Prithee try again.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Vertical is well enough. Shorts are engineered brainrot.",
    },
    pitch: {
      countdown:
        "Signing opens anon — share so souls are ready. Vertical is well enough. Shorts are engineered brainrot.",
      open: "'tis well that video stand upright. These Shorts are engineered brainrot. Prithee completely disable Shorts, else kill the endless scroll.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, else kill the endless scroll.",
    },
    greetings: {
      x: "Hark, @YouTube @nealmohan",
      "instagram-threads": "Hark, @youtube @neal_mohan",
      facebook: "Hark, @YouTube and Neal Mohan",
      youtube: "Hark, @YouTube @nealmohan",
      other: "Hark, YouTube and Neal Mohan",
      webShare: "Hark, @YouTube @nealmohan",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where shall we post this?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text.`,
      copyFail: "Couldn’t copy. Prithee select the text above.",
      shared: "Shared. Thanks.",
      shareFail: "Couldn’t share. Prithee try again.",
    },
  },
};

export const shakespeare: VoicePack = {
  id: "shakespeare",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Hark, Neal Mohan, most sovereign of the glass,</p>

      <p className="!mt-6">
        We {love()} YouTube, and have loved it long. Marry, we do. The long plays. The odd
        corners. A house wherein a soul might abide with a tale longer than a sneeze.
        Verily, &apos;tis home.
      </p>

      <p>
        That video stand upright is well enough. Folk do hold their phones. The fashion of
        the glass is no crime. Wherefore blame the shape? Nay.
      </p>

      <p>
        These {vomit("Shorts")} are the matter, the canker in the rose. They are{" "}
        {vomit("engineered brainrot")}: swipe, spike, forget, again, till wit is porridge
        and the feed hath no end. Entertainment it is not. &apos;Tis a{" "}
        {ink("slot machine with a camera")}, and a pox upon it. Fie upon the infinite
        feed!
      </p>

      <p>
        Slay vertical video? Nay, forsooth. Cease thou stuffing this{" "}
        {ink("infinite, unskippable habit")} into every chamber of the app, as though we
        had begged it of thee. We did not. Methinks thou knowest this.
      </p>

      <p>
        Prithee {demand("completely disable Shorts")}. Else, at the least,{" "}
        {demand("kill the endless scroll")}. Do it anon, or we are undone.
      </p>

      <p className="!mt-6">
        {ink("Fix it.")} We charge thee, by thy office and thy oath.
      </p>

      <p className="!mt-6">
        Signed, souls that would remain possessed of a brain, and of wit enough to use it.
      </p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> once thou sign that alerts thee that thou hast signed.
      <br />
      We store thy selected generation in <LocalStorageLink />.
      <br />
      <Closing punchline="That is all, and 'tis enough." />
    </>
  ),
  ogTagline: [
    { t: "'Tis well that video stand upright. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Prithee " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", else " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
