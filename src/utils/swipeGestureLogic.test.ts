import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SWIPE_COMPLETE_THRESHOLD_PX,
  SWIPE_DELETE_THRESHOLD_PX,
  SWIPE_MAX_OFFSET_PX,
  createInitialSwipeState,
  startSwipeGesture,
  updateSwipeGesture,
  updateSwipeGestureFromDelta,
  getSwipeVisualFeedbackMeta,
  resolveSwipeReleaseAction,
  clampSwipeOffset,
  isValidDueDateIso,
  getWeekDateBounds,
  resolveDefaultDueDateForDayColumn,
  resolveCurrentWeekDueDateBadge,
} from './swipeGestureLogic';
import {
  createInitialWeekColumns,
  createInitialDetailedTasks,
  addQuickTaskToDayColumn,
  deleteDailyTask,
  parsePersistedDashboardState,
} from './todoLogic';

describe('swipeGestureLogic - Swipe-to-Complete & Swipe-to-Delete', () => {
  it('triggers complete action when swiping right at or past threshold', () => {
    let state = startSwipeGesture(100, 200);
    state = updateSwipeGesture(state, 120, 202);
    assert.equal(state.axisLock, 'horizontal');
    assert.equal(state.intent, 'complete');
    assert.equal(state.isPastThreshold, false);
    assert.equal(resolveSwipeReleaseAction(state), null);

    state = updateSwipeGesture(state, 100 + SWIPE_COMPLETE_THRESHOLD_PX, 203);
    assert.equal(state.isPastThreshold, true);
    assert.equal(state.progress, 1);
    assert.equal(resolveSwipeReleaseAction(state), 'complete');
  });

  it('triggers delete action when swiping left at or past threshold', () => {
    let state = startSwipeGesture(220, 150);
    state = updateSwipeGesture(state, 195, 151);
    assert.equal(state.axisLock, 'horizontal');
    assert.equal(state.intent, 'delete');
    assert.equal(state.isPastThreshold, false);
    assert.equal(resolveSwipeReleaseAction(state), null);

    state = updateSwipeGesture(state, 220 + SWIPE_DELETE_THRESHOLD_PX, 148);
    assert.equal(state.isPastThreshold, true);
    assert.equal(state.progress, 1);
    assert.equal(resolveSwipeReleaseAction(state), 'delete');
  });

  it('locks to vertical axis when vertical movement dominates, preventing accidental swipes during scroll', () => {
    let state = startSwipeGesture(150, 300);
    state = updateSwipeGesture(state, 154, 325);
    assert.equal(state.axisLock, 'vertical');
    assert.equal(state.offsetX, 0);
    assert.equal(state.intent, 'none');

    // Even if user moves horizontally later in the same touch, vertical lock holds
    state = updateSwipeGesture(state, 250, 360);
    assert.equal(state.axisLock, 'vertical');
    assert.equal(state.offsetX, 0);
    assert.equal(resolveSwipeReleaseAction(state), null);
  });

  it('clamps extreme horizontal offsets with rubber-band damping', () => {
    assert.equal(clampSwipeOffset(0), 0);
    assert.equal(clampSwipeOffset(40), 40);
    assert.equal(clampSwipeOffset(-40), -40);
    assert.ok(clampSwipeOffset(300) <= SWIPE_MAX_OFFSET_PX);
    assert.ok(clampSwipeOffset(-300) >= -SWIPE_MAX_OFFSET_PX);
    assert.equal(resolveSwipeReleaseAction(createInitialSwipeState()), null);
  });

  it('computes @dnd-kit delta swipe state and pre-finalization visual feedback metadata', () => {
    const partialRight = updateSwipeGestureFromDelta(32, 2);
    const metaRightPartial = getSwipeVisualFeedbackMeta(partialRight, false);
    assert.equal(metaRightPartial.visible, true);
    assert.equal(metaRightPartial.direction, 'right');
    assert.equal(metaRightPartial.isArmed, false);
    assert.equal(metaRightPartial.actionLabel, 'Swipe to Complete');
    assert.equal(metaRightPartial.statusPillText, '50%');

    const armedRight = updateSwipeGestureFromDelta(SWIPE_COMPLETE_THRESHOLD_PX + 10, 1, 'horizontal');
    const metaRightArmed = getSwipeVisualFeedbackMeta(armedRight, false);
    assert.equal(metaRightArmed.isArmed, true);
    assert.equal(metaRightArmed.actionLabel, 'Release to Complete');
    assert.equal(metaRightArmed.statusPillText, 'Ready');

    const armedUndo = getSwipeVisualFeedbackMeta(armedRight, true);
    assert.equal(armedUndo.actionLabel, 'Release to Undo');

    const armedLeft = updateSwipeGestureFromDelta(SWIPE_DELETE_THRESHOLD_PX - 8, -2, 'horizontal');
    const metaLeftArmed = getSwipeVisualFeedbackMeta(armedLeft, false);
    assert.equal(metaLeftArmed.direction, 'left');
    assert.equal(metaLeftArmed.isArmed, true);
    assert.equal(metaLeftArmed.actionLabel, 'Release to Delete');
    assert.equal(metaLeftArmed.statusPillText, 'Ready');
  });
});

describe('swipeGestureLogic - Due-Date & Current-Week Badge Resolution', () => {
  it('computes Monday-to-Sunday week bounds accurately for any reference date', () => {
    const bounds = getWeekDateBounds('2026-06-11'); // Thursday Jun 11, 2026
    assert.equal(bounds.startIso, '2026-06-08');
    assert.equal(bounds.endIso, '2026-06-14');
    assert.equal(bounds.dayIsoByDayId.mon, '2026-06-08');
    assert.equal(bounds.dayIsoByDayId.thu, '2026-06-11');
    assert.equal(bounds.dayIsoByDayId.fri, '2026-06-12');
    assert.equal(bounds.dayIsoByDayId.sun, '2026-06-14');
    assert.equal(
      resolveDefaultDueDateForDayColumn('fri', '2026-06-11'),
      '2026-06-12'
    );
  });

  it('marks due dates within the current week as isInCurrentWeek = true and formats badge', () => {
    const friBadge = resolveCurrentWeekDueDateBadge('2026-06-12', '2026-06-11');
    assert.ok(friBadge);
    assert.equal(friBadge.isInCurrentWeek, true);
    assert.equal(friBadge.shortLabel, 'Due Jun 12');
    assert.equal(friBadge.dateOnlyLabel, 'Jun 12');
    assert.equal(friBadge.weekdayShort, 'Fri');
    assert.equal(friBadge.dayId, 'fri');

    // Boundary checks: Monday & Sunday of current week
    const monBadge = resolveCurrentWeekDueDateBadge('2026-06-08', '2026-06-11');
    assert.equal(monBadge?.isInCurrentWeek, true);
    assert.equal(monBadge?.shortLabel, 'Due Jun 8');

    const sunBadge = resolveCurrentWeekDueDateBadge('2026-06-14', '2026-06-11');
    assert.equal(sunBadge?.isInCurrentWeek, true);
    assert.equal(sunBadge?.shortLabel, 'Due Jun 14');
  });

  it('marks due dates outside the current week as isInCurrentWeek = false', () => {
    const prevSun = resolveCurrentWeekDueDateBadge('2026-06-07', '2026-06-11');
    assert.equal(prevSun?.isInCurrentWeek, false);

    const nextMon = resolveCurrentWeekDueDateBadge('2026-06-15', '2026-06-11');
    assert.equal(nextMon?.isInCurrentWeek, false);

    const nextMonth = resolveCurrentWeekDueDateBadge('2026-07-20', '2026-06-11');
    assert.equal(nextMonth?.isInCurrentWeek, false);
    assert.equal(nextMonth?.shortLabel, 'Due Jul 20');
  });

  it('returns null for missing or invalid due dates', () => {
    assert.equal(isValidDueDateIso(''), false);
    assert.equal(isValidDueDateIso('2026-02-30'), false);
    assert.equal(resolveCurrentWeekDueDateBadge(undefined, '2026-06-11'), null);
    assert.equal(resolveCurrentWeekDueDateBadge('', '2026-06-11'), null);
    assert.equal(resolveCurrentWeekDueDateBadge('not-a-date', '2026-06-11'), null);
  });
});

describe('todoLogic integration - addQuickTaskToDayColumn dueDate & deleteDailyTask', () => {
  it('stores dueDate on added daily task and persists across parsePersistedDashboardState', () => {
    const initialCols = createInitialWeekColumns();
    const initialDetailed = createInitialDetailedTasks();

    const { nextColumns, addedTask } = addQuickTaskToDayColumn(
      initialCols,
      initialDetailed,
      'mon',
      'Submit sprint demo',
      {
        category: 'Work',
        recurring: 'none',
        dueDate: '2026-06-12',
      }
    );

    assert.ok(addedTask);
    assert.equal(addedTask.text, 'Submit sprint demo');
    assert.equal(addedTask.dueDate, '2026-06-12');

    // Verify persistence round-trip
    const serialized = JSON.stringify({
      columns: nextColumns,
      detailedTasks: initialDetailed,
    });
    const hydrated = parsePersistedDashboardState(serialized);
    const hydratedTask = hydrated.columns
      .find((c) => c.id === 'mon')
      ?.tasks.find((t) => t.id === addedTask.id);
    assert.ok(hydratedTask);
    assert.equal(hydratedTask.dueDate, '2026-06-12');
  });

  it('deletes or clears a daily task via deleteDailyTask', () => {
    const initialCols = createInitialWeekColumns();
    const initialDetailed = createInitialDetailedTasks();

    const { nextColumns, deletedTask } = deleteDailyTask(
      initialCols,
      initialDetailed,
      'mon',
      'mon-1'
    );
    assert.ok(deletedTask);
    assert.equal(deletedTask.id, 'mon-1');

    const monCol = nextColumns.find((c) => c.id === 'mon');
    assert.ok(monCol);
    const clearedSlot = monCol.tasks.find((t) => t.id === 'mon-1');
    assert.equal(clearedSlot?.text, '');
    assert.equal(clearedSlot?.completed, false);
  });
});
