# `@fuck-shorts/generation-heuristic`

We do not ask your age. That would be weird, invasive, and — worst of all — accurate.

Instead we loot the junk drawer your browser left on the table: UA crumbs, touch points, whether TikTok smuggled you in through a WebView, whether Discord yeeted you here like a raccoon through a dog door. Then we guess a petition voice and preselect the toggle. No cookies. No confession. No “what generation are you?” form that should be illegal.

| Guess        | Rough vibe                                                         |
| ------------ | ------------------------------------------------------------------ |
| `boomer`     | Windows desktop, Facebook WebView, arrived on purpose like a citizen |
| `millennial` | Mac desktop, Reddit, Discord, still has a job, spiritually exhausted |
| `genz`       | Phone + youth apps, or “we have no idea” — same energy, honestly     |
| `genalpha`   | Tablet / Chromebook. School IT never lies. Chat is already here.     |

It will **never** auto-pick `generic`. Generic is for humans who tap the beige button on purpose. The heuristic has standards. They are trash. They are still standards.

If it guesses wrong: tap the toggle. Free will still ships. We are not your dad.

## How it works (two layers, zero astrology)

1. **`extractGenerationFeatures`** — navigator soup → boolean bag. No regex. No “AI.” Just `includes`, `startsWith`, and spite.
2. **`scoreGenerationFeatures` / `pickVoiceFromFeatures`** — scores that bag with Pew-adjacent vibes and published platform skews. Ties, photo finishes, and “this could be anyone with a pulse” all collapse to **`genz`**, because when in doubt, blame the share audience.

In-app browsers are the main event. Referrers get stripped. The WebView still rats you out.

Browser one-liner:

```ts
import { detectVoiceHeuristic } from "@fuck-shorts/generation-heuristic";

const voice = detectVoiceHeuristic(); // "genz" | "boomer" | … never "generic"
```

Bring your own signals if you are testing in Node and refuse to pretend you have a `navigator`:

```ts
import {
  extractGenerationFeatures,
  pickVoiceFromFeatures,
} from "@fuck-shorts/generation-heuristic";

const voice = pickVoiceFromFeatures(
  extractGenerationFeatures({
    userAgent: "Mozilla/5.0 (iPhone…)",
    platform: "iPhone",
    uaMobileHint: true,
    maxTouchPoints: 5,
    innerWidth: 390,
    effectiveType: "4g",
    referrer: "https://discord.com/channels/1/2",
  }),
);
```

## What this is not

- Not tracking. We throw the UA at a scoreboard and walk away.
- Not a birth-year oracle. Chromebook ≠ child. Windows ≠ your uncle. Close enough for a toggle.
- Not legal advice, demographic science, or a BuzzFeed quiz with extra steps.
- Definitely not reading your screen time. We are cowards. The good kind.

The guess is in-memory until you toggle. We do not write it down. We are not that thirsty.

## Scripts

```bash
pnpm --filter @fuck-shorts/generation-heuristic test
pnpm --filter @fuck-shorts/generation-heuristic lint
```
