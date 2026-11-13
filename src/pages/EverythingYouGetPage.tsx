import React from 'react';
import { Check, ArrowDown } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { BrowserFrame } from '../components/BrowserFrame';
import { SharedDashboardPageProps } from './types';

export const EverythingYouGetPage: React.FC<SharedDashboardPageProps> = ({
  onOpenModal,
}) => {
  return (
    <section
      id="everything-you-get"
      className="radial-stage-bg full-screen-hero w-full flex-1 min-h-[calc(100dvh-var(--navbar-height,57px))] flex flex-col px-1.5 sm:px-3 py-1.5 sm:py-2 box-border"
    >
      <div className="w-full flex-1 flex flex-col min-h-0">
        <BrowserFrame
          urlText="my-tasks.html — instant digital download"
          className="w-full"
          defaultFullscreen
        >
          <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
            <SectionHeader
              eyebrow="INSTANT DIGITAL DOWNLOAD"
              italicSubtitle="one purchase,"
              title="EVERYTHING YOU GET"
            />

            <div className="bg-white rounded-2xl border border-[#EDE6DC] shadow-[0_18px_45px_-12px_rgba(68,53,39,0.12)] px-6 sm:px-10 py-3 sm:py-4 divide-y divide-[#F2EFE9] max-w-4xl mx-auto w-full">
              {[
                {
                  title: 'Interactive HTML dashboard',
                  subtitle: '4 colour themes · works in any browser',
                },
                {
                  title: 'Weekly · Monthly · Yearly views',
                  subtitle: 'with live, auto-updating progress charts',
                },
                {
                  title: 'Auto-saves to your device',
                  subtitle: 'no account, no cloud, no subscription',
                },
                {
                  title: 'Google Sheets version',
                  subtitle: 'same colour-coded, horizontal layout',
                },
                {
                  title: 'Excel (.xlsx) version',
                  subtitle: 'dropdowns, conditional formatting & totals',
                },
                {
                  title: 'PDF quick-start guide',
                  subtitle: 'open it, bookmark it, start planning',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="py-3 sm:py-3.5 flex items-center gap-4"
                >
                  <span className="w-8 h-8 rounded-full bg-[#DFECE0] text-[#3F7A4D] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#2F2B28]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-[#8A8279]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => onOpenModal('download')}
                className="bg-[#C26D43] hover:bg-[#AE5D35] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(194,109,67,0.45)] inline-flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                <span>Instant download &nbsp;·&nbsp; free lifetime updates</span>
              </button>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
