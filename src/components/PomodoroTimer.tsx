import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Play, Pause, RotateCcw, Timer, CheckCircle2, Coffee } from 'lucide-react';
import {
  PomodoroState,
  PomodoroMode,
  POMODORO_STORAGE_KEY,
  createInitialPomodoroState,
  formatPomodoroTime,
  calculatePomodoroProgress,
  togglePomodoroStartStop,
  stopAndResetPomodoro,
  switchPomodoroMode,
  tickPomodoro,
} from '../utils/pomodoroLogic';
import { playTaskCompletionDing } from '../utils/audioFeedback';

interface PomodoroContextValue {
  state: PomodoroState;
  formattedTime: string;
  elapsedPercentage: number;
  remainingPercentage: number;
  onToggleStartStop: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function loadInitialPomodoroState(): PomodoroState {
  if (typeof window === 'undefined') {
    return createInitialPomodoroState(0);
  }
  try {
    const raw = window.localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!raw) return createInitialPomodoroState(0);
    const parsed = JSON.parse(raw) as Partial<PomodoroState>;
    const completed =
      typeof parsed.completedSessions === 'number' && parsed.completedSessions >= 0
        ? Math.floor(parsed.completedSessions)
        : 0;
    return createInitialPomodoroState(completed);
  } catch {
    return createInitialPomodoroState(0);
  }
}

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<PomodoroState>(() =>
    loadInitialPomodoroState()
  );

  // Persist completed sessions count to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        POMODORO_STORAGE_KEY,
        JSON.stringify({
          completedSessions: state.completedSessions,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [state.completedSessions]);

  // 1-second interval tick while running
  useEffect(() => {
    if (state.status !== 'running') return;

    const intervalId = window.setInterval(() => {
      setState((prev) => {
        const { nextState, didComplete } = tickPomodoro(prev, 1);
        if (didComplete) {
          playTaskCompletionDing();
        }
        return nextState;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.status]);

  const onToggleStartStop = useCallback(() => {
    setState((prev) => togglePomodoroStartStop(prev));
  }, []);

  const onReset = useCallback(() => {
    setState((prev) => stopAndResetPomodoro(prev));
  }, []);

  const onSwitchMode = useCallback((mode: PomodoroMode) => {
    setState((prev) => switchPomodoroMode(prev, mode));
  }, []);

  const formattedTime = useMemo(
    () => formatPomodoroTime(state.secondsLeft),
    [state.secondsLeft]
  );

  const { elapsedPercentage, remainingPercentage } = useMemo(
    () => calculatePomodoroProgress(state.secondsLeft, state.totalSeconds),
    [state.secondsLeft, state.totalSeconds]
  );

  const value = useMemo<PomodoroContextValue>(
    () => ({
      state,
      formattedTime,
      elapsedPercentage,
      remainingPercentage,
      onToggleStartStop,
      onReset,
      onSwitchMode,
    }),
    [
      state,
      formattedTime,
      elapsedPercentage,
      remainingPercentage,
      onToggleStartStop,
      onReset,
      onSwitchMode,
    ]
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return ctx;
}

interface PomodoroTimerProps {
  instanceId?: string;
  compact?: boolean;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  instanceId = 'dashboard',
  compact = false,
}) => {
  const {
    state,
    formattedTime,
    elapsedPercentage,
    remainingPercentage,
    onToggleStartStop,
    onReset,
    onSwitchMode,
  } = usePomodoro();

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';
  const isCompleted = state.status === 'completed';
  const isBreak = state.mode === 'break';
  const canReset =
    state.status !== 'idle' || state.secondsLeft !== state.totalSeconds;

  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (remainingPercentage / 100) * ringCircumference;

  const primaryTestIdPrefix =
    instanceId === 'dashboard' ? 'pomodoro' : `${instanceId}-pomodoro`;

  return (
    <div
      role="region"
      aria-label="25-Minute Pomodoro Focus Timer"
      data-testid={`${primaryTestIdPrefix}-timer`}
      data-pomodoro-status={state.status}
      data-pomodoro-mode={state.mode}
      className={`relative inline-flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-full shadow-2xs transition-all overflow-hidden ${
        compact ? 'px-2 py-0.5' : 'px-2.5 sm:px-3 py-1'
      } ${
        isRunning
          ? 'ring-1 ring-[#C26D43]/45 border-[#D8B49E]'
          : ''
      }`}
    >
      {/* Visual Progress Ring + Mode Icon */}
      <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
        <svg
          className="w-6 h-6 -rotate-90"
          viewBox="0 0 28 28"
          aria-hidden="true"
        >
          <circle
            cx="14"
            cy="14"
            r={ringRadius}
            fill="transparent"
            stroke="#E6DFD5"
            strokeWidth="2.75"
            className="donut-track-ring"
          />
          <circle
            cx="14"
            cy="14"
            r={ringRadius}
            fill="transparent"
            stroke={isBreak ? '#4A8B63' : '#C26D43'}
            strokeWidth="2.75"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3 text-[#4A8B63]" />
          ) : isBreak ? (
            <Coffee className="w-2.5 h-2.5 text-[#4A8B63]" />
          ) : (
            <Timer
              className={`w-3 h-3 ${
                isRunning ? 'text-[#C26D43]' : 'text-[#7A6E63]'
              }`}
            />
          )}
        </span>
      </div>

      {/* Mode Switcher (25m Focus / 5m Break) */}
      <div
        className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E4DDD3]"
        role="group"
        aria-label="Focus timer mode"
      >
        <button
          type="button"
          onClick={() => onSwitchMode('focus')}
          data-testid={`${primaryTestIdPrefix}-mode-focus-btn`}
          aria-pressed={!isBreak}
          title="25-minute Focus work block"
          className={`px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
            !isBreak
              ? 'bg-white text-[#2F2B28] shadow-2xs'
              : 'text-[#7A7269] hover:text-[#2F2B28]'
          }`}
        >
          25m Focus
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('break')}
          data-testid={`${primaryTestIdPrefix}-mode-break-btn`}
          aria-pressed={isBreak}
          title="5-minute short break"
          className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
            isBreak
              ? 'bg-white text-[#2F2B28] shadow-2xs'
              : 'text-[#7A7269] hover:text-[#2F2B28]'
          }`}
        >
          5m Break
        </button>
      </div>

      {/* Visual Countdown Readout */}
      <div className="flex items-center gap-1.5 px-1">
        <span
          data-testid={`${primaryTestIdPrefix}-time-display`}
          className={`font-mono tabular-nums font-extrabold tracking-tight ${
            compact ? 'text-xs' : 'text-xs sm:text-[13px]'
          } ${
            isRunning
              ? 'text-[#C26D43]'
              : isCompleted
              ? 'text-[#3F6F4A]'
              : 'text-[#2F2B28]'
          }`}
        >
          {formattedTime}
        </span>

        <span
          data-testid={`${primaryTestIdPrefix}-status-label`}
          className="hidden xl:inline text-[9.5px] font-semibold text-[#8A8279] whitespace-nowrap"
        >
          {isRunning
            ? isBreak
              ? 'Break active'
              : 'Focusing'
            : isPaused
            ? 'Paused'
            : isCompleted
            ? 'Block done!'
            : 'Ready'}
        </span>
      </div>

      {/* Start / Stop (Pause) Button */}
      <button
        type="button"
        onClick={onToggleStartStop}
        data-testid={`${primaryTestIdPrefix}-toggle-btn`}
        aria-label={
          isRunning
            ? 'Stop / Pause 25-minute focus timer'
            : isPaused
            ? 'Resume 25-minute focus timer'
            : 'Start 25-minute focus timer'
        }
        title={
          isRunning
            ? 'Pause / Stop countdown'
            : isPaused
            ? 'Resume countdown'
            : 'Start 25-minute focus block'
        }
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          isRunning
            ? 'bg-[#F5DFD0] hover:bg-[#EED2BF] text-[#9A4E28] border border-[#E5C5AF]'
            : 'bg-[#C26D43] hover:bg-[#AD5D35] text-white shadow-2xs'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-2.5 h-2.5 fill-current" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>{isPaused ? 'Resume' : 'Start'}</span>
          </>
        )}
      </button>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        disabled={!canReset}
        data-testid={`${primaryTestIdPrefix}-reset-btn`}
        aria-label="Reset focus timer to 25:00"
        title="Reset timer to full block"
        className={`p-1 rounded-full transition-colors shrink-0 ${
          canReset
            ? 'text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer'
            : 'text-[#C5BCB0] opacity-45 cursor-not-allowed'
        }`}
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      {/* Completed Sessions Counter */}
      {state.completedSessions > 0 && (
        <span
          data-testid={`${primaryTestIdPrefix}-sessions-count`}
          title={`${state.completedSessions} focus block${
            state.completedSessions === 1 ? '' : 's'
          } completed`}
          className="hidden sm:inline-flex items-center gap-1 text-[9.5px] font-bold text-[#3F6F4A] bg-[#DFECE0] px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap"
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>{state.completedSessions}</span>
        </span>
      )}

      {/* Subtle Bottom Linear Countdown Progress Bar */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#EFECE6] overflow-hidden rounded-full pointer-events-none"
      >
        <div
          data-testid={`${primaryTestIdPrefix}-progress-bar`}
          className="h-full transition-all duration-300"
          style={{
            width: `${
              state.status === 'idle' ? 0 : Math.max(elapsedPercentage, 3)
            }%`,
            backgroundColor: isBreak ? '#4A8B63' : '#C26D43',
          }}
        />
      </div>
    </div>
  );
};
