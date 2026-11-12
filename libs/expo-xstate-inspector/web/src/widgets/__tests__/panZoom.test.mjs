import assert from "node:assert/strict";
import { test } from "node:test";

import { bindPanZoom } from "../../../scripts/widgets/panZoom.js";

test("leaves wheel scrolling on controls to the browser", t => {
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
