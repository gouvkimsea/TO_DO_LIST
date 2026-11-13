import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_POMODORO_SECONDS,
  SHORT_BREAK_SECONDS,
  createInitialPomodoroState,
  formatPomodoroTime,
  calculatePomodoroProgress,
  startPomodoro,
  pausePomodoro,
  stopAndResetPomodoro,
  togglePomodoroStartStop,
  switchPomodoroMode,
  tickPomodoro,
} from './pomodoroLogic';

test('createInitialPomodoroState initializes 25-minute focus block', () => {
  const initial = createInitialPomodoroState();
  assert.equal(initial.status, 'idle');
  assert.equal(initial.mode, 'focus');
  assert.equal(initial.secondsLeft, 1500);
  assert.equal(initial.totalSeconds, DEFAULT_POMODORO_SECONDS);
  assert.equal(initial.completedSessions, 0);
});

test('formatPomodoroTime formats MM:SS cleanly with leading zeros', () => {
  assert.equal(formatPomodoroTime(1500), '25:00');
  assert.equal(formatPomodoroTime(1499), '24:59');
  assert.equal(formatPomodoroTime(65), '01:05');
  assert.equal(formatPomodoroTime(9), '00:09');
  assert.equal(formatPomodoroTime(0), '00:00');
  assert.equal(formatPomodoroTime(-15), '00:00');
});

test('calculatePomodoroProgress computes elapsed and remaining percentages', () => {
  const atStart = calculatePomodoroProgress(1500, 1500);
  assert.equal(atStart.remainingPercentage, 100);
  assert.equal(atStart.elapsedPercentage, 0);

  const halfWay = calculatePomodoroProgress(750, 1500);
  assert.equal(halfWay.remainingPercentage, 50);
  assert.equal(halfWay.elapsedPercentage, 50);

  const finished = calculatePomodoroProgress(0, 1500);
  assert.equal(finished.remainingPercentage, 0);
  assert.equal(finished.elapsedPercentage, 100);
});

test('togglePomodoroStartStop transitions idle -> running -> paused -> running', () => {
  const idle = createInitialPomodoroState();
  const running = togglePomodoroStartStop(idle);
  assert.equal(running.status, 'running');
  assert.equal(running.secondsLeft, 1500);

  const { nextState: ticked } = tickPomodoro(running, 10);
  assert.equal(ticked.secondsLeft, 1490);

  const paused = togglePomodoroStartStop(ticked);
  assert.equal(paused.status, 'paused');
  assert.equal(paused.secondsLeft, 1490);

  const resumed = togglePomodoroStartStop(paused);
  assert.equal(resumed.status, 'running');
  assert.equal(resumed.secondsLeft, 1490);
});

test('stopAndResetPomodoro restores full 25-minute countdown while preserving completedSessions', () => {
  const state = {
    ...createInitialPomodoroState(3),
    status: 'running' as const,
    secondsLeft: 842,
  };
  const reset = stopAndResetPomodoro(state);
  assert.equal(reset.status, 'idle');
  assert.equal(reset.secondsLeft, DEFAULT_POMODORO_SECONDS);
  assert.equal(reset.completedSessions, 3);
});

test('tickPomodoro completes block at 0 seconds and increments completedSessions', () => {
  const nearEnd = {
    ...createInitialPomodoroState(1),
    status: 'running' as const,
    secondsLeft: 2,
  };

  const step1 = tickPomodoro(nearEnd, 1);
  assert.equal(step1.didComplete, false);
  assert.equal(step1.nextState.secondsLeft, 1);
  assert.equal(step1.nextState.status, 'running');

  const step2 = tickPomodoro(step1.nextState, 1);
  assert.equal(step2.didComplete, true);
  assert.equal(step2.nextState.secondsLeft, 0);
  assert.equal(step2.nextState.status, 'completed');
  assert.equal(step2.nextState.completedSessions, 2);

  // Starting again from completed state resets countdown to 25:00
  const restarted = startPomodoro(step2.nextState);
  assert.equal(restarted.status, 'running');
  assert.equal(restarted.secondsLeft, DEFAULT_POMODORO_SECONDS);
  assert.equal(restarted.completedSessions, 2);
});

test('switchPomodoroMode switches between 25m focus and 5m short break', () => {
  const initial = createInitialPomodoroState(2);
  const breakState = switchPomodoroMode(initial, 'break');
  assert.equal(breakState.mode, 'break');
  assert.equal(breakState.status, 'idle');
  assert.equal(breakState.secondsLeft, SHORT_BREAK_SECONDS);
  assert.equal(breakState.totalSeconds, SHORT_BREAK_SECONDS);

  const focusState = switchPomodoroMode(breakState, 'focus');
  assert.equal(focusState.mode, 'focus');
  assert.equal(focusState.secondsLeft, DEFAULT_POMODORO_SECONDS);
});
