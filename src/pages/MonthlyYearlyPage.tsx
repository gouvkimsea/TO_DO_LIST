import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { InteractiveCalendarSection } from '../components/InteractiveCalendarSection';
import { SharedDashboardPageProps } from './types';

export const MonthlyYearlyPage: React.FC<SharedDashboardPageProps> = ({
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
  onUpdateDailyTaskText,
  onDeleteDailyTask,
  onQuickAddDailyTask,
  onResetWeek,
  onToggleGoalTask,
  onCycleGoalPriority,
  onCycleGoalStatus,
  onCycleGoalCategory,
  onUpdateGoalText,
  onUpdateGoalNotes,
  onAddCalendarTask,
  onUpdateCalendarTask,
  onDeleteCalendarTask,
}) => {
  return (
    <section
      id="monthly-yearly"
      aria-label="Goals and Calendar"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-3">
        <SectionHeader
          title="Goals & Calendar"
          italicSubtitle="See your monthly calendar alongside your bigger monthly and yearly goals"
        />

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-3 sm:p-5 flex-1 flex flex-col gap-5">
            {onAddCalendarTask && onUpdateCalendarTask && onDeleteCalendarTask && (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {/* Monthly Goals */}
              <div className="rounded-2xl border border-[#E6DFD3] bg-[#FAF7F2] overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-[#ECE5DA] bg-[#F5EFE7]">
                  <h2 className="text-sm font-extrabold text-[#B86B43]">
                    Monthly Goals
                  </h2>
                </div>
                <InteractiveDashboard
                  columns={columns}
                  monthlyGoals={monthlyGoals}
                  yearlyGoals={yearlyGoals}
                  activeTheme={activeTheme}
                  activeView="month"
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
                  onUpdateDailyTaskText={onUpdateDailyTaskText}
                  onDeleteDailyTask={onDeleteDailyTask}
                  onQuickAddDailyTask={onQuickAddDailyTask}
                  onResetWeek={onResetWeek}
                  onToggleGoalTask={onToggleGoalTask}
                  onCycleGoalPriority={onCycleGoalPriority}
                  onCycleGoalStatus={onCycleGoalStatus}
                  onCycleGoalCategory={onCycleGoalCategory}
                  onUpdateGoalText={onUpdateGoalText}
                  onUpdateGoalNotes={onUpdateGoalNotes}
                  compact
                  instancePrefix="monthly-preview"
                />
              </div>

              {/* Yearly Goals */}
              <div className="rounded-2xl border border-[#E6DFD3] bg-[#FAF7F2] overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 border-b border-[#ECE5DA] bg-[#F5EFE7]">
                  <h2 className="text-sm font-extrabold text-[#6D5B98]">
                    Yearly Goals
                  </h2>
                </div>
                <InteractiveDashboard
                  columns={columns}
                  monthlyGoals={monthlyGoals}
                  yearlyGoals={yearlyGoals}
                  activeTheme={activeTheme}
                  activeView="year"
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
                  onUpdateDailyTaskText={onUpdateDailyTaskText}
                  onDeleteDailyTask={onDeleteDailyTask}
                  onQuickAddDailyTask={onQuickAddDailyTask}
                  onResetWeek={onResetWeek}
                  onToggleGoalTask={onToggleGoalTask}
                  onCycleGoalPriority={onCycleGoalPriority}
                  onCycleGoalStatus={onCycleGoalStatus}
                  onCycleGoalCategory={onCycleGoalCategory}
                  onUpdateGoalText={onUpdateGoalText}
                  onUpdateGoalNotes={onUpdateGoalNotes}
                  compact
                  instancePrefix="yearly-preview"
                />
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
