import type { PageMessages } from "../types";
import { Bits } from "./bits";
import { CookieLink, GitHubLink, LocalStorageLink } from "./footer-parts";
import type { VoicePack } from "./pack";

/** Computer chrome is enum tokens — encoded to bits at display time. */
const messages: PageMessages = {
  title: { line1: "F", line2: "S" },
  eyebrow: "PETITION",

  countdown: {
    label: "ETA",
    hold: (date, time) => `WAIT ${date} ${time}`,
    unannounced: "NULL",
    ended: "EOF",
  },

  tally: {
    lead: "N",
    adjective: "OK",
  },

  sign: {
    cta: "1",
    signing: "…",
    thanks: "10",
    alreadyThanks: "10",
  },
  errors: {
    load: "E_LOAD",
    sign: "E_SIGN",
  },

  share: {
    eyebrow: "PING",
    intro: {
      before: "",
      after: "YT PLS",
    },
    pitch: {
      countdown: "FUCK_SHORTS",
      open: "FUCK_SHORTS",
      ended: "FUCK_SHORTS",
    },
    greetings: {
      x: "PING @YouTube @nealmohan",
      "instagram-threads": "PING @youtube @neal_mohan",
      facebook: "PING @YouTube and Neal Mohan",
      youtube: "PING @YouTube @nealmohan",
      other: "PING YouTube and Neal Mohan",
      webShare: "PING @YouTube @nealmohan",
    },
    platforms: {
      youtube: "Y",
      x: "X",
      "instagram-threads": "I",
      facebook: "F",
      other: "D",
    },
    where: "DST",
    sheet: "SHARE",
    actions: {
      copy: "CPY",
      copying: "…",
      share: "TX",
      sharing: "…",
    },
    flash: {
      copied: () => "OK",
      copyFail: "E_CPY",
      shared: "OK",
      shareFail: "E_TX",
    },
  },
};

/** Short on purpose — binary is verbose; bits are the only glyphs on screen. */
export const computer: VoicePack = {
  id: "computer",
  textCase: "preserve",
  messages,
  Letter: () => (
    <>
      <p>
        <Bits text="Hey Neal," />
      </p>

      <p className="!mt-6">
        <Bits text="Love" highlight="love" />
        <Bits text=" YT. Fuck " />
        <Bits text="Shorts" highlight="vomit" />
        <Bits text="." />
      </p>

      <p className="!mt-6">
        <Bits text="Signed." />
      </p>
    </>
  ),
  Footer: () => (
    <>
      <CookieLink>
        <Bits text="CK" />
      </CookieLink>
      <br />
      <LocalStorageLink>
        <Bits text="LS" />
      </LocalStorageLink>
      <br />
      <GitHubLink>
        <Bits text="GH" />
      </GitHubLink>
      <br />
      <Bits text="EOF" />
    </>
  ),
  // Record completeness only — pickRandomOgCopy never samples computer.
  ogTagline: [{ t: "FUCK_SHORTS. " }, { t: "SIGN", highlight: "demand" }, { t: "." }],
};
