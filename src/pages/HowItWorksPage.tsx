import React, { useState } from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import { BrowserFrame } from '../components/BrowserFrame';
import { RouterLink } from '../components/RouterLink';
import { THEMES } from '../utils/todoLogic';
import { SharedDashboardPageProps } from './types';

export const HowItWorksPage: React.FC<SharedDashboardPageProps> = ({
  activeTheme,
  onNavigate,
  onQuickSave,
}) => {
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const theme = THEMES[activeTheme];

  const handleBookmarkClick = () => {
    setBookmarked(true);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          onQuickSave?.('Link copied! Press Ctrl+D (⌘+D) to bookmark');
        })
        .catch(() => {
          onQuickSave?.('Press Ctrl+D (⌘+D on Mac) to bookmark this page');
        });
    } else {
      onQuickSave?.('Press Ctrl+D (⌘+D on Mac) to bookmark this page');
    }
  };

  const steps = [
    {
      step: '1',
      title: 'Add a task',
      subtitle: 'Tap "+ Add Task" from anywhere and pick a day.',
    },
    {
      step: '2',
      title: 'Check it off',
      subtitle: 'Tap any checkbox to finish a task and see your progress update.',
    },
    {
      step: '3',
      title: 'Everything saves automatically',
      subtitle: 'Close the page anytime — your tasks are waiting when you return.',
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-label="Quick Guide"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
              Quick Guide
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
              Three simple steps — no setup or account needed
            </p>
          </div>

          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label="Bookmark this page"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E2D9CC] text-xs sm:text-sm font-bold text-[#2F2B28] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Star
              className={`w-4 h-4 text-[#D49D2A] ${
                bookmarked ? 'fill-[#D49D2A]' : ''
              }`}
            />
            <span>{bookmarked ? 'Link Copied' : 'Bookmark Page'}</span>
          </button>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-4 sm:p-6 lg:p-8 bg-[#FAF7F2] flex-1 flex flex-col justify-center gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((card) => (
                <div
                  key={card.step}
                  className="bg-white rounded-2xl border border-[#E6DFD3] p-5 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F5DFD0] text-[#B86741] font-extrabold text-sm flex items-center justify-center shrink-0 tabular-nums">
                    {card.step}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-[#2F2B28]">
                      {card.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-1 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-[#E6DFD3] p-4 sm:p-5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#3F6F4A]">
                <span className="w-6 h-6 rounded-full bg-[#DFECE0] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span>Auto-saves privately to your device</span>
              </div>

              <RouterLink
                to="/"
                onNavigate={onNavigate}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-extrabold text-white inline-flex items-center justify-center gap-2 hover:brightness-95 transition-all whitespace-nowrap"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <span>Go to Today</span>
                <ArrowRight className="w-4 h-4" />
              </RouterLink>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
