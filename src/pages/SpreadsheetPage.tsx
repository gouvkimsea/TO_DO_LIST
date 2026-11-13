import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { SpreadsheetSection } from '../components/SpreadsheetSection';
import { SharedDashboardPageProps } from './types';

export const SpreadsheetPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  activeTheme,
  onToggleDailyTask,
  onCycleDailyCategory,
  onUpdateDailyTaskText,
  onExportCsv,
}) => {
  return (
    <section
      id="spreadsheet"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="weekly-todo-tracker.xlsx — Google Sheets & Excel"
          className="w-full"
          defaultFullscreen
        >
          <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col justify-between">
            <SectionHeader
              eyebrow="ALSO INCLUDED — FREE"
              italicSubtitle="prefer a"
              title="SPREADSHEET?"
            />

            <SpreadsheetSection
              columns={columns}
              activeTheme={activeTheme}
              onToggleDailyTask={onToggleDailyTask}
              onCycleDailyCategory={onCycleDailyCategory}
              onUpdateDailyTaskText={onUpdateDailyTaskText}
              onExportCsv={onExportCsv}
            />

            <div className="mt-4 pt-2 border-t border-[#ECE7DF] text-center space-y-1">
              <p className="text-xs sm:text-sm font-bold text-[#7A7269]">
                Same colour-coding, dropdowns &amp; auto-totals — import to Google
                Sheets or open in Excel
              </p>
              <p className="text-xs font-medium text-[#9C948B]">
                For anyone who would rather work in a spreadsheet
              </p>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
