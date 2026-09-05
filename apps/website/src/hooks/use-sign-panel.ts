import { use, useEffect, useState } from "react";

import type { PageMessages } from "@fuck-shorts/i18n";

import {
  parsePetitionInstant,
  petitionPhase,
  type PetitionPhase,
} from "../petition-window";

export type SignaturesSnapshot =
  { status: "ok"; count: number; fromCache: boolean } | { status: "error" };

export const TALLY_PUBLIC_THRESHOLD = 1000;

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hasSignedUiCookie(): boolean {
  // JS-readable `fs_signed` — set by POST /api/sign (not HttpOnly).
  return document.cookie.split(";").some((part) => part.trim().startsWith("fs_signed="));
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
}

export function formatStartDate(ms: number): string {
  return new Date(ms).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatStartTime(ms: number): string {
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
 * True when GET /api/signatures was served from a cache (Worker / CDN / browser HTTP cache).
 * Fresh MISS responses already include this browser’s signature — do not bump.
 */
function isSignaturesResponseFromCache(response: Response, requestUrl: string): boolean {
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
    (PerformanceResourceTiming & { deliveryType?: string }) | undefined;

  if (!last) return false;
  if (last.deliveryType === "cache") return true;
  if (last.transferSize === 0 && last.decodedBodySize > 0) return true;

  return false;
}

/** One in-flight / resolved tally promise per API base (Suspense + use()). */
const signaturesPromises = new Map<string, Promise<SignaturesSnapshot>>();

function signaturesSnapshot(apiBase: string): Promise<SignaturesSnapshot> {
  const key = apiBase || "/";
  const existing = signaturesPromises.get(key);

  if (existing) return existing;

  const promise = (async (): Promise<SignaturesSnapshot> => {
    try {
      // Same-origin public tally — omit credentials so caches are not bypassed by Cookie.
      const signaturesPath = `${apiBase}/api/signatures`;
      const signaturesUrl = new URL(signaturesPath, window.location.origin).href;
      const response = await fetch(signaturesPath);

      if (!response.ok) throw new Error("Could not load signatures");

      const data = (await response.json()) as { count: number };

      return {
        status: "ok",
        count: data.count,
        fromCache: isSignaturesResponseFromCache(response, signaturesUrl),
      };
    } catch {
      return { status: "error" };
    }
  })();

  signaturesPromises.set(key, promise);

  return promise;
}

export type PetitionGate = {
  /**
   * False until mount.
   * Only the open (signing) UI waits on this — countdown / ended are SSG-safe.
   */
  live: boolean;
  phase: PetitionPhase;
  /** Set when announced; null when unannounced. */
  startMs: number | null;
  now: number;
  apiBase: string;
};

/** Live petition phase gate; `live` flips true after mount. */
export function usePetitionGate(
  petitionStart: string | undefined,
  petitionEnd: string | undefined,
  renderedAt: number,
  apiUrl?: string,
): PetitionGate {
  const startMs = parsePetitionInstant(petitionStart);
  const [live, setLive] = useState(false);
  // Seed from Astro so SSR HTML and the first client paint share one clock.
  const [now, setNow] = useState(renderedAt);

  useEffect(() => {
    setNow(Date.now());
    setLive(true);

    const id = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(id);
  }, []);

  return {
    live,
    phase: petitionPhase(petitionStart, petitionEnd, now),
    startMs,
    now,
    apiBase: stripTrailingSlash(apiUrl ?? ""),
  };
}

export type OpenSignPanelState = {
  showTally: boolean;
  displayedCount: number;
  tallyKey: number;
  signed: boolean;
  justSigned: boolean;
  submitting: boolean;
  error: string | null;
  castSignature: () => void;
};

/** Suspends on GET /api/signatures; parent Suspense shows the CTA placeholder. */
export function useOpenSignPanel(
  apiBase: string,
  messages: PageMessages,
): OpenSignPanelState {
  const snapshot = use(signaturesSnapshot(apiBase));

  const [count, setCount] = useState(() =>
    snapshot.status === "ok" ? snapshot.count : 0,
  );
  const [tallyKey, setTallyKey] = useState(0);
  const [signed, setSigned] = useState(
    () => snapshot.status === "ok" && hasSignedUiCookie(),
  );
  const [justSigned, setJustSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    snapshot.status === "error" ? messages.errors.load : null,
  );

  // Cookie + cached GET: include this browser until a fresh MISS / POST count lands.
  const [bumpCachedTally, setBumpCachedTally] = useState(
    () => snapshot.status === "ok" && hasSignedUiCookie() && snapshot.fromCache,
  );

  const displayedCount = signed && bumpCachedTally ? count + 1 : count;

  async function castSignature() {
    if (signed || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      // Lazy-load so island hydration does not depend on Vite’s FingerprintJS dep chunk.
      const FingerprintJS = (await import("@fingerprintjs/fingerprintjs")).default;
      const agent = await FingerprintJS.load();
      const result = await agent.get();
      const fingerprintHash = await sha256Hex(result.visitorId);
      const response = await fetch(`${apiBase}/api/sign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprintHash }),
      });
      const data = (await response.json()) as {
        alreadySigned?: boolean;
        error?: string;
      };

      // 409 = already signed; still treat as success for the UI.
      if (!response.ok && response.status !== 409) {
        throw new Error(messages.errors.sign);
      }

      // Tally stays on GET /api/signatures — locally bump once for a fresh sign.
      if (response.status === 201) {
        setCount((value) => value + 1);
        setBumpCachedTally(false);
        setTallyKey((value) => value + 1);
      }

      setSigned(true);
      setJustSigned(!data.alreadySigned);
    } catch {
      setError(messages.errors.sign);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    showTally: displayedCount >= TALLY_PUBLIC_THRESHOLD,
    displayedCount,
    tallyKey,
    signed,
    justSigned,
    submitting,
    error,
    castSignature: () => void castSignature(),
  };
}
