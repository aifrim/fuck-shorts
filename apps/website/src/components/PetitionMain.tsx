import { createSignal, onCleanup, onMount } from "solid-js";

import { detectVoiceHeuristic } from "@fuck-shorts/generation-heuristic";
import {
  DEFAULT_VOICE,
  messagesFor,
  parseStoredVoice,
  SITE_TITLE,
  VOICE_STORAGE_KEY,
  type VoiceId,
} from "@fuck-shorts/i18n";

import {
  applyTheme,
  DEFAULT_THEME,
  parseStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "../theme";
import PetitionLetter from "./PetitionLetter";
import SharePrompt from "./SharePrompt";
import ThemeToggle from "./ThemeToggle";
import VoiceToggle from "./VoiceToggle";
import VotePanel from "./VotePanel";

/** Stack SITE_TITLE on two lines without hardcoding brand words. */
function brandTitleLines(title: string): [string, string] {
  const space = title.indexOf(" ");

  if (space < 0) {
    return [title, ""];
  }

  return [title.slice(0, space), title.slice(space + 1)];
}

const [BRAND_LINE_1, BRAND_LINE_2] = brandTitleLines(SITE_TITLE);

type PetitionMainProps = {
  petitionStart?: string;
  /** SSR signature tally for VotePanel first paint. */
  initialCount?: number;
};

/** Replay CSS enter animation on voice-fresh regions without remounting islands. */
function replayVoiceSwap() {
  const nodes = document.querySelectorAll("[data-voice-fresh]");

  for (const node of nodes) {
    const el = node as HTMLElement;
    el.classList.remove("animate-voice-swap");

    void el.offsetWidth;
    el.classList.add("animate-voice-swap");
  }
}

/**
 * Fills Astro’s single <main>: voice locale keeps every section in sync.
 * Brand stays fixed; eyebrow through footer copy switch with the selected voice.
 * Toggle sits above the letter <article> (sibling, not nested). Do not nest another <main>.
 */
export default function PetitionMain(props: PetitionMainProps) {
  const [voice, setVoice] = createSignal<VoiceId>(DEFAULT_VOICE);
  const [theme, setTheme] = createSignal<ThemeId>(DEFAULT_THEME);

  // Restore after mount so SSR/hydration never touches localStorage.
  // Empty voice storage → heuristic preselects; empty theme storage → follow OS.
  onMount(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = resolveTheme(storedTheme);

    setTheme(nextTheme);
    applyTheme(nextTheme);

    // Follow OS only while the user has not persisted a choice.
    let media: MediaQueryList | null = null;
    let onSchemeChange: (() => void) | null = null;

    if (
      parseStoredTheme(storedTheme) === null &&
      typeof window.matchMedia === "function"
    ) {
      media = window.matchMedia("(prefers-color-scheme: dark)");
      onSchemeChange = () => {
        if (parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY)) !== null) {
          return;
        }

        const fromSystem = resolveTheme(null);

        setTheme(fromSystem);
        applyTheme(fromSystem);
      };

      media.addEventListener("change", onSchemeChange);
    }

    onCleanup(() => {
      if (media && onSchemeChange) {
        media.removeEventListener("change", onSchemeChange);
      }
    });

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);

    if (storedVoice !== null) {
      setVoice(parseStoredVoice(storedVoice));
      return;
    }

    setVoice(detectVoiceHeuristic());
  });

  function handleVoiceChange(next: VoiceId) {
    if (next === voice()) return;

    setVoice(next);
    localStorage.setItem(VOICE_STORAGE_KEY, next);
    replayVoiceSwap();
  }

  function handleThemeChange(next: ThemeId) {
    if (next === theme()) return;

    setTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }

  const t = () => messagesFor(voice());

  // Island root is a flex column so petition + footer layout survives astro-island.
  return (
    <div class="flex flex-1 flex-col overflow-visible">
      {/* overflow-visible: oversized # bleeds past max-w-3xl; body overflow-x-hidden clips at viewport. */}
      <div class="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center overflow-visible px-6 py-8 sm:px-10 sm:py-12">
        <div class="animate-rise flex items-start justify-between gap-4">
          <p
            class="font-display text-moss min-w-0 text-sm font-bold uppercase tracking-[0.2em]"
            data-voice-fresh
            aria-live="polite"
          >
            {t().eyebrow}
          </p>

          <ThemeToggle theme={theme()} onChange={handleThemeChange} />
        </div>

        {/* # is a bg artifact (~2× title size) that bleeds left past max-w-3xl;
            body overflow-x-hidden clips at the viewport. Title stays brand-first. */}
        <h1
          class="animate-rise font-display text-ink relative mt-3 self-start overflow-visible text-7xl font-extrabold leading-[0.9] tracking-tight [animation-delay:80ms] sm:text-9xl"
          aria-label={SITE_TITLE}
        >
          <span
            class="text-ink/20 pointer-events-none absolute top-[-0.2em] -translate-x-1/2 -rotate-[24.96deg] select-none text-[2em] leading-none sm:top-[-0.25em] sm:text-[2.4em]"
            aria-hidden="true"
          >
            #
          </span>
          <span class="relative z-10">
            <span class="block">{BRAND_LINE_1}</span>
            <span class="block">{BRAND_LINE_2}</span>
          </span>
        </h1>

        <div class="animate-rise w-full [animation-delay:160ms]">
          <VoiceToggle voice={voice()} onChange={handleVoiceChange} />
        </div>

        <div class="animate-rise mt-4 w-full [animation-delay:160ms]" data-voice-fresh>
          <PetitionLetter voice={voice()} />
        </div>

        <div class="animate-rise mt-8 w-full [animation-delay:240ms]" data-voice-fresh>
          <VotePanel
            petitionStart={props.petitionStart}
            initialCount={props.initialCount}
            messages={t()}
          />
        </div>

        <div class="animate-rise w-full [animation-delay:320ms]" data-voice-fresh>
          <SharePrompt messages={t()} />
        </div>
      </div>

      <footer class="mx-auto w-full max-w-3xl px-6 pb-8 sm:px-10">
        <p
          class="text-ink/55 mx-auto max-w-xl text-center text-sm leading-relaxed"
          data-voice-fresh
          aria-live="polite"
        >
          {t().footer.before}
          <a
            class="decoration-ink/25 hover:text-ink/75 underline underline-offset-2"
            href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
            target="_blank"
            rel="noreferrer"
          >
            local storage
          </a>
          {t().footer.afterStorage}
          <br />
          {t().footer.line2}{" "}
          <a
            class="decoration-ink/25 hover:text-ink/75 underline underline-offset-2"
            href="https://github.com/aifrim/fuck-shorts"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
