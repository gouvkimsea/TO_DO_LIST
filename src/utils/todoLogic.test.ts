import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cyclePriority,
  cycleStatus,
  cycleCategory,
  TASK_CATEGORIES,
  CATEGORY_BADGE_STYLES,
  THEMES,
  isValidCategory,
  toggleTaskCompletion,
  updateTaskStatus,
  calculateDayProgress,
  DailyTask,
  calculateDashboardMetrics,
  createInitialWeekColumns,
  createInitialDetailedTasks,
  createInitialMonthlyGoals,
  createInitialYearlyGoals,
  clearWeekTasks,
  formatWeekRangeFromDate,
  filterDayColumnsByKeyword,
  filterDetailedTasksByKeyword,
  countMatchingTasks,
  formatVoiceTranscript,
  isDayAllDone,
  shouldTriggerDayCompleteConfetti,
  PAGE_ROUTES,
  resolveRoutePath,
  getAdjacentRoutes,
  formatTopBarViewContext,
  reorderOrMoveDailyTask,
  buildWeeklyProgressTrends,
  countWeekTasksByCompletion,
  clearCompletedWeekTasks,
  clearPendingWeekTasks,
  updateDailyTaskNotes,
  isKnownRoutePath,
  sanitizeTaskText,
  sanitizeTaskNotes,
  escapeHtml,
  sanitizeCsvCell,
  generateCsvExport,
  generateStandaloneHtmlExport,
  parsePersistedDashboardState,
  cycleTheme,
  KEYBOARD_SHORTCUTS,
  resolveKeyboardShortcutAction,
  syncDetailedTaskToggle,
  syncDailyTaskToggle,
  syncDetailedTaskStatus,
  syncDetailedTaskPriority,
  syncDetailedTaskCategory,
  syncDetailedTaskText,
  syncDailyTaskPriority,
  syncDailyTaskCategory,
  syncDailyTaskText,
  addQuickTaskToDayColumn,
  parseQuickTaskTag,
  cycleRecurringInterval,
  regenerateRecurringTask,
  syncDailyTaskRecurring,
  updateDailyTaskRecurring,
  isValidRecurring,
  RECURRING_CONFIG,
  RECURRING_INTERVALS,
  DETAILED_DAILY_TASK_LINKS,
  archiveCompletedTasks,
  archiveSingleDailyTask,
  archiveSingleDetailedTask,
  restoreArchivedTask,
  restoreAllArchivedTasks,
  filterArchivedTasks,
  getTaskMatchDetail,
  DASHBOARD_ENTRANCE_CONFIG,
  DASHBOARD_ENTRANCE_CONTAINER_VARIANTS,
  DASHBOARD_ENTRANCE_ITEM_VARIANTS,
  hasDashboardAnimatedOnInitialLoad,
  consumeDashboardInitialLoadEntrance,
  resetDashboardInitialLoadEntranceForTest,
  resolveDashboardEntranceInitialProp,
} from './todoLogic';

test('cyclePriority cycles High -> Med -> Low -> High', () => {
  assert.equal(cyclePriority('High'), 'Med');
  assert.equal(cyclePriority('Med'), 'Low');
  assert.equal(cyclePriority('Low'), 'High');
});

test('cycleStatus cycles To Do -> In Progress -> Done -> To Do', () => {
  assert.equal(cycleStatus('To Do'), 'In Progress');
  assert.equal(cycleStatus('In Progress'), 'Done');
  assert.equal(cycleStatus('Done'), 'To Do');
});

test('cycleCategory cycles through all TASK_CATEGORIES and defines badge styles for each', () => {
  assert.deepEqual(TASK_CATEGORIES, [
    'Work',
    'Personal',
    'Health',
    'Finance',
    'Home',
    'Growth',
  ]);
  assert.equal(cycleCategory('Work'), 'Personal');
  assert.equal(cycleCategory('Personal'), 'Health');
  assert.equal(cycleCategory('Health'), 'Finance');
  assert.equal(cycleCategory('Finance'), 'Home');
  assert.equal(cycleCategory('Home'), 'Growth');
  assert.equal(cycleCategory('Growth'), 'Work');

  for (const cat of TASK_CATEGORIES) {
    assert.equal(isValidCategory(cat), true);
    assert.equal(Boolean(CATEGORY_BADGE_STYLES[cat]?.bg), true);
    assert.equal(Boolean(CATEGORY_BADGE_STYLES[cat]?.text), true);
    assert.equal(Boolean(CATEGORY_BADGE_STYLES[cat]?.border), true);
  }
  assert.equal(isValidCategory('UnknownCategory'), false);
});

test('toggleTaskCompletion syncs status with completed boolean', () => {
  const initial = {
    id: '1',
    text: 'Write Q2 report',
    completed: false,
    priority: 'High' as const,
    status: 'In Progress' as const,
    category: 'Work' as const,
  };
  const checked = toggleTaskCompletion(initial);
  assert.equal(checked.completed, true);
  assert.equal(checked.status, 'Done');
  assert.equal(checked.category, 'Work');

  const unchecked = toggleTaskCompletion(checked);
  assert.equal(unchecked.completed, false);
  assert.equal(unchecked.status, 'To Do');
});

test('updateTaskStatus cycles status and updates completed flag', () => {
  const initial = {
    id: '1',
    text: 'Plan social media posts',
    completed: false,
    priority: 'Low' as const,
    status: 'To Do' as const,
    category: 'Work' as const,
  };
  const inProgress = updateTaskStatus(initial);
  assert.equal(inProgress.status, 'In Progress');
  assert.equal(inProgress.completed, false);

  const done = updateTaskStatus(inProgress);
  assert.equal(done.status, 'Done');
  assert.equal(done.completed, true);
});

test('calculateDayProgress ignores blank slots and computes exact fraction', () => {
  const columns = createInitialWeekColumns();
  const mondayProgress = calculateDayProgress(columns[0].tasks);
  assert.equal(mondayProgress.completed, 4);
  assert.equal(mondayProgress.total, 4);
  assert.equal(mondayProgress.percentage, 100);
  assert.equal(mondayProgress.fractionLabel, '4/4');
});

test('calculateDashboardMetrics matches reference 45% (10 of 22 tasks) and daily breakdown', () => {
  const columns = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();
  const metrics = calculateDashboardMetrics(columns, detailed);
  assert.equal(metrics.totalTasks, 22);
  assert.equal(metrics.completedTasks, 10);
  assert.equal(metrics.completionPercentage, 45);
  assert.equal(metrics.dailyProgress[0].percentage, 100); // Mon
  assert.equal(metrics.dailyProgress[1].percentage, 33);  // Tue
  assert.equal(metrics.dailyProgress[2].percentage, 25);  // Wed
  assert.equal(metrics.dailyProgress[3].percentage, 33);  // Thu
  assert.equal(metrics.dailyProgress[4].percentage, 33);  // Fri
  assert.equal(metrics.dailyProgress[5].percentage, 50);  // Sat
  assert.equal(metrics.dailyProgress[6].percentage, 33);  // Sun
  assert.equal(metrics.byPriority.High, 8);
  assert.equal(metrics.byPriority.Med, 10);
  assert.equal(metrics.byPriority.Low, 14);
  assert.equal(metrics.byStatus['To Do'], 12);
  assert.equal(metrics.byStatus['In Progress'], 5);
  assert.equal(metrics.byStatus.Done, 15);
});

test('clearWeekTasks resets all tasks to empty while preserving 7 columns', () => {
  const columns = createInitialWeekColumns();
  const cleared = clearWeekTasks(columns);
  assert.equal(cleared.length, 7);
  const metrics = calculateDashboardMetrics(cleared, []);
  assert.equal(metrics.totalTasks, 0);
  assert.equal(metrics.completedTasks, 0);
  assert.equal(metrics.completionPercentage, 0);
});

test('formatWeekRangeFromDate computes Monday-Sunday range for 2026-06-11', () => {
  const { rangeLabel, dayDates } = formatWeekRangeFromDate('2026-06-11');
  assert.equal(rangeLabel, 'Week of Jun 8 – Jun 14');
  assert.equal(dayDates[0], 'Jun 8');
  assert.equal(dayDates[3], 'Jun 11');
  assert.equal(dayDates[6], 'Jun 14');
});

test('filterDayColumnsByKeyword filters daily tasks in real-time by keyword or category', () => {
  const columns = createInitialWeekColumns();
  const filtered = filterDayColumnsByKeyword(columns, 'report');
  assert.equal(filtered[0].tasks.length, 0); // Monday has no "report"
  assert.equal(filtered[1].tasks.length, 1); // Tuesday: "Write Q2 report"
  assert.equal(filtered[1].tasks[0].text, 'Write Q2 report');
  assert.equal(filtered[3].tasks.length, 1); // Thursday: "Submit expense report"
  assert.equal(filtered[3].tasks[0].text, 'Submit expense report');

  // Filtering by category name ("Finance") matches Thursday's expense report task
  const byCategory = filterDayColumnsByKeyword(columns, 'finance');
  assert.equal(byCategory[3].tasks.length, 1);
  assert.equal(byCategory[3].tasks[0].id, 'thu-2');
  assert.equal(byCategory[3].tasks[0].category, 'Finance');
});

test('filterDetailedTasksByKeyword filters monthly and yearly tasks by keyword', () => {
  const monthly = createInitialMonthlyGoals();
  const yearly = createInitialYearlyGoals();

  const filteredMonthly = filterDetailedTasksByKeyword(monthly, 'budget');
  assert.equal(filteredMonthly.length, 1);
  assert.equal(filteredMonthly[0].text, 'Quarterly budget review');

  const filteredYearly = filterDetailedTasksByKeyword(yearly, 'marathon');
  assert.equal(filteredYearly.length, 1);
  assert.equal(filteredYearly[0].text, 'Run a half marathon');
});

test('countMatchingTasks returns accurate match counts across weekly, monthly, and yearly views', () => {
  const columns = createInitialWeekColumns();
  const monthly = createInitialMonthlyGoals();
  const yearly = createInitialYearlyGoals();

  const counts = countMatchingTasks(columns, monthly, yearly, 'book');
  // Weekly has "Read new design book" (1), Monthly has "Read 2 books this month" (1), Yearly has "Read 24 books" (1)
  assert.equal(counts.weeklyMatches, 1);
  assert.equal(counts.monthlyMatches, 1);
  assert.equal(counts.yearlyMatches, 1);
  assert.equal(counts.totalMatches, 3);
});

test('formatVoiceTranscript capitalizes dictated task for empty slot and appends for existing text', () => {
  assert.equal(
    formatVoiceTranscript('', 'book flight to Tokyo.'),
    'Book flight to Tokyo'
  );
  assert.equal(
    formatVoiceTranscript('Write Q2 report', 'by Friday.'),
    'Write Q2 report by Friday'
  );
});

test('shouldTriggerDayCompleteConfetti triggers only when day transitions from incomplete to all Done', () => {
  const columns = createInitialWeekColumns();
  // Saturday has 2 active tasks: sat-1 (completed: true), sat-2 (completed: false)
  const satBefore = columns[5].tasks;
  assert.equal(isDayAllDone(satBefore), false);

  const satAfter = satBefore.map((t) =>
    t.id === 'sat-2' ? toggleTaskCompletion(t) : t
  );
  assert.equal(isDayAllDone(satAfter), true);
  assert.equal(shouldTriggerDayCompleteConfetti(satBefore, satAfter), true);

  // Toggling when already all done or unchecking does not trigger confetti
  assert.equal(shouldTriggerDayCompleteConfetti(satAfter, satAfter), false);
  assert.equal(shouldTriggerDayCompleteConfetti(satAfter, satBefore), false);

  // Empty day column does not count as all done
  const emptyDay = clearWeekTasks(columns)[0].tasks;
  assert.equal(isDayAllDone(emptyDay), false);
});

test('resolveRoutePath and getAdjacentRoutes map all 10 section pages accurately', () => {
  assert.equal(PAGE_ROUTES.length, 10);
  assert.equal(resolveRoutePath('/'), '/');
  assert.equal(resolveRoutePath('/dashboard'), '/');
  assert.equal(resolveRoutePath('/how-it-works/'), '/how-it-works');
  assert.equal(resolveRoutePath('/daily-columns'), '/daily-columns');
  assert.equal(resolveRoutePath('/one-click'), '/one-click');
  assert.equal(resolveRoutePath('/live-progress'), '/live-progress');
  assert.equal(resolveRoutePath('/color-themes'), '/color-themes');
  assert.equal(resolveRoutePath('/monthly-yearly'), '/monthly-yearly');
  assert.equal(resolveRoutePath('/built-to-reuse'), '/built-to-reuse');
  assert.equal(resolveRoutePath('/spreadsheet'), '/spreadsheet');
  assert.equal(resolveRoutePath('/everything-you-get'), '/everything-you-get');
  assert.equal(resolveRoutePath('/non-existent-route'), '/');

  const firstAdj = getAdjacentRoutes('/');
  assert.equal(firstAdj.prev, null);
  assert.equal(firstAdj.next?.path, '/how-it-works');

  const lastAdj = getAdjacentRoutes('/everything-you-get');
  assert.equal(lastAdj.prev?.path, '/spreadsheet');
  assert.equal(lastAdj.next, null);
});

test('reorderOrMoveDailyTask reorders tasks within the same day and moves tasks across different days', () => {
  const columns = createInitialWeekColumns();

  // 1. Reorder within Thursday: move thu-1 ("Prepare presentation") to thu-3 ("Exercise - walk dog")
  const reorderedSameDay = reorderOrMoveDailyTask(columns, 'thu-1', 'thu-3');
  assert.equal(reorderedSameDay[3].tasks[0].id, 'thu-2');
  assert.equal(reorderedSameDay[3].tasks[1].id, 'thu-3');
  assert.equal(reorderedSameDay[3].tasks[2].id, 'thu-1');

  // 2. Move across days: move thu-1 ("Prepare presentation") to Friday before fri-1 ("Clean bathroom")
  const movedCrossDay = reorderOrMoveDailyTask(columns, 'thu-1', 'fri-1');
  const thursdayTasks = movedCrossDay[3].tasks;
  const fridayTasks = movedCrossDay[4].tasks;

  assert.equal(thursdayTasks.some((t) => t.id === 'thu-1'), false);
  assert.equal(thursdayTasks.length, 6);
  assert.equal(fridayTasks[0].id, 'thu-1');
  assert.equal(fridayTasks[0].text, 'Prepare presentation');
  assert.equal(fridayTasks[1].id, 'fri-1');
  assert.equal(fridayTasks.length, 6);
});

test('buildWeeklyProgressTrends returns 4 weeks of completed vs pending ratios with live current week stats', () => {
  const columns = createInitialWeekColumns();
  const trends = buildWeeklyProgressTrends(columns, '2026-06-11');
  assert.equal(trends.length, 4);
  assert.equal(trends[0].weekLabel, '3 Wks Ago');
  assert.equal(trends[0].dateRange, 'May 18 – May 24');
  assert.equal(trends[3].weekLabel, 'This Week');
  assert.equal(trends[3].dateRange, 'Jun 8 – Jun 14');
  assert.equal(trends[3].completed, 10);
  assert.equal(trends[3].pending, 12);
  assert.equal(trends[3].total, 22);
  assert.equal(trends[3].completionRate, 45);
  assert.equal(trends[3].isCurrentWeek, true);
});

test('clearCompletedWeekTasks removes all completed tasks and compacts pending tasks', () => {
  const columns = createInitialWeekColumns();
  const initialCounts = countWeekTasksByCompletion(columns);
  assert.equal(initialCounts.completedCount, 10);
  assert.equal(initialCounts.pendingCount, 12);

  const afterClearCompleted = clearCompletedWeekTasks(columns);
  const nextCounts = countWeekTasksByCompletion(afterClearCompleted);
  assert.equal(nextCounts.completedCount, 0);
  assert.equal(nextCounts.pendingCount, 12);
  assert.equal(nextCounts.totalCount, 12);

  // Tuesday had 1 completed ("Grocery shopping") + 2 pending ("Write Q2 report", "Review pull requests")
  assert.equal(afterClearCompleted[1].tasks[0].text, 'Write Q2 report');
  assert.equal(afterClearCompleted[1].tasks[1].text, 'Review pull requests');
  assert.equal(afterClearCompleted[1].tasks[2].text, '');
  assert.equal(afterClearCompleted[1].tasks.length, 6);

  // Every task ID across all 7 columns must remain strictly unique
  const allIds = afterClearCompleted.flatMap((c) => c.tasks.map((t) => t.id));
  assert.equal(new Set(allIds).size, 42);
});

test('clearPendingWeekTasks removes all pending tasks and compacts completed tasks', () => {
  const columns = createInitialWeekColumns();
  const afterClearPending = clearPendingWeekTasks(columns);
  const nextCounts = countWeekTasksByCompletion(afterClearPending);

  assert.equal(nextCounts.pendingCount, 0);
  assert.equal(nextCounts.completedCount, 10);
  assert.equal(nextCounts.totalCount, 10);

  // Monday originally had 4 completed tasks
  assert.equal(afterClearPending[0].tasks[0].text, 'Check emails');
  assert.equal(afterClearPending[0].tasks[0].completed, true);
  assert.equal(afterClearPending[0].tasks[1].text, 'Team standup');
  assert.equal(afterClearPending[0].tasks[1].completed, true);
  assert.equal(afterClearPending[0].tasks[2].text, 'Client follow-up');
  assert.equal(afterClearPending[0].tasks[2].completed, true);
  assert.equal(afterClearPending[0].tasks[3].text, 'Review inbox');
  assert.equal(afterClearPending[0].tasks[3].completed, true);
  assert.equal(afterClearPending[0].tasks.length, 6);

  const allIds = afterClearPending.flatMap((c) => c.tasks.map((t) => t.id));
  assert.equal(new Set(allIds).size, 42);
});

test('updateDailyTaskNotes updates task notes and preserves notes across search and bulk clear', () => {
  const columns = createInitialWeekColumns();
  assert.equal(
    columns[3].tasks[0].notes,
    'Include Q2 metrics slide and product roadmap timeline'
  );

  const updated = updateDailyTaskNotes(
    columns,
    'thu',
    'thu-3',
    'Take the scenic park trail for 45 mins'
  );
  assert.equal(
    updated[3].tasks[2].notes,
    'Take the scenic park trail for 45 mins'
  );

  // Searching by note content matches the task
  const matchedByNote = filterDayColumnsByKeyword(updated, 'scenic park');
  assert.equal(matchedByNote[3].tasks.length, 1);
  assert.equal(matchedByNote[3].tasks[0].id, 'thu-3');

  // Clearing completed tasks preserves notes on pending tasks
  const afterClearCompleted = clearCompletedWeekTasks(updated);
  assert.equal(
    afterClearCompleted[3].tasks[0].notes,
    'Include Q2 metrics slide and product roadmap timeline'
  );
  assert.equal(
    afterClearCompleted[3].tasks[1].notes,
    'Take the scenic park trail for 45 mins'
  );
  assert.equal(afterClearCompleted[3].tasks[2].notes, '');
});

test('isKnownRoutePath and PAGE_ROUTES validate known routes vs 404 and include unique SEO descriptions', () => {
  assert.equal(isKnownRoutePath('/'), true);
  assert.equal(isKnownRoutePath('/how-it-works'), true);
  assert.equal(isKnownRoutePath('/daily-columns'), true);
  assert.equal(isKnownRoutePath('/everything-you-get/'), true);
  assert.equal(isKnownRoutePath('/unknown-404-route'), false);
  assert.equal(isKnownRoutePath('/settings/profile'), false);

  const descriptions = PAGE_ROUTES.map((r) => r.description.trim());
  assert.equal(descriptions.every((d) => d.length >= 40), true);
  assert.equal(new Set(descriptions).size, PAGE_ROUTES.length);
});

test('sanitizeTaskText, sanitizeTaskNotes, and escapeHtml strip control chars and prevent XSS', () => {
  assert.equal(
    sanitizeTaskText('Hello\u0000World\u0007', 20),
    'HelloWorld'
  );
  assert.equal(sanitizeTaskText('a'.repeat(300), 240).length, 240);
  assert.equal(sanitizeTaskNotes('b'.repeat(1200), 1000).length, 1000);

  const xssPayload = '<script>alert("xss")</script>&\'';
  const escaped = escapeHtml(xssPayload);
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&#39;'
  );

  const columns = createInitialWeekColumns();
  columns[0].tasks[0].text = '<img src=x onerror="alert(1)">';
  columns[0].tasks[0].notes = '<script>evil()</script>';
  const html = generateStandaloneHtmlExport(
    columns,
    'terracotta',
    'Week of Jun 8 – Jun 14'
  );
  assert.equal(html.includes('<script>evil()</script>'), false);
  assert.equal(html.includes('<img src=x onerror="alert(1)">'), false);
  assert.equal(
    html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'),
    true
  );
});

test('sanitizeCsvCell and generateCsvExport guard against CSV formula injection and escape quotes', () => {
  assert.equal(sanitizeCsvCell('=SUM(A1:A5)'), `"'=SUM(A1:A5)"`);
  assert.equal(sanitizeCsvCell('+cmd|\' /C calc\'!A0'), `"'+cmd|' /C calc'!A0"`);
  assert.equal(sanitizeCsvCell('Review "Q2" deck'), `"Review ""Q2"" deck"`);

  const columns = createInitialWeekColumns();
  const csv = generateCsvExport(columns);
  assert.equal(csv.includes('"Monday (Jun 8)"'), true);
  assert.equal(csv.includes('[DONE] Check emails (High)'), true);
});

test('parsePersistedDashboardState recovers gracefully from corrupted localStorage and preserves valid state including category', () => {
  const recoveredNull = parsePersistedDashboardState(null);
  assert.equal(recoveredNull.columns.length, 7);
  assert.equal(recoveredNull.activeTheme, 'terracotta');

  const recoveredCorrupt = parsePersistedDashboardState('{broken json');
  assert.equal(recoveredCorrupt.columns.length, 7);
  assert.equal(recoveredCorrupt.activeTheme, 'terracotta');

  const recoveredInvalidShape = parsePersistedDashboardState(
    JSON.stringify({ columns: 'not-an-array', activeTheme: 'invalid-theme' })
  );
  assert.equal(recoveredInvalidShape.columns.length, 7);
  assert.equal(recoveredInvalidShape.activeTheme, 'terracotta');

  const validColumns = createInitialWeekColumns();
  validColumns[0].tasks[0].text = 'Custom persisted task';
  validColumns[0].tasks[0].category = 'Finance';
  const savedValid = parsePersistedDashboardState(
    JSON.stringify({
      columns: validColumns,
      activeTheme: 'lavender',
    })
  );
  assert.equal(savedValid.columns[0].tasks[0].text, 'Custom persisted task');
  assert.equal(savedValid.columns[0].tasks[0].category, 'Finance');
  assert.equal(savedValid.activeTheme, 'lavender');
});

test('cycleTheme cycles through all 4 dashboard color themes in order', () => {
  assert.equal(cycleTheme('terracotta'), 'candy');
  assert.equal(cycleTheme('candy'), 'lavender');
  assert.equal(cycleTheme('lavender'), 'neutral');
  assert.equal(cycleTheme('neutral'), 'terracotta');
});

test('resolveKeyboardShortcutAction resolves global, modal, and editable-target shortcuts accurately', () => {
  assert.equal(KEYBOARD_SHORTCUTS.length >= 10, true);

  // Ctrl+Enter and Cmd+Enter trigger SAVE_DASHBOARD even inside editable inputs
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'Enter',
      ctrlKey: true,
      isEditableTarget: true,
    }),
    'SAVE_DASHBOARD'
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'Enter',
      metaKey: true,
      isEditableTarget: false,
    }),
    'SAVE_DASHBOARD'
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 's',
      ctrlKey: true,
      isEditableTarget: true,
    }),
    'SAVE_DASHBOARD'
  );

  // Escape always resolves to ESCAPE
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'Escape',
      isEditableTarget: true,
    }),
    'ESCAPE'
  );

  // Single-key shortcuts work when not in editable input, and are ignored when typing in an input
  assert.equal(
    resolveKeyboardShortcutAction({ key: '?', isEditableTarget: false }),
    'OPEN_SHORTCUTS_MODAL'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: '?', isEditableTarget: true }),
    null
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: '/',
      ctrlKey: true,
      isEditableTarget: true,
    }),
    'OPEN_SHORTCUTS_MODAL'
  );

  assert.equal(
    resolveKeyboardShortcutAction({ key: '/', isEditableTarget: false }),
    'FOCUS_SEARCH'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: '/', isEditableTarget: true }),
    null
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'k',
      ctrlKey: true,
      isEditableTarget: true,
    }),
    'FOCUS_SEARCH'
  );

  // View switching 1, 2, 3 and theme cycling 't'
  assert.equal(
    resolveKeyboardShortcutAction({ key: '1', isEditableTarget: false }),
    'VIEW_WEEK'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: '2', isEditableTarget: false }),
    'VIEW_MONTH'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: '3', isEditableTarget: false }),
    'VIEW_YEAR'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: '1', isEditableTarget: true }),
    null
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 't', isEditableTarget: false }),
    'CYCLE_THEME'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 't', isEditableTarget: true }),
    null
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 't',
      altKey: true,
      isEditableTarget: true,
    }),
    'CYCLE_THEME'
  );

  // Sound toggle shortcut (M key) and Dark Mode toggle shortcut (D key)
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'm', isEditableTarget: false }),
    'TOGGLE_SOUND'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'M', isEditableTarget: false }),
    'TOGGLE_SOUND'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'm', isEditableTarget: true }),
    null
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'd', isEditableTarget: false }),
    'TOGGLE_DARK_MODE'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'D', isEditableTarget: false }),
    'TOGGLE_DARK_MODE'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'd', isEditableTarget: true }),
    null
  );

  // Page navigation via Alt+ArrowLeft / Alt+ArrowRight
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'ArrowLeft',
      altKey: true,
      isEditableTarget: false,
    }),
    'NAV_PREV_PAGE'
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'ArrowRight',
      altKey: true,
      isEditableTarget: false,
    }),
    'NAV_NEXT_PAGE'
  );

  // Undo via Ctrl+Z / Cmd+Z when not typing in text inputs
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'z',
      ctrlKey: true,
      isEditableTarget: false,
    }),
    'UNDO'
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'z',
      metaKey: true,
      isEditableTarget: false,
    }),
    'UNDO'
  );
  // Preserves native browser input undo when typing
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'z',
      ctrlKey: true,
      isEditableTarget: true,
    }),
    null
  );

  // Redo via Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      isEditableTarget: false,
    }),
    'REDO'
  );
  assert.equal(
    resolveKeyboardShortcutAction({
      key: 'y',
      ctrlKey: true,
      isEditableTarget: false,
    }),
    'REDO'
  );
});

test('syncDetailedTaskToggle synchronizes task state to daily column and updates metrics in real time', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  const metricsBefore = calculateDashboardMetrics(initialColumns, initialDetailed);
  assert.equal(metricsBefore.completionPercentage, 45);
  assert.equal(metricsBefore.completedTasks, 10);
  assert.equal(metricsBefore.totalTasks, 22);

  // Friday before: 1 of 3 tasks completed -> 33%
  const fridayBefore = metricsBefore.dailyProgress.find((d) => d.dayId === 'fri');
  assert.equal(fridayBefore?.percentage, 33);

  // Toggle dt-5 ("Q3 planning session") in detailedTasks -> linked to fri-3 on Friday
  const { nextDetailedTasks, nextColumns } = syncDetailedTaskToggle(
    initialDetailed,
    initialColumns,
    'dt-5'
  );

  const toggledDetailed = nextDetailedTasks.find((t) => t.id === 'dt-5');
  assert.equal(toggledDetailed?.completed, true);
  assert.equal(toggledDetailed?.status, 'Done');

  const friCol = nextColumns.find((c) => c.id === 'fri');
  const linkedDaily = friCol?.tasks.find((t) => t.id === 'fri-3');
  assert.equal(linkedDaily?.completed, true);
  assert.equal(linkedDaily?.status, 'Done');

  // Metrics should immediately update in real time
  const metricsAfter = calculateDashboardMetrics(nextColumns, nextDetailedTasks);
  // 11 of 22 tasks completed -> exactly 50%
  assert.equal(metricsAfter.completionPercentage, 50);
  assert.equal(metricsAfter.completedTasks, 11);
  assert.equal(metricsAfter.totalTasks, 22);

  // Friday after: 2 of 3 tasks completed -> 67%
  const fridayAfter = metricsAfter.dailyProgress.find((d) => d.dayId === 'fri');
  assert.equal(fridayAfter?.percentage, 67);

  // Status breakdown updates: Done increased from 15 to 17 (both detailed & daily item updated), In Progress decreased from 5 to 3
  assert.equal(metricsAfter.byStatus['Done'], 17);
  assert.equal(metricsAfter.byStatus['In Progress'], 3);

  // Toggling dt-5 again uncompletes it and restores 45% / 10 of 22
  const uncheckResult = syncDetailedTaskToggle(
    nextDetailedTasks,
    nextColumns,
    'dt-5'
  );
  const metricsRestored = calculateDashboardMetrics(
    uncheckResult.nextColumns,
    uncheckResult.nextDetailedTasks
  );
  assert.equal(metricsRestored.completionPercentage, 45);
  assert.equal(metricsRestored.completedTasks, 10);
  assert.equal(
    metricsRestored.dailyProgress.find((d) => d.dayId === 'fri')?.percentage,
    33
  );
});

test('syncDailyTaskToggle synchronizes task state to detailed tasks and updates metrics in real time', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Toggle wed-4 ("Book dentist appointment") in Wednesday column -> linked to dt-3
  // Wednesday before: 1 of 4 completed (25%)
  const { nextColumns, nextDetailedTasks } = syncDailyTaskToggle(
    initialColumns,
    initialDetailed,
    'wed',
    'wed-4'
  );

  const wedCol = nextColumns.find((c) => c.id === 'wed');
  const linkedDaily = wedCol?.tasks.find((t) => t.id === 'wed-4');
  assert.equal(linkedDaily?.completed, false);
  assert.equal(linkedDaily?.status, 'To Do');

  const linkedDetailed = nextDetailedTasks.find((t) => t.id === 'dt-3');
  assert.equal(linkedDetailed?.completed, false);
  assert.equal(linkedDetailed?.status, 'To Do');

  // Metrics update: completed tasks drop from 10 to 9 -> 41%
  const metricsAfter = calculateDashboardMetrics(nextColumns, nextDetailedTasks);
  assert.equal(metricsAfter.completedTasks, 9);
  assert.equal(metricsAfter.completionPercentage, 41);
  assert.equal(
    metricsAfter.dailyProgress.find((d) => d.dayId === 'wed')?.percentage,
    0
  );
});

test('syncDetailedTaskPriority and syncDailyTaskPriority keep priorities in sync', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // dt-1 is 'High', linked to mon-3 ('High')
  const { nextDetailedTasks, nextColumns } = syncDetailedTaskPriority(
    initialDetailed,
    initialColumns,
    'dt-1'
  );

  assert.equal(
    nextDetailedTasks.find((t) => t.id === 'dt-1')?.priority,
    'Med'
  );
  assert.equal(
    nextColumns
      .find((c) => c.id === 'mon')
      ?.tasks.find((t) => t.id === 'mon-3')?.priority,
    'Med'
  );

  // Sync back from daily
  const syncedFromDaily = syncDailyTaskPriority(
    nextColumns,
    nextDetailedTasks,
    'mon',
    'mon-3'
  );
  assert.equal(
    syncedFromDaily.nextColumns
      .find((c) => c.id === 'mon')
      ?.tasks.find((t) => t.id === 'mon-3')?.priority,
    'Low'
  );
  assert.equal(
    syncedFromDaily.nextDetailedTasks.find((t) => t.id === 'dt-1')?.priority,
    'Low'
  );
});

test('archiveCompletedTasks moves completed tasks to archive list, declutters active board, and supports restoring', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Initially there are 10 completed daily tasks
  const initialCounts = countWeekTasksByCompletion(initialColumns);
  assert.equal(initialCounts.completedCount, 10);
  assert.equal(initialCounts.pendingCount, 12);

  const { nextColumns, nextDetailedTasks, nextArchive, archivedCount } =
    archiveCompletedTasks(
      initialColumns,
      initialDetailed,
      [],
      '2026-06-11T10:00:00.000Z'
    );

  assert.equal(archivedCount, 10);
  assert.equal(nextArchive.length, 10);

  // Active daily columns now have 0 completed tasks and all 12 pending tasks intact
  const afterCounts = countWeekTasksByCompletion(nextColumns);
  assert.equal(afterCounts.completedCount, 0);
  assert.equal(afterCounts.pendingCount, 12);

  // Completed detailed tasks are cleared from active detailed view
  const remainingCompletedDetailed = nextDetailedTasks.filter(
    (dt) => dt.completed && dt.text.trim().length > 0
  );
  assert.equal(remainingCompletedDetailed.length, 0);

  // Filtering archived tasks works by keyword, day, or category
  const mondayArchived = filterArchivedTasks(nextArchive, 'Monday');
  assert.equal(mondayArchived.length, 4);

  // Restore a single archived task back to active board
  const targetToRestore = nextArchive[0];
  const restoredSingle = restoreArchivedTask(
    nextColumns,
    nextDetailedTasks,
    nextArchive,
    targetToRestore.archiveId
  );
  assert.equal(restoredSingle.nextArchive.length, 9);
  assert.equal(
    countWeekTasksByCompletion(restoredSingle.nextColumns).completedCount,
    1
  );

  // Restore all remaining archived tasks
  const restoredAll = restoreAllArchivedTasks(
    restoredSingle.nextColumns,
    restoredSingle.nextDetailedTasks,
    restoredSingle.nextArchive
  );
  assert.equal(restoredAll.nextArchive.length, 0);
  assert.equal(
    countWeekTasksByCompletion(restoredAll.nextColumns).completedCount,
    10
  );
});

test('archiveSingleDailyTask and archiveSingleDetailedTask archive individual tasks and sync linked views', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Archive 'dt-1' ("Call dentist" linked to 'mon-3' "Client follow-up")
  const singleDetailedRes = archiveSingleDetailedTask(
    initialDetailed,
    initialColumns,
    [],
    'dt-1',
    '2026-06-11T12:00:00.000Z'
  );

  assert.equal(singleDetailedRes.nextArchive.length, 1);
  assert.equal(
    singleDetailedRes.nextArchive[0].linkedDetailedText,
    'Call dentist'
  );
  assert.equal(
    singleDetailedRes.nextDetailedTasks.find((t) => t.id === 'dt-1')?.text,
    ''
  );
  assert.equal(
    countWeekTasksByCompletion(singleDetailedRes.nextColumns).completedCount,
    9
  );

  // Archive a single daily task ('tue-3' "Grocery shopping")
  const singleDailyRes = archiveSingleDailyTask(
    singleDetailedRes.nextColumns,
    singleDetailedRes.nextDetailedTasks,
    singleDetailedRes.nextArchive,
    'tue',
    'tue-3',
    '2026-06-11T12:05:00.000Z'
  );

  assert.equal(singleDailyRes.nextArchive.length, 2);
  assert.equal(
    countWeekTasksByCompletion(singleDailyRes.nextColumns).completedCount,
    8
  );

  // Shortcut 'A' resolves to OPEN_ARCHIVE_MODAL when not in editable input
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'a', isEditableTarget: false }),
    'OPEN_ARCHIVE_MODAL'
  );
  assert.equal(
    resolveKeyboardShortcutAction({ key: 'a', isEditableTarget: true }),
    null
  );
});

test('formatTopBarViewContext formats current route and active view context cleanly', () => {
  assert.equal(formatTopBarViewContext('/', 'week'), 'Dashboard · This Week');
  assert.equal(formatTopBarViewContext('/', 'month'), 'Dashboard · This Month');
  assert.equal(formatTopBarViewContext('/', 'year'), 'Dashboard · This Year');
  assert.equal(
    formatTopBarViewContext('/live-progress', 'week'),
    'Live Progress · This Week'
  );
  assert.equal(
    formatTopBarViewContext('/', 'week', true),
    '404 · Page Not Found'
  );
});

test('addQuickTaskToDayColumn populates the first empty slot or appends a new task and syncs dashboard metrics', () => {
  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Thursday initially has 3 active tasks (thu-1, thu-2, thu-3) and 3 blank slots (thu-4, thu-5, thu-6)
  const thuBefore = initialColumns.find((c) => c.id === 'thu')!;
  assert.equal(calculateDayProgress(thuBefore.tasks).fractionLabel, '1/3');

  // 1. Empty or whitespace-only input is ignored
  const emptyRes = addQuickTaskToDayColumn(
    initialColumns,
    initialDetailed,
    'thu',
    '   '
  );
  assert.equal(emptyRes.addedTask, null);
  assert.equal(emptyRes.nextColumns, initialColumns);

  // 2. Adding a valid task fills the first available blank slot (thu-4)
  const firstAdd = addQuickTaskToDayColumn(
    initialColumns,
    initialDetailed,
    'thu',
    '  Send product launch invite  '
  );
  assert.ok(firstAdd.addedTask);
  assert.equal(firstAdd.addedTask.id, 'thu-4');
  assert.equal(firstAdd.addedTask.text, 'Send product launch invite');
  assert.equal(firstAdd.addedTask.completed, false);
  assert.equal(firstAdd.addedTask.status, 'To Do');
  assert.equal(firstAdd.addedTask.priority, 'Med');

  const thuAfterFirst = firstAdd.nextColumns.find((c) => c.id === 'thu')!;
  assert.equal(thuAfterFirst.tasks.length, 6);
  assert.equal(calculateDayProgress(thuAfterFirst.tasks).fractionLabel, '1/4');

  // 3. Fill the remaining 2 blank slots on Thursday (thu-5 and thu-6) and then add a 7th task
  const secondAdd = addQuickTaskToDayColumn(
    firstAdd.nextColumns,
    firstAdd.nextDetailedTasks,
    'thu',
    'Review Q3 design mockups'
  );
  const thirdAdd = addQuickTaskToDayColumn(
    secondAdd.nextColumns,
    secondAdd.nextDetailedTasks,
    'thu',
    'Finalize speaker notes'
  );

  // Now all 6 slots on Thursday are full; adding another task appends a 7th slot
  const fourthAdd = addQuickTaskToDayColumn(
    thirdAdd.nextColumns,
    thirdAdd.nextDetailedTasks,
    'thu',
    'Book post-launch retrospective',
    { priority: 'High', category: 'Work' }
  );

  assert.ok(fourthAdd.addedTask);
  assert.equal(fourthAdd.addedTask.text, 'Book post-launch retrospective');
  assert.equal(fourthAdd.addedTask.priority, 'High');
  assert.equal(fourthAdd.addedTask.category, 'Work');

  const thuAfterFourth = fourthAdd.nextColumns.find((c) => c.id === 'thu')!;
  assert.equal(thuAfterFourth.tasks.length, 7);
  assert.equal(
    thuAfterFourth.tasks[6].text,
    'Book post-launch retrospective'
  );
  assert.equal(calculateDayProgress(thuAfterFourth.tasks).fractionLabel, '1/7');

  // Verify dashboard metrics reflect the 4 newly added Thursday tasks (22 + 4 = 26 total tasks)
  const metrics = calculateDashboardMetrics(
    fourthAdd.nextColumns,
    fourthAdd.nextDetailedTasks
  );
  assert.equal(metrics.totalTasks, 26);
  assert.equal(metrics.completedTasks, 10);
});

test('color-coded tag system: syncDailyTaskCategory, syncDetailedTaskCategory, parseQuickTaskTag, and category filtering', async () => {
  const {
    parseQuickTaskTag,
    filterTasksByCategory,
    filterDayColumnsByCategory,
    countTasksByCategory,
  } = await import('./todoLogic');

  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // 1. Cycling daily task category updates the daily task and syncs linked detailed task
  // 'fri-3' ("Q3 planning session") starts as 'Work' and is linked to 'dt-5' ('Work')
  const cycledDaily = syncDailyTaskCategory(
    initialColumns,
    initialDetailed,
    'fri',
    'fri-3'
  );
  const fri3After = cycledDaily.nextColumns
    .find((c) => c.id === 'fri')
    ?.tasks.find((t) => t.id === 'fri-3');
  const dt5After = cycledDaily.nextDetailedTasks.find((t) => t.id === 'dt-5');
  assert.equal(fri3After?.category, 'Personal');
  assert.equal(dt5After?.category, 'Personal');

  // 2. Cycling detailed task category updates the detailed task and syncs linked daily task
  const cycledDetailed = syncDetailedTaskCategory(
    cycledDaily.nextDetailedTasks,
    cycledDaily.nextColumns,
    'dt-5'
  );
  assert.equal(
    cycledDetailed.nextDetailedTasks.find((t) => t.id === 'dt-5')?.category,
    'Health'
  );
  assert.equal(
    cycledDetailed.nextColumns
      .find((c) => c.id === 'fri')
      ?.tasks.find((t) => t.id === 'fri-3')?.category,
    'Health'
  );

  // 3. Inline #tag extraction in parseQuickTaskTag and addQuickTaskToDayColumn
  const parsedHealth = parseQuickTaskTag('Morning 5k run #health', 'Work');
  assert.equal(parsedHealth.cleanText, 'Morning 5k run');
  assert.equal(parsedHealth.category, 'Health');
  assert.equal(parsedHealth.hadInlineTag, true);

  const parsedFallback = parseQuickTaskTag('Prepare board deck', 'Finance');
  assert.equal(parsedFallback.cleanText, 'Prepare board deck');
  assert.equal(parsedFallback.category, 'Finance');
  assert.equal(parsedFallback.hadInlineTag, false);

  const quickAddedWithHashtag = addQuickTaskToDayColumn(
    initialColumns,
    initialDetailed,
    'mon',
    'Evening meditation #health'
  );
  assert.ok(quickAddedWithHashtag.addedTask);
  assert.equal(quickAddedWithHashtag.addedTask.text, 'Evening meditation');
  assert.equal(quickAddedWithHashtag.addedTask.category, 'Health');

  // 4. Counting and filtering tasks by category tag
  const activeDetailedCounts = countTasksByCategory(initialDetailed);
  assert.equal(activeDetailedCounts.Work, 3);
  assert.equal(activeDetailedCounts.Finance, 3);
  assert.equal(activeDetailedCounts.Health, 1);
  assert.equal(activeDetailedCounts.Personal, 1);
  assert.equal(activeDetailedCounts.Home, 1);
  assert.equal(activeDetailedCounts.Growth, 1);

  const filteredDetailedHealth = filterTasksByCategory(
    initialDetailed,
    'Health'
  );
  assert.equal(filteredDetailedHealth.length, 1);
  assert.equal(filteredDetailedHealth[0].text, 'Book dentist appointment');

  const filteredColsWork = filterDayColumnsByCategory(initialColumns, 'Work');
  // Monday has 4 active Work tasks
  assert.equal(filteredColsWork[0].tasks.length, 4);
  // Saturday has 0 Work tasks
  assert.equal(filteredColsWork[5].tasks.length, 0);

  // 5. DashboardMetrics.byCategory aggregates category counts across weekly and detailed tasks
  const initialMetrics = calculateDashboardMetrics(
    initialColumns,
    initialDetailed
  );
  // Weekly Work tasks (9) + Detailed Work tasks (3) = 12
  assert.equal(initialMetrics.byCategory.Work, 12);
  // Weekly Personal tasks (1) + Detailed Personal tasks (1) = 2
  assert.equal(initialMetrics.byCategory.Personal, 2);

  // After cycling fri-3 ('Work' -> 'Personal'), both fri-3 and linked dt-5 become 'Personal'
  const updatedMetrics = calculateDashboardMetrics(
    cycledDaily.nextColumns,
    cycledDaily.nextDetailedTasks
  );
  assert.equal(updatedMetrics.byCategory.Work, 10);
  assert.equal(updatedMetrics.byCategory.Personal, 4);
});

test('circular progress indicator: calculateDayProgress computes exact percentage for day columns', () => {
  const initialColumns = createInitialWeekColumns();

  // Monday has 4 tasks, all completed -> 100%
  const monProgress = calculateDayProgress(initialColumns[0].tasks);
  assert.equal(monProgress.completed, 4);
  assert.equal(monProgress.total, 4);
  assert.equal(monProgress.percentage, 100);
  assert.equal(monProgress.fractionLabel, '4/4');

  // Tuesday has 3 tasks, 1 completed -> 33%
  const tueProgress = calculateDayProgress(initialColumns[1].tasks);
  assert.equal(tueProgress.completed, 1);
  assert.equal(tueProgress.total, 3);
  assert.equal(tueProgress.percentage, 33);
  assert.equal(tueProgress.fractionLabel, '1/3');

  // Wednesday has 4 tasks, 1 completed -> 25%
  const wedProgress = calculateDayProgress(initialColumns[2].tasks);
  assert.equal(wedProgress.completed, 1);
  assert.equal(wedProgress.total, 4);
  assert.equal(wedProgress.percentage, 25);
  assert.equal(wedProgress.fractionLabel, '1/4');

  // Thursday has 3 tasks, 1 completed -> 33%
  const thuProgress = calculateDayProgress(initialColumns[3].tasks);
  assert.equal(thuProgress.completed, 1);
  assert.equal(thuProgress.total, 3);
  assert.equal(thuProgress.percentage, 33);
  assert.equal(thuProgress.fractionLabel, '1/3');

  // Empty day column -> 0%
  const emptyTasks: DailyTask[] = [
    { id: 'blank-1', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
    { id: 'blank-2', text: '—', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
  ];
  const emptyProgress = calculateDayProgress(emptyTasks);
  assert.equal(emptyProgress.completed, 0);
  assert.equal(emptyProgress.total, 0);
  assert.equal(emptyProgress.percentage, 0);
  assert.equal(emptyProgress.fractionLabel, '0/0');

  // Toggling an uncompleted task increases day percentage
  const { nextColumns } = syncDailyTaskToggle(initialColumns, createInitialDetailedTasks(), 'thu', 'thu-1');
  const updatedThuProgress = calculateDayProgress(nextColumns[3].tasks);
  // Now 2 of 3 tasks completed -> 67%
  assert.equal(updatedThuProgress.completed, 2);
  assert.equal(updatedThuProgress.percentage, 67);
  assert.equal(updatedThuProgress.fractionLabel, '2/3');

  // Theme progressFill colors match expected palettes for circular progress ring
  assert.equal(THEMES.terracotta.progressFill, '#C87D55');
  assert.equal(THEMES.candy.progressFill, '#68B694');
  assert.equal(THEMES.lavender.progressFill, '#7E8CE0');
  assert.equal(THEMES.neutral.progressFill, '#8C7A6B');
});

test('cycleRecurringInterval correctly cycles none -> daily -> weekly -> monthly -> none and handles undefined', () => {
  assert.equal(cycleRecurringInterval(undefined), 'daily');
  assert.equal(cycleRecurringInterval('none'), 'daily');
  assert.equal(cycleRecurringInterval('daily'), 'weekly');
  assert.equal(cycleRecurringInterval('weekly'), 'monthly');
  assert.equal(cycleRecurringInterval('monthly'), 'none');

  assert.equal(RECURRING_INTERVALS.length, 4);
  assert.deepEqual(RECURRING_INTERVALS, ['none', 'daily', 'weekly', 'monthly']);
  assert.equal(RECURRING_CONFIG.daily.label, 'Daily');
  assert.equal(RECURRING_CONFIG.weekly.label, 'Weekly');
  assert.equal(RECURRING_CONFIG.monthly.label, 'Monthly');
  assert.equal(isValidRecurring('daily'), true);
  assert.equal(isValidRecurring('weekly'), true);
  assert.equal(isValidRecurring('monthly'), true);
  assert.equal(isValidRecurring('none'), true);
  assert.equal(isValidRecurring('yearly'), false);
  assert.equal(isValidRecurring(null), false);
});

test('parseQuickTaskTag detects inline recurrence tags (@daily, @weekly, #monthly, repeat:daily) alongside category tags', () => {
  // Pure recurrence tag
  const t1 = parseQuickTaskTag('Water plants @daily');
  assert.equal(t1.cleanText, 'Water plants');
  assert.equal(t1.recurring, 'daily');
  assert.equal(t1.hadInlineTag, true);

  // Combined category and recurrence tags
  const t2 = parseQuickTaskTag('Meal prep #health @weekly');
  assert.equal(t2.cleanText, 'Meal prep');
  assert.equal(t2.category, 'Health');
  assert.equal(t2.recurring, 'weekly');
  assert.equal(t2.hadInlineTag, true);

  // Hash recurrence tag #monthly
  const t3 = parseQuickTaskTag('Submit budget report #finance #monthly');
  assert.equal(t3.cleanText, 'Submit budget report');
  assert.equal(t3.category, 'Finance');
  assert.equal(t3.recurring, 'monthly');
  assert.equal(t3.hadInlineTag, true);

  // repeat: syntax
  const t4 = parseQuickTaskTag('Team retro repeat:weekly');
  assert.equal(t4.cleanText, 'Team retro');
  assert.equal(t4.recurring, 'weekly');
  assert.equal(t4.hadInlineTag, true);

  // Plain text without recurrence tag preserves fallback
  const t5 = parseQuickTaskTag('Call contractor', 'Home', 'daily');
  assert.equal(t5.cleanText, 'Call contractor');
  assert.equal(t5.category, 'Home');
  assert.equal(t5.recurring, 'daily');
  assert.equal(t5.hadInlineTag, false);
});

test('addQuickTaskToDayColumn populates or appends task with recurrence cadence option', () => {
  const columns = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();

  // Add task to Thursday with explicit recurring option
  const res1 = addQuickTaskToDayColumn(columns, detailed, 'thu', 'Stretch for 15 mins', {
    category: 'Health',
    recurring: 'daily',
  });
  assert.ok(res1.addedTask);
  assert.equal(res1.addedTask?.text, 'Stretch for 15 mins');
  assert.equal(res1.addedTask?.category, 'Health');
  assert.equal(res1.addedTask?.recurring, 'daily');

  // Add task with inline tag @weekly
  const res2 = addQuickTaskToDayColumn(columns, detailed, 'mon', 'Review weekly finances @weekly');
  assert.ok(res2.addedTask);
  assert.equal(res2.addedTask?.text, 'Review weekly finances');
  assert.equal(res2.addedTask?.recurring, 'weekly');
});

test('regenerateRecurringTask automatically creates pending task in next column for daily recurrence and wraps Sunday to Monday', () => {
  const columns = createInitialWeekColumns();

  // Daily task completed on Thursday (index 3) should re-generate into Friday (index 4)
  const thuDailyTask: DailyTask = {
    id: 'thu-test',
    text: 'Morning walk',
    completed: true,
    priority: 'Low',
    status: 'Done',
    category: 'Health',
    notes: 'Bring water',
    recurring: 'daily',
  };

  const regenThu = regenerateRecurringTask(columns, 'thu', thuDailyTask);
  assert.ok(regenThu.regeneratedTask);
  assert.equal(regenThu.targetDayId, 'fri');
  assert.equal(regenThu.targetDayName, 'Friday');
  assert.equal(regenThu.regeneratedTask?.text, 'Morning walk');
  assert.equal(regenThu.regeneratedTask?.completed, false);
  assert.equal(regenThu.regeneratedTask?.status, 'To Do');
  assert.equal(regenThu.regeneratedTask?.recurring, 'daily');
  assert.equal(regenThu.regeneratedTask?.category, 'Health');

  // Verify Friday column now has the re-generated task
  const friCol = regenThu.nextColumns.find((c) => c.id === 'fri');
  assert.ok(friCol?.tasks.some((t) => t.text === 'Morning walk' && !t.completed));

  // Daily task completed on Sunday (index 6) should wrap around to Monday (index 0)
  const sunDailyTask: DailyTask = {
    id: 'sun-test',
    text: 'Evening meditation',
    completed: true,
    priority: 'Med',
    status: 'Done',
    category: 'Growth',
    recurring: 'daily',
  };
  const regenSun = regenerateRecurringTask(columns, 'sun', sunDailyTask);
  assert.ok(regenSun.regeneratedTask);
  assert.equal(regenSun.targetDayId, 'mon');
  assert.equal(regenSun.targetDayName, 'Monday');

  // Non-recurring task returns null
  const nonRecurringTask: DailyTask = {
    id: 'none-test',
    text: 'Buy concert tickets',
    completed: true,
    priority: 'High',
    status: 'Done',
    category: 'Personal',
    recurring: 'none',
  };
  const regenNone = regenerateRecurringTask(columns, 'thu', nonRecurringTask);
  assert.equal(regenNone.regeneratedTask, null);
});

test('syncDailyTaskToggle automatically re-generates recurring tasks upon completion and returns target day info', () => {
  const columns = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();

  // thu-3 is initial sample task: 'Exercise - walk dog', completed: false, recurring: 'daily'
  const targetCol = columns.find((c) => c.id === 'thu');
  const taskToComplete = targetCol?.tasks.find((t) => t.id === 'thu-3');
  assert.ok(taskToComplete);
  assert.equal(taskToComplete?.recurring, 'daily');
  assert.equal(taskToComplete?.completed, false);

  // Toggling thu-3 marks it completed AND re-generates next instance in Friday
  const result = syncDailyTaskToggle(columns, detailed, 'thu', 'thu-3');

  // Thu-3 remains completed: true
  const updatedThuCol = result.nextColumns.find((c) => c.id === 'thu');
  const updatedThu3 = updatedThuCol?.tasks.find((t) => t.id === 'thu-3');
  assert.equal(updatedThu3?.completed, true);
  assert.equal(updatedThu3?.status, 'Done');

  // Returned regenerated info
  assert.ok(result.regeneratedTask);
  assert.equal(result.regeneratedTargetDayName, 'Friday');
  assert.equal(result.regeneratedTask?.text, 'Exercise - walk dog');
  assert.equal(result.regeneratedTask?.completed, false);
  assert.equal(result.regeneratedTask?.recurring, 'daily');

  // Friday column contains the new pending instance
  const updatedFriCol = result.nextColumns.find((c) => c.id === 'fri');
  assert.ok(
    updatedFriCol?.tasks.some(
      (t) => t.text === 'Exercise - walk dog' && !t.completed && t.status === 'To Do'
    )
  );
});

test('persistence and CSV export retain recurring interval state', () => {
  const columns = createInitialWeekColumns();

  // CSV export includes recurrence annotation [Repeat: daily]
  const csv = generateCsvExport(columns);
  assert.ok(csv.includes('[Repeat: daily]'));
  assert.ok(csv.includes('[Repeat: weekly]'));

  // parsePersistedDashboardState retains recurring cadence
  const serialized = JSON.stringify({
    columns,
    detailedTasks: createInitialDetailedTasks(),
    monthlyGoals: createInitialMonthlyGoals(),
    yearlyGoals: createInitialYearlyGoals(),
    archivedTasks: [],
    activeTheme: 'terracotta',
  });

  const parsed = parsePersistedDashboardState(serialized);
  const thuCol = parsed.columns.find((c) => c.id === 'thu');
  const thu3 = thuCol?.tasks.find((t) => t.id === 'thu-3');
  assert.equal(thu3?.recurring, 'daily');

  const thu2 = thuCol?.tasks.find((t) => t.id === 'thu-2');
  assert.equal(thu2?.recurring, 'weekly');
});

test('collapsible task notes: updateDailyTaskNotes persists multi-line long-form text and retains task fields', () => {
  const initialColumns = createInitialWeekColumns();
  const longFormText = `Meeting notes with engineering lead:
- Discussed Q3 roadmap and milestone deliveries.
- Verified latency on database queries is under 45ms.
- Action items:
  1. Review pull request by EOD Thursday.
  2. Prepare demo slides for leadership.
Link: https://example.com/spec-v2`;

  const updatedColumns = updateDailyTaskNotes(
    initialColumns,
    'mon',
    'mon-1',
    longFormText
  );

  const monCol = updatedColumns.find((c) => c.id === 'mon');
  assert.ok(monCol);
  const task1 = monCol.tasks.find((t) => t.id === 'mon-1');
  assert.ok(task1);
  assert.equal(task1.notes, longFormText);
  // Verify other task attributes remain unmodified
  assert.equal(task1.text, initialColumns[0].tasks[0].text);
  assert.equal(task1.priority, initialColumns[0].tasks[0].priority);
  assert.equal(task1.completed, initialColumns[0].tasks[0].completed);

  // Clearing notes sets notes to empty string
  const clearedColumns = updateDailyTaskNotes(updatedColumns, 'mon', 'mon-1', '');
  const clearedTask = clearedColumns
    .find((c) => c.id === 'mon')
    ?.tasks.find((t) => t.id === 'mon-1');
  assert.equal(clearedTask?.notes, '');
});

test('collapsible task notes: sanitizeTaskNotes preserves newlines, tabs, and multi-paragraph text up to 4000 chars', () => {
  const multiLineParagraph = `Paragraph 1: Executive overview.\n\nParagraph 2: Detailed architecture.\n\t* Key component A\n\t* Key component B`;
  const sanitized = sanitizeTaskNotes(multiLineParagraph);
  assert.equal(sanitized, multiLineParagraph);

  // Strips null byte and control chars without mangling newlines
  const dirty = `Valid note line 1\x00\x07\nValid note line 2\x1F`;
  assert.equal(sanitizeTaskNotes(dirty), 'Valid note line 1\nValid note line 2');

  // Truncates gracefully at 4000 chars
  const longText = 'a'.repeat(4500);
  assert.equal(sanitizeTaskNotes(longText).length, 4000);
});

test('collapsible task notes: parsePersistedDashboardState retains long-form notes through JSON serialization', () => {
  const columns = createInitialWeekColumns();
  const detailedNotes = `Comprehensive checklist:\n[ ] Setup monitoring\n[x] Deploy release v1.4\n[ ] Send announcement email`;

  const columnsWithNotes = updateDailyTaskNotes(
    columns,
    'wed',
    'wed-2',
    detailedNotes
  );

  const serialized = JSON.stringify({
    columns: columnsWithNotes,
    detailedTasks: createInitialDetailedTasks(),
    monthlyGoals: createInitialMonthlyGoals(),
    yearlyGoals: createInitialYearlyGoals(),
    archivedTasks: [],
    activeTheme: 'terracotta',
  });

  const parsed = parsePersistedDashboardState(serialized);
  const wedCol = parsed.columns.find((c) => c.id === 'wed');
  const wedTask = wedCol?.tasks.find((t) => t.id === 'wed-2');
  assert.equal(wedTask?.notes, detailedNotes);
});

test('global task search: getTaskMatchDetail accurately distinguishes matches in name, category, and note content', () => {
  const task: DailyTask = {
    id: 'test-1',
    text: 'Client presentation rehearsal',
    completed: false,
    priority: 'High',
    status: 'In Progress',
    category: 'Work',
    notes: 'Remember to emphasize the 45% retention increase and demo the live dashboard',
  };

  // 1. Matches in task name
  const nameMatch = getTaskMatchDetail(task, 'rehearsal');
  assert.equal(nameMatch.matches, true);
  assert.equal(nameMatch.field, 'name');

  // 2. Matches in category
  const categoryMatch = getTaskMatchDetail(task, 'work');
  assert.equal(categoryMatch.matches, true);
  assert.equal(categoryMatch.field, 'category');

  // 3. Matches in note content with context snippet
  const notesMatch = getTaskMatchDetail(task, 'retention increase');
  assert.equal(notesMatch.matches, true);
  assert.equal(notesMatch.field, 'notes');
  assert.ok(notesMatch.snippet);
  assert.ok(notesMatch.snippet.includes('retention increase'));

  // 4. Blank task does not match
  const blankTask: DailyTask = {
    id: 'test-blank',
    text: '   ',
    completed: false,
    priority: 'Med',
    status: 'To Do',
    category: 'Personal',
    notes: 'Some orphaned note',
  };
  assert.equal(getTaskMatchDetail(blankTask, 'orphaned').matches, false);

  // 5. Unmatched term returns false
  const noMatch = getTaskMatchDetail(task, 'astronomy');
  assert.equal(noMatch.matches, false);
});

test('global task search: countMatchingTasks computes comprehensive breakdown stats across name, category, and notes', () => {
  const columns = createInitialWeekColumns();
  const monthly = createInitialMonthlyGoals();
  const yearly = createInitialYearlyGoals();

  // Search by category "finance"
  const financeStats = countMatchingTasks(columns, monthly, yearly, 'finance');
  assert.ok(financeStats.totalMatches > 0);
  assert.ok(financeStats.byCategory.Finance > 0);

  // Search by keyword that appears in notes: 'retention' in Tuesday Q2 report note
  const noteStats = countMatchingTasks(columns, monthly, yearly, 'retention');
  assert.ok(noteStats.totalMatches >= 1);
  assert.ok(noteStats.byField.notes >= 1);

  // High performance: 1000 sequential search queries complete in under 50ms
  const start = Date.now();
  for (let i = 0; i < 500; i++) {
    countMatchingTasks(columns, monthly, yearly, 'report');
  }
  const duration = Date.now() - start;
  assert.ok(duration < 250, `Expected <250ms but took ${duration}ms`);
});








test('JSON backup export and parse roundtrip preserves full application state safely', () => {
  const columns = createInitialWeekColumns();
  columns[0].tasks[0].text = 'Write technical architecture spec';
  columns[0].tasks[0].notes = 'Must include caching and security layers';
  columns[0].tasks[0].category = 'Work';
  columns[0].tasks[0].recurring = 'weekly';

  const detailed = createInitialDetailedTasks();
  const monthly = createInitialMonthlyGoals();
  const yearly = createInitialYearlyGoals();
  const archived = [
    {
      archiveId: 'arch-1',
      originalId: 'mon-1',
      text: 'Old archived item',
      completed: true,
      priority: 'Low' as const,
      status: 'Done' as const,
      category: 'Personal' as const,
      archivedAt: '2026-06-01T10:00:00.000Z',
    },
  ];

  const payload = JSON.stringify({
    schemaVersion: 1,
    exportedAt: '2026-06-11T12:00:00.000Z',
    columns,
    detailedTasks: detailed,
    monthlyGoals: monthly,
    yearlyGoals: yearly,
    archivedTasks: archived,
    activeTheme: 'candy',
  });

  const parsed = parsePersistedDashboardState(payload);
  assert.equal(parsed.columns[0].tasks[0].text, 'Write technical architecture spec');
  assert.equal(parsed.columns[0].tasks[0].notes, 'Must include caching and security layers');
  assert.equal(parsed.columns[0].tasks[0].recurring, 'weekly');
  assert.equal(parsed.activeTheme, 'candy');
  assert.equal(parsed.archivedTasks.length, 1);
  assert.equal(parsed.archivedTasks[0].text, 'Old archived item');
});

test('parsePersistedDashboardState defends against prototype poisoning and malicious payload injection', () => {
  const maliciousJson = JSON.stringify({
    __proto__: { isAdmin: true },
    constructor: { prototype: { polluter: true } },
    columns: [
      {
        id: 'mon',
        dayName: 'Monday',
        dateLabel: 'Jun 8',
        isToday: true,
        tasks: [
          {
            id: 'bad-task',
            text: '<script>evil()</script>Normal task',
            completed: false,
            priority: 'InvalidPriority',
            category: 'InvalidCategory',
            recurring: 'InvalidRecurrence',
            notes: 'Notes with null chars \u0000 and overflow',
          },
        ],
      },
      // only 1 column provided instead of 7 -> should fallback safely to 7 default columns
    ],
  });

  const parsed = parsePersistedDashboardState(maliciousJson);
  assert.equal(parsed.columns.length, 7);
  assert.equal((Object.prototype as any).isAdmin, undefined);
  assert.equal((Object.prototype as any).polluter, undefined);
});

test('CSV cell sanitization strictly neutralizes spreadsheet formula injection prefixes', () => {
  assert.equal(sanitizeCsvCell('=1+1'), '"\'=1+1"');
  assert.equal(sanitizeCsvCell('@SUM(A1:A10)'), '"\'@SUM(A1:A10)"');
  assert.equal(sanitizeCsvCell('-5'), '"\'-5"');
  assert.equal(sanitizeCsvCell("+cmd|'/C calc'!A0"), `"'+cmd|'/C calc'!A0"`);
  assert.equal(sanitizeCsvCell('\t=DDE(...)'), '"\'=DDE(...)"');
  assert.equal(sanitizeCsvCell('Normal task text'), '"Normal task text"');
});

test('dashboard entrance animation: variants define staggered fade-in and subtle vertical slide-up', () => {
  assert.equal(DASHBOARD_ENTRANCE_CONTAINER_VARIANTS.hidden.opacity, 0);
  assert.equal(
    DASHBOARD_ENTRANCE_CONTAINER_VARIANTS.hidden.y,
    DASHBOARD_ENTRANCE_CONFIG.slideUpOffsetPx
  );
  assert.equal(DASHBOARD_ENTRANCE_CONTAINER_VARIANTS.visible.opacity, 1);
  assert.equal(DASHBOARD_ENTRANCE_CONTAINER_VARIANTS.visible.y, 0);
  assert.ok(
    DASHBOARD_ENTRANCE_CONTAINER_VARIANTS.visible.transition.staggerChildren > 0
  );

  assert.equal(DASHBOARD_ENTRANCE_ITEM_VARIANTS.hidden.opacity, 0);
  assert.equal(
    DASHBOARD_ENTRANCE_ITEM_VARIANTS.hidden.y,
    DASHBOARD_ENTRANCE_CONFIG.slideUpOffsetPx
  );
  assert.equal(DASHBOARD_ENTRANCE_ITEM_VARIANTS.visible.opacity, 1);
  assert.equal(DASHBOARD_ENTRANCE_ITEM_VARIANTS.visible.y, 0);
});

test('dashboard entrance animation: triggers only on initial page load and not during theme switches', () => {
  resetDashboardInitialLoadEntranceForTest();
  assert.equal(hasDashboardAnimatedOnInitialLoad(), false);

  // 1. Initial page load consumes entrance token and resolves initial="hidden"
  const isFirstLoad = consumeDashboardInitialLoadEntrance();
  assert.equal(isFirstLoad, true);
  assert.equal(hasDashboardAnimatedOnInitialLoad(), true);
  assert.equal(
    resolveDashboardEntranceInitialProp({
      isInitialPageLoad: isFirstLoad,
      isThemeSwitch: false,
    }),
    'hidden'
  );

  // 2. Theme switch during or after initial page load suppresses entrance animation (initial=false)
  assert.equal(
    resolveDashboardEntranceInitialProp({
      isInitialPageLoad: isFirstLoad,
      isThemeSwitch: true,
    }),
    false
  );

  // 3. Subsequent mounts / route visits return false and resolve initial=false
  const isSecondMount = consumeDashboardInitialLoadEntrance();
  assert.equal(isSecondMount, false);
  assert.equal(
    resolveDashboardEntranceInitialProp({
      isInitialPageLoad: isSecondMount,
      isThemeSwitch: false,
    }),
    false
  );
});

test('live weekly completion bar: buildWeeklyCompletionBarSummary reflects total weekly completion percentage and updates when tasks are marked complete', async () => {
  const { buildWeeklyCompletionBarSummary, WEEKLY_COMPLETION_BAR_MILESTONES } =
    await import('./todoLogic');

  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Initial state: 10 of 22 daily tasks completed -> 45%
  const metricsBefore = calculateDashboardMetrics(
    initialColumns,
    initialDetailed
  );
  const summaryBefore = buildWeeklyCompletionBarSummary({
    completedTasks: metricsBefore.completedTasks,
    totalTasks: metricsBefore.totalTasks,
    completionPercentage: metricsBefore.completionPercentage,
  });

  assert.equal(summaryBefore.completedTasks, 10);
  assert.equal(summaryBefore.totalTasks, 22);
  assert.equal(summaryBefore.pendingTasks, 12);
  assert.equal(summaryBefore.percentage, 45);
  assert.equal(summaryBefore.statusLabel, 'In progress');
  assert.equal(
    summaryBefore.summaryText,
    '10 of 22 daily tasks completed · 12 remaining'
  );
  assert.deepEqual(
    summaryBefore.milestoneMarkers,
    WEEKLY_COMPLETION_BAR_MILESTONES
  );

  // Mark dt-5 ("Q3 planning session" linked to fri-3) complete -> 11 of 22 (50%)
  const toggled = syncDetailedTaskToggle(
    initialDetailed,
    initialColumns,
    'dt-5'
  );
  const metricsAfter = calculateDashboardMetrics(
    toggled.nextColumns,
    toggled.nextDetailedTasks
  );
  const summaryAfter = buildWeeklyCompletionBarSummary({
    completedTasks: metricsAfter.completedTasks,
    totalTasks: metricsAfter.totalTasks,
    completionPercentage: metricsAfter.completionPercentage,
  });

  assert.equal(summaryAfter.completedTasks, 11);
  assert.equal(summaryAfter.totalTasks, 22);
  assert.equal(summaryAfter.pendingTasks, 11);
  assert.equal(summaryAfter.percentage, 50);
  assert.equal(summaryAfter.statusLabel, 'Halfway through the week');
  assert.equal(
    summaryAfter.summaryText,
    '11 of 22 daily tasks completed · 11 remaining'
  );

  // Threshold checks: 0%, 75%, 100%, and empty week (0 total tasks)
  const zeroSummary = buildWeeklyCompletionBarSummary({
    completedTasks: 0,
    totalTasks: 22,
  });
  assert.equal(zeroSummary.percentage, 0);
  assert.equal(zeroSummary.statusLabel, 'No tasks completed yet');

  const finalStretchSummary = buildWeeklyCompletionBarSummary({
    completedTasks: 18,
    totalTasks: 22,
  });
  assert.equal(finalStretchSummary.percentage, 82);
  assert.equal(finalStretchSummary.statusLabel, 'Final stretch!');

  const fullSummary = buildWeeklyCompletionBarSummary({
    completedTasks: 22,
    totalTasks: 22,
  });
  assert.equal(fullSummary.percentage, 100);
  assert.equal(fullSummary.pendingTasks, 0);
  assert.equal(fullSummary.statusLabel, 'All weekly tasks complete!');

  const emptyWeekSummary = buildWeeklyCompletionBarSummary({
    completedTasks: 0,
    totalTasks: 0,
  });
  assert.equal(emptyWeekSummary.percentage, 0);
  assert.equal(emptyWeekSummary.statusLabel, 'No tasks scheduled');
});

test('bulk import: parseBulkImportLines parses multi-line tasks with bullets, numbers, checkboxes, categories, priorities, and recurrence tags', async () => {
  const { parseBulkImportLines } = await import('./todoLogic');

  const rawText = `
    - Review Q3 design mockups #work !high
    * [x] Morning 5k run #health @daily
    1. Call accountant about tax filing #finance
    2) Buy espresso beans #home !low
    ---
    [ ] Read 20 pages of book #growth repeat:daily
  `;

  const parsed = parseBulkImportLines(rawText, {
    defaultCategory: 'Personal',
    defaultPriority: 'Med',
    defaultRecurring: 'none',
  });

  assert.equal(parsed.length, 5);

  assert.deepEqual(parsed[0], {
    cleanText: 'Review Q3 design mockups',
    completed: false,
    priority: 'High',
    category: 'Work',
    recurring: 'none',
  });

  assert.deepEqual(parsed[1], {
    cleanText: 'Morning 5k run',
    completed: true,
    priority: 'Med',
    category: 'Health',
    recurring: 'daily',
  });

  assert.deepEqual(parsed[2], {
    cleanText: 'Call accountant about tax filing',
    completed: false,
    priority: 'Med',
    category: 'Finance',
    recurring: 'none',
  });

  assert.deepEqual(parsed[3], {
    cleanText: 'Buy espresso beans',
    completed: false,
    priority: 'Low',
    category: 'Home',
    recurring: 'none',
  });

  assert.deepEqual(parsed[4], {
    cleanText: 'Read 20 pages of book',
    completed: false,
    priority: 'Med',
    category: 'Growth',
    recurring: 'daily',
  });
});

test('bulk import: bulkImportTasksToDayColumn adds multiple tasks at once to a specific day column and updates metrics', async () => {
  const { bulkImportTasksToDayColumn } = await import('./todoLogic');

  const initialColumns = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();

  // Thursday initially has 3 active tasks (1 completed, 2 pending) and 3 blank slots
  const thuBefore = initialColumns.find((c) => c.id === 'thu')!;
  assert.equal(calculateDayProgress(thuBefore.tasks).fractionLabel, '1/3');

  const pastedList = [
    '- Prepare sprint retro deck #work !high',
    '- [x] Send client invoice #finance',
    '- Book flights for conference #work',
    '- Order new monitor stand #home !low',
  ].join('\n');

  const result = bulkImportTasksToDayColumn(
    initialColumns,
    initialDetailed,
    'thu',
    pastedList,
    {
      defaultCategory: 'Personal',
      defaultPriority: 'Med',
    }
  );

  assert.equal(result.targetDayName, 'Thursday');
  assert.equal(result.addedTasks.length, 4);
  assert.equal(result.addedTasks[0].text, 'Prepare sprint retro deck');
  assert.equal(result.addedTasks[0].priority, 'High');
  assert.equal(result.addedTasks[0].category, 'Work');
  assert.equal(result.addedTasks[0].completed, false);

  assert.equal(result.addedTasks[1].text, 'Send client invoice');
  assert.equal(result.addedTasks[1].completed, true);
  assert.equal(result.addedTasks[1].status, 'Done');
  assert.equal(result.addedTasks[1].category, 'Finance');

  // Thursday had 3 blank slots + 1 appended slot -> now 7 total tasks, all 7 active (2 completed)
  const thuAfter = result.nextColumns.find((c) => c.id === 'thu')!;
  assert.equal(thuAfter.tasks.length, 7);
  const thuProgressAfter = calculateDayProgress(thuAfter.tasks);
  assert.equal(thuProgressAfter.completed, 2);
  assert.equal(thuProgressAfter.total, 7);
  assert.equal(thuProgressAfter.fractionLabel, '2/7');

  // Overall weekly metrics update from 10/22 to 11/26
  const metricsAfter = calculateDashboardMetrics(
    result.nextColumns,
    result.nextDetailedTasks
  );
  assert.equal(metricsAfter.completedTasks, 11);
  assert.equal(metricsAfter.totalTasks, 26);
});

test('visual trend indicator: calculateWeeklyTrendComparison detects increasing, decreasing, and flat completion rates vs previous week and generates sparkline points', async () => {
  const { calculateWeeklyTrendComparison } = await import('./todoLogic');

  // 1. Default baseline (41% last week) vs initial 45% this week -> Increasing (+4%)
  const upTrend = calculateWeeklyTrendComparison({
    currentPercentage: 45,
  });
  assert.equal(upTrend.currentPercentage, 45);
  assert.equal(upTrend.previousWeekPercentage, 41);
  assert.equal(upTrend.deltaPercentage, 4);
  assert.equal(upTrend.direction, 'up');
  assert.equal(upTrend.deltaBadgeText, '+4%');
  assert.equal(
    upTrend.comparisonSummary,
    'Increasing (+4% vs 41% last week)'
  );
  assert.deepEqual(upTrend.sparklineRates, [35, 40, 41, 45]);
  assert.equal(upTrend.sparklinePoints.length, 4);
  assert.ok(upTrend.sparklinePolylinePoints.length > 0);
  // Since 45% > 41%, the last sparkline point Y should be higher up (smaller SVG Y coordinate) than previous week
  assert.ok(upTrend.sparklinePoints[3].y < upTrend.sparklinePoints[2].y);

  // 2. Decreasing completion rate (36% vs 41% last week -> -5%)
  const downTrend = calculateWeeklyTrendComparison({
    currentPercentage: 36,
    previousWeekPercentage: 41,
  });
  assert.equal(downTrend.deltaPercentage, -5);
  assert.equal(downTrend.direction, 'down');
  assert.equal(downTrend.deltaBadgeText, '-5%');
  assert.equal(
    downTrend.comparisonSummary,
    'Decreasing (-5% vs 41% last week)'
  );
  assert.ok(downTrend.sparklinePoints[3].y > downTrend.sparklinePoints[2].y);

  // 3. Flat completion rate (41% vs 41% last week -> 0%)
  const flatTrend = calculateWeeklyTrendComparison({
    currentPercentage: 41,
    previousWeekPercentage: 41,
  });
  assert.equal(flatTrend.deltaPercentage, 0);
  assert.equal(flatTrend.direction, 'flat');
  assert.equal(flatTrend.deltaBadgeText, '0%');
  assert.equal(
    flatTrend.comparisonSummary,
    'Steady (same as 41% last week)'
  );
  assert.equal(
    flatTrend.sparklinePoints[3].y,
    flatTrend.sparklinePoints[2].y
  );
});

test('milestone badge system: evaluateWeeklyMilestoneBadges and detectNewlyUnlockedMilestoneBadges award digital badges at 25%, 50%, 75%, and 100% thresholds', async () => {
  const {
    evaluateWeeklyMilestoneBadges,
    detectNewlyUnlockedMilestoneBadges,
  } = await import('./todoLogic');

  // 1. At initial 10 of 22 tasks (45%): 25% badge is unlocked, 50%/75%/100% are locked
  const eval45 = evaluateWeeklyMilestoneBadges({
    completedTasks: 10,
    totalTasks: 22,
  });
  assert.equal(eval45.currentPercentage, 45);
  assert.equal(eval45.unlockedCount, 1);
  assert.equal(eval45.totalBadges, 4);
  assert.equal(eval45.highestUnlockedBadge?.threshold, 25);
  assert.equal(eval45.highestUnlockedBadge?.title, 'Momentum Starter');
  assert.equal(eval45.nextMilestoneBadge?.threshold, 50);
  assert.equal(eval45.nextMilestoneBadge?.title, 'Halfway Hero');
  assert.equal(eval45.nextMilestoneBadge?.tasksRemainingToUnlock, 1);
  assert.equal(eval45.nextMilestoneBadge?.statusText, '1 task to unlock');

  // 2. Completing 1 more task -> 11 of 22 (50%): unlocks 50% Halfway Hero badge
  const eval50 = evaluateWeeklyMilestoneBadges({
    completedTasks: 11,
    totalTasks: 22,
  });
  assert.equal(eval50.currentPercentage, 50);
  assert.equal(eval50.unlockedCount, 2);
  assert.equal(eval50.highestUnlockedBadge?.threshold, 50);
  assert.equal(eval50.highestUnlockedBadge?.title, 'Halfway Hero');
  assert.equal(eval50.nextMilestoneBadge?.threshold, 75);
  assert.equal(eval50.nextMilestoneBadge?.title, 'Power Finisher');
  assert.equal(eval50.nextMilestoneBadge?.tasksRemainingToUnlock, 6);

  // Detect newly unlocked badge between 10/22 (45%) and 11/22 (50%)
  const newlyUnlocked50 = detectNewlyUnlockedMilestoneBadges(
    { completedTasks: 10, totalTasks: 22 },
    { completedTasks: 11, totalTasks: 22 }
  );
  assert.equal(newlyUnlocked50.length, 1);
  assert.equal(newlyUnlocked50[0].threshold, 50);
  assert.equal(newlyUnlocked50[0].title, 'Halfway Hero');

  // 3. At 17 of 22 tasks (77%): unlocks 75% Power Finisher badge
  const eval77 = evaluateWeeklyMilestoneBadges({
    completedTasks: 17,
    totalTasks: 22,
  });
  assert.equal(eval77.currentPercentage, 77);
  assert.equal(eval77.unlockedCount, 3);
  assert.equal(eval77.highestUnlockedBadge?.threshold, 75);
  assert.equal(eval77.highestUnlockedBadge?.title, 'Power Finisher');
  assert.equal(eval77.nextMilestoneBadge?.threshold, 100);
  assert.equal(eval77.nextMilestoneBadge?.tasksRemainingToUnlock, 5);

  // 4. At 22 of 22 tasks (100%): unlocks 100% Week Champion badge, all 4 earned
  const eval100 = evaluateWeeklyMilestoneBadges({
    completedTasks: 22,
    totalTasks: 22,
  });
  assert.equal(eval100.currentPercentage, 100);
  assert.equal(eval100.unlockedCount, 4);
  assert.equal(eval100.highestUnlockedBadge?.threshold, 100);
  assert.equal(eval100.highestUnlockedBadge?.title, 'Week Champion');
  assert.equal(eval100.nextMilestoneBadge, null);

  // 5. Empty week (0 total tasks) locks all badges safely
  const evalEmpty = evaluateWeeklyMilestoneBadges({
    completedTasks: 0,
    totalTasks: 0,
  });
  assert.equal(evalEmpty.unlockedCount, 0);
  assert.equal(evalEmpty.badges[0].statusText, 'Add tasks to unlock');
});

test('custom task categories: addCustomCategory, removeCustomCategory, getCategoryBadgeStyle, cycleCategory, inline #customtag parsing, metrics, and persistence roundtrip', async () => {
  const {
    CATEGORY_COLOR_IDS,
    CUSTOM_CATEGORY_COLOR_PRESETS,
    addCustomCategory,
    removeCustomCategory,
    getAllCategories,
    getCategoryBadgeStyle,
    resetRuntimeCustomCategoriesForTest,
    setRuntimeCustomCategories,
    parseQuickTaskTag,
    countTasksByCategory,
    syncDailyTaskCategory,
    syncDetailedTaskCategory,
  } = await import('./todoLogic');

  resetRuntimeCustomCategoriesForTest();
  assert.equal(CATEGORY_COLOR_IDS.length, 8);
  assert.equal(Object.keys(CUSTOM_CATEGORY_COLOR_PRESETS).length, 8);

  // 1. Add custom categories with explicit color presets
  const step1 = addCustomCategory([], 'Design', 'indigo');
  assert.ok(step1.addedCategory);
  assert.equal(step1.addedCategory?.name, 'Design');
  assert.equal(step1.addedCategory?.colorId, 'indigo');
  assert.equal(step1.nextCustomCategories.length, 1);

  const step2 = addCustomCategory(
    step1.nextCustomCategories,
    '#Urgent',
    'rose'
  );
  assert.ok(step2.addedCategory);
  assert.equal(step2.addedCategory?.name, 'Urgent');
  assert.equal(step2.addedCategory?.colorId, 'rose');
  assert.equal(step2.nextCustomCategories.length, 2);

  // Updating an existing custom category updates its color preset without duplicating
  const updatedColor = addCustomCategory(
    step2.nextCustomCategories,
    'design',
    'teal'
  );
  assert.equal(updatedColor.nextCustomCategories.length, 2);
  assert.equal(updatedColor.addedCategory?.colorId, 'teal');

  const builtInDup = addCustomCategory(
    step2.nextCustomCategories,
    'Work',
    'amber'
  );
  assert.equal(builtInDup.addedCategory, null);

  // 2. getAllCategories & cycleCategory include custom categories
  const customList = step2.nextCustomCategories;
  const allCats = getAllCategories(customList);
  assert.deepEqual(allCats, [
    'Work',
    'Personal',
    'Health',
    'Finance',
    'Home',
    'Growth',
    'Design',
    'Urgent',
  ]);
  assert.equal(cycleCategory('Growth', customList), 'Design');
  assert.equal(cycleCategory('Design', customList), 'Urgent');
  assert.equal(cycleCategory('Urgent', customList), 'Work');

  // 3. getCategoryBadgeStyle returns custom color palette
  const designStyle = getCategoryBadgeStyle('Design', customList);
  const indigoPreset = CUSTOM_CATEGORY_COLOR_PRESETS.indigo;
  assert.equal(designStyle.bg, indigoPreset.bg);
  assert.equal(designStyle.text, indigoPreset.text);
  assert.equal(designStyle.border, indigoPreset.border);

  // 4. syncDailyTaskCategory and syncDetailedTaskCategory support explicit custom category
  const cols = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();
  const syncedDaily = syncDailyTaskCategory(
    cols,
    detailed,
    'mon',
    'mon-3',
    'Design',
    customList
  );
  assert.equal(syncedDaily.nextColumns[0].tasks[2].category, 'Design');
  assert.equal(syncedDaily.nextDetailedTasks[0].category, 'Design');

  const syncedDetailed = syncDetailedTaskCategory(
    syncedDaily.nextDetailedTasks,
    syncedDaily.nextColumns,
    'dt-1',
    'Urgent',
    customList
  );
  assert.equal(syncedDetailed.nextDetailedTasks[0].category, 'Urgent');
  assert.equal(syncedDetailed.nextColumns[0].tasks[2].category, 'Urgent');

  // 5. countTasksByCategory and calculateDashboardMetrics include custom categories
  const counts = countTasksByCategory(
    syncedDetailed.nextDetailedTasks,
    customList
  );
  assert.equal(counts.Urgent, 1);
  assert.equal(counts.Design, 0);

  const metrics = calculateDashboardMetrics(
    syncedDetailed.nextColumns,
    syncedDetailed.nextDetailedTasks,
    customList
  );
  assert.ok(metrics.byCategory.Urgent >= 1);

  // 6. Inline #customtag parsing registers custom category automatically
  setRuntimeCustomCategories(customList);
  const inlineParsed = parseQuickTaskTag(
    'Prepare sprint demo deck #marketing #weekly'
  );
  assert.equal(inlineParsed.cleanText, 'Prepare sprint demo deck');
  assert.equal(inlineParsed.category, 'Marketing');
  assert.equal(inlineParsed.recurring, 'weekly');
  assert.equal(inlineParsed.hadInlineTag, true);
  assert.equal(isValidCategory('Marketing'), true);

  // 7. Persistence roundtrip preserves customCategories and task custom categories
  const rawSaved = JSON.stringify({
    columns: syncedDetailed.nextColumns,
    detailedTasks: syncedDetailed.nextDetailedTasks,
    monthlyGoals: [],
    yearlyGoals: [],
    archivedTasks: [],
    activeTheme: 'terracotta',
    customCategories: customList,
  });
  const restored = parsePersistedDashboardState(rawSaved);
  assert.equal(restored.customCategories.length, 2);
  assert.equal(restored.customCategories[0].name, 'Design');
  assert.equal(restored.customCategories[0].colorId, 'indigo');
  assert.equal(restored.columns[0].tasks[2].category, 'Urgent');
  assert.equal(restored.detailedTasks[0].category, 'Urgent');

  // 8. removeCustomCategory removes a custom tag cleanly
  const afterRemove = removeCustomCategory(customList, 'Design');
  assert.equal(afterRemove.length, 1);
  assert.equal(afterRemove[0].name, 'Urgent');

  resetRuntimeCustomCategoriesForTest();
});
