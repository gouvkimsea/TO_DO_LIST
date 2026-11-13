import React from 'react';
import { ThemeId, THEMES } from '../utils/todoLogic';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { SharedDashboardPageProps } from './types';

export const ColorThemesPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  selectedDate,
  weekRangeLabel,
  onSelectTheme,
  onSelectView,
  onDateChange,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyCategory,
  onUpdateDailyTaskText,
  onQuickAddDailyTask,
  onUpdateDailyTaskNotes,
  onResetWeek,
}) => {
  return (
    <section
      id="color-themes"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="my-tasks.html — 4 built-in color themes"
          className="w-full"
          defaultFullscreen
        >
          <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between">
            <SectionHeader
              eyebrow="FOUR COLOR THEMES"
              italicSubtitle="find the palette"
              title="THAT'S YOU"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-2">
              {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                const t = THEMES[themeKey];
                const isCurrent = activeTheme === themeKey;
                return (
                  <div key={themeKey} className="flex flex-col items-center">
                    <div
                      onClick={() => onSelectTheme(themeKey)}
                      className={`w-full rounded-2xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'ring-3 ring-[#C26D43]/60 shadow-xl'
                          : 'opacity-95 hover:opacity-100'
                      }`}
                    >
                      <BrowserFrame
                        urlText={`my-tasks.html — ${t.name}`}
                        compact
                        defaultFullscreen={false}
                        className="max-w-none"
                      >
                        <InteractiveDashboard
                          columns={columns}
                          monthlyGoals={monthlyGoals}
                          yearlyGoals={yearlyGoals}
                          activeTheme={themeKey}
                          activeView="week"
                          selectedDate={selectedDate}
                          weekRangeLabel={weekRangeLabel}
                          onSelectTheme={onSelectTheme}
                          onSelectView={onSelectView}
                          onDateChange={onDateChange}
                          onToggleDailyTask={onToggleDailyTask}
                          onCycleDailyPriority={onCycleDailyPriority}
                          onCycleDailyCategory={onCycleDailyCategory}
                          onUpdateDailyTaskText={onUpdateDailyTaskText}
                          onQuickAddDailyTask={onQuickAddDailyTask}
                          onUpdateDailyTaskNotes={onUpdateDailyTaskNotes}
                          onResetWeek={onResetWeek}
                          compact
                          instancePrefix={`theme-${themeKey}`}
                        />
                      </BrowserFrame>
                    </div>

                    <button
                      type="button"
                      aria-pressed={isCurrent}
                      onClick={() => onSelectTheme(themeKey)}
                      className="mt-2 text-sm sm:text-base font-extrabold tracking-tight cursor-pointer transition-transform hover:scale-105"
                      style={{ color: t.labelColor }}
                    >
                      {t.name} {isCurrent ? '✓' : ''}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs sm:text-sm font-semibold text-[#8A8279] mt-4">
              Switch any time with one click — your tasks stay exactly where they
              are
            </p>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
