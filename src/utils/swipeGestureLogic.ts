export const SWIPE_COMPLETE_THRESHOLD_PX = 64;
export const SWIPE_DELETE_THRESHOLD_PX = -64;
export const SWIPE_MAX_OFFSET_PX = 112;
export const SWIPE_DIRECTION_LOCK_PX = 10;

export type SwipeAxisLock = 'none' | 'horizontal' | 'vertical';
export type SwipeIntent = 'none' | 'complete' | 'delete';
export type SwipeTriggeredAction = 'complete' | 'delete' | null;

export interface SwipeGestureState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  rawDx: number;
  rawDy: number;
  offsetX: number;
  axisLock: SwipeAxisLock;
  intent: SwipeIntent;
  isPastThreshold: boolean;
  progress: number;
}

export function createInitialSwipeState(): SwipeGestureState {
  return {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    rawDx: 0,
    rawDy: 0,
    offsetX: 0,
    axisLock: 'none',
    intent: 'none',
    isPastThreshold: false,
    progress: 0,
  };
}

export function startSwipeGesture(x: number, y: number): SwipeGestureState {
  return {
    active: true,
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
    rawDx: 0,
    rawDy: 0,
    offsetX: 0,
    axisLock: 'none',
    intent: 'none',
    isPastThreshold: false,
    progress: 0,
  };
}

export function clampSwipeOffset(rawDx: number): number {
  if (!Number.isFinite(rawDx)) return 0;
  const sign = rawDx < 0 ? -1 : 1;
  const abs = Math.abs(rawDx);
  const threshold = Math.abs(SWIPE_COMPLETE_THRESHOLD_PX);
  if (abs <= threshold) {
    return Math.round(rawDx);
  }
  const extra = abs - threshold;
  const damped = threshold + extra * 0.45;
  return Math.round(sign * Math.min(SWIPE_MAX_OFFSET_PX, damped));
}

export function updateSwipeGesture(
  state: SwipeGestureState,
  currentX: number,
  currentY: number
): SwipeGestureState {
  if (!state.active) return state;

  const rawDx = currentX - state.startX;
  const rawDy = currentY - state.startY;
  let axisLock = state.axisLock;

  if (axisLock === 'none') {
    const absDx = Math.abs(rawDx);
    const absDy = Math.abs(rawDy);
    if (absDy > absDx && absDy >= SWIPE_DIRECTION_LOCK_PX) {
      axisLock = 'vertical';
    } else if (absDx >= SWIPE_DIRECTION_LOCK_PX && absDx >= absDy) {
      axisLock = 'horizontal';
    }
  }

  if (axisLock !== 'horizontal') {
    return {
      ...state,
      currentX,
      currentY,
      rawDx,
      rawDy,
      offsetX: 0,
      axisLock,
      intent: 'none',
      isPastThreshold: false,
      progress: 0,
    };
  }

  const offsetX = clampSwipeOffset(rawDx);
  const intent: SwipeIntent =
    offsetX >= 14 ? 'complete' : offsetX <= -14 ? 'delete' : 'none';
  const isPastThreshold =
    rawDx >= SWIPE_COMPLETE_THRESHOLD_PX || rawDx <= SWIPE_DELETE_THRESHOLD_PX;
  const progress = Math.min(
    1,
    Math.abs(rawDx) / Math.abs(SWIPE_COMPLETE_THRESHOLD_PX)
  );

  return {
    ...state,
    currentX,
    currentY,
    rawDx,
    rawDy,
    offsetX,
    axisLock,
    intent,
    isPastThreshold,
    progress: Number(progress.toFixed(2)),
  };
}

export function resolveSwipeReleaseAction(
  state: SwipeGestureState
): SwipeTriggeredAction {
  if (!state.active || state.axisLock !== 'horizontal') {
    return null;
  }
  if (state.rawDx >= SWIPE_COMPLETE_THRESHOLD_PX) {
    return 'complete';
  }
  if (state.rawDx <= SWIPE_DELETE_THRESHOLD_PX) {
    return 'delete';
  }
  return null;
}

export function updateSwipeGestureFromDelta(
  rawDx: number,
  rawDy: number,
  previousAxisLock: SwipeAxisLock = 'none'
): SwipeGestureState {
  const base = startSwipeGesture(0, 0);
  base.axisLock = previousAxisLock;
  return updateSwipeGesture(base, rawDx, rawDy);
}

export interface SwipeVisualFeedbackMeta {
  visible: boolean;
  direction: 'right' | 'left' | 'none';
  intent: SwipeIntent;
  isArmed: boolean;
  progressPercentage: number;
  actionLabel: string;
  shortBadgeText: string;
  statusPillText: string;
  iconScale: number;
  backdropColor: string;
  cardBorderRingColor: string | null;
}

export function getSwipeVisualFeedbackMeta(
  state: SwipeGestureState,
  isTaskCompleted = false
): SwipeVisualFeedbackMeta {
  if (!state.offsetX || state.axisLock !== 'horizontal') {
    return {
      visible: false,
      direction: 'none',
      intent: 'none',
      isArmed: false,
      progressPercentage: 0,
      actionLabel: '',
      shortBadgeText: '',
      statusPillText: '',
      iconScale: 0.85,
      backdropColor: 'transparent',
      cardBorderRingColor: null,
    };
  }

  const isRight = state.offsetX > 0;
  const isArmed = state.isPastThreshold;
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round(state.progress * 100))
  );
  const iconScale = Number(
    (isArmed ? 1.15 : 0.85 + state.progress * 0.22).toFixed(2)
  );

  if (isRight) {
    const verb = isTaskCompleted ? 'Undo' : 'Complete';
    return {
      visible: true,
      direction: 'right',
      intent: 'complete',
      isArmed,
      progressPercentage,
      actionLabel: isArmed ? `Release to ${verb}` : `Swipe to ${verb}`,
      shortBadgeText: verb,
      statusPillText: isArmed ? 'Ready' : `${progressPercentage}%`,
      iconScale,
      backdropColor: isArmed ? '#1F6E43' : '#3B8258',
      cardBorderRingColor: isArmed ? '#2D6E48' : null,
    };
  }

  return {
    visible: true,
    direction: 'left',
    intent: 'delete',
    isArmed,
    progressPercentage,
    actionLabel: isArmed ? 'Release to Delete' : 'Swipe to Delete',
    shortBadgeText: 'Delete',
    statusPillText: isArmed ? 'Ready' : `${progressPercentage}%`,
    iconScale,
    backdropColor: isArmed ? '#A63626' : '#C85A49',
    cardBorderRingColor: isArmed ? '#B84A39' : null,
  };
}

const WEEK_DAY_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const SHORT_MONTHS = [
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
] as const;
const SHORT_WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

export function isValidDueDateIso(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const [yStr, mStr, dStr] = trimmed.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIsoAtNoon(iso: string): Date {
  const [yStr, mStr, dStr] = iso.trim().split('-');
  return new Date(Number(yStr), Number(mStr) - 1, Number(dStr), 12, 0, 0);
}

export interface WeekDateBounds {
  startIso: string;
  endIso: string;
  dayIsoByDayId: Record<string, string>;
}

export function getWeekDateBounds(referenceDateIso?: string): WeekDateBounds {
  const fallbackIso = '2026-06-11';
  const safeRefIso = isValidDueDateIso(referenceDateIso)
    ? referenceDateIso.trim()
    : fallbackIso;

  const parsed = parseIsoAtNoon(safeRefIso);
  const dayOfWeek = parsed.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(parsed);
  monday.setDate(parsed.getDate() + diffToMonday);

  const dayIsoByDayId: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dayIsoByDayId[WEEK_DAY_IDS[i]] = formatDateToIso(d);
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startIso: formatDateToIso(monday),
    endIso: formatDateToIso(sunday),
    dayIsoByDayId,
  };
}

export function resolveDefaultDueDateForDayColumn(
  dayId: string,
  referenceDateIso?: string
): string {
  const bounds = getWeekDateBounds(referenceDateIso);
  const normalizedDayId = dayId.trim().toLowerCase();
  return bounds.dayIsoByDayId[normalizedDayId] ?? bounds.startIso;
}

export interface DueDateBadgeInfo {
  isoDate: string;
  isInCurrentWeek: boolean;
  shortLabel: string;
  dateOnlyLabel: string;
  weekdayShort: string;
  dayId?: string;
}

export function resolveCurrentWeekDueDateBadge(
  dueDateIso: string | undefined,
  referenceDateIso?: string
): DueDateBadgeInfo | null {
  if (!isValidDueDateIso(dueDateIso)) {
    return null;
  }
  const cleanDueIso = dueDateIso.trim();
  const bounds = getWeekDateBounds(referenceDateIso);
  const isInCurrentWeek =
    cleanDueIso >= bounds.startIso && cleanDueIso <= bounds.endIso;

  const parsedDue = parseIsoAtNoon(cleanDueIso);
  const monthLabel = SHORT_MONTHS[parsedDue.getMonth()];
  const dayNumber = parsedDue.getDate();
  const weekdayShort = SHORT_WEEKDAYS[parsedDue.getDay()];
  const dateOnlyLabel = `${monthLabel} ${dayNumber}`;
  const shortLabel = `Due ${dateOnlyLabel}`;

  const matchedDayEntry = Object.entries(bounds.dayIsoByDayId).find(
    ([, iso]) => iso === cleanDueIso
  );

  return {
    isoDate: cleanDueIso,
    isInCurrentWeek,
    shortLabel,
    dateOnlyLabel,
    weekdayShort,
    ...(matchedDayEntry ? { dayId: matchedDayEntry[0] } : {}),
  };
}
