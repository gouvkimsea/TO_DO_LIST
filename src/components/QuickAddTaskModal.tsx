import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Plus, Repeat, X } from 'lucide-react';
import {
  CustomCategoryDefinition,
  DayColumn,
  RECURRING_CONFIG,
  RecurringInterval,
  TaskCategory,
  ThemeId,
  THEMES,
  getAllCategories,
  getCategoryBadgeStyle,
  resolveCurrentWeekDueDateBadge,
  resolveDefaultDueDateForDayColumn,
} from '../utils/todoLogic';
import {
  resolveDefaultQuickAddDayId,
  validateQuickAddTaskInput,
} from '../utils/quickAddLogic';

export interface QuickAddTaskModalProps {
  isOpen: boolean;
  columns: DayColumn[];
  activeTheme: ThemeId;
  selectedDate?: string;
  customCategories?: CustomCategoryDefinition[];
  defaultDayId?: string;
  onClose: () => void;
  onAddTask: (
    dayId: string,
    text: string,
    category: TaskCategory,
    recurring: RecurringInterval,
    dueDate?: string
  ) => void;
}

const REPEAT_OPTIONS: { id: RecurringInterval; label: string }[] = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  isOpen,
  columns,
  activeTheme,
  selectedDate = '2026-06-11',
  customCategories = [],
  defaultDayId,
  onClose,
  onAddTask,
}) => {
  const theme = THEMES[activeTheme];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedDefaultDay =
    defaultDayId && columns.some((c) => c.id === defaultDayId)
      ? defaultDayId
      : resolveDefaultQuickAddDayId(columns);

  const [taskText, setTaskText] = useState<string>('');
  const [selectedDayId, setSelectedDayId] = useState<string>(resolvedDefaultDay);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Work');
  const [selectedRecurring, setSelectedRecurring] =
    useState<RecurringInterval>('none');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allCategories = getAllCategories(customCategories);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDayId(resolvedDefaultDay);
    setErrorMessage(null);
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [isOpen, resolvedDefaultDay]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dueDatePreview = resolveCurrentWeekDueDateBadge(
    selectedDueDate || undefined,
    selectedDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateQuickAddTaskInput(taskText);
    if (!result.valid) {
      setErrorMessage(result.error || 'Please type a short task name first.');
      inputRef.current?.focus();
      return;
    }
    onAddTask(
      selectedDayId,
      result.sanitizedText,
      selectedCategory,
      selectedRecurring,
      selectedDueDate.trim() || undefined
    );
    setTaskText('');
    setSelectedRecurring('none');
    setSelectedDueDate('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-task-title"
      data-testid="quick-add-task-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        data-testid="quick-add-task-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
      />

      {/* Slide-up Bottom Sheet on Mobile, Centered Card on Desktop */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-md bg-[#FDFBF7] border-t sm:border border-[#E5DEC9] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <span className="w-10 h-1 rounded-full bg-[#D8CFC2]" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-3 border-b border-[#EFEAE1] flex items-center justify-between gap-3">
          <div>
            <h2
              id="quick-add-task-title"
              className="text-lg font-extrabold text-[#2F2B28] tracking-tight"
            >
              Add a Task
            </h2>
            <p className="text-xs font-medium text-[#7A7269]">
              Type what you want to do and pick a day.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Task"
            data-testid="quick-add-close-btn"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-[#6E665E] hover:text-[#2F2B28] hover:bg-[#F2EFE9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* Task Name */}
          <div>
            <label
              htmlFor="quick-add-task-input"
              className="block text-sm font-bold text-[#2F2B28] mb-1.5"
            >
              What needs to be done?
            </label>
            <input
              ref={inputRef}
              id="quick-add-task-input"
              type="text"
              value={taskText}
              onChange={(e) => {
                setTaskText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Buy groceries, Walk the dog, Send email"
              data-testid="quick-add-task-input"
              aria-invalid={Boolean(errorMessage)}
              className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white border text-base font-medium text-[#2F2B28] placeholder:text-[#A59E95] focus:outline-none focus:ring-2 transition-colors ${
                errorMessage
                  ? 'border-[#C94B3E] focus:border-[#C94B3E] focus:ring-[#C94B3E]/20'
                  : 'border-[#DED8CE] focus:border-[#C26D43] focus:ring-[#C26D43]/20'
              }`}
            />
            {errorMessage && (
              <p
                role="alert"
                data-testid="quick-add-error"
                className="mt-1.5 text-xs font-semibold text-[#B3392D]"
              >
                {errorMessage}
              </p>
            )}
          </div>

          {/* Day Picker */}
          <div>
            <span className="block text-sm font-bold text-[#2F2B28] mb-1.5">
              Which day?
            </span>
            <div
              role="group"
              aria-label="Choose day for task"
              className="grid grid-cols-7 gap-1"
            >
              {columns.map((col) => {
                const isSelected = selectedDayId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedDayId(col.id)}
                    aria-pressed={isSelected}
                    data-testid={`quick-add-day-${col.id}`}
                    className={`min-h-[44px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2F2B28] text-[#FAF6F0] border-[#2F2B28] shadow-xs'
                        : 'bg-white text-[#4A433C] border-[#E5DEC9] hover:bg-[#F5F1EB]'
                    }`}
                  >
                    <span>{col.dayName.slice(0, 3)}</span>
                    {col.isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-[#E8956B]' : 'bg-[#C26D43]'
                        }`}
                        aria-label="Today"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="quick-add-due-date-input"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2F2B28]"
              >
                <Calendar className="w-3.5 h-3.5 text-[#8A8279]" />
                <span>Due Date</span>
                <span className="text-xs font-normal text-[#8A8279]">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDueDate(
                      resolveDefaultDueDateForDayColumn(
                        selectedDayId,
                        selectedDate
                      )
                    )
                  }
                  data-testid="quick-add-due-date-this-day-btn"
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F2EFE9] hover:bg-[#E7E2D8] text-[#4A433C] border border-[#DED6C8] transition-colors cursor-pointer"
                >
                  Same as day
                </button>
                {selectedDueDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDueDate('')}
                    data-testid="quick-add-due-date-clear-btn"
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold text-[#8A5A44] hover:bg-[#F5ECE6] transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="quick-add-due-date-input"
                type="date"
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                aria-label="Task due date"
                data-testid="quick-add-due-date-input"
                className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#DED8CE] focus:border-[#C26D43] focus:outline-none focus:ring-2 focus:ring-[#C26D43]/20 text-sm font-semibold text-[#2F2B28] cursor-pointer"
              />
              {dueDatePreview && (
                <span
                  data-testid="quick-add-due-date-preview-badge"
                  data-in-current-week={
                    dueDatePreview.isInCurrentWeek ? 'true' : 'false'
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border shrink-0 ${
                    dueDatePreview.isInCurrentWeek
                      ? 'bg-[#FAF1EA] text-[#9A4E28] border-[#E6C9B5]'
                      : 'bg-[#F2EFE9] text-[#7A7269] border-[#E2DBD0]'
                  }`}
                >
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>
                    {dueDatePreview.shortLabel}
                    {dueDatePreview.isInCurrentWeek ? ' (This week)' : ''}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Tag Picker */}
          <div>
            <span className="block text-sm font-bold text-[#2F2B28] mb-1.5">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const style = getCategoryBadgeStyle(cat, customCategories);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={isSelected}
                    data-testid={`quick-add-category-${cat}`}
                    className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#2F2B28] shadow-xs'
                        : 'opacity-80 hover:opacity-100'
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

          {/* Repeat Picker */}
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2F2B28] mb-1.5">
              <Repeat className="w-3.5 h-3.5 text-[#8A8279]" />
              <span>Repeat</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5 bg-[#F2EFE9] p-1 rounded-xl border border-[#E4DDD3]">
              {REPEAT_OPTIONS.map((opt) => {
                const isSelected = selectedRecurring === opt.id;
                const cfg = opt.id !== 'none' ? RECURRING_CONFIG[opt.id] : null;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedRecurring(opt.id)}
                    aria-pressed={isSelected}
                    data-testid={`quick-add-repeat-${opt.id}`}
                    className={`min-h-[40px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#2F2B28] shadow-xs'
                        : 'text-[#6E665E] hover:text-[#2F2B28]'
                    }`}
                    style={
                      isSelected && cfg
                        ? { color: cfg.text }
                        : undefined
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="px-5 py-3.5 pb-safe border-t border-[#EFEAE1] bg-[#FAF6F0] flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-xl bg-white hover:bg-[#F2EFE9] border border-[#DED8CE] text-sm font-bold text-[#4A433C] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="quick-add-submit-btn"
            data-custom-btn="primary"
            className="flex-1 min-h-[48px] px-5 rounded-xl text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-sm hover:brightness-95 active:scale-[0.99] transition-all cursor-pointer"
            style={{ backgroundColor: theme.checkboxBg }}
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span>Add Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};
