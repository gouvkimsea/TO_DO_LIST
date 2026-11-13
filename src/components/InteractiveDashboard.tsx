import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Check,
  Search,
  X,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  Archive,
  Plus,
  Repeat,
  ClipboardPaste,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  defaultAnimateLayoutChanges,
  AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  BulkImportOptions,
  CATEGORY_BADGE_STYLES,
  DailyTask,
  DayColumn,
  DetailedTask,
  Priority,
  RECURRING_CONFIG,
  RECURRING_INTERVALS,
  RecurringInterval,
  TASK_CATEGORIES,
  TaskCategory,
  TaskStatus,
  ThemeId,
  THEMES,
  ViewMode,
  calculateDayProgress,
  countMatchingTasks,
  countTasksByCategory,
  countWeekTasksByCompletion,
  cycleCategory,
  cycleRecurringInterval,
  filterDayColumnsByCategory,
  filterDayColumnsByKeyword,
  filterDetailedTasksByKeyword,
  filterTasksByCategory,
  getTaskMatchDetail,
  isDayAllDone,
  parseBulkImportLines,
  sanitizeTaskText,
} from '../utils/todoLogic';
import { VoiceMicButton } from './VoiceMicButton';
import { PomodoroTimer } from './PomodoroTimer';
import { BulkImportModal } from './BulkImportModal';

interface InteractiveDashboardProps {
  columns: DayColumn[];
  monthlyGoals: DetailedTask[];
  yearlyGoals: DetailedTask[];
  activeTheme: ThemeId;
  activeView: ViewMode;
  selectedDate: string;
  weekRangeLabel: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onSelectView: (view: ViewMode) => void;
  onDateChange: (date: string) => void;
  onToggleDailyTask: (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => void;
  onCycleDailyPriority: (dayId: string, taskId: string) => void;
  onCycleDailyCategory?: (dayId: string, taskId: string) => void;
  onCycleDailyRecurring?: (dayId: string, taskId: string) => void;
  onSetDailyRecurring?: (
    dayId: string,
    taskId: string,
    interval: RecurringInterval
  ) => void;
  onUpdateDailyTaskText: (dayId: string, taskId: string, text: string) => void;
  onQuickAddDailyTask?: (
    dayId: string,
    text: string,
    category?: TaskCategory,
    recurring?: RecurringInterval
  ) => void;
  onBulkImportTasks?: (
    dayId: string,
    rawInput: string,
    options?: BulkImportOptions
  ) => number;
  onOpenBulkImportModal?: (defaultDayId?: string) => void;
  onUpdateDailyTaskNotes?: (dayId: string, taskId: string, notes: string) => void;
  enableTaskNotes?: boolean;
  onReorderOrMoveDailyTask?: (activeTaskId: string, overId: string) => void;
  enableDragAndDrop?: boolean;
  onResetWeek: () => void;
  showBulkActions?: boolean;
  onClearCompletedTasks?: () => void;
  onClearPendingTasks?: () => void;
  onToggleGoalTask?: (view: 'month' | 'year', taskId: string) => void;
  onCycleGoalPriority?: (view: 'month' | 'year', taskId: string) => void;
  onCycleGoalStatus?: (view: 'month' | 'year', taskId: string) => void;
  onCycleGoalCategory?: (view: 'month' | 'year', taskId: string) => void;
  onUpdateGoalText?: (view: 'month' | 'year', taskId: string, text: string) => void;
  visibleColumnSlice?: [number, number];
  compact?: boolean;
  instancePrefix?: string;
  onQuickSave?: () => void;
  onOpenShortcutsModal?: () => void;
  archivedCount?: number;
  onArchiveCompletedTasks?: () => void;
  onArchiveSingleDailyTask?: (dayId: string, taskId: string) => void;
  onOpenArchiveModal?: () => void;
}

export const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  High: '#E68A82',
  Med: '#EFC776',
  Low: '#86C79F',
};

export const PRIORITY_PILL_STYLES: Record<
  Priority,
  { bg: string; text: string }
> = {
  High: { bg: '#F8D5D5', text: '#9B3338' },
  Med: { bg: '#FDE4B5', text: '#8C5A14' },
  Low: { bg: '#CFEDD9', text: '#236940' },
};

export const STATUS_PILL_STYLES: Record<
  TaskStatus,
  { bg: string; text: string }
> = {
  'To Do': { bg: '#DDE2E8', text: '#505B68' },
  'In Progress': { bg: '#A6C8EE', text: '#1E5083' },
  Done: { bg: '#60BA78', text: '#FFFFFF' },
};

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.35',
      },
    },
  }),
  duration: 220,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
};

const customAnimateLayoutChanges: AnimateLayoutChanges = () => false;

interface SortableDailyTaskRowProps {
  task: DailyTask;
  idx: number;
  dayId: string;
  dayName: string;
  compact: boolean;
  instancePrefix: string;
  checkboxBg: string;
  dndEnabled: boolean;
  enableTaskNotes?: boolean;
  onToggleDailyTask: (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => void;
  onCycleDailyPriority: (dayId: string, taskId: string) => void;
  onCycleDailyCategory?: (dayId: string, taskId: string) => void;
  onCycleDailyRecurring?: (dayId: string, taskId: string) => void;
  onSetDailyRecurring?: (
    dayId: string,
    taskId: string,
    interval: RecurringInterval
  ) => void;
  onUpdateDailyTaskText: (dayId: string, taskId: string, text: string) => void;
  onUpdateDailyTaskNotes?: (dayId: string, taskId: string, notes: string) => void;
  onArchiveSingleDailyTask?: (dayId: string, taskId: string) => void;
  onQuickSave?: () => void;
  searchQuery?: string;
}

const SortableDailyTaskRow: React.FC<SortableDailyTaskRowProps> = ({
  task,
  idx,
  dayId,
  dayName,
  compact,
  instancePrefix,
  checkboxBg,
  dndEnabled,
  enableTaskNotes = true,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyCategory,
  onCycleDailyRecurring,
  onSetDailyRecurring,
  onUpdateDailyTaskText,
  onUpdateDailyTaskNotes,
  onArchiveSingleDailyTask,
  onQuickSave,
  searchQuery,
}) => {
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !dndEnabled,
    animateLayoutChanges: customAnimateLayoutChanges,
  });

  const style: React.CSSProperties = {
    transform: isDragging ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 25 : 1,
  };

  const isBlank = task.text.trim().length === 0;
  const hasNotes = Boolean(task.notes && task.notes.trim().length > 0);
  const matchDetail = searchQuery?.trim() ? getTaskMatchDetail(task, searchQuery) : null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={dndEnabled ? 'position' : false}
      layoutId={`${instancePrefix}-task-${task.id}`}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
        mass: 0.7,
      }}
      data-testid={`${instancePrefix}-task-row-${task.id}`}
      className={`rounded-md transition-colors duration-150 ${
        compact ? 'py-0.5' : 'py-0.5'
      } ${
        isDragging
          ? 'bg-[#FAF3EB] ring-1 ring-dashed ring-[#C87D55]/60 shadow-xs'
          : 'hover:bg-[#FAF7F2]/70'
      }`}
    >
      <div
        className={`flex items-center group ${
          compact ? 'gap-1' : 'gap-1'
        }`}
      >
        {/* Drag Handle */}
        {dndEnabled && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag ${dayName} task ${idx + 1}: ${
              task.text || 'Empty slot'
            } (${instancePrefix})`}
            data-testid={`drag-handle-${instancePrefix}-${task.id}`}
            title="Drag to reorder or move to another day"
            className={`${
              compact ? 'w-3 h-3.5' : 'w-3 h-4'
            } flex items-center justify-center shrink-0 text-[#C6BEB4] hover:text-[#7D7368] cursor-grab active:cursor-grabbing rounded transition-colors touch-none`}
          >
            <GripVertical
              className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
            />
          </button>
        )}

        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`${dayName} task ${idx + 1}: ${
            task.text || 'Empty slot'
          } (${instancePrefix})`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const origin =
              typeof window !== 'undefined' &&
              window.innerWidth > 0 &&
              window.innerHeight > 0
                ? {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                  }
                : undefined;
            onToggleDailyTask(dayId, task.id, origin);
          }}
          className={`${
            compact ? 'w-3 h-3 rounded-[3px]' : 'w-4 h-4 rounded-[4px]'
          } flex items-center justify-center shrink-0 transition-colors cursor-pointer`}
          style={{
            backgroundColor: task.completed ? checkboxBg : '#FAF8F5',
            border: task.completed ? 'none' : '1.5px solid #D7D0C6',
          }}
        >
          {task.completed && (
            <Check
              className={`${
                compact ? 'w-2 h-2' : 'w-3 h-3'
              } text-white stroke-[3]`}
            />
          )}
        </button>

        {/* Priority Dot */}
        <button
          type="button"
          onClick={() => onCycleDailyPriority(dayId, task.id)}
          aria-label={`Cycle priority for ${
            task.text || `${dayName} slot ${idx + 1}`
          } (currently ${task.priority}) (${instancePrefix})`}
          title={`Priority: ${task.priority} (click to cycle)`}
          className={`${
            compact ? 'w-1.5 h-1.5' : 'w-2 h-2'
          } rounded-full shrink-0 transition-transform hover:scale-125 cursor-pointer`}
          style={{
            backgroundColor: isBlank
              ? '#E8D5B7'
              : PRIORITY_DOT_COLORS[task.priority],
          }}
        />

        {/* Task Input (Clicking task name opens collapsible notes drawer) */}
        <input
          type="text"
          value={task.text}
          placeholder="—"
          data-task-input={`${instancePrefix}-${dayId}-${idx}`}
          data-testid={`${instancePrefix}-task-name-${task.id}`}
          aria-label={`${dayName} task ${idx + 1} description (${instancePrefix})`}
          title={
            hasNotes
              ? `Notes: ${task.notes?.slice(0, 80)}${(task.notes?.length ?? 0) > 80 ? '…' : ''} (click to open notes drawer)`
              : 'Click task name to open notes drawer'
          }
          onClick={() => {
            if (enableTaskNotes && !isNotesExpanded) {
              setIsNotesExpanded(true);
            }
          }}
          onChange={(e) => onUpdateDailyTaskText(dayId, task.id, e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onQuickSave?.();
              e.currentTarget.blur();
            } else if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              const nextInput = document.querySelector<HTMLInputElement>(
                `[data-task-input="${instancePrefix}-${dayId}-${idx + 1}"]`
              );
              if (nextInput) {
                nextInput.focus();
              } else {
                const quickAddInput = document.querySelector<HTMLInputElement>(
                  `[data-quick-add-input="${instancePrefix}-${dayId}"]`
                );
                if (quickAddInput) {
                  quickAddInput.focus();
                } else {
                  e.currentTarget.blur();
                }
              }
            } else if (e.key === 'Escape') {
              e.preventDefault();
              if (isNotesExpanded) {
                setIsNotesExpanded(false);
              }
              e.currentTarget.blur();
            }
          }}
          className={`w-full min-w-0 bg-transparent focus:outline-none focus:bg-[#FAF6F0] rounded font-medium placeholder:text-[#C4BDB3] ${
            compact ? 'text-[9px] px-0.5' : 'text-[11px] sm:text-xs px-1'
          } ${
            task.completed
              ? 'line-through text-[#A7A097]'
              : 'text-[#3B3632]'
          }`}
        />

        {/* Small Colored Category Badge */}
        {!isBlank && (
          <button
            type="button"
            onClick={() => onCycleDailyCategory?.(dayId, task.id)}
            aria-label={`Category ${task.category} for ${task.text} (${instancePrefix}). Click to cycle.`}
            data-testid={`${instancePrefix}-category-badge-${task.id}`}
            data-category-badge={task.category}
            title={`Category: ${task.category} (click to cycle)`}
            className={`rounded font-bold tracking-tight shrink-0 leading-none border transition-transform active:scale-95 cursor-pointer ${
              compact
                ? 'px-1 py-0.5 text-[7px]'
                : 'px-1.5 py-0.5 text-[8.5px]'
            } ${
              matchDetail?.matches && matchDetail.field === 'category'
                ? 'ring-2 ring-[#B86B43] shadow-xs'
                : ''
            }`}
            style={{
              backgroundColor:
                CATEGORY_BADGE_STYLES[task.category]?.bg ?? '#FCEADE',
              color: CATEGORY_BADGE_STYLES[task.category]?.text ?? '#9A4E28',
              borderColor:
                CATEGORY_BADGE_STYLES[task.category]?.border ?? '#F0CFB8',
            }}
          >
            {task.category}
          </button>
        )}

        {/* Recurrence Cadence Badge / Toggle */}
        {!isBlank && (
          <button
            type="button"
            onClick={() => onCycleDailyRecurring?.(dayId, task.id)}
            aria-label={`Recurrence cadence for ${task.text || `${dayName} task ${idx + 1}`}: ${
              task.recurring && task.recurring !== 'none'
                ? task.recurring
                : 'None (click to cycle)'
            } (${instancePrefix})`}
            data-testid={`${instancePrefix}-recurring-badge-${task.id}`}
            data-recurring-badge={task.recurring ?? 'none'}
            title={`Repeat: ${
              task.recurring && task.recurring !== 'none'
                ? RECURRING_CONFIG[task.recurring].label
                : 'No repeat (click to cycle)'
            }`}
            className={`rounded font-bold tracking-tight shrink-0 inline-flex items-center gap-0.5 border transition-all active:scale-95 cursor-pointer leading-none ${
              compact
                ? 'px-1 py-0.5 text-[7px]'
                : 'px-1.5 py-0.5 text-[8.5px]'
            } ${
              task.recurring && task.recurring !== 'none'
                ? ''
                : 'opacity-40 hover:opacity-100 hover:border-[#D5C9BD] hover:bg-[#FAF8F5]'
            }`}
            style={{
              backgroundColor:
                task.recurring && task.recurring !== 'none'
                  ? RECURRING_CONFIG[task.recurring].bg
                  : '#FAF7F2',
              color:
                task.recurring && task.recurring !== 'none'
                  ? RECURRING_CONFIG[task.recurring].text
                  : '#948B81',
              borderColor:
                task.recurring && task.recurring !== 'none'
                  ? RECURRING_CONFIG[task.recurring].border
                  : '#E6DFD5',
            }}
          >
            <Repeat
              className={`${
                compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
              } shrink-0 stroke-[2.2]`}
            />
            {task.recurring && task.recurring !== 'none' && (
              <span>{RECURRING_CONFIG[task.recurring].badgeLabel}</span>
            )}
          </button>
        )}

        {/* Voice-to-Text Microphone Button (full interactive boards) */}
        {!compact && (
          <VoiceMicButton
            currentText={task.text}
            onUpdateText={(newText) =>
              onUpdateDailyTaskText(dayId, task.id, newText)
            }
            ariaLabel={`Dictate ${dayName} task ${idx + 1} (${instancePrefix})`}
            accentColor={checkboxBg}
          />
        )}

        {/* Expandable Notes Button */}
        {enableTaskNotes && !compact && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotesExpanded((prev) => !prev);
            }}
            aria-expanded={isNotesExpanded}
            aria-label={`${
              isNotesExpanded ? 'Collapse' : 'Expand'
            } notes for ${dayName} task ${idx + 1} (${instancePrefix})`}
            data-testid={`${instancePrefix}-notes-toggle-${task.id}`}
            title={
              hasNotes
                ? `Notes: ${task.notes} (click to ${
                    isNotesExpanded ? 'collapse' : 'expand'
                  })`
                : 'Expand to add task notes or context'
            }
            className={`relative w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isNotesExpanded || hasNotes
                ? 'text-[#B86B43] bg-[#F6ECE3] hover:bg-[#EFE0D3]'
                : 'text-[#C2B9AF] hover:text-[#6E655F] hover:bg-[#F4EFE8]'
            }`}
          >
            <FileText className="w-3 h-3" />
            {hasNotes && !isNotesExpanded && (
              <span
                data-testid={`${instancePrefix}-notes-indicator-${task.id}`}
                className="w-1.5 h-1.5 rounded-full bg-[#C87D55] absolute -top-0.5 -right-0.5 ring-1 ring-white"
              />
            )}
          </button>
        )}

        {/* Individual Archive Button for Completed Daily Tasks */}
        {!isBlank && task.completed && !compact && onArchiveSingleDailyTask && (
          <button
            type="button"
            onClick={() => onArchiveSingleDailyTask(dayId, task.id)}
            aria-label={`Archive completed ${dayName} task "${task.text}" (${instancePrefix})`}
            data-testid={`${instancePrefix}-archive-task-${task.id}`}
            title="Move completed task to Archive"
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[#B8AFA6] hover:text-[#B05C37] hover:bg-[#F4EFE8] transition-colors cursor-pointer"
          >
            <Archive className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Matched Note Snippet Preview (Shown when search keyword matches in note content) */}
      {!compact && matchDetail?.matches && matchDetail.field === 'notes' && matchDetail.snippet && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsNotesExpanded(true);
          }}
          data-testid={`${instancePrefix}-matched-note-${task.id}`}
          title="Search matched inside note. Click to view full note."
          className="mt-1 mx-1 px-2 py-0.5 rounded text-[10px] bg-[#FAF0E6] border border-[#ECD9C5] text-[#9A5128] flex items-center gap-1.5 cursor-pointer hover:bg-[#F5E5D5] text-left transition-colors group"
        >
          <FileText className="w-2.5 h-2.5 shrink-0 text-[#B86B43]" />
          <span className="font-bold text-[9px] uppercase tracking-wider text-[#A85B33] shrink-0">
            Note:
          </span>
          <span className="truncate italic font-medium group-hover:text-[#6D2E14]">
            {matchDetail.snippet}
          </span>
        </button>
      )}

      {/* Collapsible 'Notes' Drawer (opens on task name click or button toggle) */}
      <AnimatePresence initial={false}>
        {enableTaskNotes && !compact && isNotesExpanded && (
          <motion.div
            key={`notes-drawer-${task.id}`}
            id={`${instancePrefix}-notes-drawer-${task.id}`}
            data-testid={`${instancePrefix}-notes-drawer-${task.id}`}
            role="region"
            aria-label={`Notes for ${task.text || 'task'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              data-testid={`${instancePrefix}-notes-panel-${task.id}`}
              className="mt-1.5 p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DFD3] shadow-xs space-y-2"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#ECE5DA] pb-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A6B5D]">
                  <FileText className="w-3 h-3 text-[#B86B43]" />
                  <span>Task Notes</span>
                  {hasNotes && (
                    <span className="text-[9px] font-semibold text-[#9C9288] normal-case tracking-normal">
                      · {task.notes?.trim().split(/\s+/).filter(Boolean).length || 0} words
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNotes && (
                    <button
                      type="button"
                      onClick={() => onUpdateDailyTaskNotes?.(dayId, task.id, '')}
                      data-testid={`${instancePrefix}-notes-clear-${task.id}`}
                      className="text-[9px] font-semibold text-[#9C9288] hover:text-[#9E3F38] px-1.5 py-0.5 rounded hover:bg-[#F3ECE1] cursor-pointer whitespace-nowrap transition-colors"
                      title="Clear notes"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotesExpanded(false)}
                    data-testid={`${instancePrefix}-notes-close-${task.id}`}
                    aria-label={`Collapse notes for ${task.text || 'task'}`}
                    className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#6E655F] hover:text-[#2F2B28] px-1.5 py-0.5 rounded bg-white hover:bg-[#F3EFE9] border border-[#DDD6CC] cursor-pointer whitespace-nowrap transition-colors"
                    title="Collapse notes drawer (Esc)"
                  >
                    <ChevronUp className="w-3 h-3" />
                    <span>Collapse</span>
                  </button>
                </div>
              </div>

              {/* Long-form Textarea */}
              <textarea
                id={`${instancePrefix}-notes-input-${task.id}`}
                data-testid={`${instancePrefix}-notes-input-${task.id}`}
                rows={4}
                value={task.notes ?? ''}
                placeholder="Add long-form notes, context, subtasks, or links... (Auto-saved · Ctrl+Enter to save, Esc to close)"
                onChange={(e) =>
                  onUpdateDailyTaskNotes?.(dayId, task.id, e.target.value)
                }
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    onQuickSave?.();
                    setIsNotesExpanded(false);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsNotesExpanded(false);
                  }
                }}
                className="w-full bg-white border border-[#E2DBD0] focus:border-[#C87D55] focus:ring-1 focus:ring-[#C87D55]/30 focus:outline-none rounded-md p-2 text-xs leading-relaxed text-[#3B3632] placeholder:text-[#B5ADA3] resize-y min-h-[80px]"
              />

              {/* Drawer Footer: Persistence status & Recurrence selection */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] text-[#8C7A6B]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#84CA9E]" />
                  <span className="font-medium text-[#7D7368]">
                    {hasNotes ? 'Auto-saved to storage' : 'Ready for notes'}
                  </span>
                  <span className="text-[#B5ADA3]">
                    · {(task.notes ?? '').length} chars
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold uppercase tracking-wider text-[#8C7A6B] flex items-center gap-1">
                    <Repeat className="w-2.5 h-2.5" />
                    <span>Repeat</span>
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={`Recurrence interval for ${task.text || 'task'}`}
                    className="inline-flex items-center gap-1"
                  >
                    {RECURRING_INTERVALS.map((interval) => {
                      const isSelected = (task.recurring ?? 'none') === interval;
                      const conf = RECURRING_CONFIG[interval];
                      return (
                        <button
                          key={interval}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          data-testid={`${instancePrefix}-notes-recurring-${interval}-${task.id}`}
                          onClick={() =>
                            onSetDailyRecurring
                              ? onSetDailyRecurring(dayId, task.id, interval)
                              : onCycleDailyRecurring?.(dayId, task.id)
                          }
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border transition-all cursor-pointer leading-none ${
                            isSelected
                              ? 'font-bold shadow-2xs'
                              : 'opacity-70 hover:opacity-100 hover:bg-white'
                          }`}
                          style={{
                            backgroundColor: isSelected ? conf.bg : '#FAF7F2',
                            color: isSelected ? conf.text : '#736B63',
                            borderColor: isSelected ? conf.border : '#E2DBD0',
                          }}
                        >
                          {conf.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface DroppableDayTasksContainerProps {
  dayId: string;
  dayName: string;
  isOverAny: boolean;
  compact: boolean;
  children: React.ReactNode;
}

const DroppableDayTasksContainer: React.FC<DroppableDayTasksContainerProps> = ({
  dayId,
  dayName,
  isOverAny,
  compact,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-col-${dayId}`,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid={`droppable-day-${dayId}`}
      className={`flex-1 divide-y divide-[#F5F2EC] transition-all duration-200 relative min-h-[175px] ${
        compact ? 'p-1.5 space-y-0.5' : 'p-1.5 space-y-0.5'
      } ${
        isOver
          ? 'bg-[#FAF4EC] ring-2 ring-inset ring-[#C87D55]/40 shadow-inner'
          : isOverAny
          ? 'bg-[#FCFBF9]'
          : 'bg-white'
      }`}
    >
      {children}
      {isOver && (
        <div
          data-testid={`drop-indicator-${dayId}`}
          className="pointer-events-none mt-1.5 py-1 px-2 rounded-md bg-[#FAF0E3] border border-dashed border-[#C87D55]/70 text-center text-[10px] font-bold text-[#A85B33] flex items-center justify-center gap-1.5 animate-pulse"
        >
          <span>Drop into {dayName}</span>
        </div>
      )}
    </div>
  );
};

export interface DayCircularProgressProps {
  percentage: number;
  total: number;
  completed: number;
  compact?: boolean;
  accentColor?: string;
  dayName: string;
  testId?: string;
}

export const DayCircularProgress: React.FC<DayCircularProgressProps> = ({
  percentage,
  total,
  completed,
  compact = false,
  accentColor = '#2F2B28',
  dayName,
  testId,
}) => {
  const size = compact ? 18 : 22;
  const strokeWidth = compact ? 2 : 2.4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;
  const isAllDone = total > 0 && completed === total;

  // Ring stroke color matches the currently selected theme
  const strokeColor = clampedPercentage > 0 ? accentColor : '#C4BCB1';

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${dayName} progress: ${clampedPercentage}% (${completed} of ${total} tasks completed)`}
      title={`${dayName}: ${clampedPercentage}% completed (${completed}/${total})`}
      data-testid={testId}
      data-percentage={clampedPercentage}
      data-theme-color={accentColor}
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform hover:scale-105 select-none ${
        compact ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]'
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 block"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={isAllDone ? `${accentColor}20` : 'rgba(255, 255, 255, 0.55)'}
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Dynamic progress stroke matching selected theme */}
        {total > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        )}
      </svg>
      {/* Center label: checkmark if complete, percentage if in progress (styled with theme color) */}
      <span
        className={`absolute inset-0 flex items-center justify-center font-black leading-none tabular-nums ${
          compact ? 'text-[7px]' : 'text-[7.5px]'
        }`}
        style={{
          color: clampedPercentage > 0 ? accentColor : '#8A8279',
        }}
      >
        {isAllDone ? (
          <Check
            className={`${
              compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
            } stroke-[3.5]`}
            style={{ color: accentColor }}
          />
        ) : (
          `${clampedPercentage}%`
        )}
      </span>
    </div>
  );
};

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  activeView,
  selectedDate,
  weekRangeLabel,
  searchQuery = '',
  onSearchQueryChange,
  onSelectTheme,
  onSelectView,
  onDateChange,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyCategory,
  onCycleDailyRecurring,
  onSetDailyRecurring,
  onUpdateDailyTaskText,
  onQuickAddDailyTask,
  onBulkImportTasks,
  onOpenBulkImportModal,
  onUpdateDailyTaskNotes,
  enableTaskNotes = true,
  onReorderOrMoveDailyTask,
  enableDragAndDrop = false,
  onResetWeek,
  showBulkActions = false,
  onClearCompletedTasks,
  onClearPendingTasks,
  onToggleGoalTask,
  onCycleGoalPriority,
  onCycleGoalStatus,
  onCycleGoalCategory,
  onUpdateGoalText,
  visibleColumnSlice,
  compact = false,
  instancePrefix = 'main',
  onQuickSave,
  archivedCount = 0,
  onArchiveCompletedTasks,
  onArchiveSingleDailyTask,
  onOpenArchiveModal,
}) => {
  const theme = THEMES[activeTheme];
  const isSearching = searchQuery.trim().length > 0;
  const [activeTagFilter, setActiveTagFilter] = useState<'All' | TaskCategory>(
    'All'
  );
  const [quickAddValues, setQuickAddValues] = useState<Record<string, string>>(
    {}
  );
  const [quickAddCategories, setQuickAddCategories] = useState<
    Record<string, TaskCategory>
  >({});
  const [quickAddRecurring, setQuickAddRecurring] = useState<
    Record<string, RecurringInterval>
  >({});
  const [bulkMenuOpen, setBulkMenuOpen] = useState<boolean>(false);
  const [localBulkImportModal, setLocalBulkImportModal] = useState<{
    open: boolean;
    dayId: string;
  }>({ open: false, dayId: 'mon' });
  const bulkMenuRef = useRef<HTMLDivElement>(null);

  const handleOpenBulkImport = (defaultDayId?: string) => {
    const resolvedDay =
      defaultDayId && columns.some((c) => c.id === defaultDayId)
        ? defaultDayId
        : columns[0]?.id || 'mon';
    if (onOpenBulkImportModal) {
      onOpenBulkImportModal(resolvedDay);
    } else {
      setLocalBulkImportModal({ open: true, dayId: resolvedDay });
    }
  };

  const handleExecuteBulkImport = (
    dayId: string,
    rawInput: string,
    options?: BulkImportOptions
  ): number => {
    if (onBulkImportTasks) {
      return onBulkImportTasks(dayId, rawInput, options);
    }
    const items = parseBulkImportLines(rawInput, options);
    if (onQuickAddDailyTask) {
      for (const item of items) {
        onQuickAddDailyTask(
          dayId,
          item.cleanText,
          item.category,
          item.recurring
        );
      }
    }
    return items.length;
  };

  const isFiltering = isSearching || activeTagFilter !== 'All';
  const dndActive =
    enableDragAndDrop && Boolean(onReorderOrMoveDailyTask) && !isFiltering;

  const handleCycleQuickAddCategory = (dayId: string) => {
    setQuickAddCategories((prev) => {
      const current = prev[dayId] ?? 'Work';
      return {
        ...prev,
        [dayId]: cycleCategory(current),
      };
    });
  };

  const handleCycleQuickAddRecurring = (dayId: string) => {
    setQuickAddRecurring((prev) => {
      const current = prev[dayId] ?? 'none';
      return {
        ...prev,
        [dayId]: cycleRecurringInterval(current),
      };
    });
  };

  const handleQuickAddSubmit = (dayId: string) => {
    const rawDraft = quickAddValues[dayId] ?? '';
    const cleanText = sanitizeTaskText(rawDraft).trim();
    if (!cleanText || cleanText === '—') return;
    const selectedCategory = quickAddCategories[dayId] ?? 'Work';
    const selectedRecurring = quickAddRecurring[dayId] ?? 'none';

    if (onQuickAddDailyTask) {
      onQuickAddDailyTask(
        dayId,
        cleanText,
        selectedCategory,
        selectedRecurring
      );
    } else {
      const targetColumn = columns.find((c) => c.id === dayId);
      const firstBlank = targetColumn?.tasks.find(
        (t) => t.text.trim().length === 0 || t.text.trim() === '—'
      );
      if (firstBlank) {
        onUpdateDailyTaskText(dayId, firstBlank.id, cleanText);
      }
    }

    setQuickAddValues((prev) => ({
      ...prev,
      [dayId]: '',
    }));
  };

  useEffect(() => {
    if (!bulkMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        bulkMenuRef.current &&
        !bulkMenuRef.current.contains(e.target as Node)
      ) {
        setBulkMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBulkMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [bulkMenuOpen]);

  const completionCounts = countWeekTasksByCompletion(columns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const [overDayId, setOverDayId] = useState<string | null>(null);

  const activeDragTask = activeDragTaskId
    ? columns
        .flatMap((c) => c.tasks)
        .find((t) => t.id === activeDragTaskId) || null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragTaskId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverDayId(null);
      return;
    }
    const overId = String(over.id);
    if (overId.startsWith('day-col-')) {
      setOverDayId(overId.replace('day-col-', ''));
    } else {
      const col = columns.find((c) => c.tasks.some((t) => t.id === overId));
      setOverDayId(col ? col.id : null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTaskId(null);
    setOverDayId(null);
    if (!over || !onReorderOrMoveDailyTask) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId !== overId) {
      onReorderOrMoveDailyTask(activeId, overId);
    }
  };

  const handleDragCancel = () => {
    setActiveDragTaskId(null);
    setOverDayId(null);
  };

  const matchCounts = countMatchingTasks(
    columns,
    monthlyGoals,
    yearlyGoals,
    searchQuery
  );

  const keywordFilteredColumns = isSearching
    ? filterDayColumnsByKeyword(columns, searchQuery)
    : columns;

  const filteredColumns =
    activeTagFilter !== 'All'
      ? filterDayColumnsByCategory(keywordFilteredColumns, activeTagFilter)
      : keywordFilteredColumns;

  const displayedColumns =
    visibleColumnSlice && !isSearching && activeTagFilter === 'All'
      ? filteredColumns.slice(visibleColumnSlice[0], visibleColumnSlice[1])
      : filteredColumns;

  const activeTasksForTagCounts =
    activeView === 'month'
      ? monthlyGoals
      : activeView === 'year'
      ? yearlyGoals
      : columns.flatMap((c) => c.tasks);

  const categoryCounts = countTasksByCategory(activeTasksForTagCounts);
  const totalActiveTaggedTasks = Object.values(categoryCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  const hasAnyActiveTasks = columns.some((col) =>
    col.tasks.some((t) => t.text.trim().length > 0)
  );

  const renderGoalView = (mode: 'month' | 'year', goals: DetailedTask[]) => {
    const keywordGoals = isSearching
      ? filterDetailedTasksByKeyword(goals, searchQuery)
      : goals;
    const filteredGoals =
      activeTagFilter !== 'All'
        ? filterTasksByCategory(keywordGoals, activeTagFilter)
        : keywordGoals;

    const completedCount = goals.filter(
      (g) => g.completed && g.text.trim().length > 0
    ).length;
    const totalCount = goals.filter((g) => g.text.trim().length > 0).length;
    const pct =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    const midPoint = Math.ceil(filteredGoals.length / 2);
    const leftGoals = filteredGoals.slice(0, midPoint);
    const rightGoals = filteredGoals.slice(midPoint);

    return (
      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9C948B] block">
              {mode === 'month' ? 'MONTHLY GOALS & TASKS' : 'YEARLY GOALS'}
            </span>
            <h4 className="text-base font-bold text-[#2F2B28]">
              {mode === 'month' ? 'June 2026' : '2026'}
            </h4>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-20 sm:w-28 h-2 bg-[#EFECE6] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${pct}%`,
                  backgroundColor: theme.progressFill,
                }}
              />
            </div>
            <span className="text-xs font-bold text-[#5A534C] tabular-nums">
              {pct}% · {completedCount} of {totalCount}
            </span>
          </div>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#ECE7DF] p-8 text-center">
            <p className="text-xs font-semibold text-[#7A7269] mb-2">
              No {mode === 'month' ? 'monthly' : 'yearly'} tasks match{' '}
              {activeTagFilter !== 'All'
                ? `tag "${activeTagFilter}"`
                : `“${searchQuery}”`}
            </p>
            <div className="flex items-center justify-center gap-3">
              {activeTagFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveTagFilter('All')}
                  className="text-xs font-bold text-[#B86B43] hover:underline cursor-pointer"
                >
                  Show all tags
                </button>
              )}
              {isSearching && onSearchQueryChange && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="text-xs font-bold text-[#B86B43] hover:underline cursor-pointer"
                >
                  Clear search filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white rounded-xl border border-[#ECE7DF] p-2.5 sm:p-3.5">
            {[leftGoals, rightGoals].map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                {group.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-1.5 sm:gap-2 py-1.5 px-1.5 sm:px-2 rounded-lg hover:bg-[#FAF7F2] transition-colors border-b border-[#F3EFE8] last:border-b-0"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={goal.completed}
                      aria-label={`Mark "${goal.text || 'goal'}" as ${
                        goal.completed ? 'incomplete' : 'complete'
                      }`}
                      onClick={() => onToggleGoalTask?.(mode, goal.id)}
                      className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: goal.completed
                          ? theme.checkboxBg
                          : '#FAF8F5',
                        border: goal.completed
                          ? 'none'
                          : '1.5px solid #D5CEC4',
                      }}
                    >
                      {goal.completed && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={goal.text}
                      aria-label={`${mode} goal text`}
                      placeholder="Add a goal..."
                      onChange={(e) =>
                        onUpdateGoalText?.(mode, goal.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          onQuickSave?.();
                          e.currentTarget.blur();
                        } else if (e.key === 'Escape' || e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      className={`flex-1 min-w-0 bg-transparent text-xs font-medium focus:outline-none ${
                        goal.completed
                          ? 'line-through text-[#A59E95]'
                          : 'text-[#3B3632]'
                      }`}
                    />

                    {/* Small Colored Category Badge Next to Goal Name */}
                    {goal.text.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCycleGoalCategory?.(mode, goal.id)}
                        aria-label={`Category ${goal.category} for ${goal.text}. Click to cycle.`}
                        data-testid={`${instancePrefix}-goal-category-badge-${goal.id}`}
                        data-category-badge={goal.category}
                        title={`Category: ${goal.category} (click to cycle)`}
                        className="px-2 py-0.5 rounded text-[9px] font-bold shrink-0 border cursor-pointer transition-transform active:scale-95 leading-none"
                        style={{
                          backgroundColor:
                            CATEGORY_BADGE_STYLES[goal.category]?.bg ?? '#FCEADE',
                          color:
                            CATEGORY_BADGE_STYLES[goal.category]?.text ??
                            '#9A4E28',
                          borderColor:
                            CATEGORY_BADGE_STYLES[goal.category]?.border ??
                            '#F0CFB8',
                        }}
                      >
                        {goal.category}
                      </button>
                    )}

                    <VoiceMicButton
                      currentText={goal.text}
                      onUpdateText={(newText) =>
                        onUpdateGoalText?.(mode, goal.id, newText)
                      }
                      ariaLabel={`Dictate ${mode} goal ${goal.id} (${instancePrefix})`}
                      compact={compact}
                      accentColor={theme.checkboxBg}
                    />

                    <button
                      type="button"
                      onClick={() => onCycleGoalPriority?.(mode, goal.id)}
                      aria-label={`Priority ${goal.priority} for ${goal.text}. Click to cycle.`}
                      data-priority-pill={goal.priority}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95"
                      style={{
                        backgroundColor: PRIORITY_PILL_STYLES[goal.priority].bg,
                        color: PRIORITY_PILL_STYLES[goal.priority].text,
                      }}
                    >
                      {goal.priority}
                    </button>

                    <button
                      type="button"
                      onClick={() => onCycleGoalStatus?.(mode, goal.id)}
                      aria-label={`Status ${goal.status} for ${goal.text}. Click to cycle.`}
                      data-status-pill={goal.status}
                      className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95"
                      style={{
                        backgroundColor: STATUS_PILL_STYLES[goal.status].bg,
                        color: STATUS_PILL_STYLES[goal.status].text,
                      }}
                    >
                      {goal.status}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${
        compact ? 'p-2.5 md:p-3.5' : 'p-3 sm:p-3.5 md:p-4'
      } select-none`}
    >
      {/* Top Row: Title + Built-in 25m Focus Timer + View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h3
            className={`font-bold tracking-tight text-[#2F2B28] ${
              compact ? 'text-base md:text-lg' : 'text-lg sm:text-xl md:text-[22px]'
            }`}
          >
            Weekly To-Do List
          </h3>

          {!compact && (
            <PomodoroTimer instanceId={instancePrefix || 'weekly'} />
          )}
        </div>

        {/* Segmented Control: This Week | This Month | This Year */}
        <div
          className="inline-flex items-center bg-[#EFECE6] p-0.5 sm:p-1 rounded-full border border-[#E4DDD3] max-w-full overflow-x-auto"
          role="tablist"
          aria-label={`${instancePrefix} view mode`}
        >
          {(
            [
              {
                id: 'week',
                label: isSearching
                  ? `This Week (${matchCounts.weeklyMatches})`
                  : 'This Week',
              },
              {
                id: 'month',
                label: isSearching
                  ? `This Month (${matchCounts.monthlyMatches})`
                  : 'This Month',
              },
              {
                id: 'year',
                label: isSearching
                  ? `This Year (${matchCounts.yearlyMatches})`
                  : 'This Year',
              },
            ] as const
          ).map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectView(tab.id)}
                className={`${
                  compact
                    ? 'px-2 sm:px-2.5 py-1 text-[10px]'
                    : 'px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs'
                } font-bold rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  isActive
                    ? 'bg-white text-[#2F2B28] shadow-xs'
                    : 'text-[#7A7269] hover:text-[#2F2B28]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Row: Week range + Date input + Real-Time Search Bar + Theme selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <span
            className={`${
              compact ? 'text-[10px]' : 'text-xs'
            } font-semibold text-[#8A8279]`}
          >
            {weekRangeLabel}
          </span>
          <label className="relative inline-flex items-center">
            <span className="sr-only">Select week date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              aria-label={`${instancePrefix} week date`}
              className={`bg-white border border-[#DED8CE] rounded-lg font-semibold text-[#3B3632] focus:outline-none focus:ring-2 focus:ring-[#C87D55]/40 cursor-pointer ${
                compact ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
              }`}
            />
          </label>

          {/* Real-Time Task Search Bar */}
          {onSearchQueryChange && !compact && (
            <div className="relative flex items-center w-full sm:w-auto" role="search">
              <Search
                className="w-3.5 h-3.5 text-[#8A8279] absolute left-2.5 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                data-shortcut-search={instancePrefix}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (searchQuery.trim().length > 0) {
                      onSearchQueryChange('');
                    } else {
                      e.currentTarget.blur();
                    }
                  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    onQuickSave?.();
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search tasks, tags, notes... (/)"
                aria-label={`Search tasks (${instancePrefix})`}
                className="bg-white border border-[#DED8CE] focus:border-[#C87D55] focus:ring-2 focus:ring-[#C87D55]/25 rounded-lg pl-7 pr-16 py-0.5 text-xs font-medium text-[#2F2B28] placeholder:text-[#9C948B] w-full sm:w-68 transition-all focus:outline-none"
              />
              {isSearching ? (
                <div className="absolute right-1.5 flex items-center gap-1">
                  <span
                    data-testid={`${instancePrefix}-search-count-pill`}
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF0E6] text-[#A85B33] tabular-nums"
                  >
                    {matchCounts.totalMatches}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSearchQueryChange('')}
                    aria-label={`Clear task search (${instancePrefix})`}
                    data-testid={`${instancePrefix}-clear-search-btn`}
                    className="text-[#8A8279] hover:text-[#2F2B28] p-0.5 rounded-full cursor-pointer hover:bg-[#F3EFE9]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span className="absolute right-2 text-[9px] font-semibold text-[#A89F93] border border-[#E0D8CD] px-1 py-0.2 rounded bg-[#F8F5EE] select-none pointer-events-none">
                  /
                </span>
              )}
            </div>
          )}
        </div>

        {/* 4 Color Theme Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#9A9288] mr-0.5">
            THEME
          </span>
          {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
            const t = THEMES[themeKey];
            const isSelected = activeTheme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => onSelectTheme(themeKey)}
                aria-label={`Select ${t.name} color theme (${instancePrefix})`}
                title={t.name}
                className={`grid grid-cols-2 gap-0.5 p-1 rounded-lg bg-[#EFECE6] transition-all cursor-pointer ${
                  compact ? 'w-6 h-5' : 'w-7 h-5.5'
                } ${
                  isSelected
                    ? 'ring-2 ring-[#7C736A] bg-white shadow-xs scale-105'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span
                  className="rounded-tl-[3px] w-full h-full block"
                  style={{ backgroundColor: t.quadrantColors[0] }}
                />
                <span
                  className="rounded-tr-[3px] w-full h-full block"
                  style={{ backgroundColor: t.quadrantColors[1] }}
                />
                <span
                  className="rounded-bl-[3px] w-full h-full block"
                  style={{ backgroundColor: t.quadrantColors[2] }}
                />
                <span
                  className="rounded-br-[3px] w-full h-full block"
                  style={{ backgroundColor: t.quadrantColors[3] }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Third Row: Micro instructions / Active search status + Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        {isSearching ? (
          <p
            data-testid={`${instancePrefix}-search-summary`}
            className={`${
              compact ? 'text-[9px]' : 'text-[11px]'
            } font-semibold text-[#8C623E]`}
          >
            Showing {matchCounts.weeklyMatches} daily ·{' '}
            {matchCounts.monthlyMatches} monthly · {matchCounts.yearlyMatches}{' '}
            yearly matches for &ldquo;{searchQuery.trim()}&rdquo;
          </p>
        ) : (
          <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-[#9C948B]`}>
            {dndActive && enableTaskNotes
              ? 'Drag grip to reorder/move · tap box to complete · dot sets priority · note icon adds context'
              : dndActive
              ? 'Drag grip to reorder or move across days · tap box to complete · dot sets priority · mic dictates'
              : compact
              ? 'Tap the box to complete · the dot sets priority · the pill sets status'
              : 'Tap the box to complete · the dot sets priority · the pill sets status · mic dictates'}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!compact && (
            <button
              type="button"
              onClick={() => handleOpenBulkImport(displayedColumns[0]?.id || 'mon')}
              data-testid={`${instancePrefix}-bulk-import-btn`}
              title="Paste a multi-line list of tasks to add multiple items at once to a specific day column"
              className="inline-flex items-center gap-1.5 bg-[#FAF4EC] hover:bg-[#F3E6D6] border border-[#E5CFB8] rounded-full px-3 py-1 text-[11px] font-bold text-[#9A4E28] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span>Bulk Import</span>
            </button>
          )}

          {!compact && onArchiveCompletedTasks && completionCounts.completedCount > 0 && (
            <button
              type="button"
              onClick={onArchiveCompletedTasks}
              data-testid={`${instancePrefix}-archive-completed-btn`}
              title="Move all completed tasks to Archive to declutter the daily view"
              className="inline-flex items-center gap-1.5 bg-[#F5DFD0] hover:bg-[#EED2BF] border border-[#E5C5AF] rounded-full px-3 py-1 text-[11px] font-bold text-[#9A4E28] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Archive className="w-3 h-3" />
              <span>Archive Completed ({completionCounts.completedCount})</span>
            </button>
          )}

          {!compact && onOpenArchiveModal && (
            <button
              type="button"
              onClick={onOpenArchiveModal}
              data-testid={`${instancePrefix}-open-archive-btn`}
              title="Open Completed Task Archive (Press A)"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F3EFE9] border border-[#E0D9CE] rounded-full px-3 py-1 text-[11px] font-semibold text-[#5A534C] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Archive className="w-3 h-3 text-[#B86741]" />
              <span>Archive ({archivedCount})</span>
            </button>
          )}

          {showBulkActions && (onClearCompletedTasks || onClearPendingTasks || onArchiveCompletedTasks) && (
            <div ref={bulkMenuRef} className="relative">
              <button
                type="button"
                data-testid={`${instancePrefix}-bulk-actions-btn`}
                aria-haspopup="menu"
                aria-expanded={bulkMenuOpen}
                onClick={() => setBulkMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#F3EFE9] border border-[#E0D9CE] rounded-full font-semibold text-[#5A534C] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  compact ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[11px]'
                }`}
              >
                <Trash2 className="w-3 h-3 text-[#B86741]" />
                <span>Bulk Actions</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    bulkMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {bulkMenuOpen && (
                <div
                  role="menu"
                  aria-label={`Bulk Actions (${instancePrefix})`}
                  data-testid={`${instancePrefix}-bulk-actions-menu`}
                  className="absolute right-0 mt-1.5 w-64 max-w-[calc(100vw-2rem)] bg-[#FDFBF7] border border-[#E5DEC9] rounded-xl shadow-[0_14px_32px_-8px_rgba(47,43,40,0.18)] py-1.5 z-40"
                >
                  {onArchiveCompletedTasks && (
                    <button
                      type="button"
                      role="menuitem"
                      data-testid={`${instancePrefix}-menu-archive-completed-btn`}
                      disabled={completionCounts.completedCount === 0}
                      onClick={() => {
                        onArchiveCompletedTasks();
                        setBulkMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B3530] hover:bg-[#F4EFE6] disabled:opacity-45 disabled:pointer-events-none flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span>Archive Completed tasks</span>
                      <span className="text-[10px] font-bold bg-[#F5DFD0] text-[#B05C37] px-2 py-0.5 rounded-full tabular-nums">
                        {completionCounts.completedCount}
                      </span>
                    </button>
                  )}

                  {onClearCompletedTasks && (
                    <button
                      type="button"
                      role="menuitem"
                      data-testid={`${instancePrefix}-clear-completed-btn`}
                      disabled={completionCounts.completedCount === 0}
                      onClick={() => {
                        onClearCompletedTasks();
                        setBulkMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B3530] hover:bg-[#F4EFE6] disabled:opacity-45 disabled:pointer-events-none flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span>Clear all Completed tasks</span>
                      <span className="text-[10px] font-bold bg-[#DFECE0] text-[#2D6E48] px-2 py-0.5 rounded-full tabular-nums">
                        {completionCounts.completedCount}
                      </span>
                    </button>
                  )}

                  {onClearPendingTasks && (
                    <button
                      type="button"
                      role="menuitem"
                      data-testid={`${instancePrefix}-clear-pending-btn`}
                      disabled={completionCounts.pendingCount === 0}
                      onClick={() => {
                        onClearPendingTasks();
                        setBulkMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#3B3530] hover:bg-[#F4EFE6] disabled:opacity-45 disabled:pointer-events-none flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <span>Clear all Pending tasks</span>
                      <span className="text-[10px] font-bold bg-[#F5DFD0] text-[#B05C37] px-2 py-0.5 rounded-full tabular-nums">
                        {completionCounts.pendingCount}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onResetWeek}
            className={`inline-flex items-center gap-1.5 bg-white hover:bg-[#F3EFE9] border border-[#E0D9CE] rounded-full font-semibold text-[#5A534C] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              compact ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[11px]'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>
              {hasAnyActiveTasks ? 'Reset this week' : 'Restore sample tasks'}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Color-Coded Tag Filter Bar */}
      {!compact && (
        <div
          data-testid={`${instancePrefix}-tag-filter-bar`}
          role="group"
          aria-label={`Filter tasks by tag (${instancePrefix})`}
          className="flex flex-wrap items-center gap-1.5 mb-2.5"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279] mr-0.5">
            TAGS
          </span>
          <button
            type="button"
            onClick={() => setActiveTagFilter('All')}
            aria-pressed={activeTagFilter === 'All'}
            data-testid={`${instancePrefix}-tag-filter-All`}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none tabular-nums ${
              activeTagFilter === 'All'
                ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                : 'bg-white text-[#5A534C] border-[#DED8CE] hover:bg-[#F3EFE9]'
            }`}
          >
            All ({totalActiveTaggedTasks})
          </button>
          {TASK_CATEGORIES.map((cat) => {
            const isSelected = activeTagFilter === cat;
            const count = categoryCounts[cat] ?? 0;
            const style = CATEGORY_BADGE_STYLES[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveTagFilter((prev) => (prev === cat ? 'All' : cat))
                }
                aria-pressed={isSelected}
                data-testid={`${instancePrefix}-tag-filter-${cat}`}
                data-category-badge={cat}
                title={`Filter by ${cat} tag (${count} task${
                  count === 1 ? '' : 's'
                })`}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none tabular-nums ${
                  isSelected
                    ? 'ring-2 ring-[#2F2B28]/45 scale-105 shadow-2xs'
                    : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  borderColor: style.border,
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
          {activeTagFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setActiveTagFilter('All')}
              data-testid={`${instancePrefix}-tag-filter-reset`}
              className="text-[10px] font-semibold text-[#8A8279] hover:text-[#2F2B28] underline ml-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              Show all
            </button>
          )}
        </div>
      )}

      {/* Active View Body */}
      {activeView === 'week' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <LayoutGroup id={`${instancePrefix}-week-board`}>
            {/* Search Match Summary Banner */}
            {isSearching && !compact && (
              <div
                data-testid={`${instancePrefix}-search-results-bar`}
                className="mb-2 px-3 py-2 rounded-lg bg-[#FAF5EE] border border-[#EADBCC] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C87D55]" />
                  <span className="font-bold text-[#3B342F]">
                    Found {matchCounts.totalMatches} match{matchCounts.totalMatches === 1 ? '' : 'es'} for “{searchQuery}”
                  </span>
                  <span className="text-[11px] text-[#7A7167]">
                    (This Week: {matchCounts.weeklyMatches} · Month: {matchCounts.monthlyMatches} · Year: {matchCounts.yearlyMatches})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {matchCounts.byField && matchCounts.byField.notes > 0 && (
                    <span
                      data-testid={`${instancePrefix}-search-note-count`}
                      className="text-[10px] font-semibold bg-[#F5ECE2] text-[#9A5128] px-2 py-0.5 rounded"
                    >
                      {matchCounts.byField.notes} matched in notes
                    </span>
                  )}
                  {onSearchQueryChange && (
                    <button
                      type="button"
                      onClick={() => onSearchQueryChange('')}
                      data-testid={`${instancePrefix}-search-clear-bar`}
                      className="text-xs font-bold text-[#A85B33] hover:underline cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className={`grid ${compact ? 'gap-1.5' : 'gap-2.5'} ${
              displayedColumns.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
            }`}
          >
            {/* Global Search Empty State Banner when 0 weekly matches */}
            {isSearching && matchCounts.weeklyMatches === 0 && (
              <div
                data-testid={`${instancePrefix}-search-empty-state`}
                className="col-span-full bg-white rounded-xl border border-[#ECE7DF] p-6 text-center my-2 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF3EB] text-[#C87D55] flex items-center justify-center mx-auto mb-2.5">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#2F2B28] mb-1">
                  No weekly tasks match "{searchQuery}"
                </h4>
                <p className="text-xs text-[#7A7269] max-w-md mx-auto mb-3">
                  {matchCounts.monthlyMatches > 0 || matchCounts.yearlyMatches > 0
                    ? `Found ${matchCounts.monthlyMatches} match in monthly goals and ${matchCounts.yearlyMatches} in yearly goals.`
                    : 'Try searching by task name, category (Work, Personal, Health, Finance, Home, Growth), or note content.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {matchCounts.monthlyMatches > 0 && (
                    <button
                      type="button"
                      onClick={() => onSelectView('month')}
                      data-testid={`${instancePrefix}-search-switch-month`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF4EC] hover:bg-[#F3E8DB] text-[#A85B33] border border-[#ECD9C5] cursor-pointer transition-colors"
                    >
                      View Monthly Matches ({matchCounts.monthlyMatches})
                    </button>
                  )}
                  {matchCounts.yearlyMatches > 0 && (
                    <button
                      type="button"
                      onClick={() => onSelectView('year')}
                      data-testid={`${instancePrefix}-search-switch-year`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FAF4EC] hover:bg-[#F3E8DB] text-[#A85B33] border border-[#ECD9C5] cursor-pointer transition-colors"
                    >
                      View Yearly Matches ({matchCounts.yearlyMatches})
                    </button>
                  )}
                  {onSearchQueryChange && (
                    <button
                      type="button"
                      onClick={() => onSearchQueryChange('')}
                      data-testid={`${instancePrefix}-search-clear-empty`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2F2B28] text-white hover:bg-[#433D38] cursor-pointer transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}

            {displayedColumns.map((col) => {
              const originalIndex = columns.findIndex((c) => c.id === col.id);
              const originalColumn =
                originalIndex >= 0 ? columns[originalIndex] : col;
              const headerColor =
                theme.dayHeaders[originalIndex >= 0 ? originalIndex : 0];
              const progress = calculateDayProgress(originalColumn.tasks);
              const dayAllDone = isDayAllDone(originalColumn.tasks);
              const isTargetColumn =
                overDayId === col.id && activeDragTask !== null;

              return (
                <div
                  key={col.id}
                  className={`bg-white rounded-xl border flex flex-col overflow-visible transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)] ${
                    isTargetColumn
                      ? 'border-[#C87D55] ring-2 ring-[#C87D55]/30 shadow-md scale-[1.01]'
                      : 'border-[#EAE4DC]'
                  }`}
                >
                  {/* Day Header */}
                  <div
                    data-day-header="true"
                    className={`${
                      compact ? 'px-2 py-1.5' : 'px-2.5 py-1.5'
                    } rounded-t-xl flex items-center justify-between gap-1.5 transition-colors duration-200`}
                    style={{ backgroundColor: headerColor }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <DayCircularProgress
                        percentage={progress.percentage}
                        total={progress.total}
                        completed={progress.completed}
                        compact={compact}
                        accentColor={theme.progressFill}
                        dayName={col.dayName}
                        testId={`${instancePrefix}-day-progress-ring-${col.id}`}
                      />
                      <div className="min-w-0">
                        <div
                          className={`font-bold text-[#332C27] leading-tight truncate ${
                            compact ? 'text-[10px]' : 'text-xs sm:text-[13px]'
                          }`}
                        >
                          {col.dayName}
                        </div>
                        <div
                          className={`text-[#594E45] font-medium truncate ${
                            compact ? 'text-[8px]' : 'text-[10px]'
                          }`}
                        >
                          {col.dateLabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!compact && (
                        <button
                          type="button"
                          onClick={() => handleOpenBulkImport(col.id)}
                          aria-label={`Bulk import tasks to ${col.dayName}`}
                          data-testid={`${instancePrefix}-day-bulk-import-btn-${col.id}`}
                          title={`Bulk import multiple tasks to ${col.dayName}`}
                          className="p-1 rounded-md text-[#594E45] hover:text-[#2F2B28] hover:bg-black/8 transition-colors cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" />
                        </button>
                      )}
                      {isTargetColumn ? (
                        <span className="bg-[#B86B43] text-white font-bold rounded-full text-[8px] sm:text-[9px] px-2 py-0.5 tracking-wider uppercase shrink-0 animate-pulse">
                          MOVE HERE
                        </span>
                      ) : col.isToday ? (
                        <span
                          className={`bg-[#647F5E] text-white font-bold rounded-full tracking-wider uppercase shrink-0 ${
                            compact
                              ? 'text-[7px] px-1.5 py-0.5'
                              : 'text-[9px] px-2 py-0.5'
                          }`}
                        >
                          TODAY
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Task Rows */}
                  <SortableContext
                    id={`sortable-${col.id}`}
                    items={col.tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableDayTasksContainer
                      dayId={col.id}
                      dayName={col.dayName}
                      isOverAny={Boolean(activeDragTaskId)}
                      compact={compact}
                    >
                      {col.tasks.length === 0 ? (
                        <div className="py-5 text-center text-[10px] text-[#B0A89E] italic">
                          No matching tasks
                        </div>
                      ) : (
                        col.tasks.map((task, idx) => (
                          <SortableDailyTaskRow
                            key={task.id}
                            task={task}
                            idx={idx}
                            dayId={col.id}
                            dayName={col.dayName}
                            compact={compact}
                            instancePrefix={instancePrefix}
                            checkboxBg={theme.checkboxBg}
                            dndEnabled={dndActive}
                            enableTaskNotes={enableTaskNotes}
                            onToggleDailyTask={onToggleDailyTask}
                            onCycleDailyPriority={onCycleDailyPriority}
                            onCycleDailyCategory={onCycleDailyCategory}
                            onCycleDailyRecurring={onCycleDailyRecurring}
                            onSetDailyRecurring={onSetDailyRecurring}
                            onUpdateDailyTaskText={onUpdateDailyTaskText}
                            onUpdateDailyTaskNotes={onUpdateDailyTaskNotes}
                            onArchiveSingleDailyTask={onArchiveSingleDailyTask}
                            onQuickSave={onQuickSave}
                            searchQuery={searchQuery}
                          />
                        ))
                      )}
                    </DroppableDayTasksContainer>
                  </SortableContext>

                  {/* Column Progress Bar */}
                  <div
                    className={`${
                      compact ? 'px-1.5 py-1 gap-1.5' : 'px-2.5 py-1.5 gap-2'
                    } bg-[#FCFBF9] border-t border-[#F2EFE9] flex items-center`}
                  >
                    <div className="flex-1 h-1.5 bg-[#EFECE6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${progress.percentage}%`,
                          backgroundColor: theme.progressFill,
                        }}
                      />
                    </div>
                    {dayAllDone && (
                      <span
                        data-testid={`${instancePrefix}-${col.id}-all-done`}
                        className={`${
                          compact
                            ? 'text-[8px] px-1 py-0.2'
                            : 'text-[9px] px-1.5 py-0.5'
                        } font-bold text-[#2D6E48] bg-[#CBEAD6] rounded-full shrink-0`}
                      >
                        Done
                      </span>
                    )}
                    <span
                      className={`${
                        compact ? 'text-[9px]' : 'text-[10px]'
                      } font-bold text-[#8A8279] tabular-nums shrink-0`}
                    >
                      {progress.fractionLabel}
                    </span>
                  </div>

                  {/* Bottom Quick-Add Task Input Field */}
                  <div
                    data-testid={`${instancePrefix}-quick-add-row-${col.id}`}
                    className={`${
                      compact ? 'px-1.5 py-1' : 'px-2 py-1.5'
                    } rounded-b-xl bg-[#FAF7F2] border-t border-[#ECE7DF] flex items-center gap-1`}
                  >
                    <Plus
                      aria-hidden="true"
                      className={`${
                        compact ? 'w-2.5 h-2.5' : 'w-3 h-3'
                      } text-[#9C948B] shrink-0`}
                    />
                    <input
                      type="text"
                      value={quickAddValues[col.id] ?? ''}
                      placeholder={
                        compact ? 'Add task…' : 'Add task… (Enter)'
                      }
                      aria-label={`Quick add task to ${col.dayName} (${instancePrefix})`}
                      data-testid={`${instancePrefix}-quick-add-input-${col.id}`}
                      data-quick-add-input={`${instancePrefix}-${col.id}`}
                      data-day-quick-add={col.id}
                      onChange={(e) => {
                        const val = sanitizeTaskText(e.target.value);
                        setQuickAddValues((prev) => ({
                          ...prev,
                          [col.id]: val,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return;
                        if (
                          e.key === 'Enter' &&
                          !e.shiftKey &&
                          !e.altKey &&
                          !e.ctrlKey &&
                          !e.metaKey
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAddSubmit(col.id);
                        } else if (
                          (e.ctrlKey || e.metaKey) &&
                          e.key === 'Enter'
                        ) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAddSubmit(col.id);
                          onQuickSave?.();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          if ((quickAddValues[col.id] ?? '').length > 0) {
                            setQuickAddValues((prev) => ({
                              ...prev,
                              [col.id]: '',
                            }));
                          } else {
                            e.currentTarget.blur();
                          }
                        }
                      }}
                      className={`w-full min-w-0 bg-white border border-[#E2DBD0] focus:border-[#C87D55] focus:outline-none rounded-md font-medium text-[#3B3632] placeholder:text-[#9C948B] transition-colors ${
                        compact
                          ? 'text-[9px] px-1 py-0.5'
                          : 'text-[11px] sm:text-xs px-1.5 py-0.5'
                      }`}
                    />
                    {(() => {
                      const quickCat = quickAddCategories[col.id] ?? 'Work';
                      const catStyle = CATEGORY_BADGE_STYLES[quickCat];
                      return (
                        <button
                          type="button"
                          onClick={() => handleCycleQuickAddCategory(col.id)}
                          aria-label={`New ${col.dayName} task tag: ${quickCat} (${instancePrefix}). Click to cycle.`}
                          data-testid={`${instancePrefix}-quick-add-category-${col.id}`}
                          data-category-badge={quickCat}
                          title={`Tag for new task: ${quickCat} (click to cycle)`}
                          className={`rounded font-bold tracking-tight shrink-0 leading-none border transition-transform active:scale-95 cursor-pointer whitespace-nowrap ${
                            compact
                              ? 'px-1 py-0.5 text-[7px]'
                              : 'px-1.5 py-0.5 text-[8.5px]'
                          }`}
                          style={{
                            backgroundColor: catStyle.bg,
                            color: catStyle.text,
                            borderColor: catStyle.border,
                          }}
                        >
                          {quickCat}
                        </button>
                      );
                    })()}
                    {(() => {
                      const quickRec = quickAddRecurring[col.id] ?? 'none';
                      const recConf = RECURRING_CONFIG[quickRec];
                      const isRecActive = quickRec !== 'none';
                      return (
                        <button
                          type="button"
                          onClick={() => handleCycleQuickAddRecurring(col.id)}
                          aria-label={`New ${col.dayName} repeat cadence: ${recConf.label} (${instancePrefix}). Click to cycle.`}
                          data-testid={`${instancePrefix}-quick-add-recurring-${col.id}`}
                          data-recurring-badge={quickRec}
                          title={`Repeat cadence for new task: ${recConf.label} (click to cycle)`}
                          className={`rounded font-bold tracking-tight shrink-0 leading-none border transition-transform active:scale-95 cursor-pointer whitespace-nowrap inline-flex items-center gap-0.5 ${
                            compact
                              ? 'px-1 py-0.5 text-[7px]'
                              : 'px-1.5 py-0.5 text-[8.5px]'
                          } ${
                            isRecActive
                              ? ''
                              : 'opacity-50 hover:opacity-100 hover:border-[#D5C9BD] hover:bg-white'
                          }`}
                          style={{
                            backgroundColor: isRecActive ? recConf.bg : '#FAF7F2',
                            color: isRecActive ? recConf.text : '#736B63',
                            borderColor: isRecActive ? recConf.border : '#E2DBD0',
                          }}
                        >
                          <Repeat className="w-2.5 h-2.5 shrink-0 stroke-[2.2]" />
                          <span>{recConf.shortLabel}</span>
                        </button>
                      );
                    })()}
                    {(quickAddValues[col.id] ?? '').trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleQuickAddSubmit(col.id)}
                        aria-label={`Submit new ${col.dayName} task (${instancePrefix})`}
                        data-testid={`${instancePrefix}-quick-add-submit-${col.id}`}
                        title="Press Enter or click to add task"
                        className={`${
                          compact
                            ? 'px-1 py-0.5 text-[8px]'
                            : 'px-1.5 py-0.5 text-[9.5px]'
                        } font-bold text-white rounded transition-transform active:scale-95 cursor-pointer shrink-0 leading-none`}
                        style={{ backgroundColor: theme.checkboxBg }}
                      >
                        ↵
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>

        <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeDragTask ? (
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                animate={{ scale: 1.04, rotate: 1.2 }}
                exit={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className="bg-white border-2 border-[#C87D55] rounded-xl px-3 py-2 shadow-[0_16px_36px_-6px_rgba(47,43,40,0.22)] flex items-center gap-2.5 text-xs font-semibold text-[#2F2B28] cursor-grabbing pointer-events-none"
              >
                <GripVertical className="w-3.5 h-3.5 text-[#C87D55] shrink-0" />
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      PRIORITY_DOT_COLORS[activeDragTask.priority],
                  }}
                />
                <span className="truncate max-w-[200px] text-[#2F2B28]">
                  {activeDragTask.text || 'Empty task slot'}
                </span>
                {activeDragTask.text.trim().length > 0 && (
                  <span
                    data-category-badge={activeDragTask.category}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_BADGE_STYLES[activeDragTask.category]?.bg ??
                        '#FCEADE',
                      color:
                        CATEGORY_BADGE_STYLES[activeDragTask.category]?.text ??
                        '#9A4E28',
                      borderColor:
                        CATEGORY_BADGE_STYLES[activeDragTask.category]
                          ?.border ?? '#F0CFB8',
                    }}
                  >
                    {activeDragTask.category}
                  </span>
                )}
              </motion.div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {activeView === 'month' && renderGoalView('month', monthlyGoals)}
      {activeView === 'year' && renderGoalView('year', yearlyGoals)}

      {!onOpenBulkImportModal && (
        <BulkImportModal
          isOpen={localBulkImportModal.open}
          columns={columns}
          activeTheme={activeTheme}
          initialDayId={localBulkImportModal.dayId}
          onClose={() =>
            setLocalBulkImportModal((prev) => ({ ...prev, open: false }))
          }
          onBulkImport={handleExecuteBulkImport}
        />
      )}
    </div>
  );
};
