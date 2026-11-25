import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserFrame } from '../components/BrowserFrame';
import {
  LiveProgressBoard,
  WeeklyCompletionProgressBar,
} from '../components/LiveProgressSection';
import { WeeklyProgressTrendsChart } from '../components/WeeklyProgressTrendsChart';
import { DailyTaskProgressLineChart } from '../components/DailyTaskProgressLineChart';
import { DailyTipCard } from '../components/DailyTipCard';
import { DashboardDayColumnsSection } from '../components/DashboardDayColumnsSection';
import { InteractiveCalendarSection } from '../components/InteractiveCalendarSection';
import {
  DASHBOARD_ENTRANCE_CONTAINER_VARIANTS,
  DASHBOARD_ENTRANCE_ITEM_VARIANTS,
  THEMES,
  consumeDashboardInitialLoadEntrance,
  resolveDashboardEntranceInitialProp,
} from '../utils/todoLogic';
import { SharedDashboardPageProps } from './types';

export const DashboardPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  detailedTasks,
  metrics,
  activeTheme,
  selectedDate,
  searchQuery,
  archivedCount,
  customCategories,
  onAddCustomCategory,
  onRemoveCustomCategory,
  onSelectTheme,
  onDateChange,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyRecurring,
  onToggleDailyHabit,
  onToggleDailyHabitDay,
  onUpdateDailyTaskText,
  onDeleteDailyTask,
  onQuickAddDailyTask,
  onUpdateDailyTaskNotes,
  onUpdateDailyTaskTimeBlock,
  onToggleDetailedTask,
  onCycleDetailedPriority,
  onCycleDetailedStatus,
  onCycleDetailedCategory,
  onUpdateDetailedText,
  onUpdateDetailedNotes,
  onAddCalendarTask,
  onUpdateCalendarTask,
  onDeleteCalendarTask,
  onArchiveCompletedTasks,
  onArchiveSingleDetailedTask,
  onOpenArchiveModal,
  onOpenBulkImportModal,
  onQuickSave,
}) => {
  const [activeTab, setActiveTab] = useState<
    'tasks' | 'schedule' | 'calendar' | 'stats'
  >('tasks');
  const theme = THEMES[activeTheme];

  const shouldAnimateOnInitialLoadRef = useRef<boolean | null>(null);
  if (shouldAnimateOnInitialLoadRef.current === null) {
    shouldAnimateOnInitialLoadRef.current = consumeDashboardInitialLoadEntrance();
  }

  const initialThemeRef = useRef(activeTheme);
  const [hasSettledEntrance, setHasSettledEntrance] = useState<boolean>(
    !shouldAnimateOnInitialLoadRef.current
  );

  const isThemeSwitch = activeTheme !== initialThemeRef.current;

  useEffect(() => {
    if (isThemeSwitch && !hasSettledEntrance) {
      setHasSettledEntrance(true);
    }
  }, [isThemeSwitch, hasSettledEntrance]);

  const initialVariant = resolveDashboardEntranceInitialProp({
    isInitialPageLoad:
      Boolean(shouldAnimateOnInitialLoadRef.current) && !hasSettledEntrance,
    isThemeSwitch,
  });

  return (
    <section
      id="dashboard"
      aria-label="Today and Weekly Tasks"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <motion.div
        data-testid="dashboard-entrance-container"
        data-entrance-initial={initialVariant === 'hidden' ? 'hidden' : 'false'}
        data-entrance-settled={
          hasSettledEntrance || isThemeSwitch ? 'true' : 'false'
        }
        variants={DASHBOARD_ENTRANCE_CONTAINER_VARIANTS}
        initial={initialVariant}
        animate="visible"
        onAnimationComplete={() => setHasSettledEntrance(true)}
        className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-3"
      >
        {/* Instant-Clarity Header: Title + Slim Progress Strip + 4 Simple View Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 px-1 sm:px-0">
          <div className="min-w-0 flex-1 max-w-md">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
                Today
              </h1>
              <span className="text-xs sm:text-sm font-bold text-[#6E665E] tabular-nums shrink-0">
                {metrics.completedTasks}/{metrics.totalTasks} done ·{' '}
                {metrics.completionPercentage}%
              </span>
            </div>
            {/* Slim unobtrusive progress line */}
            <div
              role="progressbar"
              aria-label="Weekly task completion"
              aria-valuenow={metrics.completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-1.5 h-1.5 w-full rounded-full bg-[#E8E1D6] overflow-hidden"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${metrics.completionPercentage}%`,
                  backgroundColor: theme.checkboxBg,
                }}
              />
            </div>
          </div>

          <div className="flex items-center md:justify-end">
            <div
              role="tablist"
              aria-label="Today view"
              className="grid grid-cols-4 w-full sm:w-auto sm:inline-flex items-center bg-[#EFEAE1] p-1 rounded-xl border border-[#E2D9CC]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tasks'}
                onClick={() => setActiveTab('tasks')}
                data-testid="dashboard-tab-breakdown"
                className={`inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:inline" />
                <span>Tasks</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'schedule'}
                onClick={() => setActiveTab('schedule')}
                data-testid="dashboard-tab-schedule"
                className={`inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:inline" />
                <span>Schedule</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'calendar'}
                onClick={() => setActiveTab('calendar')}
                data-testid="dashboard-tab-calendar"
                className={`inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'calendar'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:inline" />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'stats'}
                onClick={() => setActiveTab('stats')}
                data-testid="dashboard-tab-trends"
                className={`inline-flex items-center justify-center gap-1 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0 hidden min-[370px]:inline" />
                <span>Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calm Workspace Surface */}
        <BrowserFrame className="w-full" defaultFullscreen>
          {/* TAB 1: TASKS (Task-First! Immediately visible above the fold) */}
          {activeTab === 'tasks' && (
            <div className="flex-1 flex flex-col">
              <LiveProgressBoard
                columns={columns}
                detailedTasks={detailedTasks}
                metrics={metrics}
                activeTheme={activeTheme}
                searchQuery={searchQuery}
                archivedCount={archivedCount}
                customCategories={customCategories}
                onAddCustomCategory={onAddCustomCategory}
                onRemoveCustomCategory={onRemoveCustomCategory}
                onSelectTheme={onSelectTheme}
                onToggleDetailedTask={onToggleDetailedTask}
                onCycleDetailedPriority={onCycleDetailedPriority}
                onCycleDetailedStatus={onCycleDetailedStatus}
                onCycleDetailedCategory={onCycleDetailedCategory}
                onUpdateDetailedText={onUpdateDetailedText}
                onUpdateDetailedNotes={onUpdateDetailedNotes}
                onArchiveCompletedTasks={onArchiveCompletedTasks}
                onArchiveSingleDetailedTask={onArchiveSingleDetailedTask}
                onOpenArchiveModal={onOpenArchiveModal}
                onOpenBulkImportModal={onOpenBulkImportModal}
                hideWeeklyBar
                hideMetricsGrid
              />
            </div>
          )}

          {/* TAB 2: SCHEDULE (Daily Columns + Time-Blocking Timeline) */}
          {activeTab === 'schedule' && (
            <div className="p-3 sm:p-4 lg:p-5 bg-[#FAF7F2] flex-1 flex flex-col">
              <DashboardDayColumnsSection
                columns={columns}
                activeTheme={activeTheme}
                selectedDate={selectedDate}
                customCategories={customCategories}
                onToggleDailyTask={onToggleDailyTask}
                onCycleDailyPriority={onCycleDailyPriority}
                onCycleDailyRecurring={onCycleDailyRecurring}
                onToggleDailyHabit={onToggleDailyHabit}
                onToggleDailyHabitDay={onToggleDailyHabitDay}
                onUpdateDailyTaskText={onUpdateDailyTaskText}
                onDeleteDailyTask={onDeleteDailyTask}
                onQuickAddDailyTask={onQuickAddDailyTask}
                onUpdateDailyTaskNotes={onUpdateDailyTaskNotes}
                onUpdateDailyTaskTimeBlock={onUpdateDailyTaskTimeBlock}
                onQuickSave={onQuickSave}
              />
            </div>
          )}

          {/* TAB 3: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="p-3 sm:p-4 lg:p-5 bg-[#FAF7F2] flex-1 flex flex-col gap-4">
              {onAddCalendarTask &&
                onUpdateCalendarTask &&
                onDeleteCalendarTask && (
                  <InteractiveCalendarSection
                    columns={columns}
                    activeTheme={activeTheme}
                    selectedDate={selectedDate}
                    customCategories={customCategories}
                    onDateChange={onDateChange}
                    onToggleDailyTask={onToggleDailyTask}
                    onAddCalendarTask={onAddCalendarTask}
                    onUpdateCalendarTask={onUpdateCalendarTask}
                    onDeleteCalendarTask={onDeleteCalendarTask}
                  />
                )}
            </div>
          )}

          {/* TAB 4: STATS (Weekly Completion, Badges, Daily Tip & Trends) */}
          {activeTab === 'stats' && (
            <motion.div
              variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
              className="p-3 sm:p-5 bg-[#FAF7F2] flex-1 flex flex-col gap-4"
            >
              <WeeklyCompletionProgressBar
                metrics={metrics}
                activeTheme={activeTheme}
              />
              <DailyTipCard
                metrics={metrics}
                columns={columns}
                detailedTasks={detailedTasks}
                activeTheme={activeTheme}
              />
              <DailyTaskProgressLineChart
                columns={columns}
                activeTheme={activeTheme}
              />
              <WeeklyProgressTrendsChart
                columns={columns}
                selectedDate={selectedDate}
                activeTheme={activeTheme}
              />
            </motion.div>
          )}
        </BrowserFrame>
      </motion.div>
    </section>
  );
};
