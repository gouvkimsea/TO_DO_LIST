import React, { useState } from 'react';
import { Check, Archive, Sparkles, ClipboardPaste } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CATEGORY_BADGE_STYLES,
  DASHBOARD_ENTRANCE_ITEM_VARIANTS,
  DashboardMetrics,
  DetailedTask,
  TASK_CATEGORIES,
  TaskCategory,
  ThemeId,
  THEMES,
  buildWeeklyCompletionBarSummary,
  countTasksByCategory,
  filterDetailedTasksByKeyword,
  filterTasksByCategory,
} from '../utils/todoLogic';
import {
  PRIORITY_PILL_STYLES,
  STATUS_PILL_STYLES,
} from './InteractiveDashboard';
import { VoiceMicButton } from './VoiceMicButton';
import { PomodoroTimer } from './PomodoroTimer';

export interface WeeklyCompletionProgressBarProps {
  metrics: DashboardMetrics;
  activeTheme: ThemeId;
  className?: string;
}

export const WeeklyCompletionProgressBar: React.FC<
  WeeklyCompletionProgressBarProps
> = ({ metrics, activeTheme, className = '' }) => {
  const theme = THEMES[activeTheme];
  const summary = buildWeeklyCompletionBarSummary({
    completedTasks: metrics.completedTasks,
    totalTasks: metrics.totalTasks,
    completionPercentage: metrics.completionPercentage,
  });

  return (
    <motion.div
      variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
      data-testid="live-weekly-completion-bar-card"
      data-completion-percentage={summary.percentage}
      data-completed-tasks={summary.completedTasks}
      data-total-tasks={summary.totalTasks}
      className={`bg-white rounded-2xl border border-[#ECE7DF] p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
            TOTAL WEEKLY COMPLETION
          </span>
          <span
            data-testid="live-weekly-completion-bar-status"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors"
            style={{
              backgroundColor: `${theme.progressFill}1F`,
              color: theme.checkboxBg,
            }}
          >
            <Sparkles className="w-2.5 h-2.5 shrink-0" />
            <span>{summary.statusLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            data-testid="live-weekly-completion-bar-count"
            className="text-[11px] font-semibold text-[#6E675F] tabular-nums"
          >
            {summary.summaryText}
          </span>
          <motion.span
            key={summary.percentage}
            initial={{ scale: 0.92, opacity: 0.75 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            data-testid="live-weekly-completion-bar-pct"
            className="text-base sm:text-lg font-black text-[#2F2B28] tabular-nums px-2.5 py-0.5 rounded-lg bg-[#F6F2EB] border border-[#E6DFD3]"
          >
            {summary.percentage}%
          </motion.span>
        </div>
      </div>

      {/* Live-Updating Animated Progress Bar Track */}
      <div
        role="progressbar"
        aria-label="Total weekly task completion percentage"
        aria-valuenow={summary.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${summary.percentage}% (${summary.completedTasks} of ${summary.totalTasks} daily tasks completed)`}
        data-testid="live-weekly-completion-progressbar"
        className="relative w-full h-3.5 sm:h-4 bg-[#EFECE6] rounded-full overflow-hidden p-0.5 border border-[#E5DEC9]/70"
      >
        {/* Subtle 25 / 50 / 75% milestone ticks */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex justify-between px-[25%]"
        >
          <span className="w-px h-full bg-[#DED8CE]/70" />
          <span className="w-px h-full bg-[#DED8CE]/70" />
          <span className="w-px h-full bg-[#DED8CE]/70" />
        </div>

        <motion.div
          data-testid="live-weekly-completion-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${summary.percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 26,
            mass: 0.9,
          }}
          className="relative h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${theme.progressFill} 0%, ${theme.checkboxBg} 100%)`,
          }}
        />
      </div>

      {/* Milestone Legend & Per-Day Mini Completion Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[#F4F0E8] text-[10px] font-semibold text-[#8A8279]">
        <div className="flex items-center gap-3 tabular-nums">
          <span>0%</span>
          <span className={summary.percentage >= 25 ? 'text-[#4A433C] font-bold' : ''}>
            25%
          </span>
          <span className={summary.percentage >= 50 ? 'text-[#4A433C] font-bold' : ''}>
            50%
          </span>
          <span className={summary.percentage >= 75 ? 'text-[#4A433C] font-bold' : ''}>
            75%
          </span>
          <span className={summary.percentage >= 100 ? 'text-[#2E6B47] font-bold' : ''}>
            100% Goal
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {metrics.dailyProgress.map((day) => (
            <span
              key={day.dayId}
              data-testid={`weekly-bar-day-pill-${day.dayId}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#ECE7DF] text-[9.5px] font-bold text-[#5A534C] tabular-nums"
            >
              <span>{day.shortName}</span>
              <span className="text-[#8A8279]">{day.percentage}%</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface LiveProgressBoardProps {
  detailedTasks: DetailedTask[];
  metrics: DashboardMetrics;
  activeTheme: ThemeId;
  searchQuery?: string;
  archivedCount?: number;
  onToggleDetailedTask: (taskId: string) => void;
  onCycleDetailedPriority: (taskId: string) => void;
  onCycleDetailedStatus: (taskId: string) => void;
  onCycleDetailedCategory?: (taskId: string) => void;
  onUpdateDetailedText: (taskId: string, text: string) => void;
  onArchiveCompletedTasks?: () => void;
  onArchiveSingleDetailedTask?: (taskId: string) => void;
  onOpenArchiveModal?: () => void;
  onOpenBulkImportModal?: (defaultDayId?: string) => void;
  onSelectTheme?: (theme: ThemeId) => void;
}

export const LiveProgressBoard: React.FC<LiveProgressBoardProps> = ({
  detailedTasks,
  metrics,
  activeTheme,
  searchQuery = '',
  archivedCount = 0,
  onToggleDetailedTask,
  onCycleDetailedPriority,
  onCycleDetailedStatus,
  onCycleDetailedCategory,
  onUpdateDetailedText,
  onArchiveCompletedTasks,
  onArchiveSingleDetailedTask,
  onOpenArchiveModal,
  onOpenBulkImportModal,
  onSelectTheme,
}) => {
  const [activeTagFilter, setActiveTagFilter] = useState<'All' | TaskCategory>(
    'All'
  );
  const theme = THEMES[activeTheme];
  const nonArchivedDetailedTasks = detailedTasks.filter(
    (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
  );
  const categoryCounts = countTasksByCategory(nonArchivedDetailedTasks);
  const keywordFilteredTasks = searchQuery.trim()
    ? filterDetailedTasksByKeyword(nonArchivedDetailedTasks, searchQuery)
    : nonArchivedDetailedTasks;
  const visibleDetailedTasks =
    activeTagFilter !== 'All'
      ? filterTasksByCategory(keywordFilteredTasks, activeTagFilter)
      : keywordFilteredTasks;
  const leftColumnTasks = visibleDetailedTasks.filter((_, idx) => idx % 2 === 0);
  const rightColumnTasks = visibleDetailedTasks.filter((_, idx) => idx % 2 === 1);

  const completedInBoardCount = Math.max(
    metrics.completedTasks,
    nonArchivedDetailedTasks.filter((t) => t.completed).length
  );

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (metrics.completionPercentage / 100) * circumference;

  const totalPriorityCount =
    metrics.byPriority.High + metrics.byPriority.Med + metrics.byPriority.Low || 1;
  const totalStatusCount =
    metrics.byStatus['To Do'] +
      metrics.byStatus['In Progress'] +
      metrics.byStatus.Done || 1;

  return (
    <div className="p-3 sm:p-4 lg:p-5 bg-[#FAF7F2] select-none flex-1 flex flex-col gap-3.5 sm:gap-4">
      {/* Live-Updating Total Weekly Completion Bar */}
      <WeeklyCompletionProgressBar
        metrics={metrics}
        activeTheme={activeTheme}
      />

      {/* Upper 2-Column Detailed Tasks Card */}
      <motion.div
        variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
        data-testid="dashboard-entrance-focus-card"
        className="bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex-1 flex flex-col"
      >
        {/* Dashboard Focus Header: Active Tasks + Built-in 25-Minute Pomodoro Timer + Theme Swatches + Archive Actions */}
        <div
          data-testid="dashboard-focus-header"
          className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-[#F4F0E8] px-1"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#8A8279]">
              ACTIVE FOCUS TASKS ({visibleDetailedTasks.length})
            </span>
            {archivedCount > 0 && onOpenArchiveModal && (
              <button
                type="button"
                onClick={onOpenArchiveModal}
                data-testid="dashboard-archived-pill"
                className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#F4EFE6] hover:bg-[#EAE1D3] text-[#7A624D] px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              >
                <Archive className="w-2.5 h-2.5 text-[#B05C37]" />
                <span>{archivedCount} in Archive</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {onSelectTheme && (
              <div
                data-testid="dashboard-theme-swatches"
                className="inline-flex items-center gap-1 bg-[#FAF7F2] border border-[#E5DEC9] rounded-full px-2 py-0.5"
              >
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#8A8279] mr-0.5">
                  THEME
                </span>
                {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                  const t = THEMES[themeKey];
                  const isSelected = activeTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      data-testid={`dashboard-theme-swatch-${themeKey}`}
                      aria-label={`Select ${t.name} color theme (dashboard)`}
                      aria-pressed={isSelected}
                      title={`${t.name} theme`}
                      onClick={() => onSelectTheme(themeKey)}
                      className={`grid grid-cols-2 gap-0.5 p-0.5 rounded-md bg-[#EFECE6] w-5 h-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-[#7C736A] bg-white shadow-2xs scale-105'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="rounded-tl-[2px] w-full h-full block"
                        style={{ backgroundColor: t.quadrantColors[0] }}
                      />
                      <span
                        className="rounded-tr-[2px] w-full h-full block"
                        style={{ backgroundColor: t.quadrantColors[1] }}
                      />
                      <span
                        className="rounded-bl-[2px] w-full h-full block"
                        style={{ backgroundColor: t.quadrantColors[2] }}
                      />
                      <span
                        className="rounded-br-[2px] w-full h-full block"
                        style={{ backgroundColor: t.quadrantColors[3] }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            <PomodoroTimer instanceId="dashboard" />

            {onOpenBulkImportModal && (
              <button
                type="button"
                onClick={() => onOpenBulkImportModal('mon')}
                data-testid="dashboard-bulk-import-btn"
                title="Paste a list of tasks to add multiple items at once to a specific day column"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF4EC] hover:bg-[#F3E6D6] border border-[#E5CFB8] text-[#9A4E28] transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Bulk Import</span>
              </button>
            )}

            {onArchiveCompletedTasks && completedInBoardCount > 0 && (
              <button
                type="button"
                onClick={onArchiveCompletedTasks}
                data-testid="dashboard-archive-completed-btn"
                title="Move all completed tasks to Archive to declutter the view"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5DFD0] hover:bg-[#EED2BF] text-[#9A4E28] transition-colors cursor-pointer"
              >
                <Archive className="w-3 h-3" />
                <span>Archive Completed ({completedInBoardCount})</span>
              </button>
            )}

            {onOpenArchiveModal && (
              <button
                type="button"
                onClick={onOpenArchiveModal}
                data-testid="dashboard-open-archive-btn"
                title="View archived tasks history (Press A)"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#E2D9CC] text-[#4A433C] transition-colors cursor-pointer"
              >
                <Archive className="w-3 h-3 text-[#B05C37]" />
                <span>Archive ({archivedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Color-Coded Tag Filter Bar */}
        <div
          data-testid="dashboard-tag-filter-bar"
          role="group"
          aria-label="Filter focus tasks by tag"
          className="flex flex-wrap items-center gap-1.5 pb-2 mb-1 px-1 border-b border-[#F4F0E8]"
        >
          <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-0.5">
            TAGS
          </span>
          <button
            type="button"
            onClick={() => setActiveTagFilter('All')}
            aria-pressed={activeTagFilter === 'All'}
            data-testid="dashboard-tag-filter-All"
            className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none tabular-nums ${
              activeTagFilter === 'All'
                ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                : 'bg-[#FAF7F2] text-[#5A534C] border-[#DED8CE] hover:bg-[#EFECE6]'
            }`}
          >
            All ({nonArchivedDetailedTasks.length})
          </button>
          {TASK_CATEGORIES.map((cat) => {
            const isSelected = activeTagFilter === cat;
            const count = categoryCounts[cat] ?? 0;
            const style = CATEGORY_BADGE_STYLES[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveTagFilter((prev) => (prev === cat ? 'All' : cat))
                }
                aria-pressed={isSelected}
                data-testid={`dashboard-tag-filter-${cat}`}
                data-category-badge={cat}
                title={`Filter by ${cat} tag (${count} task${
                  count === 1 ? '' : 's'
                })`}
                className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 leading-none tabular-nums ${
                  isSelected
                    ? 'ring-2 ring-[#2F2B28]/45 scale-105 shadow-2xs'
                    : 'opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  borderColor: style.border,
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
          {activeTagFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setActiveTagFilter('All')}
              data-testid="dashboard-tag-filter-reset"
              className="text-[9.5px] font-semibold text-[#8A8279] hover:text-[#2F2B28] underline ml-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              Show all
            </button>
          )}
        </div>

        {visibleDetailedTasks.length === 0 ? (
          <div className="py-5 my-auto text-center space-y-2">
            <p className="text-xs font-semibold text-[#7A7269]">
              {activeTagFilter !== 'All'
                ? `No focus tasks tagged "${activeTagFilter}".`
                : searchQuery.trim()
                ? `No active tasks match "${searchQuery.trim()}".`
                : 'All focus tasks are archived or completed! Your active view is clutter-free.'}
            </p>
            {activeTagFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setActiveTagFilter('All')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] hover:bg-[#EAE1D3] text-[#4A433C] text-[11px] font-bold transition-colors cursor-pointer"
              >
                <span>Show All Tags</span>
              </button>
            )}
            {archivedCount > 0 && onOpenArchiveModal && (
              <button
                type="button"
                onClick={onOpenArchiveModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] hover:bg-[#EAE1D3] text-[#4A433C] text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Archive className="w-3 h-3 text-[#B05C37]" />
                <span>View {archivedCount} Archived Tasks</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5 flex-1 items-stretch">
            {[leftColumnTasks, rightColumnTasks].map((colTasks, colIdx) => (
              <div
                key={colIdx}
                className="divide-y divide-[#F4F0E8] flex flex-col justify-around"
              >
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1.5 sm:gap-2.5 py-1.5 sm:py-2 px-1.5 hover:bg-[#FAF8F5] rounded-lg transition-colors group"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={task.completed}
                      aria-label={`Detailed task "${task.text}"`}
                      onClick={() => onToggleDetailedTask(task.id)}
                      className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: task.completed
                          ? theme.checkboxBg
                          : '#FAF8F5',
                        border: task.completed ? 'none' : '1.5px solid #D7D0C6',
                      }}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={task.text}
                      aria-label={`Edit task ${task.text}`}
                      onChange={(e) =>
                        onUpdateDetailedText(task.id, e.target.value)
                      }
                      className={`flex-1 min-w-0 bg-transparent text-xs sm:text-[13px] font-medium focus:outline-none ${
                        task.completed
                          ? 'line-through text-[#A59E95]'
                          : 'text-[#3B3632]'
                      }`}
                    />

                    {/* Color-Coded Category Badge Next to Task Name */}
                    {task.text.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCycleDetailedCategory?.(task.id)}
                        aria-label={`Category ${task.category} for ${task.text}. Click to cycle.`}
                        data-testid={`detailed-category-badge-${task.id}`}
                        data-category-badge={task.category}
                        title={`Category: ${task.category} (click to cycle)`}
                        className="px-2 py-0.5 rounded text-[9px] font-bold shrink-0 border cursor-pointer transition-transform active:scale-95 leading-none"
                        style={{
                          backgroundColor:
                            CATEGORY_BADGE_STYLES[task.category]?.bg ?? '#FCEADE',
                          color:
                            CATEGORY_BADGE_STYLES[task.category]?.text ??
                            '#9A4E28',
                          borderColor:
                            CATEGORY_BADGE_STYLES[task.category]?.border ??
                            '#F0CFB8',
                        }}
                      >
                        {task.category}
                      </button>
                    )}

                    <VoiceMicButton
                      currentText={task.text}
                      onUpdateText={(newText) =>
                        onUpdateDetailedText(task.id, newText)
                      }
                      ariaLabel={`Dictate task for ${task.text || task.id}`}
                      accentColor={theme.checkboxBg}
                    />

                    {/* Priority Pill */}
                    <button
                      type="button"
                      onClick={() => onCycleDetailedPriority(task.id)}
                      aria-label={`Priority ${task.priority} for ${task.text}. Click to cycle.`}
                      data-priority-pill={task.priority}
                      className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95 min-w-[38px] sm:min-w-[44px] text-center"
                      style={{
                        backgroundColor: PRIORITY_PILL_STYLES[task.priority].bg,
                        color: PRIORITY_PILL_STYLES[task.priority].text,
                      }}
                    >
                      {task.priority}
                    </button>

                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={() => onCycleDetailedStatus(task.id)}
                      aria-label={`Status ${task.status} for ${task.text}. Click to cycle.`}
                      data-status-pill={task.status}
                      className="px-2 sm:px-3 py-0.5 rounded-full text-[10px] font-bold shrink-0 cursor-pointer transition-transform active:scale-95 min-w-[56px] sm:min-w-[68px] text-center"
                      style={{
                        backgroundColor: STATUS_PILL_STYLES[task.status].bg,
                        color: STATUS_PILL_STYLES[task.status].text,
                      }}
                    >
                      {task.status}
                    </button>

                    {/* Individual Archive Action for Completed Task */}
                    {task.completed && onArchiveSingleDetailedTask && (
                      <button
                        type="button"
                        onClick={() => onArchiveSingleDetailedTask(task.id)}
                        aria-label={`Archive completed task "${task.text}"`}
                        data-testid={`archive-detailed-task-${task.id}`}
                        title="Move completed task to Archive"
                        className="p-1 rounded text-[#9C948B] hover:text-[#B05C37] hover:bg-[#F4EFE6] transition-colors cursor-pointer shrink-0"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Live Dashboard Section */}
      <motion.div
        variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
        data-testid="dashboard-entrance-metrics-section"
        className="flex-1 flex flex-col"
      >
        <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7A6E63] mb-2.5 px-1">
          DASHBOARD
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.95fr_1.35fr_0.9fr_0.95fr_1.2fr] gap-3 sm:gap-3.5 lg:gap-3.5 flex-1">
          {/* Card 1: Week Completion Donut */}
          <motion.div
            variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
            data-testid="dashboard-metric-card-completion"
            className="bg-white rounded-2xl border border-[#ECE7DF] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279]">
              WEEK COMPLETION
            </span>

            <div className="my-auto py-2 flex items-center justify-center relative">
              <svg className="w-28 h-28 sm:w-30 sm:h-30 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#EFECE6"
                  strokeWidth="10"
                  className="donut-track-ring"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#604E3D"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="donut-progress-ring transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  data-testid="week-completion-pct"
                  className="text-2xl font-black text-[#2F2B28] tabular-nums"
                >
                  {metrics.completionPercentage}%
                </span>
              </div>
            </div>

            <div
              data-testid="week-completion-count"
              className="text-center text-[11px] font-semibold text-[#8A8279] tabular-nums"
            >
              {metrics.completedTasks} of {metrics.totalTasks} tasks
            </div>
          </motion.div>

          {/* Card 2: Daily Progress Vertical Bars */}
          <motion.div
            variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
            data-testid="dashboard-metric-card-daily"
            className="bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279] mb-1.5 sm:mb-2">
              DAILY PROGRESS
            </span>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-end pt-1 sm:pt-2">
              {metrics.dailyProgress.map((day, i) => (
                <div
                  key={day.dayId}
                  className="flex flex-col items-center gap-1 sm:gap-1.5"
                >
                  <span className="text-[9.5px] font-bold text-[#8A8279] tabular-nums">
                    {day.percentage}%
                  </span>
                  <div className="w-4 sm:w-5 lg:w-5.5 h-16 sm:h-20 bg-[#F2EFE9] rounded-full overflow-hidden flex items-end">
                    <div
                      data-testid={`dashboard-daily-bar-${day.dayId}`}
                      className="w-full rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.max(day.percentage, 8)}%`,
                        backgroundColor: theme.dayHeaders[i] || theme.progressFill,
                      }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-[#6E675F]">
                    {day.shortName}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: By Priority */}
          <motion.div
            variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
            data-testid="dashboard-metric-card-priority"
            className="bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279] mb-1.5 sm:mb-2">
              BY PRIORITY
            </span>

            <div className="space-y-3 my-auto py-2">
              {(
                [
                  { label: 'High', count: metrics.byPriority.High, color: '#E68A82' },
                  { label: 'Med', count: metrics.byPriority.Med, color: '#EFC776' },
                  { label: 'Low', count: metrics.byPriority.Low, color: '#86C79F' },
                ] as const
              ).map((item) => {
                const widthPct = Math.round(
                  (item.count / totalPriorityCount) * 100
                );
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#5A534C] w-9 shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 h-2.5 bg-[#F2EFE9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(widthPct, 12)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#3B3632] w-5 text-right tabular-nums">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-2" />
          </motion.div>

          {/* Card 4: By Status */}
          <motion.div
            variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
            data-testid="dashboard-metric-card-status"
            className="bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279] mb-1.5 sm:mb-2">
              BY STATUS
            </span>

            <div className="space-y-2.5 sm:space-y-3 my-auto py-1 sm:py-2">
              {(
                [
                  {
                    label: 'To Do',
                    count: metrics.byStatus['To Do'],
                    color: '#CFD5DC',
                  },
                  {
                    label: 'In Progress',
                    count: metrics.byStatus['In Progress'],
                    color: '#9CC4E8',
                  },
                  {
                    label: 'Done',
                    count: metrics.byStatus.Done,
                    color: '#7EC699',
                  },
                ] as const
              ).map((item) => {
                const widthPct = Math.round(
                  (item.count / totalStatusCount) * 100
                );
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#5A534C] w-16 shrink-0 truncate">
                      {item.label}
                    </span>
                    <div className="flex-1 h-2.5 bg-[#F2EFE9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(widthPct, 12)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#3B3632] w-5 text-right tabular-nums">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-2" />
          </motion.div>

          {/* Card 5: By Category */}
          <motion.div
            variants={DASHBOARD_ENTRANCE_ITEM_VARIANTS}
            data-testid="dashboard-by-category-card"
            className="bg-white rounded-2xl border border-[#ECE7DF] p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:col-span-2 lg:col-span-1"
          >
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279] mb-1.5 sm:mb-2">
              BY CATEGORY
            </span>

            <div className="grid grid-cols-2 gap-1.5 my-auto py-1">
              {TASK_CATEGORIES.map((cat) => {
                const count =
                  metrics.byCategory?.[cat] ?? categoryCounts[cat] ?? 0;
                const style = CATEGORY_BADGE_STYLES[cat];
                const isSelected = activeTagFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setActiveTagFilter((prev) => (prev === cat ? 'All' : cat))
                    }
                    aria-pressed={isSelected}
                    data-testid={`dashboard-category-stat-${cat}`}
                    data-category-badge={cat}
                    title={`Filter focus tasks by ${cat} (${count} total across week & focus tasks)`}
                    className={`flex items-center justify-between gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer tabular-nums ${
                      isSelected
                        ? 'ring-2 ring-[#2F2B28]/45 scale-[1.02]'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                      borderColor: style.border,
                    }}
                  >
                    <span className="truncate">{cat}</span>
                    <span
                      data-testid={`dashboard-category-count-${cat}`}
                      className="font-black ml-1 shrink-0"
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="h-1" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
