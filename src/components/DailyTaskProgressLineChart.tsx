import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, CheckCircle2, Calendar, Award } from 'lucide-react';
import {
  DayColumn,
  DailyTaskProgressPoint,
  ThemeId,
  THEMES,
  buildDailyTaskProgressLineData,
} from '../utils/todoLogic';

export interface DailyTaskProgressLineChartProps {
  columns: DayColumn[];
  activeTheme: ThemeId;
  className?: string;
}

interface CustomLineTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: DailyTaskProgressPoint;
  }>;
  themeColor: string;
  viewMode: 'daily' | 'cumulative';
}

const CustomDailyProgressTooltip: React.FC<CustomLineTooltipProps> = ({
  active,
  payload,
  themeColor,
  viewMode,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div
      data-testid="daily-progress-line-tooltip"
      className="rounded-xl p-3 min-w-[205px] max-w-[250px] text-xs"
      style={{
        backgroundColor: 'var(--chart-tooltip-bg, #FFFFFF)',
        border: '1px solid var(--chart-tooltip-border, #E5DEC9)',
        boxShadow: 'var(--chart-tooltip-shadow, 0 8px 24px rgba(0,0,0,0.08))',
      }}
    >
      <div
        className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b"
        style={{ borderColor: 'var(--chart-tooltip-divider, #F4F0E8)' }}
      >
        <span
          className="font-bold"
          style={{ color: 'var(--chart-tooltip-title, #2F2B28)' }}
        >
          {point.dayName} ({point.dateLabel})
        </span>
        {point.isToday && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: themeColor }}
          >
            Today
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-semibold flex items-center gap-1.5"
            style={{ color: 'var(--chart-tooltip-label, #6E675F)' }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: themeColor }}
            />
            Completed Today
          </span>
          <span
            className="font-black tabular-nums"
            style={{ color: 'var(--chart-tooltip-title, #2F2B28)' }}
          >
            {point.completed} of {point.total} ({point.completionRate}%)
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span
            className="font-semibold flex items-center gap-1.5"
            style={{ color: 'var(--chart-tooltip-label, #6E675F)' }}
          >
            <span className="w-2 h-2 rounded-full inline-block bg-[#B8AFA3]" />
            Pending Tasks
          </span>
          <span
            className="font-bold tabular-nums"
            style={{ color: 'var(--chart-tooltip-muted, #5A534C)' }}
          >
            {point.pending}
          </span>
        </div>

        <div
          className="flex items-center justify-between gap-3 pt-1 border-t"
          style={{ borderColor: 'var(--chart-tooltip-divider, #F4F0E8)' }}
        >
          <span
            className="font-semibold"
            style={{ color: 'var(--chart-tooltip-label, #6E675F)' }}
          >
            {viewMode === 'cumulative' ? 'Cumulative Total' : 'Week Running Total'}
          </span>
          <span
            className="font-black tabular-nums"
            style={{ color: themeColor }}
          >
            {point.cumulativeCompleted} tasks
          </span>
        </div>

        {point.completedTaskTitles.length > 0 && (
          <div
            className="pt-1.5 mt-1 border-t space-y-0.5"
            style={{ borderColor: 'var(--chart-tooltip-divider, #F4F0E8)' }}
          >
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8A8279] block">
              Logged Completions:
            </span>
            {point.completedTaskTitles.slice(0, 3).map((title, idx) => (
              <div
                key={idx}
                className="text-[10.5px] font-medium text-[#4A433C] truncate flex items-center gap-1"
              >
                <span className="text-[#3F6F4A] font-bold">✓</span>
                <span className="truncate">{title}</span>
              </div>
            ))}
            {point.completedTaskTitles.length > 3 && (
              <span className="text-[9.5px] font-semibold text-[#8A8279] block">
                +{point.completedTaskTitles.length - 3} more completed
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DailyTaskProgressLineChart: React.FC<
  DailyTaskProgressLineChartProps
> = ({ columns, activeTheme, className = '' }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const theme = THEMES[activeTheme];
  const summary = useMemo(
    () => buildDailyTaskProgressLineData(columns),
    [columns]
  );

  const selectedDayPoint = useMemo(() => {
    if (selectedDayId) {
      return summary.points.find((p) => p.dayId === selectedDayId) ?? null;
    }
    return (
      summary.points.find((p) => p.isToday) ??
      summary.peakDay ??
      summary.points[0] ??
      null
    );
  }, [selectedDayId, summary]);

  const yAxisMax = useMemo(() => {
    if (viewMode === 'cumulative') {
      return Math.max(summary.totalScheduled, summary.totalCompleted, 5);
    }
    const maxTotal = summary.points.reduce(
      (max, p) => Math.max(max, p.total, p.completed),
      0
    );
    return Math.max(maxTotal + 1, 5);
  }, [summary, viewMode]);

  return (
    <div
      data-testid="daily-task-progress-line-chart"
      data-total-completed={summary.totalCompleted}
      data-total-scheduled={summary.totalScheduled}
      data-weekly-rate={summary.weeklyCompletionRate}
      data-view-mode={viewMode}
      className={`bg-white rounded-2xl border border-[#ECE7DF] p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between ${className}`}
    >
      {/* Header Row: Title + KPI Summary Pills + Daily/Cumulative Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-2.5 mb-2 border-b border-[#F4F0E8]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
              <TrendingUp
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: theme.checkboxBg }}
              />
              <span>DAILY TASK PROGRESS LOG (CURRENT WEEK)</span>
            </span>
            <span
              data-testid="daily-progress-line-live-badge"
              className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${theme.progressFill}22`,
                color: theme.checkboxBg,
              }}
            >
              Live Mon–Sun Tracker
            </span>
          </div>
          <p className="text-[11px] font-medium text-[#7A7269] mt-0.5">
            Tracks how many tasks are completed each day across the current week
            — updates automatically as you check off tasks.
          </p>
        </div>

        {/* Summary KPI Pills + View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            data-testid="daily-progress-kpi-completed"
            className="bg-[#FAF7F2] border border-[#ECE7DF] rounded-xl px-2.5 py-1 flex items-center gap-1.5"
          >
            <CheckCircle2
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: theme.checkboxBg }}
            />
            <div>
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#8A8279] block leading-none">
                Week Logged
              </span>
              <span className="text-xs font-black text-[#2F2B28] tabular-nums">
                {summary.totalCompleted}/{summary.totalScheduled} tasks
              </span>
            </div>
          </div>

          <div
            data-testid="daily-progress-kpi-average"
            className="bg-[#FAF7F2] border border-[#ECE7DF] rounded-xl px-2.5 py-1 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#7A6E63] shrink-0" />
            <div>
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#8A8279] block leading-none">
                Daily Avg
              </span>
              <span className="text-xs font-black text-[#2F2B28] tabular-nums">
                {summary.averageDailyCompleted}/day
              </span>
            </div>
          </div>

          {summary.peakDay && (
            <div
              data-testid="daily-progress-kpi-peak"
              className="bg-[#FAF7F2] border border-[#ECE7DF] rounded-xl px-2.5 py-1 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
              <div>
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#8A8279] block leading-none">
                  Peak Day
                </span>
                <span className="text-xs font-black text-[#2F2B28] tabular-nums">
                  {summary.peakDay.shortDay} ({summary.peakDay.completed})
                </span>
              </div>
            </div>
          )}

          {/* Mode Toggle: Daily Completed vs Cumulative */}
          <div
            role="group"
            aria-label="Daily task progress chart mode"
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E5DEC9]"
          >
            <button
              type="button"
              data-testid="daily-progress-mode-daily"
              onClick={() => setViewMode('daily')}
              aria-pressed={viewMode === 'daily'}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E675F] hover:text-[#2F2B28]'
              }`}
            >
              Daily Count
            </button>
            <button
              type="button"
              data-testid="daily-progress-mode-cumulative"
              onClick={() => setViewMode('cumulative')}
              aria-pressed={viewMode === 'cumulative'}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'cumulative'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#6E675F] hover:text-[#2F2B28]'
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>
      </div>

      {/* Line Chart Canvas */}
      <div
        data-testid="daily-progress-line-canvas"
        className="w-full h-[185px] sm:h-[210px] mt-1"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={summary.points}
            margin={{ top: 10, right: 16, left: -18, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid-stroke, #EFECE6)"
            />
            <XAxis
              dataKey="shortDay"
              axisLine={false}
              tickLine={false}
              height={34}
              tick={(props: {
                x?: number | string;
                y?: number | string;
                payload?: { value?: string; index?: number };
              }) => {
                const x = Number(props.x ?? 0);
                const y = Number(props.y ?? 0);
                const idx = props.payload?.index ?? 0;
                const pt = summary.points[idx];
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={11}
                      textAnchor="middle"
                      fill={
                        pt?.isToday
                          ? theme.checkboxBg
                          : 'var(--chart-tick-primary, #4A433C)'
                      }
                      fontSize={11}
                      fontWeight={pt?.isToday ? 800 : 700}
                    >
                      {pt?.shortDay || props.payload?.value}
                    </text>
                    {pt && (
                      <text
                        x={0}
                        y={0}
                        dy={23}
                        textAnchor="middle"
                        fill="var(--chart-tick-secondary, #8A8279)"
                        fontSize={9}
                        fontWeight={600}
                      >
                        {pt.dateLabel}
                      </text>
                    )}
                  </g>
                );
              }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, yAxisMax]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: 'var(--chart-tick-secondary, #8A8279)',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <Tooltip
              content={
                <CustomDailyProgressTooltip
                  themeColor={theme.checkboxBg}
                  viewMode={viewMode}
                />
              }
              cursor={{
                stroke: 'var(--chart-cursor-stroke, #D9D1C5)',
                strokeWidth: 1.5,
                strokeDasharray: '3 3',
              }}
            />

            {viewMode === 'daily' ? (
              <>
                {/* Reference Line: Total Scheduled Tasks per Day */}
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Scheduled Tasks"
                  stroke="#C7BDB0"
                  strokeWidth={1.75}
                  strokeDasharray="4 4"
                  dot={{
                    r: 3,
                    fill: '#FAF7F2',
                    stroke: '#B5A99A',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 4.5,
                    fill: '#B5A99A',
                    stroke: '#FFFFFF',
                    strokeWidth: 1.5,
                  }}
                  animationDuration={350}
                />
                {/* Primary Line: Completed Tasks per Day */}
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke={theme.checkboxBg}
                  strokeWidth={3}
                  dot={{
                    r: 4.5,
                    fill: '#FFFFFF',
                    stroke: theme.checkboxBg,
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 6.5,
                    fill: theme.checkboxBg,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                  }}
                  animationDuration={350}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey="cumulativeCompleted"
                name="Cumulative Completed"
                stroke={theme.checkboxBg}
                strokeWidth={3}
                dot={{
                  r: 4.5,
                  fill: '#FFFFFF',
                  stroke: theme.checkboxBg,
                  strokeWidth: 2.5,
                }}
                activeDot={{
                  r: 6.5,
                  fill: theme.checkboxBg,
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
                animationDuration={350}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Day-by-Day Interactive Progress Log Strip */}
      <div className="pt-2.5 mt-1 border-t border-[#F4F0E8] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-[#8A8279]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: theme.checkboxBg }}
              />
              <span className="text-[#4A433C] font-bold">
                {viewMode === 'daily'
                  ? 'Completed Tasks (per day)'
                  : 'Cumulative Completed Tasks'}
              </span>
            </span>
            {viewMode === 'daily' && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#B5A99A] inline-block" />
                <span>Total Scheduled</span>
              </span>
            )}
          </div>
          <span className="tabular-nums">
            {summary.activeDaysCount} of 7 days with logged completions
          </span>
        </div>

        {/* 7-Day Interactive Pill Strip */}
        <div
          role="list"
          aria-label="Daily task progress log by day"
          className="grid grid-cols-7 gap-1 sm:gap-1.5"
        >
          {summary.points.map((pt, index) => {
            const isSelected = selectedDayPoint?.dayId === pt.dayId;
            const dayHeaderBg =
              theme.dayHeaders[index] || `${theme.progressFill}22`;

            return (
              <button
                key={pt.dayId}
                type="button"
                data-testid={`daily-progress-log-pill-${pt.dayId}`}
                data-completed={pt.completed}
                data-total={pt.total}
                onClick={() =>
                  setSelectedDayId((prev) =>
                    prev === pt.dayId ? null : pt.dayId
                  )
                }
                aria-pressed={isSelected}
                title={`${pt.dayName} (${pt.dateLabel}): ${pt.completed} of ${pt.total} tasks completed (${pt.completionRate}%)`}
                className={`rounded-xl border px-1.5 py-1.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#2F2B28]/40 bg-[#FAF7F2] border-[#C9B9A6] shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-[#F3EFE8] border-[#ECE7DF]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#4A433C]">
                    {pt.shortDay}
                  </span>
                  {pt.isToday && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: theme.checkboxBg }}
                    />
                  )}
                </div>

                <span
                  data-testid={`daily-progress-log-count-${pt.dayId}`}
                  className="my-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-black text-[#2F2B28] tabular-nums"
                  style={{ backgroundColor: dayHeaderBg }}
                >
                  {viewMode === 'daily'
                    ? `${pt.completed}/${pt.total}`
                    : `${pt.cumulativeCompleted}`}
                </span>

                <span className="text-[9px] font-bold text-[#8A8279] tabular-nums">
                  {pt.completionRate}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Logged Task Details */}
        {selectedDayPoint && (
          <div
            data-testid="daily-progress-selected-day-log"
            className="rounded-xl bg-[#FAF7F2] border border-[#ECE7DF] px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]"
          >
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="font-bold text-[#2F2B28] shrink-0">
                {selectedDayPoint.dayName} ({selectedDayPoint.dateLabel}):
              </span>
              <span
                className="font-bold tabular-nums shrink-0"
                style={{ color: theme.checkboxBg }}
              >
                {selectedDayPoint.completed} completed
              </span>
              <span className="text-[#8A8279] shrink-0">
                · {selectedDayPoint.pending} pending
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {selectedDayPoint.completedTaskTitles.length > 0 ? (
                selectedDayPoint.completedTaskTitles.map((title, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#E5DEC9] text-[10px] font-semibold text-[#3B3632] max-w-[200px] truncate"
                  >
                    <span className="text-[#3F6F4A] font-bold">✓</span>
                    <span className="truncate">{title}</span>
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-medium text-[#8A8279] italic">
                  No completed tasks logged on {selectedDayPoint.dayName} yet
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
