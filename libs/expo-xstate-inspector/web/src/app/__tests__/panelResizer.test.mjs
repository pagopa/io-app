import assert from "node:assert/strict";
import { test } from "node:test";

import { bindPanelResizer } from "../panelResizer.ts";

const createLayout = t => {
  const desired = { left: 248, right: 400 };
  let viewportWidth = 1200;
  const widths = () => {
    const left = Math.min(desired.left, viewportWidth - 448);
    const right = Math.min(desired.right, viewportWidth - left - 248);
    return { left, right };
  };
  const observers = [];
  globalThis.ResizeObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }

    observe() {}

    disconnect() {
      this.disconnected = true;
    }
  };
  t.after(() => {
    delete globalThis.ResizeObserver;
  });

  const sidebar = { getBoundingClientRect: () => ({ width: widths().left }) };
  const panel = { getBoundingClientRect: () => ({ width: widths().right }) };
  const diagram = {
    getBoundingClientRect: () => ({
      width: viewportWidth - widths().left - widths().right - 8
    })
  };
  const makeHandle = (previousElementSibling, nextElementSibling) => {
    let captured;
    const attributes = new Map();
    const classes = new Set();
    return {
      previousElementSibling,
      nextElementSibling,
      attributes,
      classes,
      classList: {
        add: value => classes.add(value),
        remove: value => classes.delete(value)
      },
      ownerDocument: {
        getElementById: id =>
          ({ diagram, "machine-list": sidebar, panel })[id] ?? null,
        body: {
          style: {
            setProperty: (name, value) => {
              desired[name === "--sidebar-width" ? "left" : "right"] =
                Number.parseFloat(value);
            }
          }
        }
      },
      setAttribute: (name, value) => attributes.set(name, value),
      setPointerCapture: pointerId => {
        captured = pointerId;
      },
      hasPointerCapture: pointerId => captured === pointerId
    };
  };

  return {
    widths,
    observers,
    setViewportWidth: value => {
      viewportWidth = value;
    },
    left: makeHandle(sidebar, diagram),
    right: makeHandle({ getBoundingClientRect: () => ({ width: 0 }) }, panel)
  };
};

const drag = (handle, start, end) => {
  handle.onpointerdown({
    button: 0,
    clientX: start,
    pointerId: 1,
    preventDefault: () => {}
  });
  handle.onpointermove({ clientX: end, pointerId: 1 });
};

void test("resizes each sidebar without shrinking the diagram below its minimum", t => {
  const { left, right, widths } = createLayout(t);
  bindPanelResizer(left, "left");
  bindPanelResizer(right, "right");

  drag(left, 250, 450);
  assert.deepEqual(widths(), { left: 448, right: 400 });
  left.onpointermove({ clientX: 1200, pointerId: 1 });
  assert.deepEqual(widths(), { left: 552, right: 400 });
  left.onpointermove({ clientX: 0, pointerId: 1 });
  assert.deepEqual(widths(), { left: 200, right: 400 });
  left.onlostpointercapture();
  assert.equal(left.classes.has("dragging"), false);

  drag(right, 798, 698);
  assert.deepEqual(widths(), { left: 200, right: 500 });
  right.onpointermove({ clientX: 0, pointerId: 1 });
  assert.deepEqual(widths(), { left: 200, right: 752 });
});

void test("supports keyboard resizing and updates separator values", t => {
  const { left, right, widths, observers } = createLayout(t);
  const unbindLeft = bindPanelResizer(left, "left");
  const unbindRight = bindPanelResizer(right, "right");
  let prevented = false;
  const key = name => ({
    key: name,
    preventDefault: () => {
      prevented = true;
    }
  });

  left.onkeydown(key("ArrowRight"));
  right.onkeydown(key("ArrowLeft"));
  assert.deepEqual(widths(), { left: 258, right: 410 });
  assert.equal(prevented, true);
  observers.forEach(observer => observer.callback());
  assert.equal(left.attributes.get("aria-valuenow"), "258");
  assert.equal(right.attributes.get("aria-valuenow"), "410");
  assert.equal(right.attributes.get("aria-valuetext"), "410 pixels");
  assert.equal(right.attributes.get("aria-valuemax"), "694");

  unbindLeft();
  unbindRight();
  assert.equal(left.onkeydown, null);
  assert.equal(right.onpointermove, null);
  assert.equal(
    observers.every(observer => observer.disconnected),
    true
  );
});

void test("keeps the other sidebar still after the viewport narrows", t => {
  const { left, right, widths, setViewportWidth } = createLayout(t);
  bindPanelResizer(left, "left");
  bindPanelResizer(right, "right");

  drag(left, 250, 410);
  drag(right, 798, 698);
  setViewportWidth(801);
  assert.deepEqual(widths(), { left: 353, right: 200 });

  left.onkeydown({ key: "ArrowLeft", preventDefault: () => {} });
  assert.deepEqual(widths(), { left: 343, right: 200 });
});
