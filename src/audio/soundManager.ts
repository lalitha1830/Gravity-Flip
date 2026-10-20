/**
 * Web Audio API synthesizer for retro chiptune arcade sounds and background music.
 * Self-contained, zero-asset-dependencies, ultra-low latency.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private musicStep = 0;

  // Settings cache
  private soundEnabled = true;
  private musicEnabled = true;
  private sfxVolume = 0.7;
  private musicVolume = 0.4;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundEnabled ? this.sfxVolume : 0;
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.musicGain.connect(this.ctx.destination);
    } catch {
      // AudioContext not supported or blocked
    }
  }

  public resumeContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(soundEnabled: boolean, musicEnabled: boolean, sfxVol: number, musicVol: number) {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
    this.sfxVolume = sfxVol;
    this.musicVolume = musicVol;

    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(soundEnabled ? sfxVol : 0, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(musicEnabled ? musicVol : 0, this.ctx.currentTime);
    }

    if (!musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  // Sound Effect: Gravity Flip (rising arcade whoosh)
  public playFlip(direction: 1 | -1) {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    if (direction === -1) {
      // Flipping upwards: 220Hz -> 660Hz
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(660, t + 0.12);
    } else {
      // Flipping downwards: 660Hz -> 220Hz
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    }

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Sound Effect: Passed Obstacle (crisp score chime)
  public playScore() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, t); // G5
    osc.frequency.setValueAtTime(1046.5, t + 0.04); // C6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Sound Effect: Milestone (Arpeggiated Victory Chime)
  public playMilestone() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Sound Effect: Laser Warning Tick
  public playLaserWarning() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.06);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Sound Effect: Laser Zap
  public playLaserBeam() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Sound Effect: Crash / Explosion (White noise burst + sub-bass punch)
  public playCrash() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(150, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.45);

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(t);
  }

  // Sound Effect: UI Click
  public playClick() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Sound Effect: Level Clear / Victory
  public playVictory() {
    if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
    this.resumeContext();

    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.5, d: 0.3 }
    ];

    let offset = 0;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);
      offset += note.d + 0.02;
    });
  }

  // Procedural Retro Synthwave / Chiptune Background Music
  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.resumeContext();
    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Bass notes and Lead arpeggio notes (F minor / Ab major cyberpunk progression)
    // Fm -> Db -> Eb -> C
    const bassline = [174.61, 138.59, 155.56, 130.81]; // F3, Db3, Eb3, C3
    const leadNotes = [
      [349.23, 415.30, 523.25, 698.46], // F4, Ab4, C5, F5
      [277.18, 349.23, 415.30, 554.37], // Db4, F4, Ab4, Db5
      [311.13, 392.00, 466.16, 622.25], // Eb4, G4, Bb4, Eb5
      [261.63, 329.63, 392.00, 523.25]  // C4, E4, G4, C5
    ];

    const stepDuration = 140; // ms per 16th step (~107 BPM)

    const tick = () => {
      if (!this.isMusicPlaying || !this.musicEnabled) return;

      const chordIdx = Math.floor((this.musicStep / 16) % 4);
      const stepInChord = this.musicStep % 16;
      const noteIdx = stepInChord % 4;

      if (this.ctx && this.musicGain && this.ctx.state === 'running') {
        const t = this.ctx.currentTime;

        // Bass pulse on quarter notes (steps 0, 4, 8, 12)
        if (stepInChord % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassline[chordIdx], t);

          bassGain.gain.setValueAtTime(0.18, t);
          bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

          // Low pass filter for warm punchy bass
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, t);

          bassOsc.connect(filter);
          filter.connect(bassGain);
          bassGain.connect(this.musicGain);

          bassOsc.start(t);
          bassOsc.stop(t + 0.3);
        }

        // Retro arpeggiated lead
        const leadFreq = leadNotes[chordIdx][noteIdx];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadGain.gain.setValueAtTime(0.07, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);

        leadOsc.start(t);
        leadOsc.stop(t + 0.13);

        // Hi-hat noise tap on 8ths
        if (stepInChord % 2 === 1) {
          this.playHiHat(t);
        }
      }

      this.musicStep = (this.musicStep + 1) % 64;
      this.musicTimer = window.setTimeout(tick, stepDuration);
    };

    tick();
  }

  private playHiHat(t: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundManager = new SoundManager();
