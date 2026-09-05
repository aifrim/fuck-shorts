import type { JSX } from "solid-js";

import type { VoiceId } from "./voices";

// Semantic highlights reused across voices (raspberry love, vomit Shorts/brainrot,
// ink emphasis, ink-blue underlined demands). Class names match website tokens.

const love = (word = "love") => (
  <strong class="text-raspberry font-bold">{word}</strong>
);

const vomit = (children: JSX.Element) => (
  <strong class="text-vomit font-bold">{children}</strong>
);

const ink = (children: JSX.Element) => (
  <strong class="text-ink font-bold">{children}</strong>
);

const demand = (children: JSX.Element) => (
  <strong class="text-ink-blue font-bold underline decoration-2 underline-offset-4">
    {children}
  </strong>
);

/** Letter body per voice. Same thesis, different diction. */
const LETTERS: Record<VoiceId, () => JSX.Element> = {
  generic: () => (
    <>
      <p>Neal Mohan,</p>

      <p class="!mt-6">We {love()} YouTube.</p>

      <p>Vertical is fine. People hold phones. The format is not the crime.</p>

      <p>
        Very-short {vomit("Shorts")} are. They are {vomit("engineered brainrot")}:
        swipe, spike, forget, repeat, until attention is mush and the feed never
        ends. That is not entertainment. That is a {ink("slot machine with a camera")}.
      </p>

      <p>
        We are not asking you to kill vertical video. We are asking you to stop
        stuffing it down our throats as an {ink("infinite, unskippable habit")}.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}.
      </p>

      <p class="!mt-6">{ink("Fix it.")}</p>

      <p class="!mt-6">Signed, people who still want a brain.</p>
    </>
  ),

  boomer: () => (
    <>
      <p>Dear Neal Mohan,</p>

      <p class="!mt-6">
        We {love()} YouTube. We have for years. Real videos. Real creators. A place
        you could sit with something longer than a sneeze.
      </p>

      <p>
        Vertical is fine. Phones are vertical. Nobody is mad about the rectangle.
      </p>

      <p>
        These {vomit("Shorts")} are the problem. They are{" "}
        {vomit("engineered brainrot")}: tap, jolt, forget, again, until you cannot
        finish a thought. That is not a show. That is a{" "}
        {ink("slot machine with a camera")}.
      </p>

      <p>
        We are not asking you to ban upright video. We are asking you to stop
        shoving this {ink("infinite, unskippable habit")} into every corner of the
        app like we asked for it.
      </p>

      <p>
        Give grown adults a real option to {demand("completely disable Shorts")}.
        Or at least {demand("kill the endless scroll")}.
      </p>

      <p class="!mt-6">{ink("Fix it.")}</p>

      <p class="!mt-6">Signed, people who still remember finishing a video on purpose.</p>
    </>
  ),

  genz: () => (
    <>
      <p>ok Neal Mohan,</p>

      <p class="!mt-6">
        We {love()} YouTube. Like, actually. The long stuff. The weird niches. The
        comfort rewatches.
      </p>

      <p>Vertical is fine. We live on phones. Format is not the villain.</p>

      <p>
        {vomit("Shorts")} though. They are {vomit("engineered brainrot")}: swipe,
        spike, void, repeat, until your attention span files for unemployment.
        Not entertainment. A {ink("slot machine with a camera")}.
      </p>

      <p>
        Nobody said delete vertical video. We said stop force-feeding this{" "}
        {ink("infinite, unskippable habit")} like it is a personality.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. Be so fr.
      </p>

      <p class="!mt-6">{ink("Fix it.")}</p>

      <p class="!mt-6">Signed, people who would like one (1) remaining brain cell.</p>
    </>
  ),

  millennial: () => (
    <>
      <p>Hey Neal Mohan,</p>

      <p class="!mt-6">
        We {love()} YouTube. We grew up on it. Tutorials, essays, deep cuts, the
        whole archive-as-home thing.
      </p>

      <p>
        Vertical is fine. We adapted. The shape of the screen is not the hill.
      </p>

      <p>
        Very-short {vomit("Shorts")} are. They are {vomit("engineered brainrot")}:
        swipe, spike, forget, repeat, until focus feels like a luxury brand. That
        is not entertainment. That is a {ink("slot machine with a camera")} with
        better lighting.
      </p>

      <p>
        We are not asking you to kill vertical video. We are asking you to stop
        treating our nervous systems like an{" "}
        {ink("infinite, unskippable habit")} funnel.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("kill the endless scroll")}. We will literally take either.
      </p>

      <p class="!mt-6">{ink("Fix it.")}</p>

      <p class="!mt-6">Signed, people who still want a brain and maybe a nap.</p>
    </>
  ),

  // Gen Alpha / streamer: aura, based/mid, W/L, parasocial — Yo over Dear for chat energy.
  genalpha: () => (
    <>
      <p>Yo Neal Mohan,</p>

      <p class="!mt-6">
        We {love()} YouTube. Real talk. Parasocial but sincere. Chat agrees.
      </p>

      <p>
        Vertical is high-key fine. Aura check: phones are tall. Format is based.
        Not the villain.
      </p>

      <p>
        {vomit("Shorts")} though. Low-key mid. They are{" "}
        {vomit("engineered brainrot")}: swipe, spike, forget, repeat, until your
        attention span rage quits. Not content. A{" "}
        {ink("slot machine with a camera")} and chat is not wrong for saying so.
      </p>

      <p>
        Nobody asked to delete vertical. We asked you to stop force-feeding this{" "}
        {ink("infinite, unskippable habit")} like it is a bit. Massive L.
      </p>

      <p>
        Let us {demand("completely disable Shorts")}. Or at least{" "}
        {demand("unalive the endless scroll")}. Chat votes W either way.
      </p>

      <p class="!mt-6">{ink("Fix it.")}</p>

      <p class="!mt-6">Signed, chat. Stay based.</p>
    </>
  ),
};

/** Letter body JSX for the selected voice. */
export function letterFor(voice: VoiceId): JSX.Element {
  return LETTERS[voice]();
}
