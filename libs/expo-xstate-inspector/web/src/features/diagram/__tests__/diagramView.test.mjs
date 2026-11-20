import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { createDiagramView } from "../diagramView.ts";

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
  void test(`uses the initial ${dark ? "dark" : "light"} preference and caches unchanged diagrams`, async t => {
    const { actor, container, renderDiagram, view } = setup(t, dark);
    await view.render(actor);
    await view.render(actor);

    assert.equal(container.innerHTML, `<svg>${dark ? "dark" : "light"}</svg>`);
    assert.equal(renderDiagram.mock.callCount(), 1);
    assert.equal(renderDiagram.mock.calls[0].arguments[1], dark);
  });
}

void test("redraws the latest actor on theme changes without resetting the viewport", async t => {
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

void test("preserves messages when the system theme changes", async t => {
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
  void test(`ignores an in-flight render that ${outcome}s after a message`, async t => {
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

void test("discards pending diagrams and theme updates after unmount", async t => {
  const { actor, colorScheme, container, renderDiagram, view } = setup(
    t,
    false
  );
  let resolve;
  renderDiagram.mock.mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done;
      })
  );
  const rendering = view.render(actor);
  view.destroy();
  resolve("<svg>unmounted</svg>");
  await rendering;
  colorScheme.dispatchEvent(new Event("change"));
  await Promise.resolve();

  assert.equal(container.innerHTML, undefined);
  assert.equal(renderDiagram.mock.callCount(), 1);
});

void test("ignores an older render failure after a newer diagram", async t => {
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

void test("describes the clicked state until another machine is shown", async t => {
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

void test("selects and highlights compound state diagram clusters", async t => {
  const { actor, container, details, view } = setup(t, false);
  actor.definition.states.running = {
    initial: "nested",
    states: { nested: {} }
  };
  const cluster = {
    id: "diagram-1-state-s_running-3",
    getAttribute: name => (name === "data-id" ? "s_running" : null),
    classList: { toggle: mock.fn() },
    setAttribute: mock.fn()
  };
  const matchesCluster = selector =>
    selector.split(",").some(part => part.trim() === "g.statediagram-cluster");
  container.querySelectorAll = selector =>
    matchesCluster(selector) ? [cluster] : [];
  await view.render(actor);

  view.selectAt({
    closest: selector => (matchesCluster(selector) ? cluster : null)
  });
  assert.deepEqual(details.render.mock.calls.at(-1).arguments, [
    { node: actor.definition.states.running, path: ["running"] }
  ]);
  assert.deepEqual(cluster.classList.toggle.mock.calls.at(-1).arguments, [
    "selected",
    true
  ]);
  assert.ok(
    cluster.setAttribute.mock.calls.some(
      ({ arguments: args }) =>
        args[0] === "aria-label" && args[1] === "Show details for state running"
    )
  );
  assert.ok(
    cluster.setAttribute.mock.calls.some(
      ({ arguments: args }) => args[0] === "tabindex" && args[1] === "0"
    )
  );

  view.selectAt(null);
  assert.deepEqual(cluster.classList.toggle.mock.calls.at(-1).arguments, [
    "selected",
    false
  ]);
});

void test("clears stale details when switching machines with identical diagrams", async t => {
  const { actor, details, renderDiagram, view } = setup(t, false);
  actor.definition = { states: { idle: { description: "First" } } };
  await view.render(actor);
  const stateElement = {
    id: "diagram-1-state-s_idle-0",
    getAttribute: () => null
  };
  view.selectAt({ closest: () => stateElement });
  assert.equal(
    details.render.mock.calls.at(-1).arguments[0].node.description,
    "First"
  );

  const next = {
    ...actor,
    definition: { states: { idle: { description: "Second" } } }
  };
  await view.render(next);
  assert.equal(renderDiagram.mock.callCount(), 2);
  assert.deepEqual(details.render.mock.calls.at(-1).arguments, [undefined]);

  view.selectAt({ closest: () => stateElement });
  assert.equal(
    details.render.mock.calls.at(-1).arguments[0].node.description,
    "Second"
  );
});

void test("does not render a duplicate diagram while the same definition is pending", async t => {
  const { actor, renderDiagram, view } = setup(t, false);
  let resolve;
  renderDiagram.mock.mockImplementationOnce(
    () =>
      new Promise(done => {
        resolve = done;
      })
  );
  const rendering = view.render(actor);
  await view.render({ ...actor });
  assert.equal(renderDiagram.mock.callCount(), 1);
  resolve("<svg>light</svg>");
  await rendering;
});

void test("keeps keyboard focus on a state when its machine is redrawn", async t => {
  const { actor, container, view } = setup(t, false);
  const stateElement = {
    id: "diagram-1-state-s_idle-0",
    getAttribute: () => null,
    setAttribute: mock.fn(),
    classList: { toggle: mock.fn() },
    focus: mock.fn()
  };
  container.ownerDocument = { activeElement: null };
  container.contains = element => element === stateElement;
  container.querySelectorAll = selector =>
    selector.includes("g.node") ? [stateElement] : [];
  await view.render(actor);
  container.ownerDocument.activeElement = stateElement;

  await view.render({ ...actor, snapshot: { value: "running" } });
  assert.deepEqual(stateElement.focus.mock.calls.at(-1).arguments, [
    { preventScroll: true }
  ]);
});
