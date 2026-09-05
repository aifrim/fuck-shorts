/** Light / Dark theme preference. Unset storage follows the OS (light if unknown). */

export const THEME_IDS = ["light", "dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Browser key for the last selected theme (empty → follow system). */
export const THEME_STORAGE_KEY = "fuck-shorts:theme";

export const DEFAULT_THEME: ThemeId = "light";

/**
 * Accept only known theme ids from storage; anything else falls back to light.
 * Equality against THEME_IDS — no regex.
 */
export function parseStoredTheme(value: string | null): ThemeId | null {
  if (value === null) return null;

  for (const id of THEME_IDS) {
    if (id === value) return id;
  }

  return null;
}

/** True only when the OS explicitly prefers dark. Missing API → false (light). */
export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Resolve order: stored light|dark → OS dark → light.
 * Empty / invalid storage follows the system.
 */
export function resolveTheme(stored: string | null = null): ThemeId {
  const parsed = parseStoredTheme(stored);

  if (parsed !== null) return parsed;

  return systemPrefersDark() ? "dark" : "light";
}

/** Apply `.dark` on <html> + color-scheme so tokens and native controls match. */
export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark = theme === "dark";

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}
