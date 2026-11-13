/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';

export interface UndoRedoOptions {
  maxHistory?: number;
}

export interface UseUndoRedoReturn<T> {
  state: T;
  setState: (next: T | ((prev: T) => T), recordHistory?: boolean) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  historyLength: number;
  futureLength: number;
}

/**
 * A generic undo/redo state stack hook for tracking immutable state changes.
 * Used for task operations (add, delete/clear, reorder, and modifications).
 */
export function useUndoRedo<T>(
  initialPresent: T,
  options: UndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const maxHistory = options.maxHistory ?? 30;

  const [present, setPresent] = useState<T>(initialPresent);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  // Refs prevent stale closure issues in rapid callbacks or keyboard listeners
  const presentRef = useRef(present);
  presentRef.current = present;
  const pastRef = useRef(past);
  pastRef.current = past;
  const futureRef = useRef(future);
  futureRef.current = future;

  const setState = useCallback(
    (next: T | ((prev: T) => T), recordHistory: boolean = true) => {
      const current = presentRef.current;
      const resolvedNext =
        typeof next === 'function' ? (next as (prev: T) => T)(current) : next;

      if (recordHistory) {
        setPast((prevPast) => {
          const updated = [...prevPast, current];
          if (updated.length > maxHistory) {
            return updated.slice(updated.length - maxHistory);
          }
          return updated;
        });
        setFuture([]); // New state branch resets future redo stack
      }

      setPresent(resolvedNext);
    },
    [maxHistory]
  );

  const undo = useCallback((): boolean => {
    if (pastRef.current.length === 0) return false;

    const previous = pastRef.current[pastRef.current.length - 1];
    const newPast = pastRef.current.slice(0, pastRef.current.length - 1);
    const current = presentRef.current;

    setPast(newPast);
    setFuture((prevFuture) => [current, ...prevFuture]);
    setPresent(previous);
    return true;
  }, []);

  const redo = useCallback((): boolean => {
    if (futureRef.current.length === 0) return false;

    const next = futureRef.current[0];
    const newFuture = futureRef.current.slice(1);
    const current = presentRef.current;

    setPast((prevPast) => {
      const updated = [...prevPast, current];
      if (updated.length > maxHistory) {
        return updated.slice(updated.length - maxHistory);
      }
      return updated;
    });
    setFuture(newFuture);
    setPresent(next);
    return true;
  }, [maxHistory]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    state: present,
    setState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clearHistory,
    historyLength: past.length,
    futureLength: future.length,
  };
}
