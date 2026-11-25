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

test('switchPomodoroMode switches between 25m focus, 5m short break, and 15m long break', () => {
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

test('full screen pomodoro method: getPomodoroCycleProgress and getNextRecommendedPomodoroMode track 4-block cycles and 15m long breaks', async () => {
  const {
    LONG_BREAK_SECONDS,
    getModeDurationSeconds,
    getModeLabel,
    getPomodoroCycleProgress,
    getNextRecommendedPomodoroMode,
  } = await import('./pomodoroLogic');

  assert.equal(getModeDurationSeconds('focus'), DEFAULT_POMODORO_SECONDS);
  assert.equal(getModeDurationSeconds('break'), SHORT_BREAK_SECONDS);
  assert.equal(getModeDurationSeconds('longBreak'), LONG_BREAK_SECONDS);

  assert.equal(getModeLabel('focus'), 'Focus Session');
  assert.equal(getModeLabel('break'), 'Short Break');
  assert.equal(getModeLabel('longBreak'), 'Long Break');

  // Cycle progress for 2 completed sessions: step 3 of 4 in cycle 0
  const cycle2 = getPomodoroCycleProgress(2);
  assert.equal(cycle2.currentStepInCycle, 3);
  assert.equal(cycle2.completedFullCycles, 0);
  assert.deepEqual(
    cycle2.cycleSteps.map((s) => s.completed),
    [true, true, false, false]
  );

  // Cycle progress for 4 completed sessions: 1 full cycle completed, resets to step 1 of next 4-block cycle
  const cycle4 = getPomodoroCycleProgress(4);
  assert.equal(cycle4.currentStepInCycle, 1);
  assert.equal(cycle4.completedFullCycles, 1);

  // Next recommended mode after 3rd focus session is 'longBreak' (since 3 + 1 = 4th session)
  const thirdFocusState = createInitialPomodoroState(3);
  assert.equal(getNextRecommendedPomodoroMode(thirdFocusState), 'longBreak');

  // Next recommended mode after 1st focus session is 'break' (short break)
  const firstFocusState = createInitialPomodoroState(1);
  assert.equal(getNextRecommendedPomodoroMode(firstFocusState), 'break');
});

test('task-linked Pomodoro focus session: preparePomodoroForTask populates task title, switches to focus mode, and preserves active session for the same task', async () => {
  const {
    preparePomodoroForTask,
    sanitizeFocusIntention,
    parseLinkedTask,
    MAX_FOCUS_INTENTION_LENGTH,
  } = await import('./pomodoroLogic');

  // 1. Opening from a break switches to a fresh 25-minute focus block while keeping completedSessions
  const breakState = switchPomodoroMode(createInitialPomodoroState(3), 'break');
  const launched = preparePomodoroForTask(breakState, null, {
    id: 'task-q3',
    title: '  Q3   planning session  ',
    category: 'Work',
    priority: 'High',
  });

  assert.equal(launched.nextState.mode, 'focus');
  assert.equal(launched.nextState.status, 'idle');
  assert.equal(launched.nextState.secondsLeft, DEFAULT_POMODORO_SECONDS);
  assert.equal(launched.nextState.completedSessions, 3);
  assert.equal(launched.sanitizedTitle, 'Q3 planning session');
  assert.deepEqual(launched.linkedTask, {
    id: 'task-q3',
    title: 'Q3 planning session',
    category: 'Work',
    priority: 'High',
  });

  // 2. Re-opening the same task while running preserves remaining countdown
  const runningSameTask = tickPomodoro(
    startPomodoro(launched.nextState),
    120
  ).nextState;
  const reopenedSame = preparePomodoroForTask(runningSameTask, 'task-q3', {
    id: 'task-q3',
    title: 'Q3 planning session',
    category: 'Work',
    priority: 'High',
  });
  assert.equal(reopenedSame.nextState.status, 'running');
  assert.equal(reopenedSame.nextState.secondsLeft, DEFAULT_POMODORO_SECONDS - 120);

  // 3. Clicking a different task starts a fresh 25:00 idle focus block linked to the new task
  const switchedTask = preparePomodoroForTask(runningSameTask, 'task-q3', {
    id: 'task-ins',
    title: 'Renew insurance',
    category: 'Finance',
    priority: 'Med',
  });
  assert.equal(switchedTask.nextState.mode, 'focus');
  assert.equal(switchedTask.nextState.status, 'idle');
  assert.equal(switchedTask.nextState.secondsLeft, DEFAULT_POMODORO_SECONDS);
  assert.equal(switchedTask.sanitizedTitle, 'Renew insurance');
  assert.equal(switchedTask.linkedTask.id, 'task-ins');

  // 4. Empty title fallback & length cap
  const blankTask = preparePomodoroForTask(createInitialPomodoroState(), null, {
    id: 'task-empty',
    title: '   ',
  });
  assert.equal(blankTask.sanitizedTitle, 'Untitled Focus Task');

  const overlong = 'A'.repeat(200);
  assert.equal(sanitizeFocusIntention(overlong).length, MAX_FOCUS_INTENTION_LENGTH);

  // 5. parseLinkedTask safely rejects invalid persisted payloads
  assert.equal(parseLinkedTask(null), null);
  assert.equal(parseLinkedTask({ id: '', title: 'Bad' }), null);
  assert.deepEqual(
    parseLinkedTask({ id: 'd-1', title: 'Write spec', category: 'Work', priority: 'High' }),
    { id: 'd-1', title: 'Write spec', category: 'Work', priority: 'High' }
  );
});


