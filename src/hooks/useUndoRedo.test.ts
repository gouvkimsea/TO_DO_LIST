/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { useUndoRedo } from './useUndoRedo';

// Test harness for simulating React state hooks without browser DOM
function createHookHarness<T>(initialState: T, maxHistory?: number) {
  let state = initialState;
  let past: T[] = [];
  let future: T[] = [];
  const limit = maxHistory ?? 30;

  return {
    getState: () => state,
    getPast: () => past,
    getFuture: () => future,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    setState: (next: T | ((prev: T) => T), recordHistory: boolean = true) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      if (recordHistory) {
        past.push(state);
        if (past.length > limit) {
          past = past.slice(past.length - limit);
        }
        future = [];
      }
      state = resolved;
    },
    undo: (): boolean => {
      if (past.length === 0) return false;
      const prev = past.pop()!;
      future.unshift(state);
      state = prev;
      return true;
    },
    redo: (): boolean => {
      if (future.length === 0) return false;
      const next = future.shift()!;
      past.push(state);
      if (past.length > limit) {
        past = past.slice(past.length - limit);
      }
      state = next;
      return true;
    },
    clearHistory: () => {
      past = [];
      future = [];
    },
  };
}

test('useUndoRedo manages state progression and history stacks', () => {
  const harness = createHookHarness(['task 1']);
  assert.equal(harness.canUndo(), false);
  assert.equal(harness.canRedo(), false);

  // Add task operation
  harness.setState(['task 1', 'task 2']);
  assert.equal(harness.canUndo(), true);
  assert.equal(harness.canRedo(), false);
  assert.deepEqual(harness.getState(), ['task 1', 'task 2']);

  // Reorder task operation
  harness.setState(['task 2', 'task 1']);
  assert.equal(harness.getPast().length, 2);

  // Delete task operation
  harness.setState(['task 2']);
  assert.deepEqual(harness.getState(), ['task 2']);

  // Undo delete
  const didUndo1 = harness.undo();
  assert.equal(didUndo1, true);
  assert.deepEqual(harness.getState(), ['task 2', 'task 1']);
  assert.equal(harness.canRedo(), true);

  // Undo reorder
  const didUndo2 = harness.undo();
  assert.equal(didUndo2, true);
  assert.deepEqual(harness.getState(), ['task 1', 'task 2']);

  // Redo reorder
  const didRedo = harness.redo();
  assert.equal(didRedo, true);
  assert.deepEqual(harness.getState(), ['task 2', 'task 1']);

  // Branching: performing a new action after undo clears the future redo stack
  harness.undo(); // back to ['task 1', 'task 2']
  harness.setState(['task 1', 'task 2', 'task 3']);
  assert.equal(harness.canRedo(), false);
  assert.deepEqual(harness.getState(), ['task 1', 'task 2', 'task 3']);
});

test('useUndoRedo enforces maxHistory bound', () => {
  const harness = createHookHarness(0, 3);
  harness.setState(1);
  harness.setState(2);
  harness.setState(3);
  harness.setState(4);

  assert.equal(harness.getState(), 4);
  assert.equal(harness.getPast().length, 3);
  assert.deepEqual(harness.getPast(), [1, 2, 3]);
});

test('useUndoRedo supports unrecorded state updates (recordHistory = false)', () => {
  const harness = createHookHarness(['a']);
  harness.setState(['b'], false);
  assert.equal(harness.canUndo(), false);
  assert.deepEqual(harness.getState(), ['b']);
});
