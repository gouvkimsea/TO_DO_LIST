import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HABIT_INTERVAL_LENGTH,
  calculateHabitStreakSummary,
  isRecurringEligibleForHabit,
  normalizeHabitHistory,
  resolveHabitDayIndex,
  updateHabitHistoryForDay,
} from './habitStreakLogic';

test('resolveHabitDayIndex maps mon..sun cleanly and defaults to thu (3)', () => {
  assert.equal(resolveHabitDayIndex('mon'), 0);
  assert.equal(resolveHabitDayIndex('thu'), 3);
  assert.equal(resolveHabitDayIndex('sun'), 6);
  assert.equal(resolveHabitDayIndex('Friday'), 4);
  assert.equal(resolveHabitDayIndex(undefined), 3);
  assert.equal(resolveHabitDayIndex('unknown'), 3);
});

test('normalizeHabitHistory always produces a 7-day boolean array', () => {
  const emptyUnchecked = normalizeHabitHistory(undefined, 'thu', false);
  assert.equal(emptyUnchecked.length, HABIT_INTERVAL_LENGTH);
  assert.deepEqual(emptyUnchecked, [false, false, false, false, false, false, false]);

  const emptyChecked = normalizeHabitHistory(undefined, 'thu', true);
  assert.deepEqual(emptyChecked, [false, false, false, true, false, false, false]);

  const partial = normalizeHabitHistory([true, true], 'mon', false);
  assert.deepEqual(partial, [true, true, false, false, false, false, false]);
});

test('calculateHabitStreakSummary tracks active streak before and after completing today', () => {
  // Mon-Wed completed, Thu not yet completed -> active streak is 3 (warm/hot), ready to extend
  const beforeThu = calculateHabitStreakSummary(
    [true, true, true, false, false, false, false],
    'thu',
    false
  );
  assert.equal(beforeThu.currentStreak, 3);
  assert.equal(beforeThu.completedInInterval, 3);
  assert.equal(beforeThu.heatTier, 'hot');
  assert.equal(beforeThu.isIntervalComplete, false);

  // Completing Thu extends the streak to 4
  const afterThuHistory = updateHabitHistoryForDay(beforeThu.history, 3, true);
  const afterThu = calculateHabitStreakSummary(afterThuHistory, 'thu', true);
  assert.equal(afterThu.currentStreak, 4);
  assert.equal(afterThu.completedInInterval, 4);
  assert.equal(afterThu.bestStreak, 4);

  // Unchecking Thu reverts cleanly back to 3 while preserving bestStreak if passed
  const revertedHistory = updateHabitHistoryForDay(afterThuHistory, 3, false);
  const reverted = calculateHabitStreakSummary(revertedHistory, 'thu', false, afterThu.bestStreak);
  assert.equal(reverted.currentStreak, 3);
  assert.equal(reverted.bestStreak, 4);
});

test('calculateHabitStreakSummary resets streak to 0 when previous day and today are missed', () => {
  // Mon-Tue done, Wed missed, Thu not done -> streak broken (0), longestRunInInterval = 2
  const broken = calculateHabitStreakSummary(
    [true, true, false, false, false, false, false],
    'thu',
    false
  );
  assert.equal(broken.currentStreak, 0);
  assert.equal(broken.longestRunInInterval, 2);
  assert.equal(broken.completedInInterval, 2);
  assert.equal(broken.heatTier, 'cold');
});

test('calculateHabitStreakSummary detects full 7-day interval completion and blazing heat tier', () => {
  const fullWeek = calculateHabitStreakSummary(
    [true, true, true, true, true, true, true],
    'sun',
    true
  );
  assert.equal(fullWeek.currentStreak, 7);
  assert.equal(fullWeek.completedInInterval, 7);
  assert.equal(fullWeek.intervalProgressPct, 100);
  assert.equal(fullWeek.isIntervalComplete, true);
  assert.equal(fullWeek.heatTier, 'blazing');
});

test('isRecurringEligibleForHabit accepts daily, weekly, and monthly only', () => {
  assert.equal(isRecurringEligibleForHabit('daily'), true);
  assert.equal(isRecurringEligibleForHabit('weekly'), true);
  assert.equal(isRecurringEligibleForHabit('monthly'), true);
  assert.equal(isRecurringEligibleForHabit('none'), false);
  assert.equal(isRecurringEligibleForHabit(undefined), false);
});
