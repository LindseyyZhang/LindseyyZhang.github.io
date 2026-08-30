import { useEffect, useRef, useState } from "react";
import CatWaveCanvas from "./CatWaveCanvas";
import { BREATHING_MODES, getModeById, type BreathingMode, type BreathState } from "../lib/breathingModes";
import { usePurrSound } from "../lib/usePurrSound";
import { getStored, setStored } from "../lib/storage";

const MODE_KEY = "catbreath.modeId";
const SOUND_KEY = "catbreath.soundEnabled";

interface BreathingAppProps {
  compact?: boolean;
  transparentCanvasBg?: boolean;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `0:${s.toString().padStart(2, "0")}`;
}

export default function BreathingApp({ compact = false, transparentCanvasBg = false }: BreathingAppProps) {
  const [mode, setMode] = useState<BreathingMode>(BREATHING_MODES[0]);
  const [playing, setPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState("Ready to begin");
  const [timeLeft, setTimeLeft] = useState(BREATHING_MODES[0].cycleSeconds);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const lastCycleTimeRef = useRef(0);
  const { updateFromState } = usePurrSound(soundEnabled);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedModeId = await getStored<string>(MODE_KEY, BREATHING_MODES[0].id);
      const storedSound = await getStored<boolean>(SOUND_KEY, false);
      if (cancelled) return;
      try {
        setMode(getModeById(storedModeId as BreathingMode["id"]));
      } catch {
        /* unknown stored id, keep default */
      }
      setSoundEnabled(storedSound);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleModeChange = (next: BreathingMode) => {
    if (next.id === mode.id) return;
    setMode(next);
    setCyclesCompleted(0);
    lastCycleTimeRef.current = 0;
    setTimeLeft(next.cycleSeconds);
    void setStored(MODE_KEY, next.id);
  };

  const handleFrame = (state: BreathState) => {
    setPhaseLabel(state.phase.label);
    setTimeLeft(state.cycleTimeRemaining);
    updateFromState(state);
    if (state.cycleTime < lastCycleTimeRef.current - 0.5) {
      setCyclesCompleted((c) => c + 1);
    }
    lastCycleTimeRef.current = state.cycleTime;
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      void setStored(SOUND_KEY, next);
      return next;
    });
  };

  return (
    <div className={`flex h-full w-full flex-col bg-cream text-charcoal ${compact ? "gap-2 p-3" : "gap-4 p-6"}`}>
      <div className="flex items-center justify-center gap-1.5">
        {BREATHING_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              compact ? "" : "px-3.5 py-1.5 text-sm"
            } ${
              m.id === mode.id
                ? "border-charcoal/20 bg-charcoal text-cream"
                : "border-charcoal/15 bg-white/50 text-charcoal/70 hover:bg-white"
            }`}
          >
            <span>{m.emoji}</span>
            <span className="font-medium">{m.name}</span>
          </button>
        ))}
      </div>

      <div className={`relative w-full flex-1 overflow-hidden rounded-2xl ${compact ? "min-h-[160px]" : "min-h-[280px]"}`}>
        <CatWaveCanvas mode={mode} playing={playing} onFrame={handleFrame} transparentBg={transparentCanvasBg} />
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-0.5">
          <span className={`font-medium tracking-wide text-charcoal/80 ${compact ? "text-sm" : "text-base"}`}>
            {phaseLabel}
          </span>
          <span className={`tabular-nums text-charcoal/50 ${compact ? "text-xs" : "text-sm"}`}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`flex items-center justify-center rounded-full bg-charcoal text-cream shadow-sm transition-transform active:scale-95 ${
            compact ? "h-10 w-10" : "h-12 w-12"
          }`}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="text-xs text-charcoal/50">
          {cyclesCompleted} {cyclesCompleted === 1 ? "cycle" : "cycles"}
        </div>

        <button
          onClick={toggleSound}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors ${
            soundEnabled ? "border-sage/40 bg-sage/20 text-charcoal" : "border-charcoal/15 bg-white/50 text-charcoal/60"
          }`}
          aria-pressed={soundEnabled}
          aria-label="Toggle purr sound"
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          <span className="hidden sm:inline">Purr</span>
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5v11l10-5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" rx="0.75" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="0.75" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 6h2.5l4-3v10l-4-3H2z" fill="currentColor" stroke="none" />
      <path d="M10.5 5.5a3 3 0 0 1 0 5" />
      <path d="M12.3 3.7a5.6 5.6 0 0 1 0 8.6" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 6h2.5l4-3v10l-4-3H2z" fill="currentColor" stroke="none" />
      <path d="M10.5 6l3 4M13.5 6l-3 4" />
    </svg>
  );
}
