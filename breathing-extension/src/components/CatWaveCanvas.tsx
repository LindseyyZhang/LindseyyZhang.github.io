import { useEffect, useRef } from "react";
import { getBreathState, type BreathingMode, type BreathState } from "../lib/breathingModes";
import { hexToRgba, mixHex } from "../lib/color";

const COLORS = {
  bg: "#faf5ef",
  line: "#4a4a4a",
  sage: "#a3bfa8",
  slate: "#9cb8c9",
  paw: "#e0a899",
};

const CAT_STROKE = 1.75;
const WAVE_CYCLES = 0.85; // gentle single-arch look, not an ocean chop
const FLOW_OMEGA = 0.5; // rad/s, slow horizontal drift for a "living" line

interface CatWaveCanvasProps {
  mode: BreathingMode;
  playing: boolean;
  transparentBg?: boolean;
  onFrame?: (state: BreathState) => void;
  className?: string;
}

function waveY(x: number, k: number, phase: number, baseY: number, amplitudePx: number): number {
  return baseY - amplitudePx * Math.sin(k * x + phase);
}

export default function CatWaveCanvas({
  mode,
  playing,
  transparentBg = false,
  onFrame,
  className,
}: CatWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Reset the breathing cycle whenever the mode changes.
  useEffect(() => {
    elapsedRef.current = 0;
    startTimeRef.current = performance.now();
  }, [mode.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      sizeRef.current = { w, h };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (state: BreathState) => {
      const { w, h } = sizeRef.current;
      if (!transparentBg) {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      const baseY = h * 0.56;
      const ampScale = h * 0.15;
      const amplitudePx = state.amplitude * ampScale;
      const k = (2 * Math.PI * WAVE_CYCLES) / w;
      const flowPhase = elapsedRef.current * FLOW_OMEGA;

      const isExhale = state.phase.direction === "exhale";
      const isHold = state.phase.direction === "hold";
      const waveColor = isHold
        ? mixHex(COLORS.sage, COLORS.slate, 0.5)
        : isExhale
          ? COLORS.slate
          : COLORS.sage;

      // --- breath volume fill between back line and belly line ---
      const bellyOffset = h * 0.16;
      const bellyAmpPx = amplitudePx * 0.55;
      const bellyPhaseShift = 0.35;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = waveY(x, k, flowPhase, baseY, amplitudePx);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let x = w; x >= 0; x -= 3) {
        const y = waveY(x, k, flowPhase + bellyPhaseShift, baseY + bellyOffset, bellyAmpPx);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = hexToRgba(isHold ? "#a3bfa8" : isExhale ? COLORS.slate : COLORS.sage, 0.14);
      ctx.fill();

      // --- belly line ---
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = waveY(x, k, flowPhase + bellyPhaseShift, baseY + bellyOffset, bellyAmpPx);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColor;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = Math.max(1, state.strokeWidth * 0.7);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.globalAlpha = 1;

      // --- back line (the cat's spine, main breathing wave) ---
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = waveY(x, k, flowPhase, baseY, amplitudePx);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = state.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // --- minimalist cat silhouette overlay (charcoal single-weight line) ---
      const yAt = (x: number) => waveY(x, k, flowPhase, baseY, amplitudePx);

      ctx.strokeStyle = COLORS.line;
      ctx.fillStyle = COLORS.line;
      ctx.lineWidth = CAT_STROKE;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const headX = w * 0.17;
      const headY = yAt(headX);
      const earSpread = w * 0.045;
      const earHeight = h * 0.075;

      // ears: two simple triangles anchored on the wave, bobbing with it.
      [-1, 1].forEach((side) => {
        const bx = headX + side * earSpread;
        const by = yAt(bx);
        ctx.beginPath();
        ctx.moveTo(bx - w * 0.02, by + h * 0.01);
        ctx.lineTo(bx + side * w * 0.006, by - earHeight);
        ctx.lineTo(bx + w * 0.02, by + h * 0.01);
        ctx.stroke();
      });

      // closed sleepy eye: a small downward arc above the head point.
      ctx.beginPath();
      ctx.arc(headX, headY - h * 0.02, h * 0.018, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      // nose/paw accent dot.
      ctx.fillStyle = COLORS.paw;
      ctx.beginPath();
      ctx.arc(headX - w * 0.03, headY - h * 0.005, h * 0.011, 0, Math.PI * 2);
      ctx.fill();

      // curled tail near the trailing edge, riding the wave.
      const tailX = w * 0.62;
      const tailY = yAt(tailX);
      ctx.strokeStyle = COLORS.line;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY + h * 0.05);
      ctx.bezierCurveTo(
        tailX + w * 0.05,
        tailY + h * 0.11,
        tailX + w * 0.1,
        tailY - h * 0.02,
        tailX + w * 0.06,
        tailY - h * 0.07,
      );
      ctx.stroke();
    };

    const drawCurrent = () => {
      const state = getBreathState(mode, elapsedRef.current);
      draw(state);
      onFrame?.(state);
    };

    resize();
    drawCurrent();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      // ResizeObserver's own initial callback fires asynchronously and
      // resets the canvas bitmap (clearing it) even when nothing actually
      // changed size, so redraw the current frame every time it fires.
      drawCurrent();
    });
    resizeObserver.observe(container);

    const loop = (now: number) => {
      if (playing) {
        elapsedRef.current = (now - startTimeRef.current) / 1000;
      }
      const state = getBreathState(mode, elapsedRef.current);
      draw(state);
      onFrame?.(state);
      if (playing) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    if (playing) {
      startTimeRef.current = performance.now() - elapsedRef.current * 1000;
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, playing, transparentBg]);

  return (
    <div ref={containerRef} className={className ?? "w-full h-full"}>
      <canvas ref={canvasRef} />
    </div>
  );
}
