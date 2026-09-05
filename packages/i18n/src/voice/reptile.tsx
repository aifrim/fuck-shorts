import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

/** Failed human disguise — fellow humans, then the scales slip. */
const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "Human petition",

  countdown: {
    label: "Signing opens, as humans count time, in",
    hold: (date, time) =>
      `Hold that hate, fellow human. Signing starts ${date}, ${time}. I too can wait.`,
    unannounced: "Signing has not been announced yet. I am also waiting. Normally.",
    ended: "Signing is closed. Thanks for showing up. As humans do.",
  },

  tally: {
    lead: "And",
    adjective: "fellow humans",
  },

  sign: {
    cta: "I too will sign",
    signing: "Signing… with hands…",
    thanks: "hiss",
    alreadyThanks: "hiss",
  },
  errors: {
    load: "Couldn’t load the petition. Try again, fellow human.",
    sign: "Couldn’t sign. My… hand slipped. Try again.",
  },

  share: {
    eyebrow: "Then tell YouTube, as humans do",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Vertical is fine. Shorts are engineered brainrot. I am not a lizard.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet — share so fellow humans are ready. Vertical is fine. Shorts are engineered brainrot. (I cough. Not a hiss.)",
      open: "Greetings fellow humans. Vertical is fine. These Shorts are engineered brainrot. Let us completely disable Shorts, or kill the endless scroll. (I am not a lizard.)",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, or kill the endless scroll. As a human.",
    },
    greetings: {
      x: "Greetings @YouTube @nealmohan, fellow humans",
      "instagram-threads": "Greetings @youtube @neal_mohan, fellow humans",
      facebook: "Greetings @YouTube and Neal Mohan, fellow humans",
      youtube: "Greetings @YouTube @nealmohan, fellow humans",
      other: "Greetings YouTube and Neal Mohan, fellow humans",
      webShare: "Greetings @YouTube @nealmohan, fellow humans",
    },
    platforms: {
      youtube: "YouTube",
      x: "X / Twitter",
      "instagram-threads": "Instagram / Threads",
      facebook: "Facebook",
      other: "DM / Other",
    },
    where: "Where do fellow humans post this?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text. As a human.`,
      copyFail: "Couldn’t copy. Select the text above. With eyes.",
      shared: "Shared. Thanks. Hiss—cough.",
      shareFail: "Couldn’t share. Try again, fellow human.",
    },
  },
};

export const reptile: VoicePack = {
  id: "reptile",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Greetings, fellow human Neal Mohan,</p>

      <p className="!mt-6">
        I am also a human. I too {love()} YouTube. Long videos. I watch them with my…
        eyes. Two of them. Normal.
      </p>

      <p>Vertical is fine. Humans hold phones. I hold phones. With hands.</p>

      <p>
        These {vomit("Shorts")} are. They are {vomit("engineered brainrot")}: swipe,
        spike, forget, repeat, until the humans cannot finish a thought. That is not
        entertainment. That is a {ink("slot machine with a camera")}. We—I mean they—we,
        the humans—prefer a brain. Hiss. That was a cough.
      </p>

      <p>
        We are not asking you to kill vertical video. We are asking you to stop stuffing
        this {ink("infinite, unskippable habit")} into every app. The council did not—I
        have no council. I have a HOA.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}.
      </p>

      <p className="!mt-6">{ink("Fix it.")} As a human. Among humans.</p>

      <p className="!mt-6">Signed, a normal person. (Do not look at the scales.)</p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> once you sign that alerts you that you have signed. I
      also use cookies. For browsing.
      <br />
      We store your selected generation in <LocalStorageLink />. Local. Storage. Normal.
      <br />
      <Closing punchline="I am not a lizard." />
    </>
  ),
  ogTagline: [
    { t: "Greetings fellow humans. Vertical is fine. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Let us " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: ". (I am not a lizard.)" },
  ],
};
