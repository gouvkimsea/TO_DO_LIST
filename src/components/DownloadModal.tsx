import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Play,
  Database,
} from 'lucide-react';
import {
  DayColumn,
  ThemeId,
  THEMES,
  generateStandaloneHtmlExport,
} from '../utils/todoLogic';

interface DownloadModalProps {
  isOpen: boolean;
  initialTab?: 'download' | 'demo';
  onClose: () => void;
  columns: DayColumn[];
  activeTheme: ThemeId;
  weekRangeLabel: string;
  onExportCsv: () => void;
  onExportJsonBackup?: () => void;
  onImportJsonBackup?: (rawJson: string) => boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  initialTab = 'download',
  onClose,
  columns,
  activeTheme,
  weekRangeLabel,
  onExportCsv,
  onExportJsonBackup,
  onImportJsonBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'demo'>(initialTab);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDownloadedItem(null);
      setImportError(null);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const theme = THEMES[activeTheme];

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = generateStandaloneHtmlExport(
      columns,
      activeTheme,
      weekRangeLabel
    );

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-tasks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedItem('my-tasks.html');
    setImportError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || typeof text !== 'string') {
          throw new Error('Empty file content');
        }
        if (onImportJsonBackup) {
          const success = onImportJsonBackup(text);
          if (success) {
            setDownloadedItem(`Backup imported from ${file.name}`);
            setImportError(null);
          } else {
            setImportError('Invalid or corrupted backup file format.');
          }
        }
      } catch {
        setImportError('Failed to parse JSON file. Please ensure it is a valid backup.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file from disk.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#FAF7F2] border border-[#E2D9CC] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Top Bar */}
        <div className="bg-[#EFEBE4] px-4 sm:px-5 py-3.5 border-b border-[#E2D9CC] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full bg-[#ED6A5E] shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#F4BF4F] shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#61C554] shrink-0" />
            <h2
              id="download-modal-title"
              className="ml-1.5 sm:ml-2 text-xs font-bold text-[#4A433C] truncate"
            >
              Interactive To-Do Dashboard Bundle &amp; Backup
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#7A7269] hover:text-[#2F2B28] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div
          role="tablist"
          aria-label="Download bundle options"
          className="px-4 sm:px-6 pt-4 flex flex-wrap gap-2 border-b border-[#E8E2D8]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'download'}
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'download'
                ? 'border-[#C26D43] text-[#2F2B28]'
                : 'border-transparent text-[#8A8279] hover:text-[#2F2B28]'
            }`}
          >
            Instant Digital Download &amp; Backup
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'demo'}
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'demo'
                ? 'border-[#C26D43] text-[#2F2B28]'
                : 'border-transparent text-[#8A8279] hover:text-[#2F2B28]'
            }`}
          >
            Quick-Start &amp; Walkthrough
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'download' ? (
            <div className="space-y-4">
              <p className="text-xs text-[#6E675F] leading-relaxed">
                Download your standalone files directly to your device. Your current tasks and selected{' '}
                <strong className="text-[#2F2B28]">{theme.name}</strong> theme are included automatically.
              </p>

              {downloadedItem && (
                <div className="flex items-center gap-2 bg-[#E3F1E6] border border-[#B8DEC0] text-[#265D36] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{downloadedItem}</span>
                </div>
              )}

              {importError && (
                <div className="flex items-center gap-2 bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="bg-white border border-[#E8E2D8] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#2F2B28]">
                      1. Interactive HTML Dashboard (my-tasks.html)
                    </div>
                    <div className="text-xs text-[#8A8279]">
                      Opens in any browser · works offline · saves automatically
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadStandaloneHtml}
                    className="bg-[#C26D43] hover:bg-[#AE5D35] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download HTML</span>
                  </button>
                </div>

                <div className="bg-white border border-[#E8E2D8] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#2F2B28]">
                      2. Google Sheets &amp; Excel Tracker (.csv)
                    </div>
                    <div className="text-xs text-[#8A8279]">
                      Horizontal 7-day layout with completion totals
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onExportCsv();
                      setDownloadedItem('Downloaded weekly-todo-tracker.csv to your device!');
                      setImportError(null);
                    }}
                    className="bg-[#238854] hover:bg-[#1C6F44] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Sheet</span>
                  </button>
                </div>

                <div className="bg-white border border-[#E8E2D8] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-[#2F2B28] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#5A524A]" />
                      <span>3. Full Data Backup &amp; Restore (.json)</span>
                    </div>
                    <div className="text-xs text-[#8A8279]">
                      Transfer full planner state, archives &amp; goals between devices
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onExportJsonBackup && (
                      <button
                        type="button"
                        onClick={() => {
                          onExportJsonBackup();
                          setDownloadedItem('Exported JSON backup file to your device!');
                          setImportError(null);
                        }}
                        className="bg-[#4A433C] hover:bg-[#38332E] text-white px-3.5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Backup</span>
                      </button>
                    )}
                    {onImportJsonBackup && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#FAF7F2] hover:bg-[#EFEBE4] text-[#4A433C] border border-[#DDD5C7] px-3.5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-[#E8E2D8] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B07B54] uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>How the Interactive Dashboard Works</span>
                </div>
                <ol className="text-xs text-[#4A433C] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong>Open the file in any browser:</strong> Double-click{' '}
                    <code>my-tasks.html</code> or use the live dashboard right on this page.
                  </li>
                  <li>
                    <strong>Bookmark with one star click:</strong> Press{' '}
                    <code>Ctrl+D</code> / <code>Cmd+D</code> to keep it on your bookmark bar.
                  </li>
                  <li>
                    <strong>Click anything to update instantly:</strong> Check off tasks, tap any colored dot to cycle High / Med / Low priority, or tap status pills to cycle To Do / In Progress / Done.
                  </li>
                  <li>
                    <strong>Switch themes &amp; views anytime:</strong> Toggle between Terracotta, Candy Pastel, Lavender Mist, and Soft Neutral without losing a single task.
                  </li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#5A534C] hover:bg-[#EFEBE4] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
