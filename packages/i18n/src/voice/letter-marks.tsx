import type { ReactNode } from "react";

// Semantic highlights reused across voices (raspberry love, vomit Shorts/brainrot,
// ink emphasis, ink-blue underlined demands). Class names match website tokens.

export const love = (word = "love") => (
  <strong className="text-raspberry font-bold">{word}</strong>
);

export const vomit = (children: ReactNode) => (
  <strong className="text-vomit font-bold">{children}</strong>
);

export const ink = (children: ReactNode) => (
  <strong className="text-ink font-bold">{children}</strong>
);

export const demand = (children: ReactNode) => (
  <strong className="text-ink-blue font-bold underline decoration-2 underline-offset-4">
    {children}
  </strong>
);
