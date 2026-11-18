export type ColorScheme = 'light' | 'dark';
export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type AppearanceMode = 'light' | 'dark' | 'system' | 'custom';
export type BackgroundPositionOption = 'center' | 'top' | 'bottom';

export const COLOR_SCHEME_STORAGE_KEY = 'interactive_todo_color_scheme_v1';
export const PERSONAL_CUSTOMIZATION_STORAGE_KEY =
  'interactive_todo_personal_customization_v1';

export const SUPPORTED_BG_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export const SUPPORTED_BG_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
] as const;

export interface CustomButtonColors {
  primaryBg: string;
  secondaryBg: string;
  hoverBg: string;
  textColor: string;
  autoContrastText: boolean;
}

export interface CustomBackgroundSettings {
  imageDataUrl: string | null;
  imageName: string | null;
  position: BackgroundPositionOption;
  brightness: number; // 50..150 (%)
  overlayOpacity: number; // 0..90 (%)
  blurPx: number; // 0..24 (px)
}

export interface PersonalThemeCustomization {
  appearanceMode: AppearanceMode;
  baseSchemeForCustom: ColorScheme;
  customButtonsEnabled: boolean;
  buttonColors: CustomButtonColors;
  background: CustomBackgroundSettings;
  updatedAt: string;
}

export const DEFAULT_CUSTOM_BUTTON_COLORS: CustomButtonColors = {
  primaryBg: '#C87D55',
  secondaryBg: '#F2EFE9',
  hoverBg: '#B0653E',
  textColor: '#FFFFFF',
  autoContrastText: true,
};

export const DEFAULT_CUSTOM_BACKGROUND_SETTINGS: CustomBackgroundSettings = {
  imageDataUrl: null,
  imageName: null,
  position: 'center',
  brightness: 100,
  overlayOpacity: 40,
  blurPx: 0,
};

export const DEFAULT_PERSONAL_CUSTOMIZATION: PersonalThemeCustomization = {
  appearanceMode: 'light',
  baseSchemeForCustom: 'light',
  customButtonsEnabled: false,
  buttonColors: { ...DEFAULT_CUSTOM_BUTTON_COLORS },
  background: { ...DEFAULT_CUSTOM_BACKGROUND_SETTINGS },
  updatedAt: '2026-06-11T09:00:00.000Z',
};

export interface ButtonColorPreset {
  id: string;
  name: string;
  primaryBg: string;
  secondaryBg: string;
  hoverBg: string;
  textColor: string;
}

export const CURATED_BUTTON_COLOR_PRESETS: readonly ButtonColorPreset[] = [
  {
    id: 'terracotta',
    name: 'Terracotta Clay',
    primaryBg: '#C87D55',
    secondaryBg: '#F5ECE4',
    hoverBg: '#B0653E',
    textColor: '#FFFFFF',
  },
  {
    id: 'sage',
    name: 'Forest Sage',
    primaryBg: '#3B7A57',
    secondaryBg: '#E6F2EB',
    hoverBg: '#2D6144',
    textColor: '#FFFFFF',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    primaryBg: '#4A55A2',
    secondaryBg: '#EAEcf8',
    hoverBg: '#394282',
    textColor: '#FFFFFF',
  },
  {
    id: 'amber',
    name: 'Sunlit Amber',
    primaryBg: '#E09F3E',
    secondaryBg: '#FDF3E1',
    hoverBg: '#C98929',
    textColor: '#1F1A17',
  },
  {
    id: 'rose',
    name: 'Berry Rose',
    primaryBg: '#B5486D',
    secondaryBg: '#F9E8EE',
    hoverBg: '#963858',
    textColor: '#FFFFFF',
  },
] as const;

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
      return (globalThis as unknown as { localStorage: StorageLike })
        .localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return null;
}

export function getStoredColorScheme(
  storage: StorageLike | null = getDefaultStorage()
): ColorSchemePreference | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') {
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
        : typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function'
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

/**
 * Resolves the effective ColorScheme ('light' | 'dark').
 * Light mode ('light') is always the default unless the user has explicitly
 * chosen 'dark' or 'system' (which follows their system OS preference).
 */
export function resolveColorScheme(
  preference: ColorSchemePreference | null | undefined,
  matchMediaFn?: ((query: string) => { matches: boolean }) | null
): ColorScheme {
  if (preference === 'dark') {
    return 'dark';
  }
  if (preference === 'system') {
    return detectSystemColorScheme(matchMediaFn);
  }
  return 'light';
}

export function getInitialColorScheme(options?: {
  storage?: StorageLike | null;
  matchMediaFn?: ((query: string) => { matches: boolean }) | null;
}): ColorScheme {
  const stored = getStoredColorScheme(options?.storage);
  return resolveColorScheme(stored, options?.matchMediaFn);
}

export function setStoredColorScheme(
  scheme: ColorSchemePreference,
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

export function cycleColorSchemePreference(
  current: ColorSchemePreference
): ColorSchemePreference {
  if (current === 'light') return 'dark';
  if (current === 'dark') return 'system';
  return 'light';
}

export function applyColorSchemeToDocument(
  scheme: ColorScheme,
  doc: Document | null = typeof document !== 'undefined' ? document : null,
  preference?: ColorSchemePreference
): void {
  if (!doc) return;
  const isDark = scheme === 'dark';
  const root = doc.documentElement;
  if (root) {
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.setAttribute('data-color-scheme', scheme);
    if (preference) {
      root.setAttribute('data-color-scheme-preference', preference);
    }
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

// ============================================================================
// PERSONAL CUSTOMIZATION & THEME SETTINGS UTILITIES
// ============================================================================

export function isValidHexColor(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val.trim());
}

export function normalizeHexColor(val: unknown, fallback = '#C87D55'): string {
  if (!isValidHexColor(val)) return fallback;
  const clean = val.trim().toUpperCase();
  if (clean.length === 4) {
    const r = clean[1];
    const g = clean[2];
    const b = clean[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return clean;
}

export function parseHexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hex, '#000000');
  const num = parseInt(normalized.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function calculateRelativeLuminance(hexColor: string): number {
  const { r, g, b } = parseHexToRgb(hexColor);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = calculateRelativeLuminance(hex1);
  const lum2 = calculateRelativeLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export function resolveReadableButtonTextColor(
  bgHex: string,
  preferredTextHex = '#FFFFFF',
  autoContrast = true
): {
  textColor: string;
  contrastRatio: number;
  wasAutoAdjusted: boolean;
} {
  const cleanBg = normalizeHexColor(bgHex, '#C87D55');
  const cleanPreferred = normalizeHexColor(preferredTextHex, '#FFFFFF');
  const currentContrast = calculateContrastRatio(cleanBg, cleanPreferred);

  if (!autoContrast || currentContrast >= 3.2) {
    return {
      textColor: cleanPreferred,
      contrastRatio: currentContrast,
      wasAutoAdjusted: false,
    };
  }

  const whiteContrast = calculateContrastRatio(cleanBg, '#FFFFFF');
  const darkContrast = calculateContrastRatio(cleanBg, '#1F1A17');
  const bestText = whiteContrast >= darkContrast ? '#FFFFFF' : '#1F1A17';
  const bestContrast = Math.max(whiteContrast, darkContrast);

  return {
    textColor: bestText,
    contrastRatio: bestContrast,
    wasAutoAdjusted: bestText !== cleanPreferred,
  };
}

export function isSupportedBackgroundImageFile(file: {
  type?: string;
  name?: string;
}): boolean {
  if (!file || typeof file !== 'object') return false;
  const mime = (file.type || '').trim().toLowerCase();
  if (
    (SUPPORTED_BG_IMAGE_MIME_TYPES as readonly string[]).includes(mime)
  ) {
    return true;
  }
  const fileName = (file.name || '').trim().toLowerCase();
  return SUPPORTED_BG_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) return fallback;
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function sanitizePersonalCustomization(
  raw: unknown,
  existingToPreserveImage?: PersonalThemeCustomization
): PersonalThemeCustomization {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_PERSONAL_CUSTOMIZATION,
      buttonColors: { ...DEFAULT_CUSTOM_BUTTON_COLORS },
      background: {
        ...DEFAULT_CUSTOM_BACKGROUND_SETTINGS,
        ...(existingToPreserveImage?.background.imageDataUrl
          ? {
              imageDataUrl: existingToPreserveImage.background.imageDataUrl,
              imageName: existingToPreserveImage.background.imageName,
            }
          : {}),
      },
    };
  }

  const obj = raw as Record<string, any>;
  const appearanceMode: AppearanceMode =
    obj.appearanceMode === 'light' ||
    obj.appearanceMode === 'dark' ||
    obj.appearanceMode === 'system' ||
    obj.appearanceMode === 'custom'
      ? obj.appearanceMode
      : DEFAULT_PERSONAL_CUSTOMIZATION.appearanceMode;

  const baseSchemeForCustom: ColorScheme =
    obj.baseSchemeForCustom === 'dark' ? 'dark' : 'light';

  const customButtonsEnabled =
    typeof obj.customButtonsEnabled === 'boolean'
      ? obj.customButtonsEnabled
      : appearanceMode === 'custom';

  const rawBtn =
    obj.buttonColors && typeof obj.buttonColors === 'object'
      ? obj.buttonColors
      : {};
  const buttonColors: CustomButtonColors = {
    primaryBg: normalizeHexColor(
      rawBtn.primaryBg,
      DEFAULT_CUSTOM_BUTTON_COLORS.primaryBg
    ),
    secondaryBg: normalizeHexColor(
      rawBtn.secondaryBg,
      DEFAULT_CUSTOM_BUTTON_COLORS.secondaryBg
    ),
    hoverBg: normalizeHexColor(
      rawBtn.hoverBg,
      DEFAULT_CUSTOM_BUTTON_COLORS.hoverBg
    ),
    textColor: normalizeHexColor(
      rawBtn.textColor,
      DEFAULT_CUSTOM_BUTTON_COLORS.textColor
    ),
    autoContrastText:
      typeof rawBtn.autoContrastText === 'boolean'
        ? rawBtn.autoContrastText
        : DEFAULT_CUSTOM_BUTTON_COLORS.autoContrastText,
  };

  const rawBg =
    obj.background && typeof obj.background === 'object' ? obj.background : {};
  const position: BackgroundPositionOption =
    rawBg.position === 'top' ||
    rawBg.position === 'bottom' ||
    rawBg.position === 'center'
      ? rawBg.position
      : 'center';

  let imageDataUrl: string | null = null;
  let imageName: string | null = null;

  if (rawBg.imageDataUrl === null) {
    // Explicitly cleared unless existingToPreserveImage was passed without explicit null intent
    imageDataUrl = null;
    imageName = null;
  } else if (
    typeof rawBg.imageDataUrl === 'string' &&
    rawBg.imageDataUrl.trim().length > 0 &&
    (rawBg.imageDataUrl.startsWith('data:image/') ||
      rawBg.imageDataUrl.startsWith('http://') ||
      rawBg.imageDataUrl.startsWith('https://') ||
      rawBg.imageDataUrl.startsWith('/'))
  ) {
    imageDataUrl = rawBg.imageDataUrl.trim();
    imageName =
      typeof rawBg.imageName === 'string' && rawBg.imageName.trim()
        ? rawBg.imageName.trim().slice(0, 80)
        : 'Custom Background';
  } else if (existingToPreserveImage?.background.imageDataUrl) {
    imageDataUrl = existingToPreserveImage.background.imageDataUrl;
    imageName = existingToPreserveImage.background.imageName;
  }

  const background: CustomBackgroundSettings = {
    imageDataUrl,
    imageName,
    position,
    brightness: clampNumber(rawBg.brightness, 50, 150, 100),
    overlayOpacity: clampNumber(rawBg.overlayOpacity, 0, 90, 40),
    blurPx: clampNumber(rawBg.blurPx, 0, 24, 0),
  };

  return {
    appearanceMode,
    baseSchemeForCustom,
    customButtonsEnabled,
    buttonColors,
    background,
    updatedAt:
      typeof obj.updatedAt === 'string' && obj.updatedAt.trim()
        ? obj.updatedAt
        : new Date().toISOString(),
  };
}

export function loadPersonalCustomization(
  storage: StorageLike | null = getDefaultStorage()
): PersonalThemeCustomization {
  if (!storage) {
    return sanitizePersonalCustomization(null);
  }
  try {
    const raw = storage.getItem(PERSONAL_CUSTOMIZATION_STORAGE_KEY);
    if (!raw) {
      const legacyScheme = getStoredColorScheme(storage);
      return sanitizePersonalCustomization({
        ...DEFAULT_PERSONAL_CUSTOMIZATION,
        appearanceMode: legacyScheme ?? 'light',
      });
    }
    const parsed = JSON.parse(raw);
    return sanitizePersonalCustomization(parsed);
  } catch {
    return sanitizePersonalCustomization(null);
  }
}

export function savePersonalCustomization(
  settings: PersonalThemeCustomization,
  storage: StorageLike | null = getDefaultStorage()
): PersonalThemeCustomization {
  const existing = storage ? loadPersonalCustomization(storage) : undefined;
  const sanitized = sanitizePersonalCustomization(settings, existing);
  if (storage) {
    try {
      storage.setItem(
        PERSONAL_CUSTOMIZATION_STORAGE_KEY,
        JSON.stringify(sanitized)
      );
      // Sync base color scheme key so initial load scripts stay consistent
      const syncedPreference: ColorSchemePreference =
        sanitized.appearanceMode === 'custom'
          ? sanitized.baseSchemeForCustom
          : sanitized.appearanceMode;
      storage.setItem(COLOR_SCHEME_STORAGE_KEY, syncedPreference);
    } catch {
      // ignore storage quota errors
    }
  }
  return sanitized;
}

export function resetPersonalCustomizationToDefault(
  storage: StorageLike | null = getDefaultStorage()
): PersonalThemeCustomization {
  const fresh: PersonalThemeCustomization = {
    ...DEFAULT_PERSONAL_CUSTOMIZATION,
    buttonColors: { ...DEFAULT_CUSTOM_BUTTON_COLORS },
    background: { ...DEFAULT_CUSTOM_BACKGROUND_SETTINGS },
    updatedAt: new Date().toISOString(),
  };
  if (storage) {
    try {
      storage.setItem(
        PERSONAL_CUSTOMIZATION_STORAGE_KEY,
        JSON.stringify(fresh)
      );
      storage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light');
    } catch {
      // ignore storage errors
    }
  }
  return fresh;
}

export function resolveEffectiveColorSchemeFromCustomization(
  settings: PersonalThemeCustomization,
  matchMediaFn?: ((query: string) => { matches: boolean }) | null
): ColorScheme {
  if (settings.appearanceMode === 'custom') {
    return settings.baseSchemeForCustom;
  }
  return resolveColorScheme(settings.appearanceMode, matchMediaFn);
}

export function applyPersonalCustomizationToDocument(
  settings: PersonalThemeCustomization,
  doc: Document | null = typeof document !== 'undefined' ? document : null,
  matchMediaFn?: ((query: string) => { matches: boolean }) | null
): {
  effectiveColorScheme: ColorScheme;
  primaryTextColor: string;
  secondaryTextColor: string;
} {
  const sanitized = sanitizePersonalCustomization(settings);
  const effectiveColorScheme = resolveEffectiveColorSchemeFromCustomization(
    sanitized,
    matchMediaFn
  );
  const primaryContrast = resolveReadableButtonTextColor(
    sanitized.buttonColors.primaryBg,
    sanitized.buttonColors.textColor,
    sanitized.buttonColors.autoContrastText
  );
  const secondaryContrast = resolveReadableButtonTextColor(
    sanitized.buttonColors.secondaryBg,
    '#2F2B28',
    true
  );

  if (doc) {
    const schemePref: ColorSchemePreference =
      sanitized.appearanceMode === 'custom'
        ? sanitized.baseSchemeForCustom
        : sanitized.appearanceMode;
    applyColorSchemeToDocument(effectiveColorScheme, doc, schemePref);

    const root = doc.documentElement;
    if (root) {
      const hasCustomBg = Boolean(sanitized.background.imageDataUrl);
      const customButtonsActive =
        sanitized.customButtonsEnabled || sanitized.appearanceMode === 'custom';

      root.setAttribute(
        'data-appearance-mode',
        sanitized.appearanceMode
      );
      root.setAttribute(
        'data-custom-buttons-active',
        customButtonsActive ? 'true' : 'false'
      );
      root.setAttribute(
        'data-has-custom-bg',
        hasCustomBg ? 'true' : 'false'
      );

      root.style.setProperty(
        '--custom-btn-primary-bg',
        sanitized.buttonColors.primaryBg
      );
      root.style.setProperty(
        '--custom-btn-secondary-bg',
        sanitized.buttonColors.secondaryBg
      );
      root.style.setProperty(
        '--custom-btn-hover-bg',
        sanitized.buttonColors.hoverBg
      );
      root.style.setProperty(
        '--custom-btn-text',
        primaryContrast.textColor
      );
      root.style.setProperty(
        '--custom-btn-secondary-text',
        secondaryContrast.textColor
      );
      root.style.setProperty(
        '--custom-bg-position',
        sanitized.background.position
      );
      root.style.setProperty(
        '--custom-bg-brightness',
        `${sanitized.background.brightness}%`
      );
      root.style.setProperty(
        '--custom-bg-overlay-opacity',
        `${sanitized.background.overlayOpacity / 100}`
      );
      root.style.setProperty(
        '--custom-bg-blur',
        `${sanitized.background.blurPx}px`
      );
    }
  }

  return {
    effectiveColorScheme,
    primaryTextColor: primaryContrast.textColor,
    secondaryTextColor: secondaryContrast.textColor,
  };
}

