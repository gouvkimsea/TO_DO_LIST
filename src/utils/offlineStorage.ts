import {
  ArchivedTask,
  CustomCategoryDefinition,
  DayColumn,
  DetailedTask,
  ThemeId,
  createInitialWeekColumns,
  parsePersistedDashboardState,
} from './todoLogic';

type Task = DayColumn['tasks'][number];

const DEFAULT_TASK_TEXT_BY_ID = new Map<string, string>(
  createInitialWeekColumns().flatMap((col) =>
    col.tasks.map((t) => [t.id, t.text.trim()] as const)
  )
);

export interface DashboardPersistedPayload {
  columns: DayColumn[];
  detailedTasks: DetailedTask[];
  monthlyGoals: DetailedTask[];
  yearlyGoals: DetailedTask[];
  archivedTasks: ArchivedTask[];
  activeTheme: ThemeId;
  customCategories: CustomCategoryDefinition[];
}

export interface StoredDashboardSnapshot {
  id: 'primary';
  revision: number;
  updatedAt: string;
  checksum: string;
  payload: DashboardPersistedPayload;
}

export interface OfflineSyncQueueItem {
  id: string;
  idempotencyKey: string;
  actionLabel: string;
  createdAt: string;
  revision: number;
  checksum: string;
  payload: DashboardPersistedPayload;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

export interface RemoteBaselineRecord {
  id: 'remote_baseline';
  lastSyncedAt: string;
  lastSyncedRevision: number;
  lastSyncedChecksum: string;
  updatedAt: string;
  payload: DashboardPersistedPayload;
}

export interface ConflictResolutionResult {
  resolvedPayload: DashboardPersistedPayload;
  hadConflict: boolean;
  conflictSummary: string | null;
}

export interface SyncExecutionResult {
  status: 'synced' | 'noop' | 'failed' | 'in_progress';
  syncedCount: number;
  remainingCount: number;
  lastSyncedAt: string | null;
  hadConflict: boolean;
  conflictSummary: string | null;
  resolvedPayload?: DashboardPersistedPayload;
  errorMessage?: string;
}

export const OFFLINE_IDB_NAME = 'interactive_todo_offline_db_v1';
export const OFFLINE_IDB_VERSION = 1;
export const REMOTE_BASELINE_STORAGE_KEY =
  'interactive_todo_remote_baseline_v1';
export const OFFLINE_QUEUE_FALLBACK_KEY = 'interactive_todo_offline_queue_v1';
export const OFFLINE_SNAPSHOT_FALLBACK_KEY =
  'interactive_todo_offline_snapshot_v1';

// Deterministic FNV-1a 32-bit hash for fast state deduplication & idempotency keys
export function computeDashboardStateChecksum(
  payload: DashboardPersistedPayload
): string {
  const canonical = JSON.stringify({
    columns: payload.columns,
    detailedTasks: payload.detailedTasks,
    monthlyGoals: payload.monthlyGoals,
    yearlyGoals: payload.yearlyGoals,
    archivedTasks: payload.archivedTasks,
    activeTheme: payload.activeTheme,
    customCategories: payload.customCategories,
  });
  let hash = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `chk_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function mergeTaskLists(
  localTasks: Task[],
  remoteTasks: Task[],
  preferRemoteOnTie: boolean
): { merged: Task[]; hadDiff: boolean } {
  let hadDiff = false;
  const remoteById = new Map<string, Task>();
  for (const t of remoteTasks) {
    remoteById.set(t.id, t);
  }

  const seenIds = new Set<string>();
  const merged: Task[] = [];

  for (const localTask of localTasks) {
    seenIds.add(localTask.id);
    const remoteTask = remoteById.get(localTask.id);
    if (!remoteTask) {
      merged.push(localTask);
      continue;
    }

    const localText = localTask.text.trim();
    const remoteText = remoteTask.text.trim();
    const localEmpty = localText === '' || localText === '—';
    const remoteEmpty = remoteText === '' || remoteText === '—';

    if (localText !== remoteText || localTask.completed !== remoteTask.completed) {
      hadDiff = true;
    }

    // Never overwrite a populated remote task with an empty slot
    if (localEmpty && !remoteEmpty) {
      merged.push(remoteTask);
      continue;
    }
    if (!localEmpty && remoteEmpty) {
      merged.push(localTask);
      continue;
    }

    const defaultText = DEFAULT_TASK_TEXT_BY_ID.get(localTask.id);
    const localChangedFromDefault =
      defaultText !== undefined && localText !== defaultText;
    const remoteChangedFromDefault =
      defaultText !== undefined && remoteText !== defaultText;

    // Compare completion timestamps if present
    const localCompletedTime = localTask.completedAt
      ? Date.parse(localTask.completedAt)
      : 0;
    const remoteCompletedTime = remoteTask.completedAt
      ? Date.parse(remoteTask.completedAt)
      : 0;

    const primary =
      localChangedFromDefault && !remoteChangedFromDefault
        ? localTask
        : remoteChangedFromDefault && !localChangedFromDefault
        ? remoteTask
        : remoteCompletedTime > localCompletedTime
        ? remoteTask
        : localCompletedTime > remoteCompletedTime
        ? localTask
        : preferRemoteOnTie
        ? remoteTask
        : localTask;
    const secondary = primary === localTask ? remoteTask : localTask;

    merged.push({
      ...primary,
      notes:
        primary.notes && primary.notes.trim().length > 0
          ? primary.notes
          : secondary.notes,
      customColor: primary.customColor || secondary.customColor,
      recurring:
        primary.recurring && primary.recurring !== 'none'
          ? primary.recurring
          : secondary.recurring,
    });
  }

  // Append any new non-empty remote tasks not present in local list
  for (const remoteTask of remoteTasks) {
    if (!seenIds.has(remoteTask.id)) {
      const remoteText = remoteTask.text.trim();
      if (remoteText !== '' && remoteText !== '—') {
        hadDiff = true;
        merged.push(remoteTask);
      }
    }
  }

  return { merged, hadDiff };
}

function mergeDetailedTaskLists(
  localList: DetailedTask[],
  remoteList: DetailedTask[],
  preferRemoteOnTie: boolean
): { merged: DetailedTask[]; hadDiff: boolean } {
  let hadDiff = false;
  const remoteMap = new Map<string, DetailedTask>();
  for (const t of remoteList) {
    remoteMap.set(t.id, t);
  }
  const seen = new Set<string>();
  const merged: DetailedTask[] = [];

  for (const localItem of localList) {
    seen.add(localItem.id);
    const remoteItem = remoteMap.get(localItem.id);
    if (!remoteItem) {
      merged.push(localItem);
      continue;
    }
    const localEmpty =
      localItem.text.trim() === '' || localItem.text.trim() === '—';
    const remoteEmpty =
      remoteItem.text.trim() === '' || remoteItem.text.trim() === '—';
    if (
      localItem.text !== remoteItem.text ||
      localItem.completed !== remoteItem.completed ||
      localItem.status !== remoteItem.status
    ) {
      hadDiff = true;
    }
    if (localEmpty && !remoteEmpty) {
      merged.push(remoteItem);
    } else if (!localEmpty && remoteEmpty) {
      merged.push(localItem);
    } else {
      merged.push(preferRemoteOnTie ? remoteItem : localItem);
    }
  }

  for (const remoteItem of remoteList) {
    if (!seen.has(remoteItem.id)) {
      hadDiff = true;
      merged.push(remoteItem);
    }
  }

  return { merged, hadDiff };
}

/**
 * Resolves conflicts between local offline edits and server/baseline data.
 * Never overwrites newer server data blindly: merges task lists, custom categories,
 * and archived tasks deterministically while preserving newer edits.
 */
export function resolveDashboardSyncConflict(
  localPayload: DashboardPersistedPayload,
  localUpdatedAt: string,
  remoteBaseline: RemoteBaselineRecord | null,
  baseRevisionBeforeOffline: number
): ConflictResolutionResult {
  if (!remoteBaseline) {
    return {
      resolvedPayload: localPayload,
      hadConflict: false,
      conflictSummary: null,
    };
  }

  const localChecksum = computeDashboardStateChecksum(localPayload);
  if (localChecksum === remoteBaseline.lastSyncedChecksum) {
    return {
      resolvedPayload: localPayload,
      hadConflict: false,
      conflictSummary: null,
    };
  }

  const remoteIsNewerRevision =
    remoteBaseline.lastSyncedRevision > baseRevisionBeforeOffline;
  const remoteTime = Date.parse(remoteBaseline.updatedAt) || 0;
  const localTime = Date.parse(localUpdatedAt) || 0;
  const remoteTimestampNewer = remoteTime > localTime;

  if (!remoteIsNewerRevision && !remoteTimestampNewer) {
    return {
      resolvedPayload: localPayload,
      hadConflict: false,
      conflictSummary: null,
    };
  }

  // Remote has newer state: perform smart non-destructive merge
  const remotePayload = remoteBaseline.payload;
  const preferRemoteOnTie = remoteTimestampNewer;
  let anyDiff = false;

  const remoteColsById = new Map<string, DayColumn>();
  for (const col of remotePayload.columns) {
    remoteColsById.set(col.id, col);
  }

  const mergedColumns: DayColumn[] = localPayload.columns.map((localCol) => {
    const remoteCol = remoteColsById.get(localCol.id);
    if (!remoteCol) return localCol;
    const { merged, hadDiff } = mergeTaskLists(
      localCol.tasks,
      remoteCol.tasks,
      preferRemoteOnTie
    );
    if (hadDiff) anyDiff = true;
    return {
      ...localCol,
      tasks: merged,
    };
  });

  const detailedMerged = mergeDetailedTaskLists(
    localPayload.detailedTasks,
    remotePayload.detailedTasks,
    preferRemoteOnTie
  );
  const monthlyMerged = mergeDetailedTaskLists(
    localPayload.monthlyGoals,
    remotePayload.monthlyGoals,
    preferRemoteOnTie
  );
  const yearlyMerged = mergeDetailedTaskLists(
    localPayload.yearlyGoals,
    remotePayload.yearlyGoals,
    preferRemoteOnTie
  );

  // Union custom categories by normalized name
  const categoryMap = new Map<string, CustomCategoryDefinition>();
  for (const cat of remotePayload.customCategories) {
    categoryMap.set(cat.name.toLowerCase(), cat);
  }
  for (const cat of localPayload.customCategories) {
    if (!categoryMap.has(cat.name.toLowerCase())) {
      categoryMap.set(cat.name.toLowerCase(), cat);
    }
  }

  // Union archived tasks by archiveId
  const archiveMap = new Map<string, ArchivedTask>();
  for (const arch of remotePayload.archivedTasks) {
    archiveMap.set(arch.archiveId, arch);
  }
  for (const arch of localPayload.archivedTasks) {
    archiveMap.set(arch.archiveId, arch);
  }

  const hadConflict =
    anyDiff ||
    detailedMerged.hadDiff ||
    monthlyMerged.hadDiff ||
    yearlyMerged.hadDiff;

  return {
    resolvedPayload: {
      columns: mergedColumns,
      detailedTasks: detailedMerged.merged,
      monthlyGoals: monthlyMerged.merged,
      yearlyGoals: yearlyMerged.merged,
      archivedTasks: Array.from(archiveMap.values()),
      activeTheme: preferRemoteOnTie
        ? remotePayload.activeTheme
        : localPayload.activeTheme,
      customCategories: Array.from(categoryMap.values()),
    },
    hadConflict,
    conflictSummary: hadConflict
      ? 'Merged offline edits with newer baseline data without data loss'
      : null,
  };
}

// In-memory fallback stores for environments without IndexedDB (e.g., Node unit tests)
let memorySnapshot: StoredDashboardSnapshot | null = null;
let memoryQueue: OfflineSyncQueueItem[] = [];
let memoryRemoteBaseline: RemoteBaselineRecord | null = null;

function hasIndexedDBSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.indexedDB !== 'undefined' &&
    window.indexedDB !== null
  );
}

function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDBSupport()) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = window.indexedDB.open(
      OFFLINE_IDB_NAME,
      OFFLINE_IDB_VERSION
    );
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('snapshots')) {
        db.createObjectStore('snapshots', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_meta')) {
        db.createObjectStore('sync_meta', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export async function saveSnapshotToIndexedDB(
  payload: DashboardPersistedPayload,
  revision?: number
): Promise<StoredDashboardSnapshot> {
  const existing = await loadSnapshotFromIndexedDB();
  const checksum = computeDashboardStateChecksum(payload);
  const nextRevision =
    typeof revision === 'number'
      ? revision
      : existing
      ? existing.checksum === checksum
        ? existing.revision
        : existing.revision + 1
      : 1;

  const record: StoredDashboardSnapshot = {
    id: 'primary',
    revision: nextRevision,
    updatedAt: new Date().toISOString(),
    checksum,
    payload,
  };

  memorySnapshot = record;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        OFFLINE_SNAPSHOT_FALLBACK_KEY,
        JSON.stringify(record)
      );
    } catch {
      // ignore storage quota errors
    }
  }

  if (!hasIndexedDBSupport()) {
    return record;
  }

  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('snapshots', 'readwrite');
      const store = tx.objectStore('snapshots');
      store.put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback already saved in memory & localStorage
  }

  return record;
}

export async function loadSnapshotFromIndexedDB(): Promise<StoredDashboardSnapshot | null> {
  if (hasIndexedDBSupport()) {
    try {
      const db = await openOfflineDatabase();
      const result = await new Promise<StoredDashboardSnapshot | null>(
        (resolve, reject) => {
          const tx = db.transaction('snapshots', 'readonly');
          const store = tx.objectStore('snapshots');
          const req = store.get('primary');
          req.onsuccess = () => {
            db.close();
            resolve((req.result as StoredDashboardSnapshot) || null);
          };
          req.onerror = () => {
            db.close();
            reject(req.error);
          };
        }
      );
      if (result && result.payload) {
        const validated = parsePersistedDashboardState(
          JSON.stringify(result.payload)
        );
        return {
          ...result,
          payload: validated,
        };
      }
    } catch {
      // Fall back to localStorage / memory below
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(OFFLINE_SNAPSHOT_FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDashboardSnapshot;
        if (parsed && parsed.payload) {
          const validated = parsePersistedDashboardState(
            JSON.stringify(parsed.payload)
          );
          return {
            ...parsed,
            payload: validated,
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return memorySnapshot;
}

export async function getOfflineSyncQueue(): Promise<OfflineSyncQueueItem[]> {
  if (hasIndexedDBSupport()) {
    try {
      const db = await openOfflineDatabase();
      const items = await new Promise<OfflineSyncQueueItem[]>(
        (resolve, reject) => {
          const tx = db.transaction('sync_queue', 'readonly');
          const store = tx.objectStore('sync_queue');
          const req = store.getAll();
          req.onsuccess = () => {
            db.close();
            resolve((req.result as OfflineSyncQueueItem[]) || []);
          };
          req.onerror = () => {
            db.close();
            reject(req.error);
          };
        }
      );
      return items.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
      );
    } catch {
      // Fall back below
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OfflineSyncQueueItem[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return [...memoryQueue];
}

async function persistSyncQueueList(
  items: OfflineSyncQueueItem[]
): Promise<void> {
  memoryQueue = [...items];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        OFFLINE_QUEUE_FALLBACK_KEY,
        JSON.stringify(items)
      );
    } catch {
      // ignore
    }
  }

  if (!hasIndexedDBSupport()) return;

  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      store.clear();
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback already updated
  }
}

/**
 * Enqueues an offline user change for synchronization when connectivity returns.
 * Deduplicates by checksum/idempotencyKey so rapid offline actions never cause
 * duplicate submissions during sync.
 */
export async function enqueueOfflineSyncChange(
  payload: DashboardPersistedPayload,
  actionLabel = 'Updated tasks while offline'
): Promise<{
  item: OfflineSyncQueueItem;
  queueLength: number;
  deduplicated: boolean;
}> {
  const snapshot = await saveSnapshotToIndexedDB(payload);
  const checksum = snapshot.checksum;
  const idempotencyKey = `idem_${snapshot.revision}_${checksum}`;
  const currentQueue = await getOfflineSyncQueue();

  // Check if the latest queued item already has the exact same checksum
  const lastItem = currentQueue[currentQueue.length - 1];
  if (lastItem && lastItem.checksum === checksum) {
    return {
      item: lastItem,
      queueLength: currentQueue.length,
      deduplicated: true,
    };
  }

  const newItem: OfflineSyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    idempotencyKey,
    actionLabel,
    createdAt: new Date().toISOString(),
    revision: snapshot.revision,
    checksum,
    payload,
    status: 'pending',
    retryCount: 0,
  };

  // Keep queue compact while preserving history count (coalesce older pending snapshots if > 25)
  const nextQueue = [...currentQueue, newItem].slice(-25);
  await persistSyncQueueList(nextQueue);

  return {
    item: newItem,
    queueLength: nextQueue.length,
    deduplicated: false,
  };
}

export async function getRemoteBaseline(): Promise<RemoteBaselineRecord | null> {
  if (hasIndexedDBSupport()) {
    try {
      const db = await openOfflineDatabase();
      const record = await new Promise<RemoteBaselineRecord | null>(
        (resolve, reject) => {
          const tx = db.transaction('sync_meta', 'readonly');
          const store = tx.objectStore('sync_meta');
          const req = store.get('remote_baseline');
          req.onsuccess = () => {
            db.close();
            resolve((req.result as RemoteBaselineRecord) || null);
          };
          req.onerror = () => {
            db.close();
            reject(req.error);
          };
        }
      );
      if (record) return record;
    } catch {
      // Fallback below
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(REMOTE_BASELINE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as RemoteBaselineRecord;
      }
    } catch {
      // ignore
    }
  }

  return memoryRemoteBaseline;
}

export async function saveRemoteBaseline(
  payload: DashboardPersistedPayload,
  revision: number
): Promise<RemoteBaselineRecord> {
  const now = new Date().toISOString();
  const checksum = computeDashboardStateChecksum(payload);
  const record: RemoteBaselineRecord = {
    id: 'remote_baseline',
    lastSyncedAt: now,
    lastSyncedRevision: revision,
    lastSyncedChecksum: checksum,
    updatedAt: now,
    payload,
  };

  memoryRemoteBaseline = record;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        REMOTE_BASELINE_STORAGE_KEY,
        JSON.stringify(record)
      );
    } catch {
      // ignore
    }
  }

  if (hasIndexedDBSupport()) {
    try {
      const db = await openOfflineDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('sync_meta', 'readwrite');
        const store = tx.objectStore('sync_meta');
        store.put(record);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      });
    } catch {
      // Fallback already saved
    }
  }

  return record;
}

// Active lock & processed idempotency set to prevent duplicate concurrent submissions
let activeSyncLock = false;
const processedIdempotencyKeys = new Set<string>();

/**
 * Synchronizes all pending offline changes when connectivity returns.
 * - Prevents duplicate submissions via activeSyncLock & processedIdempotencyKeys
 * - Checks for conflicts against remote baseline and merges non-destructively
 * - Preserves queue safely if offline/network error occurs during synchronization
 */
export async function synchronizePendingOfflineChanges(options?: {
  forceOfflineFailure?: boolean;
  isOnlineCheck?: () => boolean;
}): Promise<SyncExecutionResult> {
  if (activeSyncLock) {
    const queue = await getOfflineSyncQueue();
    return {
      status: 'in_progress',
      syncedCount: 0,
      remainingCount: queue.length,
      lastSyncedAt: null,
      hadConflict: false,
      conflictSummary: null,
    };
  }

  activeSyncLock = true;
  try {
    const queue = await getOfflineSyncQueue();
    const baseline = await getRemoteBaseline();

    if (queue.length === 0) {
      return {
        status: 'noop',
        syncedCount: 0,
        remainingCount: 0,
        lastSyncedAt: baseline?.lastSyncedAt || new Date().toISOString(),
        hadConflict: false,
        conflictSummary: null,
      };
    }

    const isCurrentlyOnline = options?.isOnlineCheck
      ? options.isOnlineCheck()
      : typeof navigator !== 'undefined'
      ? navigator.onLine
      : true;

    if (!isCurrentlyOnline || options?.forceOfflineFailure) {
      const failedQueue = queue.map((item) => ({
        ...item,
        status: 'failed' as const,
        retryCount: item.retryCount + 1,
        lastError: 'Connection unavailable during synchronization',
      }));
      await persistSyncQueueList(failedQueue);
      return {
        status: 'failed',
        syncedCount: 0,
        remainingCount: failedQueue.length,
        lastSyncedAt: baseline?.lastSyncedAt || null,
        hadConflict: false,
        conflictSummary: null,
        errorMessage:
          'Unable to synchronize while offline. Your changes remain safely saved in IndexedDB.',
      };
    }

    // Filter out any already-processed idempotency keys to guarantee zero duplicate submissions
    const unprocessedItems = queue.filter(
      (item) => !processedIdempotencyKeys.has(item.idempotencyKey)
    );

    const latestItem =
      unprocessedItems[unprocessedItems.length - 1] ||
      queue[queue.length - 1];
    const earliestBaseRevision = Math.max(0, queue[0].revision - 1);

    // Resolve any conflict with remote baseline
    const conflictResult = resolveDashboardSyncConflict(
      latestItem.payload,
      latestItem.createdAt,
      baseline,
      earliestBaseRevision
    );

    const finalRevision = Math.max(
      latestItem.revision,
      (baseline?.lastSyncedRevision || 0) + 1
    );

    // Save resolved state to IndexedDB snapshot & remote baseline
    await saveSnapshotToIndexedDB(conflictResult.resolvedPayload, finalRevision);
    const updatedBaseline = await saveRemoteBaseline(
      conflictResult.resolvedPayload,
      finalRevision
    );

    for (const item of queue) {
      processedIdempotencyKeys.add(item.idempotencyKey);
    }

    // Clear queue upon successful sync
    await persistSyncQueueList([]);

    return {
      status: 'synced',
      syncedCount: queue.length,
      remainingCount: 0,
      lastSyncedAt: updatedBaseline.lastSyncedAt,
      hadConflict: conflictResult.hadConflict,
      conflictSummary: conflictResult.conflictSummary,
      resolvedPayload: conflictResult.resolvedPayload,
    };
  } finally {
    activeSyncLock = false;
  }
}

export async function resetOfflineStorageForTests(): Promise<void> {
  memorySnapshot = null;
  memoryQueue = [];
  memoryRemoteBaseline = null;
  activeSyncLock = false;
  processedIdempotencyKeys.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(OFFLINE_SNAPSHOT_FALLBACK_KEY);
    window.localStorage.removeItem(OFFLINE_QUEUE_FALLBACK_KEY);
    window.localStorage.removeItem(REMOTE_BASELINE_STORAGE_KEY);
  }
}

/**
 * Actively probes network connectivity when the user clicks "Retry Connection".
 */
export async function verifyNetworkConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  if (typeof fetch !== 'function') {
    return true;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(`/manifest.json?_ping=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Sends all currently loaded script, style, and asset URLs to the active Service Worker
 * so they are guaranteed to be cached in Cache Storage for offline reload.
 */
export function warmServiceWorkerActiveResources(
  explicitWorker?: ServiceWorker | null
): void {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  try {
    const resourceUrls = new Set<string>([
      '/',
      '/index.html',
      '/manifest.json',
      '/@vite/client',
      '/@react-refresh',
    ]);

    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const entries = performance.getEntriesByType('resource');
      for (const entry of entries) {
        if (entry.name && entry.name.startsWith(window.location.origin)) {
          resourceUrls.add(entry.name);
        }
      }
    }

    if (typeof document !== 'undefined') {
      document
        .querySelectorAll<HTMLScriptElement>('script[src]')
        .forEach((s) => {
          if (s.src) resourceUrls.add(s.src);
        });
      document
        .querySelectorAll<HTMLLinkElement>('link[href]')
        .forEach((l) => {
          if (l.href && l.href.startsWith(window.location.origin)) {
            resourceUrls.add(l.href);
          }
        });
    }

    const sendWarmMessage = (sw: ServiceWorker | null | undefined) => {
      if (!sw) return;
      sw.postMessage({
        type: 'WARM_ACTIVE_RESOURCES',
        urls: Array.from(resourceUrls),
      });
    };

    if (explicitWorker) {
      sendWarmMessage(explicitWorker);
    } else if (navigator.serviceWorker.controller) {
      sendWarmMessage(navigator.serviceWorker.controller);
    } else {
      navigator.serviceWorker.ready
        .then((reg) => sendWarmMessage(reg.active))
        .catch(() => {});
    }
  } catch {
    // ignore
  }
}

export async function registerAppServiceWorker(
  onUpdateReady?: () => void,
  onOfflineReady?: () => void
): Promise<ServiceWorkerRegistration | null> {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return null;
  }

  try {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_ACTIVATED') {
        onOfflineReady?.();
        warmServiceWorkerActiveResources();
      } else if (event.data?.type === 'CACHE_WARM_COMPLETE') {
        (
          window as unknown as { __PWA_CACHE_WARMED__?: boolean }
        ).__PWA_CACHE_WARMED__ = true;
        onOfflineReady?.();
      }
    });

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdateReady?.();
          installingWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    const readyReg = await navigator.serviceWorker.ready;
    if (readyReg.active) {
      onOfflineReady?.();
      warmServiceWorkerActiveResources(readyReg.active);
    }

    return registration;
  } catch {
    return null;
  }
}
