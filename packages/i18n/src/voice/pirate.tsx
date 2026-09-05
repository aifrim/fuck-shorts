import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "Parley from the crew",

  countdown: {
    label: "The petition sets sail in",
    hold: (date, time) =>
      `Hold that hate, sailor. Signing weighs anchor ${date}, ${time}.`,
    unannounced: "Signing has not been announced yet, savvy.",
    ended: "Signing is closed. Thanks for signing the articles.",
  },

  tally: {
    lead: "And",
    adjective: "hands on deck",
  },

  sign: {
    cta: "Sign the articles",
    signing: "Signing…",
    // X marks the spot — pirate who can’t write signs with an X.
    thanks: "X",
    alreadyThanks: "X",
  },
  errors: {
    load: "Couldn’t fetch the petition, savvy. Try again.",
    sign: "Couldn’t take yer mark. Try again, sailor.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Upright pictures be fine. Shorts be engineered brainrot. Yarr.",
    },
    pitch: {
      countdown:
        "Signing ain’t open yet — share so the crew is ready. Upright pictures be fine. Shorts be engineered brainrot. Yarr.",
      open: "Ahoy. Parley? Upright pictures be fine, savvy. These Shorts be engineered brainrot. Let us completely disable Shorts, or kill the endless scroll. Yarr.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, or kill the endless scroll. Yarr.",
    },
    greetings: {
      x: "Ahoy @YouTube @nealmohan. Parley?",
      "instagram-threads": "Ahoy @youtube @neal_mohan. Parley?",
      facebook: "Ahoy @YouTube and Neal Mohan. Parley?",
      youtube: "Ahoy @YouTube @nealmohan. Parley?",
      other: "Ahoy YouTube and Neal Mohan. Parley?",
      webShare: "Ahoy @YouTube @nealmohan. Parley?",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where we dropping this, sailor?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text. Yarr.`,
      copyFail: "Couldn’t copy, savvy. Select the text above.",
      shared: "Shared. Thanks. Yarr.",
      shareFail: "Couldn’t share rn, sailor.",
    },
  },
};

export const pirate: VoicePack = {
  id: "pirate",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Ahoy, Neal Mohan, Parley?</p>

      <p className="!mt-6">
        We {love()} YouTube, true as the tide. Long voyages. Strange ports. A hold worth
        sittin&apos; in.
      </p>

      <p>
        Upright pictures be fine, savvy. The crew holds phones. The shape o&apos; the
        glass ain&apos;t the crime.
      </p>

      <p>
        These {vomit("Shorts")} be the rot in the hold. They be{" "}
        {vomit("engineered brainrot")}: swipe, spike, forget, repeat, till a sailor&apos;s
        wits are mush and the feed never runs aground. That ain&apos;t a show. That be a{" "}
        {ink("slot machine with a camera")}, and we&apos;ll not pretend otherwise. Yarr.
      </p>

      <p>
        We ain&apos;t askin&apos; ye to scuttle vertical video. We&apos;re askin&apos; ye
        to quit stuffing this {ink("infinite, unskippable habit")} down our gullets like
        we signed the articles for it.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. Avast with the infinite feed. Either prize
        we&apos;ll take.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">Signed, the crew. We still want a brain aboard. Yarr.</p>
    </>
  ),
  Footer: () => (
    <>
      One <CookieLink /> after ye sign that alerts ye that ye signed.
      <br />
      Selected generation stays in <LocalStorageLink />.
      <br />
      <Closing punchline="That be all. Yarr." />
    </>
  ),
  ogTagline: [
    { t: "Ahoy. Parley? Upright pictures be fine, savvy. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "be " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: ". Yarr." },
  ],
};
