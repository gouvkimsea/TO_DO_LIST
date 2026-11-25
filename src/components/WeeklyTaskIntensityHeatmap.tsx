import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { Flame, Clock, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  CustomCategoryDefinition,
  DayColumn,
  DetailedTask,
  TaskCategory,
  TaskIntensityCell,
  TaskIntensityLevel,
  ThemeId,
  THEMES,
  buildWeeklyTaskIntensityHeatmap,
  getAllCategories,
  getCategoryBadgeStyle,
} from '../utils/todoLogic';
import { PRIORITY_PILL_STYLES } from './InteractiveDashboard';

export interface WeeklyTaskIntensityHeatmapProps {
  columns: DayColumn[];
  detailedTasks?: DetailedTask[];
  activeTheme: ThemeId;
  customCategories?: CustomCategoryDefinition[];
  className?: string;
}

const THEME_HEATMAP_STOPS: Record<ThemeId, [string, string, string, string, string]> = {
  terracotta: ['#F7F3EC', '#F4DFCF', '#E7B696', '#D1845C', '#9A4E28'],
  candy: ['#F7F3EC', '#DEF2E7', '#ACE0C4', '#68B694', '#2D6A4F'],
  lavender: ['#F7F3EC', '#E7E3F6', '#C8BFE8', '#8E82C8', '#4E3F84'],
  neutral: ['#F7F3EC', '#EAE3DA', '#D2C2B2', '#A38F7D', '#5C4D3F'],
};

const INTENSITY_LEVEL_META: Record<
  TaskIntensityLevel,
  { label: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  peak: {
    label: 'Peak Window',
    badgeBg: '#FCEADE',
    badgeText: '#9A4E28',
    badgeBorder: '#F0CFB8',
  },
  high: {
    label: 'High Activity',
    badgeBg: '#FBF0D4',
    badgeText: '#876015',
    badgeBorder: '#EFE0B3',
  },
  medium: {
    label: 'Moderate Flow',
    badgeBg: '#DEF0E5',
    badgeText: '#2D6A46',
    badgeBorder: '#BFE0CC',
  },
  low: {
    label: 'Light Activity',
    badgeBg: '#EAE4F7',
    badgeText: '#564385',
    badgeBorder: '#D5C9EE',
  },
  none: {
    label: 'Quiet Window',
    badgeBg: '#F2EFE9',
    badgeText: '#7A7269',
    badgeBorder: '#E4DDD3',
  },
};

export const WeeklyTaskIntensityHeatmap: React.FC<
  WeeklyTaskIntensityHeatmapProps
> = ({
  columns,
  detailedTasks = [],
  activeTheme,
  customCategories,
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | TaskCategory>(
    'All'
  );
  const [metricMode, setMetricMode] = useState<'count' | 'share'>('count');
  const [activeCellId, setActiveCellId] = useState<string | null>(null);

  const theme = THEMES[activeTheme];
  const allCategories = useMemo(
    () => getAllCategories(customCategories),
    [customCategories]
  );

  const intensityData = useMemo(
    () =>
      buildWeeklyTaskIntensityHeatmap({
        columns,
        detailedTasks,
        categoryFilter: selectedCategory,
      }),
    [columns, detailedTasks, selectedCategory]
  );

  const paletteStops = THEME_HEATMAP_STOPS[activeTheme] ?? THEME_HEATMAP_STOPS.terracotta;

  // D3 SVG Geometry & Scales
  const svgLayout = useMemo(() => {
    const width = 760;
    const height = 208;
    const margin = { top: 20, right: 124, bottom: 20, left: 112 };
    const gridWidth = width - margin.left - margin.right;
    const gridHeight = height - margin.top - margin.bottom;

    const dayIds = intensityData.days.map((d) => d.dayId);
    const slotIds = intensityData.timeSlots.map((s) => s.id);

    const xScale = d3
      .scaleBand<string>()
      .domain(dayIds)
      .range([0, gridWidth])
      .paddingInner(0.1)
      .paddingOuter(0.02);

    const yScale = d3
      .scaleBand<string>()
      .domain(slotIds)
      .range([0, gridHeight])
      .paddingInner(0.12)
      .paddingOuter(0.03);

    const maxCount = Math.max(1, d3.max(intensityData.cells, (c) => c.count) ?? 1);
    const maxSlotTotal = Math.max(
      1,
      d3.max(intensityData.timeSlots, (s) => s.totalCompleted) ?? 1
    );

    const colorInterpolator = d3.interpolateRgbBasis(paletteStops);
    const colorScale = d3
      .scaleSequential(colorInterpolator)
      .domain([0, maxCount]);

    const profileBarScale = d3
      .scaleLinear()
      .domain([0, maxSlotTotal])
      .range([0, 72]);

    const legendSteps = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      ratio: t,
      color: t === 0 ? paletteStops[0] : colorInterpolator(0.22 + t * 0.78),
    }));

    return {
      width,
      height,
      margin,
      gridWidth,
      gridHeight,
      xScale,
      yScale,
      colorScale,
      colorInterpolator,
      profileBarScale,
      legendSteps,
    };
  }, [intensityData, paletteStops]);

  // Resolve active cell for the inspection panel (defaults to peakCell or Monday Morning Peak)
  const inspectedCell: TaskIntensityCell | null = useMemo(() => {
    if (activeCellId) {
      const matched = intensityData.cells.find((c) => c.cellId === activeCellId);
      if (matched) return matched;
    }
    if (intensityData.peakCell) {
      return intensityData.peakCell;
    }
    return intensityData.cells[1] ?? intensityData.cells[0] ?? null;
  }, [activeCellId, intensityData]);

  const getCellFillColor = (cell: TaskIntensityCell): string => {
    if (cell.count <= 0) {
      return 'var(--heatmap-empty-fill, #F7F3EC)';
    }
    // Ensure non-zero cells always have a distinct, visible warm tint (>= 0.28 on interpolator)
    const normalized =
      intensityData.maxCellCount <= 1
        ? 0.68
        : 0.28 + (cell.count / intensityData.maxCellCount) * 0.72;
    return svgLayout.colorInterpolator(Math.min(1, Math.max(0.28, normalized)));
  };

  const getCellTextColor = (cell: TaskIntensityCell): string => {
    if (cell.count <= 0) return 'var(--chart-tick-secondary, #9A9187)';
    const ratio =
      intensityData.maxCellCount <= 1
        ? 0.68
        : cell.count / intensityData.maxCellCount;
    return ratio >= 0.62 ? '#FFFFFF' : '#2F2B28';
  };

  return (
    <div
      data-testid="weekly-task-intensity-heatmap-card"
      data-total-completed={intensityData.totalCompletedTasks}
      data-max-cell-count={intensityData.maxCellCount}
      data-peak-slot-id={intensityData.peakTimeSlot?.id ?? 'none'}
      data-peak-day-id={intensityData.peakDay?.dayId ?? 'none'}
      className={`bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${className}`}
    >
      {/* Header Row: Title + Controls */}
      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 mb-2 border-b border-[#F4F0E8]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
              <Flame
                className="w-3 h-3 shrink-0"
                style={{ color: theme.checkboxBg }}
              />
              <span>D3 TIME-OF-DAY ANALYTICS</span>
            </span>
            {intensityData.peakTimeSlot && (
              <span
                data-testid="intensity-peak-window-pill"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: `${theme.progressFill}1F`,
                  color: theme.checkboxBg,
                }}
              >
                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                <span>
                  Peak: {intensityData.peakTimeSlot.periodName} (
                  {intensityData.peakTimeSlot.label})
                </span>
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#2F2B28] tracking-tight mt-0.5">
            Weekly Task Intensity Heat Map
          </h3>
          <p className="text-[11px] font-medium text-[#7A7269]">
            Visualizes the time of day most tasks are marked complete across Monday–Sunday
          </p>
        </div>

        {/* Display Mode Toggle + Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Legend Scale */}
          <div
            data-testid="intensity-heatmap-legend"
            aria-label="Task intensity color scale from low to peak"
            className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded-full px-2.5 py-0.5 text-[9.5px] font-bold text-[#6E665E]"
          >
            <span>Less</span>
            <div className="inline-flex items-center gap-1">
              {svgLayout.legendSteps.map((step, idx) => (
                <span
                  key={idx}
                  data-testid={`intensity-legend-swatch-${idx}`}
                  className="w-3 h-3 rounded-[3px] border border-[#DFD8CE]"
                  style={{ backgroundColor: step.color }}
                />
              ))}
            </div>
            <span>Peak</span>
          </div>

          {/* Count vs % Share Toggle */}
          <div
            role="group"
            aria-label="Heat map metric unit"
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E4DDD3]"
          >
            <button
              type="button"
              data-testid="intensity-mode-count"
              onClick={() => setMetricMode('count')}
              aria-pressed={metricMode === 'count'}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'count'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#2F2B28]'
              }`}
            >
              Task Count
            </button>
            <button
              type="button"
              data-testid="intensity-mode-share"
              onClick={() => setMetricMode('share')}
              aria-pressed={metricMode === 'share'}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'share'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E665E] hover:text-[#2F2B28]'
              }`}
            >
              % Share
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Strip + KPI Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div
          role="group"
          aria-label="Filter heat map by task category"
          data-testid="intensity-category-filter-bar"
          className="flex flex-wrap items-center gap-1"
        >
          <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-1">
            FILTER:
          </span>
          <button
            type="button"
            data-testid="intensity-category-filter-All"
            onClick={() => setSelectedCategory('All')}
            aria-pressed={selectedCategory === 'All'}
            className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer whitespace-nowrap leading-none ${
              selectedCategory === 'All'
                ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                : 'bg-[#FAF7F2] text-[#5A534C] border-[#DED8CE] hover:bg-[#EFECE6]'
            }`}
          >
            All Categories
          </button>
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const style = getCategoryBadgeStyle(cat, customCategories);
            return (
              <button
                key={cat}
                type="button"
                data-testid={`intensity-category-filter-${cat}`}
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat ? 'All' : cat))
                }
                aria-pressed={isSelected}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer whitespace-nowrap leading-none ${
                  isSelected
                    ? 'ring-2 ring-[#2F2B28]/45 scale-105 shadow-2xs'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  borderColor: style.border,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Summary KPI Strip */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#5A534C] tabular-nums">
          <span
            data-testid="intensity-summary-total"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#ECE7DF]"
          >
            <CheckCircle2 className="w-3 h-3 text-[#3B8457]" />
            <span>
              <strong className="font-black text-[#2F2B28]">
                {intensityData.totalCompletedTasks}
              </strong>{' '}
              completed
            </span>
          </span>
          <span
            data-testid="intensity-summary-peak-slot"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#ECE7DF]"
          >
            <Clock className="w-3 h-3 text-[#B05C37]" />
            <span>
              Peak Time:{' '}
              <strong className="font-black text-[#2F2B28]">
                {intensityData.peakTimeSlot
                  ? `${intensityData.peakTimeSlot.shortLabel} (${intensityData.peakTimeSlot.totalCompleted})`
                  : '—'}
              </strong>
            </span>
          </span>
          <span
            data-testid="intensity-summary-peak-day"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#ECE7DF]"
          >
            <Calendar className="w-3 h-3 text-[#5D508C]" />
            <span>
              Top Day:{' '}
              <strong className="font-black text-[#2F2B28]">
                {intensityData.peakDay
                  ? `${intensityData.peakDay.shortName} (${intensityData.peakDay.totalCompleted})`
                  : '—'}
              </strong>
            </span>
          </span>
        </div>
      </div>

      {/* Main Content Split: D3 Heat Map SVG Matrix + Active Cell Drill-Down Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.58fr_1fr] gap-3 items-stretch">
        {/* Left: D3 SVG Heat Map Visualization */}
        <div className="w-full bg-[#FAF8F5] rounded-xl border border-[#ECE7DF] p-2 sm:p-2.5 overflow-x-auto flex flex-col justify-center">
          <svg
            data-testid="weekly-task-intensity-d3-svg"
            viewBox={`0 0 ${svgLayout.width} ${svgLayout.height}`}
            role="grid"
            aria-label="Weekly Task Intensity D3 heat map showing completed tasks by day of week and time of day"
            className="w-full h-auto min-w-[540px] select-none"
          >
            <g
              transform={`translate(${svgLayout.margin.left}, ${svgLayout.margin.top})`}
            >
              {/* Column Headers: Days of the Week (Mon - Sun) */}
              {intensityData.days.map((day) => {
                const x = svgLayout.xScale(day.dayId) ?? 0;
                const bandW = svgLayout.xScale.bandwidth();
                const isPeakDay = intensityData.peakDay?.dayId === day.dayId;
                return (
                  <g
                    key={`col-header-${day.dayId}`}
                    transform={`translate(${x + bandW / 2}, -7)`}
                  >
                    <text
                      textAnchor="middle"
                      fill="var(--chart-tick-primary, #3B3632)"
                      className="text-[10.5px] font-bold"
                      style={{
                        fontWeight: isPeakDay ? 800 : 700,
                      }}
                    >
                      {day.shortName}
                    </text>
                  </g>
                );
              })}

              {/* Right Header Label for Time-of-Day Aggregate Profile */}
              <text
                x={svgLayout.gridWidth + 12}
                y={-7}
                fill="var(--chart-tick-secondary, #8A8279)"
                className="text-[9px] font-bold uppercase tracking-wider"
              >
                BY TIME WINDOW
              </text>

              {/* Row Labels + Heat Map Cells + Right-Side D3 Time-of-Day Aggregate Bars */}
              {intensityData.timeSlots.map((slot) => {
                const y = svgLayout.yScale(slot.id) ?? 0;
                const bandH = svgLayout.yScale.bandwidth();
                const isPeakSlot = intensityData.peakTimeSlot?.id === slot.id;
                const barWidth =
                  slot.totalCompleted > 0
                    ? Math.max(6, svgLayout.profileBarScale(slot.totalCompleted))
                    : 3;

                return (
                  <g key={`row-${slot.id}`} role="row">
                    {/* Left Y-Axis Time-of-Day Label */}
                    <g transform={`translate(-8, ${y + bandH / 2})`}>
                      <text
                        textAnchor="end"
                        dominantBaseline="central"
                        y={-3.5}
                        fill="var(--chart-tick-primary, #3B3632)"
                        className="text-[9.5px] font-bold"
                      >
                        {slot.periodName}
                      </text>
                      <text
                        textAnchor="end"
                        dominantBaseline="central"
                        y={6}
                        fill="var(--chart-tick-secondary, #8A8279)"
                        className="text-[8px] font-semibold tabular-nums"
                      >
                        {slot.label}
                      </text>
                    </g>

                    {/* Right-Side D3 Horizontal Profile Bar for Time Slot */}
                    <g
                      transform={`translate(${svgLayout.gridWidth + 12}, ${
                        y + bandH / 2 - 5
                      })`}
                      data-testid={`intensity-slot-profile-${slot.id}`}
                      data-slot-total={slot.totalCompleted}
                    >
                      <rect
                        x={0}
                        y={0}
                        width={72}
                        height={10}
                        rx={5}
                        fill="var(--chart-grid-stroke, #EFECE6)"
                      />
                      <rect
                        x={0}
                        y={0}
                        width={barWidth}
                        height={10}
                        rx={5}
                        fill={
                          isPeakSlot
                            ? theme.checkboxBg
                            : slot.totalCompleted > 0
                            ? theme.progressFill
                            : 'var(--chart-pending-fill, #DFD8CE)'
                        }
                      />
                      <text
                        x={78}
                        y={5.5}
                        dominantBaseline="central"
                        fill="var(--chart-tick-primary, #4A433C)"
                        className="text-[9px] font-bold tabular-nums"
                      >
                        {metricMode === 'count'
                          ? slot.totalCompleted
                          : `${slot.percentageOfTotal}%`}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 42 D3 Heat Map Cells (7 Days x 6 Time Slots) */}
              {intensityData.cells.map((cell) => {
                const x = svgLayout.xScale(cell.dayId) ?? 0;
                const y = svgLayout.yScale(cell.timeSlotId) ?? 0;
                const w = svgLayout.xScale.bandwidth();
                const h = svgLayout.yScale.bandwidth();
                const isSelected = inspectedCell?.cellId === cell.cellId;
                const fill = getCellFillColor(cell);
                const textColor = getCellTextColor(cell);
                const cellValueText =
                  cell.count === 0
                    ? '·'
                    : metricMode === 'count'
                    ? String(cell.count)
                    : `${cell.sharePercentage}%`;

                return (
                  <g
                    key={cell.cellId}
                    transform={`translate(${x}, ${y})`}
                    role="gridcell"
                    tabIndex={0}
                    aria-label={`${cell.dayName} ${cell.periodName} (${cell.timeSlotLabel}): ${cell.count} completed ${
                      cell.count === 1 ? 'task' : 'tasks'
                    } (${cell.sharePercentage}% of week)`}
                    data-testid={`intensity-heatmap-cell-${cell.dayId}-${cell.timeSlotId}`}
                    data-cell-id={cell.cellId}
                    data-cell-count={cell.count}
                    data-intensity-level={cell.intensityLevel}
                    onClick={() => setActiveCellId(cell.cellId)}
                    onMouseEnter={() => setActiveCellId(cell.cellId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveCellId(cell.cellId);
                      }
                    }}
                    className="cursor-pointer focus:outline-none"
                  >
                    <title>
                      {`${cell.dayName} · ${cell.periodName} (${cell.timeSlotLabel}): ${cell.count} completed task${
                        cell.count === 1 ? '' : 's'
                      }`}
                    </title>
                    <rect
                      x={0}
                      y={0}
                      width={w}
                      height={h}
                      rx={5}
                      fill={fill}
                      stroke={
                        isSelected
                          ? 'var(--heatmap-selected-stroke, #2F2B28)'
                          : cell.count > 0
                          ? 'rgba(47,43,40,0.14)'
                          : 'var(--heatmap-empty-stroke, #E6E0D6)'
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={w / 2}
                      y={h / 2 + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={textColor}
                      className="text-[10px] font-extrabold tabular-nums pointer-events-none"
                    >
                      {cellValueText}
                    </text>
                  </g>
                );
              })}

              {/* Bottom Day Totals Row */}
              {intensityData.days.map((day) => {
                const x = svgLayout.xScale(day.dayId) ?? 0;
                const bandW = svgLayout.xScale.bandwidth();
                return (
                  <text
                    key={`day-total-${day.dayId}`}
                    x={x + bandW / 2}
                    y={svgLayout.gridHeight + 13}
                    textAnchor="middle"
                    fill="var(--chart-tick-secondary, #6E665E)"
                    data-testid={`intensity-day-total-${day.dayId}`}
                    className="text-[9px] font-bold tabular-nums"
                  >
                    {metricMode === 'count'
                      ? `${day.totalCompleted} done`
                      : `${day.percentageOfTotal}%`}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right: Interactive Cell Inspector & Completed Tasks Time Breakdown */}
        <div
          data-testid="intensity-cell-inspector"
          data-inspected-cell-id={inspectedCell?.cellId ?? 'none'}
          className="bg-[#FAF8F5] rounded-xl border border-[#ECE7DF] p-3 sm:p-3.5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#ECE7DF]">
              <div>
                <span className="text-[9.5px] font-bold tracking-[0.14em] uppercase text-[#8A8279] block">
                  SELECTED TIME WINDOW
                </span>
                <h4
                  data-testid="intensity-inspector-title"
                  className="text-xs sm:text-sm font-bold text-[#2F2B28] mt-0.5"
                >
                  {inspectedCell
                    ? `${inspectedCell.dayName} · ${inspectedCell.periodName}`
                    : 'Select a heat map cell'}
                </h4>
                <span
                  data-testid="intensity-inspector-subtitle"
                  className="text-[10.5px] font-semibold text-[#7A7269] tabular-nums"
                >
                  {inspectedCell
                    ? `${inspectedCell.timeSlotLabel} (${inspectedCell.dateLabel})`
                    : 'Click or hover any cell in the grid'}
                </span>
              </div>

              {inspectedCell && (() => {
                const levelMeta =
                  INTENSITY_LEVEL_META[inspectedCell.intensityLevel];
                return (
                  <span
                    data-testid="intensity-inspector-level-badge"
                    className="px-2 py-0.5 rounded-full text-[9.5px] font-bold border shrink-0"
                    style={{
                      backgroundColor: levelMeta.badgeBg,
                      color: levelMeta.badgeText,
                      borderColor: levelMeta.badgeBorder,
                    }}
                  >
                    {levelMeta.label}
                  </span>
                );
              })()}
            </div>

            {/* Tasks Completed in This Window */}
            {inspectedCell && inspectedCell.tasks.length > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#6E665E] mb-1">
                  <span>
                    Completed in this window ({inspectedCell.tasks.length})
                  </span>
                  <span className="tabular-nums">
                    {inspectedCell.sharePercentage}% of weekly total
                  </span>
                </div>
                <div
                  data-testid="intensity-inspector-task-list"
                  className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5"
                >
                  {inspectedCell.tasks.map((task) => {
                    const catStyle = getCategoryBadgeStyle(
                      task.category,
                      customCategories
                    );
                    const prioStyle = PRIORITY_PILL_STYLES[task.priority];
                    return (
                      <div
                        key={task.id}
                        data-testid={`intensity-inspector-task-${task.id}`}
                        className="bg-white rounded-lg border border-[#ECE7DF] px-2.5 py-1.5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-[#2F2B28] truncate">
                            {task.text}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9.5px] font-bold text-[#7A7269] tabular-nums">
                              {task.formattedTime}
                            </span>
                            <span
                              className="px-1.5 py-0.2 rounded text-[8.5px] font-bold border leading-none"
                              style={{
                                backgroundColor: catStyle.bg,
                                color: catStyle.text,
                                borderColor: catStyle.border,
                              }}
                            >
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                          style={{
                            backgroundColor: prioStyle.bg,
                            color: prioStyle.text,
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                data-testid="intensity-inspector-empty"
                className="py-6 text-center space-y-1"
              >
                <p className="text-xs font-bold text-[#5A534C]">
                  No tasks marked complete in this window
                </p>
                <p className="text-[10.5px] font-medium text-[#8A8279]">
                  Check off tasks in the board above or hover a highlighted cell to inspect completion times.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Insight Footer */}
          <div
            data-testid="intensity-insight-footer"
            className="mt-3 pt-2 border-t border-[#ECE7DF] flex items-center justify-between gap-2 text-[10px] font-semibold text-[#6E665E]"
          >
            <span>
              {intensityData.peakTimeSlot
                ? `Most completions happen during ${intensityData.peakTimeSlot.periodName} (${intensityData.peakTimeSlot.percentageOfTotal}% of week)`
                : 'Mark tasks complete to reveal your peak productivity hours'}
            </span>
            {activeCellId && (
              <button
                type="button"
                data-testid="intensity-reset-selection-btn"
                onClick={() => setActiveCellId(null)}
                className="text-[9.5px] font-bold text-[#B05C37] hover:underline shrink-0 cursor-pointer"
              >
                Jump to Peak
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
