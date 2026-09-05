import type { PageMessages } from "./types";
import type { VoiceId } from "./voices";

const generic: PageMessages = {
  eyebrow: "Public petition",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) =>
      `Hold that hate. Signing starts ${date}, ${time}.`,
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
    pitch:
      "vertical is fine. Very-short Shorts suck. Let us completely disable Shorts, or at least kill the endless scroll.",
    greetings: {
      x: "Hey @YouTube @nealmohan",
      "instagram-threads": "Hey @youtube @neal_mohan",
      facebook: "Hey @YouTube and Neal Mohan",
      youtube: "Hey @YouTube @nealmohan",
      other: "Hey YouTube and Neal Mohan",
      webShare: "Hey @YouTube @nealmohan",
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

  footer: {
    before: "We store one cookie once you sign. Voice pick stays in ",
    afterStorage: ".",
    line2: "The signature count updates every hour.",
  },
};

const boomer: PageMessages = {
  eyebrow: "Public petition, written plainly",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) =>
      `Hold that thought. Signing opens ${date}, ${time}.`,
  },

  tally: {
    lead: "And",
    adjective: "grown adults",
  },

  sign: {
    cta: "Sign it",
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
    pitch:
      "vertical video is fine. These Shorts are engineered brainrot. Give us a real setting to completely disable Shorts, or at least kill the endless scroll.",
    greetings: {
      x: "Hey @YouTube @nealmohan",
      "instagram-threads": "Hey @youtube @neal_mohan",
      facebook: "Hey @YouTube and Neal Mohan",
      youtube: "Hey @YouTube @nealmohan",
      other: "Hey YouTube and Neal Mohan",
      webShare: "Hey @YouTube @nealmohan",
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

  footer: {
    before: "We store one cookie after you sign. Your voice pick stays in ",
    afterStorage: ".",
    line2: "The signature number updates every hour.",
  },
};

const genz: PageMessages = {
  eyebrow: "Public petition, no notes",

  countdown: {
    label: "Petition drops in",
    hold: (date, time) =>
      `Hold that hate. Signing goes live ${date}, ${time}.`,
  },

  tally: {
    lead: "And",
    adjective: "no notes people",
  },

  sign: {
    cta: "I’m in",
    signing: "Locking in…",
    thanks: "And you!",
    alreadyThanks: "And you!",
  },
  errors: {
    load: "Couldn’t load the petition. Refresh and try again.",
    sign: "Couldn’t sign. Refresh and try again.",
  },

  share: {
    eyebrow: "Then tell YouTube",
    intro: {
      before: "Post with ",
      after:
        " and tag YouTube plus Neal Mohan. Vertical is chill. Shorts brainrot is not.",
    },
    pitch:
      "vertical is fine. Shorts are pure engineered brainrot tho. Let us completely disable Shorts, or at least kill the endless scroll. No notes.",
    greetings: {
      x: "Hey @YouTube @nealmohan",
      "instagram-threads": "Hey @youtube @neal_mohan",
      facebook: "Hey @YouTube and Neal Mohan",
      youtube: "Hey @YouTube @nealmohan",
      other: "Hey YouTube and Neal Mohan",
      webShare: "Hey @YouTube @nealmohan",
    },
    where: "Where are we posting this?",
    sheet: "Share sheet",
    actions: {
      copy: "Copy share text",
      copying: "Copying…",
      share: "Share this petition",
      sharing: "Sharing…",
    },
    flash: {
      copied: (label) => `Copied ${label} text.`,
      copyFail: "Couldn’t copy rn. Try selecting the text above.",
      shared: "Shared. Thanks.",
      shareFail: "Couldn’t share rn.",
    },
  },

  footer: {
    before: "One cookie after you sign. Voice pick lives in ",
    afterStorage: ".",
    line2: "Signature count updates every hour. That’s it.",
  },
};

const millennial: PageMessages = {
  eyebrow: "Public petition, for people who grew up on it",

  countdown: {
    label: "Petition opens in",
    hold: (date, time) =>
      `Hold that hate. Signing starts ${date}, ${time}. We will wait.`,
  },

  tally: {
    lead: "And",
    // Nap stays only in the letter sign-off punchline.
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
    pitch:
      "vertical is fine. Very-short Shorts are engineered brainrot and we are tired. Let us completely disable Shorts, or at least kill the endless scroll.",
    greetings: {
      x: "Hey @YouTube @nealmohan",
      "instagram-threads": "Hey @youtube @neal_mohan",
      facebook: "Hey @YouTube and Neal Mohan",
      youtube: "Hey @YouTube @nealmohan",
      other: "Hey YouTube and Neal Mohan",
      webShare: "Hey @YouTube @nealmohan",
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

  footer: {
    before: "We store one cookie once you sign. Voice pick stays in ",
    afterStorage: ".",
    line2: "Signature count updates every hour. Adulting.",
  },
};

const genalpha: PageMessages = {
  eyebrow: "Public petition. Chat is here.",

  countdown: {
    label: "Petition goes live in",
    hold: (date, time) =>
      `Hold that hate. Signing unlocks ${date}, ${time}. Low-key worth the wait.`,
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
    pitch:
      "chat says vertical is high-key fine. Shorts are engineered brainrot though. That is a massive L. Completely disable Shorts, or at least unalive the endless scroll. W petition.",
    greetings: {
      x: "Yo @YouTube @nealmohan",
      "instagram-threads": "Yo @youtube @neal_mohan",
      facebook: "Yo @YouTube and Neal Mohan",
      youtube: "Yo @YouTube @nealmohan",
      other: "Yo YouTube and Neal Mohan",
      webShare: "Yo @YouTube @nealmohan",
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

  footer: {
    before: "One cookie after you sign. Voice pick stays in ",
    afterStorage: ".",
    line2: "Signature count updates every hour. Stay based.",
  },
};

/** Voice id → full page locale. Same keys, different diction. */
export const MESSAGES: Record<VoiceId, PageMessages> = {
  generic,
  boomer,
  genz,
  millennial,
  genalpha,
};

export function messagesFor(voice: VoiceId): PageMessages {
  return MESSAGES[voice];
}
