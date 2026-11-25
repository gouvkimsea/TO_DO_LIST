import React, { useEffect } from 'react';
import { X, Keyboard, CheckCircle2, Sparkles } from 'lucide-react';
import {
  KEYBOARD_SHORTCUTS,
  KeyboardShortcutCategory,
} from '../utils/todoLogic';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSave: () => void;
}

const SHORTCUT_CATEGORIES: KeyboardShortcutCategory[] = [
  'Saving & Editing',
  'Views & Search',
  'Navigation & Modals',
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onTriggerSave,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs p-0 sm:p-4 animate-[fadeInBackdrop_180ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-modal-title"
      data-testid="keyboard-shortcuts-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#FAF7F2] border-t sm:border border-[#E2D9CC] rounded-t-3xl sm:rounded-2xl sm:max-w-2xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-[slideUpSheet_220ms_cubic-bezier(0.22,1,0.36,1)] pb-safe">
        {/* Modal Top Chrome Bar */}
        <div className="bg-[#EFEBE4] px-4 sm:px-5 py-3 border-b border-[#E2D9CC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline-block w-3 h-3 rounded-full bg-[#ED6A5E] shrink-0" />
            <span className="hidden sm:inline-block w-3 h-3 rounded-full bg-[#F4BF4F] shrink-0" />
            <span className="hidden sm:inline-block w-3 h-3 rounded-full bg-[#61C554] shrink-0" />
            <div className="sm:ml-2 flex items-center gap-1.5 min-w-0">
              <Keyboard className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#B05C37] shrink-0" />
              <h2
                id="keyboard-shortcuts-modal-title"
                className="text-sm font-bold text-[#2F2B28] truncate"
              >
                Keyboard Shortcuts &amp; Quick Navigation
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts modal"
            data-testid="close-shortcuts-modal-btn"
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[#7A7269] hover:text-[#2F2B28] px-2 py-1 rounded-xl sm:rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1 text-xs font-semibold"
          >
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold bg-white border border-[#D8CFC2] rounded text-[#5A534C]">
              Esc
            </kbd>
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-y-contain space-y-4">
          {/* Quick Highlight Banner */}
          <div className="bg-white border border-[#E6DFD3] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F2B28]">
                <Sparkles className="w-3.5 h-3.5 text-[#C26D43] shrink-0" />
                <span>Instant Local Save &amp; Keyboard Flow</span>
              </div>
              <p className="text-xs text-[#6E675F]">
                Press{' '}
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F4EFE6] border border-[#DDD4C6] rounded text-[#2F2B28]">
                  Ctrl + Enter
                </kbd>{' '}
                (or{' '}
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F4EFE6] border border-[#DDD4C6] rounded text-[#2F2B28]">
                  ⌘ + Enter
                </kbd>
                ) anytime to commit your active task or note and confirm local
                sync.
              </p>
            </div>

            <button
              type="button"
              data-testid="modal-test-save-shortcut-btn"
              onClick={() => {
                onTriggerSave();
              }}
              className="min-h-[44px] sm:min-h-0 bg-[#C26D43] hover:bg-[#AD5D35] text-white text-xs font-bold px-4 sm:px-3.5 py-2 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Now (Ctrl+Enter)</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            {SHORTCUT_CATEGORIES.map((category) => {
              const items = KEYBOARD_SHORTCUTS.filter(
                (item) => item.category === category
              );
              return (
                <div key={category} className="space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] px-1">
                    {category}
                  </h3>
                  <div className="bg-white border border-[#E8E2D8] rounded-xl divide-y divide-[#F2ECE3]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        data-testid={`shortcut-row-${item.id}`}
                        className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2F2B28]">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-[#7A7269] leading-snug">
                            {item.description}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            {item.keys.map((k, idx) => (
                              <React.Fragment key={k}>
                                {idx > 0 && (
                                  <span className="text-[10px] font-bold text-[#9C948B]">
                                    +
                                  </span>
                                )}
                                <kbd className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold bg-[#FAF6F0] border border-[#DCD3C6] border-b-2 rounded-md text-[#2F2B28] shadow-2xs tabular-nums">
                                  {k}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </span>

                          {item.macKeys && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#8A8279]">
                              <span>or</span>
                              {item.macKeys.map((mk, idx) => (
                                <React.Fragment key={mk}>
                                  {idx > 0 && (
                                    <span className="text-[10px] font-bold text-[#9C948B]">
                                      +
                                    </span>
                                  )}
                                  <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F4EFE6] border border-[#DDD4C6] rounded text-[#4A433C]">
                                    {mk}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F4EFE6] px-4 sm:px-5 py-3 sm:py-2.5 border-t border-[#E2D9CC] flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs sm:text-[11px] font-semibold text-[#7A7269]">
            Tip: Press{' '}
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-[#D8CFC2] rounded text-[#2F2B28]">
              ?
            </kbd>{' '}
            anytime when not typing to toggle this guide.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] sm:min-h-0 px-5 sm:px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold bg-[#2F2B28] hover:bg-[#433E3A] text-white transition-colors cursor-pointer shrink-0"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
