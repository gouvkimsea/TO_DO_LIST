export type Priority = 'High' | 'Med' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type ThemeId = 'terracotta' | 'candy' | 'lavender' | 'neutral';
export type ViewMode = 'week' | 'month' | 'year';

export type TaskCategory =
  | 'Work'
  | 'Personal'
  | 'Health'
  | 'Finance'
  | 'Home'
  | 'Growth';

export const TASK_CATEGORIES: TaskCategory[] = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Home',
  'Growth',
];

export const CATEGORY_BADGE_STYLES: Record<
  TaskCategory,
  { bg: string; text: string; border: string }
> = {
  Work: { bg: '#FCEADE', text: '#9A4E28', border: '#F0CFB8' },
  Personal: { bg: '#EAE4F7', text: '#564385', border: '#D5C9EE' },
  Health: { bg: '#DEF0E5', text: '#2D6A46', border: '#BFE0CC' },
  Finance: { bg: '#FBF0D4', text: '#876015', border: '#EFE0B3' },
  Home: { bg: '#E3EFF8', text: '#2B5B80', border: '#C7DFEF' },
  Growth: { bg: '#F7E3EC', text: '#8C3B61', border: '#EBC5D6' },
};

export type RecurringInterval = 'none' | 'daily' | 'weekly' | 'monthly';

export const RECURRING_INTERVALS: RecurringInterval[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
];

export const RECURRING_CONFIG: Record<
  RecurringInterval,
  {
    label: string;
    shortLabel: string;
    badgeLabel: string;
    bg: string;
    text: string;
    border: string;
    description: string;
  }
> = {
  none: {
    label: 'None',
    shortLabel: 'Once',
    badgeLabel: 'Once',
    bg: '#F3EFE9',
    text: '#8A8175',
    border: '#E2DBD0',
    description: 'Task does not recur',
  },
  daily: {
    label: 'Daily',
    shortLabel: 'Daily',
    badgeLabel: 'Daily',
    bg: '#EAF5F0',
    text: '#206A4E',
    border: '#BFE4D3',
    description: 'Recurs daily upon completion',
  },
  weekly: {
    label: 'Weekly',
    shortLabel: 'Weekly',
    badgeLabel: 'Weekly',
    bg: '#EBF1FA',
    text: '#22558D',
    border: '#C4D8F3',
    description: 'Recurs weekly upon completion',
  },
  monthly: {
    label: 'Monthly',
    shortLabel: 'Monthly',
    badgeLabel: 'Monthly',
    bg: '#F6ECF7',
    text: '#722880',
    border: '#E8CAEC',
    description: 'Recurs monthly upon completion',
  },
};

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  notes?: string;
  recurring?: RecurringInterval;
}

export interface DayColumn {
  id: string;
  dayName: string;
  dateLabel: string;
  isToday?: boolean;
  tasks: DailyTask[];
}

export interface DetailedTask {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  recurring?: RecurringInterval;
}

export interface ArchivedTask {
  archiveId: string;
  originalTaskId: string;
  text: string;
  priority: Priority;
  category: TaskCategory;
  notes?: string;
  recurring?: RecurringInterval;
  sourceType: 'daily' | 'detailed';
  sourceDayId?: string;
  sourceLabel: string;
  linkedDetailedTaskId?: string;
  linkedDetailedText?: string;
  archivedAt: string;
}

export interface ThemePalette {
  id: ThemeId;
  name: string;
  labelColor: string;
  checkboxBg: string;
  progressFill: string;
  quadrantColors: [string, string, string, string];
  dayHeaders: [string, string, string, string, string, string, string];
}

export const THEMES: Record<ThemeId, ThemePalette> = {
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta',
    labelColor: '#B86B43',
    checkboxBg: '#C87D55',
    progressFill: '#C87D55',
    quadrantColors: ['#E2A88C', '#E9D49B', '#A9C5A0', '#94B4C8'],
    dayHeaders: [
      '#E3AA8E', // Mon
      '#E8BE96', // Tue
      '#E9D39E', // Wed
      '#A8C39F', // Thu
      '#95B3C6', // Fri
      '#C7A2B1', // Sat
      '#D6B597', // Sun
    ],
  },
  candy: {
    id: 'candy',
    name: 'Candy Pastel',
    labelColor: '#D67A98',
    checkboxBg: '#68B694',
    progressFill: '#68B694',
    quadrantColors: ['#F2B5C4', '#F7E39C', '#ACE0C4', '#A3D2F2'],
    dayHeaders: [
      '#F2B8C6',
      '#F6C8A6',
      '#F6E09D',
      '#A8DEC2',
      '#A2CFF0',
      '#C3B6EE',
      '#DBAEEF',
    ],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender Mist',
    labelColor: '#7D74B8',
    checkboxBg: '#7E8CE0',
    progressFill: '#7E8CE0',
    quadrantColors: ['#C8B6E2', '#B0D4E3', '#A7D7C5', '#E3C4C9'],
    dayHeaders: [
      '#C7B6E2',
      '#B7C4E8',
      '#B0D3E3',
      '#A7D5C4',
      '#C6DEB2',
      '#E1C3C8',
      '#D8B8C4',
    ],
  },
  neutral: {
    id: 'neutral',
    name: 'Soft Neutral',
    labelColor: '#8C7662',
    checkboxBg: '#8C7A6B',
    progressFill: '#8C7A6B',
    quadrantColors: ['#D2C2B2', '#E2DACB', '#BAC6B8', '#CFC3C6'],
    dayHeaders: [
      '#D2C1B0',
      '#DCD0C0',
      '#E2DACB',
      '#BAC6B8',
      '#BDC7CC',
      '#CFC2C5',
      '#D7C7B7',
    ],
  },
};

export function cyclePriority(current: Priority): Priority {
  if (current === 'High') return 'Med';
  if (current === 'Med') return 'Low';
  return 'High';
}

export function cycleStatus(current: TaskStatus): TaskStatus {
  if (current === 'To Do') return 'In Progress';
  if (current === 'In Progress') return 'Done';
  return 'To Do';
}

export function cycleCategory(current: TaskCategory): TaskCategory {
  const idx = TASK_CATEGORIES.indexOf(current);
  if (idx === -1) return 'Work';
  return TASK_CATEGORIES[(idx + 1) % TASK_CATEGORIES.length];
}

export function cycleRecurringInterval(
  current?: RecurringInterval
): RecurringInterval {
  if (current === 'none' || !current) return 'daily';
  if (current === 'daily') return 'weekly';
  if (current === 'weekly') return 'monthly';
  return 'none';
}

export function toggleTaskCompletion<
  T extends { completed: boolean; status: TaskStatus }
>(task: T): T {
  const completed = !task.completed;
  return {
    ...task,
    completed,
    status: completed ? 'Done' : task.status === 'Done' ? 'To Do' : task.status,
  };
}

export function updateTaskStatus<
  T extends { completed: boolean; status: TaskStatus }
>(task: T, nextStatus?: TaskStatus): T {
  const status = nextStatus ?? cycleStatus(task.status);
  return {
    ...task,
    status,
    completed: status === 'Done',
  };
}

export function calculateDayProgress(tasks: DailyTask[]): {
  completed: number;
  total: number;
  percentage: number;
  fractionLabel: string;
} {
  const activeTasks = tasks.filter((t) => t.text.trim().length > 0 && t.text.trim() !== '—');
  const total = activeTasks.length;
  const completed = activeTasks.filter((t) => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percentage,
    fractionLabel: `${completed}/${total}`,
  };
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  dailyProgress: Array<{
    dayId: string;
    shortName: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  byPriority: {
    High: number;
    Med: number;
    Low: number;
  };
  byStatus: {
    'To Do': number;
    'In Progress': number;
    Done: number;
  };
  byCategory: Record<TaskCategory, number>;
}

export function calculateDashboardMetrics(
  columns: DayColumn[],
  extraTasks: DetailedTask[] = []
): DashboardMetrics {
  const dailyProgress = columns.map((col) => {
    const stats = calculateDayProgress(col.tasks);
    return {
      dayId: col.id,
      shortName: col.dayName.slice(0, 3),
      completed: stats.completed,
      total: stats.total,
      percentage: stats.percentage,
    };
  });

  const activeDailyTasks = columns.flatMap((col) =>
    col.tasks.filter((t) => t.text.trim().length > 0 && t.text.trim() !== '—')
  );

  const allTasks: Array<{
    completed: boolean;
    priority: Priority;
    status: TaskStatus;
    category?: TaskCategory;
  }> = [
    ...activeDailyTasks,
    ...extraTasks.filter((t) => t.text.trim().length > 0 && t.text.trim() !== '—'),
  ];

  const totalTasks = activeDailyTasks.length;
  const completedTasks = activeDailyTasks.filter((t) => t.completed).length;
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const byPriority: Record<Priority, number> = {
    High: 0,
    Med: 0,
    Low: 0,
  };

  const byStatus: Record<TaskStatus, number> = {
    'To Do': 0,
    'In Progress': 0,
    Done: 0,
  };

  const byCategory: Record<TaskCategory, number> = {
    Work: 0,
    Personal: 0,
    Health: 0,
    Finance: 0,
    Home: 0,
    Growth: 0,
  };

  for (const t of allTasks) {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    const cat: TaskCategory =
      t.category && TASK_CATEGORIES.includes(t.category) ? t.category : 'Work';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  return {
    totalTasks,
    completedTasks,
    completionPercentage,
    dailyProgress,
    byPriority,
    byStatus,
    byCategory,
  };
}

export function formatWeekRangeFromDate(dateStr: string): {
  rangeLabel: string;
  dayDates: string[];
} {
  const parsed = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return {
      rangeLabel: 'Week of Jun 8 – Jun 14',
      dayDates: ['Jun 8', 'Jun 9', 'Jun 10', 'Jun 11', 'Jun 12', 'Jun 13', 'Jun 14'],
    };
  }
  const dayOfWeek = parsed.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(parsed);
  monday.setDate(parsed.getDate() + diffToMonday);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dayDates.push(`${months[d.getMonth()]} ${d.getDate()}`);
  }
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const rangeLabel = `Week of ${months[monday.getMonth()]} ${monday.getDate()} – ${months[sunday.getMonth()]} ${sunday.getDate()}`;
  return { rangeLabel, dayDates };
}

export function createInitialWeekColumns(): DayColumn[] {
  return [
    {
      id: 'mon',
      dayName: 'Monday',
      dateLabel: 'Jun 8',
      tasks: [
        { id: 'mon-1', text: 'Check emails', completed: true, priority: 'High', status: 'Done', category: 'Work', notes: '' },
        { id: 'mon-2', text: 'Team standup', completed: true, priority: 'Med', status: 'Done', category: 'Work', notes: '' },
        { id: 'mon-3', text: 'Client follow-up', completed: true, priority: 'Med', status: 'Done', category: 'Work', notes: '' },
        { id: 'mon-4', text: 'Review inbox', completed: true, priority: 'Low', status: 'Done', category: 'Work', notes: '' },
        { id: 'mon-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'mon-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'tue',
      dayName: 'Tuesday',
      dateLabel: 'Jun 9',
      tasks: [
        { id: 'tue-1', text: 'Write Q2 report', completed: false, priority: 'High', status: 'In Progress', category: 'Work', notes: 'Include revenue breakdown and retention metrics' },
        { id: 'tue-2', text: 'Review pull requests', completed: false, priority: 'Med', status: 'To Do', category: 'Work', notes: '' },
        { id: 'tue-3', text: 'Grocery shopping', completed: true, priority: 'Low', status: 'Done', category: 'Home', notes: '' },
        { id: 'tue-4', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'tue-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'tue-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'wed',
      dayName: 'Wednesday',
      dateLabel: 'Jun 10',
      tasks: [
        { id: 'wed-1', text: 'Plan social media posts', completed: false, priority: 'Low', status: 'To Do', category: 'Work', notes: '' },
        { id: 'wed-2', text: 'Edit blog post', completed: false, priority: 'Med', status: 'In Progress', category: 'Growth', notes: '' },
        { id: 'wed-3', text: 'Doctor appointment', completed: false, priority: 'High', status: 'To Do', category: 'Health', notes: '' },
        { id: 'wed-4', text: 'Vacuum living room', completed: true, priority: 'Low', status: 'Done', category: 'Home', notes: '' },
        { id: 'wed-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'wed-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'thu',
      dayName: 'Thursday',
      dateLabel: 'Jun 11',
      isToday: true,
      tasks: [
        { id: 'thu-1', text: 'Prepare presentation', completed: false, priority: 'High', status: 'In Progress', category: 'Work', notes: 'Include Q2 metrics slide and product roadmap timeline', recurring: 'none' },
        { id: 'thu-2', text: 'Submit expense report', completed: true, priority: 'Med', status: 'Done', category: 'Finance', notes: '', recurring: 'weekly' },
        { id: 'thu-3', text: 'Exercise - walk dog', completed: false, priority: 'Low', status: 'To Do', category: 'Health', notes: '', recurring: 'daily' },
        { id: 'thu-4', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'thu-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'thu-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'fri',
      dayName: 'Friday',
      dateLabel: 'Jun 12',
      tasks: [
        { id: 'fri-1', text: 'Clean bathroom', completed: false, priority: 'Low', status: 'To Do', category: 'Home', notes: '' },
        { id: 'fri-2', text: 'Read for 30 minutes', completed: true, priority: 'Med', status: 'Done', category: 'Growth', notes: '', recurring: 'daily' },
        { id: 'fri-3', text: 'Q3 planning session', completed: false, priority: 'High', status: 'In Progress', category: 'Work', notes: 'Review OKRs with design and engineering leads' },
        { id: 'fri-4', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'fri-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'fri-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'sat',
      dayName: 'Saturday',
      dateLabel: 'Jun 13',
      tasks: [
        { id: 'sat-1', text: 'Laundry - fold & put away', completed: true, priority: 'Low', status: 'Done', category: 'Home', notes: '' },
        { id: 'sat-2', text: 'Call parents', completed: false, priority: 'Low', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sat-3', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sat-4', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sat-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sat-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
    {
      id: 'sun',
      dayName: 'Sunday',
      dateLabel: 'Jun 14',
      tasks: [
        { id: 'sun-1', text: 'Meal prep for the week', completed: false, priority: 'Med', status: 'To Do', category: 'Health', notes: '', recurring: 'weekly' },
        { id: 'sun-2', text: 'Water indoor plants', completed: true, priority: 'Low', status: 'Done', category: 'Home', notes: '' },
        { id: 'sun-3', text: 'Read new design book', completed: false, priority: 'Low', status: 'To Do', category: 'Growth', notes: '' },
        { id: 'sun-4', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sun-5', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
        { id: 'sun-6', text: '', completed: false, priority: 'Med', status: 'To Do', category: 'Personal', notes: '' },
      ],
    },
  ];
}

export function createInitialDetailedTasks(): DetailedTask[] {
  return [
    { id: 'dt-1', text: 'Call dentist', completed: true, priority: 'High', status: 'Done', category: 'Finance' },
    { id: 'dt-2', text: 'Renew insurance', completed: false, priority: 'Med', status: 'To Do', category: 'Finance' },
    { id: 'dt-3', text: 'Book dentist appointment', completed: true, priority: 'Low', status: 'Done', category: 'Health' },
    { id: 'dt-4', text: 'Birthday card for friend', completed: false, priority: 'Low', status: 'To Do', category: 'Personal' },
    { id: 'dt-5', text: 'Q3 planning session', completed: false, priority: 'High', status: 'In Progress', category: 'Work' },
    { id: 'dt-6', text: 'Pay utility bills', completed: true, priority: 'High', status: 'Done', category: 'Finance' },
    { id: 'dt-7', text: 'Order groceries', completed: true, priority: 'Low', status: 'Done', category: 'Home' },
    { id: 'dt-8', text: 'Schedule team standup', completed: true, priority: 'Med', status: 'Done', category: 'Work' },
    { id: 'dt-9', text: 'what is that thing', completed: false, priority: 'Med', status: 'To Do', category: 'Work' },
    { id: 'dt-10', text: 'Read new design book', completed: false, priority: 'Low', status: 'To Do', category: 'Growth' },
  ];
}

export interface DetailedDailyTaskLink {
  detailedTaskId: string;
  dayId: string;
  dailyTaskId: string;
}

export const DETAILED_DAILY_TASK_LINKS: DetailedDailyTaskLink[] = [
  { detailedTaskId: 'dt-1', dayId: 'mon', dailyTaskId: 'mon-3' }, // Call dentist <-> Client follow-up / Mon
  { detailedTaskId: 'dt-2', dayId: 'tue', dailyTaskId: 'tue-2' }, // Renew insurance <-> Review pull requests / Tue
  { detailedTaskId: 'dt-3', dayId: 'wed', dailyTaskId: 'wed-4' }, // Book dentist appointment <-> Vacuum living room / Wed
  { detailedTaskId: 'dt-4', dayId: 'sat', dailyTaskId: 'sat-2' }, // Birthday card for friend <-> Call parents / Sat
  { detailedTaskId: 'dt-5', dayId: 'fri', dailyTaskId: 'fri-3' }, // Q3 planning session <-> Q3 planning session / Fri
  { detailedTaskId: 'dt-6', dayId: 'thu', dailyTaskId: 'thu-2' }, // Pay utility bills <-> Submit expense report / Thu
  { detailedTaskId: 'dt-7', dayId: 'tue', dailyTaskId: 'tue-3' }, // Order groceries <-> Grocery shopping / Tue
  { detailedTaskId: 'dt-8', dayId: 'mon', dailyTaskId: 'mon-2' }, // Schedule team standup <-> Team standup / Mon
  { detailedTaskId: 'dt-9', dayId: 'wed', dailyTaskId: 'wed-1' }, // what is that thing <-> Plan social media posts / Wed
  { detailedTaskId: 'dt-10', dayId: 'sun', dailyTaskId: 'sun-3' }, // Read new design book <-> Read new design book / Sun
];

export function syncDetailedTaskToggle(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  targetDetailedTaskId: string
): { nextDetailedTasks: DetailedTask[]; nextColumns: DayColumn[] } {
  let nextCompleted = false;
  let nextStatus: TaskStatus = 'Done';

  const nextDetailedTasks = detailedTasks.map((t) => {
    if (t.id !== targetDetailedTaskId) return t;
    const toggled = toggleTaskCompletion(t);
    nextCompleted = toggled.completed;
    nextStatus = toggled.status;
    return toggled;
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === targetDetailedTaskId
  );

  let nextColumns = columns;
  if (link) {
    nextColumns = columns.map((col) => {
      if (col.id !== link.dayId) return col;
      return {
        ...col,
        tasks: col.tasks.map((task) => {
          if (task.id !== link.dailyTaskId) return task;
          return {
            ...task,
            completed: nextCompleted,
            status: nextStatus,
          };
        }),
      };
    });
  }

  return { nextDetailedTasks, nextColumns };
}

export function regenerateRecurringTask(
  columns: DayColumn[],
  dayId: string,
  completedTask: DailyTask
): {
  nextColumns: DayColumn[];
  regeneratedTask: DailyTask | null;
  targetDayId: string;
  targetDayName: string;
} {
  const recurring = completedTask.recurring;
  if (!recurring || recurring === 'none' || !completedTask.text.trim()) {
    return {
      nextColumns: columns,
      regeneratedTask: null,
      targetDayId: dayId,
      targetDayName: '',
    };
  }

  const currentColIndex = columns.findIndex((c) => c.id === dayId);
  if (currentColIndex === -1) {
    return {
      nextColumns: columns,
      regeneratedTask: null,
      targetDayId: dayId,
      targetDayName: '',
    };
  }

  // Calculate target day column
  // Daily: advances to the next day column (e.g. Thu -> Fri, Sun -> Mon)
  // Weekly: same day column for next week cycle
  // Monthly: same day column for next month cycle
  let targetColIndex = currentColIndex;
  if (recurring === 'daily') {
    targetColIndex = (currentColIndex + 1) % columns.length;
  }

  const targetCol = columns[targetColIndex];
  if (!targetCol) {
    return {
      nextColumns: columns,
      regeneratedTask: null,
      targetDayId: dayId,
      targetDayName: '',
    };
  }

  let regeneratedTask: DailyTask | null = null;
  const targetBlankIndex = targetCol.tasks.findIndex(
    (t) => t.text.trim().length === 0 || t.text.trim() === '—'
  );

  const nextColumns = columns.map((col, idx) => {
    if (idx !== targetColIndex) return col;

    if (targetBlankIndex !== -1) {
      const nextTasks = col.tasks.map((task, taskIdx) => {
        if (taskIdx !== targetBlankIndex) return task;
        const freshTask: DailyTask = {
          ...task,
          text: completedTask.text,
          completed: false,
          status: 'To Do',
          priority: completedTask.priority,
          category: completedTask.category,
          notes: completedTask.notes || '',
          recurring: completedTask.recurring,
        };
        regeneratedTask = freshTask;
        return freshTask;
      });
      return { ...col, tasks: nextTasks };
    }

    // Append to target column if no blank slot exists
    const newId = `${col.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const freshTask: DailyTask = {
      id: newId,
      text: completedTask.text,
      completed: false,
      status: 'To Do',
      priority: completedTask.priority,
      category: completedTask.category,
      notes: completedTask.notes || '',
      recurring: completedTask.recurring,
    };
    regeneratedTask = freshTask;
    return { ...col, tasks: [...col.tasks, freshTask] };
  });

  return {
    nextColumns,
    regeneratedTask,
    targetDayId: targetCol.id,
    targetDayName: targetCol.dayName,
  };
}

export function syncDailyTaskToggle(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  targetDailyTaskId: string
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  regeneratedTask: DailyTask | null;
  regeneratedTargetDayName?: string;
} {
  let nextCompleted = false;
  let nextStatus: TaskStatus = 'Done';
  let targetTaskBefore: DailyTask | undefined;

  let nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;
    return {
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== targetDailyTaskId) return task;
        targetTaskBefore = task;
        const toggled = toggleTaskCompletion(task);
        nextCompleted = toggled.completed;
        nextStatus = toggled.status;
        return toggled;
      }),
    };
  });

  let regeneratedTask: DailyTask | null = null;
  let regeneratedTargetDayName: string | undefined;

  // If task was completed and has an active recurrence cadence, auto-regenerate it
  if (
    nextCompleted &&
    targetTaskBefore?.recurring &&
    targetTaskBefore.recurring !== 'none'
  ) {
    const regen = regenerateRecurringTask(
      nextColumns,
      dayId,
      targetTaskBefore
    );
    nextColumns = regen.nextColumns;
    regeneratedTask = regen.regeneratedTask;
    regeneratedTargetDayName = regen.targetDayName;
  }

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === targetDailyTaskId
  );

  let nextDetailedTasks = detailedTasks;
  if (link) {
    nextDetailedTasks = detailedTasks.map((task) => {
      if (task.id !== link.detailedTaskId) return task;
      return {
        ...task,
        completed: nextCompleted,
        status: nextStatus,
      };
    });
  }

  return {
    nextColumns,
    nextDetailedTasks,
    regeneratedTask,
    regeneratedTargetDayName,
  };
}

export function syncDetailedTaskStatus(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  targetDetailedTaskId: string,
  newStatus?: TaskStatus
): { nextDetailedTasks: DetailedTask[]; nextColumns: DayColumn[] } {
  let updatedStatus: TaskStatus = 'Done';
  let updatedCompleted = false;

  const nextDetailedTasks = detailedTasks.map((t) => {
    if (t.id !== targetDetailedTaskId) return t;
    const updated = updateTaskStatus(t, newStatus);
    updatedStatus = updated.status;
    updatedCompleted = updated.completed;
    return updated;
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === targetDetailedTaskId
  );

  let nextColumns = columns;
  if (link) {
    nextColumns = columns.map((col) => {
      if (col.id !== link.dayId) return col;
      return {
        ...col,
        tasks: col.tasks.map((task) => {
          if (task.id !== link.dailyTaskId) return task;
          return {
            ...task,
            status: updatedStatus,
            completed: updatedCompleted,
          };
        }),
      };
    });
  }

  return { nextDetailedTasks, nextColumns };
}

export function syncDetailedTaskPriority(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  targetDetailedTaskId: string
): { nextDetailedTasks: DetailedTask[]; nextColumns: DayColumn[] } {
  let updatedPriority: Priority = 'High';

  const nextDetailedTasks = detailedTasks.map((t) => {
    if (t.id !== targetDetailedTaskId) return t;
    const nextP = cyclePriority(t.priority);
    updatedPriority = nextP;
    return { ...t, priority: nextP };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === targetDetailedTaskId
  );

  let nextColumns = columns;
  if (link) {
    nextColumns = columns.map((col) => {
      if (col.id !== link.dayId) return col;
      return {
        ...col,
        tasks: col.tasks.map((task) => {
          if (task.id !== link.dailyTaskId) return task;
          return { ...task, priority: updatedPriority };
        }),
      };
    });
  }

  return { nextDetailedTasks, nextColumns };
}

export function syncDetailedTaskText(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  targetDetailedTaskId: string,
  newText: string
): { nextDetailedTasks: DetailedTask[]; nextColumns: DayColumn[] } {
  const clean = sanitizeTaskText(newText);
  const nextDetailedTasks = detailedTasks.map((t) =>
    t.id === targetDetailedTaskId ? { ...t, text: clean } : t
  );

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === targetDetailedTaskId
  );

  let nextColumns = columns;
  if (link) {
    nextColumns = columns.map((col) => {
      if (col.id !== link.dayId) return col;
      return {
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === link.dailyTaskId ? { ...task, text: clean } : task
        ),
      };
    });
  }

  return { nextDetailedTasks, nextColumns };
}

export function syncDetailedTaskCategory(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  targetDetailedTaskId: string,
  explicitCategory?: TaskCategory
): { nextDetailedTasks: DetailedTask[]; nextColumns: DayColumn[] } {
  let updatedCategory: TaskCategory = 'Work';

  const nextDetailedTasks = detailedTasks.map((t) => {
    if (t.id !== targetDetailedTaskId) return t;
    const nextCat =
      explicitCategory && isValidCategory(explicitCategory)
        ? explicitCategory
        : cycleCategory(t.category);
    updatedCategory = nextCat;
    return { ...t, category: nextCat };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === targetDetailedTaskId
  );

  let nextColumns = columns;
  if (link) {
    nextColumns = columns.map((col) => {
      if (col.id !== link.dayId) return col;
      return {
        ...col,
        tasks: col.tasks.map((task) => {
          if (task.id !== link.dailyTaskId) return task;
          return { ...task, category: updatedCategory };
        }),
      };
    });
  }

  return { nextDetailedTasks, nextColumns };
}

export function syncDailyTaskPriority(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  targetDailyTaskId: string
): { nextColumns: DayColumn[]; nextDetailedTasks: DetailedTask[] } {
  let updatedPriority: Priority = 'High';

  const nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;
    return {
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== targetDailyTaskId) return task;
        const nextP = cyclePriority(task.priority);
        updatedPriority = nextP;
        return { ...task, priority: nextP };
      }),
    };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === targetDailyTaskId
  );

  let nextDetailedTasks = detailedTasks;
  if (link) {
    nextDetailedTasks = detailedTasks.map((task) => {
      if (task.id !== link.detailedTaskId) return task;
      return { ...task, priority: updatedPriority };
    });
  }

  return { nextColumns, nextDetailedTasks };
}

export function syncDailyTaskCategory(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  targetDailyTaskId: string,
  explicitCategory?: TaskCategory
): { nextColumns: DayColumn[]; nextDetailedTasks: DetailedTask[] } {
  let updatedCategory: TaskCategory = 'Work';

  const nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;
    return {
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== targetDailyTaskId) return task;
        const nextCat =
          explicitCategory && isValidCategory(explicitCategory)
            ? explicitCategory
            : cycleCategory(task.category);
        updatedCategory = nextCat;
        return { ...task, category: nextCat };
      }),
    };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === targetDailyTaskId
  );

  let nextDetailedTasks = detailedTasks;
  if (link) {
    nextDetailedTasks = detailedTasks.map((task) => {
      if (task.id !== link.detailedTaskId) return task;
      return { ...task, category: updatedCategory };
    });
  }

  return { nextColumns, nextDetailedTasks };
}

export function syncDailyTaskText(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  targetDailyTaskId: string,
  text: string
): { nextColumns: DayColumn[]; nextDetailedTasks: DetailedTask[] } {
  const clean = sanitizeTaskText(text);

  const nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;
    return {
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== targetDailyTaskId) return task;
        return { ...task, text: clean };
      }),
    };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === targetDailyTaskId
  );

  let nextDetailedTasks = detailedTasks;
  if (link) {
    nextDetailedTasks = detailedTasks.map((task) => {
      if (task.id !== link.detailedTaskId) return task;
      return { ...task, text: clean };
    });
  }

  return { nextColumns, nextDetailedTasks };
}

export function syncDailyTaskRecurring(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  targetDailyTaskId: string,
  explicitInterval?: RecurringInterval
): { nextColumns: DayColumn[]; nextDetailedTasks: DetailedTask[] } {
  let updatedRecurring: RecurringInterval = 'none';

  const nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;
    return {
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== targetDailyTaskId) return task;
        const nextR =
          explicitInterval !== undefined
            ? explicitInterval
            : cycleRecurringInterval(task.recurring);
        updatedRecurring = nextR;
        return { ...task, recurring: nextR };
      }),
    };
  });

  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === targetDailyTaskId
  );

  let nextDetailedTasks = detailedTasks;
  if (link) {
    nextDetailedTasks = detailedTasks.map((task) => {
      if (task.id !== link.detailedTaskId) return task;
      return { ...task, recurring: updatedRecurring };
    });
  }

  return { nextColumns, nextDetailedTasks };
}

export function updateDailyTaskRecurring(
  columns: DayColumn[],
  dayId: string,
  taskId: string,
  recurring: RecurringInterval
): DayColumn[] {
  return columns.map((col) =>
    col.id !== dayId
      ? col
      : {
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? { ...task, recurring } : task
          ),
        }
  );
}

export interface QuickAddTaskOptions {
  priority?: Priority;
  category?: TaskCategory;
  recurring?: RecurringInterval;
  idGenerator?: (dayId: string, nextIndex: number) => string;
}

export function parseQuickTaskTag(
  rawText: string,
  fallbackCategory?: TaskCategory,
  fallbackRecurring?: RecurringInterval
): {
  cleanText: string;
  category: TaskCategory | undefined;
  recurring: RecurringInterval | undefined;
  hadInlineTag: boolean;
} {
  const sanitized = sanitizeTaskText(rawText).trim();
  if (!sanitized) {
    return {
      cleanText: '',
      category: fallbackCategory,
      recurring: fallbackRecurring ?? 'none',
      hadInlineTag: false,
    };
  }

  let detectedCategory: TaskCategory | undefined;
  let detectedRecurring: RecurringInterval | undefined;

  let stripped = sanitized.replace(
    /(?:^|\s)(?:#|@|repeat:)(daily|weekly|monthly)\b/gi,
    (_match, intervalWord: string) => {
      const lower = intervalWord.toLowerCase();
      if (lower === 'daily' || lower === 'weekly' || lower === 'monthly') {
        detectedRecurring = lower;
      }
      return ' ';
    }
  );

  stripped = stripped
    .replace(
      /(?:^|\s)#(work|personal|health|finance|home|growth)\b/gi,
      (_match, tagWord: string) => {
        const normalized =
          tagWord.charAt(0).toUpperCase() + tagWord.slice(1).toLowerCase();
        if (isValidCategory(normalized)) {
          detectedCategory = normalized;
        }
        return ' ';
      }
    )
    .replace(/\s+/g, ' ')
    .trim();

  const hadInlineTag = Boolean(detectedCategory || detectedRecurring);

  return {
    cleanText: stripped.length > 0 ? stripped : sanitized,
    category: detectedCategory ?? fallbackCategory,
    recurring: detectedRecurring ?? fallbackRecurring ?? 'none',
    hadInlineTag,
  };
}

export function addQuickTaskToDayColumn(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  rawText: string,
  options?: QuickAddTaskOptions
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  addedTask: DailyTask | null;
} {
  const parsedTag = parseQuickTaskTag(
    rawText,
    options?.category,
    options?.recurring
  );
  const cleanText = parsedTag.cleanText;
  if (!cleanText || cleanText === '—') {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      addedTask: null,
    };
  }

  const targetCol = columns.find((col) => col.id === dayId);
  if (!targetCol) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      addedTask: null,
    };
  }

  const firstBlankIndex = targetCol.tasks.findIndex(
    (t) => t.text.trim().length === 0 || t.text.trim() === '—'
  );

  const resolvedRecurring =
    parsedTag.recurring ?? options?.recurring ?? 'none';

  let addedTask: DailyTask | null = null;
  let updatedDailyTaskId: string | null = null;

  const nextColumns = columns.map((col) => {
    if (col.id !== dayId) return col;

    if (firstBlankIndex !== -1) {
      const nextTasks = col.tasks.map((task, idx) => {
        if (idx !== firstBlankIndex) return task;
        const populatedTask: DailyTask = {
          ...task,
          text: cleanText,
          completed: false,
          status: 'To Do',
          priority: options?.priority ?? 'Med',
          category: parsedTag.category ?? (task.category || 'Work'),
          notes: '',
          recurring: resolvedRecurring,
        };
        addedTask = populatedTask;
        updatedDailyTaskId = populatedTask.id;
        return populatedTask;
      });
      return {
        ...col,
        tasks: nextTasks,
      };
    }

    const nextIndex = col.tasks.length + 1;
    const existingIds = new Set(col.tasks.map((t) => t.id));
    let newTaskId = options?.idGenerator
      ? options.idGenerator(col.id, nextIndex)
      : `${col.id}-${nextIndex}`;
    if (existingIds.has(newTaskId)) {
      newTaskId = `${col.id}-${nextIndex}-${Date.now()}`;
    }

    const appendedTask: DailyTask = {
      id: newTaskId,
      text: cleanText,
      completed: false,
      status: 'To Do',
      priority: options?.priority ?? 'Med',
      category: parsedTag.category ?? 'Work',
      notes: '',
      recurring: resolvedRecurring,
    };
    addedTask = appendedTask;
    updatedDailyTaskId = appendedTask.id;

    return {
      ...col,
      tasks: [...col.tasks, appendedTask],
    };
  });

  let nextDetailedTasks = detailedTasks;
  if (updatedDailyTaskId) {
    const link = DETAILED_DAILY_TASK_LINKS.find(
      (l) => l.dayId === dayId && l.dailyTaskId === updatedDailyTaskId
    );
    if (link) {
      nextDetailedTasks = detailedTasks.map((dt) =>
        dt.id === link.detailedTaskId
          ? {
              ...dt,
              text: cleanText,
              completed: false,
              status: 'To Do',
              priority: addedTask?.priority ?? dt.priority,
              category: addedTask?.category ?? dt.category,
            }
          : dt
      );
    }
  }

  return {
    nextColumns,
    nextDetailedTasks,
    addedTask,
  };
}


export function createInitialMonthlyGoals(): DetailedTask[] {
  return [
    { id: 'm-1', text: 'Launch new landing page', completed: true, priority: 'High', status: 'Done', category: 'Work' },
    { id: 'm-2', text: 'Quarterly budget review', completed: false, priority: 'High', status: 'In Progress', category: 'Finance' },
    { id: 'm-3', text: 'Plan team offsite', completed: false, priority: 'Med', status: 'To Do', category: 'Work' },
    { id: 'm-4', text: 'Finish online design course', completed: true, priority: 'Med', status: 'Done', category: 'Growth' },
    { id: 'm-5', text: 'Declutter home office', completed: true, priority: 'Low', status: 'Done', category: 'Home' },
    { id: 'm-6', text: 'Car service appointment', completed: false, priority: 'Low', status: 'To Do', category: 'Home' },
    { id: 'm-7', text: 'Tax documents prep', completed: false, priority: 'High', status: 'In Progress', category: 'Finance' },
    { id: 'm-8', text: 'Read 2 books this month', completed: true, priority: 'Low', status: 'Done', category: 'Growth' },
    { id: 'm-9', text: 'Update resume & portfolio', completed: false, priority: 'Med', status: 'To Do', category: 'Growth' },
    { id: 'm-10', text: ' Annual health checkup', completed: true, priority: 'High', status: 'Done', category: 'Health' },
  ];
}

export function createInitialYearlyGoals(): DetailedTask[] {
  return [
    { id: 'y-1', text: 'Run a half marathon', completed: true, priority: 'High', status: 'Done', category: 'Health' },
    { id: 'y-2', text: 'Read 24 books', completed: false, priority: 'Med', status: 'In Progress', category: 'Growth' },
    { id: 'y-3', text: 'Build 6-month emergency fund', completed: true, priority: 'High', status: 'Done', category: 'Finance' },
    { id: 'y-4', text: 'Take a 2-week unplugged vacation', completed: false, priority: 'Med', status: 'To Do', category: 'Personal' },
    { id: 'y-5', text: 'Pay off car loan early', completed: false, priority: 'High', status: 'In Progress', category: 'Finance' },
    { id: 'y-6', text: 'Launch a side project', completed: true, priority: 'High', status: 'Done', category: 'Work' },
    { id: 'y-7', text: 'Learn conversational Spanish', completed: false, priority: 'Low', status: 'In Progress', category: 'Growth' },
    { id: 'y-8', text: 'Redecorate living room', completed: true, priority: 'Low', status: 'Done', category: 'Home' },
    { id: 'y-9', text: 'Get a promotion', completed: false, priority: 'High', status: 'In Progress', category: 'Work' },
    { id: 'y-10', text: 'Volunteer at local shelter', completed: true, priority: 'Low', status: 'Done', category: 'Personal' },
  ];
}

export function updateDailyTaskNotes(
  columns: DayColumn[],
  dayId: string,
  taskId: string,
  notes: string
): DayColumn[] {
  return columns.map((col) =>
    col.id !== dayId
      ? col
      : {
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? { ...task, notes } : task
          ),
        }
  );
}

export function clearWeekTasks(columns: DayColumn[]): DayColumn[] {
  return columns.map((col) => ({
    ...col,
    tasks: col.tasks.map((task) => ({
      ...task,
      text: '',
      completed: false,
      priority: 'Med',
      status: 'To Do',
      category: task.category || 'Personal',
      notes: '',
    })),
  }));
}

export function countWeekTasksByCompletion(columns: DayColumn[]): {
  completedCount: number;
  pendingCount: number;
  totalCount: number;
} {
  let completedCount = 0;
  let pendingCount = 0;
  for (const col of columns) {
    for (const task of col.tasks) {
      const hasText = task.text.trim().length > 0 && task.text.trim() !== '—';
      if (!hasText) continue;
      if (task.completed) {
        completedCount += 1;
      } else {
        pendingCount += 1;
      }
    }
  }
  return {
    completedCount,
    pendingCount,
    totalCount: completedCount + pendingCount,
  };
}

export function clearCompletedWeekTasks(columns: DayColumn[]): DayColumn[] {
  return columns.map((col) => {
    const keptTasks = col.tasks.filter((task) => {
      const hasText = task.text.trim().length > 0 && task.text.trim() !== '—';
      return hasText && !task.completed;
    });
    const nextTasks: DailyTask[] = col.tasks.map((originalTask, idx) => {
      const kept = keptTasks[idx];
      if (kept) {
        return {
          ...kept,
          id: originalTask.id,
          notes: kept.notes ?? '',
        };
      }
      return {
        id: originalTask.id,
        text: '',
        completed: false,
        priority: 'Med',
        status: 'To Do',
        category: 'Personal',
        notes: '',
      };
    });
    return {
      ...col,
      tasks: nextTasks,
    };
  });
}

export function clearPendingWeekTasks(columns: DayColumn[]): DayColumn[] {
  return columns.map((col) => {
    const keptTasks = col.tasks.filter((task) => {
      const hasText = task.text.trim().length > 0 && task.text.trim() !== '—';
      return hasText && task.completed;
    });
    const nextTasks: DailyTask[] = col.tasks.map((originalTask, idx) => {
      const kept = keptTasks[idx];
      if (kept) {
        return {
          ...kept,
          id: originalTask.id,
          notes: kept.notes ?? '',
        };
      }
      return {
        id: originalTask.id,
        text: '',
        completed: false,
        priority: 'Med',
        status: 'To Do',
        category: 'Personal',
        notes: '',
      };
    });
    return {
      ...col,
      tasks: nextTasks,
    };
  });
}

export function clearDetailedTasksByCompletion(
  tasks: DetailedTask[],
  mode: 'completed' | 'pending'
): DetailedTask[] {
  const keptTasks = tasks.filter((task) => {
    const hasText = task.text.trim().length > 0 && task.text.trim() !== '—';
    if (!hasText) return false;
    return mode === 'completed' ? !task.completed : task.completed;
  });

  return tasks.map((originalTask, idx) => {
    const kept = keptTasks[idx];
    if (kept) {
      return {
        ...kept,
        id: originalTask.id,
      };
    }
    return {
      ...originalTask,
      text: '',
      completed: false,
      priority: 'Med',
      status: 'To Do',
    };
  });
}

function compactSingleDayColumn(
  col: DayColumn,
  predicateKeep: (task: DailyTask) => boolean
): DayColumn {
  const keptTasks = col.tasks.filter((task) => {
    const hasText = task.text.trim().length > 0 && task.text.trim() !== '—';
    return hasText && predicateKeep(task);
  });
  const nextTasks: DailyTask[] = col.tasks.map((originalTask, idx) => {
    const kept = keptTasks[idx];
    if (kept) {
      return {
        ...kept,
        id: originalTask.id,
        notes: kept.notes ?? '',
      };
    }
    return {
      id: originalTask.id,
      text: '',
      completed: false,
      priority: 'Med',
      status: 'To Do',
      category: 'Personal',
      notes: '',
    };
  });
  return {
    ...col,
    tasks: nextTasks,
  };
}

export function archiveCompletedTasks(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  existingArchive: ArchivedTask[],
  timestampIso?: string
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  nextArchive: ArchivedTask[];
  archivedCount: number;
} {
  const nowIso = timestampIso || new Date().toISOString();
  const newlyArchived: ArchivedTask[] = [];
  const capturedDetailedIds = new Set<string>();
  let seq = 0;

  for (const col of columns) {
    for (const task of col.tasks) {
      const cleanText = task.text.trim();
      if (!task.completed || !cleanText || cleanText === '—') continue;

      const link = DETAILED_DAILY_TASK_LINKS.find(
        (l) => l.dayId === col.id && l.dailyTaskId === task.id
      );
      const linkedDt = link
        ? detailedTasks.find((dt) => dt.id === link.detailedTaskId)
        : undefined;

      if (linkedDt && linkedDt.completed) {
        capturedDetailedIds.add(linkedDt.id);
      }

      newlyArchived.push({
        archiveId: `arch-${task.id}-${Date.now()}-${++seq}`,
        originalTaskId: task.id,
        text: cleanText,
        priority: task.priority,
        category: task.category || 'Work',
        notes: task.notes || '',
        sourceType: 'daily',
        sourceDayId: col.id,
        sourceLabel: `${col.dayName} (${col.dateLabel})`,
        linkedDetailedTaskId: link?.detailedTaskId,
        linkedDetailedText:
          linkedDt && linkedDt.text.trim().length > 0
            ? linkedDt.text.trim()
            : undefined,
        archivedAt: nowIso,
      });
    }
  }

  for (const dt of detailedTasks) {
    const cleanText = dt.text.trim();
    if (!dt.completed || !cleanText || cleanText === '—') continue;
    if (capturedDetailedIds.has(dt.id)) continue;

    const link = DETAILED_DAILY_TASK_LINKS.find(
      (l) => l.detailedTaskId === dt.id
    );
    const linkedCol = link
      ? columns.find((c) => c.id === link.dayId)
      : undefined;

    newlyArchived.push({
      archiveId: `arch-${dt.id}-${Date.now()}-${++seq}`,
      originalTaskId: dt.id,
      text: cleanText,
      priority: dt.priority,
      category: dt.category || 'Work',
      notes: '',
      sourceType: 'detailed',
      sourceDayId: link?.dayId,
      sourceLabel: linkedCol
        ? `${linkedCol.dayName} (${linkedCol.dateLabel})`
        : 'Live Breakdown',
      linkedDetailedTaskId: dt.id,
      linkedDetailedText: cleanText,
      archivedAt: nowIso,
    });
  }

  if (newlyArchived.length === 0) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      nextArchive: existingArchive,
      archivedCount: 0,
    };
  }

  const nextColumns = clearCompletedWeekTasks(columns);
  const nextDetailedTasks = detailedTasks.map((dt) => {
    if (dt.completed || capturedDetailedIds.has(dt.id)) {
      return {
        ...dt,
        text: '',
        completed: false,
        status: 'To Do' as TaskStatus,
      };
    }
    return dt;
  });

  return {
    nextColumns,
    nextDetailedTasks,
    nextArchive: [...newlyArchived, ...existingArchive],
    archivedCount: newlyArchived.length,
  };
}

export function archiveSingleDailyTask(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  existingArchive: ArchivedTask[],
  dayId: string,
  taskId: string,
  timestampIso?: string
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  nextArchive: ArchivedTask[];
  archivedItem: ArchivedTask | null;
} {
  const col = columns.find((c) => c.id === dayId);
  const targetTask = col?.tasks.find((t) => t.id === taskId);
  if (
    !col ||
    !targetTask ||
    !targetTask.text.trim() ||
    targetTask.text.trim() === '—'
  ) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      nextArchive: existingArchive,
      archivedItem: null,
    };
  }

  const nowIso = timestampIso || new Date().toISOString();
  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.dayId === dayId && l.dailyTaskId === taskId
  );
  const linkedDt = link
    ? detailedTasks.find((dt) => dt.id === link.detailedTaskId)
    : undefined;

  const archivedItem: ArchivedTask = {
    archiveId: `arch-${targetTask.id}-${Date.now()}`,
    originalTaskId: targetTask.id,
    text: targetTask.text.trim(),
    priority: targetTask.priority,
    category: targetTask.category || 'Work',
    notes: targetTask.notes || '',
    sourceType: 'daily',
    sourceDayId: col.id,
    sourceLabel: `${col.dayName} (${col.dateLabel})`,
    linkedDetailedTaskId: link?.detailedTaskId,
    linkedDetailedText:
      linkedDt && linkedDt.text.trim().length > 0
        ? linkedDt.text.trim()
        : undefined,
    archivedAt: nowIso,
  };

  const nextColumns = columns.map((c) =>
    c.id === dayId ? compactSingleDayColumn(c, (t) => t.id !== taskId) : c
  );

  const nextDetailedTasks = link
    ? detailedTasks.map((dt) =>
        dt.id === link.detailedTaskId
          ? {
              ...dt,
              text: '',
              completed: false,
              status: 'To Do' as TaskStatus,
            }
          : dt
      )
    : detailedTasks;

  return {
    nextColumns,
    nextDetailedTasks,
    nextArchive: [archivedItem, ...existingArchive],
    archivedItem,
  };
}

export function archiveSingleDetailedTask(
  detailedTasks: DetailedTask[],
  columns: DayColumn[],
  existingArchive: ArchivedTask[],
  detailedTaskId: string,
  timestampIso?: string
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  nextArchive: ArchivedTask[];
  archivedItem: ArchivedTask | null;
} {
  const targetDt = detailedTasks.find((dt) => dt.id === detailedTaskId);
  if (!targetDt || !targetDt.text.trim() || targetDt.text.trim() === '—') {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      nextArchive: existingArchive,
      archivedItem: null,
    };
  }

  const nowIso = timestampIso || new Date().toISOString();
  const link = DETAILED_DAILY_TASK_LINKS.find(
    (l) => l.detailedTaskId === detailedTaskId
  );
  const linkedCol = link ? columns.find((c) => c.id === link.dayId) : undefined;
  const linkedDailyTask =
    link && linkedCol
      ? linkedCol.tasks.find((t) => t.id === link.dailyTaskId)
      : undefined;

  const archivedItem: ArchivedTask = {
    archiveId: `arch-${targetDt.id}-${Date.now()}`,
    originalTaskId: linkedDailyTask?.id || targetDt.id,
    text:
      linkedDailyTask && linkedDailyTask.text.trim().length > 0
        ? linkedDailyTask.text.trim()
        : targetDt.text.trim(),
    priority: targetDt.priority,
    category: targetDt.category || 'Work',
    notes: linkedDailyTask?.notes || '',
    sourceType: linkedCol ? 'daily' : 'detailed',
    sourceDayId: linkedCol?.id,
    sourceLabel: linkedCol
      ? `${linkedCol.dayName} (${linkedCol.dateLabel})`
      : 'Live Breakdown',
    linkedDetailedTaskId: targetDt.id,
    linkedDetailedText: targetDt.text.trim(),
    archivedAt: nowIso,
  };

  const nextDetailedTasks = detailedTasks.map((dt) =>
    dt.id === detailedTaskId
      ? {
          ...dt,
          text: '',
          completed: false,
          status: 'To Do' as TaskStatus,
        }
      : dt
  );

  const nextColumns =
    link && linkedCol
      ? columns.map((c) =>
          c.id === link.dayId
            ? compactSingleDayColumn(c, (t) => t.id !== link.dailyTaskId)
            : c
        )
      : columns;

  return {
    nextColumns,
    nextDetailedTasks,
    nextArchive: [archivedItem, ...existingArchive],
    archivedItem,
  };
}

export function restoreArchivedTask(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  existingArchive: ArchivedTask[],
  archiveId: string
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  nextArchive: ArchivedTask[];
  restoredItem: ArchivedTask | null;
} {
  const item = existingArchive.find((a) => a.archiveId === archiveId);
  if (!item) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      nextArchive: existingArchive,
      restoredItem: null,
    };
  }

  const nextArchive = existingArchive.filter((a) => a.archiveId !== archiveId);
  let nextColumns = columns;
  let nextDetailedTasks = detailedTasks;

  const targetDayId =
    item.sourceDayId || (item.sourceType === 'daily' ? 'mon' : undefined);

  if (targetDayId) {
    nextColumns = columns.map((col) => {
      if (col.id !== targetDayId) return col;
      const tasksCopy = [...col.tasks];
      const blankIdx = tasksCopy.findIndex((t) => t.text.trim().length === 0);
      if (blankIdx !== -1) {
        tasksCopy[blankIdx] = {
          ...tasksCopy[blankIdx],
          text: item.text,
          completed: true,
          status: 'Done',
          priority: item.priority,
          category: item.category,
          notes: item.notes || '',
        };
      } else {
        tasksCopy.push({
          id: `${col.id}-restored-${Date.now()}`,
          text: item.text,
          completed: true,
          status: 'Done',
          priority: item.priority,
          category: item.category,
          notes: item.notes || '',
        });
      }
      return {
        ...col,
        tasks: tasksCopy,
      };
    });
  }

  if (item.linkedDetailedTaskId || item.sourceType === 'detailed') {
    const targetDtId = item.linkedDetailedTaskId || item.originalTaskId;
    const restoredDtText = item.linkedDetailedText || item.text;
    let restoredInDetailed = false;

    nextDetailedTasks = detailedTasks.map((dt) => {
      if (dt.id === targetDtId && !restoredInDetailed) {
        restoredInDetailed = true;
        return {
          ...dt,
          text: restoredDtText,
          completed: true,
          status: 'Done',
          priority: item.priority,
          category: item.category,
        };
      }
      return dt;
    });

    if (!restoredInDetailed) {
      const firstEmptyIdx = nextDetailedTasks.findIndex(
        (dt) => dt.text.trim().length === 0
      );
      if (firstEmptyIdx !== -1) {
        nextDetailedTasks = nextDetailedTasks.map((dt, idx) =>
          idx === firstEmptyIdx
            ? {
                ...dt,
                text: restoredDtText,
                completed: true,
                status: 'Done',
                priority: item.priority,
                category: item.category,
              }
            : dt
        );
      }
    }
  }

  return {
    nextColumns,
    nextDetailedTasks,
    nextArchive,
    restoredItem: item,
  };
}

export function restoreAllArchivedTasks(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  existingArchive: ArchivedTask[]
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  nextArchive: ArchivedTask[];
} {
  let currentCols = columns;
  let currentDetailed = detailedTasks;
  let currentArchive = [...existingArchive];

  // Restore in reverse chronological order so earliest archived slots fill first
  const reversed = [...existingArchive].reverse();
  for (const item of reversed) {
    const res = restoreArchivedTask(
      currentCols,
      currentDetailed,
      currentArchive,
      item.archiveId
    );
    currentCols = res.nextColumns;
    currentDetailed = res.nextDetailedTasks;
    currentArchive = res.nextArchive;
  }

  return {
    nextColumns: currentCols,
    nextDetailedTasks: currentDetailed,
    nextArchive: [],
  };
}

export function filterArchivedTasks(
  archivedTasks: ArchivedTask[],
  query: string
): ArchivedTask[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return archivedTasks;
  return archivedTasks.filter((item) => {
    const textMatch = item.text.toLowerCase().includes(normalized);
    const detailedMatch = Boolean(
      item.linkedDetailedText &&
        item.linkedDetailedText.toLowerCase().includes(normalized)
    );
    const notesMatch = Boolean(
      item.notes && item.notes.toLowerCase().includes(normalized)
    );
    const catMatch = item.category.toLowerCase().includes(normalized);
    const prioMatch = item.priority.toLowerCase().includes(normalized);
    const sourceMatch = item.sourceLabel.toLowerCase().includes(normalized);
    return (
      textMatch ||
      detailedMatch ||
      notesMatch ||
      catMatch ||
      prioMatch ||
      sourceMatch
    );
  });
}

export type SearchMatchField =
  | 'name'
  | 'category'
  | 'notes'
  | 'priority'
  | 'status';

export interface TaskMatchDetail {
  matches: boolean;
  field?: SearchMatchField;
  snippet?: string;
}

export function getTaskMatchDetail(
  task: {
    text: string;
    priority: Priority;
    status: TaskStatus;
    category?: TaskCategory;
    notes?: string;
  },
  query: string
): TaskMatchDetail {
  const trimmed = query.trim();
  if (!trimmed) {
    return { matches: true };
  }
  if (!task.text.trim() || task.text.trim() === '—') {
    return { matches: false };
  }

  const normalized = trimmed.toLowerCase();

  // 1. Task name / text match
  if (task.text.toLowerCase().includes(normalized)) {
    return { matches: true, field: 'name' };
  }

  // 2. Category match (e.g. Work, Health, Personal, Finance, etc.)
  if (task.category && task.category.toLowerCase().includes(normalized)) {
    return { matches: true, field: 'category' };
  }

  // 3. Note content match (with snippet extraction)
  if (task.notes && task.notes.toLowerCase().includes(normalized)) {
    const noteLower = task.notes.toLowerCase();
    const matchIdx = noteLower.indexOf(normalized);
    const start = Math.max(0, matchIdx - 18);
    const end = Math.min(task.notes.length, matchIdx + normalized.length + 22);
    let snippet = task.notes.slice(start, end).replace(/\s+/g, ' ').trim();
    if (start > 0) snippet = '…' + snippet;
    if (end < task.notes.length) snippet = snippet + '…';
    return { matches: true, field: 'notes', snippet };
  }

  // 4. Priority or status match
  if (task.priority.toLowerCase().includes(normalized)) {
    return { matches: true, field: 'priority' };
  }
  if (task.status.toLowerCase().includes(normalized)) {
    return { matches: true, field: 'status' };
  }

  return { matches: false };
}

export function matchesSearchKeyword(
  task: {
    text: string;
    priority: Priority;
    status: TaskStatus;
    category?: TaskCategory;
    notes?: string;
  },
  query: string
): boolean {
  return getTaskMatchDetail(task, query).matches;
}

export function filterDayColumnsByKeyword(
  columns: DayColumn[],
  query: string
): DayColumn[] {
  const normalized = query.trim();
  if (!normalized) return columns;
  return columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) => matchesSearchKeyword(task, normalized)),
  }));
}

export function filterDetailedTasksByKeyword(
  tasks: DetailedTask[],
  query: string
): DetailedTask[] {
  const normalized = query.trim();
  if (!normalized) return tasks;
  return tasks.filter((task) => matchesSearchKeyword(task, normalized));
}

export function filterTasksByCategory<
  T extends { text: string; category: TaskCategory }
>(tasks: T[], category: TaskCategory | 'All'): T[] {
  if (category === 'All') return tasks;
  return tasks.filter(
    (t) =>
      t.text.trim().length > 0 &&
      t.text.trim() !== '—' &&
      t.category === category
  );
}

export function filterDayColumnsByCategory(
  columns: DayColumn[],
  category: TaskCategory | 'All'
): DayColumn[] {
  if (category === 'All') return columns;
  return columns.map((col) => ({
    ...col,
    tasks: filterTasksByCategory(col.tasks, category),
  }));
}

export function countTasksByCategory(
  tasks: Array<{ text: string; category: TaskCategory }>
): Record<TaskCategory, number> {
  const counts: Record<TaskCategory, number> = {
    Work: 0,
    Personal: 0,
    Health: 0,
    Finance: 0,
    Home: 0,
    Growth: 0,
  };
  for (const t of tasks) {
    if (t.text.trim().length === 0 || t.text.trim() === '—') continue;
    const cat = isValidCategory(t.category) ? t.category : 'Work';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

export interface SearchMatchStats {
  weeklyMatches: number;
  monthlyMatches: number;
  yearlyMatches: number;
  totalMatches: number;
  byCategory: Record<TaskCategory, number>;
  byField: {
    name: number;
    category: number;
    notes: number;
    priority: number;
    status: number;
  };
}

export function countMatchingTasks(
  columns: DayColumn[],
  monthlyGoals: DetailedTask[],
  yearlyGoals: DetailedTask[],
  query: string
): SearchMatchStats {
  const normalized = query.trim();
  const byCategory: Record<TaskCategory, number> = {
    Work: 0,
    Personal: 0,
    Health: 0,
    Finance: 0,
    Home: 0,
    Growth: 0,
  };
  const byField = {
    name: 0,
    category: 0,
    notes: 0,
    priority: 0,
    status: 0,
  };

  if (!normalized) {
    const weeklyTotal = columns.reduce(
      (sum, col) =>
        sum +
        col.tasks.filter((t) => t.text.trim().length > 0 && t.text.trim() !== '—')
          .length,
      0
    );
    const monthlyTotal = monthlyGoals.filter(
      (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
    ).length;
    const yearlyTotal = yearlyGoals.filter(
      (t) => t.text.trim().length > 0 && t.text.trim() !== '—'
    ).length;

    for (const col of columns) {
      for (const t of col.tasks) {
        if (t.text.trim().length > 0 && t.text.trim() !== '—') {
          const cat = isValidCategory(t.category) ? t.category : 'Work';
          byCategory[cat] = (byCategory[cat] || 0) + 1;
        }
      }
    }
    for (const t of monthlyGoals) {
      if (t.text.trim().length > 0 && t.text.trim() !== '—') {
        const cat = isValidCategory(t.category) ? t.category : 'Work';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    }
    for (const t of yearlyGoals) {
      if (t.text.trim().length > 0 && t.text.trim() !== '—') {
        const cat = isValidCategory(t.category) ? t.category : 'Work';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }
    }

    return {
      weeklyMatches: weeklyTotal,
      monthlyMatches: monthlyTotal,
      yearlyMatches: yearlyTotal,
      totalMatches: weeklyTotal + monthlyTotal + yearlyTotal,
      byCategory,
      byField,
    };
  }

  let weeklyMatches = 0;
  for (const col of columns) {
    for (const t of col.tasks) {
      const match = getTaskMatchDetail(t, normalized);
      if (match.matches) {
        weeklyMatches++;
        const cat = isValidCategory(t.category) ? t.category : 'Work';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        if (match.field && byField[match.field] !== undefined) {
          byField[match.field]++;
        }
      }
    }
  }

  let monthlyMatches = 0;
  for (const t of monthlyGoals) {
    const match = getTaskMatchDetail(t, normalized);
    if (match.matches) {
      monthlyMatches++;
      const cat = isValidCategory(t.category) ? t.category : 'Work';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      if (match.field && byField[match.field] !== undefined) {
        byField[match.field]++;
      }
    }
  }

  let yearlyMatches = 0;
  for (const t of yearlyGoals) {
    const match = getTaskMatchDetail(t, normalized);
    if (match.matches) {
      yearlyMatches++;
      const cat = isValidCategory(t.category) ? t.category : 'Work';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
      if (match.field && byField[match.field] !== undefined) {
        byField[match.field]++;
      }
    }
  }

  return {
    weeklyMatches,
    monthlyMatches,
    yearlyMatches,
    totalMatches: weeklyMatches + monthlyMatches + yearlyMatches,
    byCategory,
    byField,
  };
}

export function formatVoiceTranscript(
  existingText: string,
  transcript: string
): string {
  const cleaned = transcript.trim().replace(/\.+$/, '').trim();
  if (!cleaned) return existingText;

  const base = existingText.trim() === '—' ? '' : existingText.trim();
  if (!base) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return `${base} ${cleaned}`;
}

export function isDayAllDone(tasks: DailyTask[]): boolean {
  const { completed, total } = calculateDayProgress(tasks);
  return total > 0 && completed === total;
}

export function shouldTriggerDayCompleteConfetti(
  previousTasks: DailyTask[],
  nextTasks: DailyTask[]
): boolean {
  return !isDayAllDone(previousTasks) && isDayAllDone(nextTasks);
}

export type PagePath =
  | '/'
  | '/how-it-works'
  | '/daily-columns'
  | '/one-click'
  | '/live-progress'
  | '/color-themes'
  | '/monthly-yearly'
  | '/built-to-reuse'
  | '/spreadsheet'
  | '/everything-you-get';

export interface PageRouteMeta {
  path: PagePath;
  sectionId: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  inPrimaryNav: boolean;
}

export const PAGE_ROUTES: PageRouteMeta[] = [
  {
    path: '/',
    sectionId: 'dashboard',
    label: 'Dashboard',
    eyebrow: 'INTERACTIVE TO-DO DASHBOARD',
    title: 'TO-DO DASHBOARD',
    description:
      'A self-saving, interactive Weekly, Monthly, and Yearly To-Do List dashboard with 4 color themes, live progress charts, and spreadsheet tracker.',
    inPrimaryNav: true,
  },
  {
    path: '/how-it-works',
    sectionId: 'how-it-works',
    label: 'How It Works',
    eyebrow: 'WORKS ANYWHERE · SAVES ITSELF',
    title: 'IT REMEMBERS EVERYTHING',
    description:
      'Learn how my-tasks.html works in any browser, bookmarks in one click, and auto-saves your tasks locally without accounts or subscriptions.',
    inPrimaryNav: true,
  },
  {
    path: '/daily-columns',
    sectionId: 'daily-columns',
    label: 'Daily Columns',
    eyebrow: 'REALLY READABLE DAILY COLUMNS',
    title: 'SPACIOUS & CLEAR',
    description:
      'Explore spacious, readable daily task columns with drag-and-drop task reordering across days, expandable task notes, and bulk actions.',
    inPrimaryNav: false,
  },
  {
    path: '/one-click',
    sectionId: 'one-click',
    label: 'One Click Away',
    eyebrow: 'FULLY INTERACTIVE',
    title: 'ONE CLICK AWAY',
    description:
      'Update any task in a single click: check off completed items, cycle High, Med, and Low priority dots, and switch task status pills.',
    inPrimaryNav: false,
  },
  {
    path: '/live-progress',
    sectionId: 'live-progress',
    label: 'Live Progress',
    eyebrow: 'LIVE PROGRESS DASHBOARD',
    title: 'ADDS ITSELF UP',
    description:
      'Track real-time weekly completion percentages, daily progress bars, priority distributions, and status breakdowns automatically.',
    inPrimaryNav: true,
  },
  {
    path: '/color-themes',
    sectionId: 'color-themes',
    label: 'Color Themes',
    eyebrow: 'FOUR COLOR THEMES',
    title: "THAT'S YOU",
    description:
      'Preview and switch instantly between four curated color themes: Terracotta, Candy Pastel, Lavender Mist, and Soft Neutral.',
    inPrimaryNav: true,
  },
  {
    path: '/monthly-yearly',
    sectionId: 'monthly-yearly',
    label: 'Monthly & Yearly',
    eyebrow: 'MONTHLY & YEARLY',
    title: 'BIGGER PICTURE, TOO',
    description:
      'Plan the bigger picture alongside your weekly schedule with dedicated Monthly and Yearly goal trackers and completion rings.',
    inPrimaryNav: false,
  },
  {
    path: '/built-to-reuse',
    sectionId: 'built-to-reuse',
    label: 'Built to Reuse',
    eyebrow: 'BUILT TO REUSE',
    title: 'USE IT FOREVER',
    description:
      'Reset any week to blank in one click and reuse your interactive Weekly, Monthly, and Yearly planner forever with no dated pages.',
    inPrimaryNav: false,
  },
  {
    path: '/spreadsheet',
    sectionId: 'spreadsheet',
    label: 'Spreadsheet',
    eyebrow: 'ALSO INCLUDED — FREE',
    title: 'SPREADSHEET?',
    description:
      'Use the built-in horizontal 7-day spreadsheet tracker or export your weekly tasks directly to Google Sheets and Microsoft Excel (.csv).',
    inPrimaryNav: true,
  },
  {
    path: '/everything-you-get',
    sectionId: 'everything-you-get',
    label: 'Everything You Get',
    eyebrow: 'INSTANT DIGITAL DOWNLOAD',
    title: 'EVERYTHING YOU GET',
    description:
      'Download the complete Interactive Weekly To-Do Dashboard bundle including standalone HTML, Google Sheets, Excel tracker, and quick-start guide.',
    inPrimaryNav: false,
  },
];

export function isKnownRoutePath(rawPathname: string): boolean {
  const cleaned = (rawPathname || '/')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

  if (
    !cleaned ||
    cleaned === '/' ||
    cleaned === '/index.html' ||
    cleaned === '/dashboard' ||
    cleaned === '#dashboard' ||
    cleaned === '#top'
  ) {
    return true;
  }

  const normalized = cleaned.startsWith('#')
    ? `/${cleaned.slice(1)}`
    : cleaned.startsWith('/')
    ? cleaned
    : `/${cleaned}`;

  return PAGE_ROUTES.some((r) => r.path === normalized);
}

export function resolveRoutePath(rawPathname: string): PagePath {
  const cleaned = (rawPathname || '/')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

  if (
    !cleaned ||
    cleaned === '/' ||
    cleaned === '/index.html' ||
    cleaned === '/dashboard' ||
    cleaned === '#dashboard' ||
    cleaned === '#top'
  ) {
    return '/';
  }

  const normalized = cleaned.startsWith('#')
    ? `/${cleaned.slice(1)}`
    : cleaned.startsWith('/')
    ? cleaned
    : `/${cleaned}`;

  const matched = PAGE_ROUTES.find((r) => r.path === normalized);
  return matched ? matched.path : '/';
}

export function getAdjacentRoutes(currentPath: PagePath): {
  prev: PageRouteMeta | null;
  next: PageRouteMeta | null;
  current: PageRouteMeta;
} {
  const idx = PAGE_ROUTES.findIndex((r) => r.path === currentPath);
  const safeIdx = idx >= 0 ? idx : 0;
  return {
    prev: safeIdx > 0 ? PAGE_ROUTES[safeIdx - 1] : null,
    next: safeIdx < PAGE_ROUTES.length - 1 ? PAGE_ROUTES[safeIdx + 1] : null,
    current: PAGE_ROUTES[safeIdx],
  };
}

export function formatTopBarViewContext(
  currentPath: PagePath,
  activeView: ViewMode,
  isNotFoundRoute = false
): string {
  if (isNotFoundRoute) {
    return '404 · Page Not Found';
  }
  const matchedRoute =
    PAGE_ROUTES.find((r) => r.path === currentPath) || PAGE_ROUTES[0];
  const viewModeLabel =
    activeView === 'month'
      ? 'This Month'
      : activeView === 'year'
      ? 'This Year'
      : 'This Week';
  return `${matchedRoute.label} · ${viewModeLabel}`;
}

export function findTaskLocation(
  columns: DayColumn[],
  id: string
): { dayId: string; taskIndex: number } | null {
  const cleanedDayId = id.startsWith('day-col-')
    ? id.replace(/^day-col-/, '')
    : id;
  const directDay = columns.find((col) => col.id === cleanedDayId);
  if (directDay) {
    return { dayId: directDay.id, taskIndex: -1 };
  }

  for (const col of columns) {
    const idx = col.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      return { dayId: col.id, taskIndex: idx };
    }
  }
  return null;
}

export function reorderOrMoveDailyTask(
  columns: DayColumn[],
  activeTaskId: string,
  overId: string
): DayColumn[] {
  if (!activeTaskId || !overId || activeTaskId === overId) {
    return columns;
  }

  const sourceLoc = findTaskLocation(columns, activeTaskId);
  const targetLoc = findTaskLocation(columns, overId);

  if (!sourceLoc || sourceLoc.taskIndex === -1 || !targetLoc) {
    return columns;
  }

  // Case 1: Reordering within the same day column
  if (sourceLoc.dayId === targetLoc.dayId) {
    return columns.map((col) => {
      if (col.id !== sourceLoc.dayId) return col;
      const tasks = [...col.tasks];
      const fromIndex = sourceLoc.taskIndex;
      const toIndex =
        targetLoc.taskIndex === -1 ? tasks.length - 1 : targetLoc.taskIndex;
      if (fromIndex === toIndex) return col;

      const [moved] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, moved);
      return {
        ...col,
        tasks,
      };
    });
  }

  // Case 2: Moving a task to a different day column
  const sourceCol = columns.find((c) => c.id === sourceLoc.dayId);
  const targetCol = columns.find((c) => c.id === targetLoc.dayId);
  if (!sourceCol || !targetCol) return columns;

  const movedTask = sourceCol.tasks[sourceLoc.taskIndex];
  if (!movedTask) return columns;

  return columns.map((col) => {
    if (col.id === sourceLoc.dayId) {
      const remaining = col.tasks.filter((_, idx) => idx !== sourceLoc.taskIndex);
      while (remaining.length < 6) {
        remaining.push({
          id: `${col.id}-blank-${remaining.length + 1}-${movedTask.id}`,
          text: '',
          completed: false,
          priority: 'Med',
          status: 'To Do',
          category: 'Personal',
          notes: '',
        });
      }
      return {
        ...col,
        tasks: remaining,
      };
    }

    if (col.id === targetLoc.dayId) {
      const nextTasks = [...col.tasks];
      let insertIndex =
        targetLoc.taskIndex === -1 ? nextTasks.length : targetLoc.taskIndex;

      // If dropped onto the column container itself, place right after existing active tasks
      if (targetLoc.taskIndex === -1) {
        const firstBlankIdx = nextTasks.findIndex(
          (t) => t.text.trim().length === 0
        );
        insertIndex = firstBlankIdx !== -1 ? firstBlankIdx : nextTasks.length;
      }

      nextTasks.splice(insertIndex, 0, movedTask);

      // Keep column at 6 rows if there is a trailing blank placeholder slot
      if (nextTasks.length > 6) {
        for (let i = nextTasks.length - 1; i >= 0; i--) {
          if (
            nextTasks[i].id !== movedTask.id &&
            nextTasks[i].text.trim().length === 0 &&
            !nextTasks[i].completed
          ) {
            nextTasks.splice(i, 1);
            break;
          }
        }
      }

      return {
        ...col,
        tasks: nextTasks,
      };
    }

    return col;
  });
}

export interface WeeklyTrendPoint {
  weekKey: string;
  weekLabel: string;
  dateRange: string;
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
  isCurrentWeek: boolean;
}

export function buildWeeklyProgressTrends(
  columns: DayColumn[],
  selectedDate: string
): WeeklyTrendPoint[] {
  const parsed = new Date(`${selectedDate}T12:00:00`);
  const baseDate = Number.isNaN(parsed.getTime())
    ? new Date('2026-06-11T12:00:00')
    : parsed;

  const dayOfWeek = baseDate.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(baseDate);
  currentMonday.setDate(baseDate.getDate() + diffToMonday);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const formatShortRange = (mondayDate: Date): string => {
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);
    return `${months[mondayDate.getMonth()]} ${mondayDate.getDate()} – ${
      months[sundayDate.getMonth()]
    } ${sundayDate.getDate()}`;
  };

  const historicalBaseline = [
    { offsetWeeks: -3, label: '3 Wks Ago', completed: 14, pending: 6 },
    { offsetWeeks: -2, label: '2 Wks Ago', completed: 16, pending: 5 },
    { offsetWeeks: -1, label: 'Last Week', completed: 18, pending: 4 },
  ];

  const historicalPoints: WeeklyTrendPoint[] = historicalBaseline.map((item) => {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() + item.offsetWeeks * 7);
    const total = item.completed + item.pending;
    const completionRate =
      total === 0 ? 0 : Math.round((item.completed / total) * 100);
    return {
      weekKey: `week-${item.offsetWeeks}`,
      weekLabel: item.label,
      dateRange: formatShortRange(monday),
      completed: item.completed,
      pending: item.pending,
      total,
      completionRate,
      isCurrentWeek: false,
    };
  });

  const activeDailyTasks = columns.flatMap((col) =>
    col.tasks.filter((t) => t.text.trim().length > 0 && t.text.trim() !== '—')
  );
  const currentCompleted = activeDailyTasks.filter((t) => t.completed).length;
  const currentTotal = activeDailyTasks.length;
  const currentPending = Math.max(0, currentTotal - currentCompleted);
  const currentCompletionRate =
    currentTotal === 0
      ? 0
      : Math.round((currentCompleted / currentTotal) * 100);

  const currentPoint: WeeklyTrendPoint = {
    weekKey: 'week-0',
    weekLabel: 'This Week',
    dateRange: formatShortRange(currentMonday),
    completed: currentCompleted,
    pending: currentPending,
    total: currentTotal,
    completionRate: currentCompletionRate,
    isCurrentWeek: true,
  };

  return [...historicalPoints, currentPoint];
}

export function sanitizeTaskText(raw: string, maxLength = 240): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, maxLength);
}

export function sanitizeTaskNotes(raw: string, maxLength = 4000): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, maxLength);
}

export function escapeHtml(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeCsvCell(raw: string): string {
  const trimmed = (raw || '').replace(/\r?\n/g, ' ').trim();
  if (!trimmed) return '""';
  const needsFormulaGuard = /^[=+\-@\t\r]/.test(trimmed);
  const safeContent = needsFormulaGuard ? `'${trimmed}` : trimmed;
  return `"${safeContent.replace(/"/g, '""')}"`;
}

export function generateCsvExport(columns: DayColumn[]): string {
  const headers = columns
    .map((c) => sanitizeCsvCell(`${c.dayName} (${c.dateLabel})`))
    .join(',');
  const maxRows = Math.max(6, ...columns.map((c) => c.tasks.length));
  const rows: string[] = [headers];

  for (let r = 0; r < maxRows; r++) {
    const rowCells = columns.map((col) => {
      const task = col.tasks[r];
      if (!task || !task.text.trim()) return '""';
      const statusMark = task.completed ? '[DONE] ' : `[${task.status}] `;
      const recurringSuffix =
        task.recurring && task.recurring !== 'none'
          ? ` [Repeat: ${task.recurring}]`
          : '';
      const noteSuffix =
        task.notes && task.notes.trim().length > 0
          ? ` — Notes: ${task.notes.trim()}`
          : '';
      return sanitizeCsvCell(
        `${statusMark}${task.text.trim()} (${task.priority})${recurringSuffix}${noteSuffix}`
      );
    });
    rows.push(rowCells.join(','));
  }

  return rows.join('\n');
}

export function generateStandaloneHtmlExport(
  columns: DayColumn[],
  activeTheme: ThemeId,
  weekRangeLabel: string
): string {
  const theme = THEMES[activeTheme] || THEMES.terracotta;
  const safeThemeName = escapeHtml(theme.name);
  const safeWeekRange = escapeHtml(weekRangeLabel);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>my-tasks.html — Weekly To-Do List (${safeThemeName})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAF7F2; color: #2F2B28; margin: 0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; background: #FFF; border-radius: 16px; border: 1px solid #E6DFD5; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
    h1 { margin: 0 0 6px 0; font-size: 24px; }
    .sub { color: #8A8279; font-size: 13px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px; }
    .col { border: 1px solid #ECE7DF; border-radius: 12px; overflow: hidden; background: #FFF; }
    .col-head { padding: 10px 12px; font-weight: 700; font-size: 14px; }
    .col-date { font-size: 11px; font-weight: 500; opacity: 0.75; }
    .task { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; border-bottom: 1px solid #F5F2EC; font-size: 12px; }
    .task-row { display: flex; align-items: center; gap: 8px; }
    .task-note { font-size: 11px; color: #7A7269; padding-left: 22px; }
    .done .task-text { text-decoration: line-through; color: #A59E95; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Weekly To-Do List</h1>
    <div class="sub">${safeWeekRange} · Theme: ${safeThemeName} · Auto-saved snapshot</div>
    <div class="grid">
      ${columns
        .map((col, idx) => {
          const stats = calculateDayProgress(col.tasks);
          const safeDayName = escapeHtml(col.dayName);
          const safeDateLabel = escapeHtml(col.dateLabel);
          const headerBg = theme.dayHeaders[idx] || theme.progressFill;
          return `<div class="col">
            <div class="col-head" style="background:${headerBg}">
              <div>${safeDayName}</div>
              <div class="col-date">${safeDateLabel} (${stats.fractionLabel})</div>
            </div>
            ${col.tasks
              .filter((t) => t.text.trim().length > 0)
              .map((t) => {
                const safeText = escapeHtml(t.text);
                const safeNotes =
                  t.notes && t.notes.trim().length > 0
                    ? `<div class="task-note">${escapeHtml(t.notes.trim())}</div>`
                    : '';
                return `<div class="task ${t.completed ? 'done' : ''}">
                  <label class="task-row">
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="this.closest('.task').classList.toggle('done')" />
                    <span class="task-text">${safeText}</span>
                  </label>
                  ${safeNotes}
                </div>`;
              })
              .join('')}
          </div>`;
        })
        .join('')}
    </div>
  </div>
</body>
</html>`;
}

function isValidPriority(val: unknown): val is Priority {
  return val === 'High' || val === 'Med' || val === 'Low';
}

function isValidStatus(val: unknown): val is TaskStatus {
  return val === 'To Do' || val === 'In Progress' || val === 'Done';
}

export function isValidCategory(val: unknown): val is TaskCategory {
  return (
    typeof val === 'string' &&
    (TASK_CATEGORIES as string[]).includes(val)
  );
}

export function isValidRecurring(val: unknown): val is RecurringInterval {
  return (
    val === 'none' ||
    val === 'daily' ||
    val === 'weekly' ||
    val === 'monthly'
  );
}

export function parsePersistedDashboardState(rawJson: string | null): {
  columns: DayColumn[];
  detailedTasks: DetailedTask[];
  monthlyGoals: DetailedTask[];
  yearlyGoals: DetailedTask[];
  archivedTasks: ArchivedTask[];
  activeTheme: ThemeId;
} {
  const defaultColumns = createInitialWeekColumns();
  const defaultDetailed = createInitialDetailedTasks();
  const defaultMonthly = createInitialMonthlyGoals();
  const defaultYearly = createInitialYearlyGoals();
  const defaultTheme: ThemeId = 'terracotta';

  if (!rawJson || typeof rawJson !== 'string') {
    return {
      columns: defaultColumns,
      detailedTasks: defaultDetailed,
      monthlyGoals: defaultMonthly,
      yearlyGoals: defaultYearly,
      archivedTasks: [],
      activeTheme: defaultTheme,
    };
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid root state');
    }

    const columns: DayColumn[] =
      Array.isArray(parsed.columns) && parsed.columns.length === 7
        ? parsed.columns.map((col: any, colIdx: number) => {
            const fallbackCol = defaultColumns[colIdx];
            const rawTasks = Array.isArray(col?.tasks)
              ? col.tasks
              : fallbackCol.tasks;
            return {
              id:
                typeof col?.id === 'string' && col.id.trim()
                  ? col.id
                  : fallbackCol.id,
              dayName:
                typeof col?.dayName === 'string' && col.dayName.trim()
                  ? col.dayName
                  : fallbackCol.dayName,
              dateLabel:
                typeof col?.dateLabel === 'string' && col.dateLabel.trim()
                  ? col.dateLabel
                  : fallbackCol.dateLabel,
              isToday:
                typeof col?.isToday === 'boolean'
                  ? col.isToday
                  : fallbackCol.isToday,
              tasks: rawTasks.slice(0, 30).map((task: any, taskIdx: number) => {
                const fallbackTask = fallbackCol.tasks[taskIdx];
                const completed = Boolean(task?.completed);
                const status: TaskStatus = isValidStatus(task?.status)
                  ? task.status
                  : completed
                  ? 'Done'
                  : 'To Do';
                return {
                  id:
                    typeof task?.id === 'string' && task.id.trim()
                      ? task.id
                      : fallbackTask?.id ?? `${fallbackCol.id}-${taskIdx + 1}`,
                  text:
                    typeof task?.text === 'string'
                      ? sanitizeTaskText(task.text)
                      : '',
                  completed,
                  priority: isValidPriority(task?.priority)
                    ? task.priority
                    : fallbackTask?.priority ?? 'Med',
                  status,
                  category: isValidCategory(task?.category)
                    ? task.category
                    : fallbackTask?.category ?? 'Work',
                  notes:
                    typeof task?.notes === 'string'
                      ? sanitizeTaskNotes(task.notes)
                      : fallbackTask?.notes ?? '',
                  recurring: isValidRecurring(task?.recurring)
                    ? task.recurring
                    : fallbackTask?.recurring ?? 'none',
                };
              }),
            };
          })
        : defaultColumns;

    const sanitizeDetailedList = (
      rawList: unknown,
      fallbackList: DetailedTask[]
    ): DetailedTask[] => {
      if (!Array.isArray(rawList) || rawList.length === 0) return fallbackList;
      return rawList.slice(0, 30).map((item: any, idx: number) => {
        const fb = fallbackList[idx];
        const completed = Boolean(item?.completed);
        const status: TaskStatus = isValidStatus(item?.status)
          ? item.status
          : completed
          ? 'Done'
          : 'To Do';
        return {
          id:
            typeof item?.id === 'string' && item.id.trim()
              ? item.id
              : fb?.id ?? `item-${idx + 1}`,
          text:
            typeof item?.text === 'string'
              ? sanitizeTaskText(item.text)
              : fb?.text ?? '',
          completed,
          priority: isValidPriority(item?.priority)
            ? item.priority
            : fb?.priority ?? 'Med',
          status,
          category: isValidCategory(item?.category)
            ? item.category
            : fb?.category ?? 'Work',
          recurring: isValidRecurring(item?.recurring)
            ? item.recurring
            : fb?.recurring ?? 'none',
        };
      });
    };

    const activeTheme: ThemeId =
      typeof parsed.activeTheme === 'string' &&
      THEMES[parsed.activeTheme as ThemeId]
        ? (parsed.activeTheme as ThemeId)
        : defaultTheme;

    const archivedTasks: ArchivedTask[] = Array.isArray(parsed.archivedTasks)
      ? parsed.archivedTasks
          .slice(0, 200)
          .filter(
            (item: any) =>
              item &&
              typeof item === 'object' &&
              typeof item.text === 'string' &&
              item.text.trim().length > 0
          )
          .map((item: any, idx: number) => ({
            archiveId:
              typeof item.archiveId === 'string' && item.archiveId.trim()
                ? item.archiveId
                : `arch-persisted-${idx + 1}`,
            originalTaskId:
              typeof item.originalTaskId === 'string' &&
              item.originalTaskId.trim()
                ? item.originalTaskId
                : `orig-${idx + 1}`,
            text: sanitizeTaskText(item.text),
            priority: isValidPriority(item.priority) ? item.priority : 'Med',
            category: isValidCategory(item.category) ? item.category : 'Work',
            notes:
              typeof item.notes === 'string'
                ? sanitizeTaskNotes(item.notes)
                : '',
            recurring: isValidRecurring(item.recurring)
              ? item.recurring
              : 'none',
            sourceType: item.sourceType === 'detailed' ? 'detailed' : 'daily',
            sourceDayId:
              typeof item.sourceDayId === 'string'
                ? item.sourceDayId
                : undefined,
            sourceLabel:
              typeof item.sourceLabel === 'string' && item.sourceLabel.trim()
                ? sanitizeTaskText(item.sourceLabel, 80)
                : 'Daily List',
            linkedDetailedTaskId:
              typeof item.linkedDetailedTaskId === 'string'
                ? item.linkedDetailedTaskId
                : undefined,
            linkedDetailedText:
              typeof item.linkedDetailedText === 'string'
                ? sanitizeTaskText(item.linkedDetailedText)
                : undefined,
            archivedAt:
              typeof item.archivedAt === 'string' && item.archivedAt.trim()
                ? item.archivedAt
                : new Date().toISOString(),
          }))
      : [];

    return {
      columns,
      detailedTasks: sanitizeDetailedList(
        parsed.detailedTasks,
        defaultDetailed
      ),
      monthlyGoals: sanitizeDetailedList(parsed.monthlyGoals, defaultMonthly),
      yearlyGoals: sanitizeDetailedList(parsed.yearlyGoals, defaultYearly),
      archivedTasks,
      activeTheme,
    };
  } catch {
    return {
      columns: defaultColumns,
      detailedTasks: defaultDetailed,
      monthlyGoals: defaultMonthly,
      yearlyGoals: defaultYearly,
      archivedTasks: [],
      activeTheme: defaultTheme,
    };
  }
}

export const THEME_ORDER: ThemeId[] = [
  'terracotta',
  'candy',
  'lavender',
  'neutral',
];

export function cycleTheme(current: ThemeId): ThemeId {
  const idx = THEME_ORDER.indexOf(current);
  if (idx === -1) return 'terracotta';
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

export type KeyboardShortcutCategory =
  | 'Saving & Editing'
  | 'Views & Search'
  | 'Navigation & Modals';

export type KeyboardShortcutAction =
  | 'SAVE_DASHBOARD'
  | 'UNDO'
  | 'REDO'
  | 'TOGGLE_SOUND'
  | 'TOGGLE_DARK_MODE'
  | 'TOGGLE_FULLSCREEN'
  | 'ESCAPE'
  | 'OPEN_SHORTCUTS_MODAL'
  | 'OPEN_ARCHIVE_MODAL'
  | 'FOCUS_SEARCH'
  | 'VIEW_WEEK'
  | 'VIEW_MONTH'
  | 'VIEW_YEAR'
  | 'CYCLE_THEME'
  | 'OPEN_DOWNLOAD_MODAL'
  | 'NAV_PREV_PAGE'
  | 'NAV_NEXT_PAGE';

export interface KeyboardShortcutItem {
  id: string;
  action: KeyboardShortcutAction | 'ENTER_NEXT_TASK';
  category: KeyboardShortcutCategory;
  keys: string[];
  macKeys?: string[];
  label: string;
  description: string;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcutItem[] = [
  {
    id: 'save-dashboard',
    action: 'SAVE_DASHBOARD',
    category: 'Saving & Editing',
    keys: ['Ctrl', 'Enter'],
    macKeys: ['⌘', 'Enter'],
    label: 'Save Tasks & Notes',
    description:
      'Immediately syncs all tasks and notes to local storage and commits the active field.',
  },
  {
    id: 'undo-task-action',
    action: 'UNDO',
    category: 'Saving & Editing',
    keys: ['Ctrl', 'Z'],
    macKeys: ['⌘', 'Z'],
    label: 'Undo Task Action',
    description:
      'Reverts the most recent task addition, deletion, reorder, or completion change.',
  },
  {
    id: 'redo-task-action',
    action: 'REDO',
    category: 'Saving & Editing',
    keys: ['Ctrl', 'Shift', 'Z'],
    macKeys: ['⌘', 'Shift', 'Z'],
    label: 'Redo Task Action',
    description:
      'Re-applies the most recently undone task change (also works with Ctrl + Y).',
  },
  {
    id: 'toggle-sound-effect',
    action: 'TOGGLE_SOUND',
    category: 'Saving & Editing',
    keys: ['M'],
    label: 'Toggle Completion Sound',
    description:
      'Mutes or enables the subtle Web Audio API tactile chime when completing a task.',
  },
  {
    id: 'enter-next-task',
    action: 'ENTER_NEXT_TASK',
    category: 'Saving & Editing',
    keys: ['Enter'],
    label: 'Next Task Slot',
    description:
      'Commits the current task input and moves focus to the next task slot in that day column.',
  },
  {
    id: 'escape-close',
    action: 'ESCAPE',
    category: 'Navigation & Modals',
    keys: ['Esc'],
    label: 'Close Modal / Exit Fullscreen',
    description:
      'Exits Fullscreen Presentation Mode, closes any open modal, or clears/blurs the active input.',
  },
  {
    id: 'focus-search',
    action: 'FOCUS_SEARCH',
    category: 'Views & Search',
    keys: ['/'],
    macKeys: ['⌘', 'K'],
    label: 'Focus Task Search',
    description:
      'Jumps directly to the real-time task search bar (also works with Ctrl + K).',
  },
  {
    id: 'view-week',
    action: 'VIEW_WEEK',
    category: 'Views & Search',
    keys: ['1'],
    label: 'Switch to This Week',
    description: 'Activates the 7-day Weekly To-Do List view.',
  },
  {
    id: 'view-month',
    action: 'VIEW_MONTH',
    category: 'Views & Search',
    keys: ['2'],
    label: 'Switch to This Month',
    description: 'Activates the Monthly Goals & Tasks tracker.',
  },
  {
    id: 'view-year',
    action: 'VIEW_YEAR',
    category: 'Views & Search',
    keys: ['3'],
    label: 'Switch to This Year',
    description: 'Activates the Yearly Goals overview.',
  },
  {
    id: 'cycle-theme',
    action: 'CYCLE_THEME',
    category: 'Views & Search',
    keys: ['T'],
    macKeys: ['Alt', 'T'],
    label: 'Cycle Color Theme',
    description:
      'Cycles through Terracotta, Candy Pastel, Lavender Mist, and Soft Neutral themes.',
  },
  {
    id: 'toggle-dark-mode',
    action: 'TOGGLE_DARK_MODE',
    category: 'Views & Search',
    keys: ['D'],
    label: 'Toggle Dark / Light Mode',
    description:
      'Switches instantly between Light Mode and Dark Mode across the entire website.',
  },
  {
    id: 'toggle-fullscreen-presentation',
    action: 'TOGGLE_FULLSCREEN',
    category: 'Views & Search',
    keys: ['F'],
    label: 'Fullscreen Presentation Mode',
    description:
      'Expands the website into distraction-free Fullscreen Presentation Mode (press Esc to exit).',
  },
  {
    id: 'open-archive',
    action: 'OPEN_ARCHIVE_MODAL',
    category: 'Navigation & Modals',
    keys: ['A'],
    label: 'Open Task Archive',
    description:
      'Opens the Archive modal to view, filter, or restore completed tasks.',
  },
  {
    id: 'open-shortcuts',
    action: 'OPEN_SHORTCUTS_MODAL',
    category: 'Navigation & Modals',
    keys: ['?'],
    macKeys: ['Ctrl', '/'],
    label: 'Keyboard Shortcuts Guide',
    description: 'Opens or closes this keyboard shortcuts reference modal.',
  },
  {
    id: 'open-download',
    action: 'OPEN_DOWNLOAD_MODAL',
    category: 'Navigation & Modals',
    keys: ['Alt', 'D'],
    macKeys: ['⌘', 'Shift', 'E'],
    label: 'Open Download & Export',
    description:
      'Opens the Instant Digital Download & CSV Spreadsheet export modal.',
  },
  {
    id: 'nav-adjacent-page',
    action: 'NAV_NEXT_PAGE',
    category: 'Navigation & Modals',
    keys: ['Alt', '← / →'],
    label: 'Previous / Next Page',
    description: 'Navigates between adjacent dashboard showcase pages.',
  },
];

export interface ShortcutKeyEventInput {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  isEditableTarget?: boolean;
}

export function resolveKeyboardShortcutAction(
  eventInput: ShortcutKeyEventInput
): KeyboardShortcutAction | null {
  const key = eventInput.key || '';
  const lowerKey = key.toLowerCase();
  const hasPrimaryMod = Boolean(eventInput.ctrlKey || eventInput.metaKey);
  const shiftKey = Boolean(eventInput.shiftKey);
  const altKey = Boolean(eventInput.altKey);
  const isEditable = Boolean(eventInput.isEditableTarget);

  if (key === 'Escape') {
    return 'ESCAPE';
  }

  // Ctrl+Enter / Cmd+Enter or Ctrl+S / Cmd+S saves immediately even inside inputs/textareas
  if (hasPrimaryMod && !altKey && key === 'Enter') {
    return 'SAVE_DASHBOARD';
  }
  if (hasPrimaryMod && !shiftKey && !altKey && lowerKey === 's') {
    return 'SAVE_DASHBOARD';
  }

  // Ctrl+K / Cmd+K focuses search from anywhere
  if (hasPrimaryMod && !shiftKey && !altKey && lowerKey === 'k') {
    return 'FOCUS_SEARCH';
  }

  // Ctrl+/ or Cmd+/ toggles keyboard shortcuts modal from anywhere
  if (hasPrimaryMod && !altKey && (key === '/' || key === '?')) {
    return 'OPEN_SHORTCUTS_MODAL';
  }

  // Ctrl+Shift+E / Cmd+Shift+E opens download/export modal
  if (hasPrimaryMod && shiftKey && !altKey && lowerKey === 'e') {
    return 'OPEN_DOWNLOAD_MODAL';
  }

  // Ctrl+Z / Cmd+Z (undo) and Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y (redo)
  // Fires when user is not typing in a text field, reverting task actions
  if (!isEditable && hasPrimaryMod && !altKey) {
    if (!shiftKey && lowerKey === 'z') {
      return 'UNDO';
    }
    if ((shiftKey && lowerKey === 'z') || (!shiftKey && lowerKey === 'y')) {
      return 'REDO';
    }
  }

  // Alt shortcuts
  if (altKey && !hasPrimaryMod && !shiftKey) {
    if (lowerKey === 't') return 'CYCLE_THEME';
    if (lowerKey === 'd') return 'OPEN_DOWNLOAD_MODAL';
    if (!isEditable && key === 'ArrowLeft') return 'NAV_PREV_PAGE';
    if (!isEditable && key === 'ArrowRight') return 'NAV_NEXT_PAGE';
  }

  // Single-key shortcuts only fire when user is not typing in an input, textarea, or select
  if (!isEditable && !hasPrimaryMod && !altKey) {
    if (key === '?' || (shiftKey && key === '/')) {
      return 'OPEN_SHORTCUTS_MODAL';
    }
    if (key === '/' && !shiftKey) {
      return 'FOCUS_SEARCH';
    }
    if (!shiftKey) {
      if (key === '1') return 'VIEW_WEEK';
      if (key === '2') return 'VIEW_MONTH';
      if (key === '3') return 'VIEW_YEAR';
      if (lowerKey === 't') return 'CYCLE_THEME';
      if (lowerKey === 'd') return 'TOGGLE_DARK_MODE';
      if (lowerKey === 'f') return 'TOGGLE_FULLSCREEN';
      if (lowerKey === 'm') return 'TOGGLE_SOUND';
      if (lowerKey === 'a') return 'OPEN_ARCHIVE_MODAL';
    }
  }

  return null;
}

export const DASHBOARD_ENTRANCE_CONFIG = {
  staggerChildren: 0.08,
  delayChildren: 0.04,
  cardStaggerChildren: 0.06,
  itemDuration: 0.45,
  slideUpOffsetPx: 14,
  easing: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

export const DASHBOARD_ENTRANCE_CONTAINER_VARIANTS = {
  hidden: {
    opacity: 0,
    y: DASHBOARD_ENTRANCE_CONFIG.slideUpOffsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DASHBOARD_ENTRANCE_CONFIG.itemDuration,
      ease: DASHBOARD_ENTRANCE_CONFIG.easing,
      staggerChildren: DASHBOARD_ENTRANCE_CONFIG.staggerChildren,
      delayChildren: DASHBOARD_ENTRANCE_CONFIG.delayChildren,
    },
  },
};

export const DASHBOARD_ENTRANCE_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: DASHBOARD_ENTRANCE_CONFIG.slideUpOffsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DASHBOARD_ENTRANCE_CONFIG.itemDuration,
      ease: DASHBOARD_ENTRANCE_CONFIG.easing,
      staggerChildren: DASHBOARD_ENTRANCE_CONFIG.cardStaggerChildren,
    },
  },
};

let dashboardHasAnimatedOnInitialLoad = false;

export function hasDashboardAnimatedOnInitialLoad(): boolean {
  return dashboardHasAnimatedOnInitialLoad;
}

export function consumeDashboardInitialLoadEntrance(): boolean {
  if (dashboardHasAnimatedOnInitialLoad) {
    return false;
  }
  dashboardHasAnimatedOnInitialLoad = true;
  return true;
}

export function resetDashboardInitialLoadEntranceForTest(): void {
  dashboardHasAnimatedOnInitialLoad = false;
}

export function resolveDashboardEntranceInitialProp(options: {
  isInitialPageLoad: boolean;
  isThemeSwitch?: boolean;
}): 'hidden' | false {
  if (!options.isInitialPageLoad || options.isThemeSwitch) {
    return false;
  }
  return 'hidden';
}

export interface WeeklyCompletionBarSummary {
  completedTasks: number;
  totalTasks: number;
  pendingTasks: number;
  percentage: number;
  statusLabel: string;
  summaryText: string;
  milestoneMarkers: readonly number[];
}

export const WEEKLY_COMPLETION_BAR_MILESTONES = [25, 50, 75, 100] as const;

export function buildWeeklyCompletionBarSummary(input: {
  completedTasks: number;
  totalTasks: number;
  completionPercentage?: number;
}): WeeklyCompletionBarSummary {
  const totalTasks = Math.max(0, Math.floor(input.totalTasks));
  const completedTasks = Math.max(
    0,
    Math.min(totalTasks, Math.floor(input.completedTasks))
  );
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const computedPct =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const percentage = Math.max(
    0,
    Math.min(
      100,
      input.completionPercentage !== undefined
        ? Math.round(input.completionPercentage)
        : computedPct
    )
  );

  let statusLabel = 'No tasks completed yet';
  if (totalTasks === 0) {
    statusLabel = 'No tasks scheduled';
  } else if (percentage >= 100) {
    statusLabel = 'All weekly tasks complete!';
  } else if (percentage >= 75) {
    statusLabel = 'Final stretch!';
  } else if (percentage >= 50) {
    statusLabel = 'Halfway through the week';
  } else if (percentage > 0) {
    statusLabel = 'In progress';
  }

  const summaryText =
    totalTasks === 0
      ? '0 daily tasks scheduled this week'
      : `${completedTasks} of ${totalTasks} daily tasks completed · ${pendingTasks} remaining`;

  return {
    completedTasks,
    totalTasks,
    pendingTasks,
    percentage,
    statusLabel,
    summaryText,
    milestoneMarkers: WEEKLY_COMPLETION_BAR_MILESTONES,
  };
}

export interface BulkImportOptions {
  defaultCategory?: TaskCategory;
  defaultPriority?: Priority;
  defaultRecurring?: RecurringInterval;
  idGenerator?: (dayId: string, nextIndex: number) => string;
}

export interface ParsedBulkTaskItem {
  cleanText: string;
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  recurring: RecurringInterval;
}

export function parseBulkImportLines(
  rawInput: string,
  options?: BulkImportOptions
): ParsedBulkTaskItem[] {
  if (!rawInput || typeof rawInput !== 'string') {
    return [];
  }

  const defaultCategory: TaskCategory =
    options?.defaultCategory && isValidCategory(options.defaultCategory)
      ? options.defaultCategory
      : 'Work';
  const defaultPriority: Priority =
    options?.defaultPriority && isValidPriority(options.defaultPriority)
      ? options.defaultPriority
      : 'Med';
  const defaultRecurring: RecurringInterval =
    options?.defaultRecurring && isValidRecurring(options.defaultRecurring)
      ? options.defaultRecurring
      : 'none';

  const rawLines = rawInput.split(/\r?\n/);
  const items: ParsedBulkTaskItem[] = [];

  for (const rawLine of rawLines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Ignore pure horizontal dividers or placeholder em-dashes
    if (/^[-=_*—]{2,}$/.test(line) || line === '—') {
      continue;
    }

    let completed = false;

    // 1. Strip leading bullet + markdown checkbox or bare markdown checkbox
    // e.g. "- [x] Task", "* [ ] Task", "1. [x] Task", "[x] Task", "[ ] Task"
    const checkboxMatch = line.match(
      /^(?:[-*•◦▪▸→>]\s+|\d+[.)]\s+|\([a-zA-Z0-9]+\)\s+)?\[([ xX✓✔])\]\s+(.*)$/
    );
    if (checkboxMatch) {
      const marker = checkboxMatch[1].toLowerCase();
      completed = marker === 'x' || marker === '✓' || marker === '✔';
      line = checkboxMatch[2].trim();
    } else {
      // 2. Strip leading bullet or numbered prefix
      // e.g. "- Task", "* Task", "• Task", "1. Task", "2) Task", "(3) Task"
      line = line
        .replace(
          /^(?:[-*•◦▪▸→>]|\d+[.)]|\(\d+\)|[a-zA-Z][.)])\s+/,
          ''
        )
        .trim();
    }

    if (!line || line === '—') continue;

    // 3. Extract optional inline priority markers: !high, !med, !low, !medium, [high], [med], [low]
    let detectedPriority: Priority | undefined;
    line = line
      .replace(
        /(?:^|\s)(?:!(high|med|medium|low)|\[(high|med|medium|low)\])\b/gi,
        (_m, p1?: string, p2?: string) => {
          const rawP = (p1 || p2 || '').toLowerCase();
          if (rawP === 'high') detectedPriority = 'High';
          else if (rawP === 'med' || rawP === 'medium') detectedPriority = 'Med';
          else if (rawP === 'low') detectedPriority = 'Low';
          return ' ';
        }
      )
      .replace(/\s+/g, ' ')
      .trim();

    // 4. Parse inline #category and @recurring / #recurring tags via parseQuickTaskTag
    const parsedTag = parseQuickTaskTag(line, defaultCategory, defaultRecurring);
    const cleanText = parsedTag.cleanText.trim();
    if (!cleanText || cleanText === '—') continue;

    items.push({
      cleanText,
      completed,
      priority: detectedPriority ?? defaultPriority,
      category: parsedTag.category ?? defaultCategory,
      recurring: parsedTag.recurring ?? defaultRecurring,
    });
  }

  return items;
}

export function bulkImportTasksToDayColumn(
  columns: DayColumn[],
  detailedTasks: DetailedTask[],
  dayId: string,
  rawInput: string,
  options?: BulkImportOptions
): {
  nextColumns: DayColumn[];
  nextDetailedTasks: DetailedTask[];
  addedTasks: DailyTask[];
  targetDayName: string;
} {
  const targetCol = columns.find((col) => col.id === dayId);
  if (!targetCol) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      addedTasks: [],
      targetDayName: '',
    };
  }

  const parsedItems = parseBulkImportLines(rawInput, options);
  if (parsedItems.length === 0) {
    return {
      nextColumns: columns,
      nextDetailedTasks: detailedTasks,
      addedTasks: [],
      targetDayName: targetCol.dayName,
    };
  }

  let currentColumns = columns;
  let currentDetailedTasks = detailedTasks;
  const addedTasks: DailyTask[] = [];
  let seq = 0;

  for (const item of parsedItems) {
    const colSnapshot = currentColumns.find((c) => c.id === dayId)!;
    const firstBlankIndex = colSnapshot.tasks.findIndex(
      (t) => t.text.trim().length === 0 || t.text.trim() === '—'
    );

    let createdTask: DailyTask | null = null;
    let updatedDailyTaskId: string | null = null;

    currentColumns = currentColumns.map((col) => {
      if (col.id !== dayId) return col;

      if (firstBlankIndex !== -1) {
        const nextTasks = col.tasks.map((task, idx) => {
          if (idx !== firstBlankIndex) return task;
          const populated: DailyTask = {
            ...task,
            text: item.cleanText,
            completed: item.completed,
            status: item.completed ? 'Done' : 'To Do',
            priority: item.priority,
            category: item.category,
            notes: '',
            recurring: item.recurring,
          };
          createdTask = populated;
          updatedDailyTaskId = populated.id;
          return populated;
        });
        return {
          ...col,
          tasks: nextTasks,
        };
      }

      const nextIndex = col.tasks.length + 1;
      const existingIds = new Set(col.tasks.map((t) => t.id));
      let newTaskId = options?.idGenerator
        ? options.idGenerator(col.id, nextIndex)
        : `${col.id}-${nextIndex}`;
      if (existingIds.has(newTaskId)) {
        newTaskId = `${col.id}-${nextIndex}-${Date.now()}-${++seq}`;
      }

      const appended: DailyTask = {
        id: newTaskId,
        text: item.cleanText,
        completed: item.completed,
        status: item.completed ? 'Done' : 'To Do',
        priority: item.priority,
        category: item.category,
        notes: '',
        recurring: item.recurring,
      };
      createdTask = appended;
      updatedDailyTaskId = appended.id;

      return {
        ...col,
        tasks: [...col.tasks, appended],
      };
    });

    if (createdTask) {
      addedTasks.push(createdTask);
    }

    if (updatedDailyTaskId) {
      const link = DETAILED_DAILY_TASK_LINKS.find(
        (l) => l.dayId === dayId && l.dailyTaskId === updatedDailyTaskId
      );
      if (link) {
        currentDetailedTasks = currentDetailedTasks.map((dt) =>
          dt.id === link.detailedTaskId
            ? {
                ...dt,
                text: item.cleanText,
                completed: item.completed,
                status: item.completed ? 'Done' : 'To Do',
                priority: item.priority,
                category: item.category,
              }
            : dt
        );
      }
    }
  }

  return {
    nextColumns: currentColumns,
    nextDetailedTasks: currentDetailedTasks,
    addedTasks,
    targetDayName: targetCol.dayName,
  };
}



