import React from 'react';
import { RotateCcw, Calendar } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { RouterLink } from '../components/RouterLink';
import { SharedDashboardPageProps } from './types';

export const BuiltToReusePage: React.FC<SharedDashboardPageProps> = ({
  onResetWeek,
  onNavigate,
}) => {
  return (
    <section
      id="built-to-reuse"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="my-tasks.html — one file, use it forever"
          className="w-full"
          defaultFullscreen
        >
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
            <SectionHeader
              eyebrow="BUILT TO REUSE"
              italicSubtitle="one file,"
              title="USE IT FOREVER"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto w-full mt-6">
              {/* Card 1: Four views in one */}
              <RouterLink
                to="/monthly-yearly"
                onNavigate={onNavigate}
                className="block bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-7 text-center transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#F5E0D2] flex items-center justify-center gap-1 mx-auto mb-4">
                  <span className="w-3.5 h-5 rounded-[3px] bg-[#E2A88C]" />
                  <span className="w-3.5 h-5 rounded-[3px] bg-[#A9C5A0]" />
                  <span className="w-3.5 h-5 rounded-[3px] bg-[#94B4C8]" />
                </div>
                <h2 className="font-bold text-base sm:text-lg text-[#2F2B28] mb-1.5">
                  Four views in one
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#8A8279] leading-relaxed">
                  Weekly, Monthly &amp;
                  <br />
                  Yearly — all included
                </p>
              </RouterLink>

              {/* Card 2: Reset to blank */}
              <button
                type="button"
                onClick={onResetWeek}
                className="bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-7 text-center transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#DFECE0] text-[#4C7C57] flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h2 className="font-bold text-base sm:text-lg text-[#2F2B28] mb-1.5">
                  Reset to blank
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#8A8279] leading-relaxed">
                  Clear any page with
                  <br />
                  one click — layout stays
                </p>
              </button>

              {/* Card 3: No dated pages */}
              <RouterLink
                to="/"
                onNavigate={onNavigate}
                className="block bg-white hover:bg-[#FDFBF8] rounded-2xl border border-[#EDE6DC] shadow-[0_10px_28px_-8px_rgba(68,53,39,0.08)] p-7 text-center transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#E6E2F3] text-[#6B5B9E] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h2 className="font-bold text-base sm:text-lg text-[#2F2B28] mb-1.5">
                  No dated pages
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#8A8279] leading-relaxed">
                  Reuse it week after
                  <br />
                  week — never expires
                </p>
              </RouterLink>
            </div>

            <p className="text-center text-xs sm:text-sm font-semibold text-[#8A8279] mt-8">
              Pre-filled with examples, or wipe it blank in one click — it is yours
              to keep
            </p>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
