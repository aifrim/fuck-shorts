import {
  letterFor,
  type VoiceId,
} from "@fuck-shorts/i18n";

type PetitionLetterProps = {
  voice: VoiceId;
};

/** Article chrome; letter body JSX lives in @fuck-shorts/i18n. */
export default function PetitionLetter(props: PetitionLetterProps) {
  // Re-read props.voice so Solid swaps the letter when the toggle changes.
  const body = () => letterFor(props.voice);

  return (
    <article
      id="article"
      class="text-ink/80 space-y-2 text-justify text-lg leading-relaxed sm:text-xl"
      aria-live="polite"
    >
      {body()}
    </article>
  );
}
