import React, { useMemo, useState } from 'react';
import {
  Lightbulb,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  DashboardMetrics,
  DayColumn,
  DetailedTask,
  ThemeId,
  THEMES,
  DailyTipCategory,
  resolveDailyTipRecommendation,
} from '../utils/todoLogic';

export interface DailyTipCardProps {
  metrics: DashboardMetrics;
  columns: DayColumn[];
  detailedTasks?: DetailedTask[];
  activeTheme: ThemeId;
  className?: string;
}

function renderTipCategoryIcon(category: DailyTipCategory) {
  const iconClass = 'w-4 h-4 shrink-0';
  switch (category) {
    case 'completed':
      return <CheckCircle2 className={iconClass} />;
    case 'final-stretch':
      return <Flame className={iconClass} />;
    case 'high-priority':
      return <AlertCircle className={iconClass} />;
    case 'kickoff':
      return <Zap className={iconClass} />;
    case 'empty':
      return <Sparkles className={iconClass} />;
    case 'momentum':
    default:
      return <Lightbulb className={iconClass} />;
  }
}

export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  metrics,
  columns,
  detailedTasks = [],
  activeTheme,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const theme = THEMES[activeTheme];

  const highPriorityPendingCount = useMemo(() => {
    let count = 0;
    for (const col of columns) {
      for (const task of col.tasks) {
        const clean = task.text.trim();
        if (!clean || clean === '—') continue;
        if (!task.completed && task.priority === 'High') {
          count += 1;
        }
      }
    }
    if (count === 0 && detailedTasks.length > 0) {
      for (const dt of detailedTasks) {
        const clean = dt.text.trim();
        if (!clean || clean === '—') continue;
        if (!dt.completed && dt.priority === 'High') {
          count += 1;
        }
      }
    }
    return count;
  }, [columns, detailedTasks]);

  const tip = useMemo(
    () =>
      resolveDailyTipRecommendation({
        totalTasks: metrics.totalTasks,
        completedTasks: metrics.completedTasks,
        completionPercentage: metrics.completionPercentage,
        highPriorityPendingCount,
      }),
    [
      metrics.totalTasks,
      metrics.completedTasks,
      metrics.completionPercentage,
      highPriorityPendingCount,
    ]
  );

  if (isDismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Daily Productivity Tip"
      data-testid="daily-tip-card"
      data-tip-id={tip.id}
      data-tip-category={tip.category}
      data-completed-tasks={tip.completedTasks}
      data-total-tasks={tip.totalTasks}
      data-completion-pct={tip.completionPercentage}
      className={`bg-[#FDFBF7] border border-[#E5DEC9] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start sm:items-center justify-between gap-3 transition-all ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Theme-Tinted Tip Icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-[#E5DEC9]/80 shadow-2xs mt-0.5 sm:mt-0"
          style={{
            backgroundColor: `${theme.progressFill}24`,
            color: theme.checkboxBg,
          }}
        >
          {renderTipCategoryIcon(tip.category)}
        </div>

        {/* Tip Text Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[9.5px] font-extrabold tracking-[0.16em] uppercase text-[#8A8279]">
              DAILY TIP
            </span>
            <span
              data-testid="daily-tip-badge"
              className="px-2 py-0.5 rounded-full text-[9.5px] font-bold leading-none"
              style={{
                backgroundColor: `${theme.progressFill}22`,
                color: theme.checkboxBg,
              }}
            >
              {tip.badgeLabel}
            </span>
            <h3
              data-testid="daily-tip-title"
              className="text-xs sm:text-[13px] font-bold text-[#2F2B28] leading-snug"
            >
              {tip.title}
            </h3>
          </div>

          <p
            data-testid="daily-tip-message"
            className="text-[11px] sm:text-xs font-medium text-[#6E675F] mt-0.5 leading-relaxed"
          >
            {tip.message}{' '}
            <span className="font-semibold text-[#4A433C]">
              · {tip.actionHint}
            </span>
          </p>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        data-testid="daily-tip-dismiss-btn"
        aria-label="Dismiss daily tip"
        title="Dismiss daily tip"
        className="p-1.5 rounded-full text-[#8A8279] hover:text-[#2F2B28] hover:bg-[#EFECE6] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
