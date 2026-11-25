import React, { useState } from 'react';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { BrowserFrame } from '../components/BrowserFrame';
import {
  LiveProgressBoard,
  WeeklyCompletionProgressBar,
} from '../components/LiveProgressSection';
import { WeeklyProgressTrendsChart } from '../components/WeeklyProgressTrendsChart';
import { WeeklyTaskIntensityHeatmap } from '../components/WeeklyTaskIntensityHeatmap';
import { DailyTaskProgressLineChart } from '../components/DailyTaskProgressLineChart';
import { PriorityDistributionDonutSection } from '../components/PriorityDistributionDonutSection';
import { TaskCompletionVelocitySection } from '../components/TaskCompletionVelocitySection';
import { SharedDashboardPageProps } from './types';

export const LiveProgressPage: React.FC<SharedDashboardPageProps> = ({
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
  onToggleDetailedTask,
  onCycleDetailedPriority,
  onCycleDetailedStatus,
  onCycleDetailedCategory,
  onUpdateDetailedText,
  onUpdateDetailedNotes,
  onArchiveCompletedTasks,
  onArchiveSingleDetailedTask,
  onOpenArchiveModal,
  onOpenBulkImportModal,
}) => {
  const [chartTab, setChartTab] = useState<
    'breakdown' | 'trends' | 'intensity'
  >('breakdown');

  return (
    <section
      id="live-progress"
      aria-label="Weekly Progress and Trends"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-3">
        {/* Clean Header + Focused 3-Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
              Your Progress
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5 tabular-nums">
              Updates automatically whenever you check off a task ·{' '}
              {metrics.completionPercentage}% done this week
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Progress sections"
            className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex items-center bg-[#EFEAE1] p-1 rounded-xl border border-[#E2D9CC]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={chartTab === 'breakdown'}
              data-testid="live-progress-subview-breakdown"
              onClick={() => setChartTab('breakdown')}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                chartTab === 'breakdown'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#2F2B28]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={chartTab === 'trends'}
              data-testid="live-progress-subview-trends"
              onClick={() => setChartTab('trends')}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                chartTab === 'trends'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#2F2B28]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Trends</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={chartTab === 'intensity'}
              data-testid="live-progress-subview-intensity"
              onClick={() => setChartTab('intensity')}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[34px] px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                chartTab === 'intensity'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#2F2B28]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>Activity</span>
            </button>
          </div>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          {chartTab === 'breakdown' && (
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
                onSelectTheme={onSelectTheme}
              />
              <div className="px-3 sm:px-4 lg:px-5 pb-4 bg-[#FAF7F2] flex flex-col gap-4">
                <TaskCompletionVelocitySection
                  columns={columns}
                  selectedDate={selectedDate}
                  activeTheme={activeTheme}
                />
                <PriorityDistributionDonutSection
                  columns={columns}
                  detailedTasks={detailedTasks}
                  activeTheme={activeTheme}
                />
              </div>
            </div>
          )}

          {chartTab === 'trends' && (
            <div className="p-3 sm:p-5 bg-[#FAF7F2] flex-1 flex flex-col gap-4">
              <WeeklyCompletionProgressBar
                metrics={metrics}
                activeTheme={activeTheme}
              />
              <TaskCompletionVelocitySection
                columns={columns}
                selectedDate={selectedDate}
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
            </div>
          )}

          {chartTab === 'intensity' && (
            <div className="p-3 sm:p-5 bg-[#FAF7F2] flex-1 flex flex-col gap-4">
              <WeeklyCompletionProgressBar
                metrics={metrics}
                activeTheme={activeTheme}
              />
              <WeeklyTaskIntensityHeatmap
                columns={columns}
                detailedTasks={detailedTasks}
                activeTheme={activeTheme}
                customCategories={customCategories}
              />
            </div>
          )}
        </BrowserFrame>
      </div>
    </section>
  );
};
