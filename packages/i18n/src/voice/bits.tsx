import { toAsciiBinary } from "../ascii-binary";
import type { TextHighlight } from "../types";

function bitsClass(highlight?: TextHighlight): string {
  if (highlight === "vomit") return "text-vomit font-bold font-mono";
  if (highlight === "love") return "text-raspberry font-bold font-mono";
  if (highlight === "ink") return "text-ink font-bold font-mono";
  if (highlight === "demand") {
    return "text-ink-blue font-bold font-mono underline decoration-2 underline-offset-4";
  }

  return "font-mono";
}

/** Bits on screen; English in aria-label so assistive tech stays correct. */
export function Bits(props: { text: string; highlight?: TextHighlight }) {
  const encoded = toAsciiBinary(props.text);

  return (
    <span className={bitsClass(props.highlight)} aria-label={props.text}>
      {encoded}
      {/* Trailing gap so adjacent Bits (e.g. vomit highlight) keep byte separators. */}{" "}
    </span>
  );
}
