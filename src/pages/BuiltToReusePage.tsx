import React, { useState } from 'react';
import { RotateCcw, Calendar, ArrowRight, Check } from 'lucide-react';
import { BrowserFrame } from '../components/BrowserFrame';
import { RouterLink } from '../components/RouterLink';
import { THEMES } from '../utils/todoLogic';
import { SharedDashboardPageProps } from './types';

export const BuiltToReusePage: React.FC<SharedDashboardPageProps> = ({
  activeTheme,
  onResetWeek,
  onNavigate,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [didReset, setDidReset] = useState(false);
  const theme = THEMES[activeTheme];

  const handleConfirmReset = () => {
    onResetWeek();
    setConfirmingReset(false);
    setDidReset(true);
  };

  return (
    <section
      id="built-to-reuse"
      aria-label="Reset and Reuse"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        <div className="px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
            Reset &amp; Start Fresh
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
            Clear your weekly tasks whenever you start a new week — your layout and themes stay saved
          </p>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-4 sm:p-6 lg:p-8 bg-[#FAF7F2] flex-1 flex flex-col justify-center gap-5">
            {/* Single Obvious Primary Action Card with Safe Confirmation */}
            <div className="bg-white rounded-2xl border border-[#E6DFD3] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-[#DFECE0] text-[#3F7A4D] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#2F2B28]">
                    Reset this week&apos;s tasks
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
                    Restores a clean weekly slate. Your theme, custom tags, and archive are safe.
                  </p>
                  {didReset && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D6E48] mt-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>Week reset cleanly.</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!confirmingReset ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDidReset(false);
                      setConfirmingReset(true);
                    }}
                    data-testid="reset-week-trigger-btn"
                    className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-extrabold text-white transition-all hover:brightness-95 active:scale-[0.99] cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: theme.checkboxBg }}
                  >
                    Reset Week
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConfirmReset}
                      data-testid="reset-week-confirm-btn"
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#B84A39] hover:bg-[#9E3C2D] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Yes, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(false)}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#5A534C] bg-[#F4EFE6] hover:bg-[#E8E0D4] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Clean Quick Jumps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RouterLink
                to="/daily-columns"
                onNavigate={onNavigate}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#FAF1EA] text-[#B05C37] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-[#2F2B28]">
                      This Week
                    </span>
                    <span className="text-xs text-[#7A7269]">
                      Plan Mon–Sun tasks
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8279]" />
              </RouterLink>

              <RouterLink
                to="/monthly-yearly"
                onNavigate={onNavigate}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#E6DFD3] p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[#E6E2F3] text-[#6B5B9E] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-[#2F2B28]">
                      Monthly &amp; Yearly Goals
                    </span>
                    <span className="text-xs text-[#7A7269]">
                      Track big-picture plans
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8279]" />
              </RouterLink>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
