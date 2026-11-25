import React, { useMemo, useState } from 'react';
import { PieChart as PieChartIcon, CheckCircle2, Layers } from 'lucide-react';
import {
  DayColumn,
  DetailedTask,
  Priority,
  PriorityDistributionScope,
  ThemeId,
  THEMES,
  buildPriorityDistributionSummary,
} from '../utils/todoLogic';

export interface PriorityDistributionDonutSectionProps {
  columns: DayColumn[];
  detailedTasks?: DetailedTask[];
  activeTheme: ThemeId;
  className?: string;
}

export const PriorityDistributionDonutSection: React.FC<
  PriorityDistributionDonutSectionProps
> = ({ columns, detailedTasks = [], activeTheme, className = '' }) => {
  const [scope, setScope] = useState<PriorityDistributionScope>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(
    null
  );

  const theme = THEMES[activeTheme];

  const summary = useMemo(
    () =>
      buildPriorityDistributionSummary({
        columns,
        detailedTasks,
        scope,
      }),
    [columns, detailedTasks, scope]
  );

  const activeSlice = useMemo(() => {
    if (!selectedPriority) return null;
    return (
      summary.slices.find((s) => s.priority === selectedPriority) ?? null
    );
  }, [selectedPriority, summary.slices]);

  // SVG Donut geometry
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    let cumulativeRatio = 0;
    return summary.slices.map((slice) => {
      const segmentLength = slice.exactShareRatio * circumference;
      const strokeDasharray = `${segmentLength} ${Math.max(
        0,
        circumference - segmentLength
      )}`;
      const strokeDashoffset = -cumulativeRatio * circumference;
      cumulativeRatio += slice.exactShareRatio;
      return {
        ...slice,
        segmentLength,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [summary.slices, circumference]);

  const inspectedSlice =
    activeSlice ?? summary.dominantPriority ?? summary.slices[0] ?? null;

  return (
    <section
      aria-label="Priority Distribution Donut Chart Section"
      data-testid="priority-distribution-donut-section"
      data-scope={summary.scope}
      data-total-tasks={summary.totalTasks}
      data-high-count={summary.slices[0]?.totalCount ?? 0}
      data-med-count={summary.slices[1]?.totalCount ?? 0}
      data-low-count={summary.slices[2]?.totalCount ?? 0}
      className={`bg-white rounded-2xl border border-[#ECE7DF] p-3.5 sm:p-4 lg:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3.5 ${className}`}
    >
      {/* Header Row: Section Title + Dominant Priority Badge + Scope Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 border-b border-[#F4F0E8]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
              <PieChartIcon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: theme.checkboxBg }}
              />
              <span>TASK DISTRIBUTION BY PRIORITY LEVEL</span>
            </span>
            {summary.dominantPriority && (
              <span
                data-testid="priority-donut-dominant-badge"
                className="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: summary.dominantPriority.badgeBg,
                  color: summary.dominantPriority.badgeText,
                }}
              >
                Top Tier: {summary.dominantPriority.priority} (
                {summary.dominantPriority.percentageOfTotal}%)
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-[#7A7269] mt-0.5">
            Visualizes your workload balance across High, Med, and Low priority
            levels — click any slice or priority row to inspect tasks.
          </p>
        </div>

        {/* Scope Selector (All Tasks / Weekly Columns / Focus Board) */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Priority distribution data scope"
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E5DEC9]"
          >
            {(
              [
                { id: 'all', label: 'All Tasks' },
                { id: 'weekly', label: 'Weekly Columns' },
                { id: 'focus', label: 'Focus Board' },
              ] as const
            ).map((opt) => {
              const isSelected = scope === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`priority-donut-scope-${opt.id}`}
                  aria-pressed={isSelected}
                  onClick={() => setScope(opt.id)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white text-[#2F2B28] shadow-2xs'
                      : 'text-[#6E675F] hover:text-[#2F2B28]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Interactive Donut Chart (Left) + 3 Priority Level Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-center">
        {/* Left Column: Multi-Segment SVG Donut Chart */}
        <div className="bg-[#FAF7F2] border border-[#ECE7DF] rounded-2xl p-4 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-44 h-44">
            <svg
              data-testid="priority-donut-chart-svg"
              className="w-44 h-44 -rotate-90 overflow-visible"
              viewBox="0 0 148 148"
              role="img"
              aria-label={`Priority distribution donut chart: High ${
                summary.slices[0]?.percentageOfTotal ?? 0
              }%, Med ${summary.slices[1]?.percentageOfTotal ?? 0}%, Low ${
                summary.slices[2]?.percentageOfTotal ?? 0
              }%`}
            >
              {/* Track Ring */}
              <circle
                cx="74"
                cy="74"
                r={radius}
                fill="transparent"
                stroke="#EAE3D7"
                strokeWidth="18"
              />

              {/* Priority Segments (High, Med, Low) */}
              {donutSegments.map((seg) => {
                if (seg.totalCount <= 0) return null;
                const isSelected = selectedPriority === seg.priority;
                const isDimmed =
                  selectedPriority !== null && !isSelected;

                return (
                  <circle
                    key={seg.priority}
                    data-testid={`priority-donut-slice-${seg.priority}`}
                    data-priority={seg.priority}
                    data-count={seg.totalCount}
                    data-percentage={seg.percentageOfTotal}
                    cx="74"
                    cy="74"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isSelected ? 22 : 18}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeOpacity={isDimmed ? 0.35 : 1}
                    onClick={() =>
                      setSelectedPriority((prev) =>
                        prev === seg.priority ? null : seg.priority
                      )
                    }
                    className="transition-all duration-300 cursor-pointer"
                  >
                    <title>
                      {`${seg.label}: ${seg.totalCount} tasks (${seg.percentageOfTotal}% of total, ${seg.completedCount} completed)`}
                    </title>
                  </circle>
                );
              })}
            </svg>

            {/* Donut Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
              {activeSlice ? (
                <>
                  <span
                    data-testid="priority-donut-center-label"
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mb-0.5"
                    style={{
                      backgroundColor: activeSlice.badgeBg,
                      color: activeSlice.badgeText,
                    }}
                  >
                    {activeSlice.priority}
                  </span>
                  <span
                    data-testid="priority-donut-center-value"
                    className="text-2xl font-black text-[#2F2B28] tabular-nums leading-tight"
                  >
                    {activeSlice.percentageOfTotal}%
                  </span>
                  <span
                    data-testid="priority-donut-center-subtext"
                    className="text-[10.5px] font-semibold text-[#7A7269] tabular-nums"
                  >
                    {activeSlice.totalCount} of {summary.totalTasks} tasks
                  </span>
                </>
              ) : (
                <>
                  <span
                    data-testid="priority-donut-center-label"
                    className="text-[9.5px] font-bold uppercase tracking-widest text-[#8A8279]"
                  >
                    TOTAL TASKS
                  </span>
                  <span
                    data-testid="priority-donut-center-value"
                    className="text-2xl sm:text-3xl font-black text-[#2F2B28] tabular-nums leading-tight"
                  >
                    {summary.totalTasks}
                  </span>
                  <span
                    data-testid="priority-donut-center-subtext"
                    className="text-[10.5px] font-semibold text-[#7A7269] tabular-nums"
                  >
                    {summary.totalCompleted} done · {summary.totalPending} left
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mini Legend under Donut */}
          <div className="flex items-center justify-center gap-3 mt-2.5 text-[10.5px] font-bold text-[#5A534C]">
            {summary.slices.map((slice) => (
              <button
                key={slice.priority}
                type="button"
                data-testid={`priority-donut-legend-btn-${slice.priority}`}
                onClick={() =>
                  setSelectedPriority((prev) =>
                    prev === slice.priority ? null : slice.priority
                  )
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer tabular-nums ${
                  selectedPriority === slice.priority
                    ? 'bg-white border-[#2F2B28] shadow-2xs scale-105'
                    : 'bg-transparent border-transparent hover:bg-[#EFECE6]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span>{slice.priority}</span>
                <span className="text-[#8A8279]">
                  {slice.percentageOfTotal}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Priority Breakdown Rows (High, Med, Low) */}
        <div className="flex flex-col gap-2.5">
          {summary.slices.map((slice) => {
            const isSelected = selectedPriority === slice.priority;
            return (
              <button
                key={slice.priority}
                type="button"
                data-testid={`priority-distribution-row-${slice.priority}`}
                data-priority={slice.priority}
                data-count={slice.totalCount}
                data-percentage={slice.percentageOfTotal}
                aria-pressed={isSelected}
                onClick={() =>
                  setSelectedPriority((prev) =>
                    prev === slice.priority ? null : slice.priority
                  )
                }
                className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-[#C9B9A6] ring-2 ring-[#2F2B28]/30 shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-[#F3EFE8] border-[#ECE7DF]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span
                      className="px-2 py-0.5 rounded text-[10.5px] font-extrabold leading-none"
                      style={{
                        backgroundColor: slice.badgeBg,
                        color: slice.badgeText,
                      }}
                    >
                      {slice.priority}
                    </span>
                    <span className="text-xs font-bold text-[#2F2B28]">
                      {slice.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 tabular-nums">
                    <span className="text-[11px] font-semibold text-[#6E675F]">
                      {slice.completedCount}/{slice.totalCount} completed (
                      {slice.completionRate}%)
                    </span>
                    <span
                      data-testid={`priority-row-share-${slice.priority}`}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E5DEC9] text-xs font-black text-[#2F2B28]"
                    >
                      {slice.totalCount} ({slice.percentageOfTotal}%)
                    </span>
                  </div>
                </div>

                {/* Dual Progress Bar: Share of Total Tasks */}
                <div className="w-full h-2 bg-[#EAE3D7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        slice.totalCount > 0
                          ? Math.max(slice.percentageOfTotal, 6)
                          : 0
                      }%`,
                      backgroundColor: slice.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Task Inspector Strip for Selected or Dominant Priority Level */}
      {inspectedSlice && (
        <div
          data-testid="priority-donut-task-inspector"
          data-inspected-priority={inspectedSlice.priority}
          className="pt-2.5 border-t border-[#F4F0E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Layers className="w-3.5 h-3.5 text-[#7A6E63]" />
            <span
              className="px-2 py-0.5 rounded text-[10px] font-extrabold"
              style={{
                backgroundColor: inspectedSlice.badgeBg,
                color: inspectedSlice.badgeText,
              }}
            >
              {inspectedSlice.priority} Priority Tasks ({inspectedSlice.totalCount})
            </span>
            {selectedPriority && (
              <button
                type="button"
                data-testid="priority-donut-clear-selection"
                onClick={() => setSelectedPriority(null)}
                className="text-[10.5px] font-semibold text-[#8A8279] hover:text-[#2F2B28] underline cursor-pointer"
              >
                Reset selection
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {inspectedSlice.tasks.length > 0 ? (
              inspectedSlice.tasks.slice(0, 5).map((task) => (
                <span
                  key={`${task.sourceLabel}-${task.id}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10.5px] font-semibold max-w-[220px] truncate ${
                    task.completed
                      ? 'bg-[#F3F8F5] border-[#CBE3D1] text-[#266841]'
                      : 'bg-[#FAF7F2] border-[#E5DEC9] text-[#3B3632]'
                  }`}
                >
                  {task.completed && (
                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-[#3F6F4A]" />
                  )}
                  <span className="truncate">{task.text}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] font-medium text-[#8A8279] italic">
                No tasks currently assigned to {inspectedSlice.priority} priority
              </span>
            )}
            {inspectedSlice.tasks.length > 5 && (
              <span className="text-[10.5px] font-bold text-[#7A7269] px-1.5">
                +{inspectedSlice.tasks.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
