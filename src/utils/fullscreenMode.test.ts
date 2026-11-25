import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveFullscreenElement,
  isNativeFullscreenSupported,
  requestBrowserFullscreen,
  exitBrowserFullscreen,
  lockPresentationScroll,
  unlockPresentationScroll,
  shouldPreventPresentationScrollKey,
  FullscreenDocumentLike,
  FullscreenElementLike,
  HTMLElementLike,
} from './fullscreenMode';

function createMockElement(
  initialStyles: Record<string, string> = {}
): HTMLElementLike & {
  attributes: Record<string, string>;
} {
  const attributes: Record<string, string> = {};
  return {
    style: { ...initialStyles },
    attributes,
    setAttribute(name: string, value: string) {
      attributes[name] = value;
    },
    removeAttribute(name: string) {
      delete attributes[name];
    },
    getAttribute(name: string) {
      return attributes[name] ?? null;
    },
  };
}

test('getActiveFullscreenElement detects standard and vendor-prefixed fullscreenElement', () => {
  const fakeEl = {} as Element;
  assert.equal(getActiveFullscreenElement(null), null);
  assert.equal(getActiveFullscreenElement({ fullscreenElement: null }), null);
  assert.equal(getActiveFullscreenElement({ fullscreenElement: fakeEl }), fakeEl);
  assert.equal(
    getActiveFullscreenElement({ webkitFullscreenElement: fakeEl }),
    fakeEl
  );
  assert.equal(
    getActiveFullscreenElement({ mozFullScreenElement: fakeEl }),
    fakeEl
  );
});

test('isNativeFullscreenSupported checks method availability and fullscreenEnabled flag', () => {
  const elWithStandard: FullscreenElementLike = {
    requestFullscreen: async () => {},
  };
  const elWithoutApi: FullscreenElementLike = {};

  assert.equal(
    isNativeFullscreenSupported({ fullscreenEnabled: true }, elWithStandard),
    true
  );
  assert.equal(
    isNativeFullscreenSupported({ fullscreenEnabled: false }, elWithStandard),
    false
  );
  assert.equal(
    isNativeFullscreenSupported({ fullscreenEnabled: true }, elWithoutApi),
    false
  );
});

test('requestBrowserFullscreen invokes native requestFullscreen and succeeds', async () => {
  let called = 0;
  const el: FullscreenElementLike = {
    requestFullscreen: async () => {
      called += 1;
    },
  };
  const doc: FullscreenDocumentLike = { fullscreenElement: null };

  const res = await requestBrowserFullscreen(el, doc);
  assert.equal(called, 1);
  assert.deepEqual(res, {
    ok: true,
    nativeFullscreen: true,
    errorMessage: null,
  });
});

test('requestBrowserFullscreen falls back to webkitRequestFullscreen when standard is absent', async () => {
  let webkitCalled = 0;
  const el: FullscreenElementLike = {
    webkitRequestFullscreen: () => {
      webkitCalled += 1;
    },
  };

  const res = await requestBrowserFullscreen(el, { fullscreenElement: null });
  assert.equal(webkitCalled, 1);
  assert.equal(res.ok, true);
  assert.equal(res.nativeFullscreen, true);
});

test('requestBrowserFullscreen handles browser permission rejection gracefully without throwing', async () => {
  const el: FullscreenElementLike = {
    requestFullscreen: async () => {
      throw new Error('Permissions check failed');
    },
  };

  const res = await requestBrowserFullscreen(el, { fullscreenElement: null });
  assert.equal(res.ok, false);
  assert.equal(res.nativeFullscreen, false);
  assert.equal(res.errorMessage, 'Permissions check failed');
});

test('exitBrowserFullscreen invokes native exitFullscreen and handles errors gracefully', async () => {
  let exitCalled = 0;
  const fakeEl = {} as Element;
  const doc: FullscreenDocumentLike = {
    fullscreenElement: fakeEl,
    exitFullscreen: async () => {
      exitCalled += 1;
    },
  };

  const res = await exitBrowserFullscreen(doc);
  assert.equal(exitCalled, 1);
  assert.equal(res.ok, true);
  assert.equal(res.nativeFullscreen, false);

  const rejectingDoc: FullscreenDocumentLike = {
    fullscreenElement: fakeEl,
    exitFullscreen: async () => {
      throw new Error('Document not active');
    },
  };
  const errRes = await exitBrowserFullscreen(rejectingDoc);
  assert.equal(errRes.ok, false);
  assert.equal(errRes.errorMessage, 'Document not active');
});

test('lockPresentationScroll and unlockPresentationScroll lock and restore styles accurately', () => {
  const html = createMockElement({ overflow: 'auto', height: 'auto' });
  const body = createMockElement({ overflow: 'visible', position: 'static' });
  const doc: FullscreenDocumentLike = {
    documentElement: html,
    body,
  };

  const snapshot = lockPresentationScroll(doc, 240, 12);
  assert.ok(snapshot);
  assert.equal(html.getAttribute?.('data-presentation-mode'), 'true');
  assert.equal(html.style.overflow, 'hidden');
  assert.equal(html.style.overscrollBehavior, 'none');
  assert.equal(body.style.overflow, 'hidden');
  assert.equal(body.style.position, 'fixed');
  assert.equal(body.style.height, '100dvh');

  const restoredScroll = unlockPresentationScroll(doc, snapshot);
  assert.deepEqual(restoredScroll, { scrollX: 12, scrollY: 240 });
  assert.equal(html.getAttribute?.('data-presentation-mode'), null);
  assert.equal(html.style.overflow, 'auto');
  assert.equal(html.style.height, 'auto');
  assert.equal(body.style.overflow, 'visible');
  assert.equal(body.style.position, 'static');
});

test('shouldPreventPresentationScrollKey blocks page-scroll keys only outside editable fields', () => {
  assert.equal(
    shouldPreventPresentationScrollKey({
      key: 'PageDown',
      isEditableTarget: false,
    }),
    true
  );
  assert.equal(
    shouldPreventPresentationScrollKey({
      key: ' ',
      isEditableTarget: false,
    }),
    true
  );
  assert.equal(
    shouldPreventPresentationScrollKey({
      key: ' ',
      isEditableTarget: true,
    }),
    false
  );
  assert.equal(
    shouldPreventPresentationScrollKey({
      key: 'ArrowDown',
      isEditableTarget: true,
    }),
    false
  );
});
