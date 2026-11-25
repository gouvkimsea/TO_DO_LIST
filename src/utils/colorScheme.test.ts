import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLOR_SCHEME_STORAGE_KEY,
  DEFAULT_PERSONAL_CUSTOMIZATION,
  cycleColorSchemePreference,
  getStoredColorScheme,
  detectSystemColorScheme,
  getInitialColorScheme,
  resolveColorScheme,
  setStoredColorScheme,
  toggleColorScheme,
  isValidHexColor,
  normalizeHexColor,
  calculateContrastRatio,
  resolveReadableButtonTextColor,
  isSupportedBackgroundImageFile,
  sanitizePersonalCustomization,
  loadPersonalCustomization,
  savePersonalCustomization,
  resetPersonalCustomizationToDefault,
  resolveEffectiveColorSchemeFromCustomization,
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

test('toggleColorScheme switches between light and dark, and cycleColorSchemePreference cycles light -> dark -> system -> light', () => {
  assert.equal(toggleColorScheme('light'), 'dark');
  assert.equal(toggleColorScheme('dark'), 'light');

  assert.equal(cycleColorSchemePreference('light'), 'dark');
  assert.equal(cycleColorSchemePreference('dark'), 'system');
  assert.equal(cycleColorSchemePreference('system'), 'light');
});

test('getStoredColorScheme and setStoredColorScheme persist valid preferences including system mode', () => {
  const storage = createMemoryStorage();
  assert.equal(getStoredColorScheme(storage), null);

  setStoredColorScheme('dark', storage);
  assert.equal(getStoredColorScheme(storage), 'dark');

  setStoredColorScheme('system', storage);
  assert.equal(getStoredColorScheme(storage), 'system');

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

test('getInitialColorScheme uses light mode by default unless user explicitly stored dark or system mode', () => {
  const systemDarkMatcher = () => ({ matches: true });
  const systemLightMatcher = () => ({ matches: false });

  // Default (no stored preference) must ALWAYS be 'light' even if OS is in dark mode
  const emptyStorage = createMemoryStorage();
  assert.equal(
    getInitialColorScheme({
      storage: emptyStorage,
      matchMediaFn: systemDarkMatcher,
    }),
    'light'
  );

  // Explicit 'dark' preference uses 'dark'
  const storageWithDark = createMemoryStorage({
    [COLOR_SCHEME_STORAGE_KEY]: 'dark',
  });
  assert.equal(
    getInitialColorScheme({
      storage: storageWithDark,
      matchMediaFn: systemLightMatcher,
    }),
    'dark'
  );

  // Explicit 'system' preference follows OS system mode
  const storageWithSystem = createMemoryStorage({
    [COLOR_SCHEME_STORAGE_KEY]: 'system',
  });
  assert.equal(
    getInitialColorScheme({
      storage: storageWithSystem,
      matchMediaFn: systemDarkMatcher,
    }),
    'dark'
  );
  assert.equal(
    getInitialColorScheme({
      storage: storageWithSystem,
      matchMediaFn: systemLightMatcher,
    }),
    'light'
  );
  assert.equal(resolveColorScheme(null, systemDarkMatcher), 'light');
});

test('isValidHexColor and normalizeHexColor validate and format 3-digit and 6-digit hex colors', () => {
  assert.equal(isValidHexColor('#C26D43'), true);
  assert.equal(isValidHexColor('#fff'), true);
  assert.equal(isValidHexColor('not-a-color'), false);

  assert.equal(normalizeHexColor('#abc', '#000000'), '#AABBCC');
  assert.equal(normalizeHexColor('#c26d43', '#000000'), '#C26D43');
  assert.equal(normalizeHexColor('invalid', '#123456'), '#123456');
});

test('calculateContrastRatio and resolveReadableButtonTextColor automatically enforce readable text contrast', () => {
  const highContrast = calculateContrastRatio('#1E293B', '#FFFFFF');
  assert.ok(highContrast > 10);

  // White text on very pale yellow background has poor contrast -> auto-adjusted to dark text
  const adjustedOnLight = resolveReadableButtonTextColor('#FEF9C3', '#FFFFFF', true);
  assert.equal(adjustedOnLight.textColor, '#1F1A17');
  assert.equal(adjustedOnLight.wasAutoAdjusted, true);

  // Dark text on very dark navy background has poor contrast -> auto-adjusted to light text
  const adjustedOnDark = resolveReadableButtonTextColor('#0F172A', '#1E293B', true);
  assert.equal(adjustedOnDark.textColor, '#FFFFFF');
  assert.equal(adjustedOnDark.wasAutoAdjusted, true);

  // When autoContrast is false, user choice is preserved
  const manualChoice = resolveReadableButtonTextColor('#FEF9C3', '#FFFFFF', false);
  assert.equal(manualChoice.textColor, '#FFFFFF');
  assert.equal(manualChoice.wasAutoAdjusted, false);
});

test('isSupportedBackgroundImageFile accepts JPG, JPEG, PNG, and WEBP and rejects unsupported formats', () => {
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'photo.jpg', type: 'image/jpeg' }),
    true
  );
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'photo.jpeg', type: 'image/jpeg' }),
    true
  );
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'wallpaper.png', type: 'image/png' }),
    true
  );
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'scene.webp', type: 'image/webp' }),
    true
  );
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'script.svg', type: 'image/svg+xml' }),
    false
  );
  assert.equal(
    isSupportedBackgroundImageFile({ name: 'doc.pdf', type: 'application/pdf' }),
    false
  );
});

test('savePersonalCustomization, loadPersonalCustomization, and sanitizePersonalCustomization persist settings and preserve uploaded image when switching modes', () => {
  const storage = createMemoryStorage();
  const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const savedCustom = savePersonalCustomization(
    {
      appearanceMode: 'custom',
      baseSchemeForCustom: 'dark',
      background: {
        imageDataUrl: sampleDataUrl,
        imageName: 'studio-bg.png',
        position: 'top',
        brightness: 112,
        overlayOpacity: 55,
        blurPx: 6,
      },
      buttonColors: {
        primaryBg: '#2E6F5E',
        secondaryBg: '#EBF5F2',
        hoverBg: '#235749',
        textColor: '#FFFFFF',
        autoContrastText: true,
      },
      customButtonsEnabled: true,
      updatedAt: '2026-06-11T10:00:00.000Z',
    },
    storage
  );

  assert.equal(savedCustom.appearanceMode, 'custom');
  assert.equal(savedCustom.background.imageDataUrl, sampleDataUrl);
  assert.equal(savedCustom.background.position, 'top');
  assert.equal(savedCustom.background.brightness, 112);
  assert.equal(savedCustom.background.blurPx, 6);
  assert.equal(savedCustom.buttonColors.primaryBg, '#2E6F5E');

  const loaded = loadPersonalCustomization(storage);
  assert.equal(loaded.background.imageDataUrl, sampleDataUrl);
  assert.equal(loaded.buttonColors.primaryBg, '#2E6F5E');

  // Switching mode to 'light' without passing background.imageDataUrl must preserve existing uploaded image
  const preservedWhenSwitchingMode = sanitizePersonalCustomization(
    {
      appearanceMode: 'light',
      buttonColors: loaded.buttonColors,
    },
    loaded
  );
  assert.equal(preservedWhenSwitchingMode.appearanceMode, 'light');
  assert.equal(preservedWhenSwitchingMode.background.imageDataUrl, sampleDataUrl);

  assert.equal(
    resolveEffectiveColorSchemeFromCustomization(savedCustom),
    'dark'
  );

  const reset = resetPersonalCustomizationToDefault(storage);
  assert.equal(reset.appearanceMode, DEFAULT_PERSONAL_CUSTOMIZATION.appearanceMode);
  assert.equal(reset.background.imageDataUrl, null);
  assert.equal(reset.customButtonsEnabled, false);
});

