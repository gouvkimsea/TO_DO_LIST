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
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  PagePath,
  THEMES,
  ThemeId,
  ViewMode,
} from '../utils/todoLogic';
import { getSimplePageTitle } from '../utils/quickAddLogic';
import { ColorScheme, ColorSchemePreference } from '../utils/colorScheme';
import { RouterLink } from './RouterLink';

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
  onOpenQuickAdd: () => void;
  onOpenArchiveModal: () => void;
  onOpenBulkImportModal: (dayId?: string) => void;
  onOpenShortcutsModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenThemeCustomizerModal?: () => void;
  onExportCsv: () => void;
  onExportJsonBackup: () => void;
  onRetryConnectionAndSync: () => Promise<void>;
}

const PRIMARY_NAV_ITEMS: {
  path: PagePath;
  label: string;
  hint: string;
  testId: string;
}[] = [
  {
    path: '/',
    label: 'Today',
    hint: 'Focus list & daily tasks',
    testId: 'dashboard',
  },
  {
    path: '/daily-columns',
    label: 'Week',
    hint: 'Monday through Sunday',
    testId: 'daily-columns',
  },
  {
    path: '/live-progress',
    label: 'Progress',
    hint: 'Charts & weekly streaks',
    testId: 'live-progress',
  },
  {
    path: '/monthly-yearly',
    label: 'Goals',
    hint: 'Calendar, month & year',
    testId: 'monthly-yearly',
  },
  {
    path: '/spreadsheet',
    label: 'Sheet',
    hint: 'Table view & CSV export',
    testId: 'spreadsheet',
  },
];

const EXTRA_GUIDE_ITEMS: {
  path: PagePath;
  label: string;
  testId: string;
}[] = [
  { path: '/color-themes', label: 'Color Themes', testId: 'color-themes' },
  { path: '/one-click', label: 'Quick Actions', testId: 'one-click' },
  { path: '/how-it-works', label: 'How It Works', testId: 'how-it-works' },
  { path: '/built-to-reuse', label: 'Reuse Weekly', testId: 'built-to-reuse' },
  {
    path: '/everything-you-get',
    label: 'Offline Package',
    testId: 'everything-you-get',
  },
];

const BOTTOM_TAB_ROUTES: PagePath[] = ['/', '/daily-columns', '/live-progress'];

function getRouteIcon(path: PagePath, sizeClass = 'w-4 h-4 shrink-0') {
  switch (path) {
    case '/':
      return <LayoutDashboard className={sizeClass} />;
    case '/daily-columns':
      return <Columns3 className={sizeClass} />;
    case '/live-progress':
      return <BarChart3 className={sizeClass} />;
    case '/monthly-yearly':
      return <Calendar className={sizeClass} />;
    case '/color-themes':
      return <Palette className={sizeClass} />;
    case '/spreadsheet':
      return <FileSpreadsheet className={sizeClass} />;
    case '/one-click':
      return <CheckSquare className={sizeClass} />;
    case '/built-to-reuse':
      return <Repeat2 className={sizeClass} />;
    case '/everything-you-get':
      return <Download className={sizeClass} />;
    case '/how-it-works':
    default:
      return <Sparkles className={sizeClass} />;
  }
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  currentPath,
  activeTheme,
  colorScheme,
  colorSchemePreference,
  soundEnabled,
  isPresentationMode,
  searchQuery,
  searchMatchCount,
  searchOverlayOpen,
  archivedCount,
  onNavigate,
  onSelectTheme,
  onToggleColorScheme,
  onToggleSound,
  onEnterPresentationMode,
  onOpenSearchOverlay,
  onOpenQuickAdd,
  onOpenArchiveModal,
  onOpenBulkImportModal,
  onOpenShortcutsModal,
  onOpenDownloadModal,
  onOpenThemeCustomizerModal,
  onExportCsv,
  onExportJsonBackup,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = THEMES[activeTheme];
  const simpleTitle = getSimplePageTitle(currentPath);
  const isSecondaryMobilePage = !BOTTOM_TAB_ROUTES.includes(currentPath);
  const hasActiveSearch = searchQuery.trim().length > 0;

  useEffect(() => {
    setDrawerOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!drawerOpen || typeof window === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        aria-label="Top Navigation Bar"
        data-testid="responsive-top-header"
        className="w-full bg-[#FAF6F0]/95 backdrop-blur-sm border-b border-[#E8E1D6] px-3 sm:px-5 lg:px-8 h-[52px] md:h-[58px] sticky top-0 z-30 flex items-center"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Left: Brand (Desktop) / Back + Simple Page Name (Mobile) */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile back arrow when on secondary page */}
            {isSecondaryMobilePage && (
              <button
                type="button"
                onClick={() => onNavigate('/')}
                aria-label="Back to Today"
                data-testid="mobile-top-back-dashboard-btn"
                className="md:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1.5 rounded-xl text-[#4A433C] hover:text-[#2F2B28] hover:bg-[#EFECE6] active:scale-95 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <RouterLink
              to="/"
              currentPath={currentPath}
              onNavigate={onNavigate}
              data-testid="app-brand-link"
              className="inline-flex items-center gap-2 text-[#2F2B28] hover:text-[#B05C37] whitespace-nowrap shrink-0 transition-colors"
            >
              <img
                src="/assets/aistudio/image_a84fc237.png"
                alt="My Tasks Logo"
                data-testid="app-brand-logo"
                className="w-7 h-7 object-contain shrink-0"
              />
              {/* Mobile shows clear current page title; Desktop shows clean app name */}
              <span className="md:hidden text-base font-extrabold tracking-tight text-[#2F2B28]">
                {simpleTitle}
              </span>
              <span className="hidden md:inline font-serif-display text-lg font-bold tracking-tight">
                My Tasks
              </span>
            </RouterLink>
          </div>

          {/* Center: 5 Simple Primary Tabs (Tablet/Desktop >= 768px) */}
          <nav
            aria-label="Primary Page Navigation"
            data-testid="desktop-route-nav"
            className="hidden md:flex items-center gap-1"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <RouterLink
                  key={item.path}
                  to={item.path}
                  currentPath={currentPath}
                  onNavigate={onNavigate}
                  data-testid={`desktop-nav-link-${item.testId}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2F2B28] text-[#FAF6F0]'
                      : 'text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#EFECE6]'
                  }`}
                >
                  {getRouteIcon(item.path, 'w-4 h-4 shrink-0')}
                  <span>{item.label}</span>
                </RouterLink>
              );
            })}
          </nav>

          {/* Right: Unmistakable Primary Action (Desktop) + Clean Icon Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Primary + Add Task CTA on Desktop/Tablet */}
            <button
              type="button"
              onClick={onOpenQuickAdd}
              data-testid="top-nav-add-task-btn"
              data-custom-btn="primary"
              className="hidden md:inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-sm font-extrabold text-white shadow-2xs hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: theme.checkboxBg }}
            >
              <Plus className="w-4 h-4 stroke-[2.75]" />
              <span>Add Task</span>
            </button>

            {/* Clean Search Button (Mobile & Desktop) */}
            <button
              type="button"
              onClick={onOpenSearchOverlay}
              aria-label="Search tasks"
              aria-expanded={searchOverlayOpen}
              title="Search & filter tasks (Ctrl+K)"
              data-testid="open-task-search-overlay-btn"
              className={`relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[40px] md:min-h-[40px] rounded-xl active:scale-95 transition-colors cursor-pointer ${
                hasActiveSearch
                  ? 'bg-[#F5DFD0] text-[#9A4E28]'
                  : 'text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#EFECE6]'
              }`}
            >
              <Search className="w-[18px] h-[18px]" />
              {hasActiveSearch && (
                <span
                  data-testid="global-header-search-count"
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C26D43] text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums"
                >
                  {searchMatchCount}
                </span>
              )}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleColorScheme}
              data-color-scheme-preference={colorSchemePreference}
              aria-label={
                colorScheme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
              aria-pressed={colorScheme === 'dark'}
              title={
                colorScheme === 'dark'
                  ? 'Switch to Light Mode (D)'
                  : 'Switch to Dark Mode (D)'
              }
              data-testid="top-nav-theme-toggle"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-[40px] md:min-h-[40px] rounded-xl text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#EFECE6] active:scale-95 transition-colors cursor-pointer"
            >
              {colorScheme === 'dark' ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* More / Menu Button (Desktop >= 768px; Mobile has More in the thumb bottom bar) */}
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="app-navigation-drawer"
              data-testid="mobile-nav-menu-toggle"
              className="hidden md:inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-xl text-sm font-bold text-[#4A433C] hover:text-[#2F2B28] hover:bg-[#EFECE6] border border-[#E2D9CC] transition-colors cursor-pointer"
            >
              {drawerOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
              <span>More</span>
            </button>
          </div>
        </div>
      </header>

      {/* Clean Slide-Over Menu Drawer (Mobile & Desktop) */}
      {drawerOpen && (
        <div
          id="app-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu & Tools"
          data-testid="mobile-navigation-drawer"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <div
            data-testid="mobile-navigation-backdrop"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] animate-[fadeInBackdrop_180ms_ease-out]"
          />

          {/* Slide-Over Panel */}
          <div className="relative z-10 w-[88vw] max-w-[340px] bg-[#FDFBF7] border-l border-[#E5DEC9] h-full flex flex-col shadow-2xl overflow-y-auto overscroll-y-contain animate-[slideInRight_220ms_cubic-bezier(0.22,1,0.36,1)]">
            {/* Drawer Header */}
            <div className="px-4 py-3 border-b border-[#ECE7DF] flex items-center justify-between gap-2 sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/assets/aistudio/image_a84fc237.png"
                  alt="My Tasks Logo"
                  data-testid="mobile-drawer-brand-logo"
                  className="w-7 h-7 object-contain shrink-0"
                />
                <span className="font-serif-display text-base font-bold text-[#2F2B28] truncate">
                  My Tasks
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                data-testid="mobile-nav-drawer-close"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#F2EFE9] active:scale-95 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5 flex-1 pb-10 pb-safe">
              {/* Quick Add CTA */}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenQuickAdd();
                }}
                data-testid="drawer-quick-add-btn"
                data-custom-btn="primary"
                className="w-full min-h-[46px] px-4 rounded-xl text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-2xs hover:brightness-95 transition-all cursor-pointer"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <Plus className="w-4 h-4 stroke-[2.75]" />
                <span>Add a New Task</span>
              </button>

              {/* Section 1: Main Pages */}
              <nav aria-label="Main pages" className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8279] block px-2 mb-1.5">
                  Views
                </span>
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      currentPath={currentPath}
                      onNavigate={(nextPath) => {
                        onNavigate(nextPath);
                        setDrawerOpen(false);
                      }}
                      data-testid={`mobile-drawer-link-${item.testId}`}
                      className={`w-full min-h-[46px] px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                        isActive
                          ? 'bg-[#2F2B28] text-[#FAF6F0] font-bold'
                          : 'text-[#2F2B28] hover:bg-[#F2EFE9] font-semibold'
                      }`}
                    >
                      <span
                        className={
                          isActive ? 'text-[#E8956B]' : 'text-[#8A8279]'
                        }
                      >
                        {getRouteIcon(item.path, 'w-4 h-4 shrink-0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm block leading-tight">
                          {item.label}
                        </span>
                        <span
                          className={`text-[11px] font-medium block ${
                            isActive ? 'text-[#D6CEC2]' : 'text-[#8A8279]'
                          }`}
                        >
                          {item.hint}
                        </span>
                      </div>
                    </RouterLink>
                  );
                })}
              </nav>

              {/* Section 2: Helpful Tools */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8279] block px-2">
                  Tools
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenSearchOverlay();
                    }}
                    data-testid="mobile-drawer-search-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#B05C37] shrink-0" />
                    <span>Search</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenBulkImportModal('mon');
                    }}
                    data-testid="mobile-drawer-bulk-import-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <ClipboardPaste className="w-4 h-4 text-[#B05C37] shrink-0" />
                    <span>Paste List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenArchiveModal();
                    }}
                    data-testid="mobile-drawer-archive-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-[#B05C37] shrink-0" />
                    <span>Archive ({archivedCount})</span>
                  </button>

                  {onOpenThemeCustomizerModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenThemeCustomizerModal();
                      }}
                      data-testid="mobile-drawer-open-theme-customizer-btn"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-[#B05C37] shrink-0" />
                      <span>Style</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onExportCsv();
                    }}
                    data-testid="mobile-drawer-export-csv-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#3F7A4D] shrink-0" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onExportJsonBackup();
                    }}
                    data-testid="mobile-drawer-backup-json-btn"
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#B05C37] shrink-0" />
                    <span>Backup</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Color & Preferences */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8279] block px-2">
                  Colors &amp; Settings
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = activeTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => onSelectTheme(themeKey)}
                        data-testid={`mobile-drawer-theme-${themeKey}`}
                        className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all ${
                          isSelected
                            ? 'bg-white border-[#2F2B28] text-[#2F2B28]'
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

                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={onToggleColorScheme}
                    data-testid="mobile-drawer-appearance-toggle"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E6DFD3] flex items-center justify-between text-xs font-bold text-[#2F2B28] active:scale-[0.99] cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      {colorScheme === 'dark' ? (
                        <Sun className="w-4 h-4 text-[#E8956B]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#B05C37]" />
                      )}
                      <span>
                        {colorSchemePreference === 'light'
                          ? 'Light Mode'
                          : colorSchemePreference === 'dark'
                          ? 'Dark Mode'
                          : `Auto (${colorScheme})`}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#B05C37]">
                      Switch
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleSound}
                    data-testid="top-nav-sound-toggle"
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E6DFD3] flex items-center justify-between text-xs font-bold text-[#2F2B28] active:scale-[0.99] cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-[#3F7A4D]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-[#8A8279]" />
                      )}
                      <span>Completion Sound</span>
                    </span>
                    <span className="text-xs font-bold text-[#6E665E]">
                      {soundEnabled ? 'On' : 'Off'}
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onEnterPresentationMode();
                      }}
                      aria-pressed={isPresentationMode}
                      data-testid="enter-presentation-mode-btn"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] active:scale-[0.98] cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#6E665E]" />
                      <span>Fullscreen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDrawerOpen(false);
                        onOpenShortcutsModal();
                      }}
                      data-testid="desktop-nav-shortcuts-btn"
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#E6DFD3] flex items-center gap-2 text-xs font-bold text-[#2F2B28] active:scale-[0.98] cursor-pointer"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-[#6E665E]" />
                      <span>Shortcuts</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4: Extra Pages & Offline Package */}
              <div className="space-y-1 pt-2 border-t border-[#ECE7DF]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8A8279] block px-2 mb-1">
                  Guides &amp; Extras
                </span>
                {EXTRA_GUIDE_ITEMS.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      currentPath={currentPath}
                      onNavigate={(nextPath) => {
                        onNavigate(nextPath);
                        setDrawerOpen(false);
                      }}
                      data-testid={`mobile-drawer-link-${item.testId}`}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#2F2B28] text-[#FAF6F0]'
                          : 'text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {getRouteIcon(item.path, 'w-4 h-4 shrink-0')}
                      <span>{item.label}</span>
                    </RouterLink>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenDownloadModal();
                  }}
                  className="mt-2 w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E4DDD3] text-[#2F2B28] flex items-center justify-center gap-2 text-xs font-bold cursor-pointer active:scale-[0.99] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Offline Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Mobile Thumb-Zone Bottom Bar (< 768px) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="mobile-bottom-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#E5DEC9] px-1.5 pt-1.5 pb-safe shadow-[0_-2px_12px_rgba(47,43,40,0.06)]"
      >
        <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto pb-1">
          <RouterLink
            to="/"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-dashboard"
            className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
              currentPath === '/'
                ? 'text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <LayoutDashboard
              className="w-[18px] h-[18px] shrink-0"
              style={
                currentPath === '/' ? { color: theme.checkboxBg } : undefined
              }
            />
            <span>Today</span>
          </RouterLink>

          <RouterLink
            to="/daily-columns"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-columns"
            className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
              currentPath === '/daily-columns'
                ? 'text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <Columns3
              className="w-[18px] h-[18px] shrink-0"
              style={
                currentPath === '/daily-columns'
                  ? { color: theme.checkboxBg }
                  : undefined
              }
            />
            <span>Week</span>
          </RouterLink>

          {/* Center Unmistakable + Add Button */}
          <button
            type="button"
            onClick={onOpenQuickAdd}
            aria-label="Add a new task"
            data-testid="mobile-bottom-nav-add"
            data-custom-btn="primary"
            className="min-h-[44px] mx-1 rounded-2xl text-white flex flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold shadow-sm active:scale-95 transition-transform cursor-pointer"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <Plus className="w-5 h-5 stroke-[2.75]" />
          </button>

          <RouterLink
            to="/live-progress"
            currentPath={currentPath}
            onNavigate={onNavigate}
            data-testid="mobile-bottom-nav-progress"
            className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors ${
              currentPath === '/live-progress'
                ? 'text-[#9A4E28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <BarChart3
              className="w-[18px] h-[18px] shrink-0"
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
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-expanded={drawerOpen}
            data-testid="mobile-bottom-nav-menu"
            className={`min-h-[46px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
              drawerOpen
                ? 'text-[#2F2B28]'
                : 'text-[#6E665E] hover:text-[#2F2B28]'
            }`}
          >
            <Menu className="w-[18px] h-[18px] shrink-0" />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
