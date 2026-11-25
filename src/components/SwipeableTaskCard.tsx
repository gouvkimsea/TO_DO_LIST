import React, { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, RotateCcw } from 'lucide-react';
import {
  createInitialSwipeState,
  startSwipeGesture,
  updateSwipeGesture,
  updateSwipeGestureFromDelta,
  resolveSwipeReleaseAction,
  getSwipeVisualFeedbackMeta,
  type SwipeGestureState,
} from '../utils/swipeGestureLogic';

export interface SwipeableTaskCardProps {
  taskId: string;
  completed: boolean;
  disabled?: boolean;
  testIdPrefix?: string;
  containerTestId?: string;
  className?: string;
  contentClassName?: string;
  extraDataAttributes?: Record<string, string | number | undefined>;
  onSwipeComplete: () => void;
  onSwipeDelete: () => void;
  children: React.ReactNode;
}

interface SortableSwipeSurfaceProps {
  swipeId: string;
  taskId: string;
  completed: boolean;
  disabled: boolean;
  testIdPrefix: string;
  contentClassName: string;
  swipeState: SwipeGestureState;
  onNativeTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onNativeTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onNativeTouchEnd: () => void;
  onNativeTouchCancel: () => void;
  children: React.ReactNode;
}

const isInteractiveControlTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, input, textarea, select, a, label, [role="checkbox"], [data-no-swipe="true"], [data-testid^="drag-handle-"]'
    )
  );
};

const SortableSwipeSurface: React.FC<SortableSwipeSurfaceProps> = ({
  swipeId,
  taskId,
  completed,
  disabled,
  testIdPrefix,
  contentClassName,
  swipeState,
  onNativeTouchStart,
  onNativeTouchMove,
  onNativeTouchEnd,
  onNativeTouchCancel,
  children,
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: swipeId,
    disabled,
  });

  const feedback = getSwipeVisualFeedbackMeta(swipeState, completed);

  // Use @dnd-kit/utilities CSS.Translate.toString for horizontal swipe translation
  const horizontalTransform =
    swipeState.offsetX !== 0
      ? CSS.Translate.toString({
          x: swipeState.offsetX,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        })
      : undefined;

  const filteredPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || isInteractiveControlTarget(e.target)) return;
      listeners?.onPointerDown?.(e);
    },
    [disabled, listeners]
  );

  return (
    <>
      {/* Pre-Finalization Visual Feedback Backdrop (Right = Complete/Undo, Left = Delete) */}
      {feedback.visible && (
        <div
          aria-hidden="true"
          data-testid={`${testIdPrefix}-swipe-backdrop-${taskId}`}
          data-swipe-direction={feedback.direction}
          data-swipe-armed={feedback.isArmed ? 'true' : 'false'}
          style={{
            backgroundColor: feedback.backdropColor,
          }}
          className={`absolute inset-0 flex items-center px-2.5 rounded-[inherit] text-[10px] font-extrabold uppercase tracking-wider text-white select-none pointer-events-none transition-colors duration-150 ${
            feedback.direction === 'right' ? 'justify-start' : 'justify-end'
          }`}
        >
          {feedback.direction === 'right' ? (
            <div className="flex flex-col items-start justify-center gap-1 max-w-[92px]">
              <div className="inline-flex items-center gap-1.5">
                <span
                  style={{
                    transform: `scale(${feedback.iconScale})`,
                  }}
                  className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 ${
                    feedback.isArmed
                      ? 'bg-white text-[#1F6E43] shadow-xs'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {completed ? (
                    <RotateCcw className="w-3.5 h-3.5 sm:w-3 sm:h-3 stroke-[2.75]" />
                  ) : (
                    <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 stroke-[3]" />
                  )}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black tabular-nums leading-none ${
                    feedback.isArmed
                      ? 'bg-white text-[#1F6E43]'
                      : 'bg-black/20 text-white/95'
                  }`}
                >
                  {feedback.statusPillText}
                </span>
              </div>
              <span className="text-[9px] leading-tight font-extrabold tracking-tight text-white/95 truncate max-w-[88px]">
                {feedback.actionLabel}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-end justify-center gap-1 max-w-[92px]">
              <div className="inline-flex items-center gap-1.5">
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black tabular-nums leading-none ${
                    feedback.isArmed
                      ? 'bg-white text-[#A63626]'
                      : 'bg-black/20 text-white/95'
                  }`}
                >
                  {feedback.statusPillText}
                </span>
                <span
                  style={{
                    transform: `scale(${feedback.iconScale})`,
                  }}
                  className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 ${
                    feedback.isArmed
                      ? 'bg-white text-[#A63626] shadow-xs'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                </span>
              </div>
              <span className="text-[9px] leading-tight font-extrabold tracking-tight text-white/95 truncate max-w-[88px] text-right">
                {feedback.actionLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Foreground Swipeable Card Content */}
      <div
        ref={setNodeRef}
        {...attributes}
        tabIndex={undefined}
        role={undefined}
        aria-roledescription="swipeable task card"
        data-testid={`swipeable-task-${taskId}`}
        data-swipe-surface={taskId}
        onPointerDown={filteredPointerDown}
        onTouchStart={onNativeTouchStart}
        onTouchMove={onNativeTouchMove}
        onTouchEnd={onNativeTouchEnd}
        onTouchCancel={onNativeTouchCancel}
        style={{
          transform: horizontalTransform,
          transition: swipeState.active
            ? 'none'
            : 'transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          boxShadow:
            feedback.isArmed && feedback.cardBorderRingColor
              ? `0 0 0 1.5px ${feedback.cardBorderRingColor}`
              : undefined,
        }}
        className={`relative z-10 touch-pan-y rounded-[inherit] ${
          feedback.visible ? 'bg-white dark:bg-[#1E1B18] shadow-xs' : ''
        } ${contentClassName}`}
      >
        {children}
      </div>
    </>
  );
};

export const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  taskId,
  completed,
  disabled = false,
  testIdPrefix = 'dashboard',
  containerTestId,
  className = '',
  contentClassName = '',
  extraDataAttributes,
  onSwipeComplete,
  onSwipeDelete,
  children,
}) => {
  const [swipeState, setSwipeState] = useState<SwipeGestureState>(() =>
    createInitialSwipeState()
  );
  const swipeRef = useRef<SwipeGestureState>(createInitialSwipeState());
  const swipeId = `swipe-card-${testIdPrefix}-${taskId}`;

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: { x: 10 },
        tolerance: { y: 15 },
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: { x: 12 },
      },
    })
  );

  const resetSwipe = useCallback(() => {
    const reset = createInitialSwipeState();
    swipeRef.current = reset;
    setSwipeState(reset);
  }, []);

  const finalizeSwipeAction = useCallback(
    (stateToResolve: SwipeGestureState) => {
      if (!stateToResolve.active) return;
      const action = resolveSwipeReleaseAction(stateToResolve);
      resetSwipe();
      if (action === 'complete') {
        onSwipeComplete();
      } else if (action === 'delete') {
        onSwipeDelete();
      }
    },
    [onSwipeComplete, onSwipeDelete, resetSwipe]
  );

  // @dnd-kit/core horizontal drag handlers
  const handleDndDragStart = useCallback(
    (_event: DragStartEvent) => {
      if (disabled) return;
      const next = startSwipeGesture(0, 0);
      swipeRef.current = next;
      setSwipeState(next);
    },
    [disabled]
  );

  const handleDndDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (disabled) return;
      const next = updateSwipeGestureFromDelta(
        event.delta.x,
        event.delta.y,
        swipeRef.current.axisLock
      );
      swipeRef.current = next;
      setSwipeState(next);
    },
    [disabled]
  );

  const handleDndDragEnd = useCallback(
    (_event: DragEndEvent) => {
      if (disabled) {
        resetSwipe();
        return;
      }
      finalizeSwipeAction(swipeRef.current);
    },
    [disabled, finalizeSwipeAction, resetSwipe]
  );

  // Native touch gesture handlers (works seamlessly on mobile touchscreens even over child inputs/buttons)
  const handleNativeTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (
        e.target instanceof Element &&
        e.target.closest('[data-testid^="drag-handle-"]')
      ) {
        return;
      }
      const touch = e.touches[0];
      if (!touch) return;
      const next = startSwipeGesture(touch.clientX, touch.clientY);
      swipeRef.current = next;
      setSwipeState(next);
    },
    [disabled]
  );

  const handleNativeTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (disabled || !swipeRef.current.active) return;
      const touch = e.touches[0];
      if (!touch) return;
      const next = updateSwipeGesture(
        swipeRef.current,
        touch.clientX,
        touch.clientY
      );
      swipeRef.current = next;
      setSwipeState(next);
    },
    [disabled]
  );

  const handleNativeTouchEnd = useCallback(() => {
    if (disabled || !swipeRef.current.active) return;
    finalizeSwipeAction(swipeRef.current);
  }, [disabled, finalizeSwipeAction]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDndDragStart}
      onDragMove={handleDndDragMove}
      onDragEnd={handleDndDragEnd}
      onDragCancel={resetSwipe}
    >
      <SortableContext
        items={[swipeId]}
        strategy={horizontalListSortingStrategy}
      >
        <div
          data-testid={containerTestId}
          data-swipe-intent={swipeState.intent}
          data-swipe-offset={swipeState.offsetX}
          data-swipe-armed={swipeState.isPastThreshold ? 'true' : 'false'}
          data-swipe-progress={swipeState.progress}
          {...extraDataAttributes}
          className={`relative overflow-hidden ${className}`}
        >
          <SortableSwipeSurface
            swipeId={swipeId}
            taskId={taskId}
            completed={completed}
            disabled={disabled}
            testIdPrefix={testIdPrefix}
            contentClassName={contentClassName}
            swipeState={swipeState}
            onNativeTouchStart={handleNativeTouchStart}
            onNativeTouchMove={handleNativeTouchMove}
            onNativeTouchEnd={handleNativeTouchEnd}
            onNativeTouchCancel={resetSwipe}
          >
            {children}
          </SortableSwipeSurface>
        </div>
      </SortableContext>
    </DndContext>
  );
};
