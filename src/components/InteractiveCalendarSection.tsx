import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Check,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Circle,
  Tag,
  Flag,
} from 'lucide-react';
import {
  CalendarTaskFormInput,
  CalendarTaskItem,
  CalendarViewMode,
  CustomCategoryDefinition,
  DEFAULT_CALENDAR_ANCHOR_DATE,
  DayColumn,
  Priority,
  THEMES,
  TaskCategory,
  TaskStatus,
  ThemeId,
  buildCalendarMonthGrid,
  buildCalendarWeekSchedule,
  formatCalendarDateHeading,
  formatCalendarTimeRange,
  getAllCategories,
  getCategoryBadgeStyle,
  getTasksForCalendarDate,
  isValidIsoDateString,
  navigateCalendarDate,
  validateCalendarTaskInput,
} from '../utils/todoLogic';

interface InteractiveCalendarSectionProps {
  columns: DayColumn[];
  activeTheme: ThemeId;
  selectedDate: string;
  customCategories?: CustomCategoryDefinition[];
  onDateChange?: (dateStr: string) => void;
  onToggleDailyTask: (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => void;
  onAddCalendarTask: (input: CalendarTaskFormInput) => {
    success: boolean;
    error?: string;
  };
  onUpdateCalendarTask: (
    taskId: string,
    input: CalendarTaskFormInput
  ) => {
    success: boolean;
    error?: string;
  };
  onDeleteCalendarTask: (taskId: string) => void;
  externalOpenNewTaskTrigger?: number;
}

const STATUS_DISPLAY_META: Record<
  TaskStatus,
  {
    label: string;
    shortLabel: string;
    bg: string;
    text: string;
    border: string;
    dotColor: string;
  }
> = {
  'To Do': {
    label: 'Pending',
    shortLabel: 'Pending',
    bg: '#F4F1EA',
    text: '#6E655C',
    border: '#E2DBD0',
    dotColor: '#9C9288',
  },
  'In Progress': {
    label: 'In Progress',
    shortLabel: 'In Progress',
    bg: '#E3EFFB',
    text: '#2F5C8F',
    border: '#C5DCF2',
    dotColor: '#4A88C7',
  },
  Done: {
    label: 'Completed',
    shortLabel: 'Completed',
    bg: '#DFF2E6',
    text: '#266843',
    border: '#B8DEC6',
    dotColor: '#3D9964',
  },
};

const PRIORITY_DISPLAY_META: Record<
  Priority,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dotColor: string;
  }
> = {
  High: {
    label: 'High',
    bg: '#FCE8E6',
    text: '#A83830',
    border: '#F3C7C3',
    dotColor: '#D9534F',
  },
  Med: {
    label: 'Medium',
    bg: '#FCF1DC',
    text: '#946218',
    border: '#F2DAA8',
    dotColor: '#E09B36',
  },
  Low: {
    label: 'Low',
    bg: '#E4F3E8',
    text: '#2B6E44',
    border: '#C1E2CA',
    dotColor: '#4EA86E',
  },
};

export const InteractiveCalendarSection: React.FC<
  InteractiveCalendarSectionProps
> = ({
  columns,
  activeTheme,
  selectedDate,
  customCategories = [],
  onDateChange,
  onToggleDailyTask,
  onAddCalendarTask,
  onUpdateCalendarTask,
  onDeleteCalendarTask,
  externalOpenNewTaskTrigger,
}) => {
  const theme = THEMES[activeTheme];
  const todayDateStr = DEFAULT_CALENDAR_ANCHOR_DATE; // Canonical "Today" in workspace ('2026-06-11')

  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month');
  const [activeCalendarDate, setActiveCalendarDate] = useState<string>(() =>
    isValidIsoDateString(selectedDate)
      ? selectedDate
      : DEFAULT_CALENDAR_ANCHOR_DATE
  );
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'To Do' | 'In Progress' | 'Done'
  >('ALL');

  // Task Creation / Edit Modal State
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<CalendarTaskItem | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(activeCalendarDate);
  const [formStartTime, setFormStartTime] = useState<string>('09:00');
  const [formEndTime, setFormEndTime] = useState<string>('10:00');
  const [formPriority, setFormPriority] = useState<Priority>('Med');
  const [formStatus, setFormStatus] = useState<TaskStatus>('To Do');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Work');
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    date?: string;
    timeRange?: string;
    duplicate?: string;
  }>({});

  // Delete Confirmation Modal State
  const [taskPendingDelete, setTaskPendingDelete] =
    useState<CalendarTaskItem | null>(null);

  // Action feedback banner
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackBanner({ type, message });
  };

  useEffect(() => {
    if (!feedbackBanner) return;
    const timer = window.setTimeout(() => {
      setFeedbackBanner(null);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, [feedbackBanner]);

  const allCategories = useMemo(
    () => getAllCategories(customCategories),
    [customCategories]
  );

  // Build Month Grid, Week Schedule, and Selected Day Tasks
  const monthGrid = useMemo(
    () =>
      buildCalendarMonthGrid(
        activeCalendarDate,
        todayDateStr,
        columns,
        DEFAULT_CALENDAR_ANCHOR_DATE
      ),
    [activeCalendarDate, todayDateStr, columns]
  );

  const weekSchedule = useMemo(
    () =>
      buildCalendarWeekSchedule(
        activeCalendarDate,
        todayDateStr,
        columns,
        DEFAULT_CALENDAR_ANCHOR_DATE
      ),
    [activeCalendarDate, todayDateStr, columns]
  );

  const selectedDateTasks = useMemo(
    () =>
      getTasksForCalendarDate(
        activeCalendarDate,
        columns,
        DEFAULT_CALENDAR_ANCHOR_DATE
      ),
    [activeCalendarDate, columns]
  );

  const filteredSelectedDateTasks = useMemo(() => {
    if (statusFilter === 'ALL') return selectedDateTasks;
    return selectedDateTasks.filter((t) =>
      statusFilter === 'Done'
        ? t.completed || t.status === 'Done'
        : !t.completed && t.status === statusFilter
    );
  }, [selectedDateTasks, statusFilter]);

  const selectedDateHeading = useMemo(
    () => formatCalendarDateHeading(activeCalendarDate),
    [activeCalendarDate]
  );

  const openCreateTaskModal = (prefillDateStr?: string) => {
    const targetDate =
      prefillDateStr && isValidIsoDateString(prefillDateStr)
        ? prefillDateStr
        : activeCalendarDate;
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate(targetDate);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormPriority('Med');
    setFormStatus('To Do');
    setFormCategory('Work');
    setFormErrors({});
    setTaskModalOpen(true);
  };

  useEffect(() => {
    if (externalOpenNewTaskTrigger && externalOpenNewTaskTrigger > 0) {
      openCreateTaskModal(activeCalendarDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalOpenNewTaskTrigger]);

  const openEditTaskModal = (task: CalendarTaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormDate(task.date);
    setFormStartTime(task.startTime || '');
    setFormEndTime(task.endTime || '');
    setFormPriority(task.priority);
    setFormStatus(task.completed ? 'Done' : task.status);
    setFormCategory(task.category || 'Work');
    setFormErrors({});
    setTaskModalOpen(true);
  };

  const handleSelectDate = (dateStr: string) => {
    if (!isValidIsoDateString(dateStr)) return;
    setActiveCalendarDate(dateStr);
    onDateChange?.(dateStr);
  };

  const handleNavigatePeriod = (direction: 'prev' | 'next') => {
    const nextDate = navigateCalendarDate(
      activeCalendarDate,
      calendarView,
      direction
    );
    setActiveCalendarDate(nextDate);
    onDateChange?.(nextDate);
  };

  const handleJumpToToday = () => {
    setActiveCalendarDate(todayDateStr);
    onDateChange?.(todayDateStr);
  };

  const handleSubmitTaskForm = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CalendarTaskFormInput = {
      title: formTitle,
      description: formDescription,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      priority: formPriority,
      status: formStatus,
      category: formCategory,
    };

    const localValidation = validateCalendarTaskInput(
      payload,
      [],
      editingTask?.id
    );
    if (!localValidation.valid) {
      setFormErrors(localValidation.errors);
      return;
    }

    if (editingTask) {
      const res = onUpdateCalendarTask(editingTask.id, payload);
      if (!res.success) {
        setFormErrors({ duplicate: res.error || 'Could not update task.' });
        return;
      }
      setActiveCalendarDate(formDate);
      setTaskModalOpen(false);
      setEditingTask(null);
      showFeedback(`Updated task "${formTitle.trim()}" for ${formDate}`);
    } else {
      const res = onAddCalendarTask(payload);
      if (!res.success) {
        setFormErrors({ duplicate: res.error || 'Could not create task.' });
        return;
      }
      setActiveCalendarDate(formDate);
      setTaskModalOpen(false);
      showFeedback(`Created task "${formTitle.trim()}" on ${formDate}`);
    }
  };

  const handleQuickStatusUpdate = (
    task: CalendarTaskItem,
    nextStatus: TaskStatus
  ) => {
    onUpdateCalendarTask(task.id, {
      title: task.title,
      description: task.description,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      priority: task.priority,
      status: nextStatus,
      category: task.category,
    });
    showFeedback(
      `"${task.title}" marked as ${STATUS_DISPLAY_META[nextStatus].label}`,
      'info'
    );
  };

  const handleQuickPriorityUpdate = (
    task: CalendarTaskItem,
    nextPriority: Priority
  ) => {
    onUpdateCalendarTask(task.id, {
      title: task.title,
      description: task.description,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      priority: nextPriority,
      status: task.completed ? 'Done' : task.status,
      category: task.category,
    });
    showFeedback(
      `"${task.title}" priority set to ${PRIORITY_DISPLAY_META[nextPriority].label}`,
      'info'
    );
  };

  const handleConfirmDeleteTask = () => {
    if (!taskPendingDelete) return;
    const deletedTitle = taskPendingDelete.title;
    onDeleteCalendarTask(taskPendingDelete.id);
    setTaskPendingDelete(null);
    showFeedback(`Deleted task "${deletedTitle}"`, 'info');
  };

  // Period header label based on view mode
  const periodTitleLabel = useMemo(() => {
    if (calendarView === 'month') {
      return monthGrid.monthLabel;
    }
    if (calendarView === 'week') {
      const first = weekSchedule[0];
      const last = weekSchedule[6];
      if (!first || !last) return selectedDateHeading.monthYearLabel;
      return `${first.dateShortLabel} – ${last.dateShortLabel}, ${last.year}`;
    }
    return selectedDateHeading.fullLabel;
  }, [calendarView, monthGrid.monthLabel, weekSchedule, selectedDateHeading]);

  return (
    <div
      data-testid="interactive-calendar-section"
      className="bg-white rounded-2xl border border-[#E5DEC9] shadow-xs overflow-hidden"
    >
      {/* Top Calendar Header & Action Bar */}
      <div className="px-3.5 sm:px-5 py-3.5 bg-[#FDFBF7] border-b border-[#ECE7DF] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: theme.checkboxBg }}
            >
              <CalendarIcon className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-[#2F2B28] tracking-tight">
                  Interactive Task Calendar &amp; Personal Planner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EFE8] text-[#7A7269] border border-[#E5DEC9]">
                  Auto-Saved
                </span>
              </div>
              <p className="text-[11px] text-[#7A7269] truncate">
                Navigate by Month, Week, or Day · Click any date to inspect or schedule tasks
              </p>
            </div>
          </div>

          {/* Mobile "+ Add New Task" CTA */}
          <button
            type="button"
            onClick={() => openCreateTaskModal(activeCalendarDate)}
            data-testid="calendar-add-new-task-btn-mobile"
            data-custom-btn="primary"
            className="lg:hidden inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs cursor-pointer transition-transform active:scale-95 shrink-0"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Task</span>
          </button>
        </div>

        {/* Right Controls: View Switcher + Period Navigation + Desktop "+ Add New Task" */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-2.5">
          {/* Calendar View Mode Switcher (Monthly / Weekly / Daily) */}
          <div
            role="group"
            aria-label="Calendar view mode"
            className="inline-flex items-center bg-[#F2EFE9] p-1 rounded-xl border border-[#E4DDD3]"
          >
            {(
              [
                { id: 'month', label: 'Monthly' },
                { id: 'week', label: 'Weekly' },
                { id: 'day', label: 'Daily' },
              ] as const
            ).map((mode) => {
              const active = calendarView === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCalendarView(mode.id)}
                  data-testid={`calendar-view-${mode.id}`}
                  data-custom-btn={active ? 'primary' : undefined}
                  aria-pressed={active}
                  className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2F2B28] text-white shadow-2xs'
                      : 'text-[#6E665E] hover:text-[#2F2B28]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Date Navigation Bar (Prev / Today / Next + Date Picker) */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 py-1 rounded-xl border border-[#E5DEC9]">
            <button
              type="button"
              onClick={() => handleNavigatePeriod('prev')}
              data-testid="calendar-nav-prev"
              aria-label={`Previous ${calendarView}`}
              title={`Previous ${calendarView}`}
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-[#4B453F] hover:bg-[#EFEBE4] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span
              data-testid="calendar-current-period-label"
              className="text-xs sm:text-sm font-extrabold text-[#2F2B28] px-1.5 min-w-[125px] text-center tabular-nums"
            >
              {periodTitleLabel}
            </span>

            <button
              type="button"
              onClick={() => handleNavigatePeriod('next')}
              data-testid="calendar-nav-next"
              aria-label={`Next ${calendarView}`}
              title={`Next ${calendarView}`}
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-[#4B453F] hover:bg-[#EFEBE4] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleJumpToToday}
              data-testid="calendar-nav-today"
              data-custom-btn={
                activeCalendarDate === todayDateStr ? 'primary' : 'secondary'
              }
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors cursor-pointer ${
                activeCalendarDate === todayDateStr
                  ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                  : 'bg-white text-[#4B453F] border-[#DFD8CE] hover:bg-[#F3EFE9]'
              }`}
            >
              Today
            </button>

            <input
              type="date"
              aria-label="Jump to calendar date"
              data-testid="calendar-date-jump-input"
              value={activeCalendarDate}
              onChange={(e) => handleSelectDate(e.target.value)}
              className="hidden sm:block text-[11px] font-bold text-[#4B453F] bg-white border border-[#DFD8CE] rounded-lg px-2 py-1 min-h-[34px] cursor-pointer focus:outline-none"
            />
          </div>

          {/* Primary Desktop "+ Add New Task" Button */}
          <button
            type="button"
            onClick={() => openCreateTaskModal(activeCalendarDate)}
            data-testid="calendar-add-new-task-btn"
            data-custom-btn="primary"
            className="hidden lg:inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer active:scale-95 shrink-0"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add New Task</span>
          </button>
        </div>
      </div>

      {/* Status Legend & Live Feedback Banner */}
      <div className="px-3.5 sm:px-5 py-2 bg-[#FAF8F5] border-b border-[#ECE7DF] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-[#6E665E]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: STATUS_DISPLAY_META['To Do'].dotColor }}
            />
            <span>Pending</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: STATUS_DISPLAY_META['In Progress'].dotColor,
              }}
            />
            <span>In Progress</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: STATUS_DISPLAY_META.Done.dotColor }}
            />
            <span>Completed</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#B86B43]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87D55] inline-block ring-2 ring-[#C87D55]/30" />
            <span>Current Date (Jun 11)</span>
          </span>
        </div>

        {feedbackBanner && (
          <div
            role="status"
            data-testid="calendar-feedback-banner"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F2B28] text-[#FAF6F0] text-[11px] font-bold shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#84CA9E] shrink-0" />
            <span>{feedbackBanner.message}</span>
          </div>
        )}
      </div>

      {/* Main Responsive Split Layout: Calendar View (Left/Top) + Selected Date Task Manager (Right/Bottom) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-[#ECE7DF]">
        {/* Left Column: Active Calendar View (Monthly / Weekly / Daily) */}
        <div className="xl:col-span-7 2xl:col-span-8 p-3 sm:p-4 bg-white">
          {calendarView === 'month' && (
            <div data-testid="calendar-month-view">
              {/* Weekday Header Row (Mon..Sun) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (dayLabel, idx) => (
                    <div
                      key={dayLabel}
                      data-day-header="true"
                      className="py-1.5 px-1 text-center rounded-lg text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#332C27]"
                      style={{ backgroundColor: theme.dayHeaders[idx] }}
                    >
                      {dayLabel}
                    </div>
                  )
                )}
              </div>

              {/* 42-Cell Month Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {monthGrid.cells.map((cell) => {
                  const isSelected = cell.dateStr === activeCalendarDate;
                  const hasTasks = cell.tasks.length > 0;

                  return (
                    <div
                      key={cell.dateStr}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectDate(cell.dateStr)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectDate(cell.dateStr);
                        }
                      }}
                      data-testid={`calendar-month-cell-${cell.dateStr}`}
                      data-is-today={cell.isToday ? 'true' : 'false'}
                      data-is-selected={isSelected ? 'true' : 'false'}
                      aria-label={`${cell.weekdayFull}, ${cell.dateShortLabel}, ${cell.tasks.length} tasks`}
                      className={`min-h-[68px] sm:min-h-[96px] p-1.5 sm:p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-[#FAF3EB] border-[#C87D55] ring-2 ring-[#C87D55]/40 shadow-xs'
                          : cell.isToday
                          ? 'bg-[#FFFDF9] border-[#2F2B28] ring-1 ring-[#2F2B28]/30'
                          : cell.isCurrentMonth
                          ? 'bg-white border-[#E8E2D8] hover:bg-[#FAF7F2]'
                          : 'bg-[#FAF8F5] border-[#F0ECE4] opacity-60 hover:opacity-90'
                      }`}
                    >
                      {/* Top row: Day number + Today pill + Quick Add icon on desktop */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold tabular-nums ${
                            cell.isToday
                              ? 'bg-[#C87D55] text-white'
                              : isSelected
                              ? 'bg-[#2F2B28] text-white'
                              : cell.isCurrentMonth
                              ? 'text-[#2F2B28]'
                              : 'text-[#9C948B]'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.isToday && (
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-[#F5DFD0] text-[#9A4E28]">
                            Today
                          </span>
                        )}

                        {hasTasks && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#EFECE6] text-[#5A534C] tabular-nums">
                            {cell.statusCounts.completed}/{cell.statusCounts.total}
                          </span>
                        )}
                      </div>

                      {/* Desktop Task Preview Chips (up to 2 tasks shown inline + overflow count) */}
                      <div className="hidden sm:flex flex-col gap-1 mt-1.5 w-full overflow-hidden">
                        {cell.tasks.slice(0, 2).map((t) => {
                          const statusMeta =
                            STATUS_DISPLAY_META[
                              t.completed ? 'Done' : t.status
                            ];
                          return (
                            <div
                              key={t.id}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border"
                              style={{
                                backgroundColor: statusMeta.bg,
                                color: statusMeta.text,
                                borderColor: statusMeta.border,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: statusMeta.dotColor }}
                              />
                              <span
                                className={`truncate ${
                                  t.completed ? 'line-through opacity-75' : ''
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                          );
                        })}
                        {cell.tasks.length > 2 && (
                          <span className="text-[9px] font-bold text-[#7A7269] pl-1">
                            +{cell.tasks.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Mobile Compact Status Dots (< 640px) */}
                      {hasTasks && (
                        <div className="flex sm:hidden items-center gap-1 mt-1 flex-wrap">
                          {cell.tasks.slice(0, 4).map((t) => {
                            const statusMeta =
                              STATUS_DISPLAY_META[
                                t.completed ? 'Done' : t.status
                              ];
                            return (
                              <span
                                key={t.id}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: statusMeta.dotColor }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {calendarView === 'week' && (
            <div data-testid="calendar-week-view" className="space-y-2.5">
              {weekSchedule.map((dayCell, idx) => {
                const isSelected = dayCell.dateStr === activeCalendarDate;
                return (
                  <div
                    key={dayCell.dateStr}
                    data-testid={`calendar-week-day-${dayCell.dateStr}`}
                    onClick={() => handleSelectDate(dayCell.dateStr)}
                    className={`rounded-xl border transition-all overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-[#C87D55] ring-2 ring-[#C87D55]/30 bg-[#FFFDF9]'
                        : 'border-[#E5DEC9] bg-white hover:border-[#D5CBB8]'
                    }`}
                  >
                    <div
                      data-day-header="true"
                      className="px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9]"
                      style={{ backgroundColor: theme.dayHeaders[idx] }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-extrabold uppercase text-[#332C27]">
                          {dayCell.weekdayFull}
                        </span>
                        <span className="text-xs font-bold text-[#4D433B]">
                          {dayCell.dateShortLabel}
                        </span>
                        {dayCell.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#2F2B28] text-white">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#332C27] tabular-nums">
                          {dayCell.statusCounts.completed}/
                          {dayCell.statusCounts.total} done
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDate(dayCell.dateStr);
                            openCreateTaskModal(dayCell.dateStr);
                          }}
                          data-testid={`calendar-week-add-btn-${dayCell.dateStr}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/85 hover:bg-white text-[#2F2B28] text-[10px] font-extrabold shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>

                    {dayCell.tasks.length === 0 ? (
                      <div className="px-3.5 py-3 text-xs text-[#8A8279] italic flex items-center justify-between">
                        <span>No tasks scheduled for {dayCell.weekdayFull}.</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDate(dayCell.dateStr);
                            openCreateTaskModal(dayCell.dateStr);
                          }}
                          className="text-[11px] font-bold text-[#B86B43] hover:underline cursor-pointer"
                        >
                          + Schedule task
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F2EFE9]">
                        {dayCell.tasks.map((task) => {
                          const statusMeta =
                            STATUS_DISPLAY_META[
                              task.completed ? 'Done' : task.status
                            ];
                          const priorityMeta =
                            PRIORITY_DISPLAY_META[task.priority];
                          return (
                            <div
                              key={task.id}
                              className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-[#FAF7F2]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={task.completed}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleDailyTask(task.dayColumnId, task.id);
                                  }}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
                                    task.completed
                                      ? 'text-white border-transparent'
                                      : 'bg-white border-[#C9C1B6]'
                                  }`}
                                  style={{
                                    backgroundColor: task.completed
                                      ? theme.checkboxBg
                                      : undefined,
                                  }}
                                >
                                  {task.completed && (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      task.completed
                                        ? 'line-through text-[#9C948B]'
                                        : 'text-[#2F2B28]'
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#7A7269]">
                                    <span className="inline-flex items-center gap-1 font-semibold">
                                      <Clock className="w-3 h-3" />
                                      {formatCalendarTimeRange(
                                        task.startTime,
                                        task.endTime
                                      )}
                                    </span>
                                    {task.description && (
                                      <span className="truncate max-w-[220px]">
                                        · {task.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                  style={{
                                    backgroundColor: priorityMeta.bg,
                                    color: priorityMeta.text,
                                    borderColor: priorityMeta.border,
                                  }}
                                >
                                  {priorityMeta.label}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                  style={{
                                    backgroundColor: statusMeta.bg,
                                    color: statusMeta.text,
                                    borderColor: statusMeta.border,
                                  }}
                                >
                                  {statusMeta.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditTaskModal(task);
                                  }}
                                  aria-label={`Edit ${task.title}`}
                                  className="p-1.5 rounded-lg text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTaskPendingDelete(task);
                                  }}
                                  aria-label={`Delete ${task.title}`}
                                  className="p-1.5 rounded-lg text-[#A83830] hover:bg-[#FCE8E6] cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {calendarView === 'day' && (
            <div data-testid="calendar-day-view" className="space-y-3">
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#B86B43]">
                      Daily Schedule View
                    </span>
                    {activeCalendarDate === todayDateStr && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2F2B28] text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-[#2F2B28] mt-0.5">
                    {selectedDateHeading.fullLabel}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => openCreateTaskModal(activeCalendarDate)}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs cursor-pointer"
                  style={{ backgroundColor: theme.checkboxBg }}
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Task to {selectedDateHeading.shortLabel}</span>
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[#DFD8CE] text-center space-y-2.5 bg-[#FDFBF7]">
                  <CalendarIcon className="w-8 h-8 text-[#B5ADA3] mx-auto" />
                  <p className="text-sm font-bold text-[#4B453F]">
                    No tasks scheduled for {selectedDateHeading.fullLabel}
                  </p>
                  <p className="text-xs text-[#8A8279] max-w-md mx-auto">
                    Click &ldquo;+ Add New Task&rdquo; to schedule a personal task with start/end times, priority, and category for this date.
                  </p>
                  <button
                    type="button"
                    onClick={() => openCreateTaskModal(activeCalendarDate)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs cursor-pointer"
                    style={{ backgroundColor: theme.checkboxBg }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create First Task for This Day</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateTasks.map((task) => {
                    const statusMeta =
                      STATUS_DISPLAY_META[
                        task.completed ? 'Done' : task.status
                      ];
                    const priorityMeta = PRIORITY_DISPLAY_META[task.priority];
                    const catStyle = getCategoryBadgeStyle(
                      task.category,
                      customCategories,
                      task.customColor
                    );
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#FDFBF7] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={task.completed}
                            onClick={() =>
                              onToggleDailyTask(task.dayColumnId, task.id)
                            }
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
                              task.completed
                                ? 'text-white border-transparent'
                                : 'bg-white border-[#C9C1B6]'
                            }`}
                            style={{
                              backgroundColor: task.completed
                                ? theme.checkboxBg
                                : undefined,
                            }}
                          >
                            {task.completed && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3EFE9] text-[#5A534C] text-[11px] font-extrabold tabular-nums">
                                <Clock className="w-3 h-3" />
                                {formatCalendarTimeRange(
                                  task.startTime,
                                  task.endTime
                                )}
                              </span>
                              <span
                                data-category-badge={task.category}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                                style={{
                                  backgroundColor: catStyle.bg,
                                  color: catStyle.text,
                                  borderColor: catStyle.border,
                                }}
                              >
                                {task.category}
                              </span>
                            </div>

                            <p
                              className={`text-sm font-extrabold ${
                                task.completed
                                  ? 'line-through text-[#9C948B]'
                                  : 'text-[#2F2B28]'
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.description && (
                              <p className="text-xs text-[#6E665E] leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-extrabold border"
                            style={{
                              backgroundColor: priorityMeta.bg,
                              color: priorityMeta.text,
                              borderColor: priorityMeta.border,
                            }}
                          >
                            {priorityMeta.label} Priority
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-extrabold border"
                            style={{
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.text,
                              borderColor: statusMeta.border,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditTaskModal(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DFD8CE] bg-white hover:bg-[#F3EFE9] text-xs font-bold text-[#2F2B28] cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskPendingDelete(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#F3C7C3] bg-[#FCE8E6] hover:bg-[#F9D6D2] text-xs font-bold text-[#A83830] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Date Schedule & Personal Task Management Inspector */}
        <div
          data-testid="calendar-selected-date-panel"
          className="xl:col-span-5 2xl:col-span-4 p-3.5 sm:p-4 bg-[#FAF7F2] flex flex-col justify-between"
        >
          <div className="space-y-3">
            {/* Selected Date Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E5DEC9]">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8279]">
                    Selected Date Tasks
                  </span>
                  {activeCalendarDate === todayDateStr && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#C87D55] text-white">
                      Today
                    </span>
                  )}
                </div>
                <h4
                  data-testid="calendar-selected-date-heading"
                  className="text-sm sm:text-base font-extrabold text-[#2F2B28] mt-0.5"
                >
                  {selectedDateHeading.fullLabel}
                </h4>
                <p className="text-[11px] font-semibold text-[#7A7269]">
                  {selectedDateTasks.length}{' '}
                  {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled ·{' '}
                  {selectedDateTasks.filter((t) => t.completed).length} completed
                </p>
              </div>

              <button
                type="button"
                onClick={() => openCreateTaskModal(activeCalendarDate)}
                data-testid="selected-date-add-task-btn"
                className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold text-white shadow-2xs cursor-pointer shrink-0"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'ALL', label: `All (${selectedDateTasks.length})` },
                  {
                    id: 'To Do',
                    label: `Pending (${
                      selectedDateTasks.filter(
                        (t) => !t.completed && t.status === 'To Do'
                      ).length
                    })`,
                  },
                  {
                    id: 'In Progress',
                    label: `In Progress (${
                      selectedDateTasks.filter(
                        (t) => !t.completed && t.status === 'In Progress'
                      ).length
                    })`,
                  },
                  {
                    id: 'Done',
                    label: `Completed (${
                      selectedDateTasks.filter(
                        (t) => t.completed || t.status === 'Done'
                      ).length
                    })`,
                  },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                        : 'bg-white text-[#6E665E] border-[#E4DDD3] hover:text-[#2F2B28]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Task List for Selected Date */}
            {filteredSelectedDateTasks.length === 0 ? (
              <div
                data-testid="calendar-selected-date-empty"
                className="p-6 rounded-xl bg-white border border-dashed border-[#DFD8CE] text-center space-y-2"
              >
                <p className="text-xs font-extrabold text-[#4B453F]">
                  {selectedDateTasks.length === 0
                    ? `No tasks scheduled for ${selectedDateHeading.shortLabel}`
                    : 'No tasks match the selected status filter'}
                </p>
                <p className="text-[11px] text-[#8A8279]">
                  {selectedDateTasks.length === 0
                    ? 'Create a new personal task for this date using the button below.'
                    : 'Switch filter back to All or add a new task.'}
                </p>
                <button
                  type="button"
                  onClick={() => openCreateTaskModal(activeCalendarDate)}
                  className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-2xs cursor-pointer"
                  style={{ backgroundColor: theme.checkboxBg }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Task for {selectedDateHeading.shortLabel}</span>
                </button>
              </div>
            ) : (
              <div
                data-testid="calendar-selected-date-task-list"
                className="space-y-2.5 max-h-[520px] overflow-y-auto pr-0.5"
              >
                {filteredSelectedDateTasks.map((task) => {
                  const effectiveStatus: TaskStatus = task.completed
                    ? 'Done'
                    : task.status;
                  const statusMeta = STATUS_DISPLAY_META[effectiveStatus];
                  const priorityMeta = PRIORITY_DISPLAY_META[task.priority];
                  const catStyle = getCategoryBadgeStyle(
                    task.category,
                    customCategories,
                    task.customColor
                  );

                  return (
                    <div
                      key={task.id}
                      data-testid={`calendar-task-card-${task.id}`}
                      className="p-3 rounded-xl bg-white border border-[#E5DEC9] shadow-2xs space-y-2 transition-all hover:border-[#D2C7B8]"
                    >
                      {/* Top Row: Checkbox + Title + Edit / Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={task.completed}
                            aria-label={`Mark "${task.title}" as ${
                              task.completed ? 'incomplete' : 'completed'
                            }`}
                            data-testid={`calendar-task-toggle-${task.id}`}
                            onClick={() =>
                              onToggleDailyTask(task.dayColumnId, task.id)
                            }
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
                              task.completed
                                ? 'text-white border-transparent'
                                : 'bg-white border-[#C9C1B6]'
                            }`}
                            style={{
                              backgroundColor: task.completed
                                ? theme.checkboxBg
                                : undefined,
                            }}
                          >
                            {task.completed && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              data-testid={`calendar-task-title-${task.id}`}
                              className={`text-xs sm:text-sm font-extrabold break-words ${
                                task.completed
                                  ? 'line-through text-[#9C948B]'
                                  : 'text-[#2F2B28]'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p
                                data-testid={`calendar-task-desc-${task.id}`}
                                className="text-[11px] text-[#6E665E] mt-0.5 leading-snug break-words"
                              >
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditTaskModal(task)}
                            data-testid={`calendar-task-edit-btn-${task.id}`}
                            aria-label={`Edit task ${task.title}`}
                            title="Edit task details, date, time, priority, or status"
                            className="min-w-[32px] min-h-[32px] px-2 rounded-lg border border-[#E5DEC9] bg-[#FAF7F2] hover:bg-[#EFECE6] text-[#4B453F] inline-flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskPendingDelete(task)}
                            data-testid={`calendar-task-delete-btn-${task.id}`}
                            aria-label={`Delete task ${task.title}`}
                            title="Delete task"
                            className="min-w-[32px] min-h-[32px] px-2 rounded-lg border border-[#F3C7C3] bg-[#FCE8E6] hover:bg-[#F8D2CE] text-[#A83830] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Time Window + Category + Quick Status & Priority Selectors */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-[#F4F0E8]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F1EA] text-[#5A534C] text-[10px] font-bold tabular-nums">
                            <Clock className="w-2.5 h-2.5" />
                            {formatCalendarTimeRange(
                              task.startTime,
                              task.endTime
                            )}
                          </span>

                          <span
                            data-category-badge={task.category}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{
                              backgroundColor: catStyle.bg,
                              color: catStyle.text,
                              borderColor: catStyle.border,
                            }}
                          >
                            {task.category}
                          </span>
                        </div>

                        {/* Interactive Priority & Status Quick-Selectors */}
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`Priority for ${task.title}`}
                            data-testid={`calendar-task-priority-select-${task.id}`}
                            value={task.priority}
                            onChange={(e) =>
                              handleQuickPriorityUpdate(
                                task,
                                e.target.value as Priority
                              )
                            }
                            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer focus:outline-none"
                            style={{
                              backgroundColor: priorityMeta.bg,
                              color: priorityMeta.text,
                              borderColor: priorityMeta.border,
                            }}
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Med">Medium Priority</option>
                            <option value="High">High Priority</option>
                          </select>

                          <select
                            aria-label={`Status for ${task.title}`}
                            data-testid={`calendar-task-status-select-${task.id}`}
                            value={effectiveStatus}
                            onChange={(e) =>
                              handleQuickStatusUpdate(
                                task,
                                e.target.value as TaskStatus
                              )
                            }
                            className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer focus:outline-none"
                            style={{
                              backgroundColor: statusMeta.bg,
                              color: statusMeta.text,
                              borderColor: statusMeta.border,
                            }}
                          >
                            <option value="To Do">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Summary Bar inside Selected Date Panel */}
          <div className="mt-4 pt-2.5 border-t border-[#E5DEC9] flex items-center justify-between text-[11px] text-[#7A7269]">
            <span>All changes saved automatically</span>
            <button
              type="button"
              onClick={() => openCreateTaskModal(activeCalendarDate)}
              className="font-extrabold text-[#B86B43] hover:underline cursor-pointer"
            >
              + New Task on {selectedDateHeading.shortLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Personal Task Modal */}
      {taskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-task-modal-title"
          data-testid="calendar-task-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setTaskModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#FDFBF7] border border-[#DFD8CE] shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-5 py-3.5 bg-[#FAF6F0] border-b border-[#E5DEC9] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.checkboxBg }}
                >
                  {editingTask ? (
                    <Edit3 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3
                    id="calendar-task-modal-title"
                    className="text-sm sm:text-base font-extrabold text-[#2F2B28]"
                  >
                    {editingTask ? 'Edit Scheduled Task' : 'Add New Personal Task'}
                  </h3>
                  <p className="text-[11px] text-[#7A7269]">
                    {editingTask
                      ? 'Update task details, date, time window, priority, or status'
                      : `Schedule a task on your calendar (${formDate})`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                aria-label="Close task form modal"
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-[#6E665E] hover:bg-[#EFECE6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmitTaskForm}
              className="p-4 sm:p-5 space-y-3.5 overflow-y-auto"
            >
              {(formErrors.title ||
                formErrors.date ||
                formErrors.timeRange ||
                formErrors.duplicate) && (
                <div
                  role="alert"
                  data-testid="calendar-form-error"
                  className="p-3 rounded-xl bg-[#FCE8E6] border border-[#F3C7C3] text-xs font-bold text-[#A83830] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {formErrors.title && <p>{formErrors.title}</p>}
                    {formErrors.date && <p>{formErrors.date}</p>}
                    {formErrors.timeRange && <p>{formErrors.timeRange}</p>}
                    {formErrors.duplicate && <p>{formErrors.duplicate}</p>}
                  </div>
                </div>
              )}

              {/* Task Title (Required) */}
              <div>
                <label
                  htmlFor="calendar-form-title"
                  className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                >
                  Task Title <span className="text-[#C84B31]">*</span>
                </label>
                <input
                  id="calendar-form-title"
                  type="text"
                  data-testid="calendar-form-title-input"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (formErrors.title || formErrors.duplicate) {
                      setFormErrors((prev) => ({
                        ...prev,
                        title: undefined,
                        duplicate: undefined,
                      }));
                    }
                  }}
                  placeholder="e.g., Client design review, Dentist appointment, Gym session"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD8CE] text-xs sm:text-sm font-semibold text-[#2F2B28] placeholder:text-[#B0A89E] focus:outline-none focus:border-[#C87D55]"
                  autoFocus
                />
              </div>

              {/* Description / Notes (Optional) */}
              <div>
                <label
                  htmlFor="calendar-form-description"
                  className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                >
                  Description <span className="text-[#8A8279] font-normal">(optional)</span>
                </label>
                <textarea
                  id="calendar-form-description"
                  rows={2}
                  data-testid="calendar-form-description-input"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Add agenda notes, location, preparation links, or reminders..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DFD8CE] text-xs font-medium text-[#2F2B28] placeholder:text-[#B0A89E] focus:outline-none focus:border-[#C87D55]"
                />
              </div>

              {/* Date (Required) + Start Time & End Time (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="calendar-form-date"
                    className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                  >
                    Date <span className="text-[#C84B31]">*</span>
                  </label>
                  <input
                    id="calendar-form-date"
                    type="date"
                    data-testid="calendar-form-date-input"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (formErrors.date) {
                        setFormErrors((prev) => ({ ...prev, date: undefined }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD8CE] text-xs font-bold text-[#2F2B28] focus:outline-none focus:border-[#C87D55]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calendar-form-start-time"
                    className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                  >
                    Start Time <span className="text-[#8A8279] font-normal">(opt)</span>
                  </label>
                  <input
                    id="calendar-form-start-time"
                    type="time"
                    data-testid="calendar-form-start-time-input"
                    value={formStartTime}
                    onChange={(e) => {
                      setFormStartTime(e.target.value);
                      if (formErrors.timeRange) {
                        setFormErrors((prev) => ({
                          ...prev,
                          timeRange: undefined,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD8CE] text-xs font-bold text-[#2F2B28] focus:outline-none focus:border-[#C87D55]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calendar-form-end-time"
                    className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                  >
                    End Time <span className="text-[#8A8279] font-normal">(opt)</span>
                  </label>
                  <input
                    id="calendar-form-end-time"
                    type="time"
                    data-testid="calendar-form-end-time-input"
                    value={formEndTime}
                    onChange={(e) => {
                      setFormEndTime(e.target.value);
                      if (formErrors.timeRange) {
                        setFormErrors((prev) => ({
                          ...prev,
                          timeRange: undefined,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD8CE] text-xs font-bold text-[#2F2B28] focus:outline-none focus:border-[#C87D55]"
                  />
                </div>
              </div>

              {/* Priority Selection (Low, Medium, High) */}
              <div>
                <span className="block text-xs font-extrabold text-[#2F2B28] mb-1.5">
                  Priority
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'Low', label: 'Low' },
                      { id: 'Med', label: 'Medium' },
                      { id: 'High', label: 'High' },
                    ] as const
                  ).map((p) => {
                    const active = formPriority === p.id;
                    const meta = PRIORITY_DISPLAY_META[p.id];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormPriority(p.id)}
                        data-testid={`calendar-form-priority-${p.id}`}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          active ? 'ring-2 ring-[#2F2B28]' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: meta.bg,
                          color: meta.text,
                          borderColor: meta.border,
                        }}
                      >
                        <Flag className="w-3 h-3" />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Selection (Pending, In Progress, Completed) */}
              <div>
                <span className="block text-xs font-extrabold text-[#2F2B28] mb-1.5">
                  Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'To Do', label: 'Pending', Icon: Circle },
                      {
                        id: 'In Progress',
                        label: 'In Progress',
                        Icon: CircleDot,
                      },
                      { id: 'Done', label: 'Completed', Icon: CheckCircle2 },
                    ] as const
                  ).map((st) => {
                    const active = formStatus === st.id;
                    const meta = STATUS_DISPLAY_META[st.id];
                    const Icon = st.Icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFormStatus(st.id)}
                        data-testid={`calendar-form-status-${st.id}`}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          active ? 'ring-2 ring-[#2F2B28]' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: meta.bg,
                          color: meta.text,
                          borderColor: meta.border,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category / Task Type Selection */}
              <div>
                <label
                  htmlFor="calendar-form-category"
                  className="block text-xs font-extrabold text-[#2F2B28] mb-1"
                >
                  Category / Task Type <span className="text-[#8A8279] font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#7A7269] shrink-0" />
                  <select
                    id="calendar-form-category"
                    data-testid="calendar-form-category-select"
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as TaskCategory)
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#DFD8CE] text-xs font-bold text-[#2F2B28] focus:outline-none focus:border-[#C87D55]"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer Buttons (Cancel / Save) */}
              <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  data-testid="calendar-form-cancel-btn"
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DFD8CE] bg-white hover:bg-[#F3EFE9] text-xs font-bold text-[#4B453F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="calendar-form-submit-btn"
                  className="min-h-[40px] px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: theme.checkboxBg }}
                >
                  {editingTask ? 'Save Task Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskPendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-delete-modal-title"
          data-testid="calendar-delete-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setTaskPendingDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#FDFBF7] border border-[#DFD8CE] shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCE8E6] border border-[#F3C7C3] text-[#A83830] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3
                  id="calendar-delete-modal-title"
                  className="text-sm sm:text-base font-extrabold text-[#2F2B28]"
                >
                  Delete Scheduled Task?
                </h3>
                <p className="text-xs text-[#6E665E] mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-extrabold text-[#2F2B28]">
                    &ldquo;{taskPendingDelete.title}&rdquo;
                  </span>{' '}
                  scheduled for{' '}
                  <span className="font-bold">{taskPendingDelete.date}</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5DEC9]">
              <button
                type="button"
                onClick={() => setTaskPendingDelete(null)}
                data-testid="calendar-cancel-delete-btn"
                className="min-h-[40px] px-4 py-2 rounded-xl border border-[#DFD8CE] bg-white hover:bg-[#F3EFE9] text-xs font-bold text-[#4B453F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                data-testid="calendar-confirm-delete-btn"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-xs font-extrabold text-white shadow-xs cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
