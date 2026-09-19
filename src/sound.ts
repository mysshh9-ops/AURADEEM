/**
 * Lightweight Web Audio API sound manager.
 * Generates all sounds locally — no external files.
 * Audio context is created lazily after first user interaction.
 */

type SoundType =
  | "complete"
  | "levelup"
  | "achievement"
  | "delete"
  | "click"
  | "add";

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call after any user gesture to unlock audio on mobile/Safari. */
export function initAudio(): void {
  getCtx();
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue = 0.15,
  startOffset = 0,
  freqEnd?: number
): void {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime + startOffset;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, freqEnd),
      now + duration
    );
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export function play(sound: SoundType): void {
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;

  switch (sound) {
    case "complete":
      // Bright ascending arpeggio
      tone(523.25, 0.12, "sine", 0.12, 0); // C5
      tone(659.25, 0.12, "sine", 0.12, 0.06); // E5
      tone(783.99, 0.18, "sine", 0.14, 0.12); // G5
      break;
    case "levelup":
      // Dramatic ascending fanfare
      tone(392, 0.1, "square", 0.08, 0); // G4
      tone(523.25, 0.1, "square", 0.08, 0.08); // C5
      tone(659.25, 0.1, "square", 0.08, 0.16); // E5
      tone(783.99, 0.1, "square", 0.08, 0.24); // G5
      tone(1046.5, 0.3, "sine", 0.15, 0.32); // C6
      break;
    case "achievement":
      // Sparkly celebratory
      tone(880, 0.08, "sine", 0.1, 0); // A5
      tone(1108.73, 0.08, "sine", 0.1, 0.05); // C#6
      tone(1318.51, 0.15, "sine", 0.12, 0.1); // E6
      tone(1760, 0.2, "sine", 0.1, 0.15); // A6
      break;
    case "delete":
      // Subtle low thunk
      tone(220, 0.15, "sine", 0.08, 0, 110);
      break;
    case "click":
      // Very subtle tick
      tone(1200, 0.03, "sine", 0.03);
      break;
    case "add":
      // Quick positive blip
      tone(660, 0.06, "sine", 0.08, 0);
      tone(880, 0.08, "sine", 0.08, 0.04);
      break;
  }
}
