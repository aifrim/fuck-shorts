import {
  THEME_DARK_LABEL,
  THEME_GROUP_LABEL,
  THEME_LIGHT_LABEL,
} from "@fuck-shorts/i18n";

import type { ThemeId } from "../theme";

type ThemeToggleProps = {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
};

const OPTION_BASE =
  "focus-visible:ring-moss/40 text-ink/55 hover:text-ink inline-flex cursor-pointer items-center justify-center rounded-sm p-1.5 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function SunIcon() {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      class="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
    </svg>
  );
}

/** One control: icon shows the current theme (sun = light, moon = dark). */
export default function ThemeToggle(props: ThemeToggleProps) {
  const next = () => (props.theme === "dark" ? "light" : "dark");
  const label = () =>
    props.theme === "dark" ? THEME_DARK_LABEL : THEME_LIGHT_LABEL;

  return (
    <button
      type="button"
      class={OPTION_BASE}
      aria-label={`${THEME_GROUP_LABEL}: ${label()}`}
      aria-pressed={props.theme === "dark" ? "true" : "false"}
      onClick={() => props.onChange(next())}
    >
      {props.theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
