import { VOICES, type VoiceId } from "@fuck-shorts/i18n";

type VoiceToggleProps = {
  voice: VoiceId;
  onChange: (voice: VoiceId) => void;
};

const OPTION_BASE =
  "font-display focus-visible:ring-moss/40 cursor-pointer rounded-sm px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:px-2.5 sm:text-sm";

/**
 * Plain text radiogroup. Matches site typography without card chrome.
 */
export default function VoiceToggle(props: VoiceToggleProps) {
  return (
    <div className="mt-5 w-full">
      <div
        className="-mx-2 flex w-full flex-wrap justify-between gap-x-1 gap-y-2 sm:-mx-2.5"
        role="radiogroup"
        aria-label="Voice"
      >
        {VOICES.map((option) => {
          const selected = props.voice === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              className={`${OPTION_BASE} ${
                selected
                  ? // Selected = ink + underline (same cue as demand phrases, no pill/card).
                    "text-ink underline decoration-2 underline-offset-4"
                  : "text-ink/45 hover:text-ink/70"
              }`}
              aria-checked={selected ? "true" : "false"}
              onClick={() => props.onChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
