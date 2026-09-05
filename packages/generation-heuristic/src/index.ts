/**
 * Guess which petition voice fits this browser — without asking anyone’s age.
 * Public API for @fuck-shorts/generation-heuristic.
 */

export {
  collectGenerationRawSignals,
  extractGenerationFeatures,
  type GenerationFeatures,
  type GenerationRawSignals,
} from "./generation-features";

export {
  HEURISTIC_VOICE_IDS,
  MARGIN,
  MIN_CONFIDENCE,
  detectVoiceHeuristic,
  pickVoiceFromFeatures,
  scoreGenerationFeatures,
  type HeuristicVoiceId,
  type VoiceScores,
} from "./generation-heuristic";
