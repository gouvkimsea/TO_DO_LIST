import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLOR_SCHEME_STORAGE_KEY,
  getStoredColorScheme,
  detectSystemColorScheme,
  getInitialColorScheme,
  setStoredColorScheme,
  toggleColorScheme,
} from './colorScheme.ts';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

test('toggleColorScheme switches between light and dark', () => {
  assert.equal(toggleColorScheme('light'), 'dark');
  assert.equal(toggleColorScheme('dark'), 'light');
});

test('getStoredColorScheme and setStoredColorScheme persist valid preferences', () => {
  const storage = createMemoryStorage();
  assert.equal(getStoredColorScheme(storage), null);

  setStoredColorScheme('dark', storage);
  assert.equal(getStoredColorScheme(storage), 'dark');

  setStoredColorScheme('light', storage);
  assert.equal(getStoredColorScheme(storage), 'light');
});

test('getStoredColorScheme ignores corrupted or unknown storage values', () => {
  const storage = createMemoryStorage({
    [COLOR_SCHEME_STORAGE_KEY]: 'invalid-mode',
  });
  assert.equal(getStoredColorScheme(storage), null);
});

test('detectSystemColorScheme detects dark or light from matchMedia', () => {
  const darkMatcher = (query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
  });
  const lightMatcher = () => ({ matches: false });

  assert.equal(detectSystemColorScheme(darkMatcher), 'dark');
  assert.equal(detectSystemColorScheme(lightMatcher), 'light');
  assert.equal(detectSystemColorScheme(null), 'light');
});

test('getInitialColorScheme prioritizes saved localStorage preference over system preference', () => {
  const storageWithLight = createMemoryStorage({
    [COLOR_SCHEME_STORAGE_KEY]: 'light',
  });
  const systemDarkMatcher = () => ({ matches: true });

  assert.equal(
    getInitialColorScheme({
      storage: storageWithLight,
      matchMediaFn: systemDarkMatcher,
    }),
    'light'
  );

  const emptyStorage = createMemoryStorage();
  assert.equal(
    getInitialColorScheme({
      storage: emptyStorage,
      matchMediaFn: systemDarkMatcher,
    }),
    'dark'
  );
});
