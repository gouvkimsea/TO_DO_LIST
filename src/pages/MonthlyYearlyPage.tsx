import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
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
  onQuickAddDailyTask,
  onResetWeek,
  onToggleGoalTask,
  onCycleGoalPriority,
  onCycleGoalStatus,
  onCycleGoalCategory,
  onUpdateGoalText,
}) => {
  return (
    <section
      id="monthly-yearly"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="my-tasks.html — Monthly & Yearly Goals"
          className="w-full"
          defaultFullscreen
        >
          <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <SectionHeader
              eyebrow="MONTHLY & YEARLY"
              italicSubtitle="plan the"
              title="BIGGER PICTURE, TOO"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-2">
              {/* Monthly Goals Window */}
              <div className="flex flex-col items-center w-full">
                <BrowserFrame
                  urlText="my-tasks.html — This Month (June 2026)"
                  compact
                  defaultFullscreen={false}
                  className="w-full max-w-none"
                >
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
                    onQuickAddDailyTask={onQuickAddDailyTask}
                    onResetWeek={onResetWeek}
                    onToggleGoalTask={onToggleGoalTask}
                    onCycleGoalPriority={onCycleGoalPriority}
                    onCycleGoalStatus={onCycleGoalStatus}
                    onCycleGoalCategory={onCycleGoalCategory}
                    onUpdateGoalText={onUpdateGoalText}
                    compact
                    instancePrefix="monthly-preview"
                  />
                </BrowserFrame>
                <span className="mt-2 text-sm sm:text-base font-extrabold text-[#B86B43]">
                  Monthly goals
                </span>
              </div>

              {/* Yearly Goals Window */}
              <div className="flex flex-col items-center w-full">
                <BrowserFrame
                  urlText="my-tasks.html — This Year (2026)"
                  compact
                  defaultFullscreen={false}
                  className="w-full max-w-none"
                >
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
                    onQuickAddDailyTask={onQuickAddDailyTask}
                    onResetWeek={onResetWeek}
                    onToggleGoalTask={onToggleGoalTask}
                    onCycleGoalPriority={onCycleGoalPriority}
                    onCycleGoalStatus={onCycleGoalStatus}
                    onCycleGoalCategory={onCycleGoalCategory}
                    onUpdateGoalText={onUpdateGoalText}
                    compact
                    instancePrefix="yearly-preview"
                  />
                </BrowserFrame>
                <span className="mt-2 text-sm sm:text-base font-extrabold text-[#6D5B98]">
                  Yearly goals
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-[#ECE7DF] text-center space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="bg-[#F5DFD0] text-[#B05C37] font-bold text-xs px-4 py-1 rounded-full">
                  Monthly completion %
                </span>
                <span className="bg-[#E6E2F3] text-[#5D508C] font-bold text-xs px-4 py-1 rounded-full">
                  Yearly goal tracking
                </span>
              </div>
              <p className="text-xs font-semibold text-[#8A8279]">
                A dedicated list and progress charts for the month and the year
              </p>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
