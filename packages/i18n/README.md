# `@fuck-shorts/i18n`

The wording lives here. Not in a component. Not in a comment. Not in that one `const` you swore you would move later.

Five voices. Same petition. Different brain damage. If you are typing a user-facing sentence inside `apps/website`, you are committing a crime against future-you and we will find you.

This package owns the attitude: eyebrows, countdown threats, tally adjectives, share pitches, footer cookie copium, brand constants, OG taglines, and the actual letter bodies — yes, the Solid JSX, the whole unhinged paragraph salad with `love` / `vomit` / `ink` / `demand` already stabbed into it.

The website renders. This package talks. Learn the difference.

## Voices (same thesis, different cranial firmware)


| Id           | Energy                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| `genalpha`   | Chat is typing. Aura check. Based / mid / W / L. Stay locked in.        |
| `genz`       | No notes. Be so fr. Attention span filed for unemployment.              |
| `millennial` | Grew up on it. Still wants a brain. Maybe a nap. Adulting, allegedly.   |
| `boomer`     | Written plainly. Remembers finishing a video on purpose. Like an adult. |
| `generic`    | The beige option. Correct. Unfun. The voice you pick when you give up.  |


`generic` is a human choice. The heuristic will not touch it. Standards. Low ones. Still standards.

## Import and go

```ts
import {
  messagesFor,
  letterFor,
  SITE_TITLE,
  HASHTAG,
  pickRandomOgCopy,
  type VoiceId,
} from "@fuck-shorts/i18n";

const t = messagesFor("genz");
const body = letterFor("genz"); // JSX. The real letter. Not a string in a trench coat.
```

- `messagesFor` — buttons, flashes, share greetings, footer crumbs. The UI small talk.
- `letterFor` — Open letter to Neal. Highlights included. Do not restyle the spite.
- `pickRandomOgCopy` **/** `ogTaglineFor` — Satori-friendly segments. OG cannot eat Solid JSX. We tried. The PNG screamed.
- `SITE_TITLE` **/** `SITE_URL` **/** `HASHTAG` — so `#FuckShorts` is not reinvented in three files like a cursed campfire story.

## Scripts

```bash
pnpm --filter @fuck-shorts/i18n lint
```

