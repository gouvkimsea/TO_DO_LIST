import React, { useState } from 'react';
import {
  CheckCircle2,
  CloudOff,
  Download,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wifi,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export interface SyncNotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
  detail?: string;
}

export interface PWAHeaderControlsProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  swOfflineReady: boolean;
  lastSyncedAt: string | null;
  idbRevision: number;
  onRetryConnectionAndSync: () => Promise<void>;
}

export const PWAHeaderControls: React.FC<PWAHeaderControlsProps> = ({
  isOnline,
  isSyncing,
  pendingSyncCount,
  swOfflineReady,
  lastSyncedAt,
  idbRevision,
  onRetryConnectionAndSync,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSyncPopover, setShowSyncPopover] = useState(false);

  const handleInstallClick = async () => {
    const outcome = await install();
    if (outcome === 'manual_guide') {
      setShowInstallModal(true);
    }
  };

  const formattedLastSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <>
      <div className="relative flex items-center gap-1.5">
        {/* Subtle Connectivity & Sync Status Indicator */}
        <button
          type="button"
          onClick={() => setShowSyncPopover((prev) => !prev)}
          data-testid="pwa-connectivity-status"
          data-online={isOnline ? 'true' : 'false'}
          data-syncing={isSyncing ? 'true' : 'false'}
          data-pending-count={pendingSyncCount}
          aria-label={
            !isOnline
              ? `Offline Mode active. ${pendingSyncCount} change(s) queued in IndexedDB.`
              : isSyncing
              ? 'Synchronizing offline changes...'
              : 'Online and offline-ready. Click to view sync and cache status.'
          }
          title={
            !isOnline
              ? `Offline Mode (${pendingSyncCount} pending sync)`
              : isSyncing
              ? 'Synchronizing changes...'
              : 'PWA Offline Ready & Synced'
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
            !isOnline
              ? 'bg-[#FFF5EA] text-[#9A4E28] border-[#E8C5A5] hover:bg-[#FCEAD6]'
              : isSyncing
              ? 'bg-[#F0F7F4] text-[#2B6E4E] border-[#B8DEC9]'
              : 'bg-[#F2EFE9] text-[#5A534C] hover:text-[#2F2B28] hover:bg-[#E4DDD3] border-[#E2D9CC]'
          }`}
        >
          {!isOnline ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-[#C26D43] shrink-0" />
              <span className="hidden lg:inline">
                Offline{pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}
              </span>
            </>
          ) : isSyncing ? (
            <span
              data-testid="pwa-syncing-indicator"
              className="inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2B6E4E] animate-spin shrink-0" />
              <span className="hidden lg:inline">Syncing...</span>
            </span>
          ) : (
            <>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  swOfflineReady ? 'bg-[#3C8D62]' : 'bg-[#C26D43]'
                }`}
              />
              <span className="hidden xl:inline">
                {pendingSyncCount > 0
                  ? `Sync (${pendingSyncCount})`
                  : 'Offline Ready'}
              </span>
            </>
          )}
        </button>

        {/* In-App PWA Install Button (hidden when already installed in standalone mode) */}
        {!isInstalled && (
          <button
            type="button"
            onClick={() => void handleInstallClick()}
            data-testid="pwa-install-btn"
            data-native-prompt-ready={isInstallable ? 'true' : 'false'}
            aria-label="Install Weekly To-Do App for offline desktop and mobile access"
            title="Install Weekly To-Do as a desktop or mobile app"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#2F2B28] bg-[#F5E8DD] hover:bg-[#EDD8C6] border border-[#DFC4AD] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Compact Offline & Sync Inspector Popover */}
        {showSyncPopover && (
          <div
            role="dialog"
            aria-label="Offline Storage and Sync Status"
            data-testid="pwa-sync-inspector-popover"
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl bg-[#FDFBF7] border border-[#DED8CE] shadow-xl p-3.5 z-50 text-left"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ECE7DF]">
              <div className="flex items-center gap-1.5">
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-[#3C8D62]" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-[#C26D43]" />
                )}
                <span className="text-xs font-bold text-[#2F2B28]">
                  {isOnline ? 'Online · PWA Ready' : 'Offline Mode Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncPopover(false)}
                aria-label="Close sync status popover"
                className="p-0.5 rounded text-[#7A7269] hover:text-[#2F2B28] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-2.5 space-y-1.5 text-[11px] text-[#5A534C]">
              <div className="flex items-center justify-between">
                <span>Service Worker Cache:</span>
                <span className="font-bold text-[#2F2B28]">
                  {swOfflineReady ? 'Active & Cached' : 'Caching assets...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>IndexedDB Revision:</span>
                <span className="font-mono font-bold text-[#2F2B28]">
                  v{idbRevision}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending Offline Queue:</span>
                <span
                  data-testid="pwa-popover-pending-count"
                  className="font-mono font-bold text-[#2F2B28]"
                >
                  {pendingSyncCount} item{pendingSyncCount === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Synchronized:</span>
                <span className="font-semibold text-[#2F2B28]">
                  {formattedLastSync}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#ECE7DF] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  void onRetryConnectionAndSync();
                }}
                disabled={isSyncing}
                data-testid="pwa-popover-sync-now-btn"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2F2B28] hover:bg-[#3F3A36] text-[#FAF7F2] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span>
                  {!isOnline
                    ? 'Retry Connection'
                    : pendingSyncCount > 0
                    ? `Synchronize Now (${pendingSyncCount})`
                    : 'Verify & Sync Now'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guided Install Modal when native prompt is deferred or on iOS/macOS */}
      {showInstallModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-modal-title"
          data-testid="pwa-install-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInstallModal(false);
          }}
          className="fixed inset-0 z-50 bg-[#1E1B18]/50 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#FDFBF7] border border-[#E2D9CC] shadow-2xl p-5 text-[#2F2B28]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C26D43] text-[#FAF6F0] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="pwa-install-modal-title"
                    className="text-sm sm:text-base font-bold leading-snug"
                  >
                    Install Weekly To-Do App
                  </h3>
                  <p className="text-[11px] font-medium text-[#7A7269]">
                    Works 100% offline on Desktop, Laptop, Tablet &amp; Mobile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                aria-label="Close install instructions"
                data-testid="close-pwa-install-modal-btn"
                className="p-1 rounded-lg text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-white border border-[#ECE7DF] p-3.5 space-y-2.5 text-xs text-[#4A433C] mb-4">
              {isIOS ? (
                <>
                  <p className="font-bold text-[#2F2B28]">
                    Install on iPhone or iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>
                      Tap the <strong>Share</strong> button in the Safari
                      toolbar.
                    </li>
                    <li>
                      Scroll down and select{' '}
                      <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong>Add</strong> to launch Weekly To-Do as a
                      standalone offline app.
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-bold text-[#2F2B28]">
                    Install on Desktop or Mobile Browser:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>
                      Click the <strong>Install Weekly To-Do</strong> icon in
                      your browser&apos;s address bar (or open the browser menu{' '}
                      <strong>⋮</strong> &rarr;{' '}
                      <strong>Install Interactive Weekly To-Do Dashboard</strong>
                      ).
                    </li>
                    <li>
                      Once installed, the app opens in its own standalone window
                      and works even without internet access.
                    </li>
                  </ol>
                </>
              )}
            </div>

            <div className="rounded-xl bg-[#FAF4EC] border border-[#E8D7C3] p-3 mb-4 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-[#8C4A27]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Offline Readiness Status</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[#5A534C]">
                <span>&#10003; Web App Manifest</span>
                <span>&#10003; Service Worker Active</span>
                <span>&#10003; IndexedDB Storage (v{idbRevision})</span>
                <span>&#10003; Auto-Sync Queue Ready</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full py-2 rounded-xl bg-[#2F2B28] hover:bg-[#3F3A36] text-[#FAF7F2] text-xs font-bold transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export interface PWAOfflineAndSyncBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  syncNotification: SyncNotificationState | null;
  onRetryConnectionAndSync: () => Promise<void>;
  onDismissNotification: () => void;
}

export const PWAOfflineAndSyncBanner: React.FC<PWAOfflineAndSyncBannerProps> = ({
  isOnline,
  isSyncing,
  pendingSyncCount,
  syncNotification,
  onRetryConnectionAndSync,
  onDismissNotification,
}) => {
  return (
    <>
      {/* Subtle, Non-Intrusive Offline Status Bar when Internet Connection is Lost */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          data-testid="pwa-offline-banner"
          className="w-full bg-[#FFF5EA] border-b border-[#E8C5A5] px-4 sm:px-6 lg:px-8 py-2 text-[#5E3219]"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C26D43] animate-pulse shrink-0" />
              <CloudOff className="w-3.5 h-3.5 text-[#C26D43] shrink-0" />
              <span className="font-bold">Offline Mode</span>
              <span className="text-[#78472A]">
                — You are working offline. All tasks, categories, and notes are
                saved locally to IndexedDB
                {pendingSyncCount > 0
                  ? ` (${pendingSyncCount} change${
                      pendingSyncCount === 1 ? '' : 's'
                    } queued for sync)`
                  : ''}
                .
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void onRetryConnectionAndSync()}
                disabled={isSyncing}
                data-testid="pwa-retry-connection-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#2F2B28] hover:bg-[#433D38] text-[#FAF7F2] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span>
                  {isSyncing ? 'Checking...' : 'Retry Connection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Synchronization Progress & Result Toast Notification */}
      {syncNotification && (
        <div
          role="status"
          aria-live="polite"
          data-testid="pwa-sync-notification"
          data-sync-notification-type={syncNotification.type}
          className={`fixed bottom-4 left-4 z-50 max-w-sm flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border shadow-lg text-xs font-semibold ${
            syncNotification.type === 'success'
              ? 'bg-[#2F2B28] text-[#FAF7F2] border-[#4A433C]'
              : syncNotification.type === 'error'
              ? 'bg-[#FFF5EA] text-[#7D3518] border-[#E8C5A5]'
              : 'bg-[#FAF6F0] text-[#2F2B28] border-[#DED8CE]'
          }`}
        >
          {syncNotification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#84CA9E] shrink-0 mt-0.5" />
          ) : syncNotification.type === 'error' ? (
            <CloudOff className="w-4 h-4 text-[#C26D43] shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-4 h-4 text-[#B05C37] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold leading-snug">{syncNotification.message}</p>
            {syncNotification.detail && (
              <p className="text-[11px] opacity-85 mt-0.5 leading-snug">
                {syncNotification.detail}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismissNotification}
            aria-label="Dismiss synchronization notification"
            className="p-0.5 rounded opacity-75 hover:opacity-100 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
