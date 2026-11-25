/**
 * Web Audio API Tactile Sound Feedback
 *
 * Synthesizes a subtle, warm, harmonic completion "ding" chime without any external
 * audio assets. Designed for instant response, pleasant acoustic timbre, and low latency.
 */

export const SOUND_STORAGE_KEY = 'interactive_todo_sound_enabled';

let globalAudioContext: AudioContext | null = null;

/**
 * Checks if the Web Audio API is supported in the current environment.
 */
export function isAudioFeedbackSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
  );
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

/**
 * Retrieves the current user sound preference from localStorage.
 * Defaults to true (enabled).
 */
export function getSoundPreference(): boolean {
  const storage = getStorage();
  if (!storage) return true;
  try {
    const stored = storage.getItem(SOUND_STORAGE_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
}

/**
 * Persists the user sound preference to localStorage.
 */
export function setSoundPreference(enabled: boolean): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Safely creates or returns the singleton AudioContext instance.
 */
export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return null;

  try {
    if (!globalAudioContext || globalAudioContext.state === 'closed') {
      globalAudioContext = new AudioContextClass();
    }
    return globalAudioContext;
  } catch {
    return null;
  }
}

export interface DingAudioOptions {
  volume?: number;
  forcePlay?: boolean;
  onSuccess?: () => void;
}

/**
 * Determines whether a task status transition should trigger a completion sound.
 * Only returns true if transitioning from NOT completed to COMPLETED.
 */
export function isTaskCompletionTransition(
  prevCompleted: boolean,
  nextCompleted: boolean
): boolean {
  return !prevCompleted && nextCompleted;
}

/**
 * Synthesizes and plays a subtle, elegant dual-tone tactile "ding" chime.
 * Uses soft sine waves, warm harmonic spacing (A5 at 880Hz -> E6 at 1318.5Hz),
 * an anti-click attack envelope, exponential decay, and a gentle lowpass filter.
 */
export function playTaskCompletionDing(
  customContext?: AudioContext | null,
  options?: DingAudioOptions
): boolean {
  const isEnabled = options?.forcePlay ?? getSoundPreference();
  if (!isEnabled) {
    return false;
  }

  const ctx = customContext || getOrCreateAudioContext();
  if (!ctx) {
    return false;
  }

  try {
    // Resume audio context if browser suspended it pending user interaction
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const baseVolume = typeof options?.volume === 'number' ? options.volume : 0.15;
    const masterGain = ctx.createGain();

    // Warm lowpass filter to remove any harsh digital highs
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.Q.setValueAtTime(1.0, now);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Note 1: 880 Hz (A5) — initial crisp bell attack
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(baseVolume * 0.8, now + 0.008);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Note 2: 1318.51 Hz (E6) — resonant fifth overtone delayed slightly for shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.045);

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.0001, now + 0.045);
    gain2.gain.linearRampToValueAtTime(baseVolume, now + 0.055);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.3);

    // Cleanup node connections after playback finishes
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        try {
          osc1.disconnect();
          gain1.disconnect();
          osc2.disconnect();
          gain2.disconnect();
          masterGain.disconnect();
          filter.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }, 350);
    }

    if (options?.onSuccess) {
      options.onSuccess();
    }
    return true;
  } catch {
    return false;
  }
}
