import React from 'react';

interface BrowserFrameProps {
  urlText?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  chromeRightSlot?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  bottomRightBadge?: React.ReactNode;
  allowFullscreen?: boolean;
  defaultFullscreen?: boolean;
}

/**
 * Clean, calm workspace surface container.
 * Replaces fake browser chrome and traffic lights with generous breathing room
 * and an optional subtle top bar only when page controls are provided.
 */
export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  className = '',
  compact = false,
  chromeRightSlot,
  topRightBadge,
  bottomRightBadge,
}) => {
  const hasHeaderControls = Boolean(chromeRightSlot || topRightBadge);

  return (
    <div
      data-testid={compact ? 'mac-browser-frame-compact' : 'mac-browser-frame'}
      data-fullscreen="true"
      className={`relative w-full mx-auto flex-1 flex flex-col ${
        compact ? 'max-w-5xl' : 'max-w-7xl'
      } ${className}`}
    >
      <div className="bg-[#FAF7F2] sm:rounded-2xl sm:border sm:border-[#E6DFD3] flex flex-col flex-1 w-full overflow-hidden">
        {hasHeaderControls && (
          <div
            data-browser-chrome-bar="true"
            className="bg-[#F6F1EA] border-b border-[#EAE3D8] flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2"
          >
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {chromeRightSlot}
            </div>
            {topRightBadge && (
              <div className="shrink-0">{topRightBadge}</div>
            )}
          </div>
        )}

        <div
          data-browser-content-area="true"
          className="bg-[#FAF7F2] relative flex flex-col flex-1"
        >
          {children}
        </div>
      </div>

      {bottomRightBadge && (
        <div
          data-presentation-hide="true"
          className="mt-2 flex justify-end px-2 sm:px-0"
        >
          {bottomRightBadge}
        </div>
      )}
    </div>
  );
};
