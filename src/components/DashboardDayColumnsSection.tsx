import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  FileText,
  Maximize2,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  CustomCategoryDefinition,
  DEFAULT_EOD_TARGET_HOUR,
  DailyTask,
  DayColumn,
  EndOfDayUrgencyStatus,
  ThemeId,
  THEMES,
  addMinutesToTime24,
  buildDayTimeBlockTimeline,
  calculateDayProgress,
  calculateEndOfDayTimeRemaining,
  filterColumnsForMobileDayScope,
  formatTaskNoteSummary,
  formatTime12Hour,
  getCategoryBadgeStyle,
  resolveDailyTaskTimeBlock,
  validateTimeBlockRange,
} from '../utils/todoLogic';
import { PRIORITY_DOT_COLORS } from './InteractiveDashboard';

const EOD_URGENCY_BADGE_STYLES: Record<
  Exclude<EndOfDayUrgencyStatus, 'completed'>,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  plenty: {
    bg: '#F3F7F4',
    text: '#2B6CB0',
    border: '#CFE2EE',
  },
  approaching: {
    bg: '#FEF6E7',
    text: '#9C5E14',
    border: '#ECD2A4',
  },
  urgent: {
    bg: '#FDF0ED',
    text: '#A93829',
    border: '#EBC2BA',
  },
  'past-eod': {
    bg: '#F4EFEA',
    text: '#7A5C49',
    border: '#DFD3C5',
  },
};

const QUICK_DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '90m', minutes: 90 },
  { label: '2h', minutes: 120 },
] as const;

export interface DashboardDayColumnsSectionProps {
  columns: DayColumn[];
  activeTheme: ThemeId;
  customCategories?: CustomCategoryDefinition[];
  onToggleDailyTask: (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => void;
  onCycleDailyPriority: (dayId: string, taskId: string) => void;
  onUpdateDailyTaskText: (dayId: string, taskId: string, text: string) => void;
  onUpdateDailyTaskNotes: (
    dayId: string,
    taskId: string,
    notes: string
  ) => void;
  onUpdateDailyTaskTimeBlock?: (
    dayId: string,
    taskId: string,
    startTime: string,
    endTime: string
  ) => {
    success: boolean;
    error?: string;
  };
  onQuickSave?: (customMessage?: string) => void;
  className?: string;
}

interface ActiveNotesModalTarget {
  dayId: string;
  dayName: string;
  dateLabel: string;
  task: DailyTask;
}

export const DashboardDayColumnsSection: React.FC<
  DashboardDayColumnsSectionProps
> = ({
  columns,
  activeTheme,
  customCategories,
  onToggleDailyTask,
  onCycleDailyPriority,
  onUpdateDailyTaskText,
  onUpdateDailyTaskNotes,
  onUpdateDailyTaskTimeBlock,
  onQuickSave,
  className = '',
}) => {
  const theme = THEMES[activeTheme];

  // Mobile/Tablet day filter ('all' by default so all 7 days are accessible, or a single day ID for focused mobile browsing)
  const [mobileDayScope, setMobileDayScope] = useState<'all' | string>('all');

  // Selected day for the side-by-side Daily Task List & Vertical Timeline studio
  const defaultTimelineDayId = useMemo(() => {
    const todayCol = columns.find((c) => c.isToday);
    return todayCol?.id || columns[0]?.id || 'thu';
  }, [columns]);
  const [selectedTimelineDayId, setSelectedTimelineDayId] =
    useState<string>(defaultTimelineDayId);

  // Sync timeline day when user selects a specific mobile day pill
  useEffect(() => {
    if (
      mobileDayScope !== 'all' &&
      columns.some((c) => c.id === mobileDayScope)
    ) {
      setSelectedTimelineDayId(mobileDayScope);
    }
  }, [mobileDayScope, columns]);

  // Live clock for End-of-Day (default 5:00 PM / 17:00) Time Remaining calculation
  const [now, setNow] = useState<Date>(() => new Date());
  const [eodTargetHour, setEodTargetHour] = useState<number>(
    DEFAULT_EOD_TARGET_HOUR
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const headerEodSummary = calculateEndOfDayTimeRemaining({
    now,
    targetHour: eodTargetHour,
    completed: false,
  });

  // Track which task has its inline notes input open and its draft text
  const [inlineEditingTaskId, setInlineEditingTaskId] = useState<string | null>(
    null
  );
  const [inlineDraftText, setInlineDraftText] = useState<string>('');

  // Track which task has its inline Time-Block editor open
  const [timeBlockEditingTaskId, setTimeBlockEditingTaskId] = useState<
    string | null
  >(null);
  const [draftStartTime, setDraftStartTime] = useState<string>('09:00');
  const [draftEndTime, setDraftEndTime] = useState<string>('10:00');
  const [timeBlockError, setTimeBlockError] = useState<string | null>(null);

  // Track optional modal editor target and draft text
  const [modalTarget, setModalTarget] = useState<ActiveNotesModalTarget | null>(
    null
  );
  const [modalDraftText, setModalDraftText] = useState<string>('');

  const handleOpenInlineEditor = (task: DailyTask) => {
    if (inlineEditingTaskId === task.id) {
      setInlineEditingTaskId(null);
      setInlineDraftText('');
    } else {
      setInlineEditingTaskId(task.id);
      setInlineDraftText(task.notes ?? '');
      setTimeBlockEditingTaskId(null);
      setTimeBlockError(null);
    }
  };

  const handleSaveInlineNote = (dayId: string, taskId: string) => {
    onUpdateDailyTaskNotes(dayId, taskId, inlineDraftText);
    onQuickSave?.('Task note saved');
    setInlineEditingTaskId(null);
  };

  const handleOpenTimeBlockEditor = (dayId: string, task: DailyTask) => {
    if (timeBlockEditingTaskId === task.id) {
      setTimeBlockEditingTaskId(null);
      setTimeBlockError(null);
      return;
    }
    const resolved = resolveDailyTaskTimeBlock(task);
    setDraftStartTime(resolved.startTime || '09:00');
    setDraftEndTime(resolved.endTime || '10:00');
    setTimeBlockError(null);
    setTimeBlockEditingTaskId(task.id);
    setInlineEditingTaskId(null);
    setSelectedTimelineDayId(dayId);
  };

  const handleApplyDurationPreset = (minutes: number) => {
    const baseStart = draftStartTime || '09:00';
    const nextEnd = addMinutesToTime24(baseStart, minutes);
    setDraftStartTime(baseStart);
    setDraftEndTime(nextEnd);
    setTimeBlockError(null);
  };

  const handleSaveTimeBlock = (dayId: string, task: DailyTask) => {
    const check = validateTimeBlockRange(draftStartTime, draftEndTime);
    if (!check.valid) {
      setTimeBlockError(check.error || 'Invalid time range.');
      return;
    }
    if (onUpdateDailyTaskTimeBlock) {
      const res = onUpdateDailyTaskTimeBlock(
        dayId,
        task.id,
        check.startTime,
        check.endTime
      );
      if (!res.success) {
        setTimeBlockError(res.error || 'Could not save time block.');
        return;
      }
    }
    setTimeBlockEditingTaskId(null);
    setTimeBlockError(null);
    setSelectedTimelineDayId(dayId);
  };

  const handleClearTimeBlock = (dayId: string, task: DailyTask) => {
    if (onUpdateDailyTaskTimeBlock) {
      onUpdateDailyTaskTimeBlock(dayId, task.id, '', '');
    }
    setTimeBlockEditingTaskId(null);
    setTimeBlockError(null);
  };

  const handleOpenNotesModal = (col: DayColumn, task: DailyTask) => {
    setModalTarget({
      dayId: col.id,
      dayName: col.dayName,
      dateLabel: col.dateLabel,
      task,
    });
    setModalDraftText(
      inlineEditingTaskId === task.id ? inlineDraftText : task.notes ?? ''
    );
  };

  const handleSaveModalNote = () => {
    if (!modalTarget) return;
    onUpdateDailyTaskNotes(
      modalTarget.dayId,
      modalTarget.task.id,
      modalDraftText
    );
    if (inlineEditingTaskId === modalTarget.task.id) {
      setInlineDraftText(modalDraftText);
      setInlineEditingTaskId(null);
    }
    onQuickSave?.('Task note saved');
    setModalTarget(null);
  };

  const totalNotesCount = columns.reduce((acc, col) => {
    return (
      acc +
      col.tasks.filter(
        (t) =>
          t.text.trim().length > 0 &&
          t.text.trim() !== '—' &&
          Boolean(t.notes && t.notes.trim().length > 0)
      ).length
    );
  }, 0);

  const totalTimeBlockedCount = columns.reduce((acc, col) => {
    return (
      acc +
      col.tasks.filter(
        (t) =>
          t.text.trim().length > 0 &&
          t.text.trim() !== '—' &&
          resolveDailyTaskTimeBlock(t).isTimeBlocked
      ).length
    );
  }, 0);

  const pendingDailyTasksCount = columns.reduce((acc, col) => {
    return (
      acc +
      col.tasks.filter(
        (t) =>
          t.text.trim().length > 0 &&
          t.text.trim() !== '—' &&
          !t.completed
      ).length
    );
  }, 0);

  const displayedColumns = filterColumnsForMobileDayScope(
    columns,
    mobileDayScope
  );

  const activeTimelineColumn =
    columns.find((c) => c.id === selectedTimelineDayId) ||
    columns.find((c) => c.isToday) ||
    columns[0];

  const activeDayTimeline = useMemo(
    () =>
      buildDayTimeBlockTimeline(activeTimelineColumn?.tasks ?? [], {
        minHour: 8,
        maxHour: 19,
      }),
    [activeTimelineColumn]
  );

  const draftPreviewValidation = validateTimeBlockRange(
    draftStartTime,
    draftEndTime
  );

  return (
    <section
      aria-label="Weekly Day Columns with Time-Blocking, Persistent Task Notes, and Time Remaining"
      data-testid="dashboard-day-columns-section"
      data-notes-count={totalNotesCount}
      data-timeblocked-count={totalTimeBlockedCount}
      data-pending-tasks-count={pendingDailyTasksCount}
      data-eod-target-hour={eodTargetHour}
      data-mobile-day-scope={mobileDayScope}
      className={`bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3.5 ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F4F0E8]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
            <Calendar
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: theme.checkboxBg }}
            />
            <span>WEEKLY DAY COLUMNS · TIME-BLOCKING &amp; TASK NOTES</span>
          </span>
          <span
            data-testid="dashboard-day-columns-timeblock-count"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EDF5F0] text-[#266841] border border-[#C6E2D0]"
          >
            <Clock className="w-2.5 h-2.5 shrink-0" />
            <span>
              {totalTimeBlockedCount} time-blocked task
              {totalTimeBlockedCount === 1 ? '' : 's'}
            </span>
          </span>
          <span
            data-testid="dashboard-day-columns-notes-count"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold"
            style={{
              backgroundColor: `${theme.progressFill}22`,
              color: theme.checkboxBg,
            }}
          >
            <FileText className="w-2.5 h-2.5 shrink-0" />
            <span>
              {totalNotesCount} task{totalNotesCount === 1 ? '' : 's'} with
              notes
            </span>
          </span>

          {/* EOD Time Remaining Summary Pill & Cutoff Selector */}
          <div
            data-testid="dashboard-eod-header-summary"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF6F0] border border-[#E5DEC9] text-[9.5px] font-bold text-[#5A534C]"
          >
            <Clock className="w-2.5 h-2.5 text-[#B05C37] shrink-0" />
            <span>
              EOD ({headerEodSummary.targetShortLabel}):{' '}
              <strong className="font-extrabold text-[#2F2B28]">
                {headerEodSummary.shortLabel}
              </strong>
            </span>
            <select
              aria-label="End-of-day cutoff time"
              data-testid="dashboard-eod-target-selector"
              value={eodTargetHour}
              onChange={(e) => setEodTargetHour(Number(e.target.value))}
              className="ml-0.5 bg-white border border-[#DED6C8] rounded px-1 py-0.2 text-[9px] font-bold text-[#2F2B28] focus:outline-none cursor-pointer"
            >
              <option value={17}>5:00 PM</option>
              <option value={18}>6:00 PM</option>
              <option value={21}>9:00 PM</option>
            </select>
          </div>
        </div>

        <span className="text-[11px] font-medium text-[#7A7269]">
          Click any task’s{' '}
          <strong className="font-bold text-[#4A433C]">Time Block</strong> badge
          to assign start &amp; end times, or{' '}
          <strong className="font-bold text-[#4A433C]">Notes</strong> to edit
          notes.
        </span>
      </div>

      {/* Mobile & Tablet Day Filter Bar (< 1280px) for Easy One-Handed Day Selection */}
      <div
        role="group"
        aria-label="Filter day columns on mobile and tablet"
        data-testid="dashboard-mobile-day-switcher"
        className="xl:hidden flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
      >
        <button
          type="button"
          onClick={() => setMobileDayScope('all')}
          aria-pressed={mobileDayScope === 'all'}
          data-testid="dashboard-mobile-day-pill-all"
          className={`min-h-[38px] px-3 py-1 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
            mobileDayScope === 'all'
              ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
              : 'bg-[#FAF7F2] text-[#5A534C] border-[#E2D9CC] hover:bg-[#EFECE6]'
          }`}
        >
          All 7 Days
        </button>
        {columns.map((col) => {
          const isSelected = mobileDayScope === col.id;
          const dayStats = calculateDayProgress(col.tasks);
          return (
            <button
              key={col.id}
              type="button"
              onClick={() =>
                setMobileDayScope((prev) => (prev === col.id ? 'all' : col.id))
              }
              aria-pressed={isSelected}
              data-testid={`dashboard-mobile-day-pill-${col.id}`}
              className={`min-h-[38px] px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#4A433C] border-[#E2D9CC] hover:bg-[#EFECE6]'
              }`}
            >
              <span>{col.dayName.slice(0, 3)}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-[#6E675F]'
                }`}
              >
                {dayStats.fractionLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* 7-Day Columns Grid */}
      <div
        className={`grid grid-cols-1 ${
          displayedColumns.length === 1
            ? 'sm:grid-cols-1'
            : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7'
        } gap-2.5`}
      >
        {displayedColumns.map((col) => {
          const colIdx = columns.findIndex((c) => c.id === col.id);
          const dayProgress = calculateDayProgress(col.tasks);
          const headerBg =
            theme.dayHeaders[colIdx >= 0 ? colIdx : 0] ||
            `${theme.progressFill}26`;
          const activeTasks = col.tasks.filter(
            (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
          );
          const colTimeline = buildDayTimeBlockTimeline(col.tasks);
          const isSelectedForTimeline = activeTimelineColumn?.id === col.id;

          return (
            <div
              key={col.id}
              data-testid={`dashboard-day-column-${col.id}`}
              data-day-id={col.id}
              className={`rounded-xl border bg-[#FAF8F5] flex flex-col overflow-hidden transition-all ${
                isSelectedForTimeline
                  ? 'border-[#C87D55] ring-1 ring-[#C87D55]/30'
                  : 'border-[#ECE7DF]'
              }`}
            >
              {/* Day Column Header */}
              <div
                className="px-2.5 py-2 border-b border-[#E5DEC9]/70 flex items-center justify-between gap-1.5"
                style={{ backgroundColor: headerBg }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedTimelineDayId(col.id)}
                  data-testid={`dashboard-day-column-select-timeline-${col.id}`}
                  title={`View ${col.dayName} in Vertical Timeline`}
                  className="min-w-0 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-[#2F2B28] truncate">
                      {col.dayName}
                    </span>
                    {col.isToday && (
                      <span
                        className="text-[8.5px] font-bold uppercase px-1.5 py-0.2 rounded-full text-white shrink-0"
                        style={{ backgroundColor: theme.checkboxBg }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-[#6E675F] block leading-none mt-0.5">
                    {col.dateLabel} · {colTimeline.totalScheduledFormatted}
                  </span>
                </button>

                <span
                  data-testid={`dashboard-day-column-fraction-${col.id}`}
                  className="px-1.5 py-0.5 rounded-md bg-white/85 border border-[#E5DEC9] text-[10px] font-black text-[#2F2B28] tabular-nums shrink-0"
                >
                  {dayProgress.fractionLabel}
                </span>
              </div>

              {/* Tasks List inside DayColumn */}
              <div className="p-2 flex-1 flex flex-col gap-1.5">
                {activeTasks.length === 0 ? (
                  <p className="text-[10.5px] font-medium text-[#9C948B] italic py-3 text-center my-auto">
                    No active tasks scheduled
                  </p>
                ) : (
                  activeTasks.map((task, idx) => {
                    const noteSummary = formatTaskNoteSummary(task.notes);
                    const timeBlock = resolveDailyTaskTimeBlock(task);
                    const isInlineOpen = inlineEditingTaskId === task.id;
                    const isTimeBlockOpen = timeBlockEditingTaskId === task.id;
                    const catStyle = getCategoryBadgeStyle(
                      task.category,
                      customCategories,
                      task.customColor
                    );
                    const eodInfo = calculateEndOfDayTimeRemaining({
                      now,
                      targetHour: eodTargetHour,
                      completed: task.completed,
                    });
                    const urgencyStyle =
                      eodInfo.urgency !== 'completed'
                        ? EOD_URGENCY_BADGE_STYLES[eodInfo.urgency]
                        : null;

                    return (
                      <div
                        key={task.id}
                        data-testid={`dashboard-day-task-card-${task.id}`}
                        data-has-notes={noteSummary.hasNotes ? 'true' : 'false'}
                        data-time-blocked={
                          timeBlock.isTimeBlocked ? 'true' : 'false'
                        }
                        data-start-time={timeBlock.startTime}
                        data-end-time={timeBlock.endTime}
                        data-completed={task.completed ? 'true' : 'false'}
                        className={`rounded-lg border p-2 transition-colors ${
                          isInlineOpen || isTimeBlockOpen
                            ? 'bg-white border-[#C87D55] shadow-xs'
                            : 'bg-white border-[#ECE7DF] hover:border-[#DED6C8]'
                        }`}
                      >
                        {/* Task Row: Checkbox + Priority + Title + Persistent Notes Trigger */}
                        <div className="flex items-center gap-2 sm:gap-1.5">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={task.completed}
                            aria-label={`Toggle ${col.dayName} task: ${task.text}`}
                            data-testid={`dashboard-day-task-checkbox-${task.id}`}
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const origin =
                                typeof window !== 'undefined' &&
                                window.innerWidth > 0 &&
                                window.innerHeight > 0
                                  ? {
                                      x:
                                        (rect.left + rect.width / 2) /
                                        window.innerWidth,
                                      y:
                                        (rect.top + rect.height / 2) /
                                        window.innerHeight,
                                    }
                                  : undefined;
                              onToggleDailyTask(col.id, task.id, origin);
                            }}
                            className="w-6 h-6 sm:w-4 sm:h-4 rounded-[6px] sm:rounded-[4px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                            style={{
                              backgroundColor: task.completed
                                ? theme.checkboxBg
                                : '#FAF8F5',
                              border: task.completed
                                ? 'none'
                                : '1.5px solid #D7D0C6',
                            }}
                          >
                            {task.completed && (
                              <Check className="w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 text-white stroke-[3]" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onCycleDailyPriority(col.id, task.id)}
                            title={`Priority: ${task.priority} (click to cycle)`}
                            aria-label={`Cycle priority for ${task.text} (currently ${task.priority})`}
                            className="w-3 h-3 sm:w-2 sm:h-2 rounded-full shrink-0 cursor-pointer hover:scale-125 transition-transform"
                            style={{
                              backgroundColor:
                                PRIORITY_DOT_COLORS[task.priority],
                            }}
                          />

                          <input
                            type="text"
                            value={task.text}
                            onChange={(e) =>
                              onUpdateDailyTaskText(
                                col.id,
                                task.id,
                                e.target.value
                              )
                            }
                            aria-label={`${col.dayName} task ${idx + 1} title`}
                            data-testid={`dashboard-day-task-title-${task.id}`}
                            className={`w-full min-w-0 bg-transparent text-xs sm:text-[11px] font-semibold focus:outline-none focus:bg-[#FAF6F0] rounded px-1 py-1 sm:py-0 ${
                              task.completed
                                ? 'line-through text-[#A7A097]'
                                : 'text-[#2F2B28]'
                            }`}
                          />

                          {/* Persistent 'Notes' Icon & Trigger Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenInlineEditor(task)}
                            aria-expanded={isInlineOpen}
                            aria-label={`${
                              noteSummary.hasNotes ? 'Edit notes' : 'Add notes'
                            } for ${task.text}`}
                            data-testid={`dashboard-task-notes-trigger-${task.id}`}
                            data-has-notes={
                              noteSummary.hasNotes ? 'true' : 'false'
                            }
                            title={
                              noteSummary.hasNotes
                                ? `Notes: ${noteSummary.previewText} (click to edit)`
                                : 'Add or edit task-specific notes'
                            }
                            className={`relative inline-flex items-center gap-1 min-h-[34px] sm:min-h-0 px-2.5 py-1 sm:px-1.5 sm:py-0.5 rounded-lg sm:rounded-md text-[11px] sm:text-[9.5px] font-bold border transition-all cursor-pointer shrink-0 ${
                              isInlineOpen || noteSummary.hasNotes
                                ? 'bg-[#F6ECE3] text-[#9A4E28] border-[#E5C5AF] hover:bg-[#EFE0D3]'
                                : 'bg-[#FAF7F2] text-[#6E675F] border-[#E2D9CC] hover:text-[#2F2B28] hover:bg-[#EFECE6]'
                            }`}
                          >
                            <FileText className="w-3 h-3 sm:w-2.5 sm:h-2.5 shrink-0" />
                            <span>Notes</span>
                            {noteSummary.hasNotes && (
                              <span
                                data-testid={`dashboard-task-notes-dot-${task.id}`}
                                className="w-1.5 h-1.5 rounded-full bg-[#C87D55] shrink-0"
                              />
                            )}
                          </button>
                        </div>

                        {/* Sub-row: Time-Block Trigger Badge + Category Tag + EOD Time Remaining */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-1 mt-2 sm:mt-1.5 pl-8 sm:pl-5">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-1">
                            {/* Time-Block Trigger Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenTimeBlockEditor(col.id, task)
                              }
                              aria-expanded={isTimeBlockOpen}
                              aria-label={
                                timeBlock.isTimeBlocked
                                  ? `Edit time block ${timeBlock.formattedRange} for ${task.text}`
                                  : `Assign time block for ${task.text}`
                              }
                              data-testid={`dashboard-task-timeblock-trigger-${task.id}`}
                              title={
                                timeBlock.isTimeBlocked
                                  ? `Scheduled: ${timeBlock.formattedRange} (${timeBlock.formattedDuration}) — Click to change`
                                  : 'Click to assign a start and end time block'
                              }
                              className={`inline-flex items-center gap-1 min-h-[32px] sm:min-h-0 px-2 py-1 sm:px-1.5 sm:py-0.5 rounded-md sm:rounded text-[10px] sm:text-[8.5px] font-bold border leading-none tabular-nums transition-colors cursor-pointer shrink-0 ${
                                isTimeBlockOpen || timeBlock.isTimeBlocked
                                  ? 'bg-[#EDF5F0] text-[#1F5E3B] border-[#B8DEC6] hover:bg-[#E0EFE6]'
                                  : 'bg-[#FAF7F2] text-[#7A7269] border-[#E2D9CC] hover:text-[#2F2B28] hover:bg-[#EFECE6]'
                              }`}
                            >
                              <Clock className="w-3 h-3 sm:w-2.5 sm:h-2.5 shrink-0" />
                              <span>
                                {timeBlock.isTimeBlocked
                                  ? `${timeBlock.startTime}–${timeBlock.endTime} (${timeBlock.formattedDuration})`
                                  : '+ Time Block'}
                              </span>
                            </button>

                            <span
                              className="px-1.5 py-0.2 rounded text-[8.5px] font-bold border leading-none shrink-0"
                              style={{
                                backgroundColor: catStyle.bg,
                                color: catStyle.text,
                                borderColor: catStyle.border,
                              }}
                            >
                              {task.category}
                            </span>

                            {/* Time Remaining before End-of-Day (5pm default) for non-completed tasks */}
                            {!task.completed && urgencyStyle && (
                              <span
                                data-testid={`dashboard-task-time-remaining-${task.id}`}
                                data-remaining-minutes={eodInfo.remainingMinutes}
                                data-urgency={eodInfo.urgency}
                                data-target-hour={eodInfo.targetHour}
                                title={eodInfo.detailedLabel}
                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold border leading-none tabular-nums shrink-0"
                                style={{
                                  backgroundColor: urgencyStyle.bg,
                                  color: urgencyStyle.text,
                                  borderColor: urgencyStyle.border,
                                }}
                              >
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                <span>{eodInfo.shortLabel}</span>
                              </span>
                            )}
                          </div>

                          {noteSummary.hasNotes &&
                            !isInlineOpen &&
                            !isTimeBlockOpen && (
                              <button
                                type="button"
                                onClick={() => handleOpenInlineEditor(task)}
                                data-testid={`dashboard-task-notes-preview-${task.id}`}
                                title="Click to edit note"
                                className="text-[9.5px] font-medium text-[#7A6B5D] hover:text-[#2F2B28] truncate italic text-left cursor-pointer max-w-full"
                              >
                                “{noteSummary.previewText}”
                              </button>
                            )}
                        </div>

                        {/* Inline Time-Block Editor */}
                        {isTimeBlockOpen && (
                          <div
                            data-testid={`dashboard-task-timeblock-editor-${task.id}`}
                            className="mt-2 pt-2 border-t border-[#ECE5DA] space-y-2 bg-[#FAF8F5] -mx-1 px-2 py-1.5 rounded-md"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#266841] inline-flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Assign Time Block</span>
                              </span>
                              {draftPreviewValidation.valid &&
                                draftPreviewValidation.durationMinutes > 0 && (
                                  <span
                                    data-testid={`dashboard-task-timeblock-duration-preview-${task.id}`}
                                    className="text-[9px] font-extrabold text-[#1F5E3B] bg-[#DFECE0] px-1.5 py-0.5 rounded"
                                  >
                                    {draftPreviewValidation.formattedDuration}
                                  </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label
                                  htmlFor={`tb-start-${task.id}`}
                                  className="block text-[8.5px] font-bold uppercase text-[#6E675F] mb-0.5"
                                >
                                  Start
                                </label>
                                <input
                                  id={`tb-start-${task.id}`}
                                  type="time"
                                  value={draftStartTime}
                                  onChange={(e) => {
                                    setDraftStartTime(e.target.value);
                                    setTimeBlockError(null);
                                  }}
                                  aria-label={`Start time for ${task.text}`}
                                  data-testid={`dashboard-task-timeblock-start-${task.id}`}
                                  className="w-full bg-white border border-[#DED8CE] focus:border-[#266841] rounded px-1.5 py-1 text-[10.5px] font-bold text-[#2F2B28] tabular-nums focus:outline-none"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`tb-end-${task.id}`}
                                  className="block text-[8.5px] font-bold uppercase text-[#6E675F] mb-0.5"
                                >
                                  End
                                </label>
                                <input
                                  id={`tb-end-${task.id}`}
                                  type="time"
                                  value={draftEndTime}
                                  onChange={(e) => {
                                    setDraftEndTime(e.target.value);
                                    setTimeBlockError(null);
                                  }}
                                  aria-label={`End time for ${task.text}`}
                                  data-testid={`dashboard-task-timeblock-end-${task.id}`}
                                  className="w-full bg-white border border-[#DED8CE] focus:border-[#266841] rounded px-1.5 py-1 text-[10.5px] font-bold text-[#2F2B28] tabular-nums focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Quick Duration Presets */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[8.5px] font-bold text-[#8A8279] mr-0.5">
                                Duration:
                              </span>
                              {QUICK_DURATION_PRESETS.map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    handleApplyDurationPreset(preset.minutes)
                                  }
                                  data-testid={`dashboard-task-timeblock-preset-${preset.label}-${task.id}`}
                                  className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-white hover:bg-[#EDF5F0] text-[#2F2B28] border border-[#DED8CE] cursor-pointer transition-colors"
                                >
                                  +{preset.label}
                                </button>
                              ))}
                            </div>

                            {timeBlockError && (
                              <p
                                role="alert"
                                data-testid={`dashboard-task-timeblock-error-${task.id}`}
                                className="text-[9.5px] font-bold text-[#A93829]"
                              >
                                {timeBlockError}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveTimeBlock(col.id, task)
                                }
                                data-testid={`dashboard-task-timeblock-save-${task.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9.5px] font-bold bg-[#2F2B28] hover:bg-[#433D38] text-white transition-colors cursor-pointer"
                              >
                                <Save className="w-2.5 h-2.5" />
                                <span>Save Time</span>
                              </button>

                              <div className="flex items-center gap-1">
                                {timeBlock.isTimeBlocked && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleClearTimeBlock(col.id, task)
                                    }
                                    data-testid={`dashboard-task-timeblock-clear-${task.id}`}
                                    title="Remove time block"
                                    className="px-1.5 py-1 rounded text-[9px] font-bold text-[#9B3338] hover:bg-[#F8D5D5]/50 transition-colors cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTimeBlockEditingTaskId(null);
                                    setTimeBlockError(null);
                                  }}
                                  data-testid={`dashboard-task-timeblock-cancel-${task.id}`}
                                  className="px-1.5 py-1 rounded text-[9px] font-semibold text-[#6E675F] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inline Input Field to Quickly Edit & Save Task-Specific Notes */}
                        {isInlineOpen && (
                          <div
                            data-testid={`dashboard-task-notes-inline-editor-${task.id}`}
                            className="mt-2 pt-2 border-t border-[#ECE5DA] space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A6B5D] inline-flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5 text-[#B86B43]" />
                                <span>Task Note</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleOpenNotesModal(col, task)}
                                data-testid={`dashboard-task-notes-open-modal-${task.id}`}
                                title="Open in larger Notes Modal"
                                className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#6E675F] hover:text-[#2F2B28] px-1.5 py-0.5 rounded hover:bg-[#FAF7F2] cursor-pointer"
                              >
                                <Maximize2 className="w-2.5 h-2.5" />
                                <span>Modal</span>
                              </button>
                            </div>

                            <input
                              type="text"
                              value={inlineDraftText}
                              onChange={(e) =>
                                setInlineDraftText(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInlineNote(col.id, task.id);
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setInlineEditingTaskId(null);
                                }
                              }}
                              placeholder="Type a quick note and press Enter or Save..."
                              aria-label={`Edit note for ${task.text}`}
                              data-testid={`dashboard-task-notes-input-${task.id}`}
                              className="w-full bg-[#FAF7F2] border border-[#DED8CE] focus:border-[#C87D55] focus:bg-white focus:outline-none rounded-md px-2 py-1 text-[11px] font-medium text-[#2F2B28] placeholder:text-[#A7A097]"
                            />

                            <div className="flex items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSaveInlineNote(col.id, task.id)
                                }
                                data-testid={`dashboard-task-notes-save-${task.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#2F2B28] hover:bg-[#433D38] text-white transition-colors cursor-pointer"
                              >
                                <Save className="w-2.5 h-2.5" />
                                <span>Save Note</span>
                              </button>

                              <div className="flex items-center gap-1">
                                {noteSummary.hasNotes && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInlineDraftText('');
                                      onUpdateDailyTaskNotes(
                                        col.id,
                                        task.id,
                                        ''
                                      );
                                      setInlineEditingTaskId(null);
                                    }}
                                    data-testid={`dashboard-task-notes-clear-${task.id}`}
                                    title="Clear note"
                                    className="p-1 rounded text-[#9C9288] hover:text-[#9B3338] hover:bg-[#FAF0E6] transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setInlineEditingTaskId(null)}
                                  data-testid={`dashboard-task-notes-cancel-${task.id}`}
                                  className="px-2 py-1 rounded-md text-[10px] font-semibold text-[#6E675F] hover:text-[#2F2B28] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compact Vertical Timeline Strip inside each DayColumn */}
              <div
                data-testid={`dashboard-day-vertical-timeline-${col.id}`}
                className="px-2.5 py-2 bg-[#F5F1EA] border-t border-[#E6DFD3]"
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[#6E655D] inline-flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#B05C37]" />
                    <span>Day Timeline ({colTimeline.totalScheduledBlocks})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTimelineDayId(col.id)}
                    data-testid={`dashboard-day-expand-timeline-${col.id}`}
                    className="text-[8.5px] font-bold text-[#9A4E28] hover:underline cursor-pointer"
                  >
                    {isSelectedForTimeline ? 'Viewing below' : 'Inspect →'}
                  </button>
                </div>

                {colTimeline.scheduledBlocks.length === 0 ? (
                  <p className="text-[9px] text-[#9C948B] italic py-1">
                    No time blocks assigned yet
                  </p>
                ) : (
                  <div className="relative pl-3 border-l-2 border-[#D6CEC2] space-y-1">
                    {colTimeline.scheduledBlocks.map((block) => (
                      <button
                        key={block.taskId}
                        type="button"
                        onClick={() => {
                          const targetTask = col.tasks.find(
                            (t) => t.id === block.taskId
                          );
                          if (targetTask) {
                            handleOpenTimeBlockEditor(col.id, targetTask);
                          }
                        }}
                        data-testid={`dashboard-col-timeline-item-${block.taskId}`}
                        className="w-full text-left relative flex items-center justify-between gap-1 px-1.5 py-1 rounded bg-white/90 hover:bg-white border border-[#E5DEC9] text-[9px] transition-colors cursor-pointer"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full absolute -left-[15px] top-1/2 -translate-y-1/2 ring-2 ring-[#F5F1EA]"
                          style={{
                            backgroundColor: block.completed
                              ? theme.checkboxBg
                              : PRIORITY_DOT_COLORS[block.priority],
                          }}
                        />
                        <span className="font-extrabold text-[#4A433C] tabular-nums shrink-0">
                          {block.startTime}–{block.endTime}
                        </span>
                        <span
                          className={`truncate font-semibold flex-1 ${
                            block.completed
                              ? 'line-through text-[#9C948B]'
                              : 'text-[#2F2B28]'
                          }`}
                        >
                          {block.text}
                        </span>
                        {block.hasOverlap && (
                          <span title="Overlaps with another time block" className="shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 text-[#C85A32]" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Daily Time-Blocking & Vertical Timeline Visualizer */}
      {activeTimelineColumn && (
        <div
          data-testid="daily-timeblock-timeline-panel"
          data-selected-day={activeTimelineColumn.id}
          className="mt-1 rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-3 sm:p-4 space-y-3"
        >
          {/* Studio Header + Day Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EAE3D8]">
            <div>
              <div className="flex items-center gap-1.5">
                <Clock
                  className="w-4 h-4 shrink-0"
                  style={{ color: theme.checkboxBg }}
                />
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#2F2B28]">
                  Daily Time-Blocking &amp; Vertical Timeline —{' '}
                  {activeTimelineColumn.dayName} ({activeTimelineColumn.dateLabel})
                </h3>
              </div>
              <p className="text-[11px] font-medium text-[#6E675F] mt-0.5">
                Assign start &amp; end times on the task list and visualize your
                day’s schedule on the proportional vertical timeline alongside
                it.
              </p>
            </div>

            {/* Day Switcher Pills */}
            <div
              role="tablist"
              aria-label="Select day for vertical timeline"
              className="flex items-center gap-1 overflow-x-auto py-0.5"
            >
              {columns.map((col) => {
                const isSelected = col.id === activeTimelineColumn.id;
                const summary = buildDayTimeBlockTimeline(col.tasks);
                return (
                  <button
                    key={col.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedTimelineDayId(col.id)}
                    data-testid={`timeblock-day-tab-${col.id}`}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                        : 'bg-white text-[#5A534C] border-[#DED6C8] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <span>{col.dayName.slice(0, 3)}</span>
                    <span
                      className={`text-[9px] px-1 rounded tabular-nums ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FAF6F0] text-[#7A7269]'
                      }`}
                    >
                      {summary.totalScheduledBlocks}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side-by-Side Layout: Left = Day Task List with Time Pickers, Right = Vertical Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column (5 cols): Task List with Quick Start/End Time Assignment */}
            <div
              data-testid="timeblock-day-task-list"
              className="lg:col-span-5 bg-white rounded-xl border border-[#ECE7DF] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#F4F0E8]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E675F]">
                  {activeTimelineColumn.dayName} Task List (
                  {
                    activeTimelineColumn.tasks.filter(
                      (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
                    ).length
                  }
                  )
                </span>
                <span
                  data-testid="timeblock-day-total-duration"
                  className="text-[10px] font-extrabold text-[#266841] bg-[#EDF5F0] px-2 py-0.5 rounded-full border border-[#C6E2D0]"
                >
                  Scheduled: {activeDayTimeline.totalScheduledFormatted}
                </span>
              </div>

              {activeTimelineColumn.tasks
                .filter(
                  (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
                )
                .map((task) => {
                  const tb = resolveDailyTaskTimeBlock(task);
                  const isEditingThis = timeBlockEditingTaskId === task.id;
                  const catStyle = getCategoryBadgeStyle(
                    task.category,
                    customCategories,
                    task.customColor
                  );
                  return (
                    <div
                      key={task.id}
                      data-testid={`timeblock-list-task-${task.id}`}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isEditingThis
                          ? 'bg-[#FAF8F5] border-[#266841] ring-1 ring-[#266841]/25'
                          : 'bg-[#FCFBF9] border-[#ECE7DF] hover:border-[#DED6C8]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              onToggleDailyTask(
                                activeTimelineColumn.id,
                                task.id
                              )
                            }
                            aria-label={`Toggle ${task.text}`}
                            className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 cursor-pointer"
                            style={{
                              backgroundColor: task.completed
                                ? theme.checkboxBg
                                : '#FAF8F5',
                              border: task.completed
                                ? 'none'
                                : '1.5px solid #D7D0C6',
                            }}
                          >
                            {task.completed && (
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-bold truncate ${
                              task.completed
                                ? 'line-through text-[#9C948B]'
                                : 'text-[#2F2B28]'
                            }`}
                          >
                            {task.text}
                          </span>
                        </div>

                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none shrink-0"
                          style={{
                            backgroundColor: catStyle.bg,
                            color: catStyle.text,
                            borderColor: catStyle.border,
                          }}
                        >
                          {task.category}
                        </span>
                      </div>

                      {/* Quick Time Assignment Row */}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 pl-6">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#266841] shrink-0" />
                          <span className="text-[10.5px] font-bold text-[#4A433C] tabular-nums">
                            {tb.isTimeBlocked
                              ? `${tb.formattedRange} (${tb.formattedDuration})`
                              : 'Unscheduled'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenTimeBlockEditor(
                              activeTimelineColumn.id,
                              task
                            )
                          }
                          data-testid={`timeblock-list-edit-btn-${task.id}`}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white hover:bg-[#EDF5F0] text-[#266841] border border-[#C6E2D0] cursor-pointer transition-colors"
                        >
                          {isEditingThis
                            ? 'Editing…'
                            : tb.isTimeBlocked
                            ? 'Edit Time'
                            : '+ Assign Time'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Right Column (7 cols): Proportional Vertical Timeline alongside the task list */}
            <div
              data-testid="timeblock-vertical-timeline"
              className="lg:col-span-7 bg-white rounded-xl border border-[#ECE7DF] p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-[#F4F0E8]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6E675F]">
                    Vertical Daily Schedule ({formatTime12Hour(`${String(activeDayTimeline.timelineStartHour).padStart(2, '0')}:00`)} – {formatTime12Hour(`${String(activeDayTimeline.timelineEndHour).padStart(2, '0')}:00`)})
                  </span>
                  {activeDayTimeline.overlapCount > 0 && (
                    <span
                      data-testid="timeblock-timeline-overlap-warning"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#FDF0ED] text-[#A93829] border border-[#EBC2BA]"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>
                        {activeDayTimeline.overlapCount} overlapping blocks
                      </span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-semibold text-[#8A8279]">
                  {activeDayTimeline.completedScheduledBlocks}/
                  {activeDayTimeline.totalScheduledBlocks} blocks completed
                </span>
              </div>

              {/* Proportional Vertical Timeline Canvas */}
              <div
                data-testid="daily-vertical-timeline-canvas"
                className="relative w-full h-[440px] sm:h-[480px] select-none"
              >
                {/* Hour Grid Lines & Labels */}
                {activeDayTimeline.hourTicks.map((tick) => (
                  <div
                    key={tick.hour}
                    style={{ top: `${tick.offsetPercent}%` }}
                    className="absolute left-0 right-0 flex items-center pointer-events-none -translate-y-1/2"
                  >
                    <span className="w-12 sm:w-14 text-[9.5px] font-bold text-[#8A8279] tabular-nums text-right pr-2 shrink-0">
                      {tick.shortLabel}
                    </span>
                    <div className="flex-1 border-t border-dashed border-[#EAE4DC]" />
                  </div>
                ))}

                {/* Scheduled Time-Block Cards */}
                <div className="absolute top-0 bottom-0 left-12 sm:left-14 right-1">
                  {activeDayTimeline.scheduledBlocks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-xs font-medium text-[#8A8279]">
                        No time blocks scheduled for{' '}
                        {activeTimelineColumn.dayName}. Click{' '}
                        <strong>+ Assign Time</strong> on any task to place it on
                        the vertical timeline.
                      </p>
                    </div>
                  ) : (
                    activeDayTimeline.scheduledBlocks.map((block) => {
                      const catStyle = getCategoryBadgeStyle(
                        block.category,
                        customCategories,
                        block.customColor
                      );
                      const widthPercent = 100 / block.totalLanes;
                      const leftPercent = block.laneIndex * widthPercent;
                      const isCompactBlock = block.durationMinutes <= 55;

                      return (
                        <div
                          key={block.taskId}
                          data-testid={`timeblock-timeline-item-${block.taskId}`}
                          data-start-time={block.startTime}
                          data-end-time={block.endTime}
                          data-duration-minutes={block.durationMinutes}
                          data-has-overlap={
                            block.hasOverlap ? 'true' : 'false'
                          }
                          onClick={() => {
                            const targetTask =
                              activeTimelineColumn.tasks.find(
                                (t) => t.id === block.taskId
                              );
                            if (targetTask) {
                              handleOpenTimeBlockEditor(
                                activeTimelineColumn.id,
                                targetTask
                              );
                            }
                          }}
                          style={{
                            top: `${block.topPercent}%`,
                            height: `${block.heightPercent}%`,
                            minHeight: isCompactBlock ? '26px' : '38px',
                            left: `${leftPercent}%`,
                            width: `calc(${widthPercent}% - 4px)`,
                            backgroundColor: block.completed
                              ? '#F3F2EE'
                              : catStyle.bg,
                            borderColor: block.hasOverlap
                              ? '#C85A32'
                              : catStyle.border,
                            color: catStyle.text,
                          }}
                          title={`${block.text} (${block.formattedRange} · ${block.formattedDuration}) — Click to edit time block`}
                          className={`absolute rounded-lg border-l-4 border px-2 shadow-2xs overflow-hidden cursor-pointer transition-all hover:shadow-md hover:z-20 flex ${
                            isCompactBlock
                              ? 'py-0.5 items-center justify-between gap-1.5'
                              : 'py-1 flex-col justify-between'
                          }`}
                        >
                          {isCompactBlock ? (
                            <>
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span
                                  className={`text-[10px] font-extrabold truncate ${
                                    block.completed
                                      ? 'line-through text-[#8A8279]'
                                      : 'text-[#2F2B28]'
                                  }`}
                                >
                                  {block.text}
                                </span>
                                <span className="text-[8.5px] font-bold opacity-85 tabular-nums shrink-0 hidden sm:inline">
                                  · {block.formattedRange}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[8.5px] font-bold opacity-90 tabular-nums sm:hidden">
                                  {block.startTime}–{block.endTime}
                                </span>
                                <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-white/80 text-[#2F2B28] tabular-nums">
                                  {block.formattedDuration}
                                </span>
                                {block.hasOverlap && (
                                  <span
                                    data-testid={`timeblock-overlap-badge-${block.taskId}`}
                                    className="px-1 rounded bg-[#A93829] text-white text-[8px] font-extrabold uppercase"
                                  >
                                    Overlap
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-1 min-w-0">
                                <span
                                  className={`text-[10.5px] font-extrabold truncate ${
                                    block.completed
                                      ? 'line-through text-[#8A8279]'
                                      : 'text-[#2F2B28]'
                                  }`}
                                >
                                  {block.text}
                                </span>
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-white/80 text-[#2F2B28] tabular-nums shrink-0">
                                  {block.formattedDuration}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-1 text-[9px] font-bold opacity-90 tabular-nums">
                                <span>{block.formattedRange}</span>
                                {block.hasOverlap && (
                                  <span
                                    data-testid={`timeblock-overlap-badge-${block.taskId}`}
                                    className="px-1 rounded bg-[#A93829] text-white text-[8px] font-extrabold uppercase"
                                  >
                                    Overlap
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Notes Modal for Multi-Line Editing */}
      {modalTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Edit notes for ${modalTarget.task.text}`}
          data-testid="dashboard-task-notes-modal"
          className="fixed inset-0 z-[105] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setModalTarget(null)}
        >
          <div
            className="w-full max-w-md bg-[#FDFBF7] border border-[#E5DEC9] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-[#ECE5DA]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8279] block">
                  {modalTarget.dayName} ({modalTarget.dateLabel}) · TASK NOTES
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#2F2B28] mt-0.5">
                  {modalTarget.task.text}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                data-testid="dashboard-task-notes-modal-close"
                aria-label="Close task notes modal"
                className="p-1 rounded-full text-[#8A8279] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={5}
              value={modalDraftText}
              onChange={(e) => setModalDraftText(e.target.value)}
              placeholder="Write detailed task notes, context, links, or checklist items..."
              aria-label={`Detailed notes for ${modalTarget.task.text}`}
              data-testid="dashboard-task-notes-modal-textarea"
              className="w-full bg-white border border-[#DED8CE] focus:border-[#C87D55] focus:outline-none rounded-xl p-3 text-xs sm:text-sm text-[#2F2B28] placeholder:text-[#A7A097] resize-y"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setModalDraftText('');
                  onUpdateDailyTaskNotes(
                    modalTarget.dayId,
                    modalTarget.task.id,
                    ''
                  );
                  setModalTarget(null);
                }}
                data-testid="dashboard-task-notes-modal-clear"
                className="px-3 py-1.5 rounded-full text-xs font-bold text-[#9B3338] hover:bg-[#F8D5D5]/50 transition-colors cursor-pointer"
              >
                Clear Note
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#6E675F] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalNote}
                  data-testid="dashboard-task-notes-modal-save"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#2F2B28] hover:bg-[#433D38] text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
