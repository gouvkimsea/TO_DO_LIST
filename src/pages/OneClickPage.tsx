import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  CATEGORY_BADGE_STYLES,
  Priority,
  TaskCategory,
  TaskStatus,
  cycleCategory,
  cyclePriority,
  cycleStatus,
} from '../utils/todoLogic';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import {
  InteractiveDashboard,
  PRIORITY_DOT_COLORS,
  STATUS_PILL_STYLES,
} from '../components/InteractiveDashboard';
import { SharedDashboardPageProps } from './types';

export const OneClickPage: React.FC<SharedDashboardPageProps> = ({
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
}) => {
  const [demoChecked, setDemoChecked] = useState<boolean>(true);
  const [demoPriority, setDemoPriority] = useState<Priority>('High');
  const [demoStatus, setDemoStatus] = useState<TaskStatus>('In Progress');
  const [demoCategory, setDemoCategory] = useState<TaskCategory>('Work');

  return (
    <section
      id="one-click"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="click anything — it updates instantly"
          className="w-full"
          defaultFullscreen
        >
          <div className="pt-2.5 sm:pt-3 px-3 sm:px-4">
            <SectionHeader
              eyebrow="FULLY INTERACTIVE"
              italicSubtitle="every task is"
              title="ONE CLICK AWAY"
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
            instancePrefix="oneclick"
          />

          {/* 4 Interactive Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-4 pb-3 pt-2 border-t border-[#ECE7DF]">
            {/* Card 1: Check it off */}
            <button
              type="button"
              onClick={() => setDemoChecked((c) => !c)}
              className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-3.5 text-center transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3.5"
            >
              <div className="flex items-center justify-center shrink-0">
                <span
                  data-demo-checkbox={demoChecked ? 'true' : 'false'}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: demoChecked ? '#C87D55' : '#FAF8F5',
                    border: demoChecked ? 'none' : '2px solid #D5CEC4',
                  }}
                >
                  {demoChecked && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                  Check it off
                </h3>
                <p className="text-xs font-medium text-[#8A8279]">
                  Strikes through &amp; turns {demoChecked ? 'complete' : 'green'}
                </p>
              </div>
            </button>

            {/* Card 2: Tap the dot */}
            <button
              type="button"
              onClick={() => setDemoPriority((p) => cyclePriority(p))}
              className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-3.5 text-center transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3.5"
            >
              <div className="flex items-center justify-center gap-1.5 shrink-0">
                {(['High', 'Med', 'Low'] as const).map((p) => (
                  <span
                    key={p}
                    className={`w-3.5 h-3.5 rounded-full transition-transform ${
                      demoPriority === p
                        ? 'scale-125 ring-2 ring-[#7D746B]'
                        : 'opacity-70'
                    }`}
                    style={{ backgroundColor: PRIORITY_DOT_COLORS[p] }}
                  />
                ))}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                  Tap the dot
                </h3>
                <p className="text-xs font-medium text-[#8A8279]">
                  Cycles High, Med &amp; Low ({demoPriority})
                </p>
              </div>
            </button>

            {/* Card 3: Tap the badge */}
            <button
              type="button"
              data-testid="oneclick-demo-category-card"
              onClick={() => setDemoCategory((cat) => cycleCategory(cat))}
              className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-3.5 text-center transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3.5"
            >
              <div className="flex items-center justify-center shrink-0">
                <span
                  data-category-badge={demoCategory}
                  className="px-2.5 py-1 rounded text-xs font-bold border transition-colors"
                  style={{
                    backgroundColor: CATEGORY_BADGE_STYLES[demoCategory].bg,
                    color: CATEGORY_BADGE_STYLES[demoCategory].text,
                    borderColor: CATEGORY_BADGE_STYLES[demoCategory].border,
                  }}
                >
                  {demoCategory}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                  Tap the badge
                </h3>
                <p className="text-xs font-medium text-[#8A8279]">
                  Toggles Work, Personal, Health ({demoCategory})
                </p>
              </div>
            </button>

            {/* Card 4: Tap the pill */}
            <button
              type="button"
              onClick={() => setDemoStatus((s) => cycleStatus(s))}
              className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-3.5 text-center transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3.5"
            >
              <div className="flex items-center justify-center shrink-0">
                <span
                  data-status-pill={demoStatus}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: STATUS_PILL_STYLES[demoStatus].bg,
                    color: STATUS_PILL_STYLES[demoStatus].text,
                  }}
                >
                  {demoStatus}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                  Tap the pill
                </h3>
                <p className="text-xs font-medium text-[#8A8279]">
                  Sets To Do, In Progress, Done
                </p>
              </div>
            </button>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
