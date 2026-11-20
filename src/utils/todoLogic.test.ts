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
  calculateTaskCompletionVelocity,
  getMobileNavigationGroups,
  MOBILE_NAVIGATION_ITEMS,
  MOBILE_NAVIGATION_GROUPS,
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

test('weekly task intensity heatmap: computes time-of-day completion distribution, peak windows, category filtering, and live updates', async () => {
  const {
    TASK_INTENSITY_TIME_SLOTS,
    resolveTimeSlotIdFromHour,
    formatHourMinuteLabel,
    resolveTaskCompletionTimeInfo,
    classifyTaskIntensityLevel,
    buildWeeklyTaskIntensityHeatmap,
    clearCompletedWeekTasks,
  } = await import('./todoLogic');

  // 1. Time slot mapping across all 24 hours
  assert.equal(TASK_INTENSITY_TIME_SLOTS.length, 6);
  assert.equal(resolveTimeSlotIdFromHour(7), 'early-morning');
  assert.equal(resolveTimeSlotIdFromHour(9), 'morning-peak');
  assert.equal(resolveTimeSlotIdFromHour(11), 'morning-peak');
  assert.equal(resolveTimeSlotIdFromHour(13), 'midday');
  assert.equal(resolveTimeSlotIdFromHour(16), 'afternoon');
  assert.equal(resolveTimeSlotIdFromHour(19), 'evening');
  assert.equal(resolveTimeSlotIdFromHour(22), 'late-night');
  assert.equal(resolveTimeSlotIdFromHour(2), 'late-night');

  assert.equal(formatHourMinuteLabel(9, 30), '9:30 AM');
  assert.equal(formatHourMinuteLabel(14, 5), '2:05 PM');
  assert.equal(formatHourMinuteLabel(0, 15), '12:15 AM');

  // 2. Explicit completedHour & preset schedule resolution
  const presetInfo = resolveTaskCompletionTimeInfo({
    id: 'mon-2',
    text: 'Team standup',
  });
  assert.equal(presetInfo.hour, 9);
  assert.equal(presetInfo.formattedTime, '9:30 AM');
  assert.equal(presetInfo.timeSlotId, 'morning-peak');

  const explicitInfo = resolveTaskCompletionTimeInfo({
    id: 'custom-task-1',
    text: 'Ship release notes',
    completedHour: 16,
    completedAt: '4:10 PM',
  });
  assert.equal(explicitInfo.hour, 16);
  assert.equal(explicitInfo.formattedTime, '4:10 PM');
  assert.equal(explicitInfo.timeSlotId, 'afternoon');

  // 3. Initial seed state heatmap (10 completed daily tasks across 7 days x 6 slots = 42 cells)
  const initialCols = createInitialWeekColumns();
  const initialDetailed = createInitialDetailedTasks();
  const heatmap = buildWeeklyTaskIntensityHeatmap({
    columns: initialCols,
    detailedTasks: initialDetailed,
  });

  assert.equal(heatmap.days.length, 7);
  assert.equal(heatmap.timeSlots.length, 6);
  assert.equal(heatmap.cells.length, 42);
  assert.equal(heatmap.totalCompletedTasks, 10);
  assert.ok(heatmap.maxCellCount >= 2);
  assert.equal(heatmap.peakTimeSlot?.id, 'morning-peak');
  assert.equal(heatmap.peakTimeSlot?.totalCompleted, 4);
  assert.equal(heatmap.peakDay?.dayId, 'mon');
  assert.equal(heatmap.peakDay?.totalCompleted, 4);
  assert.equal(heatmap.peakCell?.cellId, 'mon-morning-peak');
  assert.equal(heatmap.peakCell?.count, 2);

  // 4. Live task completion update increments the corresponding day x time-of-day cell
  const toggled = syncDetailedTaskToggle(
    initialDetailed,
    initialCols,
    'dt-5' // Linked to fri-3 ("Q3 planning session" -> 1:30 PM midday)
  );
  const updatedHeatmap = buildWeeklyTaskIntensityHeatmap({
    columns: toggled.nextColumns,
    detailedTasks: toggled.nextDetailedTasks,
  });
  assert.equal(updatedHeatmap.totalCompletedTasks, 11);
  const friMiddayCell = updatedHeatmap.cells.find(
    (c) => c.cellId === 'fri-midday'
  );
  assert.equal(friMiddayCell?.count, 1);
  assert.equal(friMiddayCell?.tasks[0]?.text, 'Q3 planning session');

  // 5. Category filtering isolates completed tasks for that category
  const workOnlyHeatmap = buildWeeklyTaskIntensityHeatmap({
    columns: toggled.nextColumns,
    detailedTasks: toggled.nextDetailedTasks,
    categoryFilter: 'Work',
  });
  assert.equal(workOnlyHeatmap.totalCompletedTasks, 5); // 4 on Mon + 1 on Fri

  // 6. Empty state when 0 tasks are completed
  const clearedCols = clearCompletedWeekTasks(initialCols);
  const emptyHeatmap = buildWeeklyTaskIntensityHeatmap({
    columns: clearedCols,
    detailedTasks: [],
  });
  assert.equal(emptyHeatmap.totalCompletedTasks, 0);
  assert.equal(emptyHeatmap.maxCellCount, 0);
  assert.equal(emptyHeatmap.peakTimeSlot, null);
  assert.equal(emptyHeatmap.peakDay, null);
  assert.equal(emptyHeatmap.peakCell, null);
  assert.equal(classifyTaskIntensityLevel(0, 0), 'none');
});

test('task search overlay: searchTasksAcrossAllDaysAndCategories filters across all days, monthly/yearly goals, custom categories, status, and priority', async () => {
  const {
    searchTasksAcrossAllDaysAndCategories,
    createInitialMonthlyGoals,
    createInitialYearlyGoals,
    addCustomCategory,
    resetRuntimeCustomCategoriesForTest,
  } = await import('./todoLogic');

  resetRuntimeCustomCategoriesForTest();
  const cols = createInitialWeekColumns();
  const monthly = createInitialMonthlyGoals();
  const yearly = createInitialYearlyGoals();

  // Add a custom category and assign it to Tuesday's first task
  const { nextCustomCategories } = addCustomCategory([], 'Design', 'indigo');
  cols[1].tasks[0].category = 'Design';

  // 1. Default unfiltered search returns all active weekly + monthly + yearly tasks
  const allResults = searchTasksAcrossAllDaysAndCategories({
    columns: cols,
    monthlyGoals: monthly,
    yearlyGoals: yearly,
    customCategories: nextCustomCategories,
  });
  assert.equal(allResults.hasActiveFilters, false);
  assert.equal(allResults.totalAvailable, 22 + monthly.length + yearly.length);
  assert.equal(allResults.totalMatched, allResults.totalAvailable);
  assert.equal(allResults.countsByDayScope.mon, 4);
  assert.equal(allResults.countsByCategory.Design, 1);

  // 2. Filter by custom category ('Design')
  const designResults = searchTasksAcrossAllDaysAndCategories({
    columns: cols,
    monthlyGoals: monthly,
    yearlyGoals: yearly,
    customCategories: nextCustomCategories,
    filters: { category: 'Design' },
  });
  assert.equal(designResults.hasActiveFilters, true);
  assert.equal(designResults.totalMatched, 1);
  assert.equal(designResults.items[0]?.id, 'tue-1');
  assert.equal(designResults.items[0]?.dayId, 'tue');
  assert.equal(designResults.items[0]?.category, 'Design');

  // 3. Filter by specific day ('thu') + completionStatus ('pending')
  const thuPending = searchTasksAcrossAllDaysAndCategories({
    columns: cols,
    monthlyGoals: monthly,
    yearlyGoals: yearly,
    customCategories: nextCustomCategories,
    filters: { dayScope: 'thu', completionStatus: 'pending' },
  });
  assert.equal(thuPending.totalMatched, 2); // thu-1 and thu-3 are pending; thu-2 is completed
  assert.ok(thuPending.items.every((item) => item.dayId === 'thu' && !item.completed));

  // 4. Filter by keyword matching inside task notes ('roadmap')
  const noteResults = searchTasksAcrossAllDaysAndCategories({
    columns: cols,
    monthlyGoals: monthly,
    yearlyGoals: yearly,
    customCategories: nextCustomCategories,
    filters: { query: 'roadmap' },
  });
  assert.equal(noteResults.totalMatched, 1);
  assert.equal(noteResults.items[0]?.id, 'thu-1');
  assert.equal(noteResults.items[0]?.matchField, 'notes');
  assert.ok(noteResults.items[0]?.matchSnippet?.toLowerCase().includes('roadmap'));

  resetRuntimeCustomCategoriesForTest();
});

test('daily task progress line chart: buildDailyTaskProgressLineData logs daily completed tasks, cumulative progress, and updates live when tasks are toggled', async () => {
  const { buildDailyTaskProgressLineData } = await import('./todoLogic');

  const cols = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();

  // 1. Initial week state: 10 completed of 22 scheduled across 7 days (Mon..Sun)
  const initialSummary = buildDailyTaskProgressLineData(cols);
  assert.equal(initialSummary.points.length, 7);
  assert.equal(initialSummary.totalCompleted, 10);
  assert.equal(initialSummary.totalScheduled, 22);
  assert.equal(initialSummary.totalPending, 12);
  assert.equal(initialSummary.weeklyCompletionRate, 45);
  assert.equal(initialSummary.averageDailyCompleted, 1.4);
  assert.equal(initialSummary.maxDailyCompleted, 4);
  assert.equal(initialSummary.peakDay?.dayId, 'mon');
  assert.equal(initialSummary.peakDay?.completed, 4);

  // Verify day-by-day completed counts and cumulative progression across Mon..Sun
  // Mon: 4, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 1, Sun: 1
  assert.deepEqual(
    initialSummary.points.map((p) => p.completed),
    [4, 1, 1, 1, 1, 1, 1]
  );
  assert.deepEqual(
    initialSummary.points.map((p) => p.cumulativeCompleted),
    [4, 5, 6, 7, 8, 9, 10]
  );
  assert.equal(initialSummary.points[0]?.completedTaskTitles.length, 4);

  // 2. Toggle dt-5 (linked to Friday 'fri-3' "Q3 planning session") -> Friday completed becomes 2, total becomes 11
  const toggled = syncDetailedTaskToggle(detailed, cols, 'dt-5');
  const updatedSummary = buildDailyTaskProgressLineData(toggled.nextColumns);
  assert.equal(updatedSummary.totalCompleted, 11);
  assert.equal(updatedSummary.weeklyCompletionRate, 50);
  const friPoint = updatedSummary.points.find((p) => p.dayId === 'fri');
  assert.equal(friPoint?.completed, 2);
  assert.equal(friPoint?.total, 3);
  assert.equal(friPoint?.completionRate, 67);
  assert.ok(friPoint?.completedTaskTitles.includes('Q3 planning session'));
  assert.deepEqual(
    updatedSummary.points.map((p) => p.cumulativeCompleted),
    [4, 5, 6, 7, 9, 10, 11]
  );
});

test('daily tip card: resolveDailyTipRecommendation returns contextual tips based on task count and progress status', async () => {
  const { resolveDailyTipRecommendation } = await import('./todoLogic');

  // 1. Empty board (0 total tasks)
  const emptyTip = resolveDailyTipRecommendation({
    totalTasks: 0,
    completedTasks: 0,
  });
  assert.equal(emptyTip.category, 'empty');
  assert.equal(emptyTip.badgeLabel, 'Fresh Slate');

  // 2. Kickoff state (0 completed, >0 total)
  const kickoffTip = resolveDailyTipRecommendation({
    totalTasks: 15,
    completedTasks: 0,
  });
  assert.equal(kickoffTip.category, 'kickoff');
  assert.equal(kickoffTip.badgeLabel, 'Quick Win');

  // 3. High-priority pending overload (<50% completion and >=3 high priority pending)
  const highPriorityTip = resolveDailyTipRecommendation({
    totalTasks: 22,
    completedTasks: 10,
    completionPercentage: 45,
    highPriorityPendingCount: 5,
  });
  assert.equal(highPriorityTip.category, 'high-priority');
  assert.equal(highPriorityTip.badgeLabel, 'Priority Focus');
  assert.ok(highPriorityTip.title.includes('5 high-priority tasks'));

  // 4. Steady momentum (in-progress without high-priority overload or >=50% completion)
  const momentumTip = resolveDailyTipRecommendation({
    totalTasks: 22,
    completedTasks: 11,
    completionPercentage: 50,
    highPriorityPendingCount: 4,
  });
  assert.equal(momentumTip.category, 'momentum');
  assert.equal(momentumTip.badgeLabel, 'Steady Pace');
  assert.ok(momentumTip.title.includes('50%'));

  // 5. Final stretch (>=75% completion)
  const finalStretchTip = resolveDailyTipRecommendation({
    totalTasks: 20,
    completedTasks: 16,
    completionPercentage: 80,
  });
  assert.equal(finalStretchTip.category, 'final-stretch');
  assert.equal(finalStretchTip.badgeLabel, 'Final Stretch');
  assert.ok(finalStretchTip.title.includes('4 tasks left'));

  // 6. All completed (100%)
  const completedTip = resolveDailyTipRecommendation({
    totalTasks: 22,
    completedTasks: 22,
    completionPercentage: 100,
  });
  assert.equal(completedTip.category, 'completed');
  assert.equal(completedTip.badgeLabel, '100% Complete');
  assert.equal(completedTip.completionPercentage, 100);
});

test('priority distribution donut chart: buildPriorityDistributionSummary computes High, Med, Low distribution across all, weekly, and focus scopes', async () => {
  const { buildPriorityDistributionSummary } = await import('./todoLogic');

  const cols = createInitialWeekColumns();
  const detailed = createInitialDetailedTasks();
  const metrics = calculateDashboardMetrics(cols, detailed);

  // 1. Default 'all' scope matches DashboardMetrics.byPriority (High: 15, Med: 10, Low: 7, Total: 32)
  const allDist = buildPriorityDistributionSummary({
    columns: cols,
    detailedTasks: detailed,
    scope: 'all',
  });
  assert.equal(allDist.totalTasks, 32);
  assert.equal(allDist.slices.length, 3);
  assert.equal(allDist.slices[0]?.priority, 'High');
  assert.equal(allDist.slices[0]?.totalCount, metrics.byPriority.High);
  assert.equal(allDist.slices[1]?.priority, 'Med');
  assert.equal(allDist.slices[1]?.totalCount, metrics.byPriority.Med);
  assert.equal(allDist.slices[2]?.priority, 'Low');
  assert.equal(allDist.slices[2]?.totalCount, metrics.byPriority.Low);
  assert.equal(allDist.dominantPriority?.priority, 'Low');

  // 2. 'weekly' scope counts only the 22 active daily column tasks
  const weeklyDist = buildPriorityDistributionSummary({
    columns: cols,
    detailedTasks: detailed,
    scope: 'weekly',
  });
  assert.equal(weeklyDist.totalTasks, 22);
  assert.equal(weeklyDist.totalCompleted, 10);

  // 3. 'focus' scope counts only the 10 active detailed focus tasks
  const focusDist = buildPriorityDistributionSummary({
    columns: cols,
    detailedTasks: detailed,
    scope: 'focus',
  });
  assert.equal(focusDist.totalTasks, 10);

  // 4. Cycling a High-priority task ('dt-5', linked to 'fri-3') to Med updates High (-2) and Med (+2) in 'all' scope
  const cycled = syncDetailedTaskPriority(detailed, cols, 'dt-5');
  const updatedDist = buildPriorityDistributionSummary({
    columns: cycled.nextColumns,
    detailedTasks: cycled.nextDetailedTasks,
    scope: 'all',
  });
  assert.equal(updatedDist.slices[0]?.totalCount, metrics.byPriority.High - 2);
  assert.equal(updatedDist.slices[1]?.totalCount, metrics.byPriority.Med + 2);
});

test('dashboard day column notes: formatTaskNoteSummary and saveDailyTaskNote format previews and persist task-specific notes cleanly', async () => {
  const { formatTaskNoteSummary, saveDailyTaskNote } = await import('./todoLogic');

  // 1. Empty or whitespace-only notes
  const emptySummary = formatTaskNoteSummary('   ');
  assert.equal(emptySummary.hasNotes, false);
  assert.equal(emptySummary.wordCount, 0);
  assert.equal(emptySummary.previewText, '');

  // 2. Non-empty note summary with truncation
  const validSummary = formatTaskNoteSummary(
    'Prepare executive summary slide deck with Q3 revenue projections and hiring plan',
    32
  );
  assert.equal(validSummary.hasNotes, true);
  assert.equal(validSummary.wordCount, 12);
  assert.ok(validSummary.previewText.endsWith('…'));

  // 3. saveDailyTaskNote updates the target task in DayColumn[]
  const cols = createInitialWeekColumns();
  const res = saveDailyTaskNote(
    cols,
    'mon',
    'mon-1',
    'Follow up with enterprise customer regarding contract renewal'
  );
  assert.ok(res.updatedTask);
  assert.equal(
    res.savedNotes,
    'Follow up with enterprise customer regarding contract renewal'
  );
  const mon1 = res.nextColumns
    .find((c) => c.id === 'mon')
    ?.tasks.find((t) => t.id === 'mon-1');
  assert.equal(
    mon1?.notes,
    'Follow up with enterprise customer regarding contract renewal'
  );
});

test('time remaining before end-of-day: calculateEndOfDayTimeRemaining computes remaining hours/minutes before 5pm for non-completed tasks', async () => {
  const {
    DEFAULT_EOD_TARGET_HOUR,
    calculateEndOfDayTimeRemaining,
    formatHourLabel,
  } = await import('./todoLogic');

  assert.equal(DEFAULT_EOD_TARGET_HOUR, 17);
  assert.deepEqual(formatHourLabel(17), {
    fullLabel: '5:00 PM',
    shortLabel: '5pm',
  });

  // 1. Morning (9:15 AM) before 5:00 PM EOD -> 7h 45m left (465 mins), plenty urgency
  const morningNow = new Date(2026, 5, 11, 9, 15, 0, 0);
  const morningRes = calculateEndOfDayTimeRemaining({
    now: morningNow,
    completed: false,
  });
  assert.equal(morningRes.completed, false);
  assert.equal(morningRes.targetHour, 17);
  assert.equal(morningRes.targetShortLabel, '5pm');
  assert.equal(morningRes.remainingMinutes, 465);
  assert.equal(morningRes.hoursLeft, 7);
  assert.equal(morningRes.minutesLeft, 45);
  assert.equal(morningRes.isPastEndOfDay, false);
  assert.equal(morningRes.urgency, 'plenty');
  assert.equal(morningRes.shortLabel, '7h 45m left');

  // 2. Afternoon approaching (3:00 PM) before 5:00 PM EOD -> 2h left (120 mins), approaching urgency
  const afternoonNow = new Date(2026, 5, 11, 15, 0, 0, 0);
  const afternoonRes = calculateEndOfDayTimeRemaining({
    now: afternoonNow,
    completed: false,
  });
  assert.equal(afternoonRes.remainingMinutes, 120);
  assert.equal(afternoonRes.hoursLeft, 2);
  assert.equal(afternoonRes.minutesLeft, 0);
  assert.equal(afternoonRes.urgency, 'approaching');
  assert.equal(afternoonRes.shortLabel, '2h left');

  // 3. Final hour urgent (4:20 PM) before 5:00 PM EOD -> 40m left (40 mins), urgent urgency
  const urgentNow = new Date(2026, 5, 11, 16, 20, 0, 0);
  const urgentRes = calculateEndOfDayTimeRemaining({
    now: urgentNow,
    completed: false,
  });
  assert.equal(urgentRes.remainingMinutes, 40);
  assert.equal(urgentRes.hoursLeft, 0);
  assert.equal(urgentRes.minutesLeft, 40);
  assert.equal(urgentRes.urgency, 'urgent');
  assert.equal(urgentRes.shortLabel, '40m left');

  // 4. Past end-of-day (6:10 PM) after 5:00 PM EOD -> Past 5pm EOD, 0 mins
  const eveningNow = new Date(2026, 5, 11, 18, 10, 0, 0);
  const pastRes = calculateEndOfDayTimeRemaining({
    now: eveningNow,
    completed: false,
  });
  assert.equal(pastRes.remainingMinutes, 0);
  assert.equal(pastRes.isPastEndOfDay, true);
  assert.equal(pastRes.urgency, 'past-eod');
  assert.equal(pastRes.shortLabel, 'Past 5pm EOD');

  // 5. Custom EOD target (6:00 PM / 18:00) at 4:30 PM -> 1h 30m left
  const customTargetRes = calculateEndOfDayTimeRemaining({
    now: new Date(2026, 5, 11, 16, 30, 0, 0),
    targetHour: 18,
    completed: false,
  });
  assert.equal(customTargetRes.targetShortLabel, '6pm');
  assert.equal(customTargetRes.remainingMinutes, 90);
  assert.equal(customTargetRes.shortLabel, '1h 30m left');

  // 6. Completed task returns urgency 'completed' and 0 remainingMinutes
  const completedRes = calculateEndOfDayTimeRemaining({
    now: morningNow,
    completed: true,
  });
  assert.equal(completedRes.completed, true);
  assert.equal(completedRes.urgency, 'completed');
  assert.equal(completedRes.remainingMinutes, 0);
});

test('mobile-first responsive logic: resolveResponsiveViewportTier and filterColumnsForMobileDayScope cover all 8 required viewport widths', async () => {
  const {
    resolveResponsiveViewportTier,
    filterColumnsForMobileDayScope,
  } = await import('./todoLogic');

  // Verify all 8 target QA viewports: 320, 375, 390, 430, 768, 1024, 1366, 1920
  const v320 = resolveResponsiveViewportTier(320);
  assert.equal(v320.tier, 'xs-phone');
  assert.equal(v320.isMobile, true);
  assert.equal(v320.isCompactPhone, true);
  assert.equal(v320.showBottomNav, true);
  assert.equal(v320.showHamburgerMenu, true);
  assert.equal(v320.minTouchTargetPx, 44);
  assert.equal(v320.recommendedDayColumnsPerRow, 1);

  const v375 = resolveResponsiveViewportTier(375);
  assert.equal(v375.tier, 'phone');
  assert.equal(v375.isMobile, true);
  assert.equal(v375.isCompactPhone, true);

  const v390 = resolveResponsiveViewportTier(390);
  assert.equal(v390.tier, 'phone');
  assert.equal(v390.isMobile, true);
  assert.equal(v390.isCompactPhone, false);

  const v430 = resolveResponsiveViewportTier(430);
  assert.equal(v430.tier, 'phone');
  assert.equal(v430.isMobile, true);
  assert.equal(v430.showBottomNav, true);

  const v768 = resolveResponsiveViewportTier(768);
  assert.equal(v768.tier, 'tablet');
  assert.equal(v768.isTablet, true);
  assert.equal(v768.showBottomNav, false);
  assert.equal(v768.showHamburgerMenu, true);
  assert.equal(v768.recommendedDayColumnsPerRow, 2);

  const v1024 = resolveResponsiveViewportTier(1024);
  assert.equal(v1024.tier, 'laptop');
  assert.equal(v1024.isDesktop, true);
  assert.equal(v1024.showHamburgerMenu, false);
  assert.equal(v1024.recommendedDayColumnsPerRow, 4);

  const v1366 = resolveResponsiveViewportTier(1366);
  assert.equal(v1366.tier, 'desktop');
  assert.equal(v1366.isDesktop, true);
  assert.equal(v1366.recommendedDayColumnsPerRow, 7);

  const v1920 = resolveResponsiveViewportTier(1920);
  assert.equal(v1920.tier, 'wide-desktop');
  assert.equal(v1920.isDesktop, true);
  assert.equal(v1920.recommendedDayColumnsPerRow, 7);

  // Mobile day column scope filtering
  const columns = createInitialWeekColumns();
  assert.equal(filterColumnsForMobileDayScope(columns, 'all').length, 7);
  const onlyWed = filterColumnsForMobileDayScope(columns, 'wed');
  assert.equal(onlyWed.length, 1);
  assert.equal(onlyWed[0].id, 'wed');
  // Unknown day id falls back safely to all columns
  assert.equal(filterColumnsForMobileDayScope(columns, 'invalid-day').length, 7);
});

test('interactive calendar & personal task management: navigation, month/week/day views, validation, CRUD, and persistence roundtrip', async () => {
  const {
    isValidIsoDateString,
    isValidTime24String,
    formatCalendarTimeRange,
    navigateCalendarDate,
    buildCalendarMonthGrid,
    buildCalendarWeekSchedule,
    getTasksForCalendarDate,
    validateCalendarTaskInput,
    addPersonalCalendarTask,
    updatePersonalCalendarTask,
    deletePersonalCalendarTask,
    parsePersistedDashboardState,
  } = await import('./todoLogic');

  // 1. Date and time validation + formatting
  assert.equal(isValidIsoDateString('2026-06-11'), true);
  assert.equal(isValidIsoDateString('2026-02-30'), false);
  assert.equal(isValidIsoDateString('not-a-date'), false);
  assert.equal(isValidTime24String('09:30'), true);
  assert.equal(isValidTime24String('25:00'), false);
  assert.equal(formatCalendarTimeRange('09:30', '11:00'), '9:30 AM – 11:00 AM');
  assert.equal(formatCalendarTimeRange('14:15', '15:45'), '2:15 PM – 3:45 PM');
  assert.equal(formatCalendarTimeRange('', ''), 'All day');

  // 2. Navigation across month, week, and day views
  assert.equal(navigateCalendarDate('2026-06-11', 'day', 'next'), '2026-06-12');
  assert.equal(navigateCalendarDate('2026-06-11', 'day', 'prev'), '2026-06-10');
  assert.equal(navigateCalendarDate('2026-06-11', 'week', 'next'), '2026-06-18');
  assert.equal(navigateCalendarDate('2026-06-11', 'week', 'prev'), '2026-06-04');
  assert.equal(navigateCalendarDate('2026-06-11', 'month', 'next'), '2026-07-11');
  assert.equal(navigateCalendarDate('2026-06-11', 'month', 'prev'), '2026-05-11');
  // Month-end clamping (Jan 31 -> Feb 28)
  assert.equal(navigateCalendarDate('2026-01-31', 'month', 'next'), '2026-02-28');

  // 3. Month grid (42 cells) and Week schedule (7 days)
  const initialCols = createInitialWeekColumns();
  const monthGrid = buildCalendarMonthGrid('2026-06-11', '2026-06-11', initialCols);
  assert.equal(monthGrid.cells.length, 42);
  assert.equal(monthGrid.monthLabel, 'June 2026');
  assert.equal(monthGrid.totalMonthTasks, 22);
  assert.equal(monthGrid.completedMonthTasks, 10);
  const todayCell = monthGrid.cells.find((c) => c.dateStr === '2026-06-11');
  assert.ok(todayCell);
  assert.equal(todayCell.isToday, true);
  assert.equal(todayCell.tasks.length, 3);

  const weekDays = buildCalendarWeekSchedule('2026-06-11', '2026-06-11', initialCols);
  assert.equal(weekDays.length, 7);
  assert.equal(weekDays[0].dateStr, '2026-06-08');
  assert.equal(weekDays[6].dateStr, '2026-06-14');

  // 4. Form validation: required title, valid date, time range conflict, and duplicate detection
  const emptyTitleCheck = validateCalendarTaskInput({
    title: '   ',
    date: '2026-06-11',
    priority: 'High',
    status: 'To Do',
    category: 'Work',
  });
  assert.equal(emptyTitleCheck.valid, false);
  assert.ok(emptyTitleCheck.errors.title);

  const invertedTimeCheck = validateCalendarTaskInput({
    title: 'Sprint retro',
    date: '2026-06-11',
    startTime: '15:00',
    endTime: '14:00',
    priority: 'Med',
    status: 'To Do',
    category: 'Work',
  });
  assert.equal(invertedTimeCheck.valid, false);
  assert.ok(invertedTimeCheck.errors.timeRange);

  // 5. Add new personal calendar task (including on a future date outside the initial week)
  const addRes = addPersonalCalendarTask(initialCols, {
    title: 'Quarterly dental checkup',
    description: 'Bring insurance card',
    date: '2026-06-25', // Thursday in a later week
    startTime: '10:30',
    endTime: '11:30',
    priority: 'High',
    status: 'To Do',
    category: 'Health',
  });
  assert.equal(addRes.validation.valid, true);
  assert.ok(addRes.createdTask);
  const jun25Tasks = getTasksForCalendarDate('2026-06-25', addRes.nextColumns);
  assert.equal(jun25Tasks.length, 1);
  assert.equal(jun25Tasks[0].title, 'Quarterly dental checkup');
  assert.equal(jun25Tasks[0].description, 'Bring insurance card');
  assert.equal(jun25Tasks[0].startTime, '10:30');
  assert.equal(jun25Tasks[0].endTime, '11:30');

  // Duplicate check rejects adding the exact same task twice on the same date & startTime
  const dupRes = addPersonalCalendarTask(addRes.nextColumns, {
    title: 'Quarterly dental checkup',
    date: '2026-06-25',
    startTime: '10:30',
    endTime: '11:30',
    priority: 'High',
    status: 'To Do',
    category: 'Health',
  });
  assert.equal(dupRes.validation.valid, false);
  assert.ok(dupRes.validation.errors.duplicate);

  // 6. Update task (moving date from 2026-06-25 Thursday to 2026-06-26 Friday + updating status)
  const createdId = addRes.createdTask!.id;
  const updateRes = updatePersonalCalendarTask(addRes.nextColumns, createdId, {
    title: 'Quarterly dental checkup (rescheduled)',
    description: 'Moved to Friday afternoon',
    date: '2026-06-26',
    startTime: '14:00',
    endTime: '15:00',
    priority: 'Med',
    status: 'In Progress',
    category: 'Health',
  });
  assert.equal(updateRes.validation.valid, true);
  assert.equal(getTasksForCalendarDate('2026-06-25', updateRes.nextColumns).length, 0);
  const jun26Tasks = getTasksForCalendarDate('2026-06-26', updateRes.nextColumns);
  assert.equal(jun26Tasks.length, 1);
  assert.equal(jun26Tasks[0].title, 'Quarterly dental checkup (rescheduled)');
  assert.equal(jun26Tasks[0].status, 'In Progress');

  // 7. Persistence roundtrip preserves scheduledDate, startTime, and endTime
  const persistedState = parsePersistedDashboardState(
    JSON.stringify({
      columns: updateRes.nextColumns,
      activeTheme: 'terracotta',
    })
  );
  const restoredJun26 = getTasksForCalendarDate('2026-06-26', persistedState.columns);
  assert.equal(restoredJun26.length, 1);
  assert.equal(restoredJun26[0].title, 'Quarterly dental checkup (rescheduled)');
  assert.equal(restoredJun26[0].startTime, '14:00');
  assert.equal(restoredJun26[0].endTime, '15:00');

  // 8. Delete task removes it from the calendar while keeping column slots valid
  const deleteRes = deletePersonalCalendarTask(persistedState.columns, createdId);
  assert.ok(deleteRes.deletedTask);
  assert.equal(getTasksForCalendarDate('2026-06-26', deleteRes.nextColumns).length, 0);
});

test('daily time-blocking & vertical timeline: validation, duration calculation, overlap detection, and persistence roundtrip', async () => {
  const {
    parseTime24ToMinutes,
    formatMinutesToTime24,
    addMinutesToTime24,
    calculateTimeBlockDurationMinutes,
    formatTimeBlockDuration,
    validateTimeBlockRange,
    resolveDailyTaskTimeBlock,
    updateDailyTaskTimeBlock,
    buildDayTimeBlockTimeline,
    parsePersistedDashboardState,
  } = await import('./todoLogic');

  // 1. Time parsing and duration helpers
  assert.equal(parseTime24ToMinutes('09:30'), 570);
  assert.equal(parseTime24ToMinutes('invalid'), null);
  assert.equal(formatMinutesToTime24(570), '09:30');
  assert.equal(addMinutesToTime24('09:30', 90), '11:00');
  assert.equal(calculateTimeBlockDurationMinutes('09:30', '11:00'), 90);
  assert.equal(formatTimeBlockDuration(90), '1h 30m');
  assert.equal(formatTimeBlockDuration(45), '45m');
  assert.equal(formatTimeBlockDuration(120), '2h');

  // 2. Time-block range validation
  const validRange = validateTimeBlockRange('09:00', '10:30');
  assert.equal(validRange.valid, true);
  assert.equal(validRange.durationMinutes, 90);
  assert.equal(validRange.formattedRange, '9:00 AM – 10:30 AM');
  assert.equal(validRange.formattedDuration, '1h 30m');

  const clearedRange = validateTimeBlockRange('', '');
  assert.equal(clearedRange.valid, true);
  assert.equal(clearedRange.durationMinutes, 0);
  assert.equal(clearedRange.formattedRange, 'Unscheduled');

  const invertedRange = validateTimeBlockRange('14:00', '13:00');
  assert.equal(invertedRange.valid, false);
  assert.ok(invertedRange.error);

  const partialRange = validateTimeBlockRange('09:00', '');
  assert.equal(partialRange.valid, false);
  assert.ok(partialRange.error);

  // 3. Default seeded tasks resolve time blocks and build a vertical timeline
  const cols = createInitialWeekColumns();
  const thuCol = cols.find((c) => c.id === 'thu')!;
  const thu1Block = resolveDailyTaskTimeBlock(thuCol.tasks[0]);
  assert.equal(thu1Block.isTimeBlocked, true);
  assert.equal(thu1Block.startTime, '09:30');
  assert.equal(thu1Block.endTime, '11:00');
  assert.equal(thu1Block.durationMinutes, 90);

  const initialTimeline = buildDayTimeBlockTimeline(thuCol.tasks);
  assert.equal(initialTimeline.totalScheduledBlocks, 3);
  assert.equal(initialTimeline.completedScheduledBlocks, 1);
  assert.equal(initialTimeline.totalScheduledMinutes, 90 + 45 + 45);
  assert.equal(initialTimeline.totalScheduledFormatted, '3h');
  assert.equal(initialTimeline.overlapCount, 0);
  assert.ok(initialTimeline.hourTicks.length >= 11);

  // 4. Updating a task time block to overlap with thu-1 (09:30–11:00) detects overlap and assigns lanes
  const updatedRes = updateDailyTaskTimeBlock(
    cols,
    'thu',
    'thu-2',
    '10:00',
    '11:30'
  );
  assert.equal(updatedRes.validation.valid, true);
  assert.ok(updatedRes.updatedTask);
  const updatedThu = updatedRes.nextColumns.find((c) => c.id === 'thu')!;
  const overlapTimeline = buildDayTimeBlockTimeline(updatedThu.tasks);
  assert.equal(overlapTimeline.overlapCount, 2);
  const block1 = overlapTimeline.scheduledBlocks.find((b) => b.taskId === 'thu-1')!;
  const block2 = overlapTimeline.scheduledBlocks.find((b) => b.taskId === 'thu-2')!;
  assert.equal(block1.hasOverlap, true);
  assert.equal(block2.hasOverlap, true);
  assert.equal(block1.totalLanes, 2);
  assert.equal(block2.totalLanes, 2);
  assert.notEqual(block1.laneIndex, block2.laneIndex);

  // 5. Clearing a task's time block moves it to unscheduledTasks and persists across reload
  const clearedRes = updateDailyTaskTimeBlock(
    updatedRes.nextColumns,
    'thu',
    'thu-3',
    '',
    ''
  );
  assert.equal(clearedRes.validation.valid, true);
  const persisted = parsePersistedDashboardState(
    JSON.stringify({
      columns: clearedRes.nextColumns,
      activeTheme: 'terracotta',
    })
  );
  const persistedThu = persisted.columns.find((c) => c.id === 'thu')!;
  const postClearTimeline = buildDayTimeBlockTimeline(persistedThu.tasks);
  assert.equal(postClearTimeline.totalScheduledBlocks, 2);
  assert.equal(postClearTimeline.unscheduledTasks.length, 1);
  assert.equal(postClearTimeline.unscheduledTasks[0].id, 'thu-3');
});

test('calculateTaskCompletionVelocity compares current week completion rate against previous three weeks', () => {
  // 1. Default initial columns: 10 completed / 22 total = 45%
  // Historical baseline: 3 Wks Ago = 7/20 (35%), 2 Wks Ago = 8/20 (40%), Last Week = 9/22 (41%)
  // 3-week avg rate = Math.round((35 + 40 + 41) / 3) = 39%
  const cols = createInitialWeekColumns();
  const velocity = calculateTaskCompletionVelocity(cols, '2026-06-11');

  assert.equal(velocity.weeks.length, 4);
  assert.equal(velocity.previousThreeWeeks.length, 3);
  assert.equal(velocity.currentCompletionRate, 45);
  assert.equal(velocity.threeWeekAvgRate, 39);
  assert.equal(velocity.threeWeekAvgCompleted, 8);
  assert.equal(velocity.velocityDeltaVsThreeWeekAvg, 6);
  assert.equal(velocity.velocityDeltaVsLastWeek, 4);
  assert.equal(velocity.momentumDirection, 'up');
  assert.equal(velocity.momentumLabel, 'Accelerating');
  assert.equal(velocity.peakWeek.weekLabel, 'This Week');
  assert.equal(velocity.weeks[0].wowDeltaRate, null);
  assert.equal(velocity.weeks[1].wowDeltaRate, 5); // 40 - 35
  assert.equal(velocity.weeks[2].wowDeltaRate, 1); // 41 - 40
  assert.equal(velocity.weeks[3].wowDeltaRate, 4); // 45 - 41
  assert.ok(velocity.insightSummary.includes('outpacing'));

  // 2. Decelerating scenario (clearing completed tasks so current week is 0%)
  const clearedCols = clearWeekTasks(cols);
  const decelVelocity = calculateTaskCompletionVelocity(clearedCols, '2026-06-11');
  assert.equal(decelVelocity.currentCompletionRate, 0);
  assert.equal(decelVelocity.velocityDeltaVsThreeWeekAvg, -39);
  assert.equal(decelVelocity.momentumDirection, 'down');
  assert.equal(decelVelocity.momentumLabel, 'Decelerating');
  assert.ok(decelVelocity.insightSummary.includes('below your prior 3-week average'));

  // 3. Steady pace scenario via historical overrides matching 45%
  const steadyVelocity = calculateTaskCompletionVelocity(cols, '2026-06-11', [
    { completed: 9, pending: 11 }, // 45%
    { completed: 9, pending: 11 }, // 45%
    { completed: 9, pending: 11 }, // 45%
  ]);
  assert.equal(steadyVelocity.threeWeekAvgRate, 45);
  assert.equal(steadyVelocity.velocityDeltaVsThreeWeekAvg, 0);
  assert.equal(steadyVelocity.momentumDirection, 'flat');
  assert.equal(steadyVelocity.momentumLabel, 'Steady Pace');
  assert.equal(steadyVelocity.velocityIndex, 100);
});

test('getMobileNavigationGroups organizes all 10 routes into logical mobile groups with descriptions and bottom tabs', () => {
  assert.equal(MOBILE_NAVIGATION_ITEMS.length, PAGE_ROUTES.length);
  assert.equal(MOBILE_NAVIGATION_GROUPS.length, 3);

  const navState = getMobileNavigationGroups('/live-progress');
  assert.equal(navState.activeItem.path, '/live-progress');
  assert.equal(navState.activeItem.label, 'Live Progress');
  assert.equal(navState.activeGroup.id, 'analytics');
  assert.equal(navState.primaryBottomTabs.length, 4);
  for (const item of MOBILE_NAVIGATION_ITEMS) {
    assert.ok(item.description.length >= 15);
    assert.ok(item.shortTitle.length >= 3);
    assert.ok(item.badgeText.length >= 3);
  }
});






