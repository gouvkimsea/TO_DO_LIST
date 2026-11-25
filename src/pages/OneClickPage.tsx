import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import {
  CATEGORY_BADGE_STYLES,
  Priority,
  THEMES,
  TaskCategory,
  TaskStatus,
  cycleCategory,
  cyclePriority,
  cycleStatus,
} from '../utils/todoLogic';
import { BrowserFrame } from '../components/BrowserFrame';
import { RouterLink } from '../components/RouterLink';
import {
  PRIORITY_DOT_COLORS,
  STATUS_PILL_STYLES,
} from '../components/InteractiveDashboard';
import { SharedDashboardPageProps } from './types';

export const OneClickPage: React.FC<SharedDashboardPageProps> = ({
  activeTheme,
  onNavigate,
}) => {
  const [demoChecked, setDemoChecked] = useState<boolean>(true);
  const [demoPriority, setDemoPriority] = useState<Priority>('High');
  const [demoStatus, setDemoStatus] = useState<TaskStatus>('In Progress');
  const [demoCategory, setDemoCategory] = useState<TaskCategory>('Work');
  const theme = THEMES[activeTheme];

  return (
    <section
      id="one-click"
      aria-label="Try Quick Controls"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
              Try Quick Controls
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
              Tap any card below to see how one tap updates a task
            </p>
          </div>

          <RouterLink
            to="/"
            onNavigate={onNavigate}
            className="min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white inline-flex items-center gap-1.5 hover:brightness-95 transition-all whitespace-nowrap"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <span>Open My Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </RouterLink>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-4 sm:p-6 lg:p-8 bg-[#FAF7F2] flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Check it off */}
              <button
                type="button"
                onClick={() => setDemoChecked((c) => !c)}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-5 text-left transition-all active:scale-[0.99] cursor-pointer flex items-center gap-4 min-h-[96px]"
              >
                <span
                  data-demo-checkbox={demoChecked ? 'true' : 'false'}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    backgroundColor: demoChecked ? theme.checkboxBg : '#FAF8F5',
                    border: demoChecked ? 'none' : '2px solid #D5CEC4',
                  }}
                >
                  {demoChecked && (
                    <Check className="w-5 h-5 text-white stroke-[3]" />
                  )}
                </span>
                <div>
                  <h2 className="font-extrabold text-base text-[#2F2B28]">
                    Check it off
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
                    Currently: {demoChecked ? 'Done' : 'Not done yet'} — tap to toggle
                  </p>
                </div>
              </button>

              {/* Card 2: Priority */}
              <button
                type="button"
                onClick={() => setDemoPriority((p) => cyclePriority(p))}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-5 text-left transition-all active:scale-[0.99] cursor-pointer flex items-center gap-4 min-h-[96px]"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  {(['High', 'Med', 'Low'] as const).map((p) => (
                    <span
                      key={p}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        demoPriority === p
                          ? 'scale-125 ring-2 ring-[#7D746B]'
                          : 'opacity-60'
                      }`}
                      style={{ backgroundColor: PRIORITY_DOT_COLORS[p] }}
                    />
                  ))}
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-[#2F2B28]">
                    Change priority
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
                    Current: {demoPriority} — tap to switch High, Med, Low
                  </p>
                </div>
              </button>

              {/* Card 3: Category */}
              <button
                type="button"
                data-testid="oneclick-demo-category-card"
                onClick={() => setDemoCategory((cat) => cycleCategory(cat))}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-5 text-left transition-all active:scale-[0.99] cursor-pointer flex items-center gap-4 min-h-[96px]"
              >
                <span
                  data-category-badge={demoCategory}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border shrink-0 transition-colors"
                  style={{
                    backgroundColor: CATEGORY_BADGE_STYLES[demoCategory].bg,
                    color: CATEGORY_BADGE_STYLES[demoCategory].text,
                    borderColor: CATEGORY_BADGE_STYLES[demoCategory].border,
                  }}
                >
                  {demoCategory}
                </span>
                <div>
                  <h2 className="font-extrabold text-base text-[#2F2B28]">
                    Change category
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
                    Tap to switch Work, Personal, Health &amp; more
                  </p>
                </div>
              </button>

              {/* Card 4: Status */}
              <button
                type="button"
                onClick={() => setDemoStatus((s) => cycleStatus(s))}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-5 text-left transition-all active:scale-[0.99] cursor-pointer flex items-center gap-4 min-h-[96px]"
              >
                <span
                  data-status-pill={demoStatus}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors"
                  style={{
                    backgroundColor: STATUS_PILL_STYLES[demoStatus].bg,
                    color: STATUS_PILL_STYLES[demoStatus].text,
                  }}
                >
                  {demoStatus}
                </span>
                <div>
                  <h2 className="font-extrabold text-base text-[#2F2B28]">
                    Change status
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
                    Tap to switch To Do, In Progress, or Done
                  </p>
                </div>
              </button>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
