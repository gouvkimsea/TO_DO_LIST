import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialWeekColumns } from './todoLogic';
import {
  resolveDefaultQuickAddDayId,
  validateQuickAddTaskInput,
  getSimplePageTitle,
} from './quickAddLogic';

test('resolveDefaultQuickAddDayId selects today column when present and falls back cleanly', () => {
  const cols = createInitialWeekColumns();
  assert.equal(resolveDefaultQuickAddDayId(cols), 'thu');

  const noTodayCols = cols.map((c) => ({ ...c, isToday: false }));
  assert.equal(resolveDefaultQuickAddDayId(noTodayCols), 'mon');
  assert.equal(resolveDefaultQuickAddDayId([]), 'mon');
});

test('validateQuickAddTaskInput rejects empty input and trims valid task names', () => {
  const emptyResult = validateQuickAddTaskInput('   ');
  assert.equal(emptyResult.valid, false);
  assert.equal(emptyResult.sanitizedText, '');
  assert.ok(emptyResult.error && emptyResult.error.length > 0);

  const validResult = validateQuickAddTaskInput('  Buy fresh fruit  ');
  assert.equal(validResult.valid, true);
  assert.equal(validResult.sanitizedText, 'Buy fresh fruit');
  assert.equal(validResult.error, undefined);
});

test('getSimplePageTitle maps routes to plain everyday labels', () => {
  assert.equal(getSimplePageTitle('/'), 'Today');
  assert.equal(getSimplePageTitle('/daily-columns'), 'Week');
  assert.equal(getSimplePageTitle('/live-progress'), 'Progress');
  assert.equal(getSimplePageTitle('/monthly-yearly'), 'Goals');
  assert.equal(getSimplePageTitle('/spreadsheet'), 'Sheet');
  assert.equal(getSimplePageTitle('/', true), 'Not Found');
});
