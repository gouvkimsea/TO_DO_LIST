import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDashboardStateChecksum,
  enqueueOfflineSyncChange,
  getOfflineSyncQueue,
  loadSnapshotFromIndexedDB,
  resetOfflineStorageForTests,
  resolveDashboardSyncConflict,
  saveRemoteBaseline,
  saveSnapshotToIndexedDB,
  synchronizePendingOfflineChanges,
} from './offlineStorage';
import { parsePersistedDashboardState } from './todoLogic';

function createSamplePayload(customMondayTaskText?: string) {
  const base = parsePersistedDashboardState(null);
  if (customMondayTaskText) {
    base.columns = base.columns.map((col, idx) =>
      idx === 0
        ? {
            ...col,
            tasks: col.tasks.map((t, tIdx) =>
              tIdx === 0 ? { ...t, text: customMondayTaskText } : t
            ),
          }
        : col
    );
  }
  return base;
}

test('offlineStorage: saveSnapshotToIndexedDB and loadSnapshotFromIndexedDB roundtrip with revision increment', async () => {
  await resetOfflineStorageForTests();
  const payload1 = createSamplePayload('Offline task alpha');
  const snap1 = await saveSnapshotToIndexedDB(payload1);
  assert.equal(snap1.revision, 1);
  assert.ok(snap1.checksum.startsWith('chk_'));

  // Saving identical payload keeps same revision
  const snapSame = await saveSnapshotToIndexedDB(payload1);
  assert.equal(snapSame.revision, 1);

  // Saving modified payload increments revision
  const payload2 = createSamplePayload('Offline task beta');
  const snap2 = await saveSnapshotToIndexedDB(payload2);
  assert.equal(snap2.revision, 2);

  const loaded = await loadSnapshotFromIndexedDB();
  assert.ok(loaded);
  assert.equal(loaded.revision, 2);
  assert.equal(loaded.payload.columns[0].tasks[0].text, 'Offline task beta');
});

test('offlineStorage: enqueueOfflineSyncChange deduplicates identical consecutive states and synchronizes when online', async () => {
  await resetOfflineStorageForTests();
  const payload1 = createSamplePayload('Queued offline edit 1');
  const first = await enqueueOfflineSyncChange(payload1, 'Edited task 1');
  assert.equal(first.deduplicated, false);
  assert.equal(first.queueLength, 1);

  // Enqueueing the exact same state is deduplicated to prevent duplicate submissions
  const duplicate = await enqueueOfflineSyncChange(payload1, 'Edited task 1 again');
  assert.equal(duplicate.deduplicated, true);
  assert.equal(duplicate.queueLength, 1);

  // Enqueueing a second distinct offline edit adds to queue
  const payload2 = createSamplePayload('Queued offline edit 2');
  const second = await enqueueOfflineSyncChange(payload2, 'Edited task 2');
  assert.equal(second.deduplicated, false);
  assert.equal(second.queueLength, 2);

  // If connection fails during sync, queue is preserved safely without data loss
  const failedSync = await synchronizePendingOfflineChanges({
    isOnlineCheck: () => false,
  });
  assert.equal(failedSync.status, 'failed');
  assert.equal(failedSync.remainingCount, 2);
  const queueAfterFail = await getOfflineSyncQueue();
  assert.equal(queueAfterFail.length, 2);
  assert.equal(queueAfterFail[0].status, 'failed');

  // When connection returns, pending changes synchronize and clear queue
  const successSync = await synchronizePendingOfflineChanges({
    isOnlineCheck: () => true,
  });
  assert.equal(successSync.status, 'synced');
  assert.equal(successSync.syncedCount, 2);
  assert.equal(successSync.remainingCount, 0);

  const queueAfterSuccess = await getOfflineSyncQueue();
  assert.equal(queueAfterSuccess.length, 0);
});

test('offlineStorage: resolveDashboardSyncConflict merges newer server baseline with local offline edits without overwriting newer data', async () => {
  await resetOfflineStorageForTests();
  const initial = createSamplePayload();

  // Remote baseline has a newly added task on Tuesday and a custom category 'RemoteTag'
  const remotePayload = structuredClone(initial);
  remotePayload.columns[1].tasks.push({
    id: 'remote-tue-extra',
    text: 'Server added Tuesday task',
    completed: true,
    completedAt: '2026-11-15T20:00:00.000Z',
    priority: 'High',
    status: 'Done',
    category: 'Work',
  });
  remotePayload.customCategories = [
    {
      name: 'RemoteTag',
      colorId: 'teal',
      bg: '#E3F2FD',
      text: '#1E5A8A',
      border: '#BBDEFB',
    },
  ];
  const remoteBaseline = await saveRemoteBaseline(remotePayload, 5);

  // Local offline payload edited Monday task 0 and added custom category 'LocalOfflineTag'
  const localPayload = createSamplePayload('Local offline Monday update');
  localPayload.customCategories = [
    {
      name: 'LocalOfflineTag',
      colorId: 'teal',
      bg: '#F3E8FF',
      text: '#6B21A8',
      border: '#E9D5FF',
    },
  ];

  const resolution = resolveDashboardSyncConflict(
    localPayload,
    '2026-11-15T21:00:00.000Z',
    remoteBaseline,
    1
  );

  assert.equal(resolution.hadConflict, true);
  assert.ok(resolution.conflictSummary);
  // Preserves local Monday edit
  assert.equal(
    resolution.resolvedPayload.columns[0].tasks[0].text,
    'Local offline Monday update'
  );
  // Preserves remote Tuesday added task
  assert.ok(
    resolution.resolvedPayload.columns[1].tasks.some(
      (t) => t.id === 'remote-tue-extra' && t.text === 'Server added Tuesday task'
    )
  );
  // Unions both custom categories
  const catNames = resolution.resolvedPayload.customCategories.map((c) => c.name);
  assert.ok(catNames.includes('RemoteTag'));
  assert.ok(catNames.includes('LocalOfflineTag'));
});
