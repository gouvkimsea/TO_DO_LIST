/**
 * Pure domain logic for Habit Streak tracking over 7-day intervals.
 *
 * Recurring daily/weekly/monthly tasks can be marked as tracked "habits".
 * Each habit stores a 7-day completion window (Mon..Sun, indices 0..6) and
 * computes active streak length, 7-day interval completion progress, and
 * visual heat tier for the fire icon & streak counter badge.
 */

export const HABIT_INTERVAL_LENGTH = 7;

export const HABIT_DAY_IDS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export const HABIT_DAY_SHORT_LABELS = [
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
  'S',
] as const;

export const HABIT_DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type HabitHeatTier = 'cold' | 'warm' | 'hot' | 'blazing';

export interface HabitStreakSummary {
  currentStreak: number;
  longestRunInInterval: number;
  bestStreak: number;
  completedInInterval: number;
  intervalLength: number;
  intervalProgressPct: number;
  isIntervalComplete: boolean;
  heatTier: HabitHeatTier;
  history: boolean[];
  anchorDayIndex: number;
}

/**
 * Resolves a day column ID ('mon'..'sun') into a 0..6 index.
 * Defaults to 3 (Thursday, the default active day in the weekly planner) if unknown.
 */
export function resolveHabitDayIndex(dayId?: string): number {
  if (!dayId) return 3;
  const normalized = dayId.trim().toLowerCase().slice(0, 3);
  const idx = (HABIT_DAY_IDS as readonly string[]).indexOf(normalized);
  return idx >= 0 ? idx : 3;
}

/**
 * Normalizes any persisted or partial habit history into a strict 7-boolean array.
 * If no valid history exists yet, seeds the anchor day slot with `completed`.
 */
export function normalizeHabitHistory(
  rawHistory?: unknown,
  dayId?: string,
  completed?: boolean
): boolean[] {
  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    const normalized: boolean[] = [];
    for (let i = 0; i < HABIT_INTERVAL_LENGTH; i++) {
      normalized.push(Boolean(rawHistory[i]));
    }
    return normalized;
  }

  const fresh = Array<boolean>(HABIT_INTERVAL_LENGTH).fill(false);
  if (completed) {
    const anchorIdx = resolveHabitDayIndex(dayId);
    fresh[anchorIdx] = true;
  }
  return fresh;
}

/**
 * Computes streak counter and 7-day interval metrics from a 7-day completion array.
 *
 * Rules:
 * - Active streak counts consecutive completed days ending at the latest active
 *   point in the 7-day window:
 *   - If the anchor day (or any later day in the 7-day interval) is completed,
 *     count backwards from the furthest completed day up to the start of the run.
 *   - If the anchor day is not yet completed, check the immediately preceding day
 *     (`anchorDayIndex - 1`): if completed, preserve that active streak so users
 *     see their live streak ready to extend today; otherwise the streak is broken (0).
 */
export function calculateHabitStreakSummary(
  rawHistory?: unknown,
  dayId?: string,
  completed?: boolean,
  persistedBestStreak?: number
): HabitStreakSummary {
  const anchorDayIndex = resolveHabitDayIndex(dayId);
  const history = normalizeHabitHistory(rawHistory, dayId, completed);

  const completedInInterval = history.filter(Boolean).length;
  const intervalProgressPct = Math.round(
    (completedInInterval / HABIT_INTERVAL_LENGTH) * 100
  );

  // Longest contiguous run within the 7-day interval
  let longestRunInInterval = 0;
  let running = 0;
  for (let i = 0; i < HABIT_INTERVAL_LENGTH; i++) {
    if (history[i]) {
      running++;
      if (running > longestRunInInterval) {
        longestRunInInterval = running;
      }
    } else {
      running = 0;
    }
  }

  // Determine the furthest completed index at or after anchorDayIndex
  let furthestCompletedAtOrAfterAnchor = -1;
  for (let i = HABIT_INTERVAL_LENGTH - 1; i >= anchorDayIndex; i--) {
    if (history[i]) {
      furthestCompletedAtOrAfterAnchor = i;
      break;
    }
  }

  let currentStreak = 0;
  if (furthestCompletedAtOrAfterAnchor !== -1) {
    // Count consecutive completed days backwards from the furthest completed slot
    let cursor = furthestCompletedAtOrAfterAnchor;
    while (cursor >= 0 && history[cursor]) {
      currentStreak++;
      cursor--;
    }
  } else if (anchorDayIndex > 0 && history[anchorDayIndex - 1]) {
    // Anchor day not yet checked off today, but yesterday was completed -> active streak
    let cursor = anchorDayIndex - 1;
    while (cursor >= 0 && history[cursor]) {
      currentStreak++;
      cursor--;
    }
  }

  const safePersistedBest =
    typeof persistedBestStreak === 'number' &&
    Number.isFinite(persistedBestStreak) &&
    persistedBestStreak >= 0
      ? Math.floor(persistedBestStreak)
      : 0;

  const bestStreak = Math.max(
    safePersistedBest,
    longestRunInInterval,
    currentStreak
  );

  let heatTier: HabitHeatTier = 'cold';
  if (currentStreak >= 6) {
    heatTier = 'blazing';
  } else if (currentStreak >= 3) {
    heatTier = 'hot';
  } else if (currentStreak >= 1) {
    heatTier = 'warm';
  }

  return {
    currentStreak,
    longestRunInInterval,
    bestStreak,
    completedInInterval,
    intervalLength: HABIT_INTERVAL_LENGTH,
    intervalProgressPct,
    isIntervalComplete: completedInInterval === HABIT_INTERVAL_LENGTH,
    heatTier,
    history,
    anchorDayIndex,
  };
}

/**
 * Updates a 7-day habit history when a task's completion checkbox is toggled.
 */
export function updateHabitHistoryForDay(
  rawHistory: unknown,
  dayIndex: number,
  nextCompleted: boolean
): boolean[] {
  const safeIndex = Math.max(
    0,
    Math.min(HABIT_INTERVAL_LENGTH - 1, Math.floor(dayIndex))
  );
  const next = normalizeHabitHistory(rawHistory);
  next[safeIndex] = nextCompleted;
  return next;
}

/**
 * Checks whether a task has an active recurring cadence eligible for Habit tracking.
 */
export function isRecurringEligibleForHabit(recurring?: string): boolean {
  return recurring === 'daily' || recurring === 'weekly' || recurring === 'monthly';
}
