import React, { useState } from 'react';
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronRight,
  ClipboardPaste,
  Columns3,
  Compass,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  Palette,
  Repeat2,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  PagePath,
  PAGE_ROUTES,
  ThemeId,
  THEMES,
  getMobileNavigationGroups,
  getAdjacentRoutes,
} from '../utils/todoLogic';
import { RouterLink } from './RouterLink';

export interface MobilePageNavigatorSectionProps {
  currentPath: PagePath;
  activeTheme: ThemeId;
  archivedCount: number;
  onNavigate: (path: PagePath) => void;
  onOpenSearchOverlay: () => void;
  onOpenArchiveModal: () => void;
  onOpenBulkImportModal: (dayId?: string) => void;
  onOpenThemeCustomizerModal?: () => void;
}

export function getMobileCardIcon(path: PagePath, className = 'w-5 h-5 shrink-0') {
  switch (path) {
    case '/':
      return <LayoutDashboard className={className} />;
    case '/daily-columns':
      return <Columns3 className={className} />;
    case '/live-progress':
      return <BarChart3 className={className} />;
    case '/monthly-yearly':
      return <Calendar className={className} />;
    case '/color-themes':
      return <Palette className={className} />;
    case '/spreadsheet':
      return <FileSpreadsheet className={className} />;
    case '/one-click':
      return <CheckSquare className={className} />;
    case '/built-to-reuse':
      return <Repeat2 className={className} />;
    case '/everything-you-get':
      return <Download className={className} />;
    case '/how-it-works':
    default:
      return <Sparkles className={className} />;
  }
}

export const MobilePageNavigatorSection: React.FC<
  MobilePageNavigatorSectionProps
> = ({
  currentPath,
  activeTheme,
  archivedCount,
  onNavigate,
  onOpenSearchOverlay,
  onOpenArchiveModal,
  onOpenBulkImportModal,
  onOpenThemeCustomizerModal,
}) => {
  const theme = THEMES[activeTheme];
  const { groups, activeItem, activeGroup } =
    getMobileNavigationGroups(currentPath);
  const { prev: rawPrev, next: rawNext } = getAdjacentRoutes(currentPath);
  const prev = rawPrev ?? PAGE_ROUTES[PAGE_ROUTES.length - 1];
  const next = rawNext ?? PAGE_ROUTES[0];
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<
    'all' | 'workspace' | 'analytics' | 'personalization'
  >('all');

  const visibleGroups =
    selectedGroupFilter === 'all'
      ? groups
      : groups.filter((g) => g.id === selectedGroupFilter);

  return (
    <section
      aria-label="Mobile Page & Feature Hub"
      data-testid="mobile-page-navigator-section"
      data-presentation-hide="true"
      className="lg:hidden w-full px-2.5 sm:px-4 pt-2 pb-5 box-border"
    >
      <div className="max-w-3xl mx-auto bg-[#FDFBF7] rounded-2xl border border-[#E5DEC9] shadow-[0_12px_32px_-12px_rgba(47,43,40,0.1)] p-3.5 sm:p-5 space-y-4">
        {/* Top Context Banner + Back to Dashboard / Adjacent Page Stepper */}
        <div className="flex flex-col gap-2.5 pb-3 border-b border-[#ECE5DA]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8A8279] block">
                  MOBILE APP DIRECTORY · {activeGroup.title.toUpperCase()}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-[#2F2B28] truncate">
                  Switch Page or Feature
                </h2>
              </div>
            </div>

            {currentPath !== '/' && (
              <RouterLink
                to="/"
                currentPath={currentPath}
                onNavigate={onNavigate}
                data-testid="mobile-hub-back-to-dashboard"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#2F2B28] text-[#FAF6F0] text-xs font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </RouterLink>
            )}
          </div>

          {/* Previous / Next Page Touch Stepper */}
          <div className="grid grid-cols-2 gap-2">
            <RouterLink
              to={prev?.path ?? '/everything-you-get'}
              currentPath={currentPath}
              onNavigate={onNavigate}
              data-testid="mobile-hub-prev-page"
              className="min-h-[46px] px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center gap-2 text-left transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#B05C37] shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8279] block">
                  Previous
                </span>
                <span className="text-xs font-bold text-[#2F2B28] block truncate">
                  {prev?.label ?? 'Everything You Get'}
                </span>
              </div>
            </RouterLink>

            <RouterLink
              to={next?.path ?? '/how-it-works'}
              currentPath={currentPath}
              onNavigate={onNavigate}
              data-testid="mobile-hub-next-page"
              className="min-h-[46px] px-3 py-2 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center justify-between gap-2 text-right transition-colors"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A8279] block">
                  Next Page
                </span>
                <span className="text-xs font-bold text-[#2F2B28] block truncate">
                  {next?.label ?? 'How It Works'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B05C37] shrink-0" />
            </RouterLink>
          </div>
        </div>

        {/* Logical Category Group Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter navigation groups"
          data-testid="mobile-hub-group-tabs"
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#F2EFE9] p-1 rounded-xl border border-[#E4DDD3]"
        >
          {(
            [
              { id: 'all', label: 'All (10)' },
              { id: 'workspace', label: 'Workspace (3)' },
              { id: 'analytics', label: 'Analytics (2)' },
              { id: 'personalization', label: 'Tools & Themes (5)' },
            ] as const
          ).map((tab) => {
            const isSelected = selectedGroupFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`mobile-hub-group-tab-${tab.id}`}
                onClick={() => setSelectedGroupFilter(tab.id)}
                className={`min-h-[42px] px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#2F2B28] shadow-2xs'
                    : 'text-[#6E665E] hover:text-[#2F2B28]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Categorized Large Touch Navigation Cards */}
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <div
              key={group.id}
              data-testid={`mobile-hub-group-${group.id}`}
              className="space-y-2"
            >
              <div className="px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A534C]">
                  {group.title}
                </h3>
                <p className="text-[11px] font-medium text-[#8A8279]">
                  {group.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.items.map((item) => {
                  const isActive = item.path === activeItem.path;
                  return (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      currentPath={currentPath}
                      onNavigate={onNavigate}
                      data-testid={`mobile-nav-card-${
                        item.path === '/'
                          ? 'dashboard'
                          : item.path.replace(/^\//, '')
                      }`}
                      className={`min-h-[74px] p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                        isActive
                          ? 'bg-[#2F2B28] text-[#FAF6F0] border-[#2F2B28] shadow-md'
                          : 'bg-white hover:bg-[#FAF6F0] text-[#2F2B28] border-[#E6DFD3] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-white/15 text-[#FAF6F0]'
                              : 'bg-[#F5EFE6] text-[#B05C37]'
                          }`}
                        >
                          {getMobileCardIcon(item.path, 'w-5 h-5 shrink-0')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-extrabold leading-tight">
                              {item.label}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-[#E8956B] text-[#1F1A17]'
                                  : 'bg-[#F2EFE9] text-[#6E665E]'
                              }`}
                            >
                              {isActive ? 'Current' : item.badgeText}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-medium mt-1 leading-snug ${
                              isActive ? 'text-[#E5DEC9]' : 'text-[#7A7269]'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#E8956B]' : 'text-[#A59E95]'
                        }`}
                      />
                    </RouterLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Mobile Action Tiles (Search, Customize Theme, Bulk Import, Archive) */}
        <div className="pt-2 border-t border-[#ECE5DA]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A8279] block mb-2 px-1">
            ONE-TAP WORKSPACE TOOLS
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={onOpenSearchOverlay}
              data-testid="mobile-hub-action-search"
              className="min-h-[52px] px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center gap-2.5 text-left text-xs font-extrabold text-[#2F2B28] cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#B05C37] shrink-0" />
              <span>Search Tasks</span>
            </button>

            {onOpenThemeCustomizerModal && (
              <button
                type="button"
                onClick={onOpenThemeCustomizerModal}
                data-testid="mobile-hub-action-theme"
                className="min-h-[52px] px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center gap-2.5 text-left text-xs font-extrabold text-[#2F2B28] cursor-pointer"
              >
                <Palette className="w-4 h-4 text-[#B05C37] shrink-0" />
                <span>Theme Studio</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenBulkImportModal('mon')}
              data-testid="mobile-hub-action-import"
              className="min-h-[52px] px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center gap-2.5 text-left text-xs font-extrabold text-[#2F2B28] cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4 text-[#B05C37] shrink-0" />
              <span>Bulk Import</span>
            </button>

            <button
              type="button"
              onClick={onOpenArchiveModal}
              data-testid="mobile-hub-action-archive"
              className="min-h-[52px] px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E5DEC9] flex items-center gap-2.5 text-left text-xs font-extrabold text-[#2F2B28] cursor-pointer"
            >
              <Archive className="w-4 h-4 text-[#B05C37] shrink-0" />
              <span>Archive ({archivedCount})</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
