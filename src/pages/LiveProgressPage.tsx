import React, { useState } from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import {
  LiveProgressBoard,
  WeeklyCompletionProgressBar,
} from '../components/LiveProgressSection';
import { WeeklyProgressTrendsChart } from '../components/WeeklyProgressTrendsChart';
import { WeeklyTaskIntensityHeatmap } from '../components/WeeklyTaskIntensityHeatmap';
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
  onArchiveCompletedTasks,
  onArchiveSingleDetailedTask,
  onOpenArchiveModal,
  onOpenBulkImportModal,
}) => {
  const [chartTab, setChartTab] = useState<
    'breakdown' | 'intensity' | 'trends'
  >('breakdown');

  return (
    <section
      id="live-progress"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="auto-calculated — no formulas to touch"
          className="w-full"
          defaultFullscreen
          chromeRightSlot={
            <div className="inline-flex items-center bg-[#E4DDD3] p-0.5 rounded-full">
              <button
                type="button"
                data-testid="live-progress-subview-breakdown"
                onClick={() => setChartTab('breakdown')}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'breakdown'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                Live Breakdown
              </button>
              <button
                type="button"
                data-testid="live-progress-subview-intensity"
                onClick={() => setChartTab('intensity')}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'intensity'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                Task Intensity
              </button>
              <button
                type="button"
                data-testid="live-progress-subview-trends"
                onClick={() => setChartTab('trends')}
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  chartTab === 'trends'
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                4-Week Trends
              </button>
            </div>
          }
        >
          <div className="pt-2.5 sm:pt-3 px-3 sm:px-4">
            <SectionHeader
              eyebrow="LIVE PROGRESS DASHBOARD"
              italicSubtitle="progress that"
              title="ADDS ITSELF UP"
            />
          </div>

          {chartTab === 'breakdown' ? (
            <div className="flex-1 flex flex-col">
              <LiveProgressBoard
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
                onArchiveCompletedTasks={onArchiveCompletedTasks}
                onArchiveSingleDetailedTask={onArchiveSingleDetailedTask}
                onOpenArchiveModal={onOpenArchiveModal}
                onOpenBulkImportModal={onOpenBulkImportModal}
                onSelectTheme={onSelectTheme}
              />
              <div className="px-3 sm:px-4 lg:px-5 pb-4 bg-[#FAF7F2]">
                <WeeklyTaskIntensityHeatmap
                  columns={columns}
                  detailedTasks={detailedTasks}
                  activeTheme={activeTheme}
                  customCategories={customCategories}
                />
              </div>
            </div>
          ) : chartTab === 'intensity' ? (
            <div className="p-3 sm:p-4 lg:p-5 bg-[#FAF7F2] flex-1 flex flex-col gap-3.5 sm:gap-4">
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
          ) : (
            <div className="p-3 sm:p-4 flex-1 flex flex-col gap-3.5">
              <WeeklyCompletionProgressBar
                metrics={metrics}
                activeTheme={activeTheme}
              />
              <WeeklyProgressTrendsChart
                columns={columns}
                selectedDate={selectedDate}
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

          <div className="px-3 sm:px-4 pb-3 pt-2 border-t border-[#ECE7DF] text-center space-y-1.5">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="bg-[#F5DFD0] text-[#B05C37] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Live completion bar
              </span>
              <span className="bg-[#FAE8CE] text-[#946016] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Milestone badges
              </span>
              <span className="bg-[#E3EFF8] text-[#2B5B80] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Weekly task intensity
              </span>
              <span className="bg-[#F5DFD0] text-[#B05C37] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Completion ring
              </span>
              <span className="bg-[#DFECE0] text-[#3F6F4A] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                Daily progress
              </span>
              <span className="bg-[#FAE8CE] text-[#9E6826] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                By priority
              </span>
              <span className="bg-[#E6E2F3] text-[#5D508C] font-bold text-xs px-4 py-1 rounded-full whitespace-nowrap">
                By status
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8A8279]">
              Every number recalculates the moment you check a task off
            </p>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};

