import {
  BulkImportOptions,
  CategoryColorId,
  CustomCategoryDefinition,
  DashboardMetrics,
  DayColumn,
  DetailedTask,
  PagePath,
  RecurringInterval,
  TaskCategory,
  ThemeId,
  ViewMode,
} from '../utils/todoLogic';

export interface SharedDashboardPageProps {
  columns: DayColumn[];
  detailedTasks: DetailedTask[];
  monthlyGoals: DetailedTask[];
  yearlyGoals: DetailedTask[];
  activeTheme: ThemeId;
  activeView: ViewMode;
  selectedDate: string;
  weekRangeLabel: string;
  searchQuery: string;
  metrics: DashboardMetrics;
  customCategories?: CustomCategoryDefinition[];
  onAddCustomCategory?: (
    name: string,
    colorId?: CategoryColorId
  ) => CustomCategoryDefinition | null;
  onRemoveCustomCategory?: (name: string) => void;
  onSearchQueryChange: (query: string) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onSelectView: (view: ViewMode) => void;
  onDateChange: (date: string) => void;
  onToggleDailyTask: (
    dayId: string,
    taskId: string,
    origin?: { x: number; y: number }
  ) => void;
  onCycleDailyPriority: (dayId: string, taskId: string) => void;
  onCycleDailyCategory: (
    dayId: string,
    taskId: string,
    explicitCategory?: TaskCategory
  ) => void;
  onCycleDailyRecurring?: (dayId: string, taskId: string) => void;
  onSetDailyRecurring?: (
    dayId: string,
    taskId: string,
    interval: RecurringInterval
  ) => void;
  onUpdateDailyTaskText: (dayId: string, taskId: string, text: string) => void;
  onQuickAddDailyTask?: (
    dayId: string,
    text: string,
    category?: TaskCategory,
    recurring?: RecurringInterval
  ) => void;
  onBulkImportTasks?: (
    dayId: string,
    rawInput: string,
    options?: BulkImportOptions
  ) => number;
  onOpenBulkImportModal?: (defaultDayId?: string) => void;
  onUpdateDailyTaskNotes: (dayId: string, taskId: string, notes: string) => void;
  onReorderOrMoveDailyTask: (activeTaskId: string, overId: string) => void;
  onResetWeek: () => void;
  onClearCompletedTasks: () => void;
  onClearPendingTasks: () => void;
  onToggleDetailedTask: (taskId: string) => void;
  onCycleDetailedPriority: (taskId: string) => void;
  onCycleDetailedStatus: (taskId: string) => void;
  onCycleDetailedCategory: (
    taskId: string,
    explicitCategory?: TaskCategory
  ) => void;
  onUpdateDetailedText: (taskId: string, text: string) => void;
  onToggleGoalTask: (mode: 'month' | 'year', taskId: string) => void;
  onCycleGoalPriority: (mode: 'month' | 'year', taskId: string) => void;
  onCycleGoalStatus: (mode: 'month' | 'year', taskId: string) => void;
  onCycleGoalCategory: (mode: 'month' | 'year', taskId: string) => void;
  onUpdateGoalText: (mode: 'month' | 'year', taskId: string, text: string) => void;
  onExportCsv: () => void;
  onExportJsonBackup?: () => void;
  onImportJsonBackup?: (rawJson: string) => boolean;
  onOpenModal: (tab: 'download' | 'demo') => void;
  onOpenShortcutsModal?: () => void;
  onOpenArchiveModal?: () => void;
  archivedCount?: number;
  onArchiveCompletedTasks?: () => void;
  onArchiveSingleDailyTask?: (dayId: string, taskId: string) => void;
  onArchiveSingleDetailedTask?: (taskId: string) => void;
  onQuickSave?: (customMessage?: string) => void;
  onNavigate: (path: PagePath) => void;
}


