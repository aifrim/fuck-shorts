import type { PageMessages } from "../types";
import { Closing, CookieLink, LocalStorageLink } from "./footer-parts";
import { demand, ink, love, vomit } from "./letter-marks";
import type { VoicePack } from "./pack";

const messages: PageMessages = {
  title: { line1: "Fuck", line2: "Shorts" },
  eyebrow: "A public petition, if you please",

  countdown: {
    label: "This here petition opens in",
    hold: (date, time) => `Hold that thought, now. Signing starts ${date}, ${time}.`,
    unannounced: "Signing has not been announced yet, I reckon.",
    ended: "Signing is closed. Thanks for putting your name down.",
  },

  tally: {
    lead: "And",
    adjective: "fine folks",
  },

  sign: {
    cta: "Put my name down",
    signing: "Writing…",
    thanks: "And you!",
    alreadyThanks: "And you!",
  },
  errors: {
    load: "Couldn’t fetch the petition. Try again, if you please.",
    sign: "Couldn’t put your name down. Try again, if you please.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Upright pictures are fine. Shorts are engineered brainrot.",
    },
    pitch: {
      countdown:
        "Signing isn’t open yet — share so fine folks are ready. Upright pictures are fine, I reckon. Shorts are engineered brainrot.",
      open: "I reckon upright pictures are fine. These Shorts are engineered brainrot. Give a body a switch to completely disable Shorts, or kill the endless scroll, by golly.",
      ended:
        "Signing is closed — we showed up. Keep telling YouTube: completely disable Shorts, or kill the endless scroll, by golly.",
    },
    greetings: {
      x: "Well now, @YouTube @nealmohan",
      "instagram-threads": "Well now, @youtube @neal_mohan",
      facebook: "Well now, @YouTube and Neal Mohan",
      youtube: "Well now, @YouTube @nealmohan",
      other: "Well now, YouTube and Neal Mohan",
      webShare: "Well now, @YouTube @nealmohan",
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
      copyFail: "Couldn’t copy right now. Try selecting the text above, if you please.",
      shared: "Shared. Appreciate it.",
      shareFail: "Couldn’t share right now.",
    },
  },
};

export const oldtimey: VoicePack = {
  id: "oldtimey",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>Well now, Neal Mohan,</p>

      <p className="!mt-6">
        We {love()} YouTube, and that&apos;s the honest truth. Real moving pictures. Real
        talkers. A show a body could sit with longer than a sneeze.
      </p>

      <p>
        Upright pictures are fine, I reckon. Folks hold phones. That rectangle ain&apos;t
        the crime, no sirree.
      </p>

      <p>
        These {vomit("Shorts")} are the trouble. They are {vomit("engineered brainrot")}:
        swipe, jolt, forget, again, till a feller cannot finish a thought to save his
        life. That ain&apos;t entertainment, I do declare. That&apos;s a{" "}
        {ink("slot machine with a camera")}, dressed in electric lights.
      </p>

      <p>
        We ain&apos;t asking you to ban upright pictures. Land sakes, no. We&apos;re
        asking you to quit stuffing this {ink("infinite, unskippable habit")} into every
        last corner of the contraption like we ordered it from the catalog.
      </p>

      <p>
        Give a body a real switch to {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. By golly, either one will do.
      </p>

      <p className="!mt-6">{ink("Fix it.")}</p>

      <p className="!mt-6">
        Signed, folks who still remember sitting through a picture on purpose.
      </p>
    </>
  ),
  Footer: () => (
    <>
      We store one <CookieLink /> once you sign that alerts you that you have signed.
      <br />
      We store your selected generation in <LocalStorageLink />.
      <br />
      <Closing punchline="That’s the whole of it, I reckon." />
    </>
  ),
  ogTagline: [
    { t: "I reckon upright pictures are fine. These " },
    { t: "Shorts ", highlight: "vomit" },
    { t: "are " },
    { t: "engineered brainrot", highlight: "vomit" },
    { t: ". Give a body a switch to " },
    { t: "completely disable Shorts", highlight: "demand" },
    { t: ", or " },
    { t: "kill the endless scroll", highlight: "demand" },
    { t: ", by golly." },
  ],
};
