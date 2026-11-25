import React from 'react';
import { Check, Palette } from 'lucide-react';
import { ThemeId, THEMES } from '../utils/todoLogic';
import { BrowserFrame } from '../components/BrowserFrame';
import { ThemeCustomizationStudio } from '../components/ThemeCustomizationStudio';
import { SharedDashboardPageProps } from './types';

export const ColorThemesPage: React.FC<SharedDashboardPageProps> = ({
  activeTheme,
  onSelectTheme,
  personalCustomization,
  onApplyPersonalCustomization,
  onResetPersonalCustomization,
}) => {
  return (
    <section
      id="color-themes"
      aria-label="Appearance and Color Themes"
      className="radial-stage-bg full-screen-hero w-full flex-1 flex flex-col px-2 sm:px-4 lg:px-6 py-2.5 sm:py-4 box-border"
    >
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0 gap-4">
        {/* Clean Page Header */}
        <div className="px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2F2B28] leading-tight">
            Themes &amp; Appearance
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#7A7269] mt-0.5">
            Pick a color style with one tap — your tasks stay right where they are
          </p>
        </div>

        <BrowserFrame className="w-full" defaultFullscreen>
          <div className="p-4 sm:p-6 bg-[#FAF7F2] flex-1 flex flex-col gap-6">
            {/* Simple 4-Card Palette Picker (Zero Duplicate Boards) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-[#C26D43]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[#2F2B28]">
                  Color Palettes
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
                  const t = THEMES[themeKey];
                  const isCurrent = activeTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      type="button"
                      aria-pressed={isCurrent}
                      data-testid={`theme-card-${themeKey}`}
                      onClick={() => onSelectTheme(themeKey)}
                      className={`text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer flex flex-col gap-3 ${
                        isCurrent
                          ? 'border-[#C26D43] ring-2 ring-[#C26D43]/30 shadow-sm'
                          : 'border-[#E6DFD3] hover:border-[#CFC4B4]'
                      }`}
                    >
                      {/* 7-Day Color Strip Preview */}
                      <div className="grid grid-cols-7 gap-1 h-8 rounded-lg overflow-hidden">
                        {t.dayHeaders.map((color, idx) => (
                          <span
                            key={idx}
                            className="h-full w-full block rounded-xs"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-sm font-extrabold text-[#2F2B28]">
                            {t.name}
                          </span>
                          <span className="text-xs font-medium text-[#7A7269]">
                            {isCurrent ? 'Currently active' : 'Tap to apply'}
                          </span>
                        </div>
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? 'text-white'
                              : 'bg-[#F4EFE6] text-transparent'
                          }`}
                          style={
                            isCurrent
                              ? { backgroundColor: t.checkboxBg }
                              : undefined
                          }
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Background & Button Customization Studio */}
            {personalCustomization &&
              onApplyPersonalCustomization &&
              onResetPersonalCustomization && (
                <ThemeCustomizationStudio
                  customization={personalCustomization}
                  activeTheme={activeTheme}
                  onApplyCustomization={onApplyPersonalCustomization}
                  onResetCustomization={onResetPersonalCustomization}
                  onSelectTheme={onSelectTheme}
                />
              )}
          </div>
        </BrowserFrame>
      </div>
    </section>
  );
};
