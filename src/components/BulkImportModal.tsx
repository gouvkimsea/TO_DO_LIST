import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  ClipboardPaste,
  Plus,
  Check,
  Repeat,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  BulkImportOptions,
  CATEGORY_BADGE_STYLES,
  DayColumn,
  Priority,
  RECURRING_CONFIG,
  RECURRING_INTERVALS,
  RecurringInterval,
  TASK_CATEGORIES,
  TaskCategory,
  ThemeId,
  THEMES,
  calculateDayProgress,
  parseBulkImportLines,
} from '../utils/todoLogic';
import { PRIORITY_PILL_STYLES } from './InteractiveDashboard';

export interface BulkImportModalProps {
  isOpen: boolean;
  columns: DayColumn[];
  activeTheme: ThemeId;
  initialDayId?: string;
  onClose: () => void;
  onBulkImport: (
    dayId: string,
    rawInput: string,
    options?: BulkImportOptions
  ) => number;
}

const SAMPLE_BULK_TASKS = `- Finalize Q3 product roadmap slides #work !high
- Morning 5k run & mobility session #health @daily
- Review monthly budget spreadsheet #finance !med
- Order replacement water filter #home !low
- [x] Send follow-up email to design team #work`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  columns,
  activeTheme,
  initialDayId = 'mon',
  onClose,
  onBulkImport,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(initialDayId);
  const [rawText, setRawText] = useState<string>('');
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('Work');
  const [defaultPriority, setDefaultPriority] = useState<Priority>('Med');
  const [defaultRecurring, setDefaultRecurring] =
    useState<RecurringInterval>('none');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = THEMES[activeTheme];

  useEffect(() => {
    if (isOpen) {
      const validDay = columns.some((c) => c.id === initialDayId)
        ? initialDayId
        : columns[0]?.id || 'mon';
      setSelectedDayId(validDay);
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialDayId, columns]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const parsedPreviewItems = useMemo(
    () =>
      parseBulkImportLines(rawText, {
        defaultCategory,
        defaultPriority,
        defaultRecurring,
      }),
    [rawText, defaultCategory, defaultPriority, defaultRecurring]
  );

  if (!isOpen) return null;

  const targetColumn =
    columns.find((c) => c.id === selectedDayId) || columns[0];
  const targetDayName = targetColumn?.dayName || 'Monday';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (parsedPreviewItems.length === 0) return;

    onBulkImport(selectedDayId, rawText, {
      defaultCategory,
      defaultPriority,
      defaultRecurring,
    });
    setRawText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-import-modal-title"
        data-testid="bulk-import-modal"
        className="bg-[#FAF6F0] border border-[#E5DEC9] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-5 pb-3.5 border-b border-[#ECE6DC] flex items-start justify-between gap-3 bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${theme.progressFill}20`,
                borderColor: `${theme.progressFill}40`,
                color: theme.checkboxBg,
              }}
            >
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#B05C37] block">
                MULTI-LINE TASK IMPORTER
              </span>
              <h2
                id="bulk-import-modal-title"
                className="font-serif-display text-lg sm:text-xl font-bold text-[#2F2B28]"
              >
                Bulk Import Tasks to Day Column
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk import modal"
            data-testid="bulk-import-close-btn"
            className="text-[#8A8279] hover:text-[#2F2B28] p-1.5 rounded-full hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="px-5 sm:px-6 py-4 overflow-y-auto space-y-4 flex-1"
        >
          {/* Step 1: Select Target Day Column */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="bulk-import-day-select"
                className="text-[11px] font-bold tracking-wider uppercase text-[#6E675F]"
              >
                1. Target Day Column
              </label>
              <select
                id="bulk-import-day-select"
                aria-label="Target day column for bulk import"
                data-testid="bulk-import-day-select"
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="bg-white border border-[#DED8CE] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2F2B28] focus:outline-none focus:border-[#C87D55] cursor-pointer"
              >
                {columns.map((col) => {
                  const prog = calculateDayProgress(col.tasks);
                  return (
                    <option key={col.id} value={col.id}>
                      {col.dayName} ({col.dateLabel}) — {prog.fractionLabel} tasks
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Interactive 7-Day Column Pill Selector */}
            <div
              role="group"
              aria-label="Choose target day column"
              className="grid grid-cols-4 sm:grid-cols-7 gap-1.5"
            >
              {columns.map((col, idx) => {
                const isSelected = col.id === selectedDayId;
                const prog = calculateDayProgress(col.tasks);
                const headerBg = theme.dayHeaders[idx] || '#F5E6D8';
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedDayId(col.id)}
                    aria-pressed={isSelected}
                    data-testid={`bulk-import-day-pill-${col.id}`}
                    className={`px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-[#2F2B28] border-[#2F2B28] shadow-xs scale-[1.02]'
                        : 'border-[#E2DBD0] opacity-80 hover:opacity-100 bg-white'
                    }`}
                    style={{
                      backgroundColor: isSelected ? headerBg : '#FFFFFF',
                    }}
                  >
                    <span className="text-[11px] font-bold text-[#2F2B28] truncate block">
                      {col.dayName.slice(0, 3)}
                    </span>
                    <span className="text-[9px] font-semibold text-[#6E675F] tabular-nums">
                      {prog.fractionLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Default Tag, Priority & Recurrence for Imported Lines */}
          <div className="bg-white rounded-2xl border border-[#EAE3D9] p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8279]">
                Default Tag:
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {TASK_CATEGORIES.map((cat) => {
                  const style = CATEGORY_BADGE_STYLES[cat];
                  const active = defaultCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDefaultCategory(cat)}
                      aria-pressed={active}
                      data-testid={`bulk-import-default-cat-${cat}`}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        active
                          ? 'ring-2 ring-[#2F2B28]/45 scale-105'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: style.border,
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Default Priority */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8279]">
                  Priority:
                </span>
                {(['High', 'Med', 'Low'] as Priority[]).map((prio) => {
                  const active = defaultPriority === prio;
                  const pStyle = PRIORITY_PILL_STYLES[prio];
                  return (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setDefaultPriority(prio)}
                      aria-pressed={active}
                      data-testid={`bulk-import-default-prio-${prio}`}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        active
                          ? 'ring-2 ring-[#2F2B28]/45 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: pStyle.bg,
                        color: pStyle.text,
                      }}
                    >
                      {prio}
                    </button>
                  );
                })}
              </div>

              {/* Default Repeat */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8279]">
                  Repeat:
                </span>
                {RECURRING_INTERVALS.map((interval) => {
                  const conf = RECURRING_CONFIG[interval];
                  const active = defaultRecurring === interval;
                  return (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setDefaultRecurring(interval)}
                      aria-pressed={active}
                      data-testid={`bulk-import-default-rec-${interval}`}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer inline-flex items-center gap-0.5 ${
                        active
                          ? 'ring-2 ring-[#2F2B28]/45 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: conf.bg,
                        color: conf.text,
                        borderColor: conf.border,
                      }}
                    >
                      <Repeat className="w-2.5 h-2.5" />
                      <span>{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Multi-line Textarea */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="bulk-import-textarea"
                className="text-[11px] font-bold tracking-wider uppercase text-[#6E675F]"
              >
                2. Paste Task List (One task per line)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRawText(SAMPLE_BULK_TASKS)}
                  data-testid="bulk-import-sample-btn"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9A4E28] bg-[#F5DFD0] hover:bg-[#EED2BF] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Paste Sample List</span>
                </button>
                {rawText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    data-testid="bulk-import-clear-btn"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7A7269] hover:text-[#2F2B28] px-2 py-0.5 rounded-full hover:bg-[#EFECE6] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="bulk-import-textarea"
              ref={textareaRef}
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Paste or type multiple tasks (one per line):\n- Prepare Q3 marketing deck #work !high\n- Morning 5k run #health @daily\n- [x] Pay electricity bill #finance`}
              aria-label="Paste list of tasks to bulk import"
              data-testid="bulk-import-textarea"
              className="w-full bg-white border border-[#DED8CE] focus:border-[#C87D55] focus:ring-2 focus:ring-[#C87D55]/25 rounded-2xl p-3.5 text-xs sm:text-[13px] font-medium text-[#2F2B28] placeholder:text-[#A59E95] leading-relaxed focus:outline-none resize-y"
            />
            <p className="text-[10.5px] text-[#8A8279] mt-1">
              Supports bullets (<code className="font-mono">-</code>,{' '}
              <code className="font-mono">*</code>,{' '}
              <code className="font-mono">1.</code>), checkboxes (
              <code className="font-mono">[ ]</code>,{' '}
              <code className="font-mono">[x]</code>), inline tags (
              <code className="font-mono">#work</code>,{' '}
              <code className="font-mono">#health</code>), priorities (
              <code className="font-mono">!high</code>,{' '}
              <code className="font-mono">!low</code>), and recurrence (
              <code className="font-mono">@daily</code>,{' '}
              <code className="font-mono">@weekly</code>).
            </p>
          </div>

          {/* Live Parsed Tasks Preview */}
          <div
            data-testid="bulk-import-preview-container"
            className="bg-white rounded-2xl border border-[#EAE3D9] p-3"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#8A8279]">
                LIVE IMPORT PREVIEW ({parsedPreviewItems.length}{' '}
                {parsedPreviewItems.length === 1 ? 'TASK' : 'TASKS'} →{' '}
                {targetDayName.toUpperCase()})
              </span>
              {parsedPreviewItems.length > 0 && (
                <span className="text-[10px] font-semibold text-[#5A534C]">
                  Press <kbd className="px-1 py-0.2 bg-[#F4EFE6] border border-[#DED8CE] rounded text-[9px] font-bold">Ctrl+Enter</kbd> to import
                </span>
              )}
            </div>

            {parsedPreviewItems.length === 0 ? (
              <p className="text-xs text-[#9C948B] italic py-2 text-center">
                Paste or type lines above to preview the tasks that will be added to{' '}
                <strong className="text-[#5A534C] not-italic">{targetDayName}</strong>.
              </p>
            ) : (
              <ul
                data-testid="bulk-import-preview-list"
                className="divide-y divide-[#F4F0E8] max-h-36 overflow-y-auto pr-1"
              >
                {parsedPreviewItems.map((item, idx) => {
                  const catStyle = CATEGORY_BADGE_STYLES[item.category];
                  const prioStyle = PRIORITY_PILL_STYLES[item.priority];
                  const recConf = RECURRING_CONFIG[item.recurring];
                  return (
                    <li
                      key={`${idx}-${item.cleanText}`}
                      data-testid={`bulk-import-preview-item-${idx}`}
                      className="py-1.5 px-1 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-[4px] flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: item.completed
                              ? theme.checkboxBg
                              : '#FAF8F5',
                            border: item.completed
                              ? 'none'
                              : '1.5px solid #D7D0C6',
                          }}
                        >
                          {item.completed && (
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          )}
                        </span>
                        <span
                          className={`truncate font-medium ${
                            item.completed
                              ? 'line-through text-[#A59E95]'
                              : 'text-[#2F2B28]'
                          }`}
                        >
                          {item.cleanText}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none"
                          style={{
                            backgroundColor: catStyle.bg,
                            color: catStyle.text,
                            borderColor: catStyle.border,
                          }}
                        >
                          {item.category}
                        </span>
                        {item.recurring !== 'none' && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold border leading-none inline-flex items-center gap-0.5"
                            style={{
                              backgroundColor: recConf.bg,
                              color: recConf.text,
                              borderColor: recConf.border,
                            }}
                          >
                            <Repeat className="w-2 h-2" />
                            <span>{recConf.shortLabel}</span>
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold leading-none"
                          style={{
                            backgroundColor: prioStyle.bg,
                            color: prioStyle.text,
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#ECE6DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#6E675F] hover:text-[#2F2B28] hover:bg-[#EFECE6] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={parsedPreviewItems.length === 0}
              data-testid="bulk-import-submit-btn"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm transition-all cursor-pointer disabled:opacity-45 disabled:pointer-events-none active:scale-98"
              style={{
                backgroundColor: theme.checkboxBg,
              }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                Import {parsedPreviewItems.length}{' '}
                {parsedPreviewItems.length === 1 ? 'Task' : 'Tasks'} to{' '}
                {targetDayName}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
