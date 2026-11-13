import React from 'react';
import {
  CATEGORY_BADGE_STYLES,
  DayColumn,
  ThemeId,
  THEMES,
  calculateDayProgress,
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

  return (
    <div className="bg-white rounded-2xl border border-[#DFD8CE] shadow-[0_20px_50px_-12px_rgba(45,60,48,0.15)] overflow-hidden w-full mx-auto">
      {/* Green Spreadsheet Top Bar */}
      <div className="bg-[#238854] text-white px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-white text-[#238854] flex items-center justify-center font-extrabold text-xs">
            =
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight">
            Weekly To-Do Tracker
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white/90 hidden sm:inline">
            Google Sheets · Excel (.xlsx)
          </span>
          <button
            type="button"
            onClick={onExportCsv}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Export .CSV
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="p-3 sm:p-4 bg-white overflow-x-auto">
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
