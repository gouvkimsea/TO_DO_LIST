export interface FullscreenElementLike {
  requestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

export interface FullscreenDocumentLike {
  fullscreenElement?: Element | null;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  fullscreenEnabled?: boolean;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  exitFullscreen?: () => Promise<void> | void;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
  documentElement?: HTMLElementLike;
  body?: HTMLElementLike;
}

export interface HTMLElementLike {
  style: Record<string, string>;
  setAttribute?: (name: string, value: string) => void;
  removeAttribute?: (name: string) => void;
  getAttribute?: (name: string) => string | null;
}

export interface FullscreenTransitionResult {
  ok: boolean;
  nativeFullscreen: boolean;
  errorMessage: string | null;
}

export interface ScrollLockSnapshot {
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  htmlHeight: string;
  htmlMaxHeight: string;
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyHeight: string;
  scrollX: number;
  scrollY: number;
}

export const FULLSCREEN_CHANGE_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
] as const;

export const SCROLL_LOCK_BLOCKED_KEYS = new Set([
  'PageDown',
  'PageUp',
  'Home',
  'End',
  'ArrowDown',
  'ArrowUp',
  ' ',
]);

/**
 * Returns the currently active fullscreen element across standard and vendor-prefixed properties.
 */
export function getActiveFullscreenElement(
  doc?: FullscreenDocumentLike | null
): Element | null {
  if (!doc) return null;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

/**
 * Checks whether the browser environment exposes a Fullscreen API method on the target element.
 */
export function isNativeFullscreenSupported(
  doc?: FullscreenDocumentLike | null,
  element?: FullscreenElementLike | null
): boolean {
  if (!doc || !element) return false;
  const hasRequestMethod =
    typeof element.requestFullscreen === 'function' ||
    typeof element.webkitRequestFullscreen === 'function' ||
    typeof element.mozRequestFullScreen === 'function' ||
    typeof element.msRequestFullscreen === 'function';
  if (!hasRequestMethod) return false;

  if (typeof doc.fullscreenEnabled === 'boolean') {
    return doc.fullscreenEnabled;
  }
  if (typeof doc.webkitFullscreenEnabled === 'boolean') {
    return doc.webkitFullscreenEnabled;
  }
  if (typeof doc.mozFullScreenEnabled === 'boolean') {
    return doc.mozFullScreenEnabled;
  }
  if (typeof doc.msFullscreenEnabled === 'boolean') {
    return doc.msFullscreenEnabled;
  }
  return true;
}

/**
 * Requests native browser fullscreen using the JavaScript Fullscreen API (`requestFullscreen()`)
 * with vendor-prefixed fallbacks and graceful error handling.
 */
export async function requestBrowserFullscreen(
  element?: FullscreenElementLike | null,
  doc?: FullscreenDocumentLike | null
): Promise<FullscreenTransitionResult> {
  if (!element) {
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: 'Fullscreen target element is unavailable.',
    };
  }

  if (doc && getActiveFullscreenElement(doc)) {
    return {
      ok: true,
      nativeFullscreen: true,
      errorMessage: null,
    };
  }

  const requestFn =
    typeof element.requestFullscreen === 'function'
      ? () => element.requestFullscreen!()
      : typeof element.webkitRequestFullscreen === 'function'
      ? () => element.webkitRequestFullscreen!()
      : typeof element.mozRequestFullScreen === 'function'
      ? () => element.mozRequestFullScreen!()
      : typeof element.msRequestFullscreen === 'function'
      ? () => element.msRequestFullscreen!()
      : null;

  if (!requestFn) {
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: 'Fullscreen API is not supported in this browser.',
    };
  }

  try {
    await Promise.resolve(requestFn());
    return {
      ok: true,
      nativeFullscreen: true,
      errorMessage: null,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : 'Browser blocked fullscreen request.';
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: message,
    };
  }
}

/**
 * Exits native browser fullscreen using `document.exitFullscreen()` with vendor fallbacks
 * and graceful error handling.
 */
export async function exitBrowserFullscreen(
  doc?: FullscreenDocumentLike | null
): Promise<FullscreenTransitionResult> {
  if (!doc) {
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: 'Document is unavailable.',
    };
  }

  if (!getActiveFullscreenElement(doc)) {
    return {
      ok: true,
      nativeFullscreen: false,
      errorMessage: null,
    };
  }

  const exitFn =
    typeof doc.exitFullscreen === 'function'
      ? () => doc.exitFullscreen!()
      : typeof doc.webkitExitFullscreen === 'function'
      ? () => doc.webkitExitFullscreen!()
      : typeof doc.mozCancelFullScreen === 'function'
      ? () => doc.mozCancelFullScreen!()
      : typeof doc.msExitFullscreen === 'function'
      ? () => doc.msExitFullscreen!()
      : null;

  if (!exitFn) {
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: 'exitFullscreen API is not available on this document.',
    };
  }

  try {
    await Promise.resolve(exitFn());
    return {
      ok: true,
      nativeFullscreen: false,
      errorMessage: null,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : 'Failed to exit browser fullscreen cleanly.';
    return {
      ok: false,
      nativeFullscreen: false,
      errorMessage: message,
    };
  }
}

/**
 * Locks page scrolling and fixes the viewport while presentation mode is active,
 * returning a snapshot that restores the original styles and scroll position on exit.
 */
export function lockPresentationScroll(
  doc?: FullscreenDocumentLike | null,
  currentScrollY = 0,
  currentScrollX = 0
): ScrollLockSnapshot | null {
  if (!doc?.documentElement || !doc?.body) return null;

  const html = doc.documentElement;
  const body = doc.body;

  const snapshot: ScrollLockSnapshot = {
    htmlOverflow: html.style.overflow || '',
    htmlOverscrollBehavior: html.style.overscrollBehavior || '',
    htmlHeight: html.style.height || '',
    htmlMaxHeight: html.style.maxHeight || '',
    bodyOverflow: body.style.overflow || '',
    bodyOverscrollBehavior: body.style.overscrollBehavior || '',
    bodyPosition: body.style.position || '',
    bodyTop: body.style.top || '',
    bodyLeft: body.style.left || '',
    bodyRight: body.style.right || '',
    bodyWidth: body.style.width || '',
    bodyHeight: body.style.height || '',
    scrollX: currentScrollX,
    scrollY: currentScrollY,
  };

  html.setAttribute?.('data-presentation-mode', 'true');
  html.style.overflow = 'hidden';
  html.style.overscrollBehavior = 'none';
  html.style.height = '100dvh';
  html.style.maxHeight = '100dvh';

  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';
  body.style.position = 'fixed';
  body.style.top = '0px';
  body.style.left = '0px';
  body.style.right = '0px';
  body.style.width = '100%';
  body.style.height = '100dvh';

  return snapshot;
}

/**
 * Restores normal page scrolling and layout styles from a previously captured snapshot.
 */
export function unlockPresentationScroll(
  doc?: FullscreenDocumentLike | null,
  snapshot?: ScrollLockSnapshot | null
): { scrollX: number; scrollY: number } {
  if (!doc?.documentElement || !doc?.body) {
    return {
      scrollX: snapshot?.scrollX ?? 0,
      scrollY: snapshot?.scrollY ?? 0,
    };
  }

  const html = doc.documentElement;
  const body = doc.body;

  html.removeAttribute?.('data-presentation-mode');
  html.style.overflow = snapshot?.htmlOverflow ?? '';
  html.style.overscrollBehavior = snapshot?.htmlOverscrollBehavior ?? '';
  html.style.height = snapshot?.htmlHeight ?? '';
  html.style.maxHeight = snapshot?.htmlMaxHeight ?? '';

  body.style.overflow = snapshot?.bodyOverflow ?? '';
  body.style.overscrollBehavior = snapshot?.bodyOverscrollBehavior ?? '';
  body.style.position = snapshot?.bodyPosition ?? '';
  body.style.top = snapshot?.bodyTop ?? '';
  body.style.left = snapshot?.bodyLeft ?? '';
  body.style.right = snapshot?.bodyRight ?? '';
  body.style.width = snapshot?.bodyWidth ?? '';
  body.style.height = snapshot?.bodyHeight ?? '';

  return {
    scrollX: snapshot?.scrollX ?? 0,
    scrollY: snapshot?.scrollY ?? 0,
  };
}

/**
 * Determines whether a keydown event would cause accidental window scrolling while in presentation mode.
 */
export function shouldPreventPresentationScrollKey(input: {
  key: string;
  isEditableTarget: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}): boolean {
  if (input.isEditableTarget) return false;
  if (input.ctrlKey || input.metaKey || input.altKey) return false;
  return SCROLL_LOCK_BLOCKED_KEYS.has(input.key);
}
