import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { createDiagramView } from "../../../scripts/views/diagramView.js";

const setup = (t, dark) => {
  const colorScheme = Object.assign(new EventTarget(), { matches: dark });
  globalThis.window = { matchMedia: () => colorScheme };
  t.after(() => {
    delete globalThis.window;
  });
  const container = { querySelector: () => null, querySelectorAll: () => [] };
  const renderDiagram = mock.fn(async (_code, isDark) =>
    isDark ? "<svg>dark</svg>" : "<svg>light</svg>"
  );
  const viewport = { update: mock.fn() };
  const details = { render: mock.fn() };
  const view = createDiagramView(container, details, renderDiagram, viewport);
  const actor = {
    definition: { states: { idle: {}, running: {} } },
    snapshot: { value: "idle" },
    visited: new Set(),
    taken: new Set()
  };
  return {
    actor,
    colorScheme,
    container,
    details,
    renderDiagram,
    view,
    viewport
  };
};

for (const dark of [false, true]) {
  test(`uses the initial ${dark ? "dark" : "light"} preference and caches unchanged diagrams`, async t => {
    const { actor, container, renderDiagram, view } = setup(t, dark);
    await view.render(actor);
    await view.render(actor);

    assert.equal(container.innerHTML, `<svg>${dark ? "dark" : "light"}</svg>`);
    assert.equal(renderDiagram.mock.callCount(), 1);
    assert.equal(renderDiagram.mock.calls[0].arguments[1], dark);
  });
}

test("redraws the latest actor on theme changes without resetting the viewport", async t => {
  const { actor, colorScheme, container, renderDiagram, view, viewport } =
    setup(t, false);
  await view.render(actor);
  const latest = { ...actor, snapshot: { value: "running" } };
  await view.render(latest);

  for (const dark of [true, false]) {
    colorScheme.matches = dark;
    colorScheme.dispatchEvent(new Event("change"));
    await Promise.resolve();

    const call = renderDiagram.mock.calls.at(-1);
    assert.equal(call.arguments[1], dark);
    assert.match(call.arguments[0], /class s_running active/);
    assert.equal(container.innerHTML, `<svg>${dark ? "dark" : "light"}</svg>`);
    assert.deepEqual(viewport.update.mock.calls.at(-1).arguments, [
      { isNew: false }
    ]);
  }
  assert.equal(renderDiagram.mock.callCount(), 4);
});

test("preserves messages when the system theme changes", async t => {
  const { actor, colorScheme, container, renderDiagram, view } = setup(
    t,
    false
  );
  await view.render(actor);
  view.showMessage("Disconnected.");

  colorScheme.matches = true;
  colorScheme.dispatchEvent(new Event("change"));
  await Promise.resolve();

  assert.equal(container.textContent, "Disconnected.");
  assert.equal(renderDiagram.mock.callCount(), 1);
});

for (const outcome of ["resolve", "reject"]) {
  test(`ignores an in-flight render that ${outcome}s after a message`, async t => {
    const { actor, container, renderDiagram, view } = setup(t, false);
    let settle;
    const pending = new Promise((resolve, reject) => {
      settle = outcome === "resolve" ? resolve : reject;
    });
    renderDiagram.mock.mockImplementationOnce(() => pending);

    const rendering = view.render(actor);
    view.showMessage("Disconnected.");
    settle(outcome === "resolve" ? "<svg>stale</svg>" : new Error("stale"));
    await rendering;

    assert.equal(container.textContent, "Disconnected.");
    assert.equal(container.innerHTML, undefined);
  });
}

test("ignores an older render failure after a newer diagram", async t => {
  const { actor, container, renderDiagram, view } = setup(t, false);
  let reject;
  const pending = new Promise((_, fail) => {
    reject = fail;
  });
  renderDiagram.mock.mockImplementationOnce(() => pending);

  const rendering = view.render(actor);
  await view.render({ ...actor, snapshot: { value: "running" } });
  reject(new Error("stale"));
  await rendering;

  assert.equal(container.innerHTML, "<svg>light</svg>");
  assert.equal(container.textContent, undefined);
});

test("describes the clicked state until another machine is shown", async t => {
  const { actor, details, view } = setup(t, false);
  await view.render(actor);
  const stateElement = {
    id: "diagram-1-state-s_running-3",
    getAttribute: () => null
  };

  view.selectAt({ closest: () => stateElement });
  assert.deepEqual(details.render.mock.calls.at(-1).arguments, [
    { node: {}, path: ["running"] }
  ]);

  await view.render({ ...actor, snapshot: { value: "running" } });
  assert.deepEqual(details.render.mock.calls.at(-1).arguments[0].path, [
    "running"
  ]);

  await view.render({ ...actor, definition: { states: { running: {} } } });
  assert.deepEqual(details.render.mock.calls.at(-1).arguments, [undefined]);

  view.selectAt({ closest: () => null });
  assert.deepEqual(details.render.mock.calls.at(-1).arguments, [undefined]);
});
