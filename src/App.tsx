/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sun,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  DayColumn,
  DetailedTask,
  PagePath,
  PAGE_ROUTES,
  TaskCategory,
  ThemeId,
  THEMES,
  ViewMode,
  cyclePriority,
  cycleStatus,
  cycleCategory,
  cycleTheme,
  toggleTaskCompletion,
  updateTaskStatus,
  calculateDashboardMetrics,
  createInitialWeekColumns,
  clearWeekTasks,
  clearCompletedWeekTasks,
  clearPendingWeekTasks,
  clearDetailedTasksByCompletion,
  formatWeekRangeFromDate,
  shouldTriggerDayCompleteConfetti,
  isKnownRoutePath,
  resolveRoutePath,
  getAdjacentRoutes,
  formatTopBarViewContext,
  reorderOrMoveDailyTask,
  updateDailyTaskNotes,
  sanitizeTaskText,
  sanitizeTaskNotes,
  generateCsvExport,
  parsePersistedDashboardState,
  resolveKeyboardShortcutAction,
  syncDetailedTaskToggle,
  syncDailyTaskToggle,
  syncDetailedTaskStatus,
  syncDetailedTaskPriority,
  syncDetailedTaskCategory,
  syncDetailedTaskText,
  syncDailyTaskPriority,
  syncDailyTaskCategory,
  syncDailyTaskRecurring,
  updateDailyTaskRecurring,
  syncDailyTaskText,
  addQuickTaskToDayColumn,
  bulkImportTasksToDayColumn,
  BulkImportOptions,
  RecurringInterval,
  DETAILED_DAILY_TASK_LINKS,
  ArchivedTask,
  archiveCompletedTasks,
  archiveSingleDailyTask,
  archiveSingleDetailedTask,
  restoreArchivedTask,
  restoreAllArchivedTasks,
  countWeekTasksByCompletion,
  countMatchingTasks,
  CategoryColorId,
  CustomCategoryDefinition,
  addCustomCategory,
  removeCustomCategory,
  setRuntimeCustomCategories,
  getRuntimeCustomCategories,
} from './utils/todoLogic';
import {
  getSoundPreference,
  setSoundPreference,
  playTaskCompletionDing,
} from './utils/audioFeedback';
import {
  ColorScheme,
  getInitialColorScheme,
  getStoredColorScheme,
  setStoredColorScheme,
  toggleColorScheme,
  applyColorSchemeToDocument,
} from './utils/colorScheme';
import {
  FULLSCREEN_CHANGE_EVENTS,
  FullscreenDocumentLike,
  FullscreenElementLike,
  ScrollLockSnapshot,
  exitBrowserFullscreen,
  getActiveFullscreenElement,
  lockPresentationScroll,
  requestBrowserFullscreen,
  shouldPreventPresentationScrollKey,
  unlockPresentationScroll,
} from './utils/fullscreenMode';
import { useUndoRedo } from './hooks/useUndoRedo';
import { RouterLink } from './components/RouterLink';
import { DownloadModal } from './components/DownloadModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ArchiveModal } from './components/ArchiveModal';
import { BulkImportModal } from './components/BulkImportModal';
import { DashboardPage } from './pages/DashboardPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DailyColumnsPage } from './pages/DailyColumnsPage';
import { OneClickPage } from './pages/OneClickPage';
import { LiveProgressPage } from './pages/LiveProgressPage';
import { ColorThemesPage } from './pages/ColorThemesPage';
import { MonthlyYearlyPage } from './pages/MonthlyYearlyPage';
import { BuiltToReusePage } from './pages/BuiltToReusePage';
import { SpreadsheetPage } from './pages/SpreadsheetPage';
import { EverythingYouGetPage } from './pages/EverythingYouGetPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SharedDashboardPageProps } from './pages/types';
import { PomodoroProvider } from './components/PomodoroTimer';

const STORAGE_KEY = 'interactive_todo_dashboard_state_v1';
const BASE_PRODUCTION_URL =
  (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/+$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : '');

function loadInitialPersistedState() {
  if (typeof window === 'undefined') {
    return parsePersistedDashboardState(null);
  }
  try {
    return parsePersistedDashboardState(localStorage.getItem(STORAGE_KEY));
  } catch {
    return parsePersistedDashboardState(null);
  }
}

export default function App() {
  const initialPersisted = useMemo(() => loadInitialPersistedState(), []);

  const [isNotFoundRoute, setIsNotFoundRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.location.hash && isKnownRoutePath(window.location.hash)) {
      return false;
    }
    return !isKnownRoutePath(window.location.pathname);
  });

  const [currentPath, setCurrentPath] = useState<PagePath>(() => {
    if (typeof window === 'undefined') return '/';
    const hashCandidate = window.location.hash
      ? resolveRoutePath(window.location.hash)
      : '/';
    if (window.location.hash && hashCandidate !== '/') {
      return hashCandidate;
    }
    return resolveRoutePath(window.location.pathname);
  });

  const {
    state: taskSnapshot,
    setState: setTaskSnapshot,
    undo: handleUndoRaw,
    redo: handleRedoRaw,
    canUndo,
    canRedo,
  } = useUndoRedo<{
    columns: DayColumn[];
    detailedTasks: DetailedTask[];
    archivedTasks: ArchivedTask[];
  }>({
    columns: initialPersisted.columns,
    detailedTasks: initialPersisted.detailedTasks,
    archivedTasks: initialPersisted.archivedTasks,
  });

  const columns = taskSnapshot.columns;
  const detailedTasks = taskSnapshot.detailedTasks;
  const archivedTasks = taskSnapshot.archivedTasks;

  const setColumns = useCallback(
    (action: DayColumn[] | ((prev: DayColumn[]) => DayColumn[])) => {
      setTaskSnapshot((prev) => {
        const nextCols = typeof action === 'function' ? action(prev.columns) : action;
        return {
          columns: nextCols,
          detailedTasks: prev.detailedTasks,
          archivedTasks: prev.archivedTasks,
        };
      });
    },
    [setTaskSnapshot]
  );

  const setDetailedTasks = useCallback(
    (action: DetailedTask[] | ((prev: DetailedTask[]) => DetailedTask[])) => {
      setTaskSnapshot((prev) => {
        const nextDetailed =
          typeof action === 'function' ? action(prev.detailedTasks) : action;
        return {
          columns: prev.columns,
          detailedTasks: nextDetailed,
          archivedTasks: prev.archivedTasks,
        };
      });
    },
    [setTaskSnapshot]
  );

  const setBothTaskStates = useCallback(
    (nextCols: DayColumn[], nextDetailed: DetailedTask[]) => {
      setTaskSnapshot((prev) => ({
        columns: nextCols,
        detailedTasks: nextDetailed,
        archivedTasks: prev.archivedTasks,
      }));
    },
    [setTaskSnapshot]
  );
  const [monthlyGoals, setMonthlyGoals] = useState<DetailedTask[]>(
    () => initialPersisted.monthlyGoals
  );
  const [yearlyGoals, setYearlyGoals] = useState<DetailedTask[]>(
    () => initialPersisted.yearlyGoals
  );
  const [activeTheme, setActiveTheme] = useState<ThemeId>(
    () => initialPersisted.activeTheme
  );
  const [customCategories, setCustomCategories] = useState<
    CustomCategoryDefinition[]
  >(() => initialPersisted.customCategories);

  useEffect(() => {
    setRuntimeCustomCategories(customCategories);
  }, [customCategories]);

  const [activeView, setActiveView] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-11');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalState, setModalState] = useState<{
    open: boolean;
    tab: 'download' | 'demo';
  }>({ open: false, tab: 'download' });
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState<boolean>(false);
  const [bulkImportModalState, setBulkImportModalState] = useState<{
    open: boolean;
    dayId: string;
  }>({ open: false, dayId: 'mon' });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    getSoundPreference()
  );
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() =>
    getInitialColorScheme()
  );
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const scrollLockSnapshotRef = useRef<ScrollLockSnapshot | null>(null);
  const isEnteringFullscreenRef = useRef<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ message: string; shortcut?: string } | null>(null);
  const saveToastTimerRef = useRef<number | null>(null);

  // Sync colorScheme with DOM and listen for system preference changes if no explicit user preference is stored
  useEffect(() => {
    applyColorSchemeToDocument(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!getStoredColorScheme()) {
        setColorScheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Sync browser history popstate (Back / Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const known = isKnownRoutePath(window.location.pathname);
      setIsNotFoundRoute(!known);
      setCurrentPath(resolveRoutePath(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamically sync document title, meta description, Open Graph, Twitter cards, and canonical URL per route
  useEffect(() => {
    const matchedRoute =
      PAGE_ROUTES.find((r) => r.path === currentPath) || PAGE_ROUTES[0];
    const pageTitle = isNotFoundRoute
      ? '404 Page Not Found — Interactive Weekly To-Do Dashboard'
      : matchedRoute.path === '/'
      ? 'Interactive Weekly To-Do Dashboard'
      : `${matchedRoute.label} — Interactive Weekly To-Do Dashboard`;
    const pageDescription = isNotFoundRoute
      ? 'The page you requested could not be found. Return to the Interactive Weekly To-Do Dashboard.'
      : matchedRoute.description;
    const canonicalUrl = `${BASE_PRODUCTION_URL}${
      isNotFoundRoute ? '/404' : matchedRoute.path
    }`;

    document.title = pageTitle;

    const setMetaContent = (selector: string, content: string) => {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    setMetaContent('meta[name="description"]', pageDescription);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', pageDescription);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:description"]', pageDescription);

    const canonicalLink = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }, [currentPath, isNotFoundRoute]);

  const handleNavigate = useCallback((nextPath: PagePath) => {
    const resolved = resolveRoutePath(nextPath);
    if (typeof window !== 'undefined' && window.location.pathname !== resolved) {
      window.history.pushState({}, '', resolved);
    }
    setIsNotFoundRoute(false);
    setCurrentPath(resolved);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          columns,
          detailedTasks,
          monthlyGoals,
          yearlyGoals,
          archivedTasks,
          activeTheme,
          customCategories,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [
    columns,
    detailedTasks,
    monthlyGoals,
    yearlyGoals,
    archivedTasks,
    activeTheme,
    customCategories,
  ]);

  const handleExplicitSave = useCallback(
    (customMessage?: string, shortcutBadge?: string) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            columns,
            detailedTasks,
            monthlyGoals,
            yearlyGoals,
            archivedTasks,
            activeTheme,
            customCategories,
          })
        );
      } catch {
        setSaveToast({
          message: 'Local storage full — please export a backup or remove older tasks',
        });
        if (typeof window !== 'undefined') {
          if (saveToastTimerRef.current !== null) {
            window.clearTimeout(saveToastTimerRef.current);
          }
          saveToastTimerRef.current = window.setTimeout(() => {
            setSaveToast(null);
            saveToastTimerRef.current = null;
          }, 4500);
        }
        return;
      }
      setSaveToast({
        message: customMessage || 'Saved — all tasks & notes synced locally',
        shortcut: customMessage ? shortcutBadge : 'Ctrl+Enter',
      });
      if (typeof window !== 'undefined') {
        if (saveToastTimerRef.current !== null) {
          window.clearTimeout(saveToastTimerRef.current);
        }
        saveToastTimerRef.current = window.setTimeout(() => {
          setSaveToast(null);
          saveToastTimerRef.current = null;
        }, 2600);
      }
    },
    [
      columns,
      detailedTasks,
      monthlyGoals,
      yearlyGoals,
      archivedTasks,
      activeTheme,
      customCategories,
    ]
  );

  const handleUndo = useCallback(() => {
    if (handleUndoRaw()) {
      handleExplicitSave('Undid task change (Ctrl+Z)');
    }
  }, [handleUndoRaw, handleExplicitSave]);

  const handleRedo = useCallback(() => {
    if (handleRedoRaw()) {
      handleExplicitSave('Redid task change (Ctrl+Y)');
    }
  }, [handleRedoRaw, handleExplicitSave]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      setSoundPreference(next);
      handleExplicitSave(
        next
          ? 'Completion sound enabled 🔔 (Press M to mute)'
          : 'Completion sound muted 🔕 (Press M to unmute)'
      );
      if (next) {
        // Subtle preview chime when enabled
        playTaskCompletionDing(null, { forcePlay: true });
      }
      return next;
    });
  }, [handleExplicitSave]);

  const handleToggleColorScheme = useCallback(() => {
    setColorScheme((prev) => {
      const next = toggleColorScheme(prev);
      setStoredColorScheme(next);
      applyColorSchemeToDocument(next);
      handleExplicitSave(
        next === 'dark'
          ? 'Switched to Dark Mode (Press D for Light Mode)'
          : 'Switched to Light Mode (Press D for Dark Mode)'
      );
      return next;
    });
  }, [handleExplicitSave]);

  const handleEnterPresentationMode = useCallback(async () => {
    const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const currentScrollX = typeof window !== 'undefined' ? window.scrollX : 0;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
    if (typeof document !== 'undefined' && !scrollLockSnapshotRef.current) {
      scrollLockSnapshotRef.current = lockPresentationScroll(
        document as unknown as FullscreenDocumentLike,
        currentScrollY,
        currentScrollX
      );
    }
    setIsPresentationMode(true);

    if (typeof document !== 'undefined') {
      isEnteringFullscreenRef.current = true;
      try {
        await requestBrowserFullscreen(
          document.documentElement as unknown as FullscreenElementLike,
          document as unknown as FullscreenDocumentLike
        );
      } finally {
        isEnteringFullscreenRef.current = false;
      }
    }
  }, []);

  const handleExitPresentationMode = useCallback(async () => {
    setIsPresentationMode(false);
    const restoredScroll =
      typeof document !== 'undefined'
        ? unlockPresentationScroll(
            document as unknown as FullscreenDocumentLike,
            scrollLockSnapshotRef.current
          )
        : { scrollX: 0, scrollY: 0 };
    scrollLockSnapshotRef.current = null;

    if (typeof document !== 'undefined') {
      await exitBrowserFullscreen(
        document as unknown as FullscreenDocumentLike
      );
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: restoredScroll.scrollY,
        left: restoredScroll.scrollX,
        behavior: 'instant' as ScrollBehavior,
      });
    }
  }, []);

  const handleTogglePresentationMode = useCallback(() => {
    if (isPresentationMode) {
      void handleExitPresentationMode();
    } else {
      void handleEnterPresentationMode();
    }
  }, [
    isPresentationMode,
    handleEnterPresentationMode,
    handleExitPresentationMode,
  ]);

  // Synchronize Presentation Mode state with native browser fullscreen state (enter & exit)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleFullscreenChange = () => {
      if (isEnteringFullscreenRef.current) return;
      const activeFsEl = getActiveFullscreenElement(
        document as unknown as FullscreenDocumentLike
      );
      if (activeFsEl && !isPresentationMode) {
        const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        const currentScrollX = typeof window !== 'undefined' ? window.scrollX : 0;
        if (!scrollLockSnapshotRef.current) {
          scrollLockSnapshotRef.current = lockPresentationScroll(
            document as unknown as FullscreenDocumentLike,
            currentScrollY,
            currentScrollX
          );
        }
        setIsPresentationMode(true);
      } else if (!activeFsEl && isPresentationMode) {
        void handleExitPresentationMode();
      }
    };

    for (const evtName of FULLSCREEN_CHANGE_EVENTS) {
      document.addEventListener(evtName, handleFullscreenChange as EventListener);
    }
    return () => {
      for (const evtName of FULLSCREEN_CHANGE_EVENTS) {
        document.removeEventListener(
          evtName,
          handleFullscreenChange as EventListener
        );
      }
    };
  }, [isPresentationMode, handleExitPresentationMode]);

  // Prevent accidental window/page scrolling (wheel, touchmove, scroll) while Presentation Mode is active
  useEffect(() => {
    if (!isPresentationMode || typeof window === 'undefined') return;
    const hasOpenModal =
      archiveModalOpen || shortcutsModalOpen || modalState.open;

    const preventWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const preventWheelAndTouchScroll = (e: Event) => {
      if (hasOpenModal) return;
      e.preventDefault();
    };

    window.addEventListener('scroll', preventWindowScroll, { passive: true });
    window.addEventListener('wheel', preventWheelAndTouchScroll, {
      passive: false,
    });
    window.addEventListener('touchmove', preventWheelAndTouchScroll, {
      passive: false,
    });
    return () => {
      window.removeEventListener('scroll', preventWindowScroll);
      window.removeEventListener('wheel', preventWheelAndTouchScroll);
      window.removeEventListener('touchmove', preventWheelAndTouchScroll);
    };
  }, [
    isPresentationMode,
    archiveModalOpen,
    shortcutsModalOpen,
    modalState.open,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && saveToastTimerRef.current !== null) {
        window.clearTimeout(saveToastTimerRef.current);
      }
      if (typeof document !== 'undefined' && scrollLockSnapshotRef.current) {
        unlockPresentationScroll(
          document as unknown as FullscreenDocumentLike,
          scrollLockSnapshotRef.current
        );
        scrollLockSnapshotRef.current = null;
      }
    };
  }, []);

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = (e.target as HTMLElement | null) ||
        (document.activeElement as HTMLElement | null);
      const tagName = target?.tagName ? target.tagName.toUpperCase() : '';
      const isEditableTarget = Boolean(
        target &&
          (tagName === 'INPUT' ||
            tagName === 'TEXTAREA' ||
            tagName === 'SELECT' ||
            target.isContentEditable)
      );

      const action = resolveKeyboardShortcutAction({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        isEditableTarget,
      });

      if (
        !action &&
        isPresentationMode &&
        !archiveModalOpen &&
        !shortcutsModalOpen &&
        !modalState.open &&
        shouldPreventPresentationScrollKey({
          key: e.key,
          isEditableTarget,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
        })
      ) {
        e.preventDefault();
        return;
      }

      if (!action) return;

      switch (action) {
        case 'SAVE_DASHBOARD': {
          e.preventDefault();
          handleExplicitSave();
          if (
            isEditableTarget &&
            document.activeElement instanceof HTMLElement
          ) {
            document.activeElement.blur();
          }
          break;
        }
        case 'UNDO': {
          e.preventDefault();
          handleUndo();
          break;
        }
        case 'REDO': {
          e.preventDefault();
          handleRedo();
          break;
        }
        case 'TOGGLE_SOUND': {
          e.preventDefault();
          handleToggleSound();
          break;
        }
        case 'TOGGLE_DARK_MODE': {
          e.preventDefault();
          handleToggleColorScheme();
          break;
        }
        case 'TOGGLE_FULLSCREEN': {
          e.preventDefault();
          handleTogglePresentationMode();
          break;
        }
        case 'ESCAPE': {
          if (archiveModalOpen) {
            e.preventDefault();
            setArchiveModalOpen(false);
          } else if (shortcutsModalOpen) {
            e.preventDefault();
            setShortcutsModalOpen(false);
          } else if (modalState.open) {
            e.preventDefault();
            setModalState((prev) => ({ ...prev, open: false }));
          } else if (
            isEditableTarget &&
            document.activeElement instanceof HTMLElement
          ) {
            e.preventDefault();
            document.activeElement.blur();
          } else if (isPresentationMode) {
            e.preventDefault();
            void handleExitPresentationMode();
          } else if (searchQuery.trim().length > 0) {
            e.preventDefault();
            setSearchQuery('');
          } else if (saveToast) {
            setSaveToast(null);
          }
          break;
        }
        case 'OPEN_SHORTCUTS_MODAL': {
          e.preventDefault();
          setShortcutsModalOpen((prev) => !prev);
          break;
        }
        case 'OPEN_ARCHIVE_MODAL': {
          e.preventDefault();
          setArchiveModalOpen((prev) => !prev);
          break;
        }
        case 'FOCUS_SEARCH': {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[data-testid="global-header-search-input"], input[data-shortcut-search]'
          );
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        }
        case 'VIEW_WEEK': {
          e.preventDefault();
          setActiveView('week');
          break;
        }
        case 'VIEW_MONTH': {
          e.preventDefault();
          setActiveView('month');
          break;
        }
        case 'VIEW_YEAR': {
          e.preventDefault();
          setActiveView('year');
          break;
        }
        case 'CYCLE_THEME': {
          e.preventDefault();
          setActiveTheme((prev) => cycleTheme(prev));
          break;
        }
        case 'OPEN_DOWNLOAD_MODAL': {
          e.preventDefault();
          setShortcutsModalOpen(false);
          setModalState({ open: true, tab: 'download' });
          break;
        }
        case 'NAV_PREV_PAGE': {
          const { prev } = getAdjacentRoutes(currentPath);
          if (prev) {
            e.preventDefault();
            handleNavigate(prev.path);
          }
          break;
        }
        case 'NAV_NEXT_PAGE': {
          const { next } = getAdjacentRoutes(currentPath);
          if (next) {
            e.preventDefault();
            handleNavigate(next.path);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    archiveModalOpen,
    shortcutsModalOpen,
    modalState.open,
    isPresentationMode,
    searchQuery,
    saveToast,
    currentPath,
    handleExplicitSave,
    handleUndo,
    handleRedo,
    handleToggleSound,
    handleToggleColorScheme,
    handleTogglePresentationMode,
    handleExitPresentationMode,
    handleNavigate,
  ]);

  const { rangeLabel: weekRangeLabel } = useMemo(
    () => formatWeekRangeFromDate(selectedDate),
    [selectedDate]
  );

  const metrics = useMemo(
    () => calculateDashboardMetrics(columns, detailedTasks, customCategories),
    [columns, detailedTasks, customCategories]
  );

  const handleAddCustomCategory = useCallback(
    (
      name: string,
      colorId?: CategoryColorId
    ): CustomCategoryDefinition | null => {
      const { nextCustomCategories, addedCategory } = addCustomCategory(
        customCategories,
        name,
        colorId
      );
      if (addedCategory) {
        setRuntimeCustomCategories(nextCustomCategories);
        setCustomCategories(nextCustomCategories);
        handleExplicitSave(
          `Added custom category "#${addedCategory.name}"`
        );
      }
      return addedCategory;
    },
    [customCategories, handleExplicitSave]
  );

  const handleRemoveCustomCategory = useCallback(
    (name: string) => {
      const nextCustomCategories = removeCustomCategory(
        customCategories,
        name
      );
      if (nextCustomCategories.length !== customCategories.length) {
        setRuntimeCustomCategories(nextCustomCategories);
        setCustomCategories(nextCustomCategories);
        handleExplicitSave(`Removed custom category "#${name}"`);
      }
    },
    [customCategories, handleExplicitSave]
  );

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const { dayDates } = formatWeekRangeFromDate(newDate);
    setColumns((prev) =>
      prev.map((col, idx) => ({
        ...col,
        dateLabel: dayDates[idx] || col.dateLabel,
      }))
    );
  };

  const triggerSubtleDayConfetti = (origin?: { x: number; y: number }) => {
    try {
      const palette = THEMES[activeTheme];
      void confetti({
        particleCount: 42,
        spread: 60,
        startVelocity: 24,
        gravity: 0.95,
        scalar: 0.85,
        ticks: 150,
        origin: origin ?? { x: 0.5, y: 0.55 },
        colors: [
          palette.checkboxBg,
          ...palette.quadrantColors,
          '#84CA9E',
          '#EFC776',
        ],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore in non-canvas environments
    }
  };

  const handleToggleDailyTask = (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => {
    const currentDay = columns.find((col) => col.id === dayId);
    let targetTaskText = '';
    if (currentDay) {
      const targetTask = currentDay.tasks.find((t) => t.id === taskId);
      if (targetTask) {
        targetTaskText = targetTask.text;
        if (!targetTask.completed) {
          playTaskCompletionDing();
        }
      }
      const nextTasks = currentDay.tasks.map((t) =>
        t.id === taskId ? toggleTaskCompletion(t) : t
      );
      if (shouldTriggerDayCompleteConfetti(currentDay.tasks, nextTasks)) {
        triggerSubtleDayConfetti(origin);
      }
    }

    const {
      nextColumns,
      nextDetailedTasks,
      regeneratedTask,
      regeneratedTargetDayName,
    } = syncDailyTaskToggle(
      columns,
      detailedTasks,
      dayId,
      taskId
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);

    if (regeneratedTask && regeneratedTargetDayName) {
      setSaveToast({ message: `Completed recurring task "${targetTaskText || regeneratedTask.text}"! Automatically re-generated for ${regeneratedTargetDayName}.` });
      if (saveToastTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(saveToastTimerRef.current);
      }
      saveToastTimerRef.current =
        typeof window !== 'undefined'
          ? window.setTimeout(() => setSaveToast(null), 4000)
          : null;
    }
  };

  const handleCycleDailyPriority = (dayId: string, taskId: string) => {
    const { nextColumns, nextDetailedTasks } = syncDailyTaskPriority(
      columns,
      detailedTasks,
      dayId,
      taskId
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleCycleDailyCategory = (
    dayId: string,
    taskId: string,
    explicitCategory?: TaskCategory
  ) => {
    const { nextColumns, nextDetailedTasks } = syncDailyTaskCategory(
      columns,
      detailedTasks,
      dayId,
      taskId,
      explicitCategory,
      customCategories
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleCycleDailyRecurring = (dayId: string, taskId: string) => {
    const { nextColumns, nextDetailedTasks } = syncDailyTaskRecurring(
      columns,
      detailedTasks,
      dayId,
      taskId
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleSetDailyRecurring = (
    dayId: string,
    taskId: string,
    interval: RecurringInterval
  ) => {
    const { nextColumns, nextDetailedTasks } = syncDailyTaskRecurring(
      columns,
      detailedTasks,
      dayId,
      taskId,
      interval
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleUpdateDailyTaskText = (
    dayId: string,
    taskId: string,
    text: string
  ) => {
    const { nextColumns, nextDetailedTasks } = syncDailyTaskText(
      columns,
      detailedTasks,
      dayId,
      taskId,
      text
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleQuickAddDailyTask = useCallback(
    (
      dayId: string,
      rawText: string,
      category?: TaskCategory,
      recurring?: RecurringInterval
    ) => {
      const { nextColumns, nextDetailedTasks, addedTask } =
        addQuickTaskToDayColumn(columns, detailedTasks, dayId, rawText, {
          category,
          recurring,
        });
      if (!addedTask) return;
      const runtimeCats = getRuntimeCustomCategories();
      if (runtimeCats.length !== customCategories.length) {
        setCustomCategories([...runtimeCats]);
      }
      setBothTaskStates(nextColumns, nextDetailedTasks);
    },
    [columns, detailedTasks, customCategories.length, setBothTaskStates]
  );

  const handleBulkImportTasks = useCallback(
    (
      dayId: string,
      rawInput: string,
      options?: BulkImportOptions
    ): number => {
      const { nextColumns, nextDetailedTasks, addedTasks, targetDayName } =
        bulkImportTasksToDayColumn(
          columns,
          detailedTasks,
          dayId,
          rawInput,
          options
        );
      if (addedTasks.length === 0) return 0;

      const runtimeCats = getRuntimeCustomCategories();
      if (runtimeCats.length !== customCategories.length) {
        setCustomCategories([...runtimeCats]);
      }

      const prevCol = columns.find((c) => c.id === dayId);
      const nextCol = nextColumns.find((c) => c.id === dayId);
      if (
        prevCol &&
        nextCol &&
        shouldTriggerDayCompleteConfetti(prevCol.tasks, nextCol.tasks)
      ) {
        triggerSubtleDayConfetti();
      }

      setBothTaskStates(nextColumns, nextDetailedTasks);
      handleExplicitSave(
        `Imported ${addedTasks.length} task${
          addedTasks.length === 1 ? '' : 's'
        } into ${targetDayName || dayId}`
      );
      return addedTasks.length;
    },
    [
      columns,
      detailedTasks,
      customCategories.length,
      setBothTaskStates,
      handleExplicitSave,
      triggerSubtleDayConfetti,
    ]
  );

  const handleOpenBulkImportModal = useCallback(
    (defaultDayId?: string) => {
      const validDay =
        defaultDayId && columns.some((c) => c.id === defaultDayId)
          ? defaultDayId
          : columns[0]?.id || 'mon';
      setBulkImportModalState({ open: true, dayId: validDay });
    },
    [columns]
  );

  const handleUpdateDailyTaskNotes = (
    dayId: string,
    taskId: string,
    notes: string
  ) => {
    const cleanNotes = sanitizeTaskNotes(notes);
    setColumns((prev) => updateDailyTaskNotes(prev, dayId, taskId, cleanNotes));
  };

  const handleReorderOrMoveDailyTask = (
    activeTaskId: string,
    overId: string
  ) => {
    const nextColumns = reorderOrMoveDailyTask(columns, activeTaskId, overId);
    for (let i = 0; i < nextColumns.length; i++) {
      if (
        shouldTriggerDayCompleteConfetti(
          columns[i].tasks,
          nextColumns[i].tasks
        )
      ) {
        triggerSubtleDayConfetti();
        break;
      }
    }
    setColumns(nextColumns);
  };

  const handleResetWeek = () => {
    const hasAnyTasks = columns.some((col) =>
      col.tasks.some((t) => t.text.trim().length > 0)
    );
    if (hasAnyTasks) {
      setColumns(clearWeekTasks(columns));
    } else {
      setColumns(createInitialWeekColumns());
    }
  };

  const handleClearCompletedTasks = () => {
    setColumns((prev) => clearCompletedWeekTasks(prev));
    if (activeView === 'month') {
      setMonthlyGoals((prev) => clearDetailedTasksByCompletion(prev, 'completed'));
    } else if (activeView === 'year') {
      setYearlyGoals((prev) => clearDetailedTasksByCompletion(prev, 'completed'));
    }
  };

  const handleArchiveCompletedTasks = () => {
    const { nextColumns, nextDetailedTasks, nextArchive, archivedCount } =
      archiveCompletedTasks(columns, detailedTasks, archivedTasks);
    if (archivedCount > 0) {
      setTaskSnapshot({
        columns: nextColumns,
        detailedTasks: nextDetailedTasks,
        archivedTasks: nextArchive,
      });
      handleExplicitSave(
        `Archived ${archivedCount} completed task${archivedCount === 1 ? '' : 's'} (Press A to view)`
      );
    }
  };

  const handleArchiveSingleDailyTask = (dayId: string, taskId: string) => {
    const { nextColumns, nextDetailedTasks, nextArchive, archivedItem } =
      archiveSingleDailyTask(columns, detailedTasks, archivedTasks, dayId, taskId);
    if (archivedItem) {
      setTaskSnapshot({
        columns: nextColumns,
        detailedTasks: nextDetailedTasks,
        archivedTasks: nextArchive,
      });
      handleExplicitSave(`Archived "${archivedItem.text}" (Press A to view)`);
    }
  };

  const handleArchiveSingleDetailedTask = (taskId: string) => {
    const { nextColumns, nextDetailedTasks, nextArchive, archivedItem } =
      archiveSingleDetailedTask(detailedTasks, columns, archivedTasks, taskId);
    if (archivedItem) {
      setTaskSnapshot({
        columns: nextColumns,
        detailedTasks: nextDetailedTasks,
        archivedTasks: nextArchive,
      });
      handleExplicitSave(
        `Archived "${archivedItem.linkedDetailedText || archivedItem.text}" (Press A to view)`
      );
    }
  };

  const handleRestoreArchivedTask = (archiveId: string) => {
    const { nextColumns, nextDetailedTasks, nextArchive, restoredItem } =
      restoreArchivedTask(columns, detailedTasks, archivedTasks, archiveId);
    if (restoredItem) {
      setTaskSnapshot({
        columns: nextColumns,
        detailedTasks: nextDetailedTasks,
        archivedTasks: nextArchive,
      });
      handleExplicitSave(`Restored "${restoredItem.text}" to active tasks`);
    }
  };

  const handleRestoreAllArchivedTasks = () => {
    if (archivedTasks.length === 0) return;
    const count = archivedTasks.length;
    const { nextColumns, nextDetailedTasks, nextArchive } =
      restoreAllArchivedTasks(columns, detailedTasks, archivedTasks);
    setTaskSnapshot({
      columns: nextColumns,
      detailedTasks: nextDetailedTasks,
      archivedTasks: nextArchive,
    });
    handleExplicitSave(`Restored all ${count} archived tasks`);
  };

  const handleDeleteArchivedTask = (archiveId: string) => {
    setTaskSnapshot((prev) => ({
      ...prev,
      archivedTasks: prev.archivedTasks.filter((a) => a.archiveId !== archiveId),
    }));
  };

  const handleClearArchive = () => {
    if (archivedTasks.length === 0) return;
    setTaskSnapshot((prev) => ({
      ...prev,
      archivedTasks: [],
    }));
    handleExplicitSave('Emptied task archive');
  };

  const handleClearPendingTasks = () => {
    setColumns((prev) => clearPendingWeekTasks(prev));
    if (activeView === 'month') {
      setMonthlyGoals((prev) => clearDetailedTasksByCompletion(prev, 'pending'));
    } else if (activeView === 'year') {
      setYearlyGoals((prev) => clearDetailedTasksByCompletion(prev, 'pending'));
    }
  };

  const handleToggleDetailedTask = (taskId: string) => {
    const targetTask = detailedTasks.find((t) => t.id === taskId);
    if (targetTask && !targetTask.completed) {
      playTaskCompletionDing();
    }
    const { nextDetailedTasks, nextColumns } = syncDetailedTaskToggle(
      detailedTasks,
      columns,
      taskId
    );

    const link = DETAILED_DAILY_TASK_LINKS.find(
      (l) => l.detailedTaskId === taskId
    );
    if (link) {
      const prevCol = columns.find((c) => c.id === link.dayId);
      const nextCol = nextColumns.find((c) => c.id === link.dayId);
      if (
        prevCol &&
        nextCol &&
        shouldTriggerDayCompleteConfetti(prevCol.tasks, nextCol.tasks)
      ) {
        triggerSubtleDayConfetti();
      }
    }

    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleCycleDetailedPriority = (taskId: string) => {
    const { nextDetailedTasks, nextColumns } = syncDetailedTaskPriority(
      detailedTasks,
      columns,
      taskId
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleCycleDetailedStatus = (taskId: string) => {
    const target = detailedTasks.find((t) => t.id === taskId);
    const nextStatus = target ? cycleStatus(target.status) : 'Done';
    if (target && target.status !== 'Done' && nextStatus === 'Done') {
      playTaskCompletionDing();
    }
    const { nextDetailedTasks, nextColumns } = syncDetailedTaskStatus(
      detailedTasks,
      columns,
      taskId,
      nextStatus
    );

    const link = DETAILED_DAILY_TASK_LINKS.find(
      (l) => l.detailedTaskId === taskId
    );
    if (link) {
      const prevCol = columns.find((c) => c.id === link.dayId);
      const nextCol = nextColumns.find((c) => c.id === link.dayId);
      if (
        prevCol &&
        nextCol &&
        shouldTriggerDayCompleteConfetti(prevCol.tasks, nextCol.tasks)
      ) {
        triggerSubtleDayConfetti();
      }
    }

    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleCycleDetailedCategory = (
    taskId: string,
    explicitCategory?: TaskCategory
  ) => {
    const { nextDetailedTasks, nextColumns } = syncDetailedTaskCategory(
      detailedTasks,
      columns,
      taskId,
      explicitCategory,
      customCategories
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleUpdateDetailedText = (taskId: string, text: string) => {
    const { nextDetailedTasks, nextColumns } = syncDetailedTaskText(
      detailedTasks,
      columns,
      taskId,
      text
    );
    setBothTaskStates(nextColumns, nextDetailedTasks);
  };

  const handleToggleGoalTask = (mode: 'month' | 'year', taskId: string) => {
    const list = mode === 'month' ? monthlyGoals : yearlyGoals;
    const target = list.find((t) => t.id === taskId);
    if (target && !target.completed) {
      playTaskCompletionDing();
    }
    const setter = mode === 'month' ? setMonthlyGoals : setYearlyGoals;
    setter((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const completed = !t.completed;
        return {
          ...t,
          completed,
          status: completed ? 'Done' : t.status === 'Done' ? 'To Do' : t.status,
        };
      })
    );
  };

  const handleCycleGoalPriority = (mode: 'month' | 'year', taskId: string) => {
    const setter = mode === 'month' ? setMonthlyGoals : setYearlyGoals;
    setter((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, priority: cyclePriority(t.priority) } : t
      )
    );
  };

  const handleCycleGoalStatus = (mode: 'month' | 'year', taskId: string) => {
    const setter = mode === 'month' ? setMonthlyGoals : setYearlyGoals;
    setter((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus = updateTaskStatus(t);
        return {
          ...t,
          status: nextStatus.status,
          completed: nextStatus.completed,
        };
      })
    );
  };

  const handleCycleGoalCategory = (mode: 'month' | 'year', taskId: string) => {
    const setter = mode === 'month' ? setMonthlyGoals : setYearlyGoals;
    setter((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, category: cycleCategory(t.category, customCategories) }
          : t
      )
    );
  };

  const handleUpdateGoalText = (
    mode: 'month' | 'year',
    taskId: string,
    text: string
  ) => {
    const cleanText = sanitizeTaskText(text);
    const setter = mode === 'month' ? setMonthlyGoals : setYearlyGoals;
    setter((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, text: cleanText } : t))
    );
  };

  const handleExportCsv = () => {
    const csvContent = generateCsvExport(columns);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weekly-todo-tracker.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeCompletedCount = useMemo(() => {
    const dailyCompleted = countWeekTasksByCompletion(columns).completedCount;
    const detailedCompleted = detailedTasks.filter(
      (t) => t.completed && t.text.trim().length > 0 && t.text.trim() !== '—'
    ).length;
    return Math.max(dailyCompleted, detailedCompleted);
  }, [columns, detailedTasks]);

  const handleExportJsonBackup = useCallback(() => {
    try {
      const payload = JSON.stringify(
        {
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          columns,
          detailedTasks,
          monthlyGoals,
          yearlyGoals,
          archivedTasks,
          activeTheme,
          customCategories,
        },
        null,
        2
      );
      const blob = new Blob([payload], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const datePart = new Date().toISOString().slice(0, 10);
      a.download = `weekly-todo-backup-${datePart}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      handleExplicitSave('Exported JSON backup file');
    } catch {
      handleExplicitSave('Failed to export backup file');
    }
  }, [
    columns,
    detailedTasks,
    monthlyGoals,
    yearlyGoals,
    archivedTasks,
    activeTheme,
    customCategories,
    handleExplicitSave,
  ]);

  const handleImportJsonBackup = useCallback(
    (rawJsonString: string): boolean => {
      try {
        const parsed = parsePersistedDashboardState(rawJsonString);
        setTaskSnapshot({
          columns: parsed.columns,
          detailedTasks: parsed.detailedTasks,
          archivedTasks: parsed.archivedTasks,
        });
        setMonthlyGoals(parsed.monthlyGoals);
        setYearlyGoals(parsed.yearlyGoals);
        setActiveTheme(parsed.activeTheme);
        setCustomCategories(parsed.customCategories);
        handleExplicitSave('Backup restored successfully — all views updated');
        return true;
      } catch {
        return false;
      }
    },
    [setTaskSnapshot, handleExplicitSave]
  );

  const globalMatchStats = useMemo(
    () =>
      countMatchingTasks(
        columns,
        monthlyGoals,
        yearlyGoals,
        searchQuery,
        customCategories
      ),
    [columns, monthlyGoals, yearlyGoals, searchQuery, customCategories]
  );

  const sharedPageProps: SharedDashboardPageProps = {
    columns,
    detailedTasks,
    monthlyGoals,
    yearlyGoals,
    activeTheme,
    activeView,
    selectedDate,
    weekRangeLabel,
    searchQuery: sanitizeTaskText(searchQuery, 120),
    metrics,
    customCategories,
    onAddCustomCategory: handleAddCustomCategory,
    onRemoveCustomCategory: handleRemoveCustomCategory,
    onSearchQueryChange: (q) => setSearchQuery(sanitizeTaskText(q, 120)),
    onSelectTheme: setActiveTheme,
    onSelectView: setActiveView,
    onDateChange: handleDateChange,
    onToggleDailyTask: handleToggleDailyTask,
    onCycleDailyPriority: handleCycleDailyPriority,
    onCycleDailyCategory: handleCycleDailyCategory,
    onCycleDailyRecurring: handleCycleDailyRecurring,
    onSetDailyRecurring: handleSetDailyRecurring,
    onUpdateDailyTaskText: handleUpdateDailyTaskText,
    onQuickAddDailyTask: handleQuickAddDailyTask,
    onBulkImportTasks: handleBulkImportTasks,
    onOpenBulkImportModal: handleOpenBulkImportModal,
    onUpdateDailyTaskNotes: handleUpdateDailyTaskNotes,
    onReorderOrMoveDailyTask: handleReorderOrMoveDailyTask,
    onResetWeek: handleResetWeek,
    onClearCompletedTasks: handleClearCompletedTasks,
    onClearPendingTasks: handleClearPendingTasks,
    onToggleDetailedTask: handleToggleDetailedTask,
    onCycleDetailedPriority: handleCycleDetailedPriority,
    onCycleDetailedStatus: handleCycleDetailedStatus,
    onCycleDetailedCategory: handleCycleDetailedCategory,
    onUpdateDetailedText: handleUpdateDetailedText,
    onToggleGoalTask: handleToggleGoalTask,
    onCycleGoalPriority: handleCycleGoalPriority,
    onCycleGoalStatus: handleCycleGoalStatus,
    onCycleGoalCategory: handleCycleGoalCategory,
    onUpdateGoalText: handleUpdateGoalText,
    onExportCsv: handleExportCsv,
    onExportJsonBackup: handleExportJsonBackup,
    onImportJsonBackup: handleImportJsonBackup,
    onOpenModal: (tab) => setModalState({ open: true, tab }),
    onOpenShortcutsModal: () => setShortcutsModalOpen(true),
    onOpenArchiveModal: () => setArchiveModalOpen(true),
    archivedCount: archivedTasks.length,
    onArchiveCompletedTasks: handleArchiveCompletedTasks,
    onArchiveSingleDailyTask: handleArchiveSingleDailyTask,
    onArchiveSingleDetailedTask: handleArchiveSingleDetailedTask,
    onQuickSave: (customMessage?: string) => handleExplicitSave(customMessage),
    onNavigate: handleNavigate,
  };

  const renderActivePage = () => {
    if (isNotFoundRoute) {
      return <NotFoundPage onNavigate={handleNavigate} />;
    }
    switch (currentPath) {
      case '/':
        return <DashboardPage {...sharedPageProps} />;
      case '/how-it-works':
        return <HowItWorksPage {...sharedPageProps} />;
      case '/daily-columns':
        return <DailyColumnsPage {...sharedPageProps} />;
      case '/one-click':
        return <OneClickPage {...sharedPageProps} />;
      case '/live-progress':
        return <LiveProgressPage {...sharedPageProps} />;
      case '/color-themes':
        return <ColorThemesPage {...sharedPageProps} />;
      case '/monthly-yearly':
        return <MonthlyYearlyPage {...sharedPageProps} />;
      case '/built-to-reuse':
        return <BuiltToReusePage {...sharedPageProps} />;
      case '/spreadsheet':
        return <SpreadsheetPage {...sharedPageProps} />;
      case '/everything-you-get':
        return <EverythingYouGetPage {...sharedPageProps} />;
      default:
        return <DashboardPage {...sharedPageProps} />;
    }
  };

  const currentViewContextLabel = formatTopBarViewContext(
    currentPath,
    activeView,
    isNotFoundRoute
  );

  return (
    <PomodoroProvider>
      <div
        data-testid="app-root-container"
        data-presentation-active={isPresentationMode ? 'true' : 'false'}
        className={`flex flex-col radial-stage-bg text-[#2F2B28] ${
          isPresentationMode
            ? 'fixed inset-0 w-screen h-dvh overflow-hidden z-40'
            : 'min-h-dvh'
        }`}
      >
        {!isPresentationMode && (
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
        )}

        {!isPresentationMode && (
          <header
            aria-label="Top Navigation Bar"
            className="w-full bg-[#FAF6F0] px-4 sm:px-6 lg:px-8 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-baseline gap-2 sm:gap-2.5 min-w-0">
                <RouterLink
                  to="/"
                  currentPath={currentPath}
                  onNavigate={handleNavigate}
                  className="font-serif-display text-base sm:text-lg font-bold tracking-tight text-[#2F2B28] hover:text-[#B05C37] whitespace-nowrap shrink-0"
                >
                  my-tasks.html
                </RouterLink>
                <span
                  aria-hidden="true"
                  className="text-xs sm:text-sm text-[#A59E95] select-none shrink-0"
                >
                  /
                </span>
                <span
                  data-testid="top-nav-view-context"
                  className="text-xs sm:text-sm font-medium text-[#6E665E] truncate"
                >
                  {currentViewContextLabel}
                </span>
              </div>

              {/* Global Task Search Bar */}
              <div
                className="hidden md:flex items-center flex-1 max-w-sm mx-3"
                role="search"
              >
                <div className="relative w-full flex items-center">
                  <Search
                    className="w-3.5 h-3.5 text-[#8A8279] absolute left-3 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    data-testid="global-header-search-input"
                    onChange={(e) => setSearchQuery(sanitizeTaskText(e.target.value, 120))}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        if (searchQuery.trim().length > 0) {
                          setSearchQuery('');
                        } else {
                          e.currentTarget.blur();
                        }
                      }
                    }}
                    placeholder="Search all tasks, categories, notes... (/)"
                    aria-label="Global task search across all views"
                    className="w-full bg-white border border-[#DDD5CB] focus:border-[#C87D55] focus:ring-2 focus:ring-[#C87D55]/20 rounded-full pl-8 pr-16 py-1 text-xs font-medium text-[#2F2B28] placeholder:text-[#9C948B] transition-all focus:outline-none shadow-2xs"
                  />
                  {searchQuery.trim().length > 0 ? (
                    <div className="absolute right-2 flex items-center gap-1">
                      <span
                        data-testid="global-header-search-count"
                        className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF0E6] text-[#A85B33] tabular-nums"
                      >
                        {globalMatchStats.totalMatches}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear global search"
                        data-testid="global-header-search-clear"
                        className="text-[#8A8279] hover:text-[#2F2B28] p-0.5 rounded-full cursor-pointer hover:bg-[#F3EFE9]"
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
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleEnterPresentationMode()}
                  aria-label="Enter Fullscreen Presentation Mode (Press F)"
                  aria-pressed={isPresentationMode}
                  title="Enter Fullscreen Presentation Mode (F)"
                  data-testid="enter-presentation-mode-btn"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#5A534C] hover:text-[#2F2B28] bg-[#F2EFE9] hover:bg-[#E4DDD3] border border-[#E2D9CC] cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Fullscreen</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSound}
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
                  className="p-1.5 rounded-md text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleColorScheme}
                  aria-label={
                    colorScheme === 'dark'
                      ? 'Switch to Light Mode (Press D)'
                      : 'Switch to Dark Mode (Press D)'
                  }
                  aria-pressed={colorScheme === 'dark'}
                  title={
                    colorScheme === 'dark'
                      ? 'Switch to Light Mode (D)'
                      : 'Switch to Dark Mode (D)'
                  }
                  data-testid="top-nav-theme-toggle"
                  className="p-1.5 rounded-md text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
                >
                  {colorScheme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </header>
        )}

        {isPresentationMode && (
          <div
            data-testid="presentation-mode-controls"
            className="fixed top-3.5 right-3.5 sm:top-4 sm:right-5 z-50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => void handleExitPresentationMode()}
              aria-label="Exit Fullscreen Presentation Mode (Press Esc)"
              title="Exit Fullscreen Presentation Mode (Esc)"
              data-testid="exit-presentation-mode-btn"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#2F2B28] hover:bg-[#3B3632] text-[#FAF7F2] border border-[#4A433C] shadow-md cursor-pointer whitespace-nowrap"
            >
              <Minimize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Exit Fullscreen</span>
              <kbd className="hidden sm:inline-block ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#433E3A] border border-[#5A534C] rounded text-[#E5DEC9]">
                Esc
              </kbd>
            </button>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 flex flex-col focus:outline-none ${
            isPresentationMode
              ? 'h-dvh max-h-dvh overflow-hidden'
              : 'min-h-[calc(100dvh-var(--navbar-height,57px))]'
          }`}
        >
          {renderActivePage()}
        </main>

        {saveToast && (
          <div
            role="status"
            aria-live="polite"
            data-testid="shortcut-save-toast"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#2F2B28] text-[#FAF7F2] border border-[#4A433C] px-3.5 py-2 rounded-full shadow-lg text-xs font-bold pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-[#84CA9E] shrink-0" />
            <span>{saveToast.message}</span>
            {saveToast.shortcut && (
              <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#433E3A] border border-[#5A534C] rounded text-[#E5DEC9]">
                {saveToast.shortcut}
              </kbd>
            )}
          </div>
        )}

        <ArchiveModal
          isOpen={archiveModalOpen}
          archivedTasks={archivedTasks}
          activeCompletedCount={activeCompletedCount}
          activeTheme={activeTheme}
          onClose={() => setArchiveModalOpen(false)}
          onArchiveCompletedTasks={handleArchiveCompletedTasks}
          onRestoreTask={handleRestoreArchivedTask}
          onRestoreAll={handleRestoreAllArchivedTasks}
          onDeleteArchivedTask={handleDeleteArchivedTask}
          onClearArchive={handleClearArchive}
        />

        <KeyboardShortcutsModal
          isOpen={shortcutsModalOpen}
          onClose={() => setShortcutsModalOpen(false)}
          onTriggerSave={() => handleExplicitSave()}
        />

        <DownloadModal
          isOpen={modalState.open}
          initialTab={modalState.tab}
          onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
          columns={columns}
          activeTheme={activeTheme}
          weekRangeLabel={weekRangeLabel}
          onExportCsv={handleExportCsv}
        />

        <BulkImportModal
          isOpen={bulkImportModalState.open}
          columns={columns}
          activeTheme={activeTheme}
          initialDayId={bulkImportModalState.dayId}
          onClose={() =>
            setBulkImportModalState((prev) => ({ ...prev, open: false }))
          }
          onBulkImport={handleBulkImportTasks}
        />
      </div>
    </PomodoroProvider>
  );
}
