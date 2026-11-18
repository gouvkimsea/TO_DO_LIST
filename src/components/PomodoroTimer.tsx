import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  CheckCircle2,
  Coffee,
  Maximize2,
  Minimize2,
  X,
  SkipForward,
  Sparkles,
  Target,
} from 'lucide-react';
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
  getModeLabel,
  getPomodoroCycleProgress,
  getNextRecommendedPomodoroMode,
} from '../utils/pomodoroLogic';
import { playTaskCompletionDing } from '../utils/audioFeedback';
import {
  requestBrowserFullscreen,
  exitBrowserFullscreen,
  getActiveFullscreenElement,
  FULLSCREEN_CHANGE_EVENTS,
  FullscreenDocumentLike,
} from '../utils/fullscreenMode';

interface PomodoroContextValue {
  state: PomodoroState;
  formattedTime: string;
  elapsedPercentage: number;
  remainingPercentage: number;
  isFullscreen: boolean;
  isNativeBrowserFullscreen: boolean;
  focusIntention: string;
  onSetFocusIntention: (value: string) => void;
  onToggleStartStop: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  onAdvanceNextPhase: () => void;
  onOpenFullscreen: () => void;
  onCloseFullscreen: () => void;
  onToggleFullscreen: () => void;
  onToggleNativeBrowserFullscreen: () => Promise<void>;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

function loadInitialPomodoroData(): {
  state: PomodoroState;
  focusIntention: string;
} {
  if (typeof window === 'undefined') {
    return {
      state: createInitialPomodoroState(0),
      focusIntention: '',
    };
  }
  try {
    const raw = window.localStorage.getItem(POMODORO_STORAGE_KEY);
    if (!raw) {
      return {
        state: createInitialPomodoroState(0),
        focusIntention: '',
      };
    }
    const parsed = JSON.parse(raw) as Partial<PomodoroState> & {
      focusIntention?: string;
    };
    const completed =
      typeof parsed.completedSessions === 'number' &&
      parsed.completedSessions >= 0
        ? Math.floor(parsed.completedSessions)
        : 0;
    const intention =
      typeof parsed.focusIntention === 'string'
        ? parsed.focusIntention.slice(0, 140)
        : '';
    return {
      state: createInitialPomodoroState(completed),
      focusIntention: intention,
    };
  } catch {
    return {
      state: createInitialPomodoroState(0),
      focusIntention: '',
    };
  }
}

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialData = useMemo(() => loadInitialPomodoroData(), []);
  const [state, setState] = useState<PomodoroState>(initialData.state);
  const [focusIntention, setFocusIntention] = useState<string>(
    initialData.focusIntention
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isNativeBrowserFullscreen, setIsNativeBrowserFullscreen] =
    useState<boolean>(false);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  // Persist completed sessions count & focus intention to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        POMODORO_STORAGE_KEY,
        JSON.stringify({
          completedSessions: state.completedSessions,
          focusIntention,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [state.completedSessions, focusIntention]);

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

  // Track native browser fullscreen state changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const fsDoc = document as unknown as FullscreenDocumentLike;
    const handleFsChange = () => {
      const activeEl = getActiveFullscreenElement(fsDoc);
      setIsNativeBrowserFullscreen(Boolean(activeEl));
    };
    for (const evt of FULLSCREEN_CHANGE_EVENTS) {
      document.addEventListener(evt, handleFsChange);
    }
    return () => {
      for (const evt of FULLSCREEN_CHANGE_EVENTS) {
        document.removeEventListener(evt, handleFsChange);
      }
    };
  }, []);

  const onToggleStartStop = useCallback(() => {
    setState((prev) => togglePomodoroStartStop(prev));
  }, []);

  const onReset = useCallback(() => {
    setState((prev) => stopAndResetPomodoro(prev));
  }, []);

  const onSwitchMode = useCallback((mode: PomodoroMode) => {
    setState((prev) => switchPomodoroMode(prev, mode));
  }, []);

  const onAdvanceNextPhase = useCallback(() => {
    setState((prev) => {
      const nextMode = getNextRecommendedPomodoroMode(prev);
      return switchPomodoroMode(prev, nextMode);
    });
  }, []);

  const onSetFocusIntention = useCallback((value: string) => {
    setFocusIntention(value.slice(0, 140));
  }, []);

  const onOpenFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const onCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (typeof document !== 'undefined') {
      const fsDoc = document as unknown as FullscreenDocumentLike;
      if (getActiveFullscreenElement(fsDoc)) {
        void exitBrowserFullscreen(fsDoc);
      }
    }
  }, []);

  const onToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (!next && typeof document !== 'undefined') {
        const fsDoc = document as unknown as FullscreenDocumentLike;
        if (getActiveFullscreenElement(fsDoc)) {
          void exitBrowserFullscreen(fsDoc);
        }
      }
      return next;
    });
  }, []);

  const onToggleNativeBrowserFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    const fsDoc = document as unknown as FullscreenDocumentLike;
    if (getActiveFullscreenElement(fsDoc)) {
      await exitBrowserFullscreen(fsDoc);
      setIsNativeBrowserFullscreen(false);
    } else {
      const targetEl =
        fullscreenContainerRef.current || document.documentElement;
      const res = await requestBrowserFullscreen(targetEl, fsDoc);
      setIsNativeBrowserFullscreen(res.nativeFullscreen);
    }
  }, []);

  // Keyboard shortcuts while Full Screen Pomodoro is open
  useEffect(() => {
    if (!isFullscreen || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
      );

      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseFullscreen();
        return;
      }

      if (isEditable || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === ' ') {
        e.preventDefault();
        onToggleStartStop();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, onCloseFullscreen, onToggleStartStop, onReset]);

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
      isFullscreen,
      isNativeBrowserFullscreen,
      focusIntention,
      onSetFocusIntention,
      onToggleStartStop,
      onReset,
      onSwitchMode,
      onAdvanceNextPhase,
      onOpenFullscreen,
      onCloseFullscreen,
      onToggleFullscreen,
      onToggleNativeBrowserFullscreen,
    }),
    [
      state,
      formattedTime,
      elapsedPercentage,
      remainingPercentage,
      isFullscreen,
      isNativeBrowserFullscreen,
      focusIntention,
      onSetFocusIntention,
      onToggleStartStop,
      onReset,
      onSwitchMode,
      onAdvanceNextPhase,
      onOpenFullscreen,
      onCloseFullscreen,
      onToggleFullscreen,
      onToggleNativeBrowserFullscreen,
    ]
  );

  return (
    <PomodoroContext.Provider value={value}>
      {children}
      {isFullscreen && (
        <PomodoroFullscreenOverlay containerRef={fullscreenContainerRef} />
      )}
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

const PomodoroFullscreenOverlay: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const {
    state,
    formattedTime,
    elapsedPercentage,
    remainingPercentage,
    isNativeBrowserFullscreen,
    focusIntention,
    onSetFocusIntention,
    onToggleStartStop,
    onReset,
    onSwitchMode,
    onAdvanceNextPhase,
    onCloseFullscreen,
    onToggleNativeBrowserFullscreen,
  } = usePomodoro();

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';
  const isCompleted = state.status === 'completed';
  const isFocus = state.mode === 'focus';
  const isShortBreak = state.mode === 'break';
  const isLongBreak = state.mode === 'longBreak';

  const canReset =
    state.status !== 'idle' || state.secondsLeft !== state.totalSeconds;

  const cycleProgress = useMemo(
    () => getPomodoroCycleProgress(state.completedSessions),
    [state.completedSessions]
  );

  const nextRecommendedMode = useMemo(
    () => getNextRecommendedPomodoroMode(state),
    [state]
  );

  const largeRadius = 118;
  const largeCircumference = 2 * Math.PI * largeRadius;
  const largeStrokeDashoffset =
    largeCircumference - (remainingPercentage / 100) * largeCircumference;

  const accentColor = isFocus
    ? '#C26D43'
    : isLongBreak
    ? '#5D508C'
    : '#4A8B63';

  const softBadgeBg = isFocus
    ? '#F5DFD0'
    : isLongBreak
    ? '#E6E2F3'
    : '#DFECE0';

  const softBadgeText = isFocus
    ? '#9A4E28'
    : isLongBreak
    ? '#4E3F84'
    : '#266841';

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full Screen Pomodoro Method Focus Studio"
      data-testid="pomodoro-fullscreen-overlay"
      data-pomodoro-mode={state.mode}
      data-pomodoro-status={state.status}
      className="fixed inset-0 z-[110] bg-[#FAF6F0] text-[#2F2B28] flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto select-none"
    >
      {/* Top Bar: Method Branding + Cycle Progress + Native Fullscreen / Close Controls */}
      <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E5DEC9] shadow-2xs"
            style={{ backgroundColor: softBadgeBg, color: softBadgeText }}
          >
            {isFocus ? (
              <Timer className="w-4.5 h-4.5" />
            ) : (
              <Coffee className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8A8279] block">
              POMODORO METHOD STUDIO
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2F2B28] leading-tight">
              {getModeLabel(state.mode)}
            </h2>
          </div>
        </div>

        {/* 4-Step Pomodoro Cycle Indicator */}
        <div
          data-testid="pomodoro-fullscreen-cycle-tracker"
          className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E5DEC9] rounded-full px-3.5 py-1.5 shadow-2xs"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E63]">
            4-Block Cycle
          </span>
          <div className="flex items-center gap-1.5">
            {cycleProgress.cycleSteps.map((step) => (
              <span
                key={step.stepNumber}
                data-testid={`pomodoro-cycle-dot-${step.stepNumber}`}
                data-completed={step.completed ? 'true' : 'false'}
                title={`Pomodoro #${step.stepNumber} in current 4-block cycle`}
                className={`w-3 h-3 rounded-full transition-all ${
                  step.completed
                    ? 'bg-[#C26D43] scale-105'
                    : step.isCurrent && isFocus
                    ? 'ring-2 ring-[#C26D43] bg-[#F5DFD0]'
                    : 'bg-[#E5DEC9]'
                }`}
              />
            ))}
          </div>
          <span
            data-testid="pomodoro-fullscreen-total-sessions"
            className="text-xs font-extrabold text-[#2F2B28] tabular-nums pl-1 border-l border-[#E5DEC9]"
          >
            {state.completedSessions} completed
          </span>
        </div>

        {/* Right Actions: Browser Fullscreen + Exit Full Screen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onToggleNativeBrowserFullscreen()}
            data-testid="pomodoro-native-fullscreen-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDFBF7] hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs font-bold text-[#4A433C] transition-colors cursor-pointer"
            title="Toggle OS / Browser Fullscreen"
          >
            {isNativeBrowserFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Windowed</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">OS Fullscreen</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCloseFullscreen}
            data-testid="pomodoro-fullscreen-close-btn"
            aria-label="Exit Full Screen Pomodoro Mode"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2F2B28] hover:bg-[#433D38] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Full Screen</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Mode Tabs + Giant Circular Timer + Focus Intention + Controls */}
      <div className="w-full max-w-2xl mx-auto my-auto py-4 flex flex-col items-center text-center gap-5">
        {/* 3-Mode Switcher (25m Focus / 5m Short Break / 15m Long Break) */}
        <div
          role="group"
          aria-label="Pomodoro Method Interval Mode"
          className="inline-flex items-center bg-[#EFECE6] p-1 rounded-full border border-[#E2D9CC] shadow-2xs"
        >
          <button
            type="button"
            onClick={() => onSwitchMode('focus')}
            data-testid="pomodoro-fullscreen-mode-focus"
            aria-pressed={isFocus}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isFocus
                ? 'bg-white text-[#2F2B28] shadow-xs'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            25m Focus
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('break')}
            data-testid="pomodoro-fullscreen-mode-break"
            aria-pressed={isShortBreak}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isShortBreak
                ? 'bg-white text-[#2F2B28] shadow-xs'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            5m Short Break
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('longBreak')}
            data-testid="pomodoro-fullscreen-mode-longBreak"
            aria-pressed={isLongBreak}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isLongBreak
                ? 'bg-white text-[#2F2B28] shadow-xs'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            15m Long Break
          </button>
        </div>

        {/* Giant Editorial Circular Countdown Ring */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 264 264"
            aria-hidden="true"
          >
            <circle
              cx="132"
              cy="132"
              r={largeRadius}
              fill="transparent"
              stroke="#EAE3D7"
              strokeWidth="12"
            />
            <circle
              cx="132"
              cy="132"
              r={largeRadius}
              fill="transparent"
              stroke={accentColor}
              strokeWidth="12"
              strokeDasharray={largeCircumference}
              strokeDashoffset={largeStrokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <span
              data-testid="pomodoro-fullscreen-status-pill"
              className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ backgroundColor: softBadgeBg, color: softBadgeText }}
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {isRunning
                  ? isFocus
                    ? 'Deep Focus Active'
                    : 'Recharging'
                  : isPaused
                  ? 'Timer Paused'
                  : isCompleted
                  ? 'Interval Complete!'
                  : `${getModeLabel(state.mode)} Ready`}
              </span>
            </span>

            <span
              data-testid="pomodoro-fullscreen-time-display"
              className="font-mono tabular-nums text-5xl sm:text-6xl font-black tracking-tight text-[#2F2B28] leading-none"
            >
              {formattedTime}
            </span>

            <span className="text-xs font-semibold text-[#8A8279] mt-2 tabular-nums">
              {elapsedPercentage}% elapsed · Step{' '}
              {cycleProgress.currentStepInCycle} of 4
            </span>
          </div>
        </div>

        {/* Focus Intention Input */}
        <div className="w-full max-w-md bg-[#FDFBF7] border border-[#E5DEC9] rounded-2xl px-3.5 py-2.5 shadow-2xs flex items-center gap-2.5">
          <Target
            className="w-4 h-4 shrink-0"
            style={{ color: accentColor }}
          />
          <input
            type="text"
            value={focusIntention}
            onChange={(e) => onSetFocusIntention(e.target.value)}
            placeholder="What single task are you focusing on right now?"
            aria-label="Current Pomodoro focus task intention"
            data-testid="pomodoro-fullscreen-intention-input"
            className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#2F2B28] placeholder:text-[#9C948B] focus:outline-none"
          />
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleStartStop}
            data-testid="pomodoro-fullscreen-toggle-btn"
            style={{
              backgroundColor: isRunning ? softBadgeBg : accentColor,
              color: isRunning ? softBadgeText : '#FFFFFF',
            }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm sm:text-base font-extrabold shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isPaused ? 'Resume Timer' : 'Start Pomodoro'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            data-testid="pomodoro-fullscreen-reset-btn"
            className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border border-[#E2D9CC] transition-colors ${
              canReset
                ? 'bg-[#FDFBF7] hover:bg-[#EFECE6] text-[#2F2B28] cursor-pointer'
                : 'bg-[#FAF6F0] text-[#B8AFA3] opacity-50 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onAdvanceNextPhase}
            data-testid="pomodoro-fullscreen-next-phase-btn"
            title={`Skip to recommended next phase: ${getModeLabel(
              nextRecommendedMode
            )}`}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FDFBF7] hover:bg-[#EFECE6] border border-[#E2D9CC] text-[#4A433C] transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            <span>Next: {getModeLabel(nextRecommendedMode)}</span>
          </button>
        </div>
      </div>

      {/* Footer: Pomodoro Method Guide & Keyboard Shortcuts */}
      <div className="w-full max-w-5xl mx-auto pt-3 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-semibold text-[#7A7269]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#4A433C] font-bold">
            1. Pick 1 task
          </span>
          <span>→</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#4A433C] font-bold">
            2. Focus 25m
          </span>
          <span>→</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#4A433C] font-bold">
            3. Short Break 5m
          </span>
          <span>→</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#4A433C] font-bold">
            4. Long Break 15m after 4 blocks
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10.5px] text-[#8A8279]">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE6] border border-[#DED8CE] font-mono text-[10px] text-[#4A433C]">
              Space
            </kbd>{' '}
            Start/Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE6] border border-[#DED8CE] font-mono text-[10px] text-[#4A433C]">
              R
            </kbd>{' '}
            Reset
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#EFECE6] border border-[#DED8CE] font-mono text-[10px] text-[#4A433C]">
              Esc
            </kbd>{' '}
            Exit
          </span>
        </div>
      </div>
    </div>
  );
};

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
    onOpenFullscreen,
  } = usePomodoro();

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';
  const isCompleted = state.status === 'completed';
  const isBreak = state.mode === 'break' || state.mode === 'longBreak';
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
          {state.mode === 'longBreak' ? '15m Break' : '5m Break'}
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

      {/* Expand to Full Screen Pomodoro Studio Button */}
      <button
        type="button"
        onClick={onOpenFullscreen}
        data-testid={`${primaryTestIdPrefix}-fullscreen-btn`}
        aria-label="Open Full Screen Pomodoro Focus Mode"
        title="Open Full Screen Pomodoro Focus Mode"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-[#EFECE6] hover:bg-[#E4DDD3] text-[#4A433C] border border-[#DED8CE] transition-colors cursor-pointer shrink-0"
      >
        <Maximize2 className="w-2.5 h-2.5" />
        <span className="hidden sm:inline">Full Screen</span>
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
