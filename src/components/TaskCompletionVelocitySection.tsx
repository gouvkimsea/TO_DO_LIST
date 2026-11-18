import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Award,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  DayColumn,
  ThemeId,
  THEMES,
  calculateTaskCompletionVelocity,
} from '../utils/todoLogic';

interface TaskCompletionVelocitySectionProps {
  columns: DayColumn[];
  selectedDate: string;
  activeTheme: ThemeId;
}

export const TaskCompletionVelocitySection: React.FC<
  TaskCompletionVelocitySectionProps
> = ({ columns, selectedDate, activeTheme }) => {
  const [chartView, setChartView] = useState<'composed' | 'trajectory'>(
    'composed'
  );
  const theme = THEMES[activeTheme];

  const velocity = useMemo(
    () => calculateTaskCompletionVelocity(columns, selectedDate),
    [columns, selectedDate]
  );

  const deltaAvgSign =
    velocity.velocityDeltaVsThreeWeekAvg > 0
      ? `+${velocity.velocityDeltaVsThreeWeekAvg}%`
      : `${velocity.velocityDeltaVsThreeWeekAvg}%`;

  const deltaLastWeekSign =
    velocity.velocityDeltaVsLastWeek > 0
      ? `+${velocity.velocityDeltaVsLastWeek}%`
      : `${velocity.velocityDeltaVsLastWeek}%`;

  const momentumBadgeStyle =
    velocity.momentumDirection === 'up'
      ? {
          bg: '#E3F3E8',
          text: '#1F6338',
          border: '#B8DEC6',
        }
      : velocity.momentumDirection === 'down'
      ? {
          bg: '#FBEAE8',
          text: '#A13528',
          border: '#EBC2BA',
        }
      : {
          bg: '#F4EFE6',
          text: '#5A524A',
          border: '#E2D9CC',
        };

  return (
    <section
      aria-label="Task Completion Velocity"
      data-testid="task-completion-velocity-section"
      className="w-full max-w-4xl mx-auto bg-[#FDFBF7] rounded-2xl border border-[#E5DEC9] shadow-[0_14px_34px_-12px_rgba(68,53,39,0.09)] p-4 sm:p-6 space-y-4"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#ECE5DA]">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap
              className="w-3.5 h-3.5 shrink-0"
              style={{ color: theme.progressFill }}
            />
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#9A8F82]">
              4-WEEK VELOCITY BENCHMARK
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2F2B28] tracking-tight">
            Task Completion Velocity
          </h3>
          <p className="text-xs font-medium text-[#8A8279] mt-0.5">
            Comparing This Week&apos;s completion rate ({velocity.currentCompletionRate}%) against your previous three weeks ({velocity.threeWeekAvgRate}% avg)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Momentum Status Pill */}
          <div
            data-testid="velocity-momentum-badge"
            style={{
              backgroundColor: momentumBadgeStyle.bg,
              color: momentumBadgeStyle.text,
              borderColor: momentumBadgeStyle.border,
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold tabular-nums"
          >
            {velocity.momentumDirection === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            ) : velocity.momentumDirection === 'down' ? (
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Minus className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{velocity.momentumLabel}</span>
            <span className="opacity-85">
              ({deltaAvgSign} vs 3-Wk Avg)
            </span>
          </div>

          {/* Chart Mode Switcher */}
          <div
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E4DDD3]"
            role="group"
            aria-label="Velocity chart display mode"
          >
            <button
              type="button"
              data-testid="velocity-chart-mode-composed"
              onClick={() => setChartView('composed')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                chartView === 'composed'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#7A7269] hover:text-[#2F2B28]'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Rate vs. 3-Wk Avg</span>
            </button>
            <button
              type="button"
              data-testid="velocity-chart-mode-trajectory"
              onClick={() => setChartView('trajectory')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full transition-colors cursor-pointer ${
                chartView === 'trajectory'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#7A7269] hover:text-[#2F2B28]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Velocity Curve</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Current Week Completion Rate */}
        <div
          data-testid="velocity-kpi-current-rate"
          className="bg-white rounded-xl border border-[#EAE3D8] p-3 flex flex-col justify-between"
        >
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#8A8279]">
            This Week Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="text-xl sm:text-2xl font-black tabular-nums"
              style={{ color: theme.progressFill }}
            >
              {velocity.currentCompletionRate}%
            </span>
            <span className="text-[10px] font-bold text-[#6E675F] tabular-nums">
              ({velocity.currentWeek.completed}/{velocity.currentWeek.total})
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#8A8279] mt-1">
            {velocity.currentWeek.dateRange}
          </span>
        </div>

        {/* Card 2: Previous 3-Week Average */}
        <div
          data-testid="velocity-kpi-three-week-avg"
          className="bg-white rounded-xl border border-[#EAE3D8] p-3 flex flex-col justify-between"
        >
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#8A8279]">
            Prior 3-Week Avg
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#2F2B28] tabular-nums">
              {velocity.threeWeekAvgRate}%
            </span>
            <span className="text-[10px] font-bold text-[#6E675F] tabular-nums">
              (~{velocity.threeWeekAvgCompleted} tasks/wk)
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#8A8279] mt-1">
            Baseline from previous 3 weeks
          </span>
        </div>

        {/* Card 3: Velocity Delta vs 3-Week Avg & Last Week */}
        <div
          data-testid="velocity-kpi-delta-avg"
          className="bg-white rounded-xl border border-[#EAE3D8] p-3 flex flex-col justify-between"
        >
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#8A8279]">
            Net Velocity Delta
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-black tabular-nums ${
                velocity.velocityDeltaVsThreeWeekAvg > 0
                  ? 'text-[#1F6338]'
                  : velocity.velocityDeltaVsThreeWeekAvg < 0
                  ? 'text-[#A13528]'
                  : 'text-[#2F2B28]'
              }`}
            >
              {deltaAvgSign}
            </span>
            <span className="text-[10px] font-bold text-[#6E675F]">
              vs 3-wk avg
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#6E675F] mt-1 tabular-nums">
            {deltaLastWeekSign} vs Last Week (
            {velocity.previousThreeWeeks[2]?.completionRate ?? 0}%)
          </span>
        </div>

        {/* Card 4: Daily Completion Velocity & Velocity Index */}
        <div
          data-testid="velocity-kpi-daily-pace"
          className="bg-white rounded-xl border border-[#EAE3D8] p-3 flex flex-col justify-between"
        >
          <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#8A8279]">
            Daily Pace &amp; Index
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#2F2B28] tabular-nums">
              {velocity.currentWeek.dailyVelocity}
            </span>
            <span className="text-[10px] font-bold text-[#6E675F]">
              tasks/day
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#8A8279] mt-1 tabular-nums">
            3-wk avg: {velocity.threeWeekAvgDailyVelocity}/day · Index:{' '}
            <strong className="text-[#2F2B28]">{velocity.velocityIndex}%</strong>
          </span>
        </div>
      </div>

      {/* Main Recharts Velocity Comparison Chart */}
      <div
        data-testid="velocity-comparison-chart"
        className="w-full h-64 sm:h-72 bg-white rounded-xl border border-[#ECE7DF] p-2.5 sm:p-4 overflow-hidden min-w-0"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={velocity.weeks}
            margin={{ top: 12, right: 18, left: -10, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid-stroke, #EFECE6)"
            />
            <XAxis
              dataKey="weekLabel"
              tick={{
                fill: 'var(--chart-tick-primary, #4A433C)',
                fontSize: 11,
                fontWeight: 700,
              }}
              axisLine={{ stroke: 'var(--chart-axis-stroke, #E5DEC9)' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={{
                fill: 'var(--chart-tick-secondary, #8A8279)',
                fontSize: 11,
                fontWeight: 600,
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--chart-cursor-fill, #FAF6F0)' }}
              contentStyle={{
                backgroundColor: 'var(--chart-tooltip-bg, #FDFBF7)',
                borderColor: 'var(--chart-tooltip-border, #E5DEC9)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--chart-tooltip-text, #2F2B28)',
                boxShadow: '0 10px 24px -6px rgba(0,0,0,0.22)',
              }}
              formatter={(value, name, item) => {
                const payload = item?.payload;
                if (name === 'completionRate') {
                  return [
                    `${value ?? 0}% (${payload?.completed ?? 0}/${
                      payload?.total ?? 0
                    } tasks · ${payload?.dailyVelocity ?? 0}/day)`,
                    'Completion Rate',
                  ];
                }
                if (name === 'threeWeekAvgBenchmark') {
                  return [`${value ?? 0}%`, 'Prior 3-Week Avg'];
                }
                return [`${value ?? 0}%`, 'Velocity Trend'];
              }}
              labelFormatter={(label, payload) => {
                const pt = payload?.[0]?.payload;
                if (!pt) return String(label ?? '');
                const deltaStr =
                  pt.deltaVsThreeWeekAvg > 0
                    ? `+${pt.deltaVsThreeWeekAvg}% vs 3-Wk Avg`
                    : `${pt.deltaVsThreeWeekAvg}% vs 3-Wk Avg`;
                return `${pt.weekLabel} (${pt.dateRange}) · ${deltaStr}`;
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                fontWeight: 700,
                paddingTop: 6,
              }}
              formatter={(value) => {
                if (value === 'completionRate') return 'Weekly Completion Rate (%)';
                if (value === 'threeWeekAvgBenchmark')
                  return `Prior 3-Week Avg (${velocity.threeWeekAvgRate}%)`;
                return 'Velocity Trajectory';
              }}
            />
            <ReferenceLine
              y={velocity.threeWeekAvgRate}
              stroke="#9A6B4C"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `3-Wk Avg (${velocity.threeWeekAvgRate}%)`,
                position: 'insideTopRight',
                fill: '#7A543B',
                fontSize: 10,
                fontWeight: 700,
              }}
            />
            {chartView === 'composed' ? (
              <Bar
                dataKey="completionRate"
                name="completionRate"
                radius={[8, 8, 0, 0]}
                maxBarSize={54}
              >
                {velocity.weeks.map((entry) => (
                  <Cell
                    key={entry.weekKey}
                    fill={
                      entry.isCurrentWeek
                        ? theme.progressFill
                        : '#D8CFC2'
                    }
                  />
                ))}
              </Bar>
            ) : (
              <Area
                type="monotone"
                dataKey="completionRate"
                name="completionRate"
                stroke={theme.progressFill}
                fill={theme.progressFill}
                fillOpacity={0.18}
                strokeWidth={2.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="completionRate"
              name="velocityTrajectory"
              stroke="#2F2B28"
              strokeWidth={2.2}
              dot={{
                r: 4,
                fill: '#2F2B28',
                strokeWidth: 2,
                stroke: '#FFFFFF',
              }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 4-Week Side-by-Side Breakdown Strip */}
      <div
        data-testid="velocity-week-breakdown-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
      >
        {velocity.weeks.map((wk) => {
          const isPeak = velocity.peakWeek.weekKey === wk.weekKey;
          const wowSign =
            wk.wowDeltaRate === null
              ? 'Baseline'
              : wk.wowDeltaRate > 0
              ? `+${wk.wowDeltaRate}% WoW`
              : wk.wowDeltaRate < 0
              ? `${wk.wowDeltaRate}% WoW`
              : '0% WoW';

          return (
            <div
              key={wk.weekKey}
              data-testid={`velocity-week-card-${wk.weekKey}`}
              className={`rounded-xl border p-3 transition-all ${
                wk.isCurrentWeek
                  ? 'bg-[#FAF6F0] border-[#C87D55] ring-1 ring-[#C87D55]/30'
                  : 'bg-white border-[#ECE7DF]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-[#2F2B28]">
                  {wk.weekLabel}
                </span>
                <div className="flex items-center gap-1">
                  {isPeak && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FAE8CE] text-[#946016] text-[8.5px] font-extrabold uppercase">
                      <Award className="w-2.5 h-2.5" />
                      Peak
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                      wk.wowDeltaRate === null
                        ? 'bg-[#F2EFE9] text-[#7A7269]'
                        : wk.wowDeltaRate > 0
                        ? 'bg-[#E3F3E8] text-[#1F6338]'
                        : wk.wowDeltaRate < 0
                        ? 'bg-[#FBEAE8] text-[#A13528]'
                        : 'bg-[#F2EFE9] text-[#6E675F]'
                    }`}
                  >
                    {wowSign}
                  </span>
                </div>
              </div>

              <div className="text-[10px] font-medium text-[#8A8279] mt-0.5">
                {wk.dateRange}
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black text-[#2F2B28] tabular-nums">
                  {wk.completionRate}%
                </span>
                <span className="text-[10px] font-bold text-[#6E675F] tabular-nums">
                  {wk.completed}/{wk.total} done · {wk.dailyVelocity}/d
                </span>
              </div>

              <div className="mt-1.5 w-full h-1.5 bg-[#EFECE6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${wk.completionRate}%`,
                    backgroundColor: wk.isCurrentWeek
                      ? theme.progressFill
                      : '#9A8F82',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Analytical Insight Banner */}
      <div
        data-testid="velocity-insight-banner"
        className="rounded-xl bg-[#F6F2EA] border border-[#E6DFD3] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2"
      >
        <p className="text-xs font-semibold text-[#4A433C]">
          {velocity.insightSummary}
        </p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8279] shrink-0">
          Auto-updates on task toggle
        </span>
      </div>
    </section>
  );
};
