/**
 * Pure state machine and formatting utilities for the built-in 25-minute
 * Pomodoro / Focus Timer in the dashboard header.
 */

export const DEFAULT_POMODORO_SECONDS = 25 * 60; // 25 minutes (1500s)
export const SHORT_BREAK_SECONDS = 5 * 60; // 5 minutes (300s)
export const POMODORO_STORAGE_KEY = 'interactive_todo_pomodoro_v1';

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed';
export type PomodoroMode = 'focus' | 'break';

export interface PomodoroState {
  status: PomodoroStatus;
  mode: PomodoroMode;
  secondsLeft: number;
  totalSeconds: number;
  completedSessions: number;
}

export function createInitialPomodoroState(
  completedSessions = 0
): PomodoroState {
  const safeCompleted =
    Number.isFinite(completedSessions) && completedSessions > 0
      ? Math.floor(completedSessions)
      : 0;
  return {
    status: 'idle',
    mode: 'focus',
    secondsLeft: DEFAULT_POMODORO_SECONDS,
    totalSeconds: DEFAULT_POMODORO_SECONDS,
    completedSessions: safeCompleted,
  };
}

export function formatPomodoroTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function calculatePomodoroProgress(
  secondsLeft: number,
  totalSeconds: number
): {
  elapsedPercentage: number;
  remainingPercentage: number;
} {
  const safeTotal =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? totalSeconds
      : DEFAULT_POMODORO_SECONDS;
  const safeLeft = Number.isFinite(secondsLeft)
    ? Math.min(safeTotal, Math.max(0, secondsLeft))
    : 0;

  const remainingRatio = safeLeft / safeTotal;
  const remainingPercentage = Math.round(remainingRatio * 100);
  const elapsedPercentage = Math.min(100, Math.max(0, 100 - remainingPercentage));

  return {
    elapsedPercentage,
    remainingPercentage,
  };
}

export function startPomodoro(state: PomodoroState): PomodoroState {
  const targetTotal =
    state.totalSeconds > 0
      ? state.totalSeconds
      : state.mode === 'break'
      ? SHORT_BREAK_SECONDS
      : DEFAULT_POMODORO_SECONDS;

  const nextSeconds =
    state.status === 'completed' || state.secondsLeft <= 0
      ? targetTotal
      : state.secondsLeft;

  return {
    ...state,
    status: 'running',
    secondsLeft: nextSeconds,
    totalSeconds: targetTotal,
  };
}

export function pausePomodoro(state: PomodoroState): PomodoroState {
  if (state.status !== 'running') {
    return state;
  }
  return {
    ...state,
    status: 'paused',
  };
}

export function stopAndResetPomodoro(state: PomodoroState): PomodoroState {
  const targetTotal =
    state.mode === 'break' ? SHORT_BREAK_SECONDS : DEFAULT_POMODORO_SECONDS;
  return {
    ...state,
    status: 'idle',
    secondsLeft: targetTotal,
    totalSeconds: targetTotal,
  };
}

export function togglePomodoroStartStop(state: PomodoroState): PomodoroState {
  if (state.status === 'running') {
    return pausePomodoro(state);
  }
  return startPomodoro(state);
}

export function switchPomodoroMode(
  state: PomodoroState,
  mode: PomodoroMode
): PomodoroState {
  const targetTotal =
    mode === 'break' ? SHORT_BREAK_SECONDS : DEFAULT_POMODORO_SECONDS;
  return {
    ...state,
    mode,
    status: 'idle',
    secondsLeft: targetTotal,
    totalSeconds: targetTotal,
  };
}

export function tickPomodoro(
  state: PomodoroState,
  elapsedSeconds = 1
): {
  nextState: PomodoroState;
  didComplete: boolean;
} {
  if (state.status !== 'running') {
    return { nextState: state, didComplete: false };
  }

  const step =
    Number.isFinite(elapsedSeconds) && elapsedSeconds > 0
      ? Math.floor(elapsedSeconds)
      : 1;
  const nextSeconds = Math.max(0, state.secondsLeft - step);

  if (nextSeconds === 0) {
    return {
      nextState: {
        ...state,
        status: 'completed',
        secondsLeft: 0,
        completedSessions:
          state.mode === 'focus'
            ? state.completedSessions + 1
            : state.completedSessions,
      },
      didComplete: true,
    };
  }

  return {
    nextState: {
      ...state,
      secondsLeft: nextSeconds,
    },
    didComplete: false,
  };
}
