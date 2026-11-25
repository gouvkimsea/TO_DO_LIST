import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  List,
  CheckSquare,
  Link2,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { MarkdownNoteRenderer } from './MarkdownNoteRenderer';

interface DetailedTaskNotesPanelProps {
  taskId: string;
  taskTitle: string;
  notes: string;
  isExpanded: boolean;
  onToggleExpanded: (nextOpen: boolean) => void;
  onUpdateNotes?: (notes: string) => void;
  testIdPrefix?: string;
}

export const DetailedTaskNotesPanel: React.FC<DetailedTaskNotesPanelProps> = ({
  taskId,
  taskTitle,
  notes,
  isExpanded,
  onToggleExpanded,
  onUpdateNotes,
  testIdPrefix = 'detailed',
}) => {
  const hasNotes = notes.trim().length > 0;
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wordCount = hasNotes
    ? notes.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const insertMarkdownSnippet = (
    prefix: string,
    suffix: string,
    placeholder: string
  ) => {
    if (!onUpdateNotes) return;
    const el = textareaRef.current;
    if (!el) {
      const next = notes
        ? `${notes}\n${prefix}${placeholder}${suffix}`
        : `${prefix}${placeholder}${suffix}`;
      onUpdateNotes(next);
      return;
    }

    const start = el.selectionStart ?? notes.length;
    const end = el.selectionEnd ?? notes.length;
    const selected = notes.slice(start, end) || placeholder;
    const nextValue =
      notes.slice(0, start) + prefix + selected + suffix + notes.slice(end);
    onUpdateNotes(nextValue);

    window.requestAnimationFrame(() => {
      el.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + selected.length;
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  // Collapsed inline rendered Markdown preview when the task already has notes
  if (!isExpanded) {
    if (!hasNotes) return null;
    return (
      <div
        data-testid={`${testIdPrefix}-notes-preview-${taskId}`}
        className="ml-0 sm:ml-6 mt-0.5 rounded-lg bg-[#FAF7F2] border border-[#EDE6DB] px-2.5 py-2 flex items-start justify-between gap-2"
      >
        <MarkdownNoteRenderer
          content={notes}
          compact
          testId={`${testIdPrefix}-notes-markdown-${taskId}`}
          className="flex-1 min-w-0"
        />
        {onUpdateNotes && (
          <button
            type="button"
            onClick={() => {
              setEditorTab('write');
              onToggleExpanded(true);
            }}
            data-testid={`${testIdPrefix}-notes-edit-inline-${taskId}`}
            aria-label={`Edit Markdown notes for "${taskTitle}"`}
            title="Edit Markdown notes"
            className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1.5 sm:py-0.5 rounded-lg sm:rounded text-xs sm:text-[10px] font-bold text-[#8A7E72] hover:text-[#2F2B28] hover:bg-[#EFE9DF] transition-colors cursor-pointer shrink-0"
          >
            <Pencil className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
            <span>Edit</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid={`${testIdPrefix}-notes-drawer-${taskId}`}
      aria-label={`Markdown notes editor for ${taskTitle || 'task'}`}
      className="ml-0 sm:ml-6 mt-1 rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] p-2.5 space-y-2 shadow-2xs"
    >
      {/* Header: Mode Tabs (Write / Preview) + Word Count + Clear + Close */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#ECE5DA]">
        <div className="flex items-center gap-1.5">
          <div
            role="tablist"
            aria-label="Note editor view mode"
            className="inline-flex items-center bg-[#EFECE6] p-0.5 rounded-lg border border-[#E4DDD3]"
          >
            <button
              type="button"
              role="tab"
              aria-selected={editorTab === 'write'}
              data-testid={`${testIdPrefix}-notes-tab-write-${taskId}`}
              onClick={() => setEditorTab('write')}
              className={`inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 rounded-md text-xs sm:text-[10px] font-bold transition-colors cursor-pointer ${
                editorTab === 'write'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#7A7269] hover:text-[#2F2B28]'
              }`}
            >
              <Pencil className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorTab === 'preview'}
              data-testid={`${testIdPrefix}-notes-tab-preview-${taskId}`}
              onClick={() => setEditorTab('preview')}
              className={`inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-2 py-1 sm:py-0.5 rounded-md text-xs sm:text-[10px] font-bold transition-colors cursor-pointer ${
                editorTab === 'preview'
                  ? 'bg-white text-[#2F2B28] shadow-2xs'
                  : 'text-[#7A7269] hover:text-[#2F2B28]'
              }`}
            >
              <Eye className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
              <span>Preview</span>
            </button>
          </div>
          <span className="text-xs sm:text-[10px] font-semibold text-[#8A8279] tabular-nums whitespace-nowrap">
            Markdown · {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-1">
          {hasNotes && onUpdateNotes && (
            <button
              type="button"
              onClick={() => onUpdateNotes('')}
              data-testid={`${testIdPrefix}-notes-clear-${taskId}`}
              aria-label={`Clear notes for "${taskTitle}"`}
              title="Clear notes"
              className="min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 p-1.5 sm:p-1 rounded-lg sm:rounded text-[#8A8279] hover:text-[#A13528] hover:bg-[#FBEAE8] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleExpanded(false)}
            data-testid={`${testIdPrefix}-notes-close-${taskId}`}
            aria-label={`Done editing notes for "${taskTitle}"`}
            title="Done (Esc)"
            className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-3 sm:px-2 py-1 sm:py-0.5 rounded-lg sm:rounded-md bg-[#2F2B28] hover:bg-[#433D38] text-white text-xs sm:text-[10px] font-bold transition-colors cursor-pointer"
          >
            <X className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* Write Mode: Formatting Toolbar + Textarea */}
      {editorTab === 'write' ? (
        <div className="space-y-1.5">
          {onUpdateNotes && (
            <div
              role="toolbar"
              aria-label="Markdown formatting toolbar"
              className="flex flex-wrap items-center gap-1"
            >
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('**', '**', 'bold text')}
                data-testid={`${testIdPrefix}-md-bold-${taskId}`}
                aria-label="Insert bold formatting"
                title="Bold (**text**)"
                className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 rounded-lg sm:rounded bg-white hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs sm:text-[10px] font-bold text-[#4A433C] cursor-pointer transition-colors"
              >
                <Bold className="w-3 h-3" />
                <span>Bold</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('*', '*', 'italic text')}
                data-testid={`${testIdPrefix}-md-italic-${taskId}`}
                aria-label="Insert italic formatting"
                title="Italic (*text*)"
                className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 rounded-lg sm:rounded bg-white hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs sm:text-[10px] font-bold text-[#4A433C] cursor-pointer transition-colors"
              >
                <Italic className="w-3 h-3" />
                <span>Italic</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('\n- ', '', 'list item')}
                data-testid={`${testIdPrefix}-md-list-${taskId}`}
                aria-label="Insert bullet list item"
                title="Bullet list (- item)"
                className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 rounded-lg sm:rounded bg-white hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs sm:text-[10px] font-bold text-[#4A433C] cursor-pointer transition-colors"
              >
                <List className="w-3 h-3" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdownSnippet('\n- [ ] ', '', 'subtask')}
                data-testid={`${testIdPrefix}-md-checklist-${taskId}`}
                aria-label="Insert checklist item"
                title="Checklist (- [ ] item)"
                className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 rounded-lg sm:rounded bg-white hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs sm:text-[10px] font-bold text-[#4A433C] cursor-pointer transition-colors"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Check</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  insertMarkdownSnippet('[', '](https://example.com)', 'link label')
                }
                data-testid={`${testIdPrefix}-md-link-${taskId}`}
                aria-label="Insert link"
                title="Link ([label](https://...))"
                className="inline-flex items-center gap-1 min-h-[36px] sm:min-h-0 px-2.5 sm:px-1.5 py-1 rounded-lg sm:rounded bg-white hover:bg-[#EFECE6] border border-[#E5DEC9] text-xs sm:text-[10px] font-bold text-[#4A433C] cursor-pointer transition-colors"
              >
                <Link2 className="w-3 h-3" />
                <span>Link</span>
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows={4}
            value={notes}
            readOnly={!onUpdateNotes}
            data-testid={`${testIdPrefix}-notes-input-${taskId}`}
            aria-label={`Markdown notes for ${taskTitle || 'task'}`}
            placeholder="Write notes with **bold**, *italic*, - lists, - [ ] checklists, or [links](https://...)..."
            onChange={(e) => onUpdateNotes?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onToggleExpanded(false);
              } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onToggleExpanded(false);
              }
            }}
            className="w-full rounded-lg bg-white border border-[#E2D9CC] px-3 sm:px-2.5 py-2.5 sm:py-2 text-base sm:text-xs text-[#2F2B28] placeholder:text-[#9C948B] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C26D43]/30 focus:border-[#C26D43] resize-y"
          />

          {/* Compact live preview hint while editing */}
          {hasNotes && (
            <div className="rounded-lg bg-white/80 border border-[#ECE5DA] px-2.5 py-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#9A8F82] block mb-1">
                Live Preview
              </span>
              <MarkdownNoteRenderer
                content={notes}
                compact
                testId={`${testIdPrefix}-notes-live-preview-${taskId}`}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          data-testid={`${testIdPrefix}-notes-full-preview-${taskId}`}
          className="rounded-lg bg-white border border-[#E5DEC9] px-3 py-2.5 min-h-[72px]"
        >
          {hasNotes ? (
            <MarkdownNoteRenderer
              content={notes}
              testId={`${testIdPrefix}-notes-markdown-${taskId}`}
            />
          ) : (
            <p className="text-xs italic text-[#9C948B]">
              No notes yet. Switch to Write to format notes with bold, lists, or
              links.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
