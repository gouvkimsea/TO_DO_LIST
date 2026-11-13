import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { SharedDashboardPageProps } from './types';

export const DailyColumnsPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  selectedDate,
  weekRangeLabel,
  searchQuery,
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
  onReorderOrMoveDailyTask,
  onResetWeek,
  onClearCompletedTasks,
  onClearPendingTasks,
  archivedCount,
  onArchiveCompletedTasks,
  onArchiveSingleDailyTask,
  onOpenArchiveModal,
  onQuickSave,
  onOpenShortcutsModal,
}) => {
  const [showAllDays, setShowAllDays] = useState<boolean>(false);

  return (
    <section
      id="daily-columns"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="plenty of room to type · drag to reorder · expand tasks for notes"
          className="w-full"
          defaultFullscreen
          chromeRightSlot={
            <button
              type="button"
              onClick={() => setShowAllDays((prev) => !prev)}
              className="text-[10px] sm:text-[11px] font-bold text-[#7A624D] hover:text-[#2F2B28] bg-[#FAF7F2] hover:bg-white border border-[#E2D9CC] rounded-full px-2.5 py-0.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {showAllDays ? '4-Day Close-Up' : 'All 7 Days'}
            </button>
          }
        >
          <div className="pt-2.5 sm:pt-3 px-3 sm:px-4">
            <SectionHeader
              eyebrow="REALLY READABLE DAILY COLUMNS"
              italicSubtitle="each day is"
              title="SPACIOUS & CLEAR"
            />
          </div>

          <InteractiveDashboard
            columns={columns}
            monthlyGoals={monthlyGoals}
            yearlyGoals={yearlyGoals}
            activeTheme={activeTheme}
            activeView="week"
            selectedDate={selectedDate}
            weekRangeLabel={weekRangeLabel}
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            onSelectTheme={onSelectTheme}
            onSelectView={onSelectView}
            onDateChange={onDateChange}
            onToggleDailyTask={onToggleDailyTask}
            onCycleDailyPriority={onCycleDailyPriority}
            onCycleDailyCategory={onCycleDailyCategory}
            onCycleDailyRecurring={onCycleDailyRecurring}
            onSetDailyRecurring={onSetDailyRecurring}
            onUpdateDailyTaskText={onUpdateDailyTaskText}
            onQuickAddDailyTask={onQuickAddDailyTask}
            onBulkImportTasks={onBulkImportTasks}
            onOpenBulkImportModal={onOpenBulkImportModal}
            onUpdateDailyTaskNotes={onUpdateDailyTaskNotes}
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

          <div className="px-3 sm:px-4 pb-3 pt-2 border-t border-[#ECE7DF] text-center space-y-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="bg-[#F5DFD0] text-[#B05C37] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Easy to read
              </span>
              <span className="bg-[#DFECE0] text-[#3F6F4A] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Quick to click
              </span>
              <span className="bg-[#E6E2F3] text-[#5D508C] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Fits your flow
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8A8279]">
              No cramped cells or tiny text — drag tasks within a day or across
              days of the week
            </p>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
