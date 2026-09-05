import type { ReactNode } from "react";

const LINK = "decoration-ink/25 hover:text-ink/75 underline underline-offset-2";

export function CookieLink(props: { children?: ReactNode }) {
  return (
    <a
      className={LINK}
      href="https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie"
      target="_blank"
      rel="noreferrer"
    >
      {props.children ?? "cookie"}
    </a>
  );
}

export function LocalStorageLink(props: { children?: ReactNode }) {
  return (
    <a
      className={LINK}
      href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
      target="_blank"
      rel="noreferrer"
    >
      {props.children ?? "local storage"}
    </a>
  );
}

export function GitHubLink(props: { children?: ReactNode }) {
  return (
    <a
      className={LINK}
      href="https://github.com/aifrim/fuck-shorts"
      target="_blank"
      rel="noreferrer"
    >
      {props.children ?? "GitHub"}
    </a>
  );
}

/** Shared cadence line + optional punchline on the same line as GitHub. */
export function Closing(props: { punchline?: string }) {
  return (
    <>
      Signature counts update every hour or so.
      <br />
      {props.punchline ? `${props.punchline} ` : null}
      <GitHubLink />
    </>
  );
}
