import React, { useState } from 'react';
import {
  CATEGORY_BADGE_STYLES,
  DayColumn,
  ThemeId,
  THEMES,
  calculateDayProgress,
  filterColumnsForMobileDayScope,
} from '../utils/todoLogic';

interface SpreadsheetSectionProps {
  columns: DayColumn[];
  activeTheme: ThemeId;
  onToggleDailyTask: (dayId: string, taskId: string) => void;
  onCycleDailyCategory?: (dayId: string, taskId: string) => void;
  onUpdateDailyTaskText: (dayId: string, taskId: string, text: string) => void;
  onExportCsv: () => void;
}

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// Visual pill color presets matching the reference spreadsheet image
function getSpreadsheetPillColor(
  completed: boolean,
  priority: 'High' | 'Med' | 'Low',
  status: 'To Do' | 'In Progress' | 'Done'
): string {
  if (completed || status === 'Done') return '#7EC89B'; // emerald green pill
  if (status === 'In Progress') return '#8EBAE3'; // blue pill
  if (priority === 'High') return '#E88C84'; // coral red pill
  if (priority === 'Med') return '#F2C57C'; // amber pill
  return '#CBD0D8'; // slate gray pill
}

export const SpreadsheetSection: React.FC<SpreadsheetSectionProps> = ({
  columns,
  activeTheme,
  onToggleDailyTask,
  onCycleDailyCategory,
  onUpdateDailyTaskText,
  onExportCsv,
}) => {
  const theme = THEMES[activeTheme];
  const rowIndices = [0, 1, 2, 3, 4, 5]; // rows 2..7 in spreadsheet (row 1 is header)
  const [mobileLayoutMode, setMobileLayoutMode] = useState<'cards' | 'table'>('cards');
  const [mobileDayId, setMobileDayId] = useState<string>(columns[0]?.id ?? 'mon');

  const mobileSelectedColumns = filterColumnsForMobileDayScope(columns, mobileDayId);

  return (
    <div className="bg-white rounded-2xl border border-[#DFD8CE] shadow-[0_20px_50px_-12px_rgba(45,60,48,0.15)] overflow-hidden w-full mx-auto">
      {/* Green Spreadsheet Top Bar */}
      <div className="bg-[#238854] text-white px-3.5 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-white text-[#238854] flex items-center justify-center font-extrabold text-xs shrink-0">
            =
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight truncate">
            Weekly To-Do Tracker
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile View Toggle (Day Sheet vs Full A-G Grid) */}
          <div
            data-testid="spreadsheet-mobile-view-toggle"
            className="flex md:hidden items-center bg-black/20 rounded-full p-0.5 border border-white/25"
          >
            <button
              type="button"
              onClick={() => setMobileLayoutMode('cards')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                mobileLayoutMode === 'cards'
                  ? 'bg-white text-[#1C6B41]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Day Sheet
            </button>
            <button
              type="button"
              onClick={() => setMobileLayoutMode('table')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                mobileLayoutMode === 'table'
                  ? 'bg-white text-[#1C6B41]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              A–G Grid
            </button>
          </div>

          <span className="text-xs font-semibold text-white/90 hidden sm:inline">
            Google Sheets · Excel (.xlsx)
          </span>
          <button
            type="button"
            onClick={onExportCsv}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-full px-3 py-1.5 min-h-[34px] text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Export .CSV
          </button>
        </div>
      </div>

      {/* Mobile Touch-Friendly Day Sheet View (< 768px when 'cards' is active) */}
      <div
        data-testid="spreadsheet-mobile-day-sheet"
        className={`${mobileLayoutMode === 'cards' ? 'block md:hidden' : 'hidden'} p-3 bg-[#FAF7F2] border-b border-[#E8E2D9]`}
      >
        {/* Day Selector Tabs (Col A..G) */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-3">
          {columns.map((col, idx) => {
            const stats = calculateDayProgress(col.tasks);
            const isSelected = mobileDayId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setMobileDayId(col.id)}
                data-testid={`spreadsheet-mobile-day-tab-${col.id}`}
                className={`min-h-[42px] px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#238854] text-white border-[#1C6B41] shadow-sm'
                    : 'bg-white text-[#3B3530] border-[#E4DDD3] hover:bg-[#F5F1EB]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">
                    Col {COL_LETTERS[idx]}
                  </span>
                  <span className="text-[9px] font-bold tabular-nums">
                    {stats.percentage}%
                  </span>
                </div>
                <span className="text-[11px] font-extrabold truncate">
                  {col.dayName.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Spreadsheet Rows (Rows 2..7) */}
        {mobileSelectedColumns.map((col) => {
          const colIdx = columns.findIndex((c) => c.id === col.id);
          const safeIdx = colIdx >= 0 ? colIdx : 0;
          const stats = calculateDayProgress(col.tasks);
          return (
            <div
              key={col.id}
              className="bg-white rounded-xl border border-[#E4DDD3] overflow-hidden shadow-xs"
            >
              <div
                data-day-header="true"
                className="px-3.5 py-2.5 border-b border-[#E4DDD3] flex items-center justify-between"
                style={{ backgroundColor: theme.dayHeaders[safeIdx] }}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-black/10 text-[#332C27] text-[10px] font-extrabold">
                    Column {COL_LETTERS[safeIdx]}
                  </span>
                  <span className="text-xs font-extrabold uppercase text-[#332C27]">
                    {col.dayName} ({col.dateLabel})
                  </span>
                </div>
                <span className="text-xs font-extrabold text-[#332C27] tabular-nums">
                  {stats.completed}/{stats.total} ({stats.percentage}%)
                </span>
              </div>

              <div className="divide-y divide-[#ECE7DF]">
                {rowIndices.map((taskIdx) => {
                  const sheetRowNumber = taskIdx + 2;
                  const task = col.tasks[taskIdx];
                  if (!task) return null;
                  const hasTask = task.text.trim().length > 0;
                  const pillColor = getSpreadsheetPillColor(
                    task.completed,
                    task.priority,
                    task.status
                  );

                  return (
                    <div
                      key={`${col.id}-mobile-row-${sheetRowNumber}`}
                      className="flex items-center gap-2 px-2.5 py-2 min-h-[48px]"
                    >
                      <span className="w-6 h-6 rounded bg-[#EFECE6] text-[#7A7269] text-[10px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {sheetRowNumber}
                      </span>

                      <input
                        type="text"
                        value={task.text}
                        placeholder={`Row ${sheetRowNumber} task...`}
                        aria-label={`Mobile spreadsheet ${col.dayName} row ${sheetRowNumber}`}
                        onChange={(e) =>
                          onUpdateDailyTaskText(col.id, task.id, e.target.value)
                        }
                        className={`flex-1 min-w-0 text-xs font-medium bg-transparent py-1.5 px-1 focus:outline-none ${
                          task.completed
                            ? 'line-through text-[#A59E95]'
                            : 'text-[#2F2B28]'
                        }`}
                      />

                      {hasTask && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => onCycleDailyCategory?.(col.id, task.id)}
                            title={`Category: ${task.category} (tap to cycle)`}
                            data-category-badge={task.category}
                            className="min-h-[32px] px-2 py-1 rounded-md text-[10px] font-bold border leading-none cursor-pointer transition-transform active:scale-95"
                            style={{
                              backgroundColor:
                                CATEGORY_BADGE_STYLES[task.category]?.bg ??
                                '#FCEADE',
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

                          <button
                            type="button"
                            onClick={() => onToggleDailyTask(col.id, task.id)}
                            aria-label={`Toggle mobile spreadsheet status for ${task.text}`}
                            title={`${task.status} (${task.priority}) — tap to toggle`}
                            className="min-w-[38px] min-h-[32px] px-2 rounded-full flex items-center justify-center text-[9px] font-extrabold text-[#1F2421] shadow-2xs cursor-pointer active:scale-95"
                            style={{ backgroundColor: pillColor }}
                          >
                            {task.completed ? 'Done' : task.priority}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full A–G Spreadsheet Grid (Always visible on md+, toggleable on mobile) */}
      <div
        className={`${
          mobileLayoutMode === 'table' ? 'block' : 'hidden md:block'
        } p-3 sm:p-4 bg-white overflow-x-auto`}
      >
        <table className="w-full min-w-[720px] border-collapse border border-[#E8E2D9] text-left select-none">
          <thead>
            {/* Column Letters A..G */}
            <tr className="bg-[#EFECE6] text-[#8E877E] text-[10px] font-bold">
              <th className="w-8 py-1.5 text-center border border-[#E4DDD3]" />
              {COL_LETTERS.map((letter) => (
                <th
                  key={letter}
                  className="py-1.5 text-center border border-[#E4DDD3] w-[13.5%]"
                >
                  {letter}
                </th>
              ))}
            </tr>

            {/* Row 1: MON..SUN Headers with % */}
            <tr>
              <td className="bg-[#EFECE6] text-[#8E877E] text-[10px] font-bold text-center border border-[#E4DDD3] py-2">
                1
              </td>
              {columns.map((col, idx) => {
                const stats = calculateDayProgress(col.tasks);
                return (
                  <th
                    key={col.id}
                    data-day-header="true"
                    className="px-2.5 py-2 border border-[#E4DDD3] transition-colors"
                    style={{ backgroundColor: theme.dayHeaders[idx] }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-[#332C27]">
                        {col.dayName.slice(0, 3)}
                      </span>
                      <span className="text-[10px] font-bold text-[#4D433B] tabular-nums">
                        {stats.percentage}%
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rowIndices.map((taskIdx) => {
              const sheetRowNumber = taskIdx + 2;
              return (
                <tr key={sheetRowNumber} className="h-10">
                  <td className="bg-[#EFECE6] text-[#8E877E] text-[10px] font-bold text-center border border-[#E4DDD3]">
                    {sheetRowNumber}
                  </td>
                  {columns.map((col) => {
                    const task = col.tasks[taskIdx];
                    const hasTask = task && task.text.trim().length > 0;
                    const pillColor = task
                      ? getSpreadsheetPillColor(
                          task.completed,
                          task.priority,
                          task.status
                        )
                      : '#CBD0D8';

                    return (
                      <td
                        key={`${col.id}-${sheetRowNumber}`}
                        className="px-2 py-1.5 border border-[#ECE7DF] hover:bg-[#FAF7F2] transition-colors"
                      >
                        {task && (
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={task.text}
                              placeholder=""
                              aria-label={`Spreadsheet ${col.dayName} row ${sheetRowNumber}`}
                              onChange={(e) =>
                                onUpdateDailyTaskText(
                                  col.id,
                                  task.id,
                                  e.target.value
                                )
                              }
                              className={`w-full min-w-0 text-[10px] font-medium bg-transparent focus:outline-none truncate ${
                                task.completed
                                  ? 'line-through text-[#A59E95]'
                                  : 'text-[#4B453F]'
                              }`}
                            />

                            {hasTask ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onCycleDailyCategory?.(col.id, task.id)
                                  }
                                  data-testid={`spreadsheet-category-badge-${task.id}`}
                                  data-category-badge={task.category}
                                  title={`Category: ${task.category} (click to cycle)`}
                                  className="px-1 py-0.5 rounded text-[7.5px] font-bold border leading-none cursor-pointer transition-transform active:scale-95"
                                  style={{
                                    backgroundColor:
                                      CATEGORY_BADGE_STYLES[task.category]
                                        ?.bg ?? '#FCEADE',
                                    color:
                                      CATEGORY_BADGE_STYLES[task.category]
                                        ?.text ?? '#9A4E28',
                                    borderColor:
                                      CATEGORY_BADGE_STYLES[task.category]
                                        ?.border ?? '#F0CFB8',
                                  }}
                                >
                                  {task.category}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onToggleDailyTask(col.id, task.id)}
                                  aria-label={`Toggle spreadsheet status for ${task.text}`}
                                  title={`${task.status} (${task.priority}) — click to toggle`}
                                  className="w-6 h-3.5 rounded-full shrink-0 transition-transform hover:scale-105 cursor-pointer"
                                  style={{ backgroundColor: pillColor }}
                                />
                              </div>
                            ) : (
                              <span className="w-7 h-3.5 shrink-0" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

