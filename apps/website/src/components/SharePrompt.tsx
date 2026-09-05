import { useEffect, useRef, useState } from "react";

import {
  HASHTAG,
  SITE_TITLE,
  SITE_URL,
  sharePitchFor,
  toAsciiBinaryPreservingSocial,
  voiceTextCase,
  type PageMessages,
  type VoiceId,
} from "@fuck-shorts/i18n";

import type { PetitionPhase } from "../petition-window";
import { voiceText } from "./voice-display";

const WEB_SHARE_ID = "web-share";

type PlatformId = keyof PageMessages["share"]["platforms"];

type PlatformMeta = {
  id: PlatformId;
  tags: string;
};

/** Handle hints only — chip labels come from the active voice. */
const PLATFORMS: PlatformMeta[] = [
  {
    id: "youtube",
    tags: "@YouTube @nealmohan",
  },
  {
    id: "x",
    tags: "@YouTube @nealmohan",
  },
  {
    id: "instagram-threads",
    tags: "@youtube @neal_mohan",
  },
  {
    id: "facebook",
    tags: "@YouTube",
  },
  {
    id: "other",
    tags: "YouTube, Neal Mohan",
  },
];

const BUTTON_BASE =
  "font-display rounded-md px-5 py-2.5 text-base font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

const SHARE_BUTTON_CLASS = `${BUTTON_BASE} bg-moss text-paper hover:bg-moss-deep`;

const COPY_BUTTON_CLASS = `${BUTTON_BASE} border-moss-deep/25 text-moss-deep hover:border-moss hover:bg-moss/10 border bg-transparent`;

const CHIP_BASE =
  "font-display focus-visible:ring-moss/40 rounded-md border px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

type SharePayload = Required<Pick<ShareData, "title" | "text" | "url">>;
type BusyKind = "share" | "copy" | null;

type SharePromptProps = {
  /** Active voice locale strings (intro, pitch, buttons, flashes). */
  messages: PageMessages;
  /** Petition window — selects countdown / open / ended social pitch. */
  phase: PetitionPhase;
  /** Selected petition voice (computer encodes chrome as bits). */
  voice: VoiceId;
};

/** Platform copy uses the active voice pitch, then always appends hashtag + URL. */
function platformBody(greeting: string, pitch: string): string {
  return `${greeting}: ${pitch}\n\n${HASHTAG}\n${SITE_URL}`;
}

/** Computer share: bits for prose, plain @/# / URLs so posts stay usable. */
function shareBodyForVoice(voice: VoiceId, greeting: string, pitch: string): string {
  const body = platformBody(greeting, pitch);

  if (voice !== "computer") return body;

  return toAsciiBinaryPreservingSocial(body);
}

function buildShareData(voice: VoiceId, greeting: string, pitch: string): SharePayload {
  return {
    title: SITE_TITLE,
    text: shareBodyForVoice(voice, greeting, pitch),
    url: SITE_URL,
  };
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "AbortError"
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Scroll so the panel’s bottom (Copy/Share) is in view after a chip pick. */
function scrollRevealedPanelIntoView(el: HTMLElement | null) {
  if (!el) return;

  el.scrollIntoView({
    block: "end",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export default function SharePrompt(props: SharePromptProps) {
  const t = props.messages;
  const v = props.voice;
  const pitch = sharePitchFor(t.share.pitch, props.phase);

  // Flash status under the actions (cleared on a short timer).
  const [status, setStatus] = useState<string | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Which action is in flight (copy vs system share).
  const [busy, setBusy] = useState<BusyKind>(null);

  // navigator.share availability — probed once on mount.
  const [canShare, setCanShare] = useState(false);

  // Selected share destination (platform id or "share-sheet").
  const [destination, setDestination] = useState<string | null>(null);

  // Revealed panels after a chip pick (platform preview vs share-sheet actions).
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const webSharePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );

    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // After a chip pick, scroll the revealed panel into view once it is mounted.
  useEffect(() => {
    if (!destination) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRevealedPanelIntoView(
          destination === WEB_SHARE_ID
            ? webSharePanelRef.current
            : previewPanelRef.current,
        );
      });
    });
  }, [destination]);

  const selectedPlatform = PLATFORMS.find((platform) => platform.id === destination);
  const selectedLabel = selectedPlatform ? t.share.platforms[selectedPlatform.id] : null;

  function pickDestination(id: string) {
    setDestination(id);
    setStatus(null);
  }

  function flash(message: string) {
    setStatus(message);

    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    // Brief confirmation; clear so later actions don’t show a stale status.
    statusTimerRef.current = setTimeout(() => setStatus(null), 2400);
  }

  async function copyShareText() {
    if (!selectedPlatform || !selectedLabel || busy) return;

    setBusy("copy");
    setStatus(null);

    try {
      await navigator.clipboard.writeText(
        shareBodyForVoice(v, t.share.greetings[selectedPlatform.id], pitch),
      );
      flash(t.share.flash.copied(selectedLabel));
    } catch {
      flash(t.share.flash.copyFail);
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    if (busy || typeof navigator.share !== "function") return;

    setBusy("share");
    setStatus(null);

    const data: SharePayload = selectedPlatform
      ? {
          title: SITE_TITLE,
          text: shareBodyForVoice(v, t.share.greetings[selectedPlatform.id], pitch),
          url: SITE_URL,
        }
      : buildShareData(v, t.share.greetings.webShare, pitch);

    try {
      await navigator.share(data);
      flash(t.share.flash.shared);
    } catch (err) {
      // User dismissing the sheet is not a failure.
      if (isAbortError(err)) return;
      flash(t.share.flash.shareFail);
    } finally {
      setBusy(null);
    }
  }

  const intro = t.share.intro;
  const forceLower = voiceTextCase(v) === "lower";

  return (
    <section className="mt-8 w-full" aria-label="Share this petition">
      <p
        className={`text-moss-deep/80 text-sm font-medium tracking-wide${
          forceLower || v === "computer" ? "" : "uppercase"
        }`}
      >
        {voiceText(v, t.share.eyebrow)}
      </p>

      <p className="text-ink/80 mt-2 text-base leading-relaxed sm:text-lg">
        {voiceText(v, intro.before)}
        <span
          className={
            v === "computer"
              ? undefined
              : "font-display text-ink font-bold tracking-tight"
          }
        >
          {voiceText(v, HASHTAG)}
        </span>
        {intro.after.length > 0 ? (
          <>
            {/* Real space after the hashtag — must not go through toAsciiBinary. */}{" "}
            {voiceText(
              v,
              intro.after.startsWith(" ") ? intro.after.slice(1) : intro.after,
            )}
          </>
        ) : null}
      </p>

      <p id="share-where" className="text-ink/70 mt-4 text-sm font-medium">
        {voiceText(v, t.share.where)}
      </p>
      <div
        className="mt-2 flex w-full flex-wrap justify-between gap-2"
        role="radiogroup"
        aria-labelledby="share-where"
      >
        {PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            type="button"
            role="radio"
            className={`${CHIP_BASE} ${
              destination === platform.id
                ? "border-moss bg-moss text-paper"
                : "border-moss-deep/25 text-moss-deep hover:border-moss hover:bg-moss/10 bg-transparent"
            }${v === "computer" ? "font-mono" : ""}`}
            aria-checked={destination === platform.id ? "true" : "false"}
            onClick={() => pickDestination(platform.id)}
          >
            {voiceText(v, t.share.platforms[platform.id])}
          </button>
        ))}
        {canShare ? (
          <button
            type="button"
            role="radio"
            className={`${CHIP_BASE} ${
              destination === WEB_SHARE_ID
                ? "border-moss bg-moss text-paper"
                : "border-moss-deep/25 text-moss-deep hover:border-moss hover:bg-moss/10 bg-transparent"
            }`}
            aria-checked={destination === WEB_SHARE_ID ? "true" : "false"}
            onClick={() => pickDestination(WEB_SHARE_ID)}
          >
            {voiceText(v, t.share.sheet)}
          </button>
        ) : null}
      </div>

      {selectedPlatform ? (
        <div
          ref={previewPanelRef}
          className="border-moss-deep/15 mt-4 rounded-md border px-3 py-3"
        >
          <p className="text-moss-deep font-mono text-sm break-words">
            {selectedPlatform.tags}
          </p>

          <p
            className={`text-ink/80 mt-3 text-sm break-words whitespace-pre-wrap leading-relaxed${
              v === "computer" ? "font-mono" : ""
            }`}
          >
            {shareBodyForVoice(v, t.share.greetings[selectedPlatform.id], pitch)}
          </p>

          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              className={COPY_BUTTON_CLASS}
              disabled={busy !== null}
              onClick={() => void copyShareText()}
            >
              {voiceText(
                v,
                busy === "copy" ? t.share.actions.copying : t.share.actions.copy,
              )}
            </button>

            {canShare ? (
              <button
                type="button"
                className={SHARE_BUTTON_CLASS}
                disabled={busy !== null}
                onClick={() => void share()}
              >
                {voiceText(
                  v,
                  busy === "share" ? t.share.actions.sharing : t.share.actions.share,
                )}
              </button>
            ) : null}

            {status ? (
              <p
                className="text-moss-deep pointer-events-none absolute top-full left-0 z-10 mt-2 text-sm font-medium"
                role="status"
                aria-live="polite"
              >
                {voiceText(v, status)}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {destination === WEB_SHARE_ID ? (
        <div
          ref={webSharePanelRef}
          className="relative mt-4 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            className={SHARE_BUTTON_CLASS}
            disabled={busy !== null}
            onClick={() => void share()}
          >
            {voiceText(
              v,
              busy === "share" ? t.share.actions.sharing : t.share.actions.share,
            )}
          </button>

          {status ? (
            <p
              className="text-moss-deep pointer-events-none absolute top-full left-0 z-10 mt-2 text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              {voiceText(v, status)}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
