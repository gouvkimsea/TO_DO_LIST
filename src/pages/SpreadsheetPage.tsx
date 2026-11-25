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
      aria-label="Spreadsheet View"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 gap-3">
        <SectionHeader
          title="Spreadsheet View"
          italicSubtitle="Edit your tasks in a clean table or export straight to Excel & Google Sheets"
        />

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-3 sm:p-5 flex-1 flex flex-col">
            <SpreadsheetSection
              columns={columns}
              activeTheme={activeTheme}
              onToggleDailyTask={onToggleDailyTask}
              onCycleDailyCategory={onCycleDailyCategory}
              onUpdateDailyTaskText={onUpdateDailyTaskText}
              onExportCsv={onExportCsv}
            />
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
