import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Check,
  SlidersHorizontal,
  Calendar,
  Tag,
  ArrowUpRight,
  RotateCcw,
  FileText,
  Plus,
} from 'lucide-react';
import {
  CUSTOM_CATEGORY_COLOR_PRESETS,
  CategoryColorId,
  CustomCategoryDefinition,
  DEFAULT_TASK_CATEGORIES,
  DayColumn,
  DetailedTask,
  PagePath,
  Priority,
  TaskCategory,
  TaskSearchCompletionFilter,
  TaskSearchPriorityFilter,
  TaskSearchResultItem,
  TaskSearchScopeFilter,
  ThemeId,
  THEMES,
  ViewMode,
  getAllCategories,
  getCategoryBadgeStyle,
  sanitizeCustomCategoryName,
  searchTasksAcrossAllDaysAndCategories,
} from '../utils/todoLogic';
import {
  PRIORITY_PILL_STYLES,
  STATUS_PILL_STYLES,
} from './InteractiveDashboard';

export interface TaskSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  columns: DayColumn[];
  monthlyGoals: DetailedTask[];
  yearlyGoals: DetailedTask[];
  activeTheme: ThemeId;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  customCategories: CustomCategoryDefinition[];
  onAddCustomCategory?: (
    name: string,
    colorId?: CategoryColorId
  ) => CustomCategoryDefinition | null;
  onToggleDailyTask: (dayId: string, taskId: string) => void;
  onCycleDailyPriority: (dayId: string, taskId: string) => void;
  onCycleDailyCategory: (
    dayId: string,
    taskId: string,
    explicitCategory?: TaskCategory
  ) => void;
  onToggleGoalTask: (mode: 'month' | 'year', taskId: string) => void;
  onCycleGoalPriority: (mode: 'month' | 'year', taskId: string) => void;
  onCycleGoalCategory: (mode: 'month' | 'year', taskId: string) => void;
  onNavigate?: (path: PagePath) => void;
  onSelectView?: (view: ViewMode) => void;
}

const DAY_SCOPE_OPTIONS: ReadonlyArray<{
  id: TaskSearchScopeFilter;
  label: string;
  shortLabel: string;
}> = [
  { id: 'all', label: 'All Days & Goals', shortLabel: 'All' },
  { id: 'mon', label: 'Monday', shortLabel: 'Mon' },
  { id: 'tue', label: 'Tuesday', shortLabel: 'Tue' },
  { id: 'wed', label: 'Wednesday', shortLabel: 'Wed' },
  { id: 'thu', label: 'Thursday', shortLabel: 'Thu' },
  { id: 'fri', label: 'Friday', shortLabel: 'Fri' },
  { id: 'sat', label: 'Saturday', shortLabel: 'Sat' },
  { id: 'sun', label: 'Sunday', shortLabel: 'Sun' },
  { id: 'monthly', label: 'Monthly Goals', shortLabel: 'Monthly' },
  { id: 'yearly', label: 'Yearly Goals', shortLabel: 'Yearly' },
];

export const TaskSearchOverlay: React.FC<TaskSearchOverlayProps> = ({
  isOpen,
  onClose,
  columns,
  monthlyGoals,
  yearlyGoals,
  activeTheme,
  searchQuery,
  onSearchQueryChange,
  customCategories,
  onAddCustomCategory,
  onToggleDailyTask,
  onCycleDailyPriority,
  onCycleDailyCategory,
  onToggleGoalTask,
  onCycleGoalPriority,
  onCycleGoalCategory,
  onNavigate,
  onSelectView,
}) => {
  const [dayScope, setDayScope] = useState<TaskSearchScopeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | TaskCategory
  >('All');
  const [completionStatus, setCompletionStatus] =
    useState<TaskSearchCompletionFilter>('all');
  const [priorityFilter, setPriorityFilter] =
    useState<TaskSearchPriorityFilter>('all');

  const [isCreatingCustomTag, setIsCreatingCustomTag] =
    useState<boolean>(false);
  const [newCustomTagName, setNewCustomTagName] = useState<string>('');
  const [newCustomTagColor, setNewCustomTagColor] =
    useState<CategoryColorId>('teal');

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const theme = THEMES[activeTheme];

  const allCategories = useMemo(
    () => getAllCategories(customCategories),
    [customCategories]
  );

  // If a previously selected custom category was removed, reset to 'All'
  useEffect(() => {
    if (
      selectedCategory !== 'All' &&
      !allCategories.some(
        (c) => c.toLowerCase() === selectedCategory.toLowerCase()
      )
    ) {
      setSelectedCategory('All');
    }
  }, [allCategories, selectedCategory]);

  // Focus input when overlay opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const searchResults = useMemo(
    () =>
      searchTasksAcrossAllDaysAndCategories({
        columns,
        monthlyGoals,
        yearlyGoals,
        customCategories,
        filters: {
          query: searchQuery,
          dayScope,
          category: selectedCategory,
          completionStatus,
          priority: priorityFilter,
        },
      }),
    [
      columns,
      monthlyGoals,
      yearlyGoals,
      customCategories,
      searchQuery,
      dayScope,
      selectedCategory,
      completionStatus,
      priorityFilter,
    ]
  );

  if (!isOpen) return null;

  const handleResetAllFilters = () => {
    onSearchQueryChange('');
    setDayScope('all');
    setSelectedCategory('All');
    setCompletionStatus('all');
    setPriorityFilter('all');
    searchInputRef.current?.focus();
  };

  const handleCreateCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeCustomCategoryName(newCustomTagName);
    if (!cleaned || !onAddCustomCategory) return;
    const created = onAddCustomCategory(cleaned, newCustomTagColor);
    if (created) {
      setSelectedCategory(created.name);
      setNewCustomTagName('');
      setIsCreatingCustomTag(false);
    }
  };

  const handleToggleItem = (item: TaskSearchResultItem) => {
    if (item.sourceType === 'daily' && item.dayId) {
      onToggleDailyTask(item.dayId, item.id);
    } else if (item.sourceType === 'monthly') {
      onToggleGoalTask('month', item.id);
    } else if (item.sourceType === 'yearly') {
      onToggleGoalTask('year', item.id);
    }
  };

  const handleCycleItemCategory = (item: TaskSearchResultItem) => {
    if (item.sourceType === 'daily' && item.dayId) {
      onCycleDailyCategory(item.dayId, item.id);
    } else if (item.sourceType === 'monthly') {
      onCycleGoalCategory('month', item.id);
    } else if (item.sourceType === 'yearly') {
      onCycleGoalCategory('year', item.id);
    }
  };

  const handleCycleItemPriority = (item: TaskSearchResultItem) => {
    if (item.sourceType === 'daily' && item.dayId) {
      onCycleDailyPriority(item.dayId, item.id);
    } else if (item.sourceType === 'monthly') {
      onCycleGoalPriority('month', item.id);
    } else if (item.sourceType === 'yearly') {
      onCycleGoalPriority('year', item.id);
    }
  };

  const handleJumpToTaskContext = (item: TaskSearchResultItem) => {
    if (item.sourceType === 'daily') {
      onSelectView?.('week');
      onNavigate?.('/daily-columns');
    } else if (item.sourceType === 'monthly') {
      onSelectView?.('month');
      onNavigate?.('/monthly-yearly');
    } else {
      onSelectView?.('year');
      onNavigate?.('/monthly-yearly');
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-search-overlay-title"
      data-testid="task-search-overlay"
      data-total-matched={searchResults.totalMatched}
      data-active-day-scope={dayScope}
      data-active-category={selectedCategory}
      data-active-status={completionStatus}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-[#1E1B18]/55 backdrop-blur-[2px] flex items-start justify-center p-2.5 sm:p-5 lg:p-8 overflow-y-auto"
    >
      <div className="w-full max-w-4xl bg-[#FDFBF7] rounded-2xl border border-[#E2D9CC] shadow-[0_24px_60px_-15px_rgba(30,27,24,0.35)] overflow-hidden my-auto sm:my-4 flex flex-col max-h-[88dvh]">
        {/* Top Header & Search Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-[#ECE7DF]">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: theme.checkboxBg }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </span>
              <div>
                <h2
                  id="task-search-overlay-title"
                  className="text-sm sm:text-base font-bold text-[#2F2B28] leading-tight"
                >
                  Task Search &amp; Multi-Filter Explorer
                </h2>
                <p className="text-[11px] font-medium text-[#7A7269]">
                  Instantly find and filter tasks across all 7 days, monthly/yearly goals, custom categories, and notes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {searchResults.hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  data-testid="task-search-overlay-reset-all"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF4EC] hover:bg-[#F3E6D6] text-[#9A4E28] border border-[#E5CFB8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close task search overlay"
                data-testid="close-task-search-overlay-btn"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#5A534C] hover:text-[#2F2B28] bg-[#F2EFE9] hover:bg-[#E5DEC9] transition-colors cursor-pointer"
              >
                <span>Esc</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Search Input */}
          <div className="relative flex items-center">
            <Search
              className="w-4 h-4 text-[#8A8279] absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }
              }}
              placeholder="Type a task name, #category, priority, status, or note keyword..."
              aria-label="Search tasks across all days and categories"
              data-testid="task-search-overlay-input"
              className="w-full bg-[#FAF8F5] border border-[#DED8CE] focus:border-[#C87D55] focus:bg-white rounded-xl pl-10 pr-28 py-2.5 text-xs sm:text-sm font-semibold text-[#2F2B28] placeholder:text-[#9C948B] focus:outline-none transition-colors"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <span
                data-testid="task-search-overlay-match-badge"
                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F4EFE6] border border-[#E2D9CC] text-[#4A433C] tabular-nums"
              >
                {searchResults.totalMatched} of {searchResults.totalAvailable}
              </span>
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  aria-label="Clear search query text"
                  data-testid="task-search-overlay-clear-query"
                  className="p-1 rounded-full text-[#7A7269] hover:text-[#2F2B28] hover:bg-[#EFECE6] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Facet Filter Controls Bar */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-[#FAF7F2] border-b border-[#ECE7DF] space-y-2">
          {/* Row 1: Day & Goal Scope Filter */}
          <div
            role="group"
            aria-label="Filter tasks by day of week or goal horizon"
            data-testid="task-search-day-filter-bar"
            className="flex flex-wrap items-center gap-1"
          >
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-1">
              <Calendar className="w-3 h-3 text-[#B05C37]" />
              <span>DAY:</span>
            </span>
            {DAY_SCOPE_OPTIONS.map((opt) => {
              const isSelected = dayScope === opt.id;
              const count = searchResults.countsByDayScope[opt.id] ?? 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={`task-search-day-filter-${opt.id}`}
                  onClick={() =>
                    setDayScope((prev) =>
                      prev === opt.id && opt.id !== 'all' ? 'all' : opt.id
                    )
                  }
                  aria-pressed={isSelected}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                    isSelected
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                      : 'bg-white text-[#5A534C] border-[#E2D9CC] hover:bg-[#EFECE6]'
                  }`}
                >
                  {opt.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Row 2: Category & Custom Tags Filter */}
          <div
            role="group"
            aria-label="Filter tasks by category or custom tag"
            data-testid="task-search-category-filter-bar"
            className="flex flex-wrap items-center gap-1"
          >
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-1">
              <Tag className="w-3 h-3 text-[#B05C37]" />
              <span>TAGS:</span>
            </span>
            <button
              type="button"
              data-testid="task-search-category-filter-All"
              onClick={() => setSelectedCategory('All')}
              aria-pressed={selectedCategory === 'All'}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                selectedCategory === 'All'
                  ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                  : 'bg-white text-[#5A534C] border-[#E2D9CC] hover:bg-[#EFECE6]'
              }`}
            >
              All Tags ({searchResults.countsByCategory.All ?? 0})
            </button>
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = searchResults.countsByCategory[cat] ?? 0;
              const style = getCategoryBadgeStyle(cat, customCategories);
              const isCustom = !(
                DEFAULT_TASK_CATEGORIES as readonly string[]
              ).includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  data-testid={`task-search-category-filter-${cat}`}
                  data-custom-category={isCustom ? 'true' : 'false'}
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat ? 'All' : cat))
                  }
                  aria-pressed={isSelected}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap tabular-nums ${
                    isSelected
                      ? 'ring-2 ring-[#2F2B28]/50 scale-105 shadow-2xs'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    borderColor: style.border,
                  }}
                >
                  {cat} ({count})
                </button>
              );
            })}
            {onAddCustomCategory && (
              <button
                type="button"
                onClick={() => setIsCreatingCustomTag((prev) => !prev)}
                aria-expanded={isCreatingCustomTag}
                data-testid="task-search-add-custom-tag-btn"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                  isCreatingCustomTag
                    ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                    : 'bg-white text-[#6E6256] border-dashed border-[#C7BDB0] hover:border-[#2F2B28]'
                }`}
              >
                <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>Custom Tag</span>
              </button>
            )}
          </div>

          {/* Optional Inline Custom Tag Creator inside Search Overlay */}
          {isCreatingCustomTag && onAddCustomCategory && (
            <form
              onSubmit={handleCreateCustomTag}
              data-testid="task-search-custom-tag-form"
              className="p-2 rounded-xl bg-white border border-[#E2D9CC] flex flex-wrap items-center gap-2"
            >
              <input
                type="text"
                value={newCustomTagName}
                onChange={(e) => setNewCustomTagName(e.target.value)}
                placeholder="New custom tag (e.g. Sprint)"
                maxLength={20}
                aria-label="New custom category name"
                data-testid="task-search-custom-tag-input"
                className="bg-[#FAF8F5] border border-[#DED8CE] rounded-md px-2 py-1 text-[11px] font-semibold text-[#2F2B28] w-40 focus:outline-none focus:border-[#B05C37]"
              />
              <div className="inline-flex items-center gap-1">
                {Object.values(CUSTOM_CATEGORY_COLOR_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setNewCustomTagColor(preset.id)}
                    aria-label={`Select ${preset.label} color`}
                    data-testid={`task-search-custom-tag-color-${preset.id}`}
                    className={`w-4 h-4 rounded-full border cursor-pointer ${
                      newCustomTagColor === preset.id
                        ? 'ring-2 ring-[#2F2B28] scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: preset.bg,
                      borderColor: preset.text,
                    }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={!sanitizeCustomCategoryName(newCustomTagName)}
                data-testid="task-search-custom-tag-submit"
                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#2F2B28] text-white disabled:opacity-40 cursor-pointer"
              >
                Create &amp; Filter
              </button>
            </form>
          )}

          {/* Row 3: Completion Status & Priority Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#ECE7DF]">
            <div
              role="group"
              aria-label="Filter by completion status"
              className="inline-flex items-center gap-1"
            >
              <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-1">
                STATUS:
              </span>
              {(
                [
                  {
                    id: 'all',
                    label: `All (${searchResults.countsByCompletion.all})`,
                  },
                  {
                    id: 'pending',
                    label: `Pending (${searchResults.countsByCompletion.pending})`,
                  },
                  {
                    id: 'completed',
                    label: `Completed (${searchResults.countsByCompletion.completed})`,
                  },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  data-testid={`task-search-status-filter-${st.id}`}
                  onClick={() => setCompletionStatus(st.id)}
                  aria-pressed={completionStatus === st.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer tabular-nums ${
                    completionStatus === st.id
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                      : 'bg-white text-[#5A534C] border-[#E2D9CC] hover:bg-[#EFECE6]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Filter by task priority"
              className="inline-flex items-center gap-1"
            >
              <span className="text-[9.5px] font-bold tracking-wider uppercase text-[#8A8279] mr-1">
                PRIORITY:
              </span>
              {(['all', 'High', 'Med', 'Low'] as const).map((prio) => (
                <button
                  key={prio}
                  type="button"
                  data-testid={`task-search-priority-filter-${prio}`}
                  onClick={() =>
                    setPriorityFilter((prev) =>
                      prev === prio && prio !== 'all' ? 'all' : prio
                    )
                  }
                  aria-pressed={priorityFilter === prio}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                    priorityFilter === prio
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                      : 'bg-white text-[#5A534C] border-[#E2D9CC] hover:bg-[#EFECE6]'
                  }`}
                >
                  {prio === 'all' ? 'Any Priority' : prio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Search Results List */}
        <div
          data-testid="task-search-results-list"
          className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2 bg-[#FDFBF7]"
        >
          {searchResults.items.length === 0 ? (
            <div
              data-testid="task-search-empty-state"
              className="py-10 text-center space-y-2.5 bg-white rounded-xl border border-[#ECE7DF] p-6"
            >
              <p className="text-sm font-bold text-[#2F2B28]">
                No tasks match your current filters
              </p>
              <p className="text-xs font-medium text-[#7A7269] max-w-md mx-auto">
                Try clearing a category, day, or status filter, or search for a different keyword across your weekly schedule.
              </p>
              <button
                type="button"
                onClick={handleResetAllFilters}
                data-testid="task-search-empty-reset-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#2F2B28] text-white hover:bg-[#433D38] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Tasks</span>
              </button>
            </div>
          ) : (
            searchResults.items.map((item) => {
              const catStyle = getCategoryBadgeStyle(
                item.category,
                customCategories,
                item.customColor
              );
              const prioStyle = PRIORITY_PILL_STYLES[item.priority];
              const statusStyle = STATUS_PILL_STYLES[item.status];

              return (
                <div
                  key={`${item.sourceType}-${item.id}`}
                  data-testid={`task-search-result-item-${item.id}`}
                  data-result-day={item.dayId ?? item.sourceType}
                  data-result-category={item.category}
                  className="bg-white hover:bg-[#FAF8F5] rounded-xl border border-[#ECE7DF] px-3 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                >
                  {/* Left: Checkbox + Day Pill + Task Text + Notes Snippet */}
                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={item.completed}
                      aria-label={`Mark "${item.text}" as ${
                        item.completed ? 'incomplete' : 'complete'
                      }`}
                      data-testid={`task-search-toggle-${item.id}`}
                      onClick={() => handleToggleItem(item)}
                      className="mt-0.5 sm:mt-0 w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
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
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold border shrink-0 leading-none ${
                            item.isToday
                              ? 'bg-[#F5DFD0] text-[#9A4E28] border-[#E8C5A5]'
                              : 'bg-[#FAF7F2] text-[#5A534C] border-[#E5DEC9]'
                          }`}
                        >
                          {item.dayName}
                          {item.isToday ? ' · Today' : ` · ${item.dateLabel}`}
                        </span>

                        <span
                          className={`text-xs sm:text-[13px] font-semibold truncate ${
                            item.completed
                              ? 'line-through text-[#A59E95]'
                              : 'text-[#2F2B28]'
                          }`}
                        >
                          {item.text}
                        </span>

                        {item.matchField && item.matchField !== 'name' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF0E6] text-[#A85B33] border border-[#EED5BE]">
                            Matched in {item.matchField}
                          </span>
                        )}
                      </div>

                      {(item.matchSnippet || item.notes) && (
                        <p className="text-[11px] font-medium text-[#7A7269] mt-1 flex items-center gap-1 truncate">
                          <FileText className="w-3 h-3 text-[#9A8F82] shrink-0" />
                          <span className="truncate">
                            {item.matchSnippet || item.notes}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Category Badge + Priority Pill + Status + Jump to View */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-6 sm:ml-0">
                    <button
                      type="button"
                      onClick={() => handleCycleItemCategory(item)}
                      data-testid={`task-search-category-pill-${item.id}`}
                      title={`Category: ${item.category} (click to cycle)`}
                      className="px-2 py-0.5 rounded text-[9.5px] font-bold border cursor-pointer transition-transform active:scale-95 leading-none"
                      style={{
                        backgroundColor: catStyle.bg,
                        color: catStyle.text,
                        borderColor: catStyle.border,
                      }}
                    >
                      {item.category}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCycleItemPriority(item)}
                      data-testid={`task-search-priority-pill-${item.id}`}
                      title={`Priority: ${item.priority} (click to cycle)`}
                      className="px-2 py-0.5 rounded-full text-[9.5px] font-bold cursor-pointer transition-transform active:scale-95"
                      style={{
                        backgroundColor: prioStyle.bg,
                        color: prioStyle.text,
                      }}
                    >
                      {item.priority}
                    </button>

                    <span
                      className="hidden md:inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      {item.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleJumpToTaskContext(item)}
                      data-testid={`task-search-jump-${item.id}`}
                      title={`Open in ${item.dayName} view`}
                      className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold text-[#5A534C] hover:text-[#2F2B28] bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#E2D9CC] transition-colors cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary Bar */}
        <div className="px-4 py-2.5 bg-white border-t border-[#ECE7DF] flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#6E665E]">
          <div className="flex flex-wrap items-center gap-2 tabular-nums">
            <span>
              Showing{' '}
              <strong className="font-bold text-[#2F2B28]">
                {searchResults.totalMatched}
              </strong>{' '}
              of {searchResults.totalAvailable} tasks
            </span>
            <span>·</span>
            <span>
              Click any checkbox, tag, or priority badge to update live
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8A8279]">
            <span>
              Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-[#F2EFE9] border border-[#E2D9CC] font-bold text-[#4A433C]">Ctrl+K</kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
