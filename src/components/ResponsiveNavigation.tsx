import React, { useState, useEffect } from 'react';
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckSquare,
  ClipboardPaste,
  Columns3,
  Download,
  FileSpreadsheet,
  Keyboard,
  LayoutDashboard,
  Maximize2,
  Menu,
  Moon,
  Palette,
  Repeat2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  PAGE_ROUTES,
  PagePath,
  THEMES,
  ThemeId,
  ViewMode,
  sanitizeTaskText,
  getMobileNavigationGroups,
  MOBILE_NAVIGATION_ITEMS,
} from '../utils/todoLogic';
import { ColorScheme, ColorSchemePreference } from '../utils/colorScheme';
import { RouterLink } from './RouterLink';
import { PWAHeaderControls } from './PWAStatusAndInstallBar';

export interface ResponsiveNavigationProps {
  currentPath: PagePath;
  currentViewContextLabel: string;
  activeView: ViewMode;
  activeTheme: ThemeId;
  colorScheme: ColorScheme;
  colorSchemePreference: ColorSchemePreference;
  soundEnabled: boolean;
  isPresentationMode: boolean;
  searchQuery: string;
  searchMatchCount: number;
  searchOverlayOpen: boolean;
  archivedCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  swOfflineReady: boolean;
  lastSyncedAt: string | null;
  idbRevision: number;
  onNavigate: (path: PagePath) => void;
  onSelectView: (view: ViewMode) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onToggleColorScheme: () => void;
  onToggleSound: () => void;
  onEnterPresentationMode: () => void;
  onSearchQueryChange: (query: string) => void;
  onOpenSearchOverlay: () => void;
  onOpenArchiveModal: () => void;
  onOpenBulkImportModal: (dayId?: string) => void;
  onOpenShortcutsModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenThemeCustomizerModal?: () => void;
  onExportCsv: () => void;
  onExportJsonBackup: () => void;
  onRetryConnectionAndSync: () => Promise<void>;
}

function getRouteIcon(path: PagePath) {
  const iconClass = 'w-4 h-4 shrink-0';
  switch (path) {
    case '/':
      return <LayoutDashboard className={iconClass} />;
    case '/daily-columns':
      return <Columns3 className={iconClass} />;
    case '/live-progress':
      return <BarChart3 className={iconClass} />;
    case '/monthly-yearly':
      return <Calendar className={iconClass} />;
    case '/color-themes':
      return <Palette className={iconClass} />;
    case '/spreadsheet':
      return <FileSpreadsheet className={iconClass} />;
    case '/one-click':
      return <CheckSquare className={iconClass} />;
    case '/built-to-reuse':
      return <Repeat2 className={iconClass} />;
    case '/everything-you-get':
      return <Download className={iconClass} />;
    case '/how-it-works':
    default:
      return <Sparkles className={iconClass} />;
  }
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  currentPath,
  currentViewContextLabel,
  activeView,
  activeTheme,
  colorScheme,
  colorSchemePreference,
  soundEnabled,
  isPresentationMode,
  searchQuery,
  searchMatchCount,
  searchOverlayOpen,
  archivedCount,
  isOnline,
  isSyncing,
  pendingSyncCount,
  swOfflineReady,
  lastSyncedAt,
  idbRevision,
  onNavigate,
  onSelectView,
  onSelectTheme,
  onToggleColorScheme,
  onToggleSound,
  onEnterPresentationMode,
  onSearchQueryChange,
  onOpenSearchOverlay,
  onOpenArchiveModal,
  onOpenBulkImportModal,
  onOpenShortcutsModal,
  onOpenDownloadModal,
  onOpenThemeCustomizerModal,
  onExportCsv,
  onExportJsonBackup,
  onRetryConnectionAndSync,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = THEMES[activeTheme];
  const { groups: mobileNavGroups } = getMobileNavigationGroups(currentPath);

  // Close mobile drawer when route changes or Escape is pressed
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!mobileMenuOpen || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        aria-label="Top Navigation Bar"
        data-testid="responsive-top-header"
        className="w-full bg-[#FAF6F0]/95 backdrop-blur-xs border-b border-[#ECE7DF] px-2.5 sm:px-5 lg:px-8 py-2 sm:py-2.5 sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Primary Top Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
            {/* Left: Hamburger Menu (Mobile/Tablet) + Brand + Current View Context */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={
                  mobileMenuOpen
                    ? 'Close navigation menu'
                    : 'Open navigation menu'
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                data-testid="mobile-nav-menu-toggle"
                className="lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl text-[#2F2B28] bg-[#F2EFE9] hover:bg-[#E4DDD3] border border-[#E2D9CC] transition-colors cursor-pointer shrink-0"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <RouterLink
                  to="/"
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  data-testid="app-brand-link"
                  className="inline-flex items-center gap-1.5 sm:gap-2 font-serif-display text-xs sm:text-lg font-bold tracking-tight text-[#2F2B28] hover:text-[#B05C37] whitespace-nowrap min-w-0 py-1"
                >
                  <img
                    src="/assets/aistudio/image_a84fc237.png"
                    alt="Weekly To-Do Logo"
                    data-testid="app-brand-logo"
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-2xs"
                  />
                  <span className="truncate">my-tasks.html</span>
                </RouterLink>
                <span
                  aria-hidden="true"
                  className="hidden xs:inline text-xs sm:text-sm text-[#A59E95] select-none shrink-0"
                >
                  /
                </span>
                <span
                  data-testid="top-nav-view-context"
                  className="hidden xs:inline text-[11px] sm:text-sm font-medium text-[#6E665E] truncate"
                >
                  {currentViewContextLabel}
                </span>
              </div>
            </div>

            {/* Center: Global Task Search Bar + Multi-Filter Overlay Trigger (Tablet/Desktop) */}
            <div
              className="hidden md:flex items-center gap-1.5 flex-1 max-w-md mx-2"
              role="search"
            >
              <div className="relative flex-1 flex items-center">
                <Search
                  className="w-3.5 h-3.5 text-[#8A8279] absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  data-testid="global-header-search-input"
                  onChange={(e) =>
                    onSearchQueryChange(sanitizeTaskText(e.target.value, 120))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      if (searchQuery.trim().length > 0) {
                        onSearchQueryChange('');
                      } else {
                        e.currentTarget.blur();
                      }
                    } else if (
                      e.key === 'Enter' &&
                      e.currentTarget.value.trim().length > 0
                    ) {
                      e.preventDefault();
                      onOpenSearchOverlay();
                    }
                  }}
                  placeholder="Search all tasks, categories, notes... (/)"
                  aria-label="Global task search across all views"
                  className="w-full bg-white border border-[#DDD5CB] focus:border-[#C87D55] focus:ring-2 focus:ring-[#C87D55]/20 rounded-full pl-8 pr-16 py-1.5 text-xs font-medium text-[#2F2B28] placeholder:text-[#9C948B] transition-all focus:outline-none shadow-2xs"
                />
                {searchQuery.trim().length > 0 ? (
                  <div className="absolute right-2 flex items-center gap-1">
                    <span
                      data-testid="global-header-search-count"
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF0E6] text-[#A85B33] tabular-nums"
                    >
                      {searchMatchCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSearchQueryChange('')}
                      aria-label="Clear global search"
                      data-testid="global-header-search-clear"
                      className="text-[#8A8279] hover:text-[#2F2B28] p-1 rounded-full cursor-pointer hover:bg-[#F3EFE9]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="absolute right-2.5 text-[9px] font-semibold text-[#A89F93] border border-[#E0D8CD] px-1 py-0.2 rounded bg-[#F8F5EE] select-none pointer-events-none">
                    /
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenSearchOverlay}
                aria-label="Open task search and multi-filter overlay (Ctrl+K)"
                aria-expanded={searchOverlayOpen}
                title="Filter & find tasks across all days and custom categories (Ctrl+K)"
                data-testid="open-task-search-overlay-btn"
                data-custom-btn="secondary"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#4A433C] hover:text-[#2F2B28] bg-white hover:bg-[#F4EFE6] border border-[#DDD5CB] shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#B05C37] shrink-0" />
                <span>Filters</span>
              </button>
            </div>

            {/* Right: Touch-Friendly Quick Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <PWAHeaderControls
                isOnline={isOnline}
                isSyncing={isSyncing}
                pendingSyncCount={pendingSyncCount}
                swOfflineReady={swOfflineReady}
                lastSyncedAt={lastSyncedAt}
                idbRevision={idbRevision}
                onRetryConnectionAndSync={onRetryConnectionAndSync}
              />

              {onOpenThemeCustomizerModal && (
                <button
                  type="button"
                  onClick={onOpenThemeCustomizerModal}
                  aria-label="Open Personal Appearance & Theme Customization Settings"
                  title="Customize background image, button colors, and appearance mode"
                  data-testid="open-theme-customizer-btn"
                  data-custom-btn="primary"
                  className="inline-flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#2F2B28] hover:bg-[#3B3632] text-[#FAF6F0] border border-[#4A433C] shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Customize Theme</span>
                </button>
              )}

              <button
                type="button"
                onClick={onEnterPresentationMode}
                aria-label="Enter Fullscreen Presentation Mode (Press F)"
                aria-pressed={isPresentationMode}
                title="Enter Fullscreen Presentation Mode (F)"
                data-testid="enter-presentation-mode-btn"
                data-custom-btn="secondary"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#5A534C] hover:text-[#2F2B28] bg-[#F2EFE9] hover:bg-[#E4DDD3] border border-[#E2D9CC] cursor-pointer whitespace-nowrap"
              >
                <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={onToggleSound}
                aria-label={
                  soundEnabled
                    ? 'Mute task completion sound (Press M)'
                    : 'Unmute task completion sound (Press M)'
                }
                aria-pressed={soundEnabled}
                title={
                  soundEnabled
                    ? 'Mute completion sound (M)'
                    : 'Unmute completion sound (M)'
                }
                data-testid="top-nav-sound-toggle"
                className="inline-flex items-center justify-center min-w-[42px] min-h-[42px] sm:min-w-[38px] sm:min-h-[38px] p-2 rounded-xl text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onToggleColorScheme}
                data-color-scheme-preference={colorSchemePreference}
                aria-label={
                  colorSchemePreference === 'light'
                    ? 'Light Mode active (Default) — Click or press D for Dark Mode'
                    : colorSchemePreference === 'dark'
                    ? 'Dark Mode active — Click or press D to Follow System Mode'
                    : `System Mode active (${colorScheme}) — Click or press D for Light Mode`
                }
                aria-pressed={colorScheme === 'dark'}
                title={
                  colorSchemePreference === 'light'
                    ? 'Light Mode (Default) · Click for Dark Mode (D)'
                    : colorSchemePreference === 'dark'
                    ? 'Dark Mode · Click for System Mode (D)'
                    : `System Mode (${colorScheme}) · Click for Light Mode (D)`
                }
                data-testid="top-nav-theme-toggle"
                className="inline-flex items-center justify-center min-w-[42px] min-h-[42px] sm:min-w-[38px] sm:min-h-[38px] p-2 rounded-xl text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
              >
                {colorScheme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile & Tablet Horizontal Touch Route Strip (< 1024px) */}
          <nav
            aria-label="Mobile Quick Page Switcher"
            data-testid="mobile-quick-route-strip"
            className="lg:hidden flex items-center gap-1.5 pt-1.5 border-t border-[#EFEAE1] overflow-x-auto no-scrollbar pb-0.5"
          >
            {currentPath !== '/' && (
              <RouterLink
                to="/"
                currentPath={currentPath}
                onNavigate={onNavigate}
                data-testid="mobile-top-back-dashboard-btn"
                className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#F5DFD0] text-[#9A4E28] border border-[#E5C5AF] shrink-0 whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Home</span>
              </RouterLink>
            )}

            {MOBILE_NAVIGATION_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <RouterLink
                  key={item.path}
                  to={item.path}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  data-testid={`mobile-strip-link-${
                    item.path === '/'
                      ? 'dashboard'
                      : item.path.replace(/^\//, '')
                  }`}
                  className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2F2B28] text-[#FAF6F0] shadow-2xs'
                      : 'bg-white text-[#4A433C] border border-[#E5DEC9] hover:bg-[#EFECE6]'
                  }`}
                >
                  {getRouteIcon(item.path)}
                  <span>{item.label}</span>
                </RouterLink>
              );
            })}
          </nav>

          {/* Desktop Horizontal Route Navigation Strip (>= 1024px) */}
          <nav
            aria-label="Primary Page Navigation"
            data-testid="desktop-route-nav"
            className="hidden lg:flex items-center justify-between gap-1 pt-1.5 border-t border-[#EFEAE1] overflow-x-auto"
          >
            <div className="flex items-center gap-1 flex-wrap">
              {PAGE_ROUTES.map((route) => {
                const isActive = currentPath === route.path;
                return (
                  <RouterLink
                    key={route.path}
                    to={route.path}
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                    data-custom-btn={isActive ? 'primary' : undefined}
                    data-testid={`desktop-nav-link-${
                      route.path === '/'
                        ? 'dashboard'
                        : route.path.replace(/^\//, '')
                    }`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2F2B28] text-[#FAF6F0] shadow-2xs'
                        : 'text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {getRouteIcon(route.path)}
                    <span>{route.label}</span>
                  </RouterLink>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenArchiveModal}
                data-testid="desktop-nav-archive-btn"
                data-custom-btn="secondary"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#E2D9CC] text-[#4A433C] cursor-pointer whitespace-nowrap"
              >
                <Archive className="w-3 h-3 text-[#B05C37]" />
                <span>Archive ({archivedCount})</span>
              </button>

              <button
                type="button"
                onClick={onOpenShortcutsModal}
                data-testid="desktop-nav-shortcuts-btn"
                data-custom-btn="secondary"
                title="View Keyboard Shortcuts (?)"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#E2D9CC] text-[#4A433C] cursor-pointer whitespace-nowrap"
              >
                <Keyboard className="w-3 h-3 text-[#B05C37]" />
                <span>Shortcuts</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile & Tablet Slide-Over Navigation Drawer (< 1024px) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          data-testid="mobile-navigation-drawer"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            data-testid="mobile-navigation-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
          />

          {/* Slide-Over Panel */}
          <div className="relative z-10 w-full max-w-[360px] bg-[#FDFBF7] border-r border-[#E5DEC9] h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#ECE7DF] flex items-center justify-between gap-2 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/assets/aistudio/image_a84fc237.png"
                  alt="Weekly To-Do Logo"
                  data-testid="mobile-drawer-brand-logo"
                  className="w-8 h-8 object-contain shrink-0 drop-shadow-2xs"
                />
                <div className="min-w-0">
                  <span className="font-serif-display text-base font-bold text-[#2F2B28] block truncate">
                    my-tasks.html
                  </span>
                  <span className="text-[11px] font-semibold text-[#7A7269] block truncate">
                    {currentViewContextLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close mobile navigation menu"
                data-testid="mobile-nav-drawer-close"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl text-[#5A534C] hover:text-[#2F2B28] bg-[#F2EFE9] border border-[#E2D9CC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 space-y-4 flex-1">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearchOverlay();
                }}
                data-testid="mobile-drawer-search-btn"
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white border border-[#DED8CE] hover:border-[#C87D55] flex items-center justify-between gap-2 text-left shadow-2xs cursor-pointer"
              >
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2F2B28]">
                  <Search className="w-4 h-4 text-[#B05C37]" />
                  <span>Search &amp; Filter All Tasks...</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#9A4E28] text-[10px] font-bold">
                  Filters
                </span>
              </button>

              {/* View Horizon Switcher (Week / Month / Year) */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A8279] block mb-1.5 px-1">
                  PLANNING HORIZON
                </span>
                <div className="grid grid-cols-3 gap-1.5 bg-[#F2EFE9] p-1 rounded-xl border border-[#E4DDD3]">
                  {(
                    [
                      { id: 'week', label: 'Week' },
                      { id: 'month', label: 'Month' },
                      { id: 'year', label: 'Year' },
                    ] as const
                  ).map((v) => {
                    const isSelected = activeView === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          onSelectView(v.id);
                          if (v.id === 'month' || v.id === 'year') {
                            onNavigate('/monthly-yearly');
                          }
                          setMobileMenuOpen(false);
                        }}
                        data-testid={`mobile-drawer-view-${v.id}`}
                        className={`min-h-[42px] rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-white text-[#2F2B28] shadow-xs'
                            : 'text-[#6E665E] hover:text-[#2F2B28]'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categorized Large Navigation Cards (3 Logical Groups) */}
              <nav
                aria-label="Mobile Page Links"
                className="space-y-4"
              >
                {mobileNavGroups.map((group) => (
                  <div
                    key={group.id}
                    data-testid={`mobile-drawer-group-${group.id}`}
                    className="space-y-1.5"
                  >
                    <div className="px-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5A534C] block">
                        {group.title}
                      </span>
                      <span className="text-[10px] font-medium text-[#8A8279] block">
                        {group.subtitle}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {group.items.map((item) => {
                        const isActive = currentPath === item.path;
                        return (
                          <RouterLink
                            key={item.path}
                            to={item.path}
                            currentPath={currentPath}
                            onNavigate={(nextPath) => {
                              onNavigate(nextPath);
                              setMobileMenuOpen(false);
                            }}
                            data-testid={`mobile-drawer-link-${
                              item.path === '/'
                                ? 'dashboard'
                                : item.path.replace(/^\//, '')
                            }`}
                            className={`w-full min-h-[64px] px-3 py-2.5 rounded-2xl flex items-start justify-between gap-2.5 text-left transition-all ${
                              isActive
                                ? 'bg-[#2F2B28] text-[#FAF6F0] font-bold shadow-sm'
                                : 'bg-white hover:bg-[#FAF6F0] text-[#2F2B28] font-semibold border border-[#E6DFD3]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                  isActive
                                    ? 'bg-white/15 text-[#E8956B]'
                                    : 'bg-[#F5EFE6] text-[#B05C37]'
                                }`}
                              >
                                {getRouteIcon(item.path)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-xs sm:text-sm font-extrabold truncate">
                                    {item.label}
                                  </span>
                                  <span
                                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                      isActive
                                        ? 'bg-white/15 text-[#FAF6F0]'
                                        : 'bg-[#F2EFE9] text-[#6E665E]'
                                    }`}
                                  >
                                    {isActive ? 'Active' : item.badgeText}
                                  </span>
                                </div>
                                <p
                                  className={`text-[11px] font-medium mt-0.5 leading-snug ${
                                    isActive
                                      ? 'text-[#E5DEC9]'
                                      : 'text-[#7A7269]'
                                  }`}
                                >
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </RouterLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Color Theme Selector */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A8279] block mb-1.5 px-1">
                  COLOR THEME &amp; APPEARANCE
                </span>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = activeTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => onSelectTheme(themeKey)}
                        data-testid={`mobile-drawer-theme-${themeKey}`}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-[#2F2B28] ring-2 ring-[#2F2B28]/20 text-[#2F2B28]'
                            : 'bg-[#FAF7F2] border-[#E5DEC9] text-[#5A534C]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: t.checkboxBg }}
                        />
                        <span className="truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={onToggleColorScheme}
                  data-testid="mobile-drawer-appearance-toggle"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center justify-between text-xs font-bold text-[#2F2B28] cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    {colorScheme === 'dark' ? (
                      <Sun className="w-4 h-4 text-[#E8956B]" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#B05C37]" />
                    )}
                    <span>
                      Appearance:{' '}
                      {colorSchemePreference === 'light'
                        ? 'Light Mode (Default)'
                        : colorSchemePreference === 'dark'
                        ? 'Dark Mode'
                        : `System (${colorScheme})`}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-[#B05C37]">
                    Switch
                  </span>
                </button>

                {onOpenThemeCustomizerModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenThemeCustomizerModal();
                    }}
                    data-testid="mobile-drawer-open-theme-customizer-btn"
                    data-custom-btn="primary"
                    className="mt-2 w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#2F2B28] text-[#FAF6F0] flex items-center justify-between text-xs font-extrabold cursor-pointer shadow-2xs"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Palette className="w-4 h-4 text-[#E8956B]" />
                      <span>Customize Background &amp; Button Colors</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15">
                      Studio
                    </span>
                  </button>
                )}
              </div>

              {/* Quick Tools & Actions */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A8279] block mb-1.5 px-1">
                  QUICK TOOLS
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBulkImportModal('mon');
                    }}
                    data-testid="mobile-drawer-bulk-import-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
                    <span>Bulk Import</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenArchiveModal();
                    }}
                    data-testid="mobile-drawer-archive-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
                    <span>Archive ({archivedCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onExportCsv();
                    }}
                    data-testid="mobile-drawer-export-csv-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#3F7A4D] shrink-0" />
                    <span>Export .CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onExportJsonBackup();
                    }}
                    data-testid="mobile-drawer-backup-json-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
                    <span>Backup JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenShortcutsModal();
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#ECE7DF] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
                    <span>Shortcuts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenDownloadModal();
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-[#C26D43] text-white flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Get Package</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thumb-Friendly Bottom Mobile Navigation Bar (< 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="mobile-bottom-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E2D9CC] px-1.5 py-1 shadow-[0_-4px_20px_rgba(47,43,40,0.08)]"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <RouterLink
            to="/"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-dashboard"
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentPath === '/'
                ? 'bg-[#F5DFD0] text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <LayoutDashboard
              className="w-4 h-4 shrink-0"
              style={
                currentPath === '/' ? { color: theme.checkboxBg } : undefined
              }
            />
            <span>Dashboard</span>
          </RouterLink>

          <RouterLink
            to="/daily-columns"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-columns"
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentPath === '/daily-columns'
                ? 'bg-[#F5DFD0] text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <Columns3
              className="w-4 h-4 shrink-0"
              style={
                currentPath === '/daily-columns'
                  ? { color: theme.checkboxBg }
                  : undefined
              }
            />
            <span>Columns</span>
          </RouterLink>

          <RouterLink
            to="/live-progress"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-progress"
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
              currentPath === '/live-progress'
                ? 'bg-[#F5DFD0] text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <BarChart3
              className="w-4 h-4 shrink-0"
              style={
                currentPath === '/live-progress'
                  ? { color: theme.checkboxBg }
                  : undefined
              }
            />
            <span>Progress</span>
          </RouterLink>

          <button
            type="button"
            onClick={onOpenSearchOverlay}
            data-testid="mobile-bottom-nav-search"
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
              searchOverlayOpen
                ? 'bg-[#F5DFD0] text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            data-testid="mobile-bottom-nav-menu"
            className={`min-h-[48px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
              mobileMenuOpen
                ? 'bg-[#2F2B28] text-[#FAF6F0]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <Menu className="w-4 h-4 shrink-0" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
