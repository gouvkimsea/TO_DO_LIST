import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { InteractiveDashboard } from '../components/InteractiveDashboard';
import { SharedDashboardPageProps } from './types';

export const HowItWorksPage: React.FC<SharedDashboardPageProps> = ({
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  activeView,
  selectedDate,
  weekRangeLabel,
  searchQuery,
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
  onToggleGoalTask,
  onCycleGoalPriority,
  onCycleGoalStatus,
  onCycleGoalCategory,
  onUpdateGoalText,
  onQuickSave,
}) => {
  const [bookmarked, setBookmarked] = useState<boolean>(false);

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

  return (
    <section
      id="how-it-works"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="my-tasks.html — works anywhere, saves itself"
          className="w-full"
          defaultFullscreen
          topRightBadge={
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label="Bookmark this dashboard"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-[#FAF7F2] px-2.5 py-1 rounded-full shadow-xs border border-[#E8E0D5] cursor-pointer"
            >
              <Star
                className={`w-3.5 h-3.5 text-[#E4B34C] ${
                  bookmarked ? 'fill-[#E4B34C]' : ''
                }`}
              />
              <span className="text-[11px] font-bold text-[#9C7B49]">
                {bookmarked ? 'bookmarked!' : 'bookmark it'}
              </span>
            </button>
          }
        >
          <div className="pt-2.5 sm:pt-3 px-3 sm:px-4">
            <SectionHeader
              eyebrow="WORKS ANYWHERE · SAVES ITSELF"
              italicSubtitle="open it once,"
              title="IT REMEMBERS EVERYTHING"
            />
          </div>

          <InteractiveDashboard
            columns={columns}
            monthlyGoals={monthlyGoals}
            yearlyGoals={yearlyGoals}
            activeTheme={activeTheme}
            activeView={activeView}
            selectedDate={selectedDate}
            weekRangeLabel={weekRangeLabel}
            searchQuery={searchQuery}
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
            onToggleGoalTask={onToggleGoalTask}
            onCycleGoalPriority={onCycleGoalPriority}
            onCycleGoalStatus={onCycleGoalStatus}
            onCycleGoalCategory={onCycleGoalCategory}
            onUpdateGoalText={onUpdateGoalText}
            instancePrefix="fullweek"
          />

          <div className="px-3 sm:px-4 pb-3 pt-2 border-t border-[#ECE7DF] space-y-2.5">
            {/* 3 Numbered Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              {[
                {
                  step: '1',
                  title: 'Open the file',
                  subtitle: 'in any browser',
                },
                {
                  step: '2',
                  title: 'Add to bookmarks',
                  subtitle: 'one star click',
                },
                {
                  step: '3',
                  title: 'Reopen anytime',
                  subtitle: 'tasks are saved',
                },
              ].map((card) => (
                <div
                  key={card.step}
                  className="bg-white rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-3 text-center flex items-center justify-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F5DFD0] text-[#B86741] font-extrabold text-sm flex items-center justify-center shrink-0 tabular-nums">
                    {card.step}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                      {card.title}
                    </h3>
                    <p className="text-[11px] font-medium text-[#8A8279]">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Auto-Save Banner */}
            <div className="flex justify-center">
              <div className="bg-[#EFF3EE] border border-[#DCE6DA] rounded-full px-4 py-1.5 inline-flex items-center gap-2 shadow-xs">
                <span className="w-4 h-4 rounded-full bg-[#4E7E59] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="text-xs font-bold text-[#446B4D]">
                  Auto-saves to your device — no account, no cloud, no subscription
                </span>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
