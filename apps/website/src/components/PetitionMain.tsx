import { useEffect, useState } from "react";

import { detectVoiceHeuristic } from "@fuck-shorts/generation-heuristic";
import {
  DEFAULT_VOICE,
  footerFor,
  messagesFor,
  parseStoredVoice,
  voiceTextCase,
  VOICE_STORAGE_KEY,
  type VoiceId,
} from "@fuck-shorts/i18n";

import { usePetitionGate } from "../hooks/use-sign-panel";
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
import SignPanel from "./SignPanel";
import ThemeToggle from "./ThemeToggle";
import { voiceText } from "./voice-display";
import VoiceToggle from "./VoiceToggle";

type PetitionMainProps = {
  petitionStart?: string;
  petitionEnd?: string;
  /** Astro render timestamp — keeps SignPanel countdown hydrate-stable. */
  renderedAt: number;
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
 * Title, eyebrow, letter, and chrome all switch with the selected voice.
 * Toggle sits above the letter <article> (sibling, not nested). Do not nest another <main>.
 */
export default function PetitionMain(props: PetitionMainProps) {
  const [voice, setVoice] = useState<VoiceId>(DEFAULT_VOICE);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const gate = usePetitionGate(props.petitionStart, props.petitionEnd, props.renderedAt);

  // Restore after mount so the first paint does not touch localStorage.
  // Empty voice storage → heuristic preselects; empty theme storage → follow OS.
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = resolveTheme(storedTheme);

    setTheme(nextTheme);
    applyTheme(nextTheme);

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

    const storedVoice = localStorage.getItem(VOICE_STORAGE_KEY);

    if (storedVoice !== null) {
      setVoice(parseStoredVoice(storedVoice));
    } else {
      setVoice(detectVoiceHeuristic());
    }

    return () => {
      if (media && onSchemeChange) {
        media.removeEventListener("change", onSchemeChange);
      }
    };
  }, []);

  function handleVoiceChange(next: VoiceId) {
    if (next === voice) return;

    setVoice(next);
    localStorage.setItem(VOICE_STORAGE_KEY, next);
    replayVoiceSwap();
  }

  function handleThemeChange(next: ThemeId) {
    if (next === theme) return;

    setTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }

  const t = messagesFor(voice);
  const titleLabel = `${t.title.line1} ${t.title.line2}`;
  const textCase = voiceTextCase(voice);
  const forceLower = textCase === "lower";

  // Island root is a flex column so petition + footer layout survives astro-island.
  return (
    <div className="flex flex-1 flex-col overflow-visible">
      {/* overflow-visible: oversized # bleeds past max-w-3xl; body overflow-x-hidden clips at viewport. */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center overflow-visible px-6 py-8 sm:px-10 sm:py-12">
        <div className="animate-rise flex items-start justify-between gap-4">
          <p
            className={`font-display text-moss min-w-0 text-sm font-bold tracking-[0.2em]${
              voice === "computer"
                ? "font-mono tracking-normal normal-case"
                : forceLower
                  ? "normal-case"
                  : "uppercase"
            }`}
            data-voice-fresh=""
            aria-live="polite"
          >
            {voiceText(voice, t.eyebrow)}
          </p>

          <ThemeToggle theme={theme} onChange={handleThemeChange} />
        </div>

        {/* # is a bg artifact (~2× title size) that bleeds left past max-w-3xl;
            body overflow-x-hidden clips at the viewport. Title stays brand-first. */}
        <h1
          className={`animate-rise font-display text-ink relative mt-3 self-start overflow-visible text-7xl leading-[0.9] font-extrabold tracking-tight [animation-delay:80ms] sm:text-9xl${
            voice === "computer" ? "font-mono" : ""
          }`}
          aria-label={titleLabel}
          data-voice-fresh=""
        >
          <span
            className="text-ink/20 pointer-events-none absolute top-[-0.2em] -translate-x-1/2 -rotate-[24.96deg] text-[2em] leading-none select-none sm:top-[-0.25em] sm:text-[2.4em]"
            aria-hidden="true"
          >
            #
          </span>
          <span className="relative z-10">
            <span className="block">{voiceText(voice, t.title.line1)}</span>
            <span className="block">{voiceText(voice, t.title.line2)}</span>
          </span>
        </h1>

        <div className="animate-rise w-full [animation-delay:160ms]">
          <VoiceToggle voice={voice} onChange={handleVoiceChange} />
        </div>

        <div
          className="animate-rise mt-4 w-full [animation-delay:160ms]"
          data-voice-fresh=""
        >
          <PetitionLetter voice={voice} />
        </div>

        <div
          className="animate-rise mt-8 w-full [animation-delay:240ms]"
          data-voice-fresh=""
        >
          <SignPanel
            petitionStart={props.petitionStart}
            petitionEnd={props.petitionEnd}
            renderedAt={props.renderedAt}
            messages={t}
            voice={voice}
          />
        </div>

        <div className="animate-rise w-full [animation-delay:320ms]" data-voice-fresh="">
          <SharePrompt messages={t} phase={gate.phase} voice={voice} />
        </div>
      </div>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-8 sm:px-10">
        <p
          className="text-ink/55 mx-auto max-w-xl text-center text-sm leading-relaxed"
          data-voice-fresh=""
          aria-live="polite"
        >
          {footerFor(voice)}
        </p>
      </footer>
    </div>
  );
}
