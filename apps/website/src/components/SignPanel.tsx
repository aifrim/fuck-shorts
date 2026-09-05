import { Suspense } from "react";

import { voiceTextCase, type PageMessages, type VoiceId } from "@fuck-shorts/i18n";

import {
  formatRemaining,
  formatStartDate,
  formatStartTime,
  useOpenSignPanel,
  usePetitionGate,
} from "../hooks/use-sign-panel";
import { voiceCount, voiceText } from "./voice-display";

type SignPanelProps = {
  /** Same-origin API base; empty string means `/api/...` on this host. */
  apiUrl?: string;
  petitionStart?: string;
  petitionEnd?: string;
  /** Astro render timestamp — keeps countdown SSR and hydrate in sync. */
  renderedAt: number;
  /** Active voice locale strings (countdown, CTA, thanks, errors). */
  messages: PageMessages;
  /** Selected petition voice (computer encodes chrome as bits). */
  voice: VoiceId;
};

/** Open-window placeholder — mirrors tally + CTA so layout does not jump. */
function SignPanelSkeleton() {
  return (
    <section
      className="flex flex-wrap items-center justify-between gap-4"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-2">
        <div className="bg-ink/10 h-3.5 w-10 animate-pulse rounded" />
        <div className="bg-ink/10 h-10 w-36 animate-pulse rounded sm:h-12 sm:w-44" />
        <div className="bg-ink/10 h-3.5 w-44 animate-pulse rounded" />
      </div>

      <div className="bg-ink/10 h-12 w-36 animate-pulse rounded-md" />
    </section>
  );
}

type OpenSignPanelProps = {
  apiBase: string;
  messages: PageMessages;
  voice: VoiceId;
};

function OpenSignPanel(props: OpenSignPanelProps) {
  const {
    showTally,
    displayedCount,
    tallyKey,
    signed,
    justSigned,
    submitting,
    error,
    castSignature,
  } = useOpenSignPanel(props.apiBase, props.messages);

  const v = props.voice;

  return (
    <section className="flex flex-wrap items-center justify-between gap-4">
      {showTally ? (
        // Natural width so a wide tally forces wrap instead of painting under the CTA.
        <div>
          <p className="text-moss-deep/80 text-sm font-medium tracking-wide">
            {voiceText(v, props.messages.tally.lead)}
          </p>
          <p
            className={`font-display text-ink mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl lg:text-5xl${
              tallyKey > 0 ? "animate-tally" : ""
            }${v === "computer" ? "font-mono" : ""}`}
            data-tally={tallyKey}
          >
            {voiceCount(v, displayedCount)}
          </p>
          <p className="text-moss-deep/80 mt-1 text-sm font-medium tracking-wide">
            {voiceText(v, props.messages.tally.adjective)}
          </p>
        </div>
      ) : null}

      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        {signed ? (
          <p className="font-signature text-ink relative inline-flex min-h-[3.25rem] min-w-[7.5rem] -rotate-3 items-end px-1 pb-1 text-3xl leading-none font-bold tracking-wide sm:text-4xl">
            <span className="relative z-10">
              {voiceText(
                v,
                justSigned
                  ? props.messages.sign.thanks
                  : props.messages.sign.alreadyThanks,
              )}
            </span>
            {/* Ink line under the autograph — petition signature, not a chip. */}
            <span
              className="border-ink/35 absolute inset-x-0 bottom-0 border-b-2"
              aria-hidden="true"
            />
          </p>
        ) : (
          <button
            type="button"
            className={`bg-ember font-display text-paper group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md px-6 py-3 text-lg font-bold whitespace-nowrap shadow-[0_10px_30px_-12px_rgba(196,75,22,0.8)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#a83d10] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60${
              v === "computer" ? "font-mono" : ""
            }`}
            disabled={submitting}
            onClick={castSignature}
          >
            <span className="relative z-10">
              {voiceText(
                v,
                submitting ? props.messages.sign.signing : props.messages.sign.cta,
              )}
            </span>
          </button>
        )}

        {error ? (
          <p className="text-ember max-w-sm text-sm" role="alert">
            {voiceText(v, error)}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function SignPanel(props: SignPanelProps) {
  const { live, phase, startMs, now, apiBase } = usePetitionGate(
    props.petitionStart,
    props.petitionEnd,
    props.renderedAt,
    props.apiUrl,
  );

  const v = props.voice;

  // SSG these states — we know what to show without waiting for mount.
  if (phase === "unannounced") {
    return (
      <section className="flex flex-col gap-4">
        <p
          className="bg-moss/10 text-moss-deep border-moss-deep/20 w-full rounded-md border px-4 py-3 text-center text-base leading-relaxed font-medium sm:px-5 sm:py-4 sm:text-lg"
          role="status"
        >
          {voiceText(v, props.messages.countdown.unannounced)}
        </p>
      </section>
    );
  }

  if (phase === "countdown") {
    return (
      <section className="flex flex-col gap-4">
        <div>
          <p
            className={`text-moss-deep/80 text-sm font-medium tracking-wide${
              voiceTextCase(v) === "lower" || v === "computer" ? "" : "uppercase"
            }`}
          >
            {voiceText(v, props.messages.countdown.label)}
          </p>
          <p
            className={`font-body text-ink mt-2 text-5xl font-extrabold tabular-nums sm:text-6xl${
              v === "computer" ? "font-mono" : ""
            }`}
            role="timer"
          >
            {formatRemaining(startMs! - now)}
          </p>
        </div>
        <p className="text-ink/70 text-sm leading-relaxed">
          {voiceText(
            v,
            props.messages.countdown.hold(
              formatStartDate(startMs!),
              formatStartTime(startMs!),
            ),
          )}
        </p>
      </section>
    );
  }

  if (phase === "ended") {
    return (
      <section className="flex flex-col gap-4">
        <p
          className="bg-moss/10 text-moss-deep border-moss-deep/20 w-full rounded-md border px-4 py-3 text-center text-base leading-relaxed font-medium sm:px-5 sm:py-4 sm:text-lg"
          role="status"
        >
          {voiceText(v, props.messages.countdown.ended)}
        </p>
      </section>
    );
  }

  // Voting is on — do not SSG real CTA/tally; wait for client gate + Suspense.
  if (!live) {
    return <SignPanelSkeleton />;
  }

  return (
    <Suspense fallback={<SignPanelSkeleton />}>
      <OpenSignPanel apiBase={apiBase} messages={props.messages} voice={v} />
    </Suspense>
  );
}
