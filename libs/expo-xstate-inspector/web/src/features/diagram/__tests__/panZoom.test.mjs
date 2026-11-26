import assert from "node:assert/strict";
import { test } from "node:test";

import { bindPanZoom } from "../panZoom.ts";

void test("releases viewport listeners and the resize observer on unmount", t => {
  let disconnected = false;
  let signal;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {
      disconnected = true;
    }
  };
  t.after(() => {
    delete globalThis.ResizeObserver;
  });
  const viewport = {
    addEventListener: (_name, _listener, options) => {
      signal = options.signal;
    }
  };
  const zoom = bindPanZoom(
    viewport,
    { style: {} },
    () => [],
    () => {}
  );

  zoom.destroy();

  assert.equal(signal.aborted, true);
  assert.equal(disconnected, true);
  assert.equal(viewport.onpointerdown, null);
  assert.equal(viewport.onpointermove, null);
  assert.equal(viewport.onpointerup, null);
});

void test("leaves wheel scrolling on controls to the browser", t => {
  globalThis.Element = class {};
  globalThis.ResizeObserver = class {
    observe() {}
  };
  t.after(() => {
    delete globalThis.Element;
    delete globalThis.ResizeObserver;
  });
  let wheel;
  const viewport = {
    addEventListener: (_name, listener) => {
      wheel = listener;
    }
  };
  const canvas = { style: {} };
  bindPanZoom(
    viewport,
    canvas,
    () => [],
    () => {}
  );

  const control = new Element();
  control.closest = () => control;
  let prevented = false;
  wheel({
    target: control,
    deltaY: 10,
    preventDefault: () => {
      prevented = true;
    }
  });

  assert.equal(prevented, false);
  assert.equal(canvas.style.transform, undefined);
});
