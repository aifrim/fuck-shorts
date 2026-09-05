import { letterFor, type VoiceId } from "@fuck-shorts/i18n";

type PetitionLetterProps = {
  voice: VoiceId;
};

/** Article chrome; letter body JSX lives in @fuck-shorts/i18n. */
export default function PetitionLetter(props: PetitionLetterProps) {
  const computer = props.voice === "computer";

  return (
    <article
      id="article"
      className={`text-ink/80 space-y-2 text-lg leading-relaxed sm:text-xl${
        computer ? "text-left font-mono break-words" : "text-justify"
      }`}
      aria-live="polite"
    >
      {letterFor(props.voice)}
    </article>
  );
}
