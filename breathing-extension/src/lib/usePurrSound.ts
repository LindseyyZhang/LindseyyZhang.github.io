import { useEffect, useRef } from "react";
import type { BreathState } from "./breathingModes";
import { PurrSynth } from "./purrSound";

export function usePurrSound(enabled: boolean) {
  const synthRef = useRef<PurrSynth | null>(null);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      if (!synthRef.current) synthRef.current = new PurrSynth();
      void synthRef.current.start();
    } else {
      void synthRef.current?.stop();
    }
  }, [enabled]);

  const updateFromState = (state: BreathState) => {
    if (!enabled || !synthRef.current) return;
    // Purr swells and fades together with the exhale wave (A(t) decreasing);
    // inhale and hold stay a near-silent idle hum.
    const intensity = state.phase.direction === "exhale" ? state.amplitudeNormalized : 0.05;
    synthRef.current.setIntensity(intensity);
  };

  return { updateFromState };
}
