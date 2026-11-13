export type ColorScheme = 'light' | 'dark';

export const COLOR_SCHEME_STORAGE_KEY = 'interactive_todo_color_scheme_v1';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (
      typeof globalThis !== 'undefined' &&
      'localStorage' in globalThis &&
      (globalThis as unknown as { localStorage?: StorageLike }).localStorage
    ) {
      return (globalThis as unknown as { localStorage: StorageLike }).localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return null;
}

export function getStoredColorScheme(
  storage: StorageLike | null = getDefaultStorage()
): ColorScheme | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') {
      return raw;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

export function detectSystemColorScheme(
  matchMediaFn?: ((query: string) => { matches: boolean }) | null
): ColorScheme {
  try {
    const matcher =
      matchMediaFn !== undefined
        ? matchMediaFn
        : typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia.bind(window)
        : null;
    if (matcher && matcher('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Ignore matchMedia errors
  }
  return 'light';
}

export function getInitialColorScheme(options?: {
  storage?: StorageLike | null;
  matchMediaFn?: ((query: string) => { matches: boolean }) | null;
}): ColorScheme {
  const stored = getStoredColorScheme(options?.storage);
  if (stored) {
    return stored;
  }
  return detectSystemColorScheme(options?.matchMediaFn);
}

export function setStoredColorScheme(
  scheme: ColorScheme,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch {
    // Ignore storage write errors
  }
}

export function toggleColorScheme(current: ColorScheme): ColorScheme {
  return current === 'dark' ? 'light' : 'dark';
}

export function applyColorSchemeToDocument(
  scheme: ColorScheme,
  doc: Document | null = typeof document !== 'undefined' ? document : null
): void {
  if (!doc) return;
  const isDark = scheme === 'dark';
  const root = doc.documentElement;
  if (root) {
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.setAttribute('data-color-scheme', scheme);
    root.style.colorScheme = scheme;
  }
  if (doc.body) {
    doc.body.classList.toggle('dark', isDark);
    doc.body.classList.toggle('light', !isDark);
  }
  const metaThemeColor = doc.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#141210' : '#FAF6F0');
  }
}
