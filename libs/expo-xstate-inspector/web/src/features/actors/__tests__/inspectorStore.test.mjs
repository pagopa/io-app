import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_EVENTS_PER_ACTOR } from "../limits.ts";
import { createInspectorStore } from "../inspectorStore.ts";

const machine = sessionId => ({
  sessionId,
  name: sessionId,
  definition: { states: { idle: {} } },
  snapshot: { status: "active", value: "idle", context: {} }
});

void test("follows new machines until the user pins a selection", () => {
  const store = createInspectorStore();
  store.handleMessage("actor", machine("first"));
  store.handleMessage("actor", machine("second"));
  assert.equal(store.getSnapshot().selectedId, "second");

  store.select("first");
  store.handleMessage("actor", machine("third"));
  assert.equal(store.getSnapshot().selectedId, "first");
  assert.equal(store.getSnapshot().machines.length, 3);
});

void test("publishes snapshots, events and child actor updates reactively", () => {
  const store = createInspectorStore();
  const states = [store.getSnapshot()];
  const unsubscribe = store.subscribe(() => states.push(store.getSnapshot()));
  store.handleMessage("actor", machine("parent"));
  store.handleMessage("actor", {
    sessionId: "child",
    parentId: "parent",
    startedAt: 1
  });
  store.handleMessage("event", {
    sessionId: "parent",
    event: { type: "NEXT", payload: "value" },
    timestamp: 2
  });
  store.handleMessage("snapshot", {
    sessionId: "child",
    snapshot: { status: "done", output: "result" },
    timestamp: 3
  });
  store.handleMessage("snapshot", {
    sessionId: "parent",
    snapshot: { status: "active", value: "idle", context: { count: 1 } },
    timestamp: 4
  });

  assert.equal(states.length, 6);
  const state = store.getSnapshot();
  assert.equal(state.selectedId, "parent");
  assert.equal(state.selected.events[0].event.type, "NEXT");
  assert.deepEqual(state.selected.snapshot.context, { count: 1 });
  assert.equal(state.children[0][1].snapshot.output, "result");
  assert.equal(state.children[0][1].endedAt, 3);
  unsubscribe();
});

void test("ignores unknown messages and publishes disconnection", () => {
  const store = createInspectorStore();
  const initial = store.getSnapshot();
  store.handleMessage("unknown", {});
  assert.equal(store.getSnapshot(), initial);
  store.handleDisconnect();
  assert.equal(store.getSnapshot().disconnected, true);
});

void test("keeps stable event keys when timestamps collide and history rolls over", () => {
  const store = createInspectorStore();
  store.handleMessage("actor", machine("parent"));
  const send = () =>
    store.handleMessage("event", {
      sessionId: "parent",
      event: { type: "NEXT" },
      timestamp: 1
    });
  for (let index = 0; index < MAX_EVENTS_PER_ACTOR; index++) {
    send();
  }
  const retained = store.getSnapshot().selected.events[0];
  send();
  const { events } = store.getSnapshot().selected;

  assert.equal(events.length, MAX_EVENTS_PER_ACTOR);
  assert.equal(events[1], retained);
  assert.equal(new Set(events.map(entry => entry.id)).size, events.length);
  assert.notEqual(events[0].id, retained.id);
});

void test("stops notifying subscribers after unsubscription", () => {
  const store = createInspectorStore();
  let notifications = 0;
  const unsubscribe = store.subscribe(() => {
    notifications++;
  });
  store.handleMessage("actor", machine("first"));
  unsubscribe();
  store.handleMessage("actor", machine("second"));

  assert.equal(notifications, 1);
  assert.equal(store.getSnapshot().selectedId, "second");
});
