/**
 * 8-bit ASCII → spaced binary (no regex).
 * Used by the computer voice so the screen is only 0 and 1.
 */
export function toAsciiBinary(text: string): string {
  // Already bits — don’t wrap 0/1 into another byte layer.
  if (isOnlyZeroOne(text)) return text;

  const parts: string[] = [];

  for (const ch of text) {
    const code = ch.charCodeAt(0);
    let bits = "";

    for (let i = 7; i >= 0; i -= 1) {
      bits += (code >> i) & 1 ? "1" : "0";
    }

    parts.push(bits);
  }

  return parts.join(" ");
}

function isOnlyZeroOne(text: string): boolean {
  if (text.length === 0) return false;

  for (const ch of text) {
    if (ch !== "0" && ch !== "1") return false;
  }

  return true;
}

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\n" || ch === "\t" || ch === "\r";
}

/** @handle / #tag body — letters, digits, _ . (no regex). */
function isHandleBodyChar(ch: string): boolean {
  return (
    (ch >= "A" && ch <= "Z") ||
    (ch >= "a" && ch <= "z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "."
  );
}

function readUntilWhitespace(
  text: string,
  start: number,
): { token: string; end: number } {
  let end = start;

  while (end < text.length) {
    const ch = text[end];
    if (ch === undefined || isWhitespace(ch)) break;
    end += 1;
  }

  return { token: text.slice(start, end), end };
}

function readHandleToken(text: string, start: number): { token: string; end: number } {
  // Keep @ / #, then only handle body chars so trailing ":" stays in prose bits.
  let end = start + 1;

  while (end < text.length) {
    const ch = text[end];
    if (ch === undefined || !isHandleBodyChar(ch)) break;
    end += 1;
  }

  return { token: text.slice(start, end), end };
}

/**
 * Encode prose as bits, but leave @mentions, #tags, and http(s) URLs readable
 * so computer-voice share text still works on socials.
 */
export function toAsciiBinaryPreservingSocial(text: string): string {
  const out: string[] = [];
  let pending = "";

  function flushPending() {
    if (pending.length === 0) return;
    out.push(toAsciiBinary(pending));
    pending = "";
  }

  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (ch === undefined) break;

    // Keep whitespace literal between bit runs and social tokens.
    if (isWhitespace(ch)) {
      flushPending();
      let j = i;

      while (j < text.length) {
        const w = text[j];
        if (w === undefined || !isWhitespace(w)) break;
        j += 1;
      }

      out.push(text.slice(i, j));
      i = j;
      continue;
    }

    if (ch === "@" || ch === "#") {
      flushPending();
      const { token, end } = readHandleToken(text, i);
      out.push(token);
      i = end;
      continue;
    }

    if (text.startsWith("https://", i) || text.startsWith("http://", i)) {
      flushPending();
      const { token, end } = readUntilWhitespace(text, i);
      out.push(token);
      i = end;
      continue;
    }

    pending += ch;
    i += 1;
  }

  flushPending();
  return out.join("");
}
