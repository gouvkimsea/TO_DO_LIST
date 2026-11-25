import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  Eye,
  Sliders,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  AppearanceMode,
  BackgroundPositionOption,
  CURATED_BUTTON_COLOR_PRESETS,
  DEFAULT_CUSTOM_BACKGROUND_SETTINGS,
  DEFAULT_CUSTOM_BUTTON_COLORS,
  DEFAULT_PERSONAL_CUSTOMIZATION,
  PersonalThemeCustomization,
  isSupportedBackgroundImageFile,
  isValidHexColor,
  normalizeHexColor,
  resolveEffectiveColorSchemeFromCustomization,
  resolveReadableButtonTextColor,
} from '../utils/colorScheme';
import { THEMES, ThemeId } from '../utils/todoLogic';

interface ThemeCustomizationStudioProps {
  customization: PersonalThemeCustomization;
  activeTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onApplyCustomization: (next: PersonalThemeCustomization) => void;
  onResetCustomization: () => void;
  onCloseModal?: () => void;
  isModal?: boolean;
}

const SAMPLE_WALLPAPERS: Array<{
  id: string;
  name: string;
  dataUrl: string;
}> = [
  {
    id: 'terracotta-dunes',
    name: 'Warm Terracotta Dunes',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#F7DFC6"/>
              <stop offset="55%" stop-color="#E8B48E"/>
              <stop offset="100%" stop-color="#C87D55"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#sky)"/>
          <circle cx="920" cy="210" r="110" fill="#FFF3E2" opacity="0.75"/>
          <path d="M0 520 Q320 410 680 510 T1200 470 L1200 800 L0 800 Z" fill="#D48C66" opacity="0.85"/>
          <path d="M0 610 Q420 510 820 620 T1200 580 L1200 800 L0 800 Z" fill="#A65E3A" opacity="0.9"/>
        </svg>`
      ),
  },
  {
    id: 'alpine-sage',
    name: 'Misty Alpine Forest',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mist" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#DCEBE1"/>
              <stop offset="55%" stop-color="#9CC4AC"/>
              <stop offset="100%" stop-color="#4A7C62"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#mist)"/>
          <path d="M0 490 Q280 370 610 470 T1200 430 L1200 800 L0 800 Z" fill="#5D8F74" opacity="0.8"/>
          <path d="M0 600 Q380 500 790 610 T1200 560 L1200 800 L0 800 Z" fill="#325944" opacity="0.9"/>
        </svg>`
      ),
  },
  {
    id: 'twilight-lavender',
    name: 'Twilight Lavender Horizon',
    dataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="twilight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E5DFF5"/>
              <stop offset="50%" stop-color="#B8A9DF"/>
              <stop offset="100%" stop-color="#6A5A9E"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#twilight)"/>
          <circle cx="280" cy="190" r="85" fill="#FAF7FF" opacity="0.7"/>
          <path d="M0 540 Q360 430 720 530 T1200 490 L1200 800 L0 800 Z" fill="#7C6BB0" opacity="0.85"/>
          <path d="M0 630 Q460 540 880 640 T1200 600 L1200 800 L0 800 Z" fill="#4C3E7A" opacity="0.92"/>
        </svg>`
      ),
  },
];

export const ThemeCustomizationStudio: React.FC<
  ThemeCustomizationStudioProps
> = ({
  customization,
  activeTheme,
  onSelectTheme,
  onApplyCustomization,
  onResetCustomization,
  onCloseModal,
  isModal = false,
}) => {
  // Draft state for live preview before applying
  const [draft, setDraft] = useState<PersonalThemeCustomization>(() => ({
    ...customization,
    buttonColors: { ...customization.buttonColors },
    background: { ...customization.background },
  }));
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewBtnHovered, setPreviewBtnHovered] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft when external customization updates
  useEffect(() => {
    setDraft({
      ...customization,
      buttonColors: { ...customization.buttonColors },
      background: { ...customization.background },
    });
  }, [customization]);

  useEffect(() => {
    if (!statusMessage) return;
    const t = window.setTimeout(() => setStatusMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [statusMessage]);

  // Lock background page scroll while displayed as a modal
  useEffect(() => {
    if (!isModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModal]);

  const effectiveDraftScheme = resolveEffectiveColorSchemeFromCustomization(draft);
  const contrastCheck = resolveReadableButtonTextColor(
    draft.buttonColors.primaryBg,
    draft.buttonColors.textColor,
    draft.buttonColors.autoContrastText
  );
  const secondaryContrastCheck = resolveReadableButtonTextColor(
    draft.buttonColors.secondaryBg,
    '#2F2B28',
    true
  );

  const handleSelectAppearanceMode = (mode: AppearanceMode) => {
    const nextDraft: PersonalThemeCustomization = {
      ...draft,
      appearanceMode: mode,
      customButtonsEnabled:
        mode === 'custom' ? true : draft.customButtonsEnabled,
      updatedAt: new Date().toISOString(),
    };
    setDraft(nextDraft);
    // Immediately apply mode switch while preserving uploaded background & button colors
    onApplyCustomization(nextDraft);
    setStatusMessage(
      `Appearance mode set to ${
        mode === 'system'
          ? 'System Default'
          : mode === 'custom'
          ? 'Custom Theme'
          : mode === 'dark'
          ? 'Dark Mode'
          : 'Light Mode'
      }`
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupportedBackgroundImageFile(file)) {
      setUploadError(
        'Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP image.'
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image exceeds 8 MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        setUploadError('Failed to read image file.');
        return;
      }
      setDraft((prev) => ({
        ...prev,
        appearanceMode: 'custom',
        background: {
          ...prev.background,
          imageDataUrl: result,
          imageName: file.name,
        },
        updatedAt: new Date().toISOString(),
      }));
      setStatusMessage(
        `Loaded "${file.name}" into Live Preview — click "Apply & Save Theme" to keep it`
      );
    };
    reader.onerror = () => {
      setUploadError('Error reading image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleWallpaper = (sample: {
    id: string;
    name: string;
    dataUrl: string;
  }) => {
    setUploadError(null);
    setDraft((prev) => ({
      ...prev,
      appearanceMode: 'custom',
      background: {
        ...prev.background,
        imageDataUrl: sample.dataUrl,
        imageName: sample.name,
      },
      updatedAt: new Date().toISOString(),
    }));
    setStatusMessage(`Previewing "${sample.name}" background`);
  };

  const handleRemoveBackgroundImage = () => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const nextDraft: PersonalThemeCustomization = {
      ...draft,
      background: {
        ...DEFAULT_CUSTOM_BACKGROUND_SETTINGS,
        imageDataUrl: null,
        imageName: null,
      },
      updatedAt: new Date().toISOString(),
    };
    setDraft(nextDraft);
    onApplyCustomization(nextDraft);
    setStatusMessage('Removed custom background image and restored default stage');
  };

  const handleApplyChanges = () => {
    const nextToSave: PersonalThemeCustomization = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    onApplyCustomization(nextToSave);
    setStatusMessage('Personal theme & button customization saved!');
  };

  const handleResetAll = () => {
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const fresh: PersonalThemeCustomization = {
      ...DEFAULT_PERSONAL_CUSTOMIZATION,
      buttonColors: { ...DEFAULT_CUSTOM_BUTTON_COLORS },
      background: { ...DEFAULT_CUSTOM_BACKGROUND_SETTINGS },
      updatedAt: new Date().toISOString(),
    };
    setDraft(fresh);
    onResetCustomization();
    setStatusMessage('Reset all appearance settings to the default Light theme');
  };

  const studioCard = (
    <div
      data-testid="theme-customization-studio"
      className={`bg-white border border-[#E5DEC9] shadow-xs overflow-hidden text-[#2F2B28] ${
        isModal
          ? 'w-full sm:max-w-5xl max-h-[92dvh] sm:max-h-[90dvh] rounded-t-3xl sm:rounded-2xl overflow-y-auto overscroll-y-contain shadow-2xl relative z-10 animate-[slideUpSheet_220ms_cubic-bezier(0.22,1,0.36,1)] pb-safe'
          : 'rounded-2xl'
      }`}
    >
      {/* Top Studio Header */}
      <div className="px-4 sm:px-5 py-3.5 bg-[#FDFBF7] border-b border-[#ECE7DF] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#C87D55] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#2F2B28] tracking-tight">
                Appearance &amp; Personal Theme Studio
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs sm:text-[10px] font-bold bg-[#F3EFE8] text-[#7A7269] border border-[#E5DEC9]">
                Persistent &amp; Offline-Ready
              </span>
            </div>
            <p className="text-xs sm:text-[11px] text-[#7A7269]">
              Customize Light/Dark/System/Custom modes, upload a personal background picture, and tailor button colors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {statusMessage && (
            <div
              role="status"
              data-testid="theme-studio-status-toast"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2F2B28] text-[#FAF6F0] text-xs sm:text-[11px] font-bold shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#84CA9E] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {isModal && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              data-testid="close-theme-customizer-modal-btn"
              aria-label="Close appearance settings"
              className="min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[38px] rounded-xl flex items-center justify-center bg-[#F2EFE9] hover:bg-[#E4DDD3] text-[#2F2B28] cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid: Controls (Left) + Live Preview & Actions (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-[#ECE7DF]">
        {/* Left 7 Columns: Appearance Mode, Background Upload & Sliders, Button Color Pickers */}
        <div className="xl:col-span-7 p-4 sm:p-5 space-y-5 bg-white">
          {/* 1. Appearance Mode Selector (Light / Dark / System Default / Custom Theme) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#5A534C]">
                1. Appearance Mode
              </label>
              <span className="text-[11px] font-semibold text-[#8A8279]">
                Active: <strong className="text-[#2F2B28] uppercase">{draft.appearanceMode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  {
                    id: 'light',
                    label: 'Light Mode',
                    sub: 'Warm Ivory (Default)',
                    Icon: Sun,
                  },
                  {
                    id: 'dark',
                    label: 'Dark Mode',
                    sub: 'Warm Espresso',
                    Icon: Moon,
                  },
                  {
                    id: 'system',
                    label: 'System Default',
                    sub: 'Follows OS Theme',
                    Icon: Monitor,
                  },
                  {
                    id: 'custom',
                    label: 'Custom Theme',
                    sub: 'Personal BG & Colors',
                    Icon: Sparkles,
                  },
                ] as const
              ).map((item) => {
                const active = draft.appearanceMode === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectAppearanceMode(item.id)}
                    data-testid={`appearance-mode-${item.id}`}
                    aria-pressed={active}
                    className={`min-h-[64px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#2F2B28] border-[#E5DEC9] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className="w-4 h-4 shrink-0" />
                      {active && <Check className="w-3.5 h-3.5 text-[#84CA9E]" />}
                    </div>
                    <div className="mt-1.5">
                      <p className="text-xs font-extrabold leading-tight">
                        {item.label}
                      </p>
                      <p
                        className={`text-[11px] sm:text-[10px] leading-tight mt-0.5 ${
                          active ? 'text-[#D8CFC4]' : 'text-[#8A8279]'
                        }`}
                      >
                        {item.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Base surface toggle when in Custom Theme + 4 Accent Palettes */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 bg-[#FAF8F5] px-3 py-2.5 rounded-xl border border-[#ECE7DF]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-[11px] font-bold text-[#5A534C]">
                  Card Surface Tone:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      baseSchemeForCustom: 'light',
                    }))
                  }
                  data-testid="custom-base-surface-light"
                  className={`min-h-[40px] sm:min-h-0 px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-xs sm:text-[10px] font-extrabold border cursor-pointer ${
                    draft.baseSchemeForCustom === 'light'
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                      : 'bg-white text-[#4B453F] border-[#DFD8CE]'
                  }`}
                >
                  Light Cards
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      baseSchemeForCustom: 'dark',
                    }))
                  }
                  data-testid="custom-base-surface-dark"
                  className={`min-h-[40px] sm:min-h-0 px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-xs sm:text-[10px] font-extrabold border cursor-pointer ${
                    draft.baseSchemeForCustom === 'dark'
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                      : 'bg-white text-[#4B453F] border-[#DFD8CE]'
                  }`}
                >
                  Dark Cards
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs sm:text-[11px] font-bold text-[#5A534C]">
                  Day Header Palette:
                </span>
                {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                  const t = THEMES[tId];
                  const isSelected = activeTheme === tId;
                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => onSelectTheme(tId)}
                      title={t.name}
                      className={`min-h-[40px] sm:min-h-0 px-3 sm:px-2 py-1.5 sm:py-0.5 rounded-full text-xs sm:text-[10px] font-extrabold border cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-[#2F2B28] bg-white text-[#2F2B28]'
                          : 'bg-white/80 text-[#6E665E]'
                      }`}
                      style={{ borderColor: t.checkboxBg }}
                    >
                      {t.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Custom Background Image Upload & Adjustments */}
          <div className="space-y-3 pt-4 border-t border-[#ECE7DF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#B86B43]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A534C]">
                  2. Custom Background Image
                </span>
              </div>
              <span className="text-xs sm:text-[10px] font-semibold text-[#8A8279]">
                Supports JPG, JPEG, PNG, WEBP
              </span>
            </div>

            {uploadError && (
              <div
                role="alert"
                data-testid="custom-bg-upload-error"
                className="p-2.5 rounded-xl bg-[#FCE8E6] border border-[#F3C7C3] text-xs font-bold text-[#A83830] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload Trigger + Sample Wallpapers + Remove Button */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                data-testid="custom-bg-file-input"
                className="hidden"
                id="custom-bg-upload-input"
              />
              <label
                htmlFor="custom-bg-upload-input"
                data-testid="custom-bg-upload-label"
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-4 sm:px-3.5 py-2 rounded-xl bg-[#2F2B28] hover:bg-[#3D3733] text-white text-xs font-extrabold cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Picture (JPG/PNG/WEBP)</span>
              </label>

              {draft.background.imageDataUrl && (
                <button
                  type="button"
                  onClick={handleRemoveBackgroundImage}
                  data-testid="custom-bg-remove-btn"
                  className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[40px] px-3.5 sm:px-3 py-2 rounded-xl border border-[#F3C7C3] bg-[#FCE8E6] hover:bg-[#F8D2CE] text-[#A83830] text-xs font-extrabold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Background</span>
                </button>
              )}
            </div>

            {/* Instant Sample Backgrounds for Quick Testing */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-1.5">
              <span className="text-xs sm:text-[10px] font-bold text-[#7A7269] mr-1">
                Or try a sample preset:
              </span>
              {SAMPLE_WALLPAPERS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSampleWallpaper(sample)}
                  data-testid={`sample-wallpaper-${sample.id}`}
                  className={`min-h-[40px] sm:min-h-0 px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-xs sm:text-[10px] font-bold border transition-colors cursor-pointer ${
                    draft.background.imageName === sample.name
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                      : 'bg-[#FAF7F2] text-[#4B453F] border-[#E4DDD3] hover:bg-[#EFECE6]'
                  }`}
                >
                  {sample.name}
                </button>
              ))}
            </div>

            {/* Background Position + Brightness + Overlay Opacity + Blur Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF]">
              {/* Positioning (Center, Top, Bottom) */}
              <div>
                <span className="block text-xs sm:text-[11px] font-extrabold text-[#4B453F] mb-1.5">
                  Background Position
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['center', 'top', 'bottom'] as BackgroundPositionOption[]).map(
                    (pos) => {
                      const active = draft.background.position === pos;
                      return (
                        <button
                          key={pos}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              background: { ...prev.background, position: pos },
                            }))
                          }
                          data-testid={`custom-bg-pos-${pos}`}
                          className={`min-h-[42px] sm:min-h-[34px] px-2 py-1 rounded-lg text-xs sm:text-[11px] font-extrabold capitalize border cursor-pointer ${
                            active
                              ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                              : 'bg-white text-[#5A534C] border-[#DFD8CE] hover:bg-[#F2EFE9]'
                          }`}
                        >
                          {pos}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Brightness Slider (50% - 150%) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#4B453F] mb-1">
                  <label htmlFor="custom-bg-brightness">Brightness</label>
                  <span className="tabular-nums text-[#B86B43]">
                    {draft.background.brightness}%
                  </span>
                </div>
                <input
                  id="custom-bg-brightness"
                  type="range"
                  min={50}
                  max={150}
                  value={draft.background.brightness}
                  data-testid="custom-bg-brightness-slider"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      background: {
                        ...prev.background,
                        brightness: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#C87D55] cursor-pointer"
                />
              </div>

              {/* Overlay Opacity Slider (0% - 90%) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#4B453F] mb-1">
                  <label htmlFor="custom-bg-opacity">Readability Overlay</label>
                  <span className="tabular-nums text-[#B86B43]">
                    {draft.background.overlayOpacity}%
                  </span>
                </div>
                <input
                  id="custom-bg-opacity"
                  type="range"
                  min={0}
                  max={90}
                  value={draft.background.overlayOpacity}
                  data-testid="custom-bg-opacity-slider"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      background: {
                        ...prev.background,
                        overlayOpacity: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#C87D55] cursor-pointer"
                />
              </div>

              {/* Blur Slider (0px - 24px) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#4B453F] mb-1">
                  <label htmlFor="custom-bg-blur">Background Blur</label>
                  <span className="tabular-nums text-[#B86B43]">
                    {draft.background.blurPx}px
                  </span>
                </div>
                <input
                  id="custom-bg-blur"
                  type="range"
                  min={0}
                  max={24}
                  value={draft.background.blurPx}
                  data-testid="custom-bg-blur-slider"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      background: {
                        ...prev.background,
                        blurPx: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#C87D55] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Custom Button Colors Section */}
          <div className="space-y-3 pt-4 border-t border-[#ECE7DF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#B86B43]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A534C]">
                  3. Custom Button Colors
                </span>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#4B453F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.customButtonsEnabled}
                  data-testid="custom-buttons-enable-toggle"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      customButtonsEnabled: e.target.checked,
                    }))
                  }
                  className="rounded accent-[#C87D55] w-4 h-4 cursor-pointer"
                />
                <span>Apply custom button colors across app</span>
              </label>
            </div>

            {/* Curated Button Presets */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-1.5">
              <span className="text-xs sm:text-[10px] font-bold text-[#7A7269] mr-1">
                Quick Presets:
              </span>
              {CURATED_BUTTON_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      customButtonsEnabled: true,
                      buttonColors: {
                        ...prev.buttonColors,
                        primaryBg: preset.primaryBg,
                        secondaryBg: preset.secondaryBg,
                        hoverBg: preset.hoverBg,
                        textColor: preset.textColor,
                      },
                    }))
                  }
                  data-testid={`button-preset-${preset.id}`}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-full text-xs sm:text-[10px] font-extrabold border border-[#DFD8CE] bg-[#FAF7F2] hover:bg-[#EFECE6] cursor-pointer"
                >
                  <span
                    className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full"
                    style={{ backgroundColor: preset.primaryBg }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* 4 Color Pickers: Primary, Secondary, Hover, Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF]">
              {/* Primary Button Color */}
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#E5DEC9]">
                <div className="min-w-0">
                  <label
                    htmlFor="picker-primary-bg"
                    className="block text-xs sm:text-[11px] font-extrabold text-[#2F2B28]"
                  >
                    Primary Button Color
                  </label>
                  <span className="text-[11px] sm:text-[10px] text-[#8A8279] font-mono">
                    {draft.buttonColors.primaryBg}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="picker-primary-bg"
                    type="color"
                    value={normalizeHexColor(draft.buttonColors.primaryBg)}
                    data-testid="custom-btn-primary-color-input"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          primaryBg: normalizeHexColor(e.target.value),
                        },
                      }))
                    }
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-[#DFD8CE] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    aria-label="Primary button hex color"
                    data-testid="custom-btn-primary-hex-input"
                    value={draft.buttonColors.primaryBg}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          primaryBg: isValidHexColor(val)
                            ? normalizeHexColor(val)
                            : val,
                        },
                      }));
                    }}
                    className="w-24 sm:w-20 min-h-[40px] sm:min-h-0 px-2 py-1 text-base sm:text-xs font-mono font-bold border border-[#DFD8CE] rounded-lg bg-[#FAF7F2] text-[#2F2B28]"
                  />
                </div>
              </div>

              {/* Secondary Button Color */}
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#E5DEC9]">
                <div className="min-w-0">
                  <label
                    htmlFor="picker-secondary-bg"
                    className="block text-xs sm:text-[11px] font-extrabold text-[#2F2B28]"
                  >
                    Secondary Button Color
                  </label>
                  <span className="text-[11px] sm:text-[10px] text-[#8A8279] font-mono">
                    {draft.buttonColors.secondaryBg}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="picker-secondary-bg"
                    type="color"
                    value={normalizeHexColor(
                      draft.buttonColors.secondaryBg,
                      '#F2EFE9'
                    )}
                    data-testid="custom-btn-secondary-color-input"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          secondaryBg: normalizeHexColor(
                            e.target.value,
                            '#F2EFE9'
                          ),
                        },
                      }))
                    }
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-[#DFD8CE] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    aria-label="Secondary button hex color"
                    data-testid="custom-btn-secondary-hex-input"
                    value={draft.buttonColors.secondaryBg}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          secondaryBg: isValidHexColor(val)
                            ? normalizeHexColor(val, '#F2EFE9')
                            : val,
                        },
                      }));
                    }}
                    className="w-24 sm:w-20 min-h-[40px] sm:min-h-0 px-2 py-1 text-base sm:text-xs font-mono font-bold border border-[#DFD8CE] rounded-lg bg-[#FAF7F2] text-[#2F2B28]"
                  />
                </div>
              </div>

              {/* Button Hover Color */}
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#E5DEC9]">
                <div className="min-w-0">
                  <label
                    htmlFor="picker-hover-bg"
                    className="block text-xs sm:text-[11px] font-extrabold text-[#2F2B28]"
                  >
                    Button Hover Color
                  </label>
                  <span className="text-[11px] sm:text-[10px] text-[#8A8279] font-mono">
                    {draft.buttonColors.hoverBg}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="picker-hover-bg"
                    type="color"
                    value={normalizeHexColor(
                      draft.buttonColors.hoverBg,
                      '#B0653E'
                    )}
                    data-testid="custom-btn-hover-color-input"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          hoverBg: normalizeHexColor(e.target.value, '#B0653E'),
                        },
                      }))
                    }
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-[#DFD8CE] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    aria-label="Button hover hex color"
                    data-testid="custom-btn-hover-hex-input"
                    value={draft.buttonColors.hoverBg}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          hoverBg: isValidHexColor(val)
                            ? normalizeHexColor(val, '#B0653E')
                            : val,
                        },
                      }));
                    }}
                    className="w-24 sm:w-20 min-h-[40px] sm:min-h-0 px-2 py-1 text-base sm:text-xs font-mono font-bold border border-[#DFD8CE] rounded-lg bg-[#FAF7F2] text-[#2F2B28]"
                  />
                </div>
              </div>

              {/* Button Text Color */}
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#E5DEC9]">
                <div className="min-w-0">
                  <label
                    htmlFor="picker-text-color"
                    className="block text-xs sm:text-[11px] font-extrabold text-[#2F2B28]"
                  >
                    Button Text Color
                  </label>
                  <span className="text-[11px] sm:text-[10px] text-[#8A8279] font-mono">
                    Effective: {contrastCheck.textColor} ({contrastCheck.contrastRatio}:1)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="picker-text-color"
                    type="color"
                    value={normalizeHexColor(
                      draft.buttonColors.textColor,
                      '#FFFFFF'
                    )}
                    data-testid="custom-btn-text-color-input"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          textColor: normalizeHexColor(
                            e.target.value,
                            '#FFFFFF'
                          ),
                        },
                      }))
                    }
                    className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-[#DFD8CE] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    aria-label="Button text hex color"
                    data-testid="custom-btn-text-hex-input"
                    value={draft.buttonColors.textColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        customButtonsEnabled: true,
                        buttonColors: {
                          ...prev.buttonColors,
                          textColor: isValidHexColor(val)
                            ? normalizeHexColor(val, '#FFFFFF')
                            : val,
                        },
                      }));
                    }}
                    className="w-24 sm:w-20 min-h-[40px] sm:min-h-0 px-2 py-1 text-base sm:text-xs font-mono font-bold border border-[#DFD8CE] rounded-lg bg-[#FAF7F2] text-[#2F2B28]"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Contrast Toggle & Contrast Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF]">
              <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[#4B453F] cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={draft.buttonColors.autoContrastText}
                  data-testid="custom-btn-auto-contrast-toggle"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      buttonColors: {
                        ...prev.buttonColors,
                        autoContrastText: e.target.checked,
                      },
                    }))
                  }
                  className="rounded accent-[#C87D55] w-5 h-5 sm:w-4 sm:h-4 cursor-pointer"
                />
                <span>Automatically adjust text contrast for readability</span>
              </label>

              {contrastCheck.wasAutoAdjusted && (
                <span
                  data-testid="auto-contrast-adjusted-badge"
                  className="px-2.5 py-0.5 rounded-full text-xs sm:text-[10px] font-extrabold bg-[#DFF2E6] text-[#266843] border border-[#B8DEC6]"
                >
                  Auto-adjusted text to {contrastCheck.textColor} ({contrastCheck.contrastRatio}:1)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live Interactive Preview & Apply / Reset Controls */}
        <div className="xl:col-span-5 p-4 sm:p-5 bg-[#FAF7F2] flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#B86B43]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5A534C]">
                  Live Interactive Preview
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E5DEC9] text-[#6E665E]">
                {draft.background.imageName
                  ? `BG: ${draft.background.imageName}`
                  : 'Default Warm Stage'}
              </span>
            </div>

            {/* Live Preview Stage Box */}
            <div
              data-testid="custom-theme-live-preview"
              className="relative rounded-2xl border border-[#DFD8CE] overflow-hidden min-h-[300px] p-4 flex flex-col justify-between shadow-inner"
              style={{
                backgroundColor:
                  effectiveDraftScheme === 'dark' ? '#141210' : '#FAF6F0',
              }}
            >
              {/* Background Image Layer in Preview */}
              {draft.background.imageDataUrl && (
                <div
                  data-testid="custom-theme-preview-bg-image"
                  className="absolute inset-0 pointer-events-none transition-all duration-200"
                  style={{
                    backgroundImage: `url("${draft.background.imageDataUrl}")`,
                    backgroundPosition: draft.background.position,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    filter: `brightness(${draft.background.brightness}%) blur(${draft.background.blurPx}px)`,
                    transform:
                      draft.background.blurPx > 0 ? 'scale(1.06)' : 'scale(1)',
                  }}
                />
              )}

              {/* Readability Overlay Layer in Preview */}
              {draft.background.imageDataUrl && (
                <div
                  data-testid="custom-theme-preview-overlay"
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={{
                    backgroundColor:
                      effectiveDraftScheme === 'dark' ? '#12100E' : '#FAF6F0',
                    opacity: draft.background.overlayOpacity / 100,
                  }}
                />
              )}

              {/* Sample Preview Card Content */}
              <div
                className={`relative z-10 rounded-xl p-3.5 border shadow-sm space-y-2.5 ${
                  effectiveDraftScheme === 'dark'
                    ? 'bg-[#1F1C18]/92 border-[#342E29] text-[#F4EFE8]'
                    : 'bg-white/92 border-[#E5DEC9] text-[#2F2B28]'
                } backdrop-blur-xs`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[10px] font-extrabold uppercase tracking-wider opacity-75">
                    Preview Task Card
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-[9px] font-extrabold bg-[#DFF2E6] text-[#266843]">
                    Readable Surface
                  </span>
                </div>
                <p className="text-sm font-extrabold">
                  Finalize Q3 Design System &amp; Custom Theme
                </p>
                <p className="text-xs sm:text-[11px] opacity-80 leading-snug">
                  Cards, navigation bars, and modals automatically maintain crisp contrast over your custom background.
                </p>

                {/* Live Button Preview */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="preview-primary-button"
                    onMouseEnter={() => setPreviewBtnHovered(true)}
                    onMouseLeave={() => setPreviewBtnHovered(false)}
                    onClick={() => setPreviewBtnHovered((prev) => !prev)}
                    className="min-h-[42px] sm:min-h-0 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                    style={{
                      backgroundColor: previewBtnHovered
                        ? normalizeHexColor(
                            draft.buttonColors.hoverBg,
                            '#B0653E'
                          )
                        : normalizeHexColor(
                            draft.buttonColors.primaryBg,
                            '#C87D55'
                          ),
                      color: contrastCheck.textColor,
                    }}
                  >
                    + Primary Action Button
                  </button>

                  <button
                    type="button"
                    data-testid="preview-secondary-button"
                    className="min-h-[42px] sm:min-h-0 px-3.5 py-2 rounded-xl text-xs font-extrabold border border-[#DFD8CE] transition-all cursor-pointer"
                    style={{
                      backgroundColor: normalizeHexColor(
                        draft.buttonColors.secondaryBg,
                        '#F2EFE9'
                      ),
                      color: secondaryContrastCheck.textColor,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Bottom Preview Metadata Pill */}
              <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[10px] font-bold px-3 py-1.5 rounded-xl bg-black/65 text-white backdrop-blur-xs">
                <span>
                  Pos: <strong className="capitalize">{draft.background.position}</strong> · Bright: <strong>{draft.background.brightness}%</strong> · Blur: <strong>{draft.background.blurPx}px</strong>
                </span>
                <span>Contrast: {contrastCheck.contrastRatio}:1</span>
              </div>
            </div>
          </div>

          {/* Action Footer: Reset to Default + Apply & Save */}
          <div className="pt-3 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleResetAll}
              data-testid="custom-theme-reset-btn"
              className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[42px] px-3.5 py-2 rounded-xl border border-[#DFD8CE] bg-white hover:bg-[#EFECE6] text-xs font-extrabold text-[#4B453F] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center gap-2">
              {isModal && onCloseModal && (
                <button
                  type="button"
                  onClick={onCloseModal}
                  data-testid="custom-theme-cancel-btn"
                  className="min-h-[44px] sm:min-h-[42px] px-3.5 py-2 rounded-xl border border-[#DFD8CE] bg-white hover:bg-[#EFECE6] text-xs font-bold text-[#4B453F] cursor-pointer"
                >
                  Close
                </button>
              )}
              <button
                type="button"
                onClick={handleApplyChanges}
                data-testid="custom-theme-apply-btn"
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[42px] px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs cursor-pointer transition-transform active:scale-95"
                style={{
                  backgroundColor: normalizeHexColor(
                    draft.buttonColors.primaryBg,
                    '#C87D55'
                  ),
                  color: contrastCheck.textColor,
                }}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Apply &amp; Save Theme</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Appearance & Personal Theme Customization"
        data-testid="theme-customizer-modal-backdrop"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-[fadeInBackdrop_180ms_ease-out]"
        onClick={(e) => {
          if (e.target === e.currentTarget && onCloseModal) {
            onCloseModal();
          }
        }}
      >
        {studioCard}
      </div>
    );
  }

  return studioCard;
};

