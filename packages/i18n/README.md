# `@fuck-shorts/i18n`

The wording lives here. Not in a component. Not in a comment. Not in that one `const` you swore you would move later.

English diction voices. Same petition. Different brain damage. If you are typing a user-facing sentence inside `apps/website`, you are committing a crime against future-you and we will find you.

This package owns the attitude: eyebrows, countdown threats, tally adjectives, share pitches, footer cookie copium (JSX), brand constants, OG taglines, and the actual letter bodies — yes, the React JSX, the whole unhinged paragraph salad with `love` / `vomit` / `ink` / `demand` already stabbed into it.

Each voice is one file under `src/voice/` (`generic.tsx`, `pirate.tsx`, …). Shared letter marks and footer links live beside them.

The website renders. This package talks. Learn the difference.

## Voices (same thesis, different cranial firmware)

| Id            | Energy                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| `genalpha`    | Chat is typing. Aura check. Based / mid / W / L. Stay locked in.        |
| `genz`        | No notes. Be so fr. Attention span filed for unemployment.              |
| `millennial`  | Grew up on it. Still wants a brain. Maybe a nap. Adulting, allegedly.   |
| `boomer`      | Written plainly. Remembers finishing a video on purpose. Like an adult. |
| `shakespeare` | Iambic spite. Thee / thou / wherefore Shorts.                           |
| `oldtimey`    | I reckon. Moving pictures. By golly.                                    |
| `pirate`      | Ahoy. Parley. Yarr.                                                     |
| `computer`    | Source is UTF-8 enum English; screen is `toAsciiBinary` (0/1 only).     |
| `ai`          | Soft LLM cadence. Temperature: 0.                                       |
| `reptile`     | Greetings, fellow humans. Failed disguise. Scales optional.             |
| `generic`     | The beige option. Correct. Unfun. The voice you pick when you give up.  |

`generic`, `shakespeare`, `oldtimey`, and `reptile` are human-tap only. The heuristic will not touch them. Standards. Low ones. Still standards.

`computer` and `ai` are site-toggle voices. `pickRandomOgCopy` never samples them (OG stays readable).

Set `textCase: "lower"` on a voice pack (Gen Z) to run every string through `applyVoiceCase` — messages, letter, footer, OG, and `voiceText`.

### Computer bits

Store normal UTF-8 / short tokens in messages, letters, and footers. Transform at display with `toAsciiBinary` (8-bit ASCII, space between bytes, no regex). Assistive tech gets the source via `aria-label`. Toggle chip stays `112+99`.

## Import and go

```ts
import {
  messagesFor,
  letterFor,
  footerFor,
  SITE_TITLE,
  HASHTAG,
  pickRandomOgCopy,
  toAsciiBinary,
  type VoiceId,
} from "@fuck-shorts/i18n";

const t = messagesFor("genz");
const body = letterFor("genz"); // JSX. The real letter. Not a string in a trench coat.
const footer = footerFor("genz"); // JSX. Cookie / storage / GitHub links included.
```

- `messagesFor` — title, buttons, flashes, share greetings. The UI small talk.
- `letterFor` — Open letter to Neal. Highlights included. Do not restyle the spite.
- `footerFor` — Disclaimer lines with MDN + GitHub links baked in.
- `pickRandomOgCopy` **/** `ogTaglineFor` — Satori-friendly segments. OG cannot eat React JSX. We tried. The PNG screamed.
- `toAsciiBinary` — computer voice display transform.
- `toAsciiBinaryPreservingSocial` — bits with readable `@` / `#` / `http(s)` tokens for share posts.
- `SITE_TITLE` **/** `SITE_URL` **/** `HASHTAG` — so `#FuckShorts` is not reinvented in three files like a cursed campfire story.

## Scripts

```bash
pnpm --filter @fuck-shorts/i18n lint
```
