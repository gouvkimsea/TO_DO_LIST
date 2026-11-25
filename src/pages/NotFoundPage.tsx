import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { PagePath } from '../utils/todoLogic';
import { BrowserFrame } from '../components/BrowserFrame';
import { RouterLink } from '../components/RouterLink';

interface NotFoundPageProps {
  onNavigate: (path: PagePath) => void;
}

const QUICK_LINKS: { path: PagePath; label: string }[] = [
  { path: '/', label: 'Today' },
  { path: '/daily-columns', label: 'Week' },
  { path: '/live-progress', label: 'Progress' },
  { path: '/monthly-yearly', label: 'Goals' },
];

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <section
      id="not-found"
      aria-label="Page not found"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-4 box-border"
    >
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center">
        <BrowserFrame className="w-full" defaultFullscreen={false}>
          <div className="p-6 sm:p-8 bg-white text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F5DFD0] text-[#B86741] flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2B28]">
                Page not found
              </h1>
              <p className="text-sm font-medium text-[#7A7269] mt-1.5 max-w-sm mx-auto">
                That page doesn&apos;t exist, or the link has moved. Let&apos;s take you back to your tasks.
              </p>
            </div>

            <div>
              <RouterLink
                to="/"
                onNavigate={onNavigate}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#C26D43] hover:bg-[#AE5D35] text-white font-extrabold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Today</span>
              </RouterLink>
            </div>

            <div className="pt-4 border-t border-[#F2EFE9] flex flex-wrap items-center justify-center gap-2">
              {QUICK_LINKS.map((route) => (
                <RouterLink
                  key={route.path}
                  to={route.path}
                  onNavigate={onNavigate}
                  className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D6] text-[#4A433C] font-bold text-xs inline-flex items-center transition-colors"
                >
                  {route.label}
                </RouterLink>
              ))}
            </div>
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
