import {
  DayColumn,
  PagePath,
  RecurringInterval,
  TaskCategory,
  sanitizeTaskText,
} from './todoLogic';

export interface QuickAddValidationResult {
  valid: boolean;
  sanitizedText: string;
  error?: string;
}

export interface SimplePageHeading {
  shortTitle: string;
  subtitle: string;
}

export const SIMPLE_PAGE_HEADINGS: Record<PagePath, SimplePageHeading> = {
  '/': {
    shortTitle: 'Today',
    subtitle: 'Your focus list and daily schedule',
  },
  '/daily-columns': {
    shortTitle: 'Week',
    subtitle: 'Plan each day from Monday to Sunday',
  },
  '/live-progress': {
    shortTitle: 'Progress',
    subtitle: 'See how your week is going at a glance',
  },
  '/monthly-yearly': {
    shortTitle: 'Goals',
    subtitle: 'Calendar, monthly goals, and yearly plans',
  },
  '/spreadsheet': {
    shortTitle: 'Sheet',
    subtitle: 'Simple table view with CSV download',
  },
  '/color-themes': {
    shortTitle: 'Themes',
    subtitle: 'Pick colors and backgrounds that feel calm',
  },
  '/one-click': {
    shortTitle: 'Quick Actions',
    subtitle: 'Tap to check off, prioritize, or tag tasks',
  },
  '/how-it-works': {
    shortTitle: 'How It Works',
    subtitle: 'Saves automatically right on your device',
  },
  '/built-to-reuse': {
    shortTitle: 'Reuse Weekly',
    subtitle: 'Start fresh any week with one tap',
  },
  '/everything-you-get': {
    shortTitle: 'Downloads',
    subtitle: 'Export your planner for offline use',
  },
};

/**
 * Resolves the friendliest default day ID for Quick Add (prefers Today, falls back to first column or 'mon').
 */
export function resolveDefaultQuickAddDayId(columns: DayColumn[]): string {
  const todayCol = columns.find((col) => col.isToday);
  if (todayCol) return todayCol.id;
  return columns[0]?.id ?? 'mon';
}

/**
 * Validates and sanitizes task text submitted via the Quick Add sheet.
 */
export function validateQuickAddTaskInput(
  rawText: string
): QuickAddValidationResult {
  const sanitizedText = sanitizeTaskText(rawText, 120).trim();
  if (!sanitizedText) {
    return {
      valid: false,
      sanitizedText: '',
      error: 'Please type a short task name first.',
    };
  }
  return {
    valid: true,
    sanitizedText,
  };
}

/**
 * Returns a concise everyday-language page label for the mobile & desktop header.
 */
export function getSimplePageTitle(
  path: PagePath,
  isNotFound = false
): string {
  if (isNotFound) return 'Not Found';
  return SIMPLE_PAGE_HEADINGS[path]?.shortTitle ?? 'Today';
}

export interface QuickAddSubmitPayload {
  dayId: string;
  text: string;
  category: TaskCategory;
  recurring: RecurringInterval;
}
