import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "FUCK", line2: "SHORTS" },
  eyebrow: "Public petition. Chat is here.",

  countdown: {
    label: "Petition goes live in",
    hold: (date, time) =>
      `Hold that hate, chat. Signing unlocks ${date}, ${time}. Low-key worth it.`,
    unannounced: "Signing has not been announced yet, chat.",
    ended: "Signing is closed, chat. W for showing up.",
  },

  tally: {
    lead: "And",
    adjective: "kings who locked this in",
  },

  sign: {
    cta: "Lock In",
    signing: "Locking in…",
    thanks: "And you, king!",
    alreadyThanks: "And you, king!",
  },
  errors: {
    load: "Couldn’t load the petition. Try again, chat.",
    sign: "Couldn’t sign. Try again, chat.",
  },

  share: {
    eyebrow: "Then tell YouTube. Yo.",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Chat is typing. Aura check: Shorts low-key mid. Based take only.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet, chat — share so the unlock hits different. Aura check: Shorts low-key mid. Based take only.",
      open: "chat says vertical is high-key fine. Shorts are engineered brainrot though. That is a massive L. Completely disable Shorts, or at least unalive the endless scroll. W petition.",
      ended:
        "Signing is closed — we showed up, chat. Keep the pressure: completely disable Shorts, or at least unalive the endless scroll. W.",
    },
    greetings: {
      x: "Yo @YouTube @nealmohan",
      "instagram-threads": "Yo @youtube @neal_mohan",
      facebook: "Yo @YouTube and Neal Mohan",
      youtube: "Yo @YouTube @nealmohan",
      other: "Yo YouTube and Neal Mohan",
      webShare: "Yo @YouTube @nealmohan",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where we dropping this?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text. W.`,
      copyFail: "Couldn’t copy rn. Select the text above.",
      shared: "Shared. W. Thanks.",
      shareFail: "Couldn’t share rn. Massive L.",
    },
  },
};

/** Gen Alpha / streamer: aura, based/mid, W/L, parasocial — Yo over Dear for chat energy. */
export const genalpha: VoicePack = {
  id: "genalpha",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Yo Neal Mohan,</p>

      <p className="!mt-6">
        We {love()} YouTube. Real talk. Parasocial but sincere. Chat agrees. No cap.
      </p>

      <p>
        Vertical is high-key fine. Aura check: phones are tall. Format is based. Not the
        villain.
      </p>

      <p>
        {vomit("Shorts")} though. Low-key mid. They are {vomit("engineered brainrot")}:
        swipe, spike, forget, repeat, until your attention span rage quits. Not content. A{" "}
        {ink("slot machine with a camera")} and chat is not wrong for saying so. Massive
        L.
      </p>

      <p>
        Nobody asked to delete vertical. We asked you to stop force-feeding this{" "}
        {ink("infinite, unskippable habit")} like it is a bit. Stay based. This is not.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("unalive the endless scroll")}. Chat votes W either way.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">Signed, chat. Lock in. Stay based.</p>
    </>
  ),
  Footer: () => (
    <>
      One <CookieLink /> after you sign that alerts you that you signed.
      <br />
      Selected generation stays in <LocalStorageLink />.
      <br />
      <Closing punchline="Stay based." />
    </>
  ),
  ogTagline: [
    { t: "Chat says vertical is high-key fine. " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot ", highlight: "vomit" },
    { t: "though. That is a " },
    { t: "massive L. ", highlight: "ink" },
    { t: "Completely disable Shorts", highlight: "demand" },
    { t: ", or at least " },
    { t: "unalive the endless scroll", highlight: "demand" },
    { t: "." },
  ],
};
