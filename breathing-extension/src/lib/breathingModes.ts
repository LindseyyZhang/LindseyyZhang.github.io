import {
  clamp01,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  easeOutQuad,
  easeOutSine,
  type EasingFn,
} from "./easing";

export type BreathPhaseLabel = "inhale" | "hold" | "exhale";

export interface BreathPhase {
  /** Human label shown in the UI, e.g. "Inhale" */
  label: string;
  /** Direction used for wave color + purr modulation */
  direction: BreathPhaseLabel;
  /** Phase start time in seconds, relative to cycle start */
  start: number;
  /** Phase end time in seconds, relative to cycle start */
  end: number;
  /** Wave amplitude at phase start / end (0..~1.2) */
  amplitudeFrom: number;
  amplitudeTo: number;
  /** Stroke width (px) at phase start / end */
  strokeFrom: number;
  strokeTo: number;
  easing: EasingFn;
}

export interface BreathingMode {
  id: "sighing" | "resonant" | "chest";
  name: string;
  emoji: string;
  description: string;
  cycleSeconds: number;
  phases: BreathPhase[];
}

const DEFAULT_STROKE = 2.5;

export const BREATHING_MODES: BreathingMode[] = [
  {
    id: "sighing",
    name: "Cyclic Sighing",
    emoji: "⚡",
    description: "Fast reset for acute stress",
    cycleSeconds: 10,
    phases: [
      {
        label: "Inhale",
        direction: "inhale",
        start: 0,
        end: 2.8,
        amplitudeFrom: 0.1,
        amplitudeTo: 0.65,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: easeOutQuad,
      },
      {
        label: "Hold",
        direction: "hold",
        start: 2.8,
        end: 3.1,
        amplitudeFrom: 0.65,
        amplitudeTo: 0.65,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: (t) => t,
      },
      {
        label: "Sharp Inhale",
        direction: "inhale",
        start: 3.1,
        end: 4.0,
        amplitudeFrom: 0.65,
        amplitudeTo: 1.0,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: easeInOutCubic,
      },
      {
        label: "Long Exhale",
        direction: "exhale",
        start: 4.0,
        end: 10.0,
        amplitudeFrom: 1.0,
        amplitudeTo: 0.1,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: easeOutCubic,
      },
    ],
  },
  {
    id: "resonant",
    name: "Resonant Breathing",
    emoji: "🧘",
    description: "Focused steady rhythm, ~5.5 breaths/min",
    cycleSeconds: 11,
    phases: [
      {
        label: "Inhale",
        direction: "inhale",
        start: 0,
        end: 5.5,
        amplitudeFrom: 0.1,
        amplitudeTo: 1.0,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: easeInOutSine,
      },
      {
        label: "Exhale",
        direction: "exhale",
        start: 5.5,
        end: 11.0,
        amplitudeFrom: 1.0,
        amplitudeTo: 0.1,
        strokeFrom: DEFAULT_STROKE,
        strokeTo: DEFAULT_STROKE,
        easing: easeInOutSine,
      },
    ],
  },
  {
    id: "chest",
    name: "Chest Expansion",
    emoji: "🫁",
    description: "Deep stretch to release chest tightness",
    cycleSeconds: 9,
    phases: [
      {
        label: "Deep Inhale",
        direction: "inhale",
        start: 0,
        end: 3.0,
        amplitudeFrom: 0.1,
        amplitudeTo: 1.2,
        strokeFrom: 2,
        strokeTo: 4,
        easing: easeOutCubic,
      },
      {
        label: "Slow Exhale",
        direction: "exhale",
        start: 3.0,
        end: 9.0,
        amplitudeFrom: 1.2,
        amplitudeTo: 0.1,
        strokeFrom: 4,
        strokeTo: 2,
        easing: easeOutSine,
      },
    ],
  },
];

export interface BreathState {
  mode: BreathingMode;
  phase: BreathPhase;
  phaseIndex: number;
  /** Progress within the current phase, 0..1 */
  phaseProgress: number;
  /** Current wave amplitude, roughly 0.1..1.2 */
  amplitude: number;
  /** Current stroke width in px */
  strokeWidth: number;
  /** Amplitude normalized to this mode's 0..1 range, for purr/visual intensity */
  amplitudeNormalized: number;
  /** Elapsed seconds within the cycle */
  cycleTime: number;
  /** Seconds remaining in the whole cycle */
  cycleTimeRemaining: number;
}

function getModeAmplitudeRange(mode: BreathingMode): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const phase of mode.phases) {
    min = Math.min(min, phase.amplitudeFrom, phase.amplitudeTo);
    max = Math.max(max, phase.amplitudeFrom, phase.amplitudeTo);
  }
  return { min, max };
}

const amplitudeRangeCache = new Map<string, { min: number; max: number }>();

export function getBreathState(mode: BreathingMode, elapsedSeconds: number): BreathState {
  const cycleTime = elapsedSeconds % mode.cycleSeconds;

  let phaseIndex = mode.phases.findIndex((p) => cycleTime >= p.start && cycleTime < p.end);
  if (phaseIndex === -1) phaseIndex = mode.phases.length - 1;
  const phase = mode.phases[phaseIndex];

  const phaseDuration = phase.end - phase.start;
  const phaseProgress = phaseDuration > 0 ? clamp01((cycleTime - phase.start) / phaseDuration) : 1;
  const eased = phase.easing(phaseProgress);

  const amplitude = phase.amplitudeFrom + (phase.amplitudeTo - phase.amplitudeFrom) * eased;
  const strokeWidth = phase.strokeFrom + (phase.strokeTo - phase.strokeFrom) * eased;

  let range = amplitudeRangeCache.get(mode.id);
  if (!range) {
    range = getModeAmplitudeRange(mode);
    amplitudeRangeCache.set(mode.id, range);
  }
  const amplitudeNormalized = clamp01((amplitude - range.min) / (range.max - range.min));

  return {
    mode,
    phase,
    phaseIndex,
    phaseProgress,
    amplitude,
    strokeWidth,
    amplitudeNormalized,
    cycleTime,
    cycleTimeRemaining: mode.cycleSeconds - cycleTime,
  };
}

export function getModeById(id: BreathingMode["id"]): BreathingMode {
  const mode = BREATHING_MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`Unknown breathing mode: ${id}`);
  return mode;
}
