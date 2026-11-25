import React from 'react';
import { Check, Flame, X } from 'lucide-react';
import { DailyTask } from '../utils/todoLogic';
import {
  HABIT_DAY_NAMES,
  HABIT_DAY_SHORT_LABELS,
  HabitHeatTier,
  calculateHabitStreakSummary,
  isRecurringEligibleForHabit,
} from '../utils/habitStreakLogic';

const HEAT_TIER_STYLES: Record<
  HabitHeatTier,
  {
    bg: string;
    border: string;
    text: string;
    flameFill: string;
    flameStroke: string;
  }
> = {
  cold: {
    bg: '#F7F3EE',
    border: '#E2D8CC',
    text: '#7A7066',
    flameFill: 'none',
    flameStroke: '#9A8F84',
  },
  warm: {
    bg: '#FEF5E8',
    border: '#F0CFA0',
    text: '#9B5614',
    flameFill: '#F29F3D',
    flameStroke: '#C96E18',
  },
  hot: {
    bg: '#FDEEE4',
    border: '#EBBFA2',
    text: '#A6441E',
    flameFill: '#E86A33',
    flameStroke: '#B84519',
  },
  blazing: {
    bg: '#FCE4D8',
    border: '#DF9B7B',
    text: '#8F2D12',
    flameFill: '#D94B1F',
    flameStroke: '#8F2D12',
  },
};

export interface HabitStreakBadgeProps {
  task: DailyTask;
  dayId: string;
  compact?: boolean;
  isTrackerOpen?: boolean;
  testIdPrefix: string;
  onToggleHabit?: (dayId: string, taskId: string, explicitIsHabit?: boolean) => void;
  onToggleTrackerOpen?: () => void;
}

/**
 * Compact Habit toggle & Fire Streak Counter badge displayed directly on a daily task row.
 * - For recurring tasks NOT yet marked as habits: displays a 1-click "+ Habit" button.
 * - For recurring tasks marked as habits: displays the Fire icon + streak counter (e.g. 🔥 3d),
 *   and toggles the inline 7-day interval tracker when clicked.
 */
export const HabitStreakBadge: React.FC<HabitStreakBadgeProps> = ({
  task,
  dayId,
  compact = false,
  isTrackerOpen = false,
  testIdPrefix,
  onToggleHabit,
  onToggleTrackerOpen,
}) => {
  if (!isRecurringEligibleForHabit(task.recurring) || !task.text.trim()) {
    return null;
  }

  // Recurring task not yet marked as a habit -> offer 1-click "+ Habit" trigger
  if (!task.isHabit) {
    if (!onToggleHabit || compact) return null;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleHabit(dayId, task.id, true);
        }}
        data-testid={`${testIdPrefix}-habit-mark-${task.id}`}
        aria-label={`Mark recurring task "${task.text}" as a habit to track 7-day streaks`}
        title="Mark recurring task as a Habit (tracks 7-day completion streaks)"
        className="inline-flex items-center gap-1 sm:gap-0.5 min-h-[38px] sm:min-h-0 px-2.5 py-1.5 sm:px-1.5 sm:py-0.5 rounded-lg sm:rounded text-xs sm:text-[8.5px] font-bold tracking-tight shrink-0 leading-none border border-dashed border-[#DFC7B4] bg-[#FDF9F4] text-[#9A6340] hover:bg-[#FBEFE4] hover:border-[#D49D76] hover:text-[#7E3F1C] transition-colors cursor-pointer active:scale-95"
      >
        <Flame className="w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 shrink-0 text-[#C87442]" />
        <span>Habit</span>
      </button>
    );
  }

  const summary = calculateHabitStreakSummary(
    task.habitHistory,
    dayId,
    task.completed,
    task.habitBestStreak
  );
  const tierStyle = HEAT_TIER_STYLES[summary.heatTier];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onToggleTrackerOpen) {
          onToggleTrackerOpen();
        } else {
          onToggleHabit?.(dayId, task.id, false);
        }
      }}
      aria-expanded={onToggleTrackerOpen ? isTrackerOpen : undefined}
      aria-label={`Habit streak for "${task.text}": ${summary.currentStreak} day streak, ${summary.completedInInterval} of ${summary.intervalLength} days this week. Click to view 7-day tracker.`}
      data-testid={`${testIdPrefix}-habit-streak-${task.id}`}
      data-habit-streak={summary.currentStreak}
      data-habit-interval-done={summary.completedInInterval}
      data-habit-heat={summary.heatTier}
      title={`Habit Streak: ${summary.currentStreak}d (${summary.completedInInterval}/7 days in 7-day interval · Best: ${summary.bestStreak}d) — Click to open 7-day tracker`}
      className={`inline-flex items-center gap-1 sm:gap-0.5 rounded-lg sm:rounded font-extrabold tracking-tight shrink-0 leading-none border tabular-nums transition-all cursor-pointer active:scale-95 ${
        compact
          ? 'min-h-[34px] sm:min-h-0 px-2 sm:px-1 py-1 sm:py-0.5 text-xs sm:text-[7px]'
          : 'min-h-[38px] sm:min-h-0 px-2.5 py-1.5 sm:px-1.5 sm:py-0.5 text-xs sm:text-[8.5px]'
      } ${isTrackerOpen ? 'ring-1.5 ring-[#C86B3C]/50 shadow-2xs' : ''}`}
      style={{
        backgroundColor: tierStyle.bg,
        borderColor: tierStyle.border,
        color: tierStyle.text,
      }}
    >
      <Flame
        aria-hidden="true"
        className={`${compact ? 'w-3 h-3 sm:w-2 sm:h-2' : 'w-3.5 h-3.5 sm:w-2.5 sm:h-2.5'} shrink-0`}
        style={{
          fill: tierStyle.flameFill,
          color: tierStyle.flameStroke,
        }}
      />
      <span>{summary.currentStreak}d</span>
    </button>
  );
};

export interface HabitIntervalTrackerProps {
  task: DailyTask;
  dayId: string;
  testIdPrefix: string;
  compactLayout?: boolean;
  onToggleHabitDay?: (dayId: string, taskId: string, intervalDayIndex: number) => void;
  onRemoveHabit?: (dayId: string, taskId: string) => void;
  onClose?: () => void;
}

/**
 * Expandable 7-Day Habit Interval Tracker displayed inline beneath a daily habit task.
 * Shows Mon–Sun interactive check-in pills, active fire streak counter, 7-day progress bar,
 * and a quick control to unmark the task as a habit.
 */
export const HabitIntervalTracker: React.FC<HabitIntervalTrackerProps> = ({
  task,
  dayId,
  testIdPrefix,
  compactLayout = false,
  onToggleHabitDay,
  onRemoveHabit,
  onClose,
}) => {
  if (!task.isHabit || !isRecurringEligibleForHabit(task.recurring)) {
    return null;
  }

  const summary = calculateHabitStreakSummary(
    task.habitHistory,
    dayId,
    task.completed,
    task.habitBestStreak
  );
  const tierStyle = HEAT_TIER_STYLES[summary.heatTier];

  return (
    <div
      data-testid={`${testIdPrefix}-habit-tracker-${task.id}`}
      data-habit-streak={summary.currentStreak}
      data-habit-interval-done={summary.completedInInterval}
      role="region"
      aria-label={`7-day habit streak tracker for ${task.text}`}
      className={`mt-1.5 rounded-lg border border-[#EBD6C5] bg-[#FDF8F3] space-y-2 shadow-2xs overflow-hidden ${
        compactLayout ? 'px-2.5 py-2 xl:px-1.5 xl:py-1.5' : 'px-2.5 py-2'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
          <span
            className="inline-flex items-center gap-1 px-2 sm:px-1.5 py-1 sm:py-0.5 rounded-md sm:rounded text-xs sm:text-[9.5px] font-extrabold border tabular-nums shrink-0"
            style={{
              backgroundColor: tierStyle.bg,
              borderColor: tierStyle.border,
              color: tierStyle.text,
            }}
          >
            <Flame
              aria-hidden="true"
              className="w-3.5 h-3.5 sm:w-3 sm:h-3 shrink-0"
              style={{
                fill: tierStyle.flameFill,
                color: tierStyle.flameStroke,
              }}
            />
            <span>{summary.currentStreak}-Day Streak</span>
          </span>
          <span className="text-xs sm:text-[9px] font-bold text-[#7A6B5D] tabular-nums whitespace-nowrap">
            {summary.completedInInterval}/{summary.intervalLength} days
          </span>
          {summary.bestStreak > 0 && (
            <span className="text-xs sm:text-[9px] font-semibold text-[#9C8D7F] tabular-nums whitespace-nowrap">
              · Best {summary.bestStreak}d
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onRemoveHabit && (
            <button
              type="button"
              onClick={() => onRemoveHabit(dayId, task.id)}
              data-testid={`${testIdPrefix}-habit-remove-${task.id}`}
              aria-label={`Remove habit tracking from "${task.text}"`}
              title="Stop tracking as a habit"
              className="min-h-[36px] sm:min-h-0 text-xs sm:text-[9px] font-bold text-[#9C7D68] hover:text-[#A13528] hover:bg-[#FBEAE8] px-2.5 sm:px-1.5 py-1 sm:py-0.5 rounded-lg sm:rounded transition-colors cursor-pointer"
            >
              Unmark
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              data-testid={`${testIdPrefix}-habit-close-${task.id}`}
              aria-label={`Close 7-day habit tracker for "${task.text}"`}
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-1 sm:p-0.5 rounded-lg sm:rounded text-[#8A7D72] hover:text-[#2F2B28] hover:bg-[#EFE7DD] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-3 sm:h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Interval Grid (Mon..Sun) */}
      <div
        role="group"
        aria-label={`7-day completion checkboxes for ${task.text}`}
        className={`grid grid-cols-7 ${
          compactLayout ? 'gap-1 xl:gap-0.5' : 'gap-1'
        }`}
      >
        {HABIT_DAY_SHORT_LABELS.map((shortLabel, idx) => {
          const isDone = summary.history[idx];
          const isAnchorDay = idx === summary.anchorDayIndex;
          const fullDayName = HABIT_DAY_NAMES[idx];
          return (
            <button
              key={`${task.id}-hday-${idx}`}
              type="button"
              aria-pressed={isDone}
              aria-label={`${fullDayName}: ${
                isDone ? 'completed' : 'not completed'
              } for "${task.text}" habit`}
              data-testid={`${testIdPrefix}-habit-day-${task.id}-${idx}`}
              data-habit-day-done={isDone ? 'true' : 'false'}
              onClick={() => onToggleHabitDay?.(dayId, task.id, idx)}
              title={`${fullDayName}${isAnchorDay ? ' (Task day)' : ''} — Click to toggle`}
              className={`min-w-0 px-0 flex flex-col items-center justify-center gap-1 sm:gap-0.5 py-1.5 sm:py-1 min-h-[44px] sm:min-h-[34px] rounded-lg sm:rounded-md border text-[11px] sm:text-[9px] font-bold transition-all cursor-pointer active:scale-95 ${
                isDone
                  ? 'bg-[#FCEAD9] border-[#E0A178] text-[#9A3E18] shadow-2xs'
                  : 'bg-white border-[#E6DDD2] text-[#8E8479] hover:border-[#D4B9A3] hover:bg-[#FAF5EE]'
              } ${isAnchorDay ? 'ring-1 ring-[#C87D55]/60' : ''}`}
            >
              <span className="leading-none">{shortLabel}</span>
              <span
                className={`rounded-full flex items-center justify-center ${
                  compactLayout ? 'w-4 h-4 sm:w-3.5 sm:h-3.5 xl:w-3 xl:h-3' : 'w-4 h-4 sm:w-3.5 sm:h-3.5'
                } ${
                  isDone
                    ? 'bg-[#D9602B] text-white'
                    : 'bg-[#F3EDE6] text-transparent border border-[#E0D6CA]'
                }`}
              >
                <Check
                  className={`stroke-[3] ${
                    compactLayout ? 'w-2.5 h-2.5 xl:w-2 xl:h-2' : 'w-2.5 h-2.5'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* 7-Day Interval Progress Bar */}
      <div className="flex items-center gap-1.5">
        <div
          role="progressbar"
          aria-valuenow={summary.completedInInterval}
          aria-valuemin={0}
          aria-valuemax={summary.intervalLength}
          aria-label={`7-day interval progress for ${task.text}`}
          className="flex-1 h-2 sm:h-1.5 rounded-full bg-[#EFE6DC] overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${summary.intervalProgressPct}%`,
              backgroundColor: summary.isIntervalComplete ? '#D94B1F' : '#D97236',
            }}
          />
        </div>
        <span className="text-xs sm:text-[9px] font-bold text-[#8A7765] tabular-nums shrink-0 whitespace-nowrap">
          {summary.isIntervalComplete
            ? '7/7 Complete!'
            : `${summary.intervalProgressPct}% of 7d`}
        </span>
      </div>
    </div>
  );
};
