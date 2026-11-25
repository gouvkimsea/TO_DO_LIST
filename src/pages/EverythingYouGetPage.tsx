import React from 'react';
import { Check, Download } from 'lucide-react';
import { BrowserFrame } from '../components/BrowserFrame';
import { THEMES } from '../utils/todoLogic';
import { SharedDashboardPageProps } from './types';

export const EverythingYouGetPage: React.FC<SharedDashboardPageProps> = ({
  activeTheme,
  onOpenModal,
}) => {
  const theme = THEMES[activeTheme];

  const items = [
    {
      title: 'Weekly, Monthly & Yearly views',
      subtitle: 'All your tasks and goals stay synced automatically',
    },
    {
      title: 'Private local auto-save',
      subtitle: 'Saved right on your device with no account required',
    },
    {
      title: 'Spreadsheet & CSV export',
      subtitle: 'Open your tasks in Excel or Google Sheets anytime',
    },
    {
      title: 'JSON backup & restore',
      subtitle: 'Keep a full copy of your planner and restore in one click',
    },
  ];

  return (
    <section
      id="everything-you-get"
      aria-label="Export and Downloads"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
              Export &amp; Downloads
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
              Download your tasks for Excel, Google Sheets, or offline backup
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenModal('download')}
            data-testid="export-downloads-primary-btn"
            data-custom-btn="primary"
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-extrabold text-white shadow-xs inline-flex items-center gap-2 transition-all hover:brightness-95 active:scale-[0.99] cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Files</span>
          </button>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-4 sm:p-6 lg:p-8 bg-[#FAF7F2] flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-2xl border border-[#E6DFD3] px-5 sm:px-7 py-2 divide-y divide-[#F2EFE9]">
              {items.map((item) => (
                <div
                  key={item.title}
                  className="py-4 flex items-center gap-3.5"
                >
                  <span className="w-8 h-8 rounded-full bg-[#DFECE0] text-[#3F7A4D] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-[#7A7269]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
