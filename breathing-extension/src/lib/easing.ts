export type EasingFn = (t: number) => number;

export const easeOutQuad: EasingFn = (t) => 1 - (1 - t) * (1 - t);

export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);

export const easeOutSine: EasingFn = (t) => Math.sin((t * Math.PI) / 2);

export const easeInOutSine: EasingFn = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export const linear: EasingFn = (t) => t;

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}
