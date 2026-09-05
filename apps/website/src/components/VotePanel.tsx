import { createSignal, onCleanup, onMount, Show } from "solid-js";

import type { PageMessages } from "@fuck-shorts/i18n";

type VotePanelProps = {
  /** Same-origin API base; empty string means `/api/...` on this host. */
  apiUrl?: string;
  petitionStart?: string;
  /** SSR tally so the first paint does not flash “…”. */
  initialCount?: number;
  /** Active voice locale strings (countdown, CTA, thanks, errors). */
  messages: PageMessages;
};

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hasVotedUiCookie(): boolean {
  // JS-readable `fs_voted` — set by POST /api/vote (not HttpOnly).
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith("fs_voted="));
}

/** Null means “open now” (empty / unset PUBLIC_PETITION_START). */
function parsePetitionStart(value: string | undefined): number | null {
  if (!value?.trim()) return null;

  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
}

function formatStartDate(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStartTime(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * True when GET /api/votes was served from a cache (Worker / CDN / browser HTTP cache).
 * Fresh MISS responses already include this browser’s vote — do not bump.
 */
function isVotesResponseFromCache(response: Response, requestUrl: string): boolean {
  if (response.headers.get("X-Worker-Cache") === "HIT") return true;

  const cfStatus = response.headers.get("CF-Cache-Status");
  if (cfStatus === "HIT" || cfStatus === "STALE") return true;

  const ageRaw = response.headers.get("Age");
  if (ageRaw !== null) {
    const age = Number(ageRaw);
    if (Number.isFinite(age) && age > 0) return true;
  }

  // Browser disk/memory cache — requires Timing-Allow-Origin on the response.
  const entries = performance.getEntriesByName(requestUrl, "resource");
  const last = entries.at(-1) as
    | (PerformanceResourceTiming & { deliveryType?: string })
    | undefined;

  if (!last) return false;
  if (last.deliveryType === "cache") return true;
  if (last.transferSize === 0 && last.decodedBodySize > 0) return true;

  return false;
}

export default function VotePanel(props: VotePanelProps) {
  const startMs = parsePetitionStart(props.petitionStart);
  const initiallyOpen = startMs === null || Date.now() >= startMs;
  const hasInitialCount = typeof props.initialCount === "number";

  // Clock + countdown tick.
  const [now, setNow] = createSignal(Date.now());

  // Signature tally — SSR seed when available.
  const [count, setCount] = createSignal<number | null>(
    hasInitialCount ? props.initialCount! : null,
  );
  const [tallyKey, setTallyKey] = createSignal(0);

  // Sign flow UI state.
  const [voted, setVoted] = createSignal(false);
  const [justSigned, setJustSigned] = createSignal(false);
  // Skip loading flash when SSR already provided the tally.
  const [loading, setLoading] = createSignal(initiallyOpen && !hasInitialCount);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Only bump when cookie says signed AND this GET was a cache hit (stale tally).
  const [bumpCachedTally, setBumpCachedTally] = createSignal(false);

  const apiBase = () => stripTrailingSlash(props.apiUrl ?? "");
  const opened = () => startMs === null || now() >= startMs;

  const displayedCount = () => {
    const base = count() ?? 0;

    if (voted() && bumpCachedTally()) return base + 1;

    return base;
  };

  // Defer the votes fetch until the countdown hits zero (or start is unset).
  let votesRequested = initiallyOpen;

  async function loadVotes() {
    setVoted(hasVotedUiCookie());
    setBumpCachedTally(false);

    // Keep SSR number visible while a soft refresh runs.
    if (count() === null) setLoading(true);

    try {
      // Same-origin public tally — omit credentials so caches are not bypassed by Cookie.
      const votesPath = `${apiBase()}/api/votes`;
      const votesUrl = new URL(votesPath, window.location.origin).href;
      const response = await fetch(votesPath);

      if (!response.ok) throw new Error("Could not load signatures");

      const data = (await response.json()) as { count: number };
      setCount(data.count);

      // Cookie + cached GET: include this browser until a fresh MISS / POST count lands.
      setBumpCachedTally(
        hasVotedUiCookie() && isVotesResponseFromCache(response, votesUrl),
      );
    } catch {
      if (count() === null) setError(props.messages.errors.load);
    } finally {
      setLoading(false);
    }
  }

  onMount(() => {
    const tick = () => {
      setNow(Date.now());

      if (!votesRequested && opened()) {
        votesRequested = true;
        void loadVotes();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    onCleanup(() => window.clearInterval(id));

    if (votesRequested) void loadVotes();
  });

  async function castVote() {
    if (!opened() || voted() || submitting()) return;

    setSubmitting(true);
    setError(null);

    try {
      // Lazy-load so island hydration does not depend on Vite’s FingerprintJS dep chunk.
      const FingerprintJS = (await import("@fingerprintjs/fingerprintjs")).default;
      const agent = await FingerprintJS.load();
      const result = await agent.get();
      const fingerprintHash = await sha256Hex(result.visitorId);
      const response = await fetch(`${apiBase()}/api/vote`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintHash }),
      });
      const data = (await response.json()) as {
        count?: number;
        alreadyVoted?: boolean;
        error?: string;
      };

      // 409 = already voted; still treat as success for the UI.
      if (!response.ok && response.status !== 409) {
        throw new Error(props.messages.errors.sign);
      }

      if (typeof data.count === "number") {
        setCount(data.count);
        // Live POST/409 count already includes this browser — never bump.
        setBumpCachedTally(false);
        setTallyKey((value) => value + 1);
      }

      setVoted(true);
      setJustSigned(!data.alreadyVoted);
    } catch {
      setError(props.messages.errors.sign);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      class={
        opened()
          ? // Wrap when tally + CTA no longer fit on one row (long counts).
            "flex flex-wrap items-center justify-between gap-4"
          : "flex flex-col gap-4"
      }
    >
      <Show
        when={opened()}
        fallback={
          <>
            <div>
              <p class="text-moss-deep/80 text-sm font-medium uppercase tracking-wide">
                {props.messages.countdown.label}
              </p>
              <p
                class="font-body text-ink mt-2 text-5xl font-extrabold tabular-nums sm:text-6xl"
                role="timer"
              >
                {formatRemaining(startMs! - now())}
              </p>
            </div>
            <p class="text-ink/70 text-sm leading-relaxed">
              {props.messages.countdown.hold(
                formatStartDate(startMs!),
                formatStartTime(startMs!),
              )}
            </p>
          </>
        }
      >
        {/* Natural width so a wide tally forces wrap instead of painting under the CTA. */}
        <div>
          <p class="text-moss-deep/80 text-sm font-medium tracking-wide">
            {props.messages.tally.lead}
          </p>
          <p
            class="font-display text-ink mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl lg:text-5xl"
            classList={{ "animate-tally": tallyKey() > 0 }}
            data-tally={tallyKey()}
          >
            <Show when={!loading()} fallback="…">
              {displayedCount().toLocaleString()}
            </Show>
          </p>
          <p class="text-moss-deep/80 mt-1 text-sm font-medium tracking-wide">
            {props.messages.tally.adjective}
          </p>
        </div>

        <div class="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <Show
            when={!voted()}
            fallback={
              <p class="bg-moss/10 text-moss-deep rounded-md px-4 py-3 text-sm font-medium">
                {justSigned()
                  ? props.messages.sign.thanks
                  : props.messages.sign.alreadyThanks}
              </p>
            }
          >
            <button
              type="button"
              class="bg-ember font-display text-paper group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md px-6 py-3 text-lg font-bold whitespace-nowrap shadow-[0_10px_30px_-12px_rgba(196,75,22,0.8)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#a83d10] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading() || submitting()}
              onClick={() => void castVote()}
            >
              <span class="relative z-10">
                {submitting()
                  ? props.messages.sign.signing
                  : props.messages.sign.cta}
              </span>
            </button>
          </Show>

          <Show when={error()}>
            <p class="text-ember max-w-sm text-sm" role="alert">
              {error()}
            </p>
          </Show>
        </div>
      </Show>
    </section>
  );
}
