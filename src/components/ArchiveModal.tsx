import React, { useState, useEffect } from 'react';
import {
  X,
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Check,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  ArchivedTask,
  CATEGORY_BADGE_STYLES,
  ThemeId,
  THEMES,
  filterArchivedTasks,
} from '../utils/todoLogic';
import { PRIORITY_PILL_STYLES } from './InteractiveDashboard';

interface ArchiveModalProps {
  isOpen: boolean;
  archivedTasks: ArchivedTask[];
  activeCompletedCount: number;
  activeTheme: ThemeId;
  onClose: () => void;
  onArchiveCompletedTasks: () => void;
  onRestoreTask: (archiveId: string) => void;
  onRestoreAll: () => void;
  onDeleteArchivedTask: (archiveId: string) => void;
  onClearArchive: () => void;
}

function formatArchivedTimestamp(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return 'Recently archived';
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently archived';
  }
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  archivedTasks,
  activeCompletedCount,
  activeTheme,
  onClose,
  onArchiveCompletedTasks,
  onRestoreTask,
  onRestoreAll,
  onDeleteArchivedTask,
  onClearArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = THEMES[activeTheme] || THEMES.terracotta;

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = filterArchivedTasks(archivedTasks, searchQuery);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
      data-testid="archive-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#FAF7F2] border border-[#E2D9CC] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Chrome Bar */}
        <div className="bg-[#EFEBE4] px-4 sm:px-5 py-3 border-b border-[#E2D9CC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3 h-3 rounded-full bg-[#ED6A5E] shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#F4BF4F] shrink-0" />
            <span className="w-3 h-3 rounded-full bg-[#61C554] shrink-0" />
            <div className="ml-1.5 sm:ml-2 flex items-center gap-1.5 min-w-0">
              <Archive className="w-3.5 h-3.5 text-[#B05C37] shrink-0" />
              <h2
                id="archive-modal-title"
                className="text-xs sm:text-sm font-bold text-[#2F2B28] truncate"
              >
                Completed Task Archive
              </h2>
              <span
                data-testid="archive-modal-count-badge"
                className="ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#E5DEC9] text-[#4A433C] tabular-nums"
              >
                {archivedTasks.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close archive modal"
            data-testid="close-archive-modal-btn"
            className="text-[#7A7269] hover:text-[#2F2B28] px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-semibold"
          >
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-[#D8CFC2] rounded text-[#5A534C]">
              Esc
            </kbd>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary & Quick Action Banner */}
        <div className="px-4 sm:px-5 pt-3.5 pb-2 space-y-2.5 shrink-0">
          <div className="bg-white border border-[#E6DFD3] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F2B28]">
                <Sparkles className="w-3.5 h-3.5 text-[#C26D43] shrink-0" />
                <span>Keep Your Daily View Uncluttered</span>
              </div>
              <p className="text-[11px] text-[#6E675F]">
                Archived tasks are hidden from active daily columns while
                preserving full completion history, notes, and tags.
              </p>
            </div>

            {activeCompletedCount > 0 && (
              <button
                type="button"
                onClick={onArchiveCompletedTasks}
                data-testid="archive-modal-archive-completed-btn"
                className="inline-flex items-center justify-center gap-1.5 bg-[#C26D43] hover:bg-[#AD5D35] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Completed ({activeCompletedCount})</span>
              </button>
            )}
          </div>

          {/* Search Bar when archive has items */}
          {archivedTasks.length > 0 && (
            <div className="relative flex items-center">
              <Search
                className="w-3.5 h-3.5 text-[#8A8279] absolute left-3 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter archived history by task, day, category, or priority..."
                aria-label="Search archived tasks"
                data-testid="archive-search-input"
                className="w-full bg-white border border-[#DED8CE] focus:border-[#C87D55] focus:ring-2 focus:ring-[#C87D55]/25 rounded-xl pl-8 pr-8 py-1.5 text-xs font-medium text-[#2F2B28] placeholder:text-[#9C948B] focus:outline-none transition-all"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear archive search"
                  className="absolute right-2.5 text-[#8A8279] hover:text-[#2F2B28] p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Archived Task List */}
        <div
          className="px-4 sm:px-5 py-2 overflow-y-auto flex-1 min-h-[220px]"
          data-testid="archive-task-list"
        >
          {archivedTasks.length === 0 ? (
            <div
              data-testid="archive-empty-state"
              className="h-52 flex flex-col items-center justify-center text-center px-4 bg-white/70 border border-dashed border-[#DED6CA] rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-[#F4EFE6] text-[#B05C37] flex items-center justify-center mb-2.5">
                <Archive className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#2F2B28]">
                Your Archive is currently empty
              </p>
              <p className="text-[11px] sm:text-xs text-[#7A7269] max-w-md mt-1">
                Move completed tasks into the archive to declutter your active
                weekly columns while keeping a searchable log of everything
                you&apos;ve accomplished.
              </p>
              {activeCompletedCount > 0 && (
                <button
                  type="button"
                  onClick={onArchiveCompletedTasks}
                  data-testid="archive-empty-state-action-btn"
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#C26D43] hover:bg-[#AD5D35] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>
                    Archive {activeCompletedCount} Completed Task
                    {activeCompletedCount === 1 ? '' : 's'} Now
                  </span>
                </button>
              )}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center px-4 bg-white/70 border border-dashed border-[#DED6CA] rounded-xl">
              <p className="text-xs font-bold text-[#4A433C]">
                No archived tasks match &ldquo;{searchQuery.trim()}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-[11px] font-bold text-[#B05C37] hover:underline cursor-pointer"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="space-y-2 pb-2">
              {filteredTasks.map((item) => {
                const showDualLabel =
                  item.linkedDetailedText &&
                  item.linkedDetailedText.toLowerCase() !==
                    item.text.toLowerCase();

                return (
                  <div
                    key={item.archiveId}
                    data-testid={`archived-task-item-${item.archiveId}`}
                    className="bg-white border border-[#E6DFD3] hover:border-[#D6CBB9] rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: theme.checkboxBg }}
                        aria-hidden="true"
                      >
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </span>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-[#2F2B28] line-through decoration-[#B0A89E]">
                            {item.text}
                          </span>
                          {showDualLabel && (
                            <span className="text-[11px] font-medium text-[#7A7269]">
                              ({item.linkedDetailedText})
                            </span>
                          )}
                        </div>

                        {item.notes && item.notes.trim().length > 0 && (
                          <div className="flex items-start gap-1 text-[11px] text-[#6E675F] bg-[#FAF7F2] px-2 py-1 rounded border border-[#EFEAE1]">
                            <FileText className="w-3 h-3 text-[#B86B43] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.notes}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6E675F] bg-[#F4EFE6] px-2 py-0.5 rounded-full">
                            <Calendar className="w-2.5 h-2.5 text-[#8C7A6B]" />
                            {item.sourceLabel}
                          </span>

                          <span
                            data-category-badge={item.category}
                            className="px-2 py-0.5 rounded text-[9px] font-bold border leading-none"
                            style={{
                              backgroundColor:
                                CATEGORY_BADGE_STYLES[item.category]?.bg ??
                                '#FCEADE',
                              color:
                                CATEGORY_BADGE_STYLES[item.category]?.text ??
                                '#9A4E28',
                              borderColor:
                                CATEGORY_BADGE_STYLES[item.category]?.border ??
                                '#F0CFB8',
                            }}
                          >
                            {item.category}
                          </span>

                          <span
                            data-priority-pill={item.priority}
                            className="px-2 py-0.5 rounded-full text-[9.5px] font-bold leading-none"
                            style={{
                              backgroundColor:
                                PRIORITY_PILL_STYLES[item.priority].bg,
                              color: PRIORITY_PILL_STYLES[item.priority].text,
                            }}
                          >
                            {item.priority}
                          </span>

                          <span className="text-[10px] text-[#9C948B] tabular-nums">
                            Archived {formatArchivedTimestamp(item.archivedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => onRestoreTask(item.archiveId)}
                        aria-label={`Restore archived task "${item.text}"`}
                        data-testid={`restore-archived-task-${item.archiveId}`}
                        title="Restore task to active board"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE1D3] text-[#3B3530] text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-[#B05C37]" />
                        <span>Restore</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteArchivedTask(item.archiveId)}
                        aria-label={`Permanently delete archived task "${item.text}"`}
                        data-testid={`delete-archived-task-${item.archiveId}`}
                        title="Delete permanently from archive"
                        className="p-1.5 rounded-lg text-[#9C9288] hover:text-[#9E3F38] hover:bg-[#FDECEB] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EFEBE4] px-4 sm:px-5 py-2.5 border-t border-[#E2D9CC] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {archivedTasks.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onRestoreAll}
                  data-testid="archive-restore-all-btn"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#F4EFE6] border border-[#D8CFC2] text-[#3B3530] text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#4A8B63]" />
                  <span>Restore All ({archivedTasks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={onClearArchive}
                  data-testid="archive-clear-all-btn"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-[#FDECEB] border border-[#D8CFC2] text-[#8C3B32] text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Empty Archive</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-[#7A7269] hidden sm:inline">
              Shortcut: Press{' '}
              <kbd className="px-1 py-0.5 font-bold bg-white border border-[#D8CFC2] rounded text-[#4A433C]">
                A
              </kbd>{' '}
              anytime
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#2F2B28] hover:bg-[#433E39] text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
