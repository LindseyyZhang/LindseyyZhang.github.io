/**
 * Synthesizes a low-frequency "cat purr" using Web Audio API:
 * a 30-50Hz sine carrier, amplitude-modulated by a ~25Hz tremolo
 * (the muscle-twitch rate of a real purr) plus lowpass-filtered
 * noise for texture. Intensity tracks the exhale phase.
 */
export class PurrSynth {
  private ctx: AudioContext | null = null;
  private carrier: OscillatorNode | null = null;
  private carrierFreqBase: ConstantSourceNode | null = null;
  private carrierFreqLfo: OscillatorNode | null = null;
  private carrierFreqLfoGain: GainNode | null = null;

  private tremoloLfo: OscillatorNode | null = null;
  private tremoloDepth: GainNode | null = null;
  private tremoloOffset: ConstantSourceNode | null = null;
  private tremoloGain: GainNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  private masterGain: GainNode | null = null;
  private running = false;
  private currentIntensity = 0;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  private buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  async start(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") await ctx.resume();
    if (this.running) return;
    this.running = true;

    const now = ctx.currentTime;

    // Master output, starts silent and eases in via setIntensity().
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.connect(ctx.destination);

    // Carrier: 30-50Hz sine, frequency wandered slowly by a sub-audio LFO.
    this.carrier = ctx.createOscillator();
    this.carrier.type = "sine";
    this.carrier.frequency.value = 38;

    this.carrierFreqBase = ctx.createConstantSource();
    this.carrierFreqBase.offset.value = 0;
    this.carrierFreqLfo = ctx.createOscillator();
    this.carrierFreqLfo.type = "sine";
    this.carrierFreqLfo.frequency.value = 0.13;
    this.carrierFreqLfoGain = ctx.createGain();
    this.carrierFreqLfoGain.gain.value = 8; // wander +-8Hz around 38Hz -> ~30-46Hz
    this.carrierFreqLfo.connect(this.carrierFreqLfoGain);
    this.carrierFreqLfoGain.connect(this.carrier.frequency);

    // Tremolo: ~25Hz amplitude modulation, the "engine" texture of a purr.
    this.tremoloGain = ctx.createGain();
    this.tremoloGain.gain.value = 0; // driven by tremoloOffset + tremoloDepth
    this.tremoloOffset = ctx.createConstantSource();
    this.tremoloOffset.offset.value = 0.5;
    this.tremoloOffset.connect(this.tremoloGain.gain);

    this.tremoloLfo = ctx.createOscillator();
    this.tremoloLfo.type = "sine";
    this.tremoloLfo.frequency.value = 25;
    this.tremoloDepth = ctx.createGain();
    this.tremoloDepth.gain.value = 0.45;
    this.tremoloLfo.connect(this.tremoloDepth);
    this.tremoloDepth.connect(this.tremoloGain.gain);

    this.carrier.connect(this.tremoloGain);

    // Filtered noise bed for organic grit, mixed in quietly.
    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = this.buildNoiseBuffer(ctx);
    this.noiseSource.loop = true;
    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "lowpass";
    this.noiseFilter.frequency.value = 90;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.08;
    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.tremoloGain);

    this.tremoloGain.connect(this.masterGain);

    this.carrier.start();
    this.carrierFreqLfo.start();
    this.tremoloLfo.start();
    this.tremoloOffset.start();
    this.noiseSource.start();
  }

  /**
   * Set purr intensity 0..1. Call every animation frame with the
   * current exhale-phase amplitude to make the purr swell on exhale
   * and fall quiet on inhale.
   */
  setIntensity(intensity: number): void {
    if (!this.ctx || !this.masterGain || !this.carrier) return;
    const clamped = Math.min(1, Math.max(0, intensity));
    this.currentIntensity = clamped;
    const now = this.ctx.currentTime;
    // Gentle idle hum even at rest, swelling toward a soft peak on exhale.
    const targetGain = 0.015 + clamped * 0.09;
    this.masterGain.gain.setTargetAtTime(targetGain, now, 0.25);

    if (this.carrier) {
      const targetFreq = 32 + clamped * 14; // 32Hz idle -> 46Hz peak
      this.carrier.frequency.setTargetAtTime(targetFreq, now, 0.4);
    }
  }

  getIntensity(): number {
    return this.currentIntensity;
  }

  async stop(): Promise<void> {
    if (!this.ctx || !this.running) return;
    const now = this.ctx.currentTime;
    this.masterGain?.gain.setTargetAtTime(0, now, 0.2);

    const ctx = this.ctx;
    const nodesToStop = [this.carrier, this.carrierFreqLfo, this.tremoloLfo, this.tremoloOffset, this.noiseSource];
    window.setTimeout(() => {
      nodesToStop.forEach((n) => {
        try {
          n?.stop();
        } catch {
          /* already stopped */
        }
      });
    }, 400);

    this.running = false;
    void ctx;
  }

  dispose(): void {
    void this.stop();
    this.ctx?.close();
    this.ctx = null;
  }

  isRunning(): boolean {
    return this.running;
  }
}
