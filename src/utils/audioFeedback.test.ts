import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTaskCompletionTransition,
  getSoundPreference,
  setSoundPreference,
  playTaskCompletionDing,
  SOUND_STORAGE_KEY,
} from './audioFeedback';

test('isTaskCompletionTransition identifies completion only on false -> true', () => {
  // Not completed -> Completed => should play sound
  assert.equal(isTaskCompletionTransition(false, true), true);

  // Completed -> Not completed (unchecking) => should NOT play sound
  assert.equal(isTaskCompletionTransition(true, false), false);

  // False -> False (no change) => should NOT play sound
  assert.equal(isTaskCompletionTransition(false, false), false);

  // True -> True (re-saving completed state) => should NOT play sound
  assert.equal(isTaskCompletionTransition(true, true), false);
});

test('sound preference defaults to true and handles localStorage operations safely', () => {
  const originalLocalStorage = globalThis.localStorage;

  // Mock in-memory localStorage for test environment
  const mockStorage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = String(value);
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const k in mockStorage) delete mockStorage[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage;

  try {
    // Default when unset
    assert.equal(getSoundPreference(), true);

    // Disable sound
    setSoundPreference(false);
    assert.equal(getSoundPreference(), false);
    assert.equal(globalThis.localStorage.getItem(SOUND_STORAGE_KEY), 'false');

    // Re-enable sound
    setSoundPreference(true);
    assert.equal(getSoundPreference(), true);
    assert.equal(globalThis.localStorage.getItem(SOUND_STORAGE_KEY), 'true');
  } finally {
    globalThis.localStorage = originalLocalStorage;
  }
});

test('playTaskCompletionDing respects disabled sound preference when forcePlay is false', () => {
  const originalLocalStorage = globalThis.localStorage;
  const mockStorage: Record<string, string> = {
    [SOUND_STORAGE_KEY]: 'false',
  };
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      mockStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {},
    key: () => null,
    length: 0,
  } as unknown as Storage;

  try {
    const result = playTaskCompletionDing(null, { forcePlay: false });
    assert.equal(result, false);
  } finally {
    globalThis.localStorage = originalLocalStorage;
  }
});

test('playTaskCompletionDing synthesizes harmonics on provided AudioContext mock', () => {
  const scheduledValues: { node: string; method: string; args: unknown[] }[] = [];

  const createMockGain = (name: string) => {
    return {
      gain: {
        value: 1,
        setValueAtTime: (val: number, time: number) => {
          scheduledValues.push({ node: name, method: 'setValueAtTime', args: [val, time] });
        },
        linearRampToValueAtTime: (val: number, time: number) => {
          scheduledValues.push({ node: name, method: 'linearRampToValueAtTime', args: [val, time] });
        },
        exponentialRampToValueAtTime: (val: number, time: number) => {
          scheduledValues.push({ node: name, method: 'exponentialRampToValueAtTime', args: [val, time] });
        },
      },
      connect: () => {},
      disconnect: () => {},
    };
  };

  const createMockOscillator = (name: string) => {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: (val: number, time: number) => {
          scheduledValues.push({ node: name, method: 'frequency.setValueAtTime', args: [val, time] });
        },
      },
      connect: () => {},
      disconnect: () => {},
      start: (time: number) => {
        scheduledValues.push({ node: name, method: 'start', args: [time] });
      },
      stop: (time: number) => {
        scheduledValues.push({ node: name, method: 'stop', args: [time] });
      },
    };
  };

  const mockFilter = {
    type: 'lowpass',
    frequency: { setValueAtTime: () => {} },
    Q: { setValueAtTime: () => {} },
    connect: () => {},
    disconnect: () => {},
  };

  let oscCount = 0;
  let gainCount = 0;
  const mockContext = {
    state: 'running',
    currentTime: 10.0,
    destination: {},
    createGain: () => createMockGain(`gain_${++gainCount}`),
    createOscillator: () => createMockOscillator(`osc_${++oscCount}`),
    createBiquadFilter: () => mockFilter,
    resume: async () => {},
  } as unknown as AudioContext;

  let successCalled = false;
  const played = playTaskCompletionDing(mockContext, {
    forcePlay: true,
    volume: 0.15,
    onSuccess: () => {
      successCalled = true;
    },
  });

  assert.equal(played, true);
  assert.equal(successCalled, true);
  assert.equal(oscCount, 2, 'Should create 2 oscillators for the harmonic chord');

  // Verify fundamental frequency is scheduled at 880 Hz
  const osc1Freq = scheduledValues.find(
    (s) => s.node === 'osc_1' && s.method === 'frequency.setValueAtTime'
  );
  assert.ok(osc1Freq, 'Oscillator 1 frequency scheduled');
  assert.equal(osc1Freq?.args[0], 880);

  // Verify harmonic frequency is scheduled around 1318.51 Hz
  const osc2Freq = scheduledValues.find(
    (s) => s.node === 'osc_2' && s.method === 'frequency.setValueAtTime'
  );
  assert.ok(osc2Freq, 'Oscillator 2 frequency scheduled');
  assert.equal(osc2Freq?.args[0], 1318.51);
});
