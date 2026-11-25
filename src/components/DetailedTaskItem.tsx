import React, { useState } from 'react';
import { Check, Clock, Archive, FileText } from 'lucide-react';
import {
  CustomCategoryDefinition,
  DEFAULT_EOD_TARGET_HOUR,
  DetailedTask,
  ThemePalette,
  calculateEndOfDayTimeRemaining,
  getCategoryBadgeStyle,
} from '../utils/todoLogic';
import {
  PRIORITY_PILL_STYLES,
  STATUS_PILL_STYLES,
} from './InteractiveDashboard';
import { VoiceMicButton } from './VoiceMicButton';
import { PomodoroTaskButton } from './PomodoroTaskButton';
import { DetailedTaskNotesPanel } from './DetailedTaskNotesPanel';

interface DetailedTaskItemProps {
  task: DetailedTask;
  theme: ThemePalette;
  customCategories?: CustomCategoryDefinition[];
  isPomodoroLinked: boolean;
  isPomodoroActive: boolean;
  onToggle: (taskId: string) => void;
  onUpdateText: (taskId: string, text: string) => void;
  onUpdateNotes?: (taskId: string, notes: string) => void;
  onCyclePriority: (taskId: string) => void;
  onCycleStatus: (taskId: string) => void;
  onCycleCategory?: (taskId: string) => void;
  onArchiveSingle?: (taskId: string) => void;
}

export const DetailedTaskItem: React.FC<DetailedTaskItemProps> = React.memo(({
  task,
  theme,
  customCategories,
  isPomodoroLinked,
  isPomodoroActive,
  onToggle,
  onUpdateText,
  onUpdateNotes,
  onCyclePriority,
  onCycleStatus,
  onCycleCategory,
  onArchiveSingle,
}) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);
  const hasNotes = Boolean(task.notes && task.notes.trim().length > 0);

  return (
    <div
      data-testid={`detailed-task-item-${task.id}`}
      data-pomodoro-linked={isPomodoroLinked ? 'true' : 'false'}
      data-has-notes={hasNotes ? 'true' : 'false'}
      className={`flex flex-col gap-2 sm:gap-1.5 py-2.5 sm:py-2 px-2.5 sm:px-2 rounded-xl transition-colors group ${
        isPomodoroActive
          ? 'bg-[#FDF5EE] ring-1 ring-[#C26D43]/30'
          : 'hover:bg-[#FAF8F5]'
      }`}
    >
      {/* Row 1: 44x44 Mobile Touch Checkbox + Full-width Task Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Detailed task "${task.text}"`}
          data-checkbox-hitarea="true"
          onClick={() => onToggle(task.id)}
          className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-4 sm:h-4 -ml-2.5 sm:ml-0 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <span
            data-checkbox-visual={task.completed ? 'true' : 'false'}
            className="w-6 h-6 sm:w-4 sm:h-4 rounded-[7px] sm:rounded-[4px] flex items-center justify-center transition-colors"
            style={{
              backgroundColor: task.completed ? theme.checkboxBg : '#FAF8F5',
              border: task.completed ? 'none' : '1.5px solid #D7D0C6',
            }}
          >
            {task.completed && (
              <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-white stroke-[3]" />
            )}
          </span>
        </button>

        <input
          type="text"
          value={task.text}
          aria-label={`Edit task ${task.text}`}
          onChange={(e) => onUpdateText(task.id, e.target.value)}
          className={`flex-1 min-w-0 bg-transparent text-base sm:text-[13px] font-semibold focus:outline-none py-1 sm:py-0 ${
            task.completed
              ? 'line-through text-[#A59E95]'
              : 'text-[#3B3632]'
          }`}
        />
      </div>

      {/* Row 2: Unified Category, Priority, Status, EOD, Focus, Notes & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pl-1 sm:pl-6">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Color-Coded Category Badge */}
          {task.text.trim().length > 0 &&
            (() => {
              const badgeStyle = getCategoryBadgeStyle(
                task.category,
                customCategories,
                task.customColor
              );
              return (
                <button
                  type="button"
                  onClick={() => onCycleCategory?.(task.id)}
                  aria-label={`Category ${task.category} for ${task.text}. Click to cycle.`}
                  data-testid={`detailed-category-badge-${task.id}`}
                  data-category-badge={task.category}
                  title={`Category: ${task.category} (click to cycle)`}
                  className="min-h-[36px] sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 rounded-lg sm:rounded text-xs sm:text-[9px] font-bold shrink-0 border cursor-pointer transition-transform active:scale-95 leading-none inline-flex items-center"
                  style={{
                    backgroundColor: badgeStyle.bg,
                    color: badgeStyle.text,
                    borderColor: badgeStyle.border,
                  }}
                >
                  {task.category}
                </button>
              );
            })()}

          {/* Priority Pill */}
          <button
            type="button"
            onClick={() => onCyclePriority(task.id)}
            aria-label={`Priority ${task.priority} for ${task.text}. Click to cycle.`}
            data-priority-pill={task.priority}
            className="min-h-[36px] sm:min-h-0 px-2.5 py-1 sm:py-0.5 rounded-full text-xs sm:text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95 min-w-[44px] inline-flex items-center justify-center"
            style={{
              backgroundColor: PRIORITY_PILL_STYLES[task.priority].bg,
              color: PRIORITY_PILL_STYLES[task.priority].text,
            }}
          >
            {task.priority}
          </button>

          {/* Status Pill */}
          <button
            type="button"
            onClick={() => onCycleStatus(task.id)}
            aria-label={`Status ${task.status} for ${task.text}. Click to cycle.`}
            data-status-pill={task.status}
            className="min-h-[36px] sm:min-h-0 px-2.5 sm:px-3 py-1 sm:py-0.5 rounded-full text-xs sm:text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95 min-w-[60px] sm:min-w-[68px] inline-flex items-center justify-center"
            style={{
              backgroundColor: STATUS_PILL_STYLES[task.status].bg,
              color: STATUS_PILL_STYLES[task.status].text,
            }}
          >
            {task.status}
          </button>

          {/* Time Remaining before 5pm End-of-Day */}
          {!task.completed &&
            task.text.trim().length > 0 &&
            (() => {
              const eodInfo = calculateEndOfDayTimeRemaining({
                targetHour: DEFAULT_EOD_TARGET_HOUR,
                completed: task.completed,
              });
              return (
                <span
                  data-testid={`focus-task-time-remaining-${task.id}`}
                  data-remaining-minutes={eodInfo.remainingMinutes}
                  data-urgency={eodInfo.urgency}
                  title={eodInfo.detailedLabel}
                  className="inline-flex items-center gap-1 text-xs sm:text-[10.5px] font-medium text-[#7A7269] shrink-0 leading-none tabular-nums"
                >
                  <Clock className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-[#B05C37] shrink-0" />
                  <span>{eodInfo.shortLabel}</span>
                </span>
              );
            })()}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Markdown Notes Toggle Button */}
          <button
            type="button"
            onClick={() => setIsNotesExpanded((prev) => !prev)}
            aria-expanded={isNotesExpanded}
            data-testid={`detailed-notes-toggle-${task.id}`}
            aria-label={
              hasNotes
                ? `Edit Markdown notes for "${task.text}"`
                : `Add Markdown notes for "${task.text}"`
            }
            title={
              hasNotes
                ? 'Edit Markdown notes (supports bold, lists, links)'
                : 'Add Markdown notes (bold, lists, links)'
            }
            className={`inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 sm:py-0.5 rounded-lg sm:rounded text-xs sm:text-[9.5px] font-bold border transition-colors cursor-pointer shrink-0 leading-none active:scale-95 ${
              isNotesExpanded
                ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                : hasNotes
                ? 'bg-[#FAF1EA] text-[#9A4E28] border-[#E6C9B5] hover:bg-[#F3E1D3]'
                : 'bg-white text-[#7A7269] border-[#E4DDD2] hover:text-[#2F2B28] hover:bg-[#F5F2EC]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 shrink-0" />
            <span>{isNotesExpanded ? 'Editing' : hasNotes ? 'Notes' : 'Note'}</span>
          </button>

          <PomodoroTaskButton
            taskId={task.id}
            taskTitle={task.text}
            category={task.category}
            priority={task.priority}
            completed={task.completed}
          />

          <VoiceMicButton
            currentText={task.text}
            onUpdateText={(newText) => onUpdateText(task.id, newText)}
            ariaLabel={`Dictate task for ${task.text || task.id}`}
            accentColor={theme.checkboxBg}
          />

          {/* Individual Archive Action for Completed Task */}
          {task.completed && onArchiveSingle && (
            <button
              type="button"
              onClick={() => onArchiveSingle(task.id)}
              aria-label={`Archive completed task "${task.text}"`}
              data-testid={`archive-detailed-task-${task.id}`}
              title="Move completed task to Archive"
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 sm:p-1 rounded-lg sm:rounded text-[#9C948B] hover:text-[#B05C37] hover:bg-[#F4EFE6] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            >
              <Archive className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Rendered Markdown Note Preview or Full Write/Preview Editor */}
      <DetailedTaskNotesPanel
        taskId={task.id}
        taskTitle={task.text}
        notes={task.notes ?? ''}
        isExpanded={isNotesExpanded}
        onToggleExpanded={setIsNotesExpanded}
        onUpdateNotes={
          onUpdateNotes
            ? (nextNotes) => onUpdateNotes(task.id, nextNotes)
            : undefined
        }
        testIdPrefix="detailed"
      />
    </div>
  );
});

DetailedTaskItem.displayName = 'DetailedTaskItem';
