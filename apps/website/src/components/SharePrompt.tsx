import { For, Show, createSignal, onCleanup, onMount } from "solid-js";

import {
  HASHTAG,
  SITE_TITLE,
  SITE_URL,
  type PageMessages,
} from "@fuck-shorts/i18n";

const WEB_SHARE_ID = "web-share";

type PlatformId = keyof Omit<PageMessages["share"]["greetings"], "webShare">;

type PlatformShare = {
  id: PlatformId;
  label: string;
  tags: string;
};

const PLATFORMS: PlatformShare[] = [
  {
    id: "youtube",
    label: "YouTube",
    tags: "@YouTube @nealmohan",
  },
  {
    id: "x",
    label: "X / Twitter",
    tags: "@YouTube @nealmohan",
  },
  {
    id: "instagram-threads",
    label: "Instagram / Threads",
    tags: "@youtube @neal_mohan",
  },
  {
    id: "facebook",
    label: "Facebook",
    tags: "@YouTube",
  },
  {
    id: "other",
    label: "DM / Other",
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
};

/** Platform copy uses the active voice pitch, then always appends hashtag + URL. */
function platformBody(
  greeting: string,
  pitch: string,
): string {
  return `${greeting}: ${pitch}\n\n${HASHTAG}\n${SITE_URL}`;
}

function buildShareData(greeting: string, pitch: string): SharePayload {
  return {
    title: SITE_TITLE,
    text: platformBody(greeting, pitch),
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
function scrollRevealedPanelIntoView(el: HTMLElement | undefined) {
  if (!el) return;

  el.scrollIntoView({
    block: "end",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export default function SharePrompt(props: SharePromptProps) {
  const t = () => props.messages;

  // Flash status under the actions (cleared on a short timer).
  const [status, setStatus] = createSignal<string | null>(null);
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  // Which action is in flight (copy vs system share).
  const [busy, setBusy] = createSignal<BusyKind>(null);

  // navigator.share availability — probed once on mount.
  const [canShare, setCanShare] = createSignal(false);

  // Selected share destination (platform id or "share-sheet").
  const [destination, setDestination] = createSignal<string | null>(null);

  // Revealed panels after a chip pick (platform preview vs share-sheet actions).
  let previewPanelRef: HTMLDivElement | undefined;
  let webSharePanelRef: HTMLDivElement | undefined;

  onMount(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  });

  onCleanup(() => {
    if (statusTimer) clearTimeout(statusTimer);
  });

  const selectedPlatform = () =>
    PLATFORMS.find((platform) => platform.id === destination());

  function pickDestination(id: string) {
    setDestination(id);
    setStatus(null);

    // Double rAF: wait for Show-when to mount, then for layout/paint.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRevealedPanelIntoView(
          id === WEB_SHARE_ID ? webSharePanelRef : previewPanelRef,
        );
      });
    });
  }

  function flash(message: string) {
    setStatus(message);

    if (statusTimer) clearTimeout(statusTimer);
    // Brief confirmation; clear so later actions don’t show a stale status.
    statusTimer = setTimeout(() => setStatus(null), 2400);
  }

  async function copyShareText() {
    const platform = selectedPlatform();
    if (!platform || busy()) return;

    setBusy("copy");
    setStatus(null);

    try {
      await navigator.clipboard.writeText(
        platformBody(t().share.greetings[platform.id], t().share.pitch),
      );
      flash(t().share.flash.copied(platform.label));
    } catch {
      flash(t().share.flash.copyFail);
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    if (busy() || typeof navigator.share !== "function") return;

    setBusy("share");
    setStatus(null);

    const platform = selectedPlatform();
    const pitch = t().share.pitch;
    const data: SharePayload = platform
      ? {
          title: SITE_TITLE,
          text: platformBody(t().share.greetings[platform.id], pitch),
          url: SITE_URL,
        }
      : buildShareData(t().share.greetings.webShare, pitch);

    try {
      await navigator.share(data);
      flash(t().share.flash.shared);
    } catch (err) {
      // User dismissing the sheet is not a failure.
      if (isAbortError(err)) return;
      flash(t().share.flash.shareFail);
    } finally {
      setBusy(null);
    }
  }

  // Pre-split intro parts (before / after the bold hashtag).
  const intro = () => t().share.intro;

  return (
    <section class="mt-8 w-full" aria-label="Share this petition">
      <p class="text-moss-deep/80 text-sm font-medium uppercase tracking-wide">
        {t().share.eyebrow}
      </p>

      <p class="text-ink/80 mt-2 text-base leading-relaxed sm:text-lg">
        {intro().before}
        <span class="font-display text-ink font-bold tracking-tight">
          {HASHTAG}
        </span>
        {intro().after}
      </p>

      <p id="share-where" class="text-ink/70 mt-4 text-sm font-medium">
        {t().share.where}
      </p>
      <div
        class="mt-2 flex w-full flex-wrap justify-between gap-2"
        role="radiogroup"
        aria-labelledby="share-where"
      >
        <For each={PLATFORMS}>
          {(platform) => (
            <button
              type="button"
              role="radio"
              class={CHIP_BASE}
              classList={{
                "border-moss bg-moss text-paper": destination() === platform.id,
                "border-moss-deep/25 text-moss-deep hover:border-moss hover:bg-moss/10 bg-transparent":
                  destination() !== platform.id,
              }}
              aria-checked={destination() === platform.id ? "true" : "false"}
              onClick={() => pickDestination(platform.id)}
            >
              {platform.label}
            </button>
          )}
        </For>
        <Show when={canShare()}>
          <button
            type="button"
            role="radio"
            class={CHIP_BASE}
            classList={{
              "border-moss bg-moss text-paper": destination() === WEB_SHARE_ID,
              "border-moss-deep/25 text-moss-deep hover:border-moss hover:bg-moss/10 bg-transparent":
                destination() !== WEB_SHARE_ID,
            }}
            aria-checked={destination() === WEB_SHARE_ID ? "true" : "false"}
            onClick={() => pickDestination(WEB_SHARE_ID)}
          >
            {t().share.sheet}
          </button>
        </Show>
      </div>

      <Show when={selectedPlatform()}>
        {(platform) => (
          <div
            ref={(el) => {
              previewPanelRef = el;
            }}
            class="border-moss-deep/15 mt-4 rounded-md border px-3 py-3"
          >
            <p class="text-moss-deep break-words font-mono text-sm">
              {platform().tags}
            </p>

            <p class="text-ink/80 mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {platformBody(
                t().share.greetings[platform().id],
                t().share.pitch,
              )}
            </p>

            <div class="relative mt-4 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                class={COPY_BUTTON_CLASS}
                disabled={busy() !== null}
                onClick={() => void copyShareText()}
              >
                {busy() === "copy" ? t().share.actions.copying : t().share.actions.copy}
              </button>

              <Show when={canShare()}>
                <button
                  type="button"
                  class={SHARE_BUTTON_CLASS}
                  disabled={busy() !== null}
                  onClick={() => void share()}
                >
                  {busy() === "share" ? t().share.actions.sharing : t().share.actions.share}
                </button>
              </Show>

              <Show when={status()}>
                <p
                  class="text-moss-deep pointer-events-none absolute left-0 top-full z-10 mt-2 text-sm font-medium"
                  role="status"
                  aria-live="polite"
                >
                  {status()}
                </p>
              </Show>
            </div>
          </div>
        )}
      </Show>

      <Show when={destination() === WEB_SHARE_ID}>
        <div
          ref={(el) => {
            webSharePanelRef = el;
          }}
          class="relative mt-4 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            class={SHARE_BUTTON_CLASS}
            disabled={busy() !== null}
            onClick={() => void share()}
          >
            {busy() === "share" ? t().share.actions.sharing : t().share.actions.share}
          </button>

          <Show when={status()}>
            <p
              class="text-moss-deep pointer-events-none absolute left-0 top-full z-10 mt-2 text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              {status()}
            </p>
          </Show>
        </div>
      </Show>
    </section>
  );
}
