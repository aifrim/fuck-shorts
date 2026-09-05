const VOTED_COOKIE = "fs_voted";
// 60 seconds × 60 minutes × 24 hours × 365 days = 1 year
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function isLocalHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

/** Single JS-readable signed flag (no HttpOnly — VotePanel reads document.cookie). */
export function votedCookieHeader(requestUrl: string): string {
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_SECONDS * 1000).toUTCString();
  const parts = [
    `${VOTED_COOKIE}=1`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    `Expires=${expires}`,
    "SameSite=Lax",
  ];

  // Secure cookies break on plain http://localhost during local dev.
  if (!isLocalHttpUrl(requestUrl)) parts.push("Secure");

  return parts.join("; ");
}

export { VOTED_COOKIE };
