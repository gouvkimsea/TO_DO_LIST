import React from 'react';
import { Timer } from 'lucide-react';
import { usePomodoro } from './PomodoroTimer';

interface PomodoroTaskButtonProps {
  taskId: string;
  taskTitle: string;
  category?: string;
  priority?: string;
  completed?: boolean;
  compact?: boolean;
  testId?: string;
}

export const PomodoroTaskButton: React.FC<PomodoroTaskButtonProps> = ({
  taskId,
  taskTitle,
  category,
  priority,
  completed = false,
  compact = false,
  testId,
}) => {
  const { state, linkedTask, onOpenTaskFocusSession } = usePomodoro();

  const trimmedTitle = taskTitle.trim();
  const isDisabled = trimmedTitle.length === 0;
  const isLinked = linkedTask?.id === taskId;
  const isActivelyRunning =
    isLinked && state.mode === 'focus' && state.status === 'running';
  const isPausedOnTask =
    isLinked && state.mode === 'focus' && state.status === 'paused';

  const handleClick = () => {
    if (isDisabled) return;
    onOpenTaskFocusSession({
      id: taskId,
      title: trimmedTitle,
      category,
      priority,
    });
  };

  const buttonLabel = isActivelyRunning
    ? 'Focusing'
    : isPausedOnTask
    ? 'Paused'
    : 'Focus';

  const ariaLabel = isActivelyRunning
    ? `Open active Pomodoro Focus Session for "${trimmedTitle}"`
    : `Pomodoro Focus Session for "${trimmedTitle || 'task'}"`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      data-testid={testId ?? `pomodoro-focus-btn-${taskId}`}
      data-pomodoro-linked={isLinked ? 'true' : 'false'}
      data-pomodoro-active={isActivelyRunning ? 'true' : 'false'}
      aria-label={ariaLabel}
      title={
        isDisabled
          ? 'Add a task title to start a Pomodoro Focus Session'
          : isActivelyRunning
          ? `Focusing on "${trimmedTitle}" — click to open Pomodoro Timer`
          : `Start Pomodoro Focus Session for "${trimmedTitle}"`
      }
      className={`inline-flex items-center gap-1.5 sm:gap-1 rounded-full border font-bold transition-all shrink-0 whitespace-nowrap leading-none ${
        compact
          ? 'min-h-[38px] sm:min-h-[26px] px-3 sm:px-2 py-1.5 sm:py-1 text-xs sm:text-[10px]'
          : 'min-h-[40px] sm:min-h-[24px] px-3 sm:px-2 py-1.5 sm:py-0.5 text-xs sm:text-[10px]'
      } ${
        isDisabled
          ? 'bg-[#F5F2EC] text-[#B8AFA3] border-[#E7E1D7] opacity-55 cursor-not-allowed'
          : isActivelyRunning
          ? 'bg-[#C26D43] hover:bg-[#AE5D35] text-white border-[#C26D43] shadow-2xs cursor-pointer active:scale-95'
          : isPausedOnTask
          ? 'bg-[#F5DFD0] hover:bg-[#EED2BF] text-[#9A4E28] border-[#DFB599] cursor-pointer active:scale-95'
          : completed
          ? 'bg-[#F5F2EC] hover:bg-[#ECE5DA] text-[#7A7269] hover:text-[#2F2B28] border-[#E4DDD2] cursor-pointer active:scale-95'
          : 'bg-[#FAF1EA] hover:bg-[#F3E1D3] text-[#9A4E28] border-[#E6C9B5] cursor-pointer active:scale-95'
      }`}
    >
      {isActivelyRunning && (
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0"
        />
      )}
      <Timer className="w-3 h-3 shrink-0" />
      <span>{buttonLabel}</span>
    </button>
  );
};
