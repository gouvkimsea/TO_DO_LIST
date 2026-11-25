import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { THEMES } from '../utils/todoLogic';
import { SharedDashboardPageProps } from './types';

export const DailyColumnsPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  selectedDate,
  weekRangeLabel,
  searchQuery,
  customCategories,
  onAddCustomCategory,
  onRemoveCustomCategory,
  onSearchQueryChange,
  onSelectTheme,
  onSelectView,
  onDateChange,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyCategory,
  onCycleDailyRecurring,
  onSetDailyRecurring,
  onToggleDailyHabit,
  onToggleDailyHabitDay,
  onUpdateDailyTaskText,
  onDeleteDailyTask,
  onQuickAddDailyTask,
  onBulkImportTasks,
  onOpenBulkImportModal,
  onUpdateDailyTaskNotes,
  onUpdateDailyTaskTimeBlock,
  onReorderOrMoveDailyTask,
  onResetWeek,
  onClearCompletedTasks,
  onClearPendingTasks,
  archivedCount,
  onArchiveCompletedTasks,
  onArchiveSingleDailyTask,
  onOpenArchiveModal,
  onOpenQuickAdd,
  onQuickSave,
  onOpenShortcutsModal,
}) => {
  const [showAllDays, setShowAllDays] = useState<boolean>(false);
  const theme = THEMES[activeTheme];

  return (
    <section
      id="daily-columns"
      aria-label="Weekly Task Columns"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-3">
        {/* Clean Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
              This Week
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
              {weekRangeLabel} · Tap a box to finish, or drag tasks between days
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllDays((prev) => !prev)}
              className="hidden sm:inline-flex items-center min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold text-[#5A534C] hover:text-[#2F2B28] bg-white hover:bg-[#F2EFE9] border border-[#E2D9CC] transition-colors cursor-pointer whitespace-nowrap"
            >
              {showAllDays ? 'Show 4 Days' : 'Show All 7 Days'}
            </button>
            {onOpenQuickAdd && (
              <button
                type="button"
                onClick={() => onOpenQuickAdd()}
                data-testid="week-page-add-task-btn"
                data-custom-btn="primary"
                className="md:hidden inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <Plus className="w-4 h-4 stroke-[2.75]" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <InteractiveDashboard
            columns={columns}
            monthlyGoals={monthlyGoals}
            yearlyGoals={yearlyGoals}
            activeTheme={activeTheme}
            activeView="week"
            selectedDate={selectedDate}
            weekRangeLabel={weekRangeLabel}
            searchQuery={searchQuery}
            customCategories={customCategories}
            onAddCustomCategory={onAddCustomCategory}
            onRemoveCustomCategory={onRemoveCustomCategory}
            onSearchQueryChange={onSearchQueryChange}
            onSelectTheme={onSelectTheme}
            onSelectView={onSelectView}
            onDateChange={onDateChange}
            onToggleDailyTask={onToggleDailyTask}
            onCycleDailyPriority={onCycleDailyPriority}
            onCycleDailyCategory={onCycleDailyCategory}
            onCycleDailyRecurring={onCycleDailyRecurring}
            onSetDailyRecurring={onSetDailyRecurring}
            onToggleDailyHabit={onToggleDailyHabit}
            onToggleDailyHabitDay={onToggleDailyHabitDay}
            onUpdateDailyTaskText={onUpdateDailyTaskText}
            onDeleteDailyTask={onDeleteDailyTask}
            onQuickAddDailyTask={onQuickAddDailyTask}
            onBulkImportTasks={onBulkImportTasks}
            onOpenBulkImportModal={onOpenBulkImportModal}
            onUpdateDailyTaskNotes={onUpdateDailyTaskNotes}
            onUpdateDailyTaskTimeBlock={onUpdateDailyTaskTimeBlock}
            enableTaskNotes
            onReorderOrMoveDailyTask={onReorderOrMoveDailyTask}
            enableDragAndDrop
            onResetWeek={onResetWeek}
            showBulkActions
            onClearCompletedTasks={onClearCompletedTasks}
            onClearPendingTasks={onClearPendingTasks}
            archivedCount={archivedCount}
            onArchiveCompletedTasks={onArchiveCompletedTasks}
            onArchiveSingleDailyTask={onArchiveSingleDailyTask}
            onOpenArchiveModal={onOpenArchiveModal}
            visibleColumnSlice={showAllDays ? undefined : [3, 7]}
            instancePrefix="spacious"
            onQuickSave={onQuickSave}
            onOpenShortcutsModal={onOpenShortcutsModal}
          />
        </BrowserFrame>
      </div>
    </section>
  );
};
